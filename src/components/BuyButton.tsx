'use client';

const WHOP_CHECKOUT = 'https://whop.com/checkout/plan_Oh4HMckTmxXcE';

export function BuyButton({
  className,
  children,
  variant = 'primary'
}: {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'inline';
}) {
  if (variant === 'inline') {
    return (
      <a
        href={WHOP_CHECKOUT}
        className={`group inline-flex items-center gap-2 font-mono text-[11px] uppercase-track text-ember hover:text-ember-soft transition-colors ${className ?? ''}`}
      >
        {children ?? 'Buy lifetime'}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </a>
    );
  }

  return (
    <a
      href={WHOP_CHECKOUT}
      className={`group inline-flex items-center gap-3 bg-ember hover:bg-ember-soft text-ink font-medium px-6 py-3.5 rounded-lg transition-all ${className ?? ''}`}
    >
      <span className="font-display text-2xl leading-none">$49</span>
      <span className="block w-px h-6 bg-ink/20" />
      <span className="font-mono text-[12px] uppercase-track">Buy lifetime →</span>
    </a>
  );
}
