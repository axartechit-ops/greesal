import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
  validateAdminCredentials,
  verifyAdminToken,
} from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token =
    req.cookies.get(ADMIN_COOKIE_NAME)?.value ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const { valid, session } = verifyAdminToken(token);

  if (!valid || !session) {
    return NextResponse.json(
      { authenticated: false, message: 'Not authenticated as admin' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: session.username || 'admin',
      role: session.role || 'admin',
    },
  });
}

export async function POST(req: NextRequest) {
  let data: { username?: string; password?: string; rememberMe?: boolean };
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { username, password } = data;
  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400 }
    );
  }

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json(
      { error: 'Invalid admin username or password' },
      { status: 401 }
    );
  }

  const expiresInDays = data.rememberMe ? 30 : 7;
  const response = NextResponse.json({
    success: true,
    message: 'Admin login successful',
    user: { username: username.trim(), role: 'admin' },
  });

  response.cookies.set(ADMIN_COOKIE_NAME, createAdminToken(username.trim(), expiresInDays), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: expiresInDays * 86400,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Admin logged out successfully',
  });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
