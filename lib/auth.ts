import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { verifyPassword } from '@/lib/auth-utils';
import { verifyOTP } from '@/lib/otp';

function fromDBUser(user: any) {
  if (!user) return null;
  const { _id, ...rest } = user;
  return {
    ...rest,
    id: _id.toString(),
  };
}

// Custom MongoDB Adapter to ensure seamless Account Linking across all providers
const customMongoAdapter: any = {
  async createUser(user: any) {
    const client = await clientPromise;
    const db = client.db();
    const doc = {
      name: user.name,
      email: user.email ? user.email.toLowerCase() : '',
      image: user.image || null,
      emailVerified: user.emailVerified || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const res = await db.collection('users').insertOne(doc);
    return { ...doc, id: res.insertedId.toString() };
  },
  async getUser(id: string) {
    if (!id) return null;
    const client = await clientPromise;
    const db = client.db();
    let query: any = { _id: id };
    if (ObjectId.isValid(id)) query = { _id: new ObjectId(id) };
    const user = await db.collection('users').findOne(query);
    return fromDBUser(user);
  },
  async getUserByEmail(email: string) {
    if (!email) return null;
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    return fromDBUser(user);
  },
  async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
    const client = await clientPromise;
    const db = client.db();
    const account = await db.collection('accounts').findOne({ provider, providerAccountId });
    if (!account) return null;

    let userQuery: any = { _id: account.userId };
    if (typeof account.userId === 'string' && ObjectId.isValid(account.userId)) {
      userQuery = { $or: [{ _id: new ObjectId(account.userId) }, { _id: account.userId }] };
    }
    const user = await db.collection('users').findOne(userQuery);
    return fromDBUser(user);
  },
  async updateUser(user: any) {
    const client = await clientPromise;
    const db = client.db();
    let query: any = { _id: user.id };
    if (ObjectId.isValid(user.id)) query = { _id: new ObjectId(user.id) };
    const { id, _id, ...updateData } = user;
    await db.collection('users').updateOne(query, { $set: { ...updateData, updatedAt: new Date() } });
    const updated = await db.collection('users').findOne(query);
    return fromDBUser(updated);
  },
  async deleteUser(userId: string) {
    const client = await clientPromise;
    const db = client.db();
    let query: any = { _id: userId };
    if (ObjectId.isValid(userId)) query = { _id: new ObjectId(userId) };
    await db.collection('users').deleteOne(query);
    await db.collection('accounts').deleteMany({
      userId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId,
    });
  },
  async linkAccount(account: any) {
    const client = await clientPromise;
    const db = client.db();
    const userIdObj = typeof account.userId === 'string' && ObjectId.isValid(account.userId)
      ? new ObjectId(account.userId)
      : account.userId;

    const doc = {
      ...account,
      userId: userIdObj,
    };
    await db.collection('accounts').updateOne(
      { provider: account.provider, providerAccountId: account.providerAccountId },
      { $set: doc },
      { upsert: true }
    );
    return account;
  },
  async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
    const client = await clientPromise;
    const db = client.db();
    await db.collection('accounts').deleteOne({ provider, providerAccountId });
  },
};

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection('users').findOne({ email: credentials.email.toLowerCase() });
        if (!user) {
          throw new Error('No user found with this email. Please register first.');
        }
        if (!user.password) {
          throw new Error('This account was registered with Google. Please use Continue with Google.');
        }
        const isValid = verifyPassword(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Incorrect password');
        }

        // Verify OTP during credentials login
        if (!credentials.otp) {
          throw new Error('OTP is required for verification');
        }
        const isOtpValid = await verifyOTP(credentials.email, credentials.otp);
        if (!isOtpValid) {
          throw new Error('Invalid or expired OTP code');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email.split('@')[0],
          image: user.image,
          mobile: user.mobile,
        };
      },
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || 'greesal_auth_super_secret_session_key_2026',
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'credentials') {
        return true;
      }

      // Seamless Google Sign-In & Sign-Up (Auto-registers and links existing accounts)
      if (account?.provider === 'google') {
        if (!user.email) {
          return '/?error=EmailMissing';
        }

        try {
          const client = await clientPromise;
          const db = client.db();
          
          let customMobile = '';
          try {
            const { cookies } = require('next/headers');
            const cookieStore = cookies();
            customMobile = cookieStore.get('greesal_custom_mobile')?.value || '';
          } catch (err) {
            // ignore
          }

          const existingUser = await db.collection('users').findOne({ 
            email: user.email.toLowerCase() 
          });

          if (!existingUser) {
            // First time Google user -> Auto create user profile
            const insertResult = await db.collection('users').insertOne({
              name: user.name || (profile as any)?.name || user.email.split('@')[0],
              email: user.email.toLowerCase(),
              image: user.image || (profile as any)?.picture || null,
              mobile: customMobile ? decodeURIComponent(customMobile) : '',
              authProvider: 'google',
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            // Ensure Google account is linked
            await db.collection('accounts').updateOne(
              { provider: account.provider, providerAccountId: account.providerAccountId },
              {
                $set: {
                  userId: insertResult.insertedId,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              },
              { upsert: true }
            );
          } else {
            // Existing user -> Sync mobile, name, or profile image
            const updateDoc: any = { updatedAt: new Date() };
            if (customMobile && !existingUser.mobile) {
              updateDoc.mobile = decodeURIComponent(customMobile);
            }
            if (user.image && !existingUser.image) {
              updateDoc.image = user.image;
            }
            if (user.name && !existingUser.name) {
              updateDoc.name = user.name;
            }
            await db.collection('users').updateOne(
              { email: user.email.toLowerCase() },
              { $set: updateDoc }
            );

            // Auto-link Google OAuth account to existing user to prevent OAuthAccountNotLinked error
            await db.collection('accounts').updateOne(
              { provider: account.provider, providerAccountId: account.providerAccountId },
              {
                $set: {
                  userId: existingUser._id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              },
              { upsert: true }
            );
          }
        } catch (dbErr) {
          console.error('MongoDB sync in Google signIn callback:', dbErr);
        }

        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        (token as any).mobile = (user as any).mobile;
      }
      if (token?.email && !(token as any).mobile) {
        try {
          const client = await clientPromise;
          const db = client.db();
          const dbUser = await db.collection('users').findOne({ email: token.email.toLowerCase() });
          if (dbUser) {
            token.sub = dbUser._id.toString();
            (token as any).mobile = dbUser.mobile || '';
          }
        } catch (err) {
          // ignore
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        (session.user as any).id = token.sub;
      }
      if (token && (token as any).mobile) {
        (session.user as any).mobile = (token as any).mobile;
      }
      if (session?.user?.email && !(session.user as any).mobile) {
        try {
          const client = await clientPromise;
          const db = client.db();
          const existingUser = await db.collection('users').findOne({ email: session.user.email.toLowerCase() });
          if (existingUser && existingUser.mobile) {
            (session.user as any).mobile = existingUser.mobile;
          }
        } catch (err) {
          console.error('Failed to fetch mobile number for session:', err);
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/`;
    },
  },
  events: {
    async createUser({ user }) {
      let customMobile = '';
      try {
        const { cookies } = require('next/headers');
        const cookieStore = cookies();
        customMobile = cookieStore.get('greesal_custom_mobile')?.value || '';
      } catch (err) {
        console.warn('Could not read custom mobile cookie in createUser:', err);
      }

      if (user.email && customMobile) {
        try {
          const client = await clientPromise;
          const db = client.db();
          await db.collection('users').updateOne(
            { email: user.email },
            { $set: { mobile: decodeURIComponent(customMobile) } }
          );
        } catch (dbErr) {
          console.error('Failed to save mobile number on user creation:', dbErr);
        }
      }
    },
  },
  debug: false,
};
