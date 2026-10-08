import crypto from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_SECRET = process.env.NEXTAUTH_SECRET || 'greesal_admin_auth_secret_key_2026';
export const ADMIN_COOKIE_NAME = 'greesal_admin_session';

export interface AdminSessionData {
  username: string;
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Validate admin username and password
 */
export function validateAdminCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  return (
    username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() &&
    password === ADMIN_PASSWORD
  );
}

/**
 * Sign session payload with HMAC-SHA256
 */
export function createAdminToken(username: string = 'admin', expiresInDays: number = 7): string {
  const payload: AdminSessionData = {
    username,
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and decode an admin token
 */
export function verifyAdminToken(token?: string | null): { valid: boolean; session: AdminSessionData | null } {
  if (!token || typeof token !== 'string') {
    return { valid: false, session: null };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, session: null };
  }

  const [payloadBase64, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return { valid: false, session: null };
  }

  try {
    const payload: AdminSessionData = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf-8')
    );

    if (Date.now() > payload.exp) {
      return { valid: false, session: null };
    }

    return { valid: true, session: payload };
  } catch {
    return { valid: false, session: null };
  }
}
