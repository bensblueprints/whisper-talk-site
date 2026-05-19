'use client';

import { useState } from 'react';

type State = 'idle' | 'loading' | 'success' | 'error';

export function RedeemForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/license/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const json = await res.json();
      if (json.ok) {
        setState('success');
      } else {
        setErrorMsg(json.error || 'Something went wrong.');
        setState('error');
      }
    } catch {
      setErrorMsg('Network error — try again.');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-xl border border-ember/40 bg-ember/5 p-8 max-w-lg">
        <div className="font-mono text-[11px] uppercase-track text-ember mb-3">Email sent</div>
        <p className="text-paper text-[16px] leading-relaxed mb-2">
          Check your inbox — your license key is on its way.
        </p>
        <p className="text-paper-mute text-[13.5px] leading-relaxed">
          If it doesn't arrive within a few minutes, check spam. The email comes from{' '}
          <span className="text-paper">licenses@advancedmarketing.co</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handle} className="max-w-lg">
      <label className="block font-mono text-[11px] uppercase-track text-paper-faint mb-2">
        Email address
      </label>
      <div className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={state === 'loading'}
          className="flex-1 rounded-lg border border-paper-trace bg-ink-2/60 px-4 py-3 font-mono text-[14px] text-paper placeholder:text-paper-faint focus:outline-none focus:border-ember/60 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === 'loading' || !email.trim()}
          className="flex-shrink-0 inline-flex items-center gap-2 bg-ember hover:bg-ember-soft text-ink font-mono text-[12px] uppercase-track px-5 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-wait"
        >
          {state === 'loading' ? 'Sending…' : 'Resend →'}
        </button>
      </div>
      {state === 'error' && (
        <p className="mt-3 font-mono text-[12px] text-ember">{errorMsg}</p>
      )}
      <p className="mt-3 font-mono text-[11px] text-paper-faint">
        We'll resend your license key to this address. Must match the email used at purchase.
      </p>
    </form>
  );
}
