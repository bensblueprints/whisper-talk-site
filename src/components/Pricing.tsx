import { PricingBuy } from './PricingBuy';
import { CountdownTimer } from './CountdownTimer';

const includes = [
  ['lifetime updates', 'every release, free, forever'],
  ['one device at a time', 'move it freely between machines from the in-app license panel'],
  ['no account', 'your license key is your account'],
  ['open source core', 'inspect, fork, audit on github'],
  ['groq + ollama support', 'cloud or local — your choice'],
  ['email support', 'reply to your license email; a human reads it']
];

export function Pricing() {
  return (
    <section id="pricing" className="px-6 lg:px-10 py-24 lg:py-32 relative">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-baseline gap-4 mb-16">
          <span className="font-mono text-[11px] uppercase-track text-paper-faint">04 / Pricing</span>
          <div className="hairline flex-1" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tight text-balance mb-6">
              Start free. <em className="text-ember">Upgrade once.</em>
            </h2>
            <p className="text-paper-mute text-[16px] leading-relaxed max-w-lg mb-6 text-pretty">
              Download and get 2,000 free words every month — no credit card required. Ready for unlimited? Pay $49 once. No subscription, no seat math, every future update included.
            </p>

            <div className="mb-8">
              <CountdownTimer />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8 max-w-[440px]">
              <div className="rounded-xl border border-paper-trace bg-ink-2/40 p-4">
                <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-2">Free</div>
                <div className="font-display text-[32px] text-paper leading-none mb-1">$0</div>
                <div className="font-mono text-[11px] text-paper-faint mb-4">always</div>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="block w-1 h-1 rounded-full bg-paper-faint mt-2 flex-shrink-0" />
                    <span className="text-paper-mute text-[12.5px]">2,000 words / month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="block w-1 h-1 rounded-full bg-paper-faint mt-2 flex-shrink-0" />
                    <span className="text-paper-mute text-[12.5px]">No credit card needed</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-ember/40 bg-ember/5 p-4 relative">
                <div className="absolute top-2 right-2 font-mono text-[9px] uppercase-track text-ember bg-ember/10 px-2 py-0.5 rounded-full">Best value</div>
                <div className="font-mono text-[10px] uppercase-track text-paper-faint mb-2">Lifetime</div>
                <div className="font-display text-[32px] text-ember leading-none mb-1">$49</div>
                <div className="font-mono text-[11px] text-paper-faint mb-4">pay once</div>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="block w-1 h-1 rounded-full bg-ember mt-2 flex-shrink-0" />
                    <span className="text-paper-mute text-[12.5px]">Unlimited words</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="block w-1 h-1 rounded-full bg-ember mt-2 flex-shrink-0" />
                    <span className="text-paper-mute text-[12.5px]">All future updates</span>
                  </li>
                </ul>
              </div>
            </div>

            <PricingBuy />

            <p className="font-mono text-[11px] text-paper-faint mt-4 max-w-md leading-relaxed">
              Stripe checkout · 30-day refund · license sent to your email immediately
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl border border-paper-trace bg-ink-2/60 p-8">
              <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-paper-trace">
                <span className="font-display text-2xl">What you get</span>
                <span className="font-mono text-[10px] uppercase-track text-paper-faint">included</span>
              </div>

              <ul className="space-y-5">
                {includes.map(([title, desc]) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="block w-1.5 h-1.5 rounded-full bg-ember mt-2 flex-shrink-0" />
                    <div>
                      <div className="font-mono text-[11px] uppercase-track text-paper">{title}</div>
                      <div className="text-paper-mute text-[13px] leading-relaxed mt-0.5">{desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
