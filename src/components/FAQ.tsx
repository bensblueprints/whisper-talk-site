'use client';

import { useState } from 'react';

const items = [
  {
    q: 'How does "one device at a time" work?',
    a: 'When you enter your key on a new computer, WisperTalk asks the license server to bind that machine. If a different machine is already bound, the app shows you the bound device and lets you move the license — the old machine is deactivated immediately. There is no per-seat upsell; you can move as often as you like.'
  },
  {
    q: 'Does it work offline?',
    a: 'License verification happens once a week, so brief offline periods are fine. Transcription itself uses Groq by default (cloud), but you can point the app at a local Ollama instance for fully offline dictation. The license check is the only thing that ever needs internet.'
  },
  {
    q: 'Why pay $49 if FreeFlow is free on Mac?',
    a: 'FreeFlow on Mac is excellent and we recommend it. The Windows port required from-scratch engineering — different keyboard hooks, different paste mechanism, different audio APIs. The $49 covers continued development, license infrastructure, and a real human reading your support email. (Compared to two years of any Mac dictation subscription, you still come out ahead.)'
  },
  {
    q: 'What about my data?',
    a: 'Audio goes directly from the app to Groq (or your local Ollama). The WisperTalk license server only sees your email, payment confirmation, and a hashed device fingerprint. No audio, no transcripts, no usage data ever touches our servers.'
  },
  {
    q: 'Can I get a refund?',
    a: 'Yes — within 30 days, no questions, just reply to the license email. After 30 days the answer is "probably yes if there is a real reason." We are not in the business of trapping people.'
  },
  {
    q: 'Where does it run?',
    a: 'Windows 10 and Windows 11, x64. The app is around 80 MB installed and uses ~150 MB of RAM at idle. Microphone permission is required (Windows Privacy → Microphone → Allow desktop apps).'
  }
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="px-6 lg:px-10 py-24 lg:py-32 relative">
      <div className="mx-auto max-w-[920px]">
        <div className="flex items-baseline gap-4 mb-16">
          <span className="font-mono text-[11px] uppercase-track text-paper-faint">05 / Questions</span>
          <div className="hairline flex-1" />
        </div>

        <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-balance mb-16">
          You probably want to know.
        </h2>

        <div className="border-t border-paper-trace">
          {items.map((it, i) => (
            <div key={i} className="border-b border-paper-trace">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-baseline gap-6 py-6 text-left group"
              >
                <span className="font-mono text-[11px] uppercase-track text-paper-faint pt-1 flex-shrink-0">
                  Q.{String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-xl sm:text-2xl text-paper flex-1 group-hover:text-ember-soft transition-colors">
                  {it.q}
                </span>
                <span className={`font-mono text-paper-faint transition-transform flex-shrink-0 mt-1 ${open === i ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-out ${
                  open === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pb-7 pl-[calc(2.5rem+1.5rem)] pr-8">
                  <p className="text-paper-mute text-[15px] leading-relaxed text-pretty">{it.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
