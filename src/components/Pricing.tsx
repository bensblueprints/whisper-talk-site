import { PricingBuy } from './PricingBuy';

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
              Pay once. <em className="text-ember">Use forever.</em>
            </h2>
            <p className="text-paper-mute text-[16px] leading-relaxed max-w-lg mb-10 text-pretty">
              No trial that expires, no subscription that creeps up, no seat math. One key, one device at a time, every update included.
            </p>

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
