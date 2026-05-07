'use client';

import { useState } from 'react';

interface LicenseRow {
  key: string;
  status: string;
  activeDeviceName: string | null;
  activatedAt: string | null;
  createdAt: string;
}

export function AccountForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [licenses, setLicenses] = useState<LicenseRow[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLicenses(null);
    try {
      const res = await fetch('/api/license/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || 'Could not look up.');
      } else {
        setLicenses(json.licenses);
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="flex-1 bg-ink-2 border border-paper-trace focus:border-ember focus:outline-none rounded-md px-4 py-3 text-paper font-mono text-[13px] placeholder:text-paper-faint"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-ember hover:bg-ember-soft text-ink font-mono text-[11px] uppercase-track px-5 py-3 rounded-md transition-colors disabled:opacity-60"
        >
          {loading ? 'Looking up…' : 'Look up'}
        </button>
      </form>

      {error && <p className="font-mono text-[12px] text-ember mt-4">{error}</p>}

      {licenses && (
        <div className="mt-10">
          {licenses.length === 0 ? (
            <div className="rounded-lg border border-paper-trace bg-ink-2 p-8 text-center">
              <p className="text-paper-mute">No licenses found for that email.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="font-mono text-[11px] uppercase-track text-paper-faint mb-4">
                {licenses.length} license{licenses.length === 1 ? '' : 's'} on this email
              </div>
              {licenses.map((l) => (
                <div key={l.key} className="rounded-lg border border-paper-trace bg-ink-2 p-6">
                  <div className="flex items-baseline justify-between flex-wrap gap-3 mb-4">
                    <code className="font-mono text-lg text-ember tracking-[0.04em] select-all">{l.key}</code>
                    <span
                      className={`font-mono text-[10px] uppercase-track px-2 py-1 rounded ${
                        l.status === 'active' ? 'bg-ember/10 text-ember' : 'bg-paper-trace text-paper-mute'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-paper-mute leading-relaxed">
                    bound_to: <span className="text-paper">{l.activeDeviceName ?? '— unbound —'}</span><br />
                    purchased: <span className="text-paper">{new Date(l.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
