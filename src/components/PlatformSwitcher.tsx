'use client';

import { useEffect, useState } from 'react';

const PLATFORMS = ['Windows', 'Mac'];
const TYPE_MS = 110;
const DELETE_MS = 55;
const HOLD_MS = 1800;

type Phase = 'holding' | 'deleting' | 'typing';

export function PlatformSwitcher() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(PLATFORMS[0]);
  const [phase, setPhase] = useState<Phase>('holding');

  useEffect(() => {
    const target = PLATFORMS[index];
    let id: ReturnType<typeof setTimeout> | undefined;

    if (phase === 'holding') {
      id = setTimeout(() => setPhase('deleting'), HOLD_MS);
    } else if (phase === 'deleting') {
      if (typed.length > 0) {
        id = setTimeout(() => setTyped(typed.slice(0, -1)), DELETE_MS);
      } else {
        const next = (index + 1) % PLATFORMS.length;
        setIndex(next);
        setPhase('typing');
      }
    } else {
      if (typed.length < target.length) {
        id = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), TYPE_MS);
      } else {
        setPhase('holding');
      }
    }

    return () => {
      if (id) clearTimeout(id);
    };
  }, [index, typed, phase]);

  return (
    <span className="text-paper-mute">
      On <span className="inline-block">{typed}</span>
      <span
        aria-hidden
        className="inline-block w-[0.06em] mx-[0.04em] -translate-y-[0.06em] bg-ember align-middle"
        style={{
          height: '0.7em',
          animation: 'wt-cursor-blink 1s steps(2, end) infinite'
        }}
      />
      .
      <style>{`
        @keyframes wt-cursor-blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
