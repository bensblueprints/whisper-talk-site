'use client';

import { useState, useEffect } from 'react';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const STORAGE_KEY = 'wt_offer_deadline';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function CountdownTimer() {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let dl: number;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? Number(stored) : NaN;
      if (!isNaN(parsed) && parsed > Date.now()) {
        dl = parsed;
      } else {
        dl = Date.now() + SEVEN_DAYS_MS;
        localStorage.setItem(STORAGE_KEY, String(dl));
      }
    } catch {
      dl = Date.now() + SEVEN_DAYS_MS;
    }
    setDeadline(dl);
    setNow(Date.now());

    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  if (deadline === null) return null;

  const ms = Math.max(0, deadline - now);
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);

  return (
    <div className="inline-flex items-center gap-3 rounded-lg border border-ember/30 bg-ember/[0.06] px-4 py-2.5">
      <span className="block w-1.5 h-1.5 rounded-full bg-ember pulse-ember flex-shrink-0" />
      <span className="font-mono text-[11px] uppercase-track text-paper-mute">
        Lifetime deal ends in{' '}
        <span className="text-ember tabular-nums">
          {days}d {pad(hours)}h {pad(mins)}m {pad(secs)}s
        </span>
        {' — '}then <span className="text-paper-mute line-through">$5/mo</span>
      </span>
    </div>
  );
}
