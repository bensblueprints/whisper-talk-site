'use client';

import { useState } from 'react';

export function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        window.location.href = '/admin';
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error || 'Wrong password.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="admin password"
        autoFocus
        required
        className="w-full bg-ink-2 border border-paper-trace focus:border-ember focus:outline-none rounded-md px-4 py-3 text-paper font-mono"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ember hover:bg-ember-soft text-ink font-mono text-[11px] uppercase-track py-3 rounded-md transition-colors disabled:opacity-60"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      {error && <p className="font-mono text-[12px] text-ember">{error}</p>}
    </form>
  );
}
