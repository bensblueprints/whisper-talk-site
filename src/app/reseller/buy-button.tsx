'use client';

import { useState } from 'react';
import { saleActive, resellerPriceCents, RESELLER_RETAIL_CENTS } from '@/lib/sale';

export function ResellerBuyButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sale = saleActive();
  const price = resellerPriceCents() / 100;

  async function handleBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reseller/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}'
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="group inline-flex items-center gap-3 bg-ember hover:bg-ember-soft disabled:opacity-60 text-ink font-medium px-6 py-3.5 rounded-lg transition-all"
      >
        <span className="font-display text-2xl leading-none">
          {sale && (
            <span className="line-through opacity-50 text-lg mr-2">${RESELLER_RETAIL_CENTS / 100}</span>
          )}
          ${price}
        </span>
        <span className="block w-px h-6 bg-ink/20" />
        <span className="font-mono text-[12px] uppercase-track">
          {loading ? 'Opening checkout…' : sale ? 'Halloween deal →' : 'Become a reseller →'}
        </span>
      </button>
      {error && (
        <p className="font-mono text-[11px] text-red-400 mt-3">{error} — try again.</p>
      )}
    </div>
  );
}
