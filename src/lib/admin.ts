import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'wt_admin';

const adminSecret = (() => {
  const raw = process.env.ADMIN_COOKIE_SECRET || 'dev-admin-secret-replace-replace-replace';
  return new TextEncoder().encode(raw);
})();

export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function issueAdminCookie() {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(adminSecret);

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, adminSecret);
    return true;
  } catch {
    return false;
  }
}
