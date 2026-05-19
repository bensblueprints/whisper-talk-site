import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { RedeemForm } from './redeem-form';

export const metadata = {
  title: 'Resend license — WisperTalk',
  description: 'Lost your WisperTalk license key? Enter your email and we\'ll resend it instantly.'
};

export default function RedeemPage() {
  return (
    <main className="min-h-screen grain">
      <Nav />
      <section className="px-6 lg:px-10 py-20 lg:py-28">
        <div className="mx-auto max-w-[820px]">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-mono text-[11px] uppercase-track text-paper-faint">License recovery</span>
            <div className="hairline flex-1" />
          </div>

          <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] tracking-tight text-balance mb-6">
            Lost your <em className="text-ember">key?</em>
          </h1>

          <p className="text-paper-mute text-[15.5px] leading-relaxed max-w-xl mb-12">
            Enter the email you used when you purchased — on WisperTalk directly or through AppSumo.
            We'll resend your license key immediately.
          </p>

          <RedeemForm />

          <div className="mt-16 border-t border-paper-trace pt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-xl border border-paper-trace bg-ink-2/40 p-6">
              <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-2">Bought on AppSumo?</div>
              <p className="text-paper-mute text-[13.5px] leading-relaxed mb-4">
                Use the email on your AppSumo account. Your key was sent there when your purchase was confirmed.
              </p>
              <Link
                href="/appsumo"
                className="font-mono text-[11px] uppercase-track text-ember hover:text-ember-soft transition-colors"
              >
                AppSumo setup guide →
              </Link>
            </div>

            <div className="rounded-xl border border-paper-trace bg-ink-2/40 p-6">
              <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-2">Manage your license</div>
              <p className="text-paper-mute text-[13.5px] leading-relaxed mb-4">
                See which device your key is bound to, or move it to a new machine from the account page.
              </p>
              <Link
                href="/account"
                className="font-mono text-[11px] uppercase-track text-ember hover:text-ember-soft transition-colors"
              >
                Go to account →
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
