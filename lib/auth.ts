import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { BACKEND_URL } from '@/lib/fastapi';

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

        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login-verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email.toLowerCase().trim(),
              password: credentials.password,
              otp: credentials.otp,
            }),
            cache: 'no-store',
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const detailMsg = typeof err.detail === 'string' ? err.detail : (err.error || 'Authentication failed');
            throw new Error(detailMsg);
          }

          const data = await res.json();
          if (data && data.user) {
            return {
              id: data.user.id || data.user._id || 'member-1',
              email: data.user.email || credentials.email,
              name: data.user.name || credentials.email.split('@')[0],
              image: data.user.image || null,
              mobile: data.user.mobile || '',
            };
          }
          throw new Error('Invalid login response from server');
        } catch (error: any) {
          throw new Error(error.message || 'Authentication error');
        }
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

      // Sync Google User to Python FastAPI Backend
      if (account?.provider === 'google') {
        if (!user.email) {
          return '/?error=EmailMissing';
        }

        let customMobile = '';
        try {
          const { cookies } = require('next/headers');
          const cookieStore = cookies();
          customMobile = cookieStore.get('greesal_custom_mobile')?.value || '';
        } catch (err) {
          // ignore
        }

        try {
          await fetch(`${BACKEND_URL}/api/users/sync-google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: user.name || (profile as any)?.name || user.email.split('@')[0],
              email: user.email.toLowerCase(),
              image: user.image || (profile as any)?.picture || null,
              mobile: customMobile ? decodeURIComponent(customMobile) : '',
              google_id: account?.providerAccountId,
            }),
            cache: 'no-store',
          });
        } catch (err) {
          console.warn('Google user sync to FastAPI notice:', err);
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
          const res = await fetch(`${BACKEND_URL}/api/users/${token.email.toLowerCase()}`, { cache: 'no-store' });
          if (res.ok) {
            const dbUser = await res.json();
            token.sub = dbUser.id || dbUser._id;
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
          const res = await fetch(`${BACKEND_URL}/api/users/${session.user.email.toLowerCase()}`, { cache: 'no-store' });
          if (res.ok) {
            const dbUser = await res.json();
            (session.user as any).mobile = dbUser.mobile || '';
          }
        } catch (err) {
          // ignore
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
  debug: false,
};
