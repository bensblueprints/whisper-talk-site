import { randomBytes, createHash } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateLicenseKey(): string {
  const groups: string[] = [];
  for (let g = 0; g < 4; g++) {
    let chunk = '';
    const bytes = randomBytes(4);
    for (let i = 0; i < 4; i++) chunk += ALPHABET[bytes[i] % ALPHABET.length];
    groups.push(chunk);
  }
  return `WT-${groups.join('-')}`;
}

export function normalizeLicenseKey(key: string): string {
  const cleaned = key.toUpperCase().replace(/[^A-Z0-9]/g, '');
  // WT-XXXX-XXXX-XXXX-XXXX (local keys)
  if (cleaned.startsWith('WT') && cleaned.length === 18) {
    const body = cleaned.slice(2);
    return `WT-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}-${body.slice(12, 16)}`;
  }
  // W-XXXXXX-XXXXXXXX-XXXXXXXW (Whop keys, 22 chars stripped)
  if (cleaned.startsWith('W') && cleaned.endsWith('W') && cleaned.length === 22) {
    return `W-${cleaned.slice(1, 7)}-${cleaned.slice(7, 15)}-${cleaned.slice(15, 22)}`;
  }
  return key.trim().toUpperCase();
}

export function fingerprintDevice(deviceId: string): string {
  return createHash('sha256').update(deviceId).digest('hex').slice(0, 16);
}

const secretBytes = (() => {
  const raw = process.env.LICENSE_JWT_SECRET || 'dev-secret-replace-me-please-replace-me-please';
  return new TextEncoder().encode(raw);
})();

export interface DeviceTokenClaims {
  k: string;
  d: string;
  iat?: number;
  exp?: number;
}

export async function signDeviceToken(licenseKey: string, deviceId: string, ttlSeconds = 60 * 60 * 24 * 7): Promise<string> {
  return new SignJWT({ k: licenseKey, d: fingerprintDevice(deviceId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secretBytes);
}

export async function verifyDeviceToken(token: string): Promise<DeviceTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretBytes);
    return payload as unknown as DeviceTokenClaims;
  } catch {
    return null;
  }
}
