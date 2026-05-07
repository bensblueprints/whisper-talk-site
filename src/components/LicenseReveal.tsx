'use client';

import { useEffect, useState } from 'react';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomKey(): string {
  const groups: string[] = [];
  for (let g = 0; g < 4; g++) {
    let chunk = '';
    for (let i = 0; i < 4; i++) {
      chunk += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    groups.push(chunk);
  }
  return `WT-${groups.join('-')}`;
}

export function LicenseReveal() {
  const [key, setKey] = useState('WT-XXXX-XXXX-XXXX-XXXX');
  const [scrambling, setScrambling] = useState(false);

  useEffect(() => {
    let mounted = true;
    let cycleTimer: ReturnType<typeof setTimeout>;

    const cycle = () => {
      if (!mounted) return;
      setScrambling(true);

      const target = randomKey();
      const start = performance.now();
      const duration = 1100;

      const tick = (t: number) => {
        if (!mounted) return;
        const progress = Math.min(1, (t - start) / duration);
        const reveal = Math.floor(progress * target.length);

        let out = '';
        for (let i = 0; i < target.length; i++) {
          if (target[i] === '-') out += '-';
          else if (i < reveal) out += target[i];
          else out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        }
        setKey(out);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setKey(target);
          setScrambling(false);
          cycleTimer = setTimeout(cycle, 4500);
        }
      };
      requestAnimationFrame(tick);
    };

    cycleTimer = setTimeout(cycle, 800);
    return () => {
      mounted = false;
      clearTimeout(cycleTimer);
    };
  }, []);

  return (
    <div className="rounded-lg border border-paper-trace bg-ink-2/80 backdrop-blur-sm">
      <div className="px-4 py-2.5 border-b border-paper-trace flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="block w-2 h-2 rounded-full bg-paper-faint" />
          <span className="block w-2 h-2 rounded-full bg-paper-faint" />
          <span className={`block w-2 h-2 rounded-full transition-colors ${scrambling ? 'bg-ember' : 'bg-violet'}`} />
        </div>
        <span className="font-mono text-[10px] uppercase-track text-paper-faint">
          stripe.checkout.completed
        </span>
      </div>
      <div className="px-5 py-5">
        <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-2">
          → license_key
        </div>
        <div className="font-mono text-xl sm:text-2xl text-ember tracking-[0.04em] tabular-nums">
          {key}
        </div>
        <div className="font-mono text-[11px] text-paper-faint mt-3 leading-relaxed">
          delivered_to: <span className="text-paper-mute">you@example.com</span><br />
          devices_active: <span className="text-paper-mute">0 / 1</span>
        </div>
      </div>
    </div>
  );
}
