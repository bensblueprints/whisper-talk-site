import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const metadata = { title: 'Download — WisperTalk' };

export default function DownloadPage() {
  const downloadBase = process.env.NEXT_PUBLIC_DOWNLOAD_URL || 'https://github.com/bensblueprints/whisper-talk/releases/latest';

  return (
    <main className="min-h-screen grain">
      <Nav />
      <section className="px-6 lg:px-10 py-20 lg:py-28">
        <div className="mx-auto max-w-[820px]">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-mono text-[11px] uppercase-track text-paper-faint">Download</span>
            <div className="hairline flex-1" />
          </div>

          <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] tracking-tight text-balance mb-6">
            <em className="text-ember">WisperTalk</em><br />for Windows &amp; Mac.
          </h1>

          <p className="text-paper-mute text-[15.5px] leading-relaxed max-w-xl mb-12">
            Same app, same $49 lifetime license, two operating systems. Pick your platform below.
          </p>

          {/* Windows */}
          <div className="flex items-baseline gap-4 mb-5">
            <span className="font-mono text-[11px] uppercase-track text-paper-faint">Windows</span>
            <div className="hairline flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <a
              href={downloadBase}
              className="group rounded-lg border border-ember/40 bg-ember/5 hover:bg-ember/10 p-7 transition-colors"
            >
              <div className="font-mono text-[10px] uppercase-track text-ember mb-3">recommended</div>
              <div className="font-display text-3xl mb-2">Installer</div>
              <p className="text-paper-mute text-[13.5px] leading-relaxed mb-4">
                Standard NSIS installer. Adds Start Menu + Desktop shortcuts. Includes auto-update channel.
              </p>
              <div className="font-mono text-[11px] uppercase-track text-paper-mute group-hover:text-ember-soft transition-colors">
                WisperTalk Setup.exe →
              </div>
            </a>

            <a
              href={downloadBase}
              className="group rounded-lg border border-paper-trace hover:border-paper-faint p-7 transition-colors"
            >
              <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-3">portable</div>
              <div className="font-display text-3xl mb-2">Portable</div>
              <p className="text-paper-mute text-[13.5px] leading-relaxed mb-4">
                Single-file .exe — runs from a USB stick or any folder. No install, no registry changes.
              </p>
              <div className="font-mono text-[11px] uppercase-track text-paper-mute group-hover:text-paper transition-colors">
                WisperTalk-portable.exe →
              </div>
            </a>
          </div>

          {/* macOS */}
          <div className="flex items-baseline gap-4 mb-5">
            <span className="font-mono text-[11px] uppercase-track text-paper-faint">macOS</span>
            <div className="hairline flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <a
              href={downloadBase}
              className="group rounded-lg border border-ember/40 bg-ember/5 hover:bg-ember/10 p-7 transition-colors"
            >
              <div className="font-mono text-[10px] uppercase-track text-ember mb-3">apple silicon</div>
              <div className="font-display text-3xl mb-2">Mac (M1/M2/M3/M4)</div>
              <p className="text-paper-mute text-[13.5px] leading-relaxed mb-4">
                Native arm64 build for Apple Silicon. Drag to Applications and launch.
              </p>
              <div className="font-mono text-[11px] uppercase-track text-paper-mute group-hover:text-ember-soft transition-colors">
                WisperTalk-arm64.dmg →
              </div>
            </a>

            <a
              href={downloadBase}
              className="group rounded-lg border border-paper-trace hover:border-paper-faint p-7 transition-colors"
            >
              <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-3">intel</div>
              <div className="font-display text-3xl mb-2">Mac (Intel)</div>
              <p className="text-paper-mute text-[13.5px] leading-relaxed mb-4">
                x64 build for Intel-based Macs. Same features, same license.
              </p>
              <div className="font-mono text-[11px] uppercase-track text-paper-mute group-hover:text-paper transition-colors">
                WisperTalk-x64.dmg →
              </div>
            </a>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 mb-12">
            <div className="font-mono text-[10px] uppercase-track text-amber-300/90 mb-2">first-run note for mac</div>
            <p className="text-paper-mute text-[13.5px] leading-relaxed">
              We&rsquo;re not yet code-signed on macOS. The first time you launch WisperTalk, <strong className="text-paper">right-click the app in Applications and choose &ldquo;Open&rdquo;</strong> (instead of double-clicking) — this bypasses Gatekeeper. After that, it opens normally. You&rsquo;ll also be asked to grant Accessibility access in System Settings → Privacy &amp; Security so WisperTalk can paste transcribed text and listen for your hotkey.
            </p>
          </div>

          <div className="rounded-lg border border-paper-trace bg-ink-2 p-7">
            <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-3">requirements</div>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-[13px] text-paper-mute font-mono">
              <li>Windows 10 (1809+) or 11</li>
              <li>macOS 11 Big Sur or newer</li>
              <li>Microphone</li>
              <li>~120 MB disk</li>
              <li>~150 MB RAM</li>
              <li>Internet for first-run only</li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
