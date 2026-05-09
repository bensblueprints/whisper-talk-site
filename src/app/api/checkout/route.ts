import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, priceId, additionalPriceId, MAX_EXTRA_LICENSES } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  let email: string | undefined;
  let extraLicenses = 0;
  try {
    const body = await req.json().catch(() => ({}));
    email = body?.email;
    const n = Number(body?.extraLicenses ?? 0);
    if (Number.isFinite(n) && n > 0) {
      extraLicenses = Math.min(MAX_EXTRA_LICENSES, Math.floor(n));
    }
  } catch {}

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const addOnPrice = additionalPriceId();

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    { price: priceId(), quantity: 1 }
  ];
  if (addOnPrice && extraLicenses > 0) {
    lineItems.push({
      price: addOnPrice,
      quantity: extraLicenses,
      adjustable_quantity: { enabled: true, minimum: 0, maximum: MAX_EXTRA_LICENSES }
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: email,
    allow_promotion_codes: true,
    automatic_tax: { enabled: false },
    invoice_creation: { enabled: true },
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?canceled=1`,
    metadata: {
      product: 'whisper-talk-lifetime',
      extras_requested: String(extraLicenses)
    }
  });

  return NextResponse.json({ url: session.url });
}
