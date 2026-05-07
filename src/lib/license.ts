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
  if (!cleaned.startsWith('WT')) return key.trim().toUpperCase();
  const body = cleaned.slice(2);
  if (body.length !== 16) return key.trim().toUpperCase();
  return `WT-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}-${body.slice(12, 16)}`;
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
