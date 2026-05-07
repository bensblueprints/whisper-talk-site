'use client';

import { useEffect, useRef } from 'react';

export function Waveform({ height = 120 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phasesRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const setSize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);

    const barCount = 64;
    if (phasesRef.current.length !== barCount) {
      phasesRef.current = Array.from({ length: barCount }, () => Math.random() * Math.PI * 2);
    }

    let raf = 0;
    const start = performance.now();

    const render = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const elapsed = (t - start) / 1000;
      const gap = 3;
      const barW = (w - gap * (barCount - 1)) / barCount;

      for (let i = 0; i < barCount; i++) {
        const phase = phasesRef.current[i];
        const center = barCount / 2;
        const distFromCenter = Math.abs(i - center) / center;

        const slow = Math.sin(elapsed * 1.4 + phase) * 0.5 + 0.5;
        const fast = Math.sin(elapsed * 4.2 + phase * 1.7) * 0.5 + 0.5;
        const noise = Math.sin(elapsed * 8.9 + phase * 2.3) * 0.18;

        const envelope = 1 - distFromCenter * 0.55;
        const amp = (slow * 0.55 + fast * 0.35 + noise) * envelope;

        const minH = 4;
        const maxH = h * 0.85;
        const barH = minH + amp * (maxH - minH);

        const x = i * (barW + gap);
        const y = (h - barH) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        if (i % 9 === 0) {
          grad.addColorStop(0, 'rgba(255, 122, 58, 0.95)');
          grad.addColorStop(1, 'rgba(255, 122, 58, 0.4)');
        } else {
          grad.addColorStop(0, 'rgba(139, 141, 245, 0.85)');
          grad.addColorStop(1, 'rgba(139, 141, 245, 0.25)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        const r = Math.min(barW / 2, 2);
        ctx.roundRect(x, y, barW, barH, r);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ height, width: '100%', display: 'block' }}
      aria-hidden
    />
  );
}
