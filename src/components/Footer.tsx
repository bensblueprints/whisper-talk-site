import Link from 'next/link';

export function Footer() {
  return (
    <footer className="px-6 lg:px-10 pt-12 pb-10 border-t border-paper-trace">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-5">
            <div className="font-display text-3xl mb-3">
              <em className="text-ember">Whisper</em> Talk
            </div>
            <p className="text-paper-mute text-[14px] leading-relaxed max-w-sm">
              A small, fast voice-dictation tool for people who type for a living and refuse to pay rent on it.
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-4">Product</div>
            <ul className="space-y-2.5 text-[13px] text-paper-mute">
              <li><Link href="#how-it-works" className="hover:text-paper transition-colors">How it works</Link></li>
              <li><Link href="#pricing" className="hover:text-paper transition-colors">Pricing</Link></li>
              <li><Link href="/download" className="hover:text-paper transition-colors">Download</Link></li>
              <li><Link href="/account" className="hover:text-paper transition-colors">Manage license</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-4">Source</div>
            <ul className="space-y-2.5 text-[13px] text-paper-mute">
              <li><a href="https://github.com/bensblueprints/whisper-talk" target="_blank" rel="noopener" className="hover:text-paper transition-colors">GitHub repo</a></li>
              <li><a href="https://github.com/bensblueprints/whisper-talk/releases/latest" target="_blank" rel="noopener" className="hover:text-paper transition-colors">Releases</a></li>
              <li><a href="https://github.com/zachlatta/freeflow" target="_blank" rel="noopener" className="hover:text-paper transition-colors">FreeFlow (mac)</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-4">Contact</div>
            <ul className="space-y-2.5 text-[13px] text-paper-mute">
              <li>
                <a href="mailto:licenses@advancedmarketing.co" className="hover:text-paper transition-colors">
                  licenses@advancedmarketing.co
                </a>
              </li>
              <li className="font-mono text-[11px] text-paper-faint pt-2">
                advancedmarketing.co
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline mb-6" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[11px] uppercase-track text-paper-faint">
          <span>© 2026 Advanced Marketing · Built in BC</span>
          <span className="flex items-center gap-2">
            <span className="block w-1.5 h-1.5 rounded-full bg-ember pulse-ember" />
            <span>shipping ·  v0.1</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
