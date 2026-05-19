'use client';

import { useState } from 'react';

const BASE_PRICE = 50;
const ADDITIONAL_PRICE = 10;
const MAX_EXTRAS = 20;

export function PricingBuy() {
  const [extras, setExtras] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalLicenses = 1 + extras;
  const total = BASE_PRICE + extras * ADDITIONAL_PRICE;

  async function handle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extraLicenses: extras })
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.error || 'Could not start checkout.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-[440px]">
      <div className="rounded-xl border border-paper-trace bg-ink-2/50 p-5">
        <div className="flex items-baseline justify-between mb-4">
          <span className="font-mono text-[11px] uppercase-track text-paper">
            Additional licenses
          </span>
          <span className="font-mono text-[11px] uppercase-track text-paper-faint">
            $10 each
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExtras((n) => Math.max(0, n - 1))}
            disabled={extras === 0}
            aria-label="Decrease additional licenses"
            className="w-11 h-11 rounded-md border border-paper-trace text-paper-mute hover:text-paper hover:border-paper-faint disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-display text-2xl leading-none flex items-center justify-center"
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={extras}
            onChange={(e) => {
              const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
              if (Number.isNaN(n)) setExtras(0);
              else setExtras(Math.max(0, Math.min(MAX_EXTRAS, n)));
            }}
            className="w-14 h-11 rounded-md border border-paper-trace bg-ink/40 text-center font-mono text-xl text-paper tabular-nums focus:outline-none focus:border-ember/60"
          />
          <button
            type="button"
            onClick={() => setExtras((n) => Math.min(MAX_EXTRAS, n + 1))}
            disabled={extras === MAX_EXTRAS}
            aria-label="Increase additional licenses"
            className="w-11 h-11 rounded-md border border-paper-trace text-paper-mute hover:text-paper hover:border-paper-faint disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-display text-2xl leading-none flex items-center justify-center"
          >
            +
          </button>
          <span className="ml-auto font-mono text-[11px] uppercase-track text-paper-faint text-right leading-tight">
            {totalLicenses}
            <br />
            {totalLicenses === 1 ? 'license' : 'licenses'}
          </span>
        </div>
        <div className="mt-3 font-mono text-[11px] text-paper-faint leading-relaxed">
          One license = one device. Buy extras for teams or multiple machines.
        </div>
      </div>

      <div className="inline-flex flex-col items-start gap-1.5">
        <button
          onClick={handle}
          disabled={loading}
          className="group inline-flex items-center gap-3 bg-ember hover:bg-ember-soft text-ink font-medium px-6 py-3.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-wait"
        >
          <span className="font-display text-2xl leading-none tabular-nums">${total}</span>
          <span className="block w-px h-6 bg-ink/20" />
          <span className="font-mono text-[12px] uppercase-track">
            {loading
              ? 'Opening…'
              : extras > 0
                ? `Buy ${totalLicenses} licenses →`
                : 'Buy lifetime →'}
          </span>
        </button>
        {extras > 0 && !loading && (
          <span className="font-mono text-[11px] text-paper-faint">
            $50 base + {extras} × $10 extra
          </span>
        )}
        {error && <span className="font-mono text-[11px] text-ember">{error}</span>}
      </div>
    </div>
  );
}
