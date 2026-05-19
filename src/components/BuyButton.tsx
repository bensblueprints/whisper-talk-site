'use client';

import { useState } from 'react';

export function BuyButton({
  className,
  children,
  variant = 'primary'
}: {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'inline';
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.error || 'Could not start checkout.');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error. Try again.');
      setLoading(false);
    }
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handle}
        disabled={loading}
        className={`group inline-flex items-center gap-2 font-mono text-[11px] uppercase-track text-ember hover:text-ember-soft transition-colors ${className ?? ''}`}
      >
        {loading ? 'Opening checkout…' : children ?? 'Buy lifetime'}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </button>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1.5">
      <button
        onClick={handle}
        disabled={loading}
        className={`group inline-flex items-center gap-3 bg-ember hover:bg-ember-soft text-ink font-medium px-6 py-3.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-wait ${className ?? ''}`}
      >
        <span className="font-display text-2xl leading-none">$50</span>
        <span className="block w-px h-6 bg-ink/20" />
        <span className="font-mono text-[12px] uppercase-track">
          {loading ? 'Opening…' : 'Buy lifetime →'}
        </span>
      </button>
      {error && <span className="font-mono text-[11px] text-ember">{error}</span>}
    </div>
  );
}
