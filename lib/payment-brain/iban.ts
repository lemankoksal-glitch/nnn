/**
 * IBAN validation using the official ISO 13616 algorithm (mod-97).
 * Pure functions — no I/O, no side effects.
 *
 * References:
 *   https://www.swift.com/standards/data-standards/iban-international-bank-account-number
 *   https://en.wikipedia.org/wiki/International_Bank_Account_Number
 */

/** Expected IBAN length by country code (subset — UAE + common destinations). */
const IBAN_LENGTHS: Record<string, number> = {
  AE: 23, // UAE
  GB: 22, // United Kingdom
  DE: 22, // Germany
  FR: 27, // France
  SA: 24, // Saudi Arabia
  US: 0,  // US does not use IBAN — always invalid here
  IN: 0,  // India does not use IBAN
  NL: 18, // Netherlands
  BE: 16, // Belgium
  CH: 21, // Switzerland
  IT: 27, // Italy
  ES: 24, // Spain
  PL: 28, // Poland
  SE: 24, // Sweden
  DK: 18, // Denmark
  NO: 15, // Norway
  AU: 0,  // Australia does not use IBAN
  SG: 0,  // Singapore does not use IBAN
  PH: 0,  // Philippines does not use IBAN
  PK: 24, // Pakistan
  BD: 0,  // Bangladesh does not use IBAN
  EG: 29, // Egypt
  JO: 30, // Jordan
  KW: 30, // Kuwait
  BH: 22, // Bahrain
  QA: 29, // Qatar
  OM: 23, // Oman
};

/**
 * Computes big-integer modulo via chunked string processing.
 * JavaScript's native numbers lose precision on numbers > 2^53.
 */
function bigMod(numStr: string, divisor: number): number {
  let remainder = 0;
  for (const ch of numStr) {
    remainder = (remainder * 10 + parseInt(ch, 10)) % divisor;
  }
  return remainder;
}

/**
 * Converts an IBAN to the numeric string required for mod-97 check:
 *   1. Move the first 4 characters to the end.
 *   2. Replace each letter with its numeric equivalent (A=10, B=11, …, Z=35).
 */
function ibanToNumericString(iban: string): string {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  return rearranged
    .toUpperCase()
    .split("")
    .map((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 65 && code <= 90 ? (code - 55).toString() : ch;
    })
    .join("");
}

/**
 * Returns true if the IBAN passes the ISO 13616 format and mod-97 check.
 *
 * Note: Some mock IBANs in mocks/data.ts are structurally valid UAE IBANs
 * but may not pass the full checksum (they are seeded for UI testing).
 * The validateIBAN function is applied to *user-entered* IBANs in the
 * add-beneficiary flow.
 */
export function validateIBAN(raw: string): boolean {
  const iban = raw.replace(/\s+/g, "").toUpperCase();

  // Must be alphanumeric only
  if (!/^[A-Z0-9]+$/.test(iban)) return false;

  const country = iban.slice(0, 2);

  // Country must be letters
  if (!/^[A-Z]{2}$/.test(country)) return false;

  // Country not supporting IBANs
  const expectedLength = IBAN_LENGTHS[country];
  if (expectedLength === 0) return false;

  // Length check (if we know the country)
  if (expectedLength !== undefined && iban.length !== expectedLength) {
    return false;
  }

  // Minimum sanity length
  if (iban.length < 5) return false;

  // Mod-97 check
  return bigMod(ibanToNumericString(iban), 97) === 1;
}

/**
 * Returns true if the IBAN belongs to a country other than the UAE.
 * Used to trigger the international-transfer purpose-of-payment question.
 */
export function isIntlIBAN(raw: string): boolean {
  const iban = raw.replace(/\s+/g, "").toUpperCase();
  return !iban.startsWith("AE");
}

/**
 * Formats an IBAN for display with spaces in groups of 4.
 * e.g. "AE600331000000000000000" → "AE60 0331 0000 0000 0000 000"
 */
export function formatIBAN(raw: string): string {
  const clean = raw.replace(/\s+/g, "").toUpperCase();
  return clean.match(/.{1,4}/g)?.join(" ") ?? clean;
}

/**
 * Returns a human-readable country name for the IBAN country code.
 */
export function ibanCountry(raw: string): string {
  const code = raw.replace(/\s+/g, "").toUpperCase().slice(0, 2);
  const names: Record<string, string> = {
    AE: "UAE",
    GB: "United Kingdom",
    DE: "Germany",
    FR: "France",
    SA: "Saudi Arabia",
    NL: "Netherlands",
    BE: "Belgium",
    CH: "Switzerland",
    IT: "Italy",
    ES: "Spain",
    SE: "Sweden",
    DK: "Denmark",
    NO: "Norway",
    PK: "Pakistan",
    EG: "Egypt",
    JO: "Jordan",
    KW: "Kuwait",
    BH: "Bahrain",
    QA: "Qatar",
    OM: "Oman",
    PL: "Poland",
  };
  return names[code] ?? code;
}
