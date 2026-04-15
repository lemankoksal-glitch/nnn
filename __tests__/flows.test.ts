/**
 * Conversational flow integration tests.
 *
 * Each `describe` block covers one sample conversation from the spec.
 * Inputs are the raw user messages; expected outputs are the brain's
 * deterministic TransitionResult (nextState, card type, message text).
 *
 * The payment brain (processSendMoney) is the source of truth.
 * These tests do NOT touch the API route or any AI adapter — those layers
 * only affect wording, not structure.
 *
 * Contact roster used: MOCK_CONTACTS (6 contacts — no "Ali" or "Zurich").
 * See mocks/data.ts for the full list.
 */

import { describe, it, expect } from "vitest";
import { processSendMoney, EMPTY_CONTEXT } from "@/lib/payment-brain/state-machine";
import type { SendMoneyContext } from "@/lib/payment-brain/state-machine";
import { MOCK_CONTACTS } from "@/mocks/data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Run a single USER_TEXT event from idle with no prior context. */
function fromIdle(text: string) {
  return processSendMoney("idle", EMPTY_CONTEXT, { type: "USER_TEXT", text }, MOCK_CONTACTS);
}

/** Find the first card in a result's message list. */
function firstCard(result: ReturnType<typeof fromIdle>) {
  return result.messages.find((m) => m.card)?.card ?? null;
}

/** Find the first text message in a result's message list. */
function firstText(result: ReturnType<typeof fromIdle>) {
  return result.messages.find((m) => m.text)?.text ?? "";
}

// ─── Flow 1: Send AED 500 to Ali for rent ─────────────────────────────────────

describe("Flow 1 — 'Send AED 500 to Ali for rent'", () => {
  const result = fromIdle("Send AED 500 to Ali for rent");

  it("transitions to got_amount (contact not found)", () => {
    expect(result.nextState).toBe("got_amount");
  });

  it("context holds AED 500", () => {
    expect(result.context.amount?.value).toBe(500);
    expect(result.context.amount?.currency).toBe("AED");
  });

  it("shows an add_beneficiary card", () => {
    expect(firstCard(result)?.type).toBe("add_beneficiary");
  });

  it("pre-fills 'Ali for rent' as the beneficiary name", () => {
    // The recipient regex captures the full phrase up to end-of-string.
    // 'rent' is included because the lookahead only fires before a digit,
    // punctuation, or end-of-string — and 'rent' sits at end-of-string.
    expect(firstCard(result)?.data.prefilledName).toBe("Ali for rent");
  });

  it("leaves the IBAN slot empty", () => {
    expect(firstCard(result)?.data.prefilledIban).toBe("");
  });

  it("reply mentions the unknown contact", () => {
    expect(firstText(result)).toContain("Ali for rent");
  });
});

// ─── Flow 2: Send 350 euro to Ali ─────────────────────────────────────────────

describe("Flow 2 — 'Send 350 euro to Ali'", () => {
  const result = fromIdle("Send 350 euro to Ali");

  it("transitions to got_amount (contact not found)", () => {
    expect(result.nextState).toBe("got_amount");
  });

  it("context holds EUR 350 (not AED)", () => {
    expect(result.context.amount?.value).toBe(350);
    expect(result.context.amount?.currency).toBe("EUR");
  });

  it("shows an add_beneficiary card", () => {
    expect(firstCard(result)?.type).toBe("add_beneficiary");
  });

  it("pre-fills 'Ali' as the beneficiary name (no trailing words)", () => {
    expect(firstCard(result)?.data.prefilledName).toBe("Ali");
  });

  it("reply text mentions 'Ali'", () => {
    expect(firstText(result)).toContain("Ali");
  });
});

// ─── Flow 3: Send AED 2,350,000 to Zurich Capital Partners ───────────────────

describe("Flow 3 — 'Send AED 2,350,000 to Zurich Capital Partners'", () => {
  const result = fromIdle("Send AED 2,350,000 to Zurich Capital Partners");

  it("transitions to got_amount", () => {
    expect(result.nextState).toBe("got_amount");
  });

  it("parses the full comma-formatted amount correctly", () => {
    expect(result.context.amount?.value).toBe(2_350_000);
    expect(result.context.amount?.currency).toBe("AED");
  });

  it("shows an add_beneficiary card for unknown corporate recipient", () => {
    expect(firstCard(result)?.type).toBe("add_beneficiary");
  });

  it("pre-fills the full corporate name", () => {
    expect(firstCard(result)?.data.prefilledName).toBe("Zurich Capital Partners");
  });
});

