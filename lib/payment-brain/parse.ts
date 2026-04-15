/**
 * Pure parsing functions — deterministic, no side effects, unit-testable.
 * All functions operate on raw user input strings.
 */
import type { IntentType, AmountObject, Currency } from "@/types";

// ─── Intent detection ──────────────────────────────────────────────────────────

const INTENT_PATTERNS: Array<[IntentType, RegExp]> = [
  // Order matters — more specific patterns first
  ["THANKS",            /\b(thank(s|\s+you)|thx|cheers|appreciate\s+it|great\s+(help|job)|awesome|perfect)\b/i],
  ["AFFORD_QUERY",      /\b(can\s+i\s+afford|enough\s+(for|to\s+buy)|do\s+i\s+have\s+enough|is\s+my\s+balance\s+enough)\b/i],
  ["FX_QUERY",          /\b(exchange\s+rate|fx\s+rate|how\s+much\s+is|convert|rate\s+for|what.?s\s+the\s+rate)\b/i],
  ["SPENDING_QUERY",    /\b(spend(ing)?\s+breakdown|what\s+did\s+i\s+spend|where\s+(did|am)\s+i\s+spend|spending\s+summary|budget|categories)\b/i],
  ["TRANSFER_MONEY",    /\b(send|transfer|wire|pay\s+someone|give|remit)\b/i],
  ["PAY_BILL",          /\b(pay\s+(my\s+)?(bill|etisalat|dewa|du|addc|sewa|telecom)|settle\s+(my\s+)?(bill|invoice))\b/i],
  ["CHECK_BALANCE",     /\b(balance|how\s+much|what.?s\s+in|funds|available|account\s+total)\b/i],
  ["VIEW_TRANSACTIONS", /\b(transaction|history|last\s+\d|recent\s+(payment|purchase))\b/i],
  ["FREEZE_CARD",       /\b(freeze|block|lock|suspend)\s+(my\s+)?(card|debit|credit)\b/i],
  ["DISPUTE_TRANSACTION", /\b(dispute|didn.?t\s+(make|do)|unauthorized|fraud|charge\s+back|not\s+mine)\b/i],
  ["GET_STATEMENT",     /\b(statement|download|pdf|export)\b/i],
];

/**
 * Returns the most likely intent for a given user message.
 * Falls back to GENERAL_QUERY if no pattern matches.
 */
export function parseIntent(text: string): IntentType {
  for (const [intent, pattern] of INTENT_PATTERNS) {
    if (pattern.test(text)) return intent;
  }
  return "GENERAL_QUERY";
}

// ─── Amount parsing ────────────────────────────────────────────────────────────

/**
 * Currency aliases found in user messages.
 * Order matters — check longer strings first.
 */
const CURRENCY_MAP: Array<[Currency, RegExp]> = [
  ["AED", /\b(aed|dirham[s]?|dhs?)\b/i],
  ["USD", /\b(usd|dollar[s]?|\$)\b/i],
  ["EUR", /\b(eur|euro[s]?|€)\b/i],
  ["GBP", /\b(gbp|pound[s]?|sterling|£)\b/i],
];

function detectCurrency(text: string): Currency {
  for (const [currency, pattern] of CURRENCY_MAP) {
    if (pattern.test(text)) return currency;
  }
  return "AED"; // Default for UAE context
}

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

/**
 * Extracts an amount from natural language.
 *
 * Handles:
 *   "send 500"            → AED 500.00
 *   "AED 1,500"           → AED 1500.00
 *   "1.5k dirhams"        → AED 1500.00
 *   "USD 200"             → USD 200.00
 *   "transfer half a million" → AED 500000.00
 *
 * Returns null if no amount can be parsed.
 */
