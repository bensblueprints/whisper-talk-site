import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { RESELLER_PRODUCT, resellerPriceCents } from '@/lib/reseller';

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
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: resellerPriceCents(),
          product_data: {
            name: 'WisperTalk Reseller License',
            description:
              'One-time reseller license. Generate unlimited WisperTalk lifetime keys and sell them at any price.'
          }
        },
        quantity: 1
      }
    ],
    customer_email: email,
    allow_promotion_codes: false,
    automatic_tax: { enabled: false },
    invoice_creation: { enabled: true },
    success_url: `${origin}/reseller/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/reseller?canceled=1`,
    metadata: {
      product: RESELLER_PRODUCT
    }
  });

  return NextResponse.json({ url: session.url });
}