// ─── Flow 4a: Bare number '2350000' (no transfer verb) ───────────────────────

describe("Flow 4a — '2350000' (bare number, no verb)", () => {
  const result = fromIdle("2350000");

  it("stays idle — no transfer verb so intent resolves to GENERAL_QUERY", () => {
    // Known limitation: a bare amount without 'send/transfer/pay' is not
    // recognised as a transfer intent. The brain replies with a generic prompt
    // rather than starting a transfer flow.
    expect(result.nextState).toBe("idle");
  });

  it("returns no inline card", () => {
    expect(firstCard(result)).toBeNull();
  });

  it("reply is a generic help prompt, not a recipient question", () => {
    const text = firstText(result).toLowerCase();
    expect(text).toContain("help");
    // Must NOT behave as if it understood a transfer amount
    expect(text).not.toContain("who would you like");
  });
});

// ─── Flow 4b: 'send 2350000' — amount given, recipient asked ─────────────────

describe("Flow 4b — 'send 2350000' (amount without recipient)", () => {
  const result = fromIdle("send 2350000");

  it("transitions to got_amount", () => {
    expect(result.nextState).toBe("got_amount");
  });

  it("parses AED 2,350,000", () => {
    expect(result.context.amount?.value).toBe(2_350_000);
    expect(result.context.amount?.currency).toBe("AED");
  });

  it("returns no card — brain is waiting for the recipient", () => {
    expect(firstCard(result)).toBeNull();
  });

  it("asks who to send to", () => {
    const text = firstText(result).toLowerCase();
    expect(text).toMatch(/who|send it to|recipient/);
  });
});

// ─── Flow 4b continued: recipient step ───────────────────────────────────────

describe("Flow 4b step 2 — user supplies recipient after amount", () => {
  // Establish context from the amount step
  const step1 = fromIdle("send 2350000");
  const ctxAfterAmount: SendMoneyContext = step1.context;

  it("in got_amount state, user text is treated as a recipient query", () => {
    const step2 = processSendMoney(
      "got_amount",
      ctxAfterAmount,
      { type: "USER_TEXT", text: "Zurich Capital Partners" },
      MOCK_CONTACTS,
    );
    // Unknown recipient → add_beneficiary
    expect(step2.nextState).toBe("got_amount");
    expect(firstCard(step2)?.type).toBe("add_beneficiary");
    expect(step2.context.amount?.value).toBe(2_350_000); // amount preserved
  });
});

// ─── Flow 5: Pay my Etisalat bill ─────────────────────────────────────────────

describe("Flow 5 — 'Pay my Etisalat bill'", () => {
  const result = fromIdle("Pay my Etisalat bill");

  it("returns to idle — bill payment is a one-shot non-transfer flow", () => {
    expect(result.nextState).toBe("idle");
  });

  it("shows a bill_pay_confirm card", () => {
    expect(firstCard(result)?.type).toBe("bill_pay_confirm");
  });

  it("card is for Etisalat", () => {
    expect(firstCard(result)?.data.billerName).toBe("Etisalat");
  });

  it("reply text mentions the biller", () => {
    expect(firstText(result)).toContain("Etisalat");
  });
});

// ─── Flow 6: Can I afford a new iPhone ────────────────────────────────────────

describe("Flow 6 — 'Can I afford a new iPhone'", () => {
  const result = fromIdle("Can I afford a new iPhone");

  it("stays idle — afford query needs no flow state", () => {
    expect(result.nextState).toBe("idle");
  });

  it("returns no card — pure text response", () => {
    expect(firstCard(result)).toBeNull();
  });

  it("mentions the current account balance (AED 24,750)", () => {
    expect(firstText(result)).toContain("24,750");
  });

  it("mentions the savings account balance (AED 55,000)", () => {
    expect(firstText(result)).toContain("55,000");
  });

  it("asks what amount the user is checking", () => {
    const text = firstText(result).toLowerCase();
    expect(text).toMatch(/amount|checking|afford/);
  });
});

