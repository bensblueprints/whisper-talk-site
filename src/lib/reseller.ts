import { randomBytes, randomUUID } from 'node:crypto';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import type { Reseller } from '@/db/schema';

import { resellerPriceCents } from '@/lib/sale';

export const RESELLER_PRODUCT = 'wispertalk-reseller';
export { resellerPriceCents };

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

export async function resellerBySession(sessionId: string): Promise<Reseller | null> {
  const rows = await db
    .select()
    .from(schema.resellers)
    .where(eq(schema.resellers.stripeSessionId, sessionId))
    .limit(1);
  return rows[0] ?? null;
}

export async function createReseller({
  email,
  name,
  stripeCustomerId,
  stripeSessionId,
  stripePaymentIntentId,
  amountCents,
  currency
}: {
  email: string;
  name?: string | null;
  stripeCustomerId?: string | null;
  stripeSessionId: string;
  stripePaymentIntentId?: string | null;
  amountCents: number;
  currency: string;
}): Promise<Reseller> {
  const existing = await resellerBySession(stripeSessionId);
  if (existing) return existing;

  const token = newAccessToken();
  const row = {
    id: randomUUID(),
    email,
    name: name ?? null,
    stripeCustomerId: stripeCustomerId ?? null,
    stripeSessionId,
    stripePaymentIntentId: stripePaymentIntentId ?? null,
    amountCents,
    currency,
    accessToken: token,
    status: 'active'
  };
  await db.insert(schema.resellers).values(row);
  return row as Reseller;
}
