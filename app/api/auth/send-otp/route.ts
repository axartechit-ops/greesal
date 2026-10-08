import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendAndStoreOTP } from '@/lib/otp';
import { checkOtpRateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

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

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: trimmedEmail });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    // Generate and send OTP via SMTP
    const sent = await sendAndStoreOTP(trimmedEmail);
    if (!sent) {
      return NextResponse.json({ error: 'Failed to send OTP. Please check SMTP credentials.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'OTP sent successfully to your email.' }, { status: 200 });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
