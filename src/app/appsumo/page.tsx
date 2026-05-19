import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'WisperTalk — AppSumo Deal',
  description: 'Claim your WisperTalk lifetime license from AppSumo. $29 once, unlimited voice dictation for Windows and Mac.'
};

const steps = [
  {
    n: '01',
    title: 'Check your email',
    body: 'AppSumo sent your WisperTalk license key to the email on your AppSumo account. Search for "WisperTalk" if you can\'t find it.'
  },
  {
    n: '02',
    title: 'Download the app',
    body: 'Install WisperTalk for Windows or Mac from the link below. It\'s about 80 MB and opens in seconds.'
  },
  {
    n: '03',
    title: 'Enter your key',
    body: 'When the app opens, click "Enter license key" in the tray menu. Paste your key and hit Activate. That\'s it — unlimited dictation, yours forever.'
  }
];

const includes = [
  'Unlimited voice dictation — no monthly word cap',
  'Windows 10/11 and macOS 11+ (Apple Silicon + Intel)',
  'Hold a key to dictate, release to paste — under 300ms',
  'Groq Whisper cloud OR local Ollama — your choice',
  'Context-aware LLM cleanup before text lands',
  'All future updates included at no extra cost',
  'One device at a time — move freely between machines',
  'Human email support — reply to your license email'
];

const downloadBase =
  process.env.NEXT_PUBLIC_DOWNLOAD_URL ||
  'https://github.com/bensblueprints/wispertalk-releases/releases/latest';

export default function AppSumoPage() {
  return (
    <main className="min-h-screen grain">
      <Nav />

      <section className="px-6 lg:px-10 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="mx-auto max-w-[920px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-ember/40 bg-ember/[0.06] px-4 py-2 mb-8">
            <span className="block w-1.5 h-1.5 rounded-full bg-ember pulse-ember" />
            <span className="font-mono text-[11px] uppercase-track text-ember">AppSumo exclusive deal</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tight text-balance mb-6">
            Voice dictation.<br />
            <em className="text-ember">Yours forever.</em>
          </h1>

          <p className="text-paper-mute text-[16px] sm:text-[18px] leading-relaxed max-w-xl mb-3 text-pretty">
            You grabbed WisperTalk on AppSumo for <strong className="text-paper">$29 one time</strong> — no subscription, no renewal, no seat fees.
            Here's how to get started in under two minutes.
          </p>
          <p className="text-paper-faint font-mono text-[12px] mb-12">
            Regular price: $49 one-time · AppSumo price: <span className="text-ember">$29 lifetime</span>
          </p>

          {/* Steps */}
          <div className="border-t border-paper-trace mb-16">
            {steps.map((s) => (
              <div key={s.n} className="grid grid-cols-[auto_1fr] gap-6 py-8 border-b border-paper-trace">
                <span className="font-mono text-[11px] uppercase-track text-paper-faint pt-1">{s.n}</span>
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl mb-2">{s.title}</h2>
                  <p className="text-paper-mute text-[15px] leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Download CTAs */}
          <div className="mb-16">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-mono text-[11px] uppercase-track text-paper-faint">Download</span>
              <div className="hairline flex-1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <a
                href={downloadBase}
                className="group rounded-lg border border-ember/40 bg-ember/5 hover:bg-ember/10 p-6 transition-colors"
              >
                <div className="font-mono text-[10px] uppercase-track text-ember mb-2">Windows</div>
                <div className="font-display text-xl mb-1">Installer (.exe)</div>
                <div className="font-mono text-[11px] uppercase-track text-paper-mute group-hover:text-ember-soft transition-colors">
                  WisperTalk Setup →
                </div>
              </a>
              <a
                href={downloadBase}
                className="group rounded-lg border border-paper-trace hover:border-paper-faint p-6 transition-colors"
              >
                <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-2">macOS</div>
                <div className="font-display text-xl mb-1">Disk Image (.dmg)</div>
                <div className="font-mono text-[11px] uppercase-track text-paper-mute group-hover:text-paper transition-colors">
                  WisperTalk.dmg →
                </div>
              </a>
            </div>
          </div>

          {/* What's included */}
          <div className="rounded-xl border border-paper-trace bg-ink-2/60 p-8 mb-10">
            <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-6">Everything included in your AppSumo deal</div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {includes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14px] text-paper-mute">
                  <span className="text-ember mt-0.5 flex-shrink-0">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Lost your key? */}
          <div className="rounded-xl border border-paper-trace bg-ink-2/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-1">Can't find your key?</div>
              <p className="text-paper-mute text-[14px]">We can resend it to the email on your AppSumo account.</p>
            </div>
            <Link
              href="/redeem"
              className="flex-shrink-0 inline-flex items-center gap-2 font-mono text-[11px] uppercase-track text-ink bg-ember hover:bg-ember-soft px-5 py-2.5 rounded-md transition-colors"
            >
              Resend my key →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
