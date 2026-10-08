import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth-utils';
import { verifyOTP } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { email, password, mobile, otp } = await request.json();

    if (!email || !password || !mobile || !otp) {
      return NextResponse.json(
        { error: 'Email, password, mobile number, and OTP are required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMobile = mobile.trim();
    const trimmedOtp = otp.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    if (!phoneRegex.test(trimmedMobile)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-15 digit mobile number' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isOtpValid = await verifyOTP(trimmedEmail, trimmedOtp);
    if (!isOtpValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: trimmedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    
    const newUser = {
      email: trimmedEmail,
      password: hashedPassword,
      mobile: trimmedMobile,
      name: trimmedEmail.split('@')[0], // default name from email
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    return NextResponse.json(
      { message: 'User registered successfully', userId: result.insertedId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
