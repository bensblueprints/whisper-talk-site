'use client';

const WHOP_LIFETIME = 'https://whop.com/checkout/plan_Oh4HMckTmxXcE';
const WHOP_ADDON = 'https://whop.com/checkout/plan_fiK0F85A7ml2P';

export function PricingBuy() {
  return (
    <div className="flex flex-col gap-4 max-w-[440px]">
      <a
        href={WHOP_LIFETIME}
        className="group inline-flex items-center gap-3 bg-ember hover:bg-ember-soft text-ink font-medium px-6 py-3.5 rounded-lg transition-all"
      >
        <span className="font-display text-2xl leading-none">$49</span>
        <span className="block w-px h-6 bg-ink/20" />
        <span className="font-mono text-[12px] uppercase-track">Buy lifetime →</span>
      </a>

      <p className="font-mono text-[11px] text-paper-faint leading-relaxed">
        Need a second device?{' '}
        <a href={WHOP_ADDON} className="text-ember hover:text-ember-soft transition-colors">
          Add an extra license for $10 →
        </a>
      </p>
    </div>
  );
}
