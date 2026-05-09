import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { AccountForm } from './account-form';

export const metadata = { title: 'Manage your license — WisperTalk' };

export default function AccountPage() {
  return (
    <main className="min-h-screen grain">
      <Nav />
      <section className="px-6 lg:px-10 py-20 lg:py-28">
        <div className="mx-auto max-w-[820px]">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-mono text-[11px] uppercase-track text-paper-faint">License lookup</span>
            <div className="hairline flex-1" />
          </div>

          <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] tracking-tight text-balance mb-6">
            <em className="text-ember">Find</em> your license.
          </h1>

          <p className="text-paper-mute text-[15.5px] leading-relaxed max-w-xl mb-12">
            Enter the email you bought with — we'll list every license on that email and the device each one is bound to.
          </p>

          <AccountForm />

          <div className="mt-16 pt-10 border-t border-paper-trace">
            <div className="rounded-xl border border-ember/40 bg-ember/5 p-7 sm:p-9">
              <div className="font-mono text-[11px] uppercase-track text-ember mb-3">
                Need more licenses?
              </div>
              <h2 className="font-display text-3xl sm:text-4xl mb-3 leading-tight">
                Add another device. <em className="text-ember">$10 each.</em>
              </h2>
              <p className="text-paper-mute text-[14.5px] leading-relaxed mb-6 max-w-lg">
                Buy as many additional license keys as you need. Each new key activates one more device.
                Same checkout — set the quantity stepper to whatever you want.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/#pricing"
                  className="inline-flex items-center gap-3 bg-ember hover:bg-ember-soft text-ink font-mono text-[12px] uppercase-track px-5 py-3 rounded-md transition-colors"
                >
                  Buy additional licenses →
                </Link>
                <Link
                  href="/download"
                  className="font-mono text-[11px] uppercase-track text-paper-mute hover:text-paper transition-colors"
                >
                  Download the app
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
