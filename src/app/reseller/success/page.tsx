import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { stripe } from '@/lib/stripe';
import {
  RESELLER_PRODUCT,
  createReseller,
  dashboardUrlFor,
  resellerBySession,
  resellerPriceCents
} from '@/lib/reseller';
import type { Reseller } from '@/db/schema';
import { CopyDashboardLink } from './copy-link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reseller purchase confirmed — WisperTalk' };

async function fetchReseller(sessionId: string, attempts = 8): Promise<Reseller | null> {
  for (let i = 0; i < attempts; i++) {
    const r = await resellerBySession(sessionId);
    if (r) return r;
    await new Promise((res) => setTimeout(res, 750));
  }
  return null;
}

export default async function ResellerSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  let reseller: Reseller | null = null;
  if (sessionId) {
    reseller = await fetchReseller(sessionId);

    // Webhook hasn't landed yet — create inline if the session is really paid.
    if (!reseller && stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (
          session.payment_status === 'paid' &&
          session.metadata?.product === RESELLER_PRODUCT
        ) {
          const email = session.customer_details?.email || session.customer_email;
          if (email) {
            reseller = await createReseller({
              email,
              name: session.customer_details?.name ?? null,
              stripeCustomerId:
                typeof session.customer === 'string' ? session.customer : null,
              stripeSessionId: session.id,
              stripePaymentIntentId:
                typeof session.payment_intent === 'string' ? session.payment_intent : null,
              amountCents: session.amount_total ?? resellerPriceCents(),
              currency: session.currency || 'usd'
            });
          }
        }
      } catch {}
    }
  }

  return (
    <main className="min-h-screen grain">
      <Nav />
      <section className="px-6 lg:px-10 py-20 lg:py-28">
        <div className="mx-auto max-w-[820px]">
          {reseller ? (
            <>
              <div className="flex items-center gap-3 mb-8">
                <span className="block w-2 h-2 rounded-full bg-ember pulse-ember" />
                <span className="font-mono text-[11px] uppercase-track text-paper-mute">
                  Payment received · Reseller license active
                </span>
              </div>

              <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] tracking-tight text-balance mb-6">
                <em className="text-ember">You're in.</em><br />
                Start selling.
              </h1>

              <p className="text-paper-mute text-[15.5px] leading-relaxed max-w-xl mb-12">
                Your dashboard link is below — we've also emailed it to{' '}
                <span className="font-mono text-paper">{reseller.email}</span>. The link itself
                is your login: bookmark it, keep it private, and never share it with customers.
              </p>

              <CopyDashboardLink
                url={dashboardUrlFor(reseller.accessToken)}
                email={reseller.email}
              />

              <div className="mt-12">
                <a
                  href={dashboardUrlFor(reseller.accessToken)}
                  className="inline-flex items-center gap-3 bg-ember hover:bg-ember-soft text-ink font-mono text-[12px] uppercase-track px-6 py-3.5 rounded-lg transition-colors"
                >
                  Open your dashboard →
                </a>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] tracking-tight mb-6">
                <em className="text-ember">One moment.</em>
              </h1>
              <div className="rounded-lg border border-paper-trace bg-ink-2 p-8">
                <div className="font-mono text-[11px] uppercase-track text-paper-faint mb-3">
                  Setting up your reseller account…
                </div>
                <p className="text-paper-mute text-[14px] leading-relaxed">
                  {sessionId
                    ? 'Your payment is confirmed but your reseller account is still being created (this usually takes a few seconds). Refresh this page in a moment, or check your inbox for the dashboard link.'
                    : 'It looks like you reached this page without a checkout session.'}
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/reseller"
                  className="font-mono text-[11px] uppercase-track text-ember hover:text-ember-soft"
                >
                  ← Back to the reseller page
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
