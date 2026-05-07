const tokens = [
  'WHISPER · TALK',
  'WT-7P3X-K4MN-9B2L-X8QF',
  'LIFETIME LICENSE',
  '<300MS LATENCY',
  'GROQ WHISPER LARGE V3',
  'WINDOWS 10 / 11',
  'CONTEXT-AWARE CLEANUP',
  'ONE DEVICE AT A TIME',
  'NO SUBSCRIPTION',
  'OPEN SOURCE CORE'
];

export function Marquee() {
  const row = tokens.join('   ✦   ');
  return (
    <div className="border-y border-paper-trace py-3 overflow-hidden bg-ink/40 backdrop-blur-sm">
      <div className="marquee flex whitespace-nowrap font-mono text-[11px] uppercase-track text-paper-mute">
        <span className="px-8">{row}</span>
        <span className="px-8">{row}</span>
        <span className="px-8">{row}</span>
      </div>
    </div>
  );
}
