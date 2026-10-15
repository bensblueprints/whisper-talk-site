import { randomBytes, randomUUID } from 'node:crypto';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import type { Reseller } from '@/db/schema';

export function newAccessToken(): string {
  return randomBytes(24).toString('base64url');
}

export function dashboardUrlFor(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://wispertalk.com';
  return `${base}/reseller/dashboard?token=${token}`;
}

export async function resellerByToken(token: string): Promise<Reseller | null> {
  if (!token || token.length < 16 || token.length > 128) return null;
  const rows = await db
    .select()
    .from(schema.resellers)
    .where(eq(schema.resellers.accessToken, token))
    .limit(1);
  return rows[0] ?? null;
}

export async function resellerByExternalId(externalId: string): Promise<Reseller | null> {
  const rows = await db
    .select()
    .from(schema.resellers)
    .where(eq(schema.resellers.externalId, externalId))
    .limit(1);
  return rows[0] ?? null;
}

export async function createReseller({
  email,
  name,
  externalId,
  amountCents,
  currency
}: {
  email: string;
  name?: string | null;
  externalId: string;
  amountCents: number;
  currency: string;
}): Promise<{ reseller: Reseller; created: boolean }> {
  const existing = await resellerByExternalId(externalId);
  if (existing) return { reseller: existing, created: false };

  const row = {
    id: randomUUID(),
    email,
    name: name ?? null,
    externalId,
    amountCents,
    currency,
    accessToken: newAccessToken(),
    status: 'active'
  };
  await db.insert(schema.resellers).values(row);
  return { reseller: row as Reseller, created: true };
}
