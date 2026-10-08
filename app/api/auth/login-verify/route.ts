import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { verifyPassword } from '@/lib/auth-utils';
import { sendAndStoreOTP } from '@/lib/otp';
import { checkOtpRateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Rate limiting: 1000ms cooldown and max 5 requests per minute per user
    const rateLimit = checkOtpRateLimit(trimmedEmail, 1000, 5);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.error, retryAfter: rateLimit.retryAfterSeconds },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds || 1),
          }
        }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Find user
    const user = await db.collection('users').findOne({ email: trimmedEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'No user found with this email. Please register first.' },
        { status: 400 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'This account was registered with Google. Please login with Google.' },
        { status: 400 }
      );
    }

    // Verify Password
    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 400 }
      );
    }

    // Generate and send OTP via SMTP
    const sent = await sendAndStoreOTP(trimmedEmail);
    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please check SMTP configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'OTP sent successfully to your email.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login verify error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
