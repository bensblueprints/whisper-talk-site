'use client';

import { useState, useEffect } from 'react';
import { SALE_ENDS, RESELLER_RETAIL_CENTS } from '@/lib/sale';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function HalloweenCountdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  if (now === null || now >= SALE_ENDS) return null;

  const ms = SALE_ENDS - now;
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);

  return (
    <div className="inline-flex items-center gap-3 rounded-lg border border-ember/30 bg-ember/[0.06] px-4 py-2.5">
      <span className="block w-1.5 h-1.5 rounded-full bg-ember pulse-ember flex-shrink-0" />
      <span className="font-mono text-[11px] uppercase-track text-paper-mute">
        Halloween deal ends in{' '}
        <span className="text-ember tabular-nums">
          {days}d {pad(hours)}h {pad(mins)}m {pad(secs)}s
        </span>
        {' — '}then <span className="text-paper-mute">${RESELLER_RETAIL_CENTS / 100}</span>
      </span>
    </div>
  );
}
