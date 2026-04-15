/**
 * FX conversion with mocked rates.
 * All rates are AED-based (1 AED = X foreign currency).
 * Replace with a live rates API in Phase 4+.
 */
import type { AmountObject, Currency } from "@/types";

// ─── Rates ─────────────────────────────────────────────────────────────────────
// Rates as of 2026-04-15 (mocked — not live).

/** How many units of <currency> you get for 1 AED. */
export const FX_RATES: Record<Currency, number> = {
  AED: 1.0,
  USD: 0.2723,
  EUR: 0.2498,
  GBP: 0.2141,
};

/** Spread applied to FX conversions (0.5%). */
const FX_SPREAD = 0.005;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(value: number, currency: Currency): string {
  const locales: Record<Currency, string> = {
    AED: "en-AE",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
  };
  return new Intl.NumberFormat(locales[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Converts an AmountObject to a target currency using mocked FX rates.
 *
 * @param amount     Source amount
 * @param toCurrency Target currency
 * @param applySpread Whether to apply the FX spread (default true)
 */
export function convertFX(
  amount: AmountObject,
  toCurrency: Currency,
  applySpread = true,
): AmountObject {
  if (amount.currency === toCurrency) return amount;

  // Convert source → AED → target
  const toAED = amount.value / FX_RATES[amount.currency];
  const rawRate = FX_RATES[toCurrency];
  const effectiveRate = applySpread ? rawRate * (1 - FX_SPREAD) : rawRate;
  const converted = toAED * effectiveRate;

  return {
    value: converted,
    currency: toCurrency,
    formatted: formatAmount(converted, toCurrency),
  };
}

/**
 * Returns the mid-market exchange rate between two currencies.
 * e.g. rateFor("AED", "USD") → 0.2723
 */
export function rateFor(from: Currency, to: Currency): number {
  if (from === to) return 1;
  const toAED = 1 / FX_RATES[from];
  return toAED * FX_RATES[to];
}

/**
 * Returns a display-friendly rate string.
 * e.g. "1 AED = 0.2723 USD"
 */
export function rateLabel(from: Currency, to: Currency): string {
  const rate = rateFor(from, to);
  return `1 ${from} = ${rate.toFixed(4)} ${to}`;
}

/**
 * Builds an AmountObject from a raw number and currency.
 */
export function makeAmount(value: number, currency: Currency): AmountObject {
  return { value, currency, formatted: formatAmount(value, currency) };
}
