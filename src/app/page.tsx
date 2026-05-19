import { Nav } from '@/components/Nav';
import { Waveform } from '@/components/Waveform';
import { LicenseReveal } from '@/components/LicenseReveal';
import { BuyButton } from '@/components/BuyButton';
import { PlatformSwitcher } from '@/components/PlatformSwitcher';
import { Marquee } from '@/components/Marquee';
import { HowItWorks } from '@/components/HowItWorks';
import { Comparison } from '@/components/Comparison';
import { Pricing } from '@/components/Pricing';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';

export default function Page() {
  return (
    <main className="min-h-screen grain relative">
      <BackgroundGrid />
      <Nav />
      <Hero />
      <Marquee />
      <HowItWorks />
      <Comparison />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}

function BackgroundGrid() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none opacity-[0.045] z-0"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(244,241,234,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,241,234,0.4) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, black, transparent)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, black, transparent)'
      }}
    />
  );
}

function Hero() {
  return (
    <section className="relative px-6 lg:px-10 pt-12 pb-24 lg:pt-20 lg:pb-32 z-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-8 rise" style={{ animationDelay: '60ms' }}>
              <span className="block w-2 h-2 rounded-full bg-ember pulse-ember" />
              <span className="font-mono text-[11px] uppercase-track text-paper-mute">
                01 / Voice dictation · Windows + Mac · v0.3
              </span>
            </div>

            <h1
              className="font-display text-[64px] sm:text-[80px] lg:text-[112px] leading-[0.9] tracking-tight text-balance rise"
              style={{ animationDelay: '160ms' }}
            >
              Type with <em className="text-ember">your</em>
              <br />
              voice. <PlatformSwitcher />
            </h1>

            <p
              className="text-paper-mute text-[16px] sm:text-[18px] leading-[1.55] max-w-xl mt-8 text-pretty rise"
              style={{ animationDelay: '320ms' }}
            >
              A small, fast dictation app that turns rough speech into clean text inside whatever
              you're typing in. Hold a key, talk, release. Cleanup happens before the words land.
              Start free — <em className="not-italic text-paper">2,000 words a month</em> at no cost.
              Upgrade once for <em className="not-italic text-paper">$49</em> and get unlimited words, forever.
            </p>

            <div
              className="mt-10 flex flex-wrap items-center gap-6 rise"
              style={{ animationDelay: '480ms' }}
            >
              <BuyButton />
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase-track text-paper hover:text-ember-soft transition-colors"
              >
                See how it works
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>

            <div
              className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 rise"
              style={{ animationDelay: '640ms' }}
            >
              <Chip label="Free 2k words/mo" />
              <Chip label="Windows 10/11" />
              <Chip label="macOS 11+" />
              <Chip label="Apple Silicon + Intel" />
              <Chip label="<300ms" />
              <Chip label="Groq · Ollama" />
            </div>
          </div>

          <div
            className="lg:col-span-5 lg:sticky lg:top-12 fade"
            style={{ animationDelay: '720ms' }}
          >
            <WaveformPanel />
            <div className="mt-5">
              <LicenseReveal />
            </div>
            <div className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase-track text-paper-faint">
              <span>signal · live</span>
              <span className="flex items-center gap-1.5">
                <span className="block w-1.5 h-1.5 rounded-full bg-violet" />
                ambient pattern
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WaveformPanel() {
  return (
    <div className="relative rounded-xl border border-paper-trace bg-ink-2/80 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-paper-trace flex items-center justify-between">
        <span className="font-display italic text-paper-mute text-lg leading-none">Listening</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase-track text-paper-faint">RIGHT ALT</span>
          <span className="block w-2 h-2 rounded-full bg-ember animate-pulse" />
        </div>
      </div>
      <div className="px-4 py-6">
        <Waveform height={140} />
      </div>
      <div className="px-5 py-3 border-t border-paper-trace flex items-baseline justify-between">
        <span className="font-mono text-[11px] text-paper-mute tabular-nums">
          12.4 <span className="text-paper-faint">kHz</span>
          <span className="text-paper-faint mx-2">·</span>
          mono
        </span>
        <span className="font-mono text-[11px] text-paper-faint tabular-nums">00:00:03.421</span>
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span className="font-mono text-[11px] uppercase-track text-paper-mute flex items-center gap-2">
      <span className="block w-1 h-1 rounded-full bg-paper-faint" />
      {label}
    </span>
  );
}
