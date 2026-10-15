import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ResellerBuyButton } from './buy-button';
import { HalloweenCountdown } from './halloween-countdown';
import {
  saleActive,
  resellerPriceCents,
  appPriceCents,
  APP_RETAIL_CENTS,
  RESELLER_RETAIL_CENTS,
  fmtCents
} from '@/lib/sale';

export const metadata = {
  title: 'Reseller program — WisperTalk',
  description:
    'One-time reseller license. Generate unlimited WisperTalk lifetime keys, sell at any price, keep every dollar. Halloween deal: $720 until Nov 1 (retail $997).'
};

const steps = [
  ['01', 'Buy the reseller license', 'One payment, no revenue share, no per-key fees, ever.'],
  ['02', 'Get your private dashboard', 'We email you a link the moment your payment clears. That link is your login — bookmark it.'],
  ['03', 'Generate keys and sell', 'Create a lifetime license key per customer, at whatever price you set. We can email the key straight to your customer for you.']
];

const terms = [
  ['Unlimited keys', 'Generate as many lifetime license keys as you want. Each key works exactly like a retail key: one device at a time, all future updates.'],
  ['Your price, your customers', 'Sell at any price, on any channel — your site, your newsletter, in person. The customer relationship is yours.'],
  ['Instant delivery', 'Keys generate in one click. Optionally have us email the key and download link directly to your customer from our domain.'],
  ['Fair use', "Don't present yourself as the official WisperTalk store, don't spam, don't sell on scammy marketplaces. Fraud or abuse terminates the reseller license without refund."],
  ['Refunds', 'Your customers are yours to refund — you set your own refund policy. Keys you generated stay active even if you refund your buyer. The reseller fee itself is refundable within 30 days only if you have not generated any keys yet.']
];

export default function ResellerPage() {
  const sale = saleActive();
  const price = fmtCents(resellerPriceCents());
  const retail = fmtCents(RESELLER_RETAIL_CENTS);
  const keyPrice = fmtCents(appPriceCents());
  // Break-even selling keys at the current retail price
  const breakEven = Math.ceil(resellerPriceCents() / appPriceCents());

  return (
    <main className="min-h-screen grain">
      <Nav />

      <section className="px-6 lg:px-10 pt-20 lg:pt-28 pb-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-mono text-[11px] uppercase-track text-paper-faint">Reseller program</span>
            <div className="hairline flex-1" />
          </div>

          <h1 className="font-display text-6xl sm:text-8xl lg:text-9xl leading-[0.9] tracking-tight text-balance mb-8">
            Sell WisperTalk.<br />
            <em className="text-ember">Keep every dollar.</em>
          </h1>

          <p className="text-paper-mute text-[17px] leading-relaxed max-w-xl mb-8 text-pretty">
            {sale ? (
              <>
                Our Halloween deal is the <em className="text-ember not-italic">talk of the town</em>:{' '}
                <span className="text-paper">{price}</span> until Nov 1 (normally {retail}) makes you an
                authorized reseller. Generate unlimited lifetime license keys from your own dashboard and
                sell them at any price you want. No revenue share. No per-key fees. No subscription.
              </>
            ) : (
              <>
                One payment of {retail} makes you an authorized reseller. Generate unlimited lifetime
                license keys from your own dashboard and sell them at any price you want. No revenue
                share. No per-key fees. No subscription.
              </>
            )}
          </p>

          {sale && (
            <div className="mb-10">
              <HalloweenCountdown />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-6 mb-6">
            <ResellerBuyButton />
            <span className="font-mono text-[11px] text-paper-faint leading-relaxed max-w-[240px]">
              Whop checkout · dashboard link delivered by email after payment
            </span>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-10 py-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex items-baseline gap-4 mb-12">
            <span className="font-mono text-[11px] uppercase-track text-paper-faint">01 / How it works</span>
            <div className="hairline flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map(([num, title, body]) => (
              <div key={num} className="rounded-xl border border-paper-trace bg-ink-2/40 p-7">
                <div className="font-mono text-[11px] uppercase-track text-ember mb-4">{num}</div>
                <div className="font-display text-2xl mb-2 leading-tight">{title}</div>
                <p className="text-paper-mute text-[13.5px] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-10 py-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex items-baseline gap-4 mb-12">
            <span className="font-mono text-[11px] uppercase-track text-paper-faint">02 / The math</span>
            <div className="hairline flex-1" />
          </div>

          <div className="rounded-xl border border-ember/40 bg-ember/5 p-8 lg:p-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <div className="font-display text-6xl lg:text-7xl text-ember leading-none mb-2">{breakEven}</div>
                <div className="font-mono text-[11px] uppercase-track text-paper-mute">
                  sales at {keyPrice} to break even
                </div>
              </div>
              <div>
                <div className="font-display text-6xl lg:text-7xl text-ember leading-none mb-2">$0</div>
                <div className="font-mono text-[11px] uppercase-track text-paper-mute">per-key cost after that</div>
              </div>
              <div>
                <div className="font-display text-6xl lg:text-7xl text-ember leading-none mb-2">100%</div>
                <div className="font-mono text-[11px] uppercase-track text-paper-mute">of every sale you keep</div>
              </div>
            </div>
            <p className="text-paper-mute text-[14px] leading-relaxed mt-8 max-w-2xl">
              Retail price is {fmtCents(APP_RETAIL_CENTS)} per lifetime license ({keyPrice} until
              Nov 1 in the Halloween deal) — sell at that and {breakEven} sales covers the reseller
              fee. Sale {breakEven + 1} onward is pure margin. Price it higher, bundle it, use it as
              a lead magnet for your own products — it's your call.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-10 py-16">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex items-baseline gap-4 mb-12">
            <span className="font-mono text-[11px] uppercase-track text-paper-faint">03 / The deal, plainly</span>
            <div className="hairline flex-1" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
            {terms.map(([title, body]) => (
              <div key={title} className="py-6 border-b border-paper-trace">
                <div className="font-display text-2xl mb-2">{title}</div>
                <p className="text-paper-mute text-[14px] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-10 py-20 lg:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="rounded-xl border border-ember/40 bg-ember/5 p-8 lg:p-14 text-center">
            <h2 className="font-display text-4xl sm:text-6xl leading-[0.95] tracking-tight mb-4">
              {sale ? (
                <>
                  <em className="text-ember">{price}</em> until Nov 1.{' '}
                  <span className="line-through opacity-50">{retail}</span> after.
                </>
              ) : (
                <>
                  <em className="text-ember">{retail}</em> once. Unlimited keys forever.
                </>
              )}
            </h2>
            <p className="text-paper-mute text-[15px] leading-relaxed max-w-lg mx-auto mb-10">
              {sale
                ? 'The talk of the town, at a scary-good price. Payment clears → dashboard link lands in your inbox → you can sell your first license within two minutes.'
                : 'Payment clears → dashboard link lands in your inbox → you can sell your first license within two minutes.'}
            </p>
            <ResellerBuyButton />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
