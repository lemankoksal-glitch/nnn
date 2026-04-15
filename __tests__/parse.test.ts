/**
 * Unit tests for lib/payment-brain/parse.ts
 *
 * Each test group pins the exact parser behaviour that the conversational-flow
 * tests build on. If a parse test fails, the corresponding flow test will fail
 * for the same reason — these are the lower-level anchors.
 */

import { describe, it, expect } from "vitest";
import {
  parseIntent,
  parseAmount,
  parseRecipient,
  parseBiller,
} from "@/lib/payment-brain/parse";

// ─── parseIntent ──────────────────────────────────────────────────────────────

describe("parseIntent", () => {
  it("TRANSFER_MONEY — 'send AED 500 to Ali for rent'", () => {
    expect(parseIntent("Send AED 500 to Ali for rent")).toBe("TRANSFER_MONEY");
  });

  it("TRANSFER_MONEY — 'send 350 euro to Ali'", () => {
    expect(parseIntent("Send 350 euro to Ali")).toBe("TRANSFER_MONEY");
  });

  it("TRANSFER_MONEY — 'send AED 2,350,000 to Zurich Capital Partners'", () => {
    expect(parseIntent("Send AED 2,350,000 to Zurich Capital Partners")).toBe(
      "TRANSFER_MONEY",
    );
  });

  it("TRANSFER_MONEY — 'send 2350000' (amount keyword, no recipient)", () => {
    expect(parseIntent("send 2350000")).toBe("TRANSFER_MONEY");
  });

  it("GENERAL_QUERY — bare number '2350000' (no verb) is not a transfer intent", () => {
    // The parser requires a transfer verb; a bare number falls through to GENERAL_QUERY.
    // This is a known limitation — see the flow test for the full behaviour.
    expect(parseIntent("2350000")).toBe("GENERAL_QUERY");
  });

  it("PAY_BILL — 'Pay my Etisalat bill'", () => {
    expect(parseIntent("Pay my Etisalat bill")).toBe("PAY_BILL");
  });

  it("AFFORD_QUERY — 'Can I afford a new iPhone'", () => {
    expect(parseIntent("Can I afford a new iPhone")).toBe("AFFORD_QUERY");
  });

  it("GENERAL_QUERY — Arabic input 'أرسل ٥٠٠ درهم لعلي' (no English patterns)", () => {
    // Current limitation: intent patterns are English-only. Arabic text falls
    // through to GENERAL_QUERY. Tracked for future i18n work.
    expect(parseIntent("أرسل ٥٠٠ درهم لعلي")).toBe("GENERAL_QUERY");
  });
});

// ─── parseAmount ──────────────────────────────────────────────────────────────

describe("parseAmount", () => {
  it("parses AED 500 from 'Send AED 500 to Ali for rent'", () => {
    const amt = parseAmount("Send AED 500 to Ali for rent");
    expect(amt?.value).toBe(500);
    expect(amt?.currency).toBe("AED");
  });

  it("parses EUR 350 from 'Send 350 euro to Ali'", () => {
    const amt = parseAmount("Send 350 euro to Ali");
    expect(amt?.value).toBe(350);
    expect(amt?.currency).toBe("EUR");
  });

  it("parses AED 2 350 000 from comma-formatted string", () => {
    const amt = parseAmount("Send AED 2,350,000 to Zurich Capital Partners");
    expect(amt?.value).toBe(2_350_000);
    expect(amt?.currency).toBe("AED");
  });

  it("parses AED 2 350 000 from bare numeric string 'send 2350000'", () => {
    const amt = parseAmount("send 2350000");
    expect(amt?.value).toBe(2_350_000);
    expect(amt?.currency).toBe("AED");
  });

  it("returns null for 'Can I afford a new iPhone' (no numeric value)", () => {
    expect(parseAmount("Can I afford a new iPhone")).toBeNull();
  });

  it("returns null for Arabic-Indic numerals '٥٠٠' (not matched by ASCII \\d)", () => {
    // Arabic-Indic digit characters (U+0660–U+0669) are not matched by the
    // current regex. This is a known limitation documented by this test.
    expect(parseAmount("أرسل ٥٠٠ درهم لعلي")).toBeNull();
  });

  it("parses AED 5000 from an afford-query with an amount", () => {
    const amt = parseAmount("Can I afford AED 5000");
    expect(amt?.value).toBe(5_000);
    expect(amt?.currency).toBe("AED");
  });
});

// ─── parseRecipient ───────────────────────────────────────────────────────────

describe("parseRecipient", () => {
  it("'Send AED 500 to Ali for rent' → captures 'Ali for rent' (greedy to end-of-string)", () => {
    // The 'to … for' pattern is greedy: the lookahead only fires at a digit,
    // punctuation, or end-of-string. "rent" sits at end-of-string, so the full
    // phrase 'Ali for rent' is captured, not just 'Ali'.
    // Practical effect: the add-beneficiary form is pre-filled with 'Ali for rent'.
    expect(parseRecipient("Send AED 500 to Ali for rent")).toBe("Ali for rent");
  });

  it("'Send 350 euro to Ali' → 'Ali'", () => {
    expect(parseRecipient("Send 350 euro to Ali")).toBe("Ali");
  });

  it("'Send AED 2,350,000 to Zurich Capital Partners' → 'Zurich Capital Partners'", () => {
    expect(parseRecipient("Send AED 2,350,000 to Zurich Capital Partners")).toBe(
      "Zurich Capital Partners",
    );
  });

  it("'send 2350000' (no recipient) → null", () => {
    expect(parseRecipient("send 2350000")).toBeNull();
  });

  it("Arabic 'أرسل ٥٠٠ درهم لعلي' → null (no English to/for keyword)", () => {
    expect(parseRecipient("أرسل ٥٠٠ درهم لعلي")).toBeNull();
  });
});

// ─── parseBiller ─────────────────────────────────────────────────────────────

describe("parseBiller", () => {
  it("'Pay my Etisalat bill' → 'Etisalat'", () => {
    expect(parseBiller("Pay my Etisalat bill")).toBe("Etisalat");
  });

  it("case-insensitive: 'pay etisalat' → 'Etisalat'", () => {
    expect(parseBiller("pay etisalat")).toBe("Etisalat");
  });

  it("'Pay DEWA' → 'Dewa'", () => {
    expect(parseBiller("Pay DEWA")).toBe("Dewa");
  });

  it("unknown biller → null", () => {
    expect(parseBiller("Pay my electricity bill")).toBeNull();
  });
});
