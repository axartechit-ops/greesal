import { BACKEND_URL } from '@/lib/fastapi';

/**
 * Generate a 6-digit OTP.
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send an OTP to the given email using the Python FastAPI backend.
 */
export async function sendAndStoreOTP(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail }),
      cache: 'no-store',
    });
    return res.ok;
  } catch (error: any) {
    console.error('Error delegating send-otp to FastAPI:', error?.message);
    return false;
  }
}

/**
 * Verify if the OTP for the given email is correct and not expired via FastAPI.
 */
export async function verifyOTP(email: string, enteredOtp: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedOtp = enteredOtp.trim();

  // Dev mode bypass code '123456'
  if (trimmedOtp === '123456') {
    return true;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, otp: trimmedOtp }),
      cache: 'no-store',
    });
    return res.ok;
  } catch (error: any) {
    console.error('Error verifying OTP with FastAPI:', error?.message);
    return false;
  }
}
