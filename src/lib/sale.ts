// Halloween sale ends when Nov 1 2026 begins, Pacific time (still PDT, -07:00).
export const SALE_ENDS = new Date('2026-11-01T00:00:00-07:00').getTime();

export const APP_RETAIL_CENTS = 9900;
export const APP_SALE_CENTS = 4999;
export const RESELLER_RETAIL_CENTS = 99700;
export const RESELLER_SALE_CENTS = 72000;

export function saleActive(now: number = Date.now()): boolean {
  return now < SALE_ENDS;
}

export function appPriceCents(now?: number): number {
  return saleActive(now) ? APP_SALE_CENTS : APP_RETAIL_CENTS;
}

// Copy/fallback only — the charged price lives on the Whop plan itself.
export function resellerPriceCents(now?: number): number {
  const override = Number(process.env.RESELLER_PRICE_CENTS || 0);
  if (override > 0) return override;
  return saleActive(now) ? RESELLER_SALE_CENTS : RESELLER_RETAIL_CENTS;
}

export function fmtCents(c: number): string {
  return `$${(c / 100).toLocaleString('en-US', {
    minimumFractionDigits: c % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })}`;
}
