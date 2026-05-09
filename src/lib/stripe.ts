import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) console.warn('STRIPE_SECRET_KEY is not set — Stripe routes will fail');

export const stripe = key ? new Stripe(key, { apiVersion: '2025-02-24.acacia' }) : null;

export function publicKey(): string {
  return process.env.STRIPE_PUBLISHABLE_KEY || '';
}

export function priceId(): string {
  const id = process.env.STRIPE_PRICE_ID;
  if (!id) throw new Error('STRIPE_PRICE_ID is not set');
  return id;
}

export function additionalPriceId(): string | null {
  return process.env.STRIPE_ADDITIONAL_PRICE_ID || null;
}

export const MAX_EXTRA_LICENSES = 20;

export function webhookSecret(): string {
  const s = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s) throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  return s;
}
