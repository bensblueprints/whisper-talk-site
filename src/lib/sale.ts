// Reseller license Halloween sale: $997 retail, $720 until Nov 1 2026.
export const RESELLER_RETAIL_CENTS = 99700;
export const RESELLER_SALE_CENTS = 72000;
// Sale ends when Nov 1 2026 begins, Pacific time (still PDT, -07:00).
export const SALE_ENDS = new Date('2026-11-01T00:00:00-07:00').getTime();

export function saleActive(now: number = Date.now()): boolean {
  return now < SALE_ENDS;
}

export function resellerPriceCents(now?: number): number {
  const override = Number(process.env.RESELLER_PRICE_CENTS || 0);
  if (override > 0) return override;
  return saleActive(now) ? RESELLER_SALE_CENTS : RESELLER_RETAIL_CENTS;
}
