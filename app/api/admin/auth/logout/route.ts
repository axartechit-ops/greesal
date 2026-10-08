import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/admin-auth';

function logoutHandler() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Admin logged out successfully',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    console.error('Error during admin logout:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return logoutHandler();
}

export async function GET(request: NextRequest) {
  return logoutHandler();
}
