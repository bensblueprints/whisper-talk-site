'use client';

import {
  saleActive,
  resellerPriceCents,
  RESELLER_RETAIL_CENTS,
  fmtCents
} from '@/lib/sale';

const WHOP_RESELLER_CHECKOUT = 'https://whop.com/checkout/plan_Y6cEJUbWTINsm';

export function ResellerBuyButton({ className }: { className?: string }) {
  const sale = saleActive();
  const price = fmtCents(resellerPriceCents());

  return (
    <a
      href={WHOP_RESELLER_CHECKOUT}
      className={`group inline-flex items-center gap-3 bg-ember hover:bg-ember-soft text-ink font-medium px-6 py-3.5 rounded-lg transition-all ${className ?? ''}`}
    >
      <span className="font-display text-2xl leading-none">
        {sale && (
          <span className="line-through opacity-50 text-lg mr-2">
            {fmtCents(RESELLER_RETAIL_CENTS)}
          </span>
        )}
        {price}
      </span>
      <span className="block w-px h-6 bg-ink/20" />
      <span className="font-mono text-[12px] uppercase-track">
        {sale ? 'Halloween deal →' : 'Become a reseller →'}
      </span>
    </a>
  );
}
