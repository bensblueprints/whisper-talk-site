import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Paid lifetime plans — comma-separated in WHOP_PAID_PLAN_IDS
// plan_cM14gKwLOrelj ($49, original) + plan_Oh4HMckTmxXcE ($49.99, current main)
function getPaidPlanIds(): Set<string> {
  const raw = process.env.WHOP_PAID_PLAN_IDS || 'plan_cM14gKwLOrelj,plan_Oh4HMckTmxXcE';
  return new Set(raw.split(',').map((s) => s.trim()).filter(Boolean));
}

function getAddonPlanId(): string {
  return process.env.WHOP_ADDON_PLAN_ID || 'plan_fiK0F85A7ml2P';
}

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
      await handleActivated(data);
    } else if (action === 'membership_deactivated') {
      await handleDeactivated(data);
    }
  } catch (err) {
    console.error('Whop webhook handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleActivated(data: Record<string, unknown>) {
  const membershipId = String(data.id ?? '');
  const licenseKey = String(data.license_key ?? '');

  if (!membershipId || !licenseKey) {
    console.error('Whop webhook: missing id or license_key', { membershipId, licenseKey });
    return;
  }

  // If membership already exists but key changed (user reset in Whop hub), update to new key
  const existing = await db
    .select({ key: schema.licenses.key })
    .from(schema.licenses)
    .where(eq(schema.licenses.externalId, membershipId))
    .limit(1);
  if (existing.length > 0) {
    if (existing[0].key === licenseKey) return; // identical, skip
    await db
      .update(schema.licenses)
      .set({ key: licenseKey, activeDeviceId: null, activeDeviceName: null, activatedAt: null })
      .where(eq(schema.licenses.externalId, membershipId));
    console.log(`Whop: updated reset key for membership ${membershipId}`);
    return;
  }

  const user = (data.user ?? {}) as Record<string, unknown>;
  const email = String(user.email ?? '');
  if (!email) {
    console.error('Whop webhook: no email on membership', membershipId);
    return;
  }

  const plan = (data.plan ?? {}) as Record<string, unknown>;
  const planId = String(plan.id ?? '');
  const amountCents = Math.round(Number(plan.price ?? data.checkout_price ?? 0) * 100);

  if (getPaidPlanIds().has(planId)) {
    // Main lifetime purchase — issue key directly
    await db.insert(schema.licenses).values({
      key: licenseKey,
      email,
      amountCents,
      currency: 'usd',
      status: 'active',
      source: 'whop',
      externalId: membershipId
    });
    console.log(`Whop: issued lifetime key for ${email} (plan ${planId})`);
    return;
  }

  if (planId === getAddonPlanId()) {
    // Addon purchase — only issue if buyer already has an active lifetime key
    const hasLifetime = await db
      .select({ key: schema.licenses.key })
      .from(schema.licenses)
      .where(
        and(
          eq(schema.licenses.email, email),
          eq(schema.licenses.source, 'whop'),
          eq(schema.licenses.status, 'active')
        )
      )
      .limit(1);

    if (hasLifetime.length === 0) {
      // No lifetime key on this email — don't issue. They need to contact support.
      console.warn(`Whop addon: ${email} bought addon (${membershipId}) but has no lifetime key — skipping`);
      return;
    }

    await db.insert(schema.licenses).values({
      key: licenseKey,
      email,
      amountCents,
      currency: 'usd',
      status: 'active',
      source: 'whop',
      externalId: membershipId
    });
    console.log(`Whop: issued addon key for ${email}`);
    return;
  }

  // Free tier — store the key so activation works in the app (word limit enforced client-side)
  const freePlanId = process.env.WHOP_FREE_PLAN_ID || 'plan_WcXGMgVYoqMEn';
  if (planId === freePlanId) {
    await db.insert(schema.licenses).values({
      key: licenseKey,
      email,
      amountCents: 0,
      currency: 'usd',
      status: 'active',
      source: 'whop',
      externalId: membershipId
    });
    console.log(`Whop: issued free trial key for ${email}`);
    return;
  }

  // Truly unknown plan — skip
  console.log(`Whop webhook: skipping unknown plan ${planId} on membership ${membershipId}`);
}

async function handleDeactivated(data: Record<string, unknown>) {
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