// ─── Flow 6b: Can I afford AED 5000 (with explicit amount) ───────────────────

describe("Flow 6b — 'Can I afford AED 5000' (balance sufficient)", () => {
  const result = fromIdle("Can I afford AED 5000");

  it("confirms the user can afford it", () => {
    const text = firstText(result).toLowerCase();
    expect(text).toMatch(/yes|can afford/i);
  });

  it("shows remaining balance after deduction", () => {
    // Balance 24,750 − 5,000 = 19,750
    expect(firstText(result)).toContain("19,750");
  });
});

describe("Flow 6c — 'Can I afford AED 30000' (balance insufficient)", () => {
  const result = fromIdle("Can I afford AED 30000");

  it("tells the user they can't afford it", () => {
    const text = firstText(result).toLowerCase();
    expect(text).not.toMatch(/^yes/);
    expect(text).toContain("24,750");
  });
});

// ─── Flow 7: Arabic — أرسل ٥٠٠ درهم لعلي ────────────────────────────────────

describe("Flow 7 — Arabic: 'أرسل ٥٠٠ درهم لعلي' (Send 500 AED to Ali)", () => {
  const result = fromIdle("أرسل ٥٠٠ درهم لعلي");

  it("stays idle — Arabic intent is not recognised (GENERAL_QUERY)", () => {
    // Current limitation: intent patterns are English-only regex.
    // Arabic script → no pattern match → GENERAL_QUERY → generic reply.
    // Tracked: add Arabic i18n support in a future phase.
    expect(result.nextState).toBe("idle");
  });

  it("returns no card", () => {
    expect(firstCard(result)).toBeNull();
  });

  it("does NOT start a transfer flow", () => {
    expect(result.context.amount).toBeNull();
    expect(result.context.resolvedContact).toBeNull();
  });

  it("returns a generic help reply in English", () => {
    // The response is in English — no Arabic reply yet.
    expect(firstText(result).length).toBeGreaterThan(0);
  });
});

// ─── Bonus: Known-contact happy path (Sara — domestic) ───────────────────────

describe("Bonus — 'send 200 to Sara' (known domestic contact)", () => {
  const result = fromIdle("send 200 to Sara");

  it("resolves Sara Al Mansouri and moves to summary", () => {
    // Sara is an exact partial match (only one contact with token 'sara').
    // Her IBAN is AE (UAE), so no purpose step — straight to summary.
    expect(result.nextState).toBe("summary");
  });

  it("shows a transfer_confirm card", () => {
    expect(firstCard(result)?.type).toBe("transfer_confirm");
  });

  it("card carries AED 200", () => {
    expect(result.context.amount?.value).toBe(200);
  });

  it("card recipient is Sara Al Mansouri", () => {
    expect(result.context.resolvedContact?.name).toBe("Sara Al Mansouri");
  });

  it("transfer is domestic — no purpose needed (isIntl: false in card)", () => {
    expect(firstCard(result)?.data.isIntl).toBe(false);
  });
});

// ─── Bonus: International contact happy path (Emily — needs purpose) ─────────

describe("Bonus — 'send 500 to Emily' (known international contact)", () => {
  const result = fromIdle("send 500 to Emily");

  it("moves to purpose state — international IBAN requires purpose of payment", () => {
    expect(result.nextState).toBe("purpose");
  });

  it("shows a purpose_picker card", () => {
    expect(firstCard(result)?.type).toBe("purpose_picker");
  });

  it("first text message mentions the destination country", () => {
    expect(firstText(result)).toMatch(/United Kingdom|UK|GB/);
  });
});

// ─── Bonus: Partial match (two Ahmeds) ────────────────────────────────────────

describe("Bonus — 'send 100 to Ahmed' (partial match → picker)", () => {
  const result = fromIdle("send 100 to Ahmed");

  it("stops at got_amount — ambiguous contact", () => {
    expect(result.nextState).toBe("got_amount");
  });

  it("shows a contact_picker card", () => {
    expect(firstCard(result)?.type).toBe("contact_picker");
  });

  it("picker lists both Ahmed contacts", () => {
    const matches = firstCard(result)?.data.matches as { name: string }[];
    expect(matches.length).toBe(2);
    expect(matches.every((m) => m.name.toLowerCase().startsWith("ahmed"))).toBe(true);
  });
});