export function parseAmount(text: string): AmountObject | null {
  const currency = detectCurrency(text);

  // Handle word-numbers
  const wordMap: Record<string, number> = {
    "half a million": 500_000,
    "a million": 1_000_000,
    "million": 1_000_000,
    "half a thousand": 500,
    "a thousand": 1_000,
    "thousand": 1_000,
    "hundred": 100,
  };
  for (const [word, val] of Object.entries(wordMap)) {
    const re = new RegExp(`\\b(\\d+\\.?\\d*)\\s*${word}\\b|\\b${word}\\b`, "i");
    const m = text.match(re);
    if (m) {
      const multiplier = m[1] ? parseFloat(m[1]) : 1;
      const value = multiplier * val;
      return { value, currency, formatted: formatAmount(value, currency) };
    }
  }

  // Handle "1.5k" / "2K"
  const kMatch = text.match(/\b(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    const value = parseFloat(kMatch[1]) * 1000;
    return { value, currency, formatted: formatAmount(value, currency) };
  }

  // Handle numeric patterns: 500, 1,500, 1500.00
  const numMatch = text.match(
    /(?:^|[\s,])(?:aed|usd|eur|gbp|dhs?|dirham[s]?|\$|€|£)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?:\s*(?:aed|usd|eur|gbp|dhs?|dirham[s]?))?(?:$|[\s,?!.])/i,
  );
  if (numMatch) {
    const value = parseFloat(numMatch[1].replace(/,/g, ""));
    if (value > 0) {
      return { value, currency, formatted: formatAmount(value, currency) };
    }
  }

  return null;
}

// ─── Recipient parsing ─────────────────────────────────────────────────────────

/** UAE / common international IBAN regex — used to detect raw IBANs in text. */
const IBAN_REGEX = /\b([A-Z]{2}\d{2}[A-Z0-9]{4,})\b/i;

/**
 * Extracts a recipient name or IBAN string from user input.
 *
 * Priority:
 *   1. Raw IBAN (e.g. "AE07 0331 …" or "GB82WEST…")
 *   2. "to [Name]" / "for [Name]" patterns
 *
 * Returns the raw string (name or IBAN) so the caller can resolve it.
 */
export function parseRecipient(text: string): string | null {
  // 1. IBAN in text
  const ibanMatch = text.match(IBAN_REGEX);
  if (ibanMatch) return ibanMatch[1].replace(/\s+/g, "").toUpperCase();

  // 2. "to <Name>" / "for <Name>" — stop before numbers, punctuation or end
  const toMatch = text.match(
    /\b(?:to|for)\s+([A-Za-z][A-Za-z\s'-]{1,40})(?=\s*(?:\d|$|[.,!?]))/i,
  );
  if (toMatch) return toMatch[1].trim();

  return null;
}

// ─── IBAN shape detector ───────────────────────────────────────────────────────

/** Returns true if the string looks like an IBAN (not necessarily valid). */
export function looksLikeIBAN(text: string): boolean {
  return IBAN_REGEX.test(text.trim());
}

// ─── Currency extractor (for FX queries) ──────────────────────────────────────

/**
 * Extracts the target currency from a phrase like:
 *   "What's the USD rate", "convert AED to EUR", "how much is 1 GBP"
 * Returns null if no recognised currency is found.
 */
export function parseFXCurrency(text: string): Currency | null {
  const patterns: Array<[Currency, RegExp]> = [
    ["USD", /\b(usd|dollar[s]?|\$)\b/i],
    ["EUR", /\b(eur|euro[s]?|€)\b/i],
    ["GBP", /\b(gbp|pound[s]?|sterling|£)\b/i],
  ];
  for (const [cur, re] of patterns) {
    if (re.test(text)) return cur;
  }
  return null;
}

// ─── Biller extractor (for PAY_BILL shortcut) ─────────────────────────────────

const KNOWN_BILLERS = ["etisalat", "dewa", "du", "addc", "sewa"] as const;
type KnownBiller = (typeof KNOWN_BILLERS)[number];

/**
 * Extracts a known biller name from a bill-payment phrase.
 * Returns null if the biller cannot be identified.
 */
export function parseBiller(text: string): string | null {
  const lower = text.toLowerCase();
  for (const biller of KNOWN_BILLERS) {
    if (lower.includes(biller)) {
      return biller.charAt(0).toUpperCase() + biller.slice(1);
    }
  }
  return null;
}
