'use client';

import { useState } from 'react';

export function CopyKey({
  licenseKeys,
  email
}: {
  licenseKeys: string[];
  email: string;
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const isMulti = licenseKeys.length > 1;

  async function handleCopy(key: string, index: number) {
    await navigator.clipboard.writeText(key);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex((c) => (c === index ? null : c)), 2000);
  }

  async function handleCopyAll() {
    await navigator.clipboard.writeText(licenseKeys.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  return (
    <div className="rounded-xl border border-ember/50 bg-ember/5 p-1 ring-ember">
      <div className="rounded-lg bg-ink-2/80 p-8">
        <div className="flex items-baseline justify-between mb-4">
          <span className="font-mono text-[10px] uppercase-track text-paper-faint">
            {isMulti ? `Your license keys (${licenseKeys.length})` : 'Your license key'}
          </span>
          <span className="font-mono text-[10px] uppercase-track text-paper-faint">
            {isMulti ? `${licenseKeys.length} devices · lifetime` : '1 device · lifetime'}
          </span>
        </div>

        {isMulti ? (
          <div className="space-y-3">
            {licenseKeys.map((k, i) => (
              <div
                key={k}
                className="flex items-center gap-3 flex-wrap rounded-lg border border-paper-trace bg-ink/40 px-4 py-3"
              >
                <span className="font-mono text-[10px] uppercase-track text-paper-faint w-6">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <code className="font-mono text-lg sm:text-xl text-ember tracking-[0.04em] tabular-nums select-all flex-1 min-w-0 break-all">
                  {k}
                </code>
                <button
                  onClick={() => handleCopy(k, i)}
                  className="font-mono text-[11px] uppercase-track text-ink bg-ember hover:bg-ember-soft px-3 py-1.5 rounded transition-colors flex-shrink-0"
                >
                  {copiedIndex === i ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            ))}
            <div className="pt-2">
              <button
                onClick={handleCopyAll}
                className="font-mono text-[11px] uppercase-track text-paper-mute hover:text-paper transition-colors"
              >
                {copiedAll ? '✓ All keys copied' : 'Copy all →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 flex-wrap">
            <code className="font-mono text-2xl sm:text-3xl text-ember tracking-[0.04em] tabular-nums select-all">
              {licenseKeys[0]}
            </code>
            <button
              onClick={() => handleCopy(licenseKeys[0], 0)}
              className="font-mono text-[11px] uppercase-track text-ink bg-ember hover:bg-ember-soft px-4 py-2 rounded transition-colors"
            >
              {copiedIndex === 0 ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-paper-trace font-mono text-[11px] text-paper-mute leading-relaxed">
          email: <span className="text-paper">{email}</span>
          <br />
          status: <span className="text-paper">active · unbound</span>
        </div>
      </div>
    </div>
  );
}
