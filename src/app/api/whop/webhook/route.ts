import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { generateLicenseKey } from '@/lib/license';
import { sendLicenseEmail } from '@/lib/email';
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

  // Reject stale webhooks (5-minute window)
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
    if (action === 'membership.went_valid') {
      await handleValid(data);
    } else if (action === 'membership.went_invalid') {
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
  if (!membershipId) return;

  // Idempotency: skip if we already issued a key for this membership
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
  // Whop stores amount as a number in dollars (e.g. 49 for $49)
  const amountCents = Math.round(Number(plan.price ?? data.checkout_price ?? 0) * 100);

  let key = generateLicenseKey();
  for (let attempt = 0; attempt < 5; attempt++) {
    const dup = await db
      .select({ key: schema.licenses.key })
      .from(schema.licenses)
      .where(eq(schema.licenses.key, key))
      .limit(1);
    if (dup.length === 0) break;
    key = generateLicenseKey();
  }

  await db.insert(schema.licenses).values({
    key,
    email,
    amountCents,
    currency: 'usd',
    status: 'active',
    source: 'whop',
    externalId: membershipId
  });

  const downloadUrl =
    process.env.NEXT_PUBLIC_DOWNLOAD_URL ||
    'https://github.com/bensblueprints/wispertalk-releases/releases/latest';

  try {
    await sendLicenseEmail({
      to: email,
      licenseKeys: [key],
      downloadUrl,
      amountCents,
      currency: 'usd',
      source: 'whop'
    });
  } catch (err) {
    console.error('Whop email send failed (license still recorded):', err);
  }
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
