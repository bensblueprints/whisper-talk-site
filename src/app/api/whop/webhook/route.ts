import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Whop signs webhooks with HMAC-SHA256: signature = HMAC(secret, "<timestamp>.<rawBody>")
// Header format: "whop-signature: t=<timestamp>,v1=<sig>"
function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret || !header) return false;

  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const timestamp = parts['t'];
  const sig = parts['v1'];
  if (!timestamp || !sig) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) return false;

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  try {
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const raw = await req.text();

  if (!verifySignature(raw, req.headers.get('whop-signature'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const action = String(body.action || '');
  const data = (body.data ?? {}) as Record<string, unknown>;

  try {
    if (action === 'membership_activated') {
      await handleValid(data);
    } else if (action === 'membership_deactivated') {
      await handleInvalid(data);
    }
  } catch (err) {
    console.error('Whop webhook handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleValid(data: Record<string, unknown>) {
  const membershipId = String(data.id ?? '');
  // Whop generates and delivers the license key — use it directly
  const licenseKey = String(data.license_key ?? '');

  if (!membershipId || !licenseKey) {
    console.error('Whop webhook: missing id or license_key', { membershipId, licenseKey });
    return;
  }

  // Idempotency: skip if we already recorded this membership
  const existing = await db
    .select({ key: schema.licenses.key })
    .from(schema.licenses)
    .where(eq(schema.licenses.externalId, membershipId))
    .limit(1);
  if (existing.length > 0) return;

  const user = (data.user ?? {}) as Record<string, unknown>;
  const email = String(user.email ?? '');
  if (!email) {
    console.error('Whop webhook: no email on membership', membershipId);
    return;
  }

  const plan = (data.plan ?? {}) as Record<string, unknown>;
  const amountCents = Math.round(Number(plan.price ?? data.checkout_price ?? 0) * 100);

  // Store Whop's key. Whop already shows the key to the customer in their hub — no email needed.
  await db.insert(schema.licenses).values({
    key: licenseKey,
    email,
    amountCents,
    currency: 'usd',
    status: 'active',
    source: 'whop',
    externalId: membershipId
  });
}

async function handleInvalid(data: Record<string, unknown>) {
  const membershipId = String(data.id ?? '');
  if (!membershipId) return;

  await db
    .update(schema.licenses)
    .set({
      status: 'refunded',
      refundedAt: new Date(),
      activeDeviceId: null,
      activeDeviceName: null
    })
    .where(eq(schema.licenses.externalId, membershipId));
}
