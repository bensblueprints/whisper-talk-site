'use client';

import { useState } from 'react';

export function CopyDashboardLink({ url, email }: { url: string; email: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-ember/50 bg-ember/5 p-1">
      <div className="rounded-lg bg-ink-2/80 p-8">
        <div className="flex items-baseline justify-between mb-4">
          <span className="font-mono text-[10px] uppercase-track text-paper-faint">
            Your reseller dashboard
          </span>
          <span className="font-mono text-[10px] uppercase-track text-paper-faint">
            unlimited keys · lifetime
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <code className="font-mono text-[13px] sm:text-[15px] text-ember tracking-[0.02em] select-all break-all flex-1 min-w-0">
            {url}
          </code>
          <button
            onClick={handleCopy}
            className="font-mono text-[11px] uppercase-track text-ink bg-ember hover:bg-ember-soft px-4 py-2 rounded transition-colors flex-shrink-0"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-paper-trace font-mono text-[11px] text-paper-mute leading-relaxed">
          email: <span className="text-paper">{email}</span>
          <br />
          this link is your login — <span className="text-paper">bookmark it and keep it private</span>
        </div>
      </div>
    </div>
  );
}
