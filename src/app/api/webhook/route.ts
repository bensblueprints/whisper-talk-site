import { NextResponse } from 'next/server';
import { stripe, webhookSecret } from '@/lib/stripe';
import { db, schema } from '@/lib/db';
import { generateLicenseKey } from '@/lib/license';
import { sendLicenseEmail } from '@/lib/email';
import { eq } from 'drizzle-orm';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HARD_CAP_LICENSES = 30;

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret());
  } catch (err) {
    return NextResponse.json({ error: `Bad signature: ${(err as Error).message}` }, { status: 400 });
  }

  await db
    .insert(schema.stripeEvents)
    .values({ id: event.id, type: event.type, payload: event as unknown as object })
    .onConflictDoNothing();

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCompleted(event.data.object as Stripe.Checkout.Session);
    } else if (event.type === 'charge.refunded') {
      await handleRefunded(event.data.object as Stripe.Charge);
    }
  } catch (err) {
    console.error('webhook handler error:', err);
    return NextResponse.json({ error: 'handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return;
  if (!stripe) return;

  const existing = await db
    .select()
    .from(schema.licenses)
    .where(eq(schema.licenses.stripeSessionId, session.id))
    .limit(1);
  if (existing.length > 0) return;

  const email = session.customer_details?.email || session.customer_email;
  if (!email) throw new Error('No customer email on session');

  const items = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ['data.price']
  });

  const unitAmounts: number[] = [];
  for (const li of items.data) {
    const qty = li.quantity || 0;
    if (qty <= 0) continue;
    const price = li.price as Stripe.Price | null;
    const unit =
      price?.unit_amount ?? Math.floor((li.amount_total || 0) / Math.max(1, qty));
    for (let q = 0; q < qty; q++) unitAmounts.push(unit);
  }
  if (unitAmounts.length === 0) unitAmounts.push(session.amount_total ?? 0);
  if (unitAmounts.length > HARD_CAP_LICENSES) unitAmounts.length = HARD_CAP_LICENSES;

  const keys: string[] = [];
  for (let n = 0; n < unitAmounts.length; n++) {
    let key = generateLicenseKey();
    for (let i = 0; i < 5; i++) {
      const dup = await db.select().from(schema.licenses).where(eq(schema.licenses.key, key)).limit(1);
      if (dup.length === 0) break;
      key = generateLicenseKey();
    }
    keys.push(key);
  }

  const currency = session.currency || 'usd';
  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const piId =
    typeof session.payment_intent === 'string' ? session.payment_intent : null;

  await db.transaction(async (tx) => {
    for (let i = 0; i < keys.length; i++) {
      await tx.insert(schema.licenses).values({
        key: keys[i],
        email,
        stripeCustomerId: customerId,
        stripeSessionId: session.id,
        stripePaymentIntentId: piId,
        amountCents: unitAmounts[i],
        currency,
        status: 'active'
      });
    }
  });

  const downloadUrl =
    process.env.NEXT_PUBLIC_DOWNLOAD_URL ||
    'https://github.com/bensblueprints/wispertalk-releases/releases/latest';
  const totalCents = unitAmounts.reduce((a, b) => a + b, 0);
  try {
    await sendLicenseEmail({
      to: email,
      licenseKeys: keys,
      downloadUrl,
      amountCents: totalCents,
      currency
    });
  } catch (err) {
    console.error('Email send failed (licenses still recorded):', err);
  }
}

async function handleRefunded(charge: Stripe.Charge) {
  const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
  if (!piId) return;
  const rows = await db
    .select()
    .from(schema.licenses)
    .where(eq(schema.licenses.stripePaymentIntentId, piId));
  if (rows.length === 0) return;
  await db
    .update(schema.licenses)
    .set({ status: 'refunded', refundedAt: new Date(), activeDeviceId: null, activeDeviceName: null })
    .where(eq(schema.licenses.stripePaymentIntentId, piId));
}
