'use client';

import { useState } from 'react';

export function CopyKey({ licenseKey, email }: { licenseKey: string; email: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-ember/50 bg-ember/5 p-1 ring-ember">
      <div className="rounded-lg bg-ink-2/80 p-8">
        <div className="flex items-baseline justify-between mb-4">
          <span className="font-mono text-[10px] uppercase-track text-paper-faint">Your license key</span>
          <span className="font-mono text-[10px] uppercase-track text-paper-faint">1 device · lifetime</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <code className="font-mono text-2xl sm:text-3xl text-ember tracking-[0.04em] tabular-nums select-all">
            {licenseKey}
          </code>
          <button
            onClick={handleCopy}
            className="font-mono text-[11px] uppercase-track text-ink bg-ember hover:bg-ember-soft px-4 py-2 rounded transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <div className="mt-6 pt-6 border-t border-paper-trace font-mono text-[11px] text-paper-mute leading-relaxed">
          email: <span className="text-paper">{email}</span><br />
          status: <span className="text-paper">active · unbound</span>
        </div>
      </div>
    </div>
  );
}
