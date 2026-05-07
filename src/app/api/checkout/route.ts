import { NextResponse } from 'next/server';
import { stripe, priceId } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  let email: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    email = body?.email;
  } catch {}

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId(), quantity: 1 }],
    customer_email: email,
    allow_promotion_codes: true,
    automatic_tax: { enabled: false },
    invoice_creation: { enabled: true },
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?canceled=1`,
    metadata: { product: 'whisper-talk-lifetime' }
  });

  return NextResponse.json({ url: session.url });
}
