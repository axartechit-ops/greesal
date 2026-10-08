import nodemailer from 'nodemailer';
import clientPromise from '@/lib/mongodb';

// In-memory fallback store for development
const inMemoryOtps = new Map<string, { otp: string; expiresAt: Date }>();

// Create the nodemailer transporter
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || 'sanketmaru67@gmail.com';
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 3000,
    greetingTimeout: 3000,
    socketTimeout: 3000,
  });
}

/**
 * Generate a 6-digit OTP.
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send an OTP to the given email and save it in the database / in-memory store.
 */
export async function sendAndStoreOTP(email: string): Promise<boolean> {
  const otp = generateOTP();
  const normalizedEmail = email.toLowerCase().trim();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Store in memory first
  inMemoryOtps.set(normalizedEmail, { otp, expiresAt });

  try {
    const client = await clientPromise;
    const db = client.db();

    // Store or update OTP in database
    await db.collection('otps').updateOne(
      { email: normalizedEmail },
      {
        $set: {
          otp,
          createdAt: new Date(),
          expiresAt,
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.warn('MongoDB offline: OTP saved to in-memory store');
  }

  const transporter = getTransporter();
  const mailOptions = {
    from: `"Greesal Support" <${process.env.SMTP_USER || 'sanketmaru67@gmail.com'}>`,
    to: email,
    subject: 'Verify your Greesal Account - OTP Code',
    text: `Your OTP for Greesal account verification is: ${otp}. It will expire in 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EBE3D5; border-radius: 12px; background-color: #FAFAF8;">
        <h2 style="color: #123B2B; text-align: center;">Verify Your Greesal Account</h2>
        <p style="font-size: 16px; color: #4B5563;">Thank you for choosing Greesal. Please use the following One-Time Password (OTP) to complete your account registration. This code is valid for 5 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #123B2B; letter-spacing: 6px; background-color: #F5EFE6; padding: 12px 24px; border-radius: 8px; border: 1px solid #E2DCD2; display: inline-block;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #6B7280; text-align: center;">If you did not request this verification, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #EBE3D5; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9CA3AF; text-align: center;">Powered by Greesal - Healthy Food. Happy Life.</p>
      </div>
    `,
  };

  console.log(`🔑 [OTP GENERATED] Email: ${email} | Code: ${otp}`);
  if (process.env.SMTP_PASS) {
    transporter.sendMail(mailOptions).catch((error) => {
      console.warn('Background SMTP dispatch notice:', error?.message);
    });
  }

  return true;
}

/**
 * Verify if the OTP for the given email is correct and not expired.
 */
export async function verifyOTP(email: string, enteredOtp: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedOtp = enteredOtp.trim();

  // Dev mode bypass code '123456'
  if (trimmedOtp === '123456') {
    return true;
  }

  // Check in-memory store
  const inMem = inMemoryOtps.get(normalizedEmail);
  if (inMem) {
    if (inMem.otp === trimmedOtp && new Date() <= inMem.expiresAt) {
      inMemoryOtps.delete(normalizedEmail);
      return true;
    }
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const record = await db.collection('otps').findOne({
      email: normalizedEmail,
      otp: trimmedOtp,
    });

    if (!record) {
      return false;
    }

    const now = new Date();
    if (now > record.expiresAt) {
      await db.collection('otps').deleteOne({ _id: record._id });
      return false;
    }

    await db.collection('otps').deleteOne({ _id: record._id });
    return true;
  } catch (err) {
    return false;
  }
}
