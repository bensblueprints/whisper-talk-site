'use client';

import { useState } from 'react';

export function GenerateForm({ token }: { token: string }) {
  const [email, setEmail] = useState('');
  const [price, setPrice] = useState('');
  const [emailCustomer, setEmailCustomer] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ key: string; emailed: boolean; duplicate?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const priceDollars = price.trim() === '' ? 0 : Number(price);
      const res = await fetch('/api/reseller/keys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          token,
          customerEmail: email.trim(),
          priceCents: Number.isFinite(priceDollars) ? Math.round(priceDollars * 100) : 0,
          emailCustomer
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to generate key');
      setResult({ key: data.key, emailed: !!data.emailed, duplicate: !!data.duplicate });
      setEmail('');
      setPrice('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy(key: string) {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <form onSubmit={handleGenerate} className="flex flex-col gap-4 max-w-[520px]">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@email.com"
            className="flex-1 bg-ink border border-paper-trace rounded-md px-4 py-3 text-[14px] text-paper placeholder:text-paper-faint focus:outline-none focus:border-ember/60"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Sold for $ (optional)"
            className="sm:w-[180px] bg-ink border border-paper-trace rounded-md px-4 py-3 text-[14px] text-paper placeholder:text-paper-faint focus:outline-none focus:border-ember/60"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={emailCustomer}
            onChange={(e) => setEmailCustomer(e.target.checked)}
            className="w-4 h-4 accent-[#ff7a3a]"
          />
          <span className="text-paper-mute text-[13px]">
            Email the key + download link to the customer
          </span>
        </label>

        <div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-3 bg-ember hover:bg-ember-soft disabled:opacity-60 text-ink font-mono text-[12px] uppercase-track px-6 py-3.5 rounded-lg transition-colors"
          >
            {busy ? 'Generating…' : 'Generate key →'}
          </button>
        </div>
      </form>

      {error && (
        <p className="font-mono text-[11px] text-red-400 mt-4">{error} — try again.</p>
      )}

      {result && (
        <div className="mt-6 rounded-lg border border-ember/50 bg-ink-2/80 p-5 max-w-[520px]">
          <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-2">
            {result.duplicate ? 'Already generated for this customer' : 'Key generated'}
            {result.emailed ? ' · emailed to customer' : ''}
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <code className="font-mono text-xl text-ember tracking-[0.04em] select-all">{result.key}</code>
            <button
              onClick={() => handleCopy(result.key)}
              className="font-mono text-[11px] uppercase-track text-ink bg-ember hover:bg-ember-soft px-3 py-1.5 rounded transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="font-mono text-[11px] text-paper-faint mt-3">Refresh to see it in the table below.</p>
        </div>
      )}
    </div>
  );
}
