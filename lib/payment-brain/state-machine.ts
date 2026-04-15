/**
 * Send-money state machine.
 *
 * States:  idle → got_amount → got_recipient → validating → purpose → summary → confirmed → done
 *
 * All transitions are pure functions that return:
 *   - nextState
 *   - updated context
 *   - AI response messages (text and/or inline cards)
 *   - delayMs (how long the UI should show "typing" before rendering the response)
 *
 * The delay is simulated network/processing latency and is injected so tests
 * can override it without mocking timers.
 */

import type { AmountObject, WioContact, IntentType } from "@/types";
import { parseIntent, parseAmount, parseRecipient, parseFXCurrency, parseBiller } from "./parse";
import {
  findWioContact,
  getContactById,
  buildAdhocContact,
  type ContactSearchResult,
} from "./contacts";
import { validateIBAN, isIntlIBAN, formatIBAN, ibanCountry } from "./iban";

// ─── State & Context ───────────────────────────────────────────────────────────

export type SendMoneyState =
  | "idle"
  | "got_amount"
  | "got_recipient"
  | "validating"
  | "purpose"
  | "summary"
  | "confirmed"
  | "done";

export interface SendMoneyContext {
  amount: AmountObject | null;
  recipientQuery: string | null;
  resolvedContact: WioContact | null;
  partialMatches: WioContact[];
  /** Raw IBAN when the user typed one directly (not from a stored contact) */
  customIban: string | null;
  purposeCode: string | null;
  transferId: string | null;
  error: string | null;
}

export const EMPTY_CONTEXT: SendMoneyContext = {
  amount: null,
  recipientQuery: null,
  resolvedContact: null,
  partialMatches: [],
  customIban: null,
  purposeCode: null,
  transferId: null,
  error: null,
};

// ─── Messages / Cards ──────────────────────────────────────────────────────────

export type CardType =
  | "balance_summary"
  | "transfer_confirm"
  | "transfer_done"
  | "contact_picker"
  | "add_beneficiary"
  | "purpose_picker"
  | "transaction_list"
  | "alert_banner"
  | "freeze_confirm"
  | "fx_rate"
  | "spending_breakdown"
  | "bill_pay_confirm"
  | "bill_pay_done";

export interface BrainCard {
  type: CardType;
  data: Record<string, unknown>;
}

export interface BrainMessage {
  text?: string;
  card?: BrainCard;
  /** Delay before the *next* message, in ms (for multi-message sequences) */
  pauseAfterMs?: number;
}

export interface TransitionResult {
  nextState: SendMoneyState;
  context: SendMoneyContext;
  messages: BrainMessage[];
  /** How long the UI should show "typing…" before showing these messages */
  delayMs: number;
}

// ─── Events ────────────────────────────────────────────────────────────────────

export type BrainEvent =
  | { type: "USER_TEXT"; text: string }
  | { type: "CONTACT_SELECTED"; contactId: string }
  | { type: "IBAN_SUBMITTED"; iban: string; name: string }
  | { type: "PURPOSE_SELECTED"; purposeCode: string; purposeLabel: string }
  | { type: "CONFIRM" }
  | { type: "CANCEL" };

// ─── Purpose codes ─────────────────────────────────────────────────────────────

export const PURPOSE_OPTIONS = [
  { code: "FAM", label: "Family Support" },
  { code: "SAL", label: "Salary / Wages" },
  { code: "BUS", label: "Business Payment" },
  { code: "TRV", label: "Travel & Expenses" },
  { code: "EDU", label: "Education Fees" },
  { code: "MED", label: "Medical" },
  { code: "INV", label: "Investment" },
  { code: "OTH", label: "Other" },
] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function randomRef(): string {
  return `WIO${Date.now().toString().slice(-8)}`;
}

/** Builds the transfer_confirm card data from current context. */
function buildConfirmCardData(
  ctx: SendMoneyContext,
  contact: WioContact,
  iban: string,
): Record<string, unknown> {
  return {
    toContact: contact,
    amount: ctx.amount,
    iban: formatIBAN(iban),
    purposeCode: ctx.purposeCode,
    purposeLabel:
      PURPOSE_OPTIONS.find((p) => p.code === ctx.purposeCode)?.label ?? null,
    isIntl: isIntlIBAN(iban),
    country: ibanCountry(iban),
  };
}

// ─── Contact resolution sub-routine ───────────────────────────────────────────

/**
 * Resolves a contact search result and continues the flow.
 * Called from both idle and got_amount states.
 */
function resolveContactResult(
  ctx: SendMoneyContext,
  result: ContactSearchResult,
): TransitionResult {
  switch (result.kind) {
    case "exact": {
      const contact = result.contact;
      const iban = contact.iban ?? ctx.customIban;
      if (!iban) {
        return {
          nextState: "got_amount",
          context: { ...ctx, resolvedContact: contact, partialMatches: [] },
          messages: [
            {
              text: `I found ${contact.name} in your contacts but they don't have an IBAN saved yet. Please enter their IBAN to proceed.`,
              card: {
                type: "add_beneficiary",
                data: { prefilledName: contact.name, prefilledIban: "" },
              },
            },
          ],
          delayMs: 900,
        };
      }
      return continueToValidating({ ...ctx, resolvedContact: contact, customIban: iban });
    }

    case "partial": {
      return {
        nextState: "got_amount",
        context: { ...ctx, partialMatches: result.matches },
        messages: [
          {
            text: `I found ${result.matches.length} contacts matching that name. Which one did you mean?`,
            card: {
              type: "contact_picker",
              data: { matches: result.matches, amount: ctx.amount },
            },
          },
        ],
        delayMs: 800,
      };
    }

    case "iban": {
      const iban = result.iban;
      if (!validateIBAN(iban)) {
        return {
          nextState: "got_amount",
          context: { ...ctx, error: "invalid_iban" },
          messages: [
            {
              text: `That IBAN (${formatIBAN(iban)}) doesn't appear to be valid. Please double-check and try again.`,
            },
          ],
          delayMs: 900,
        };
      }
      if (result.existingContact) {
        return continueToValidating({
          ...ctx,
          resolvedContact: result.existingContact,
          customIban: iban,
        });
      }
      // Unknown IBAN — ask for a name
      return {
        nextState: "got_amount",
        context: { ...ctx, customIban: iban },
        messages: [
          {
            text: `I don't recognise that IBAN yet. Please confirm the recipient's name to add them as a beneficiary.`,
            card: {
              type: "add_beneficiary",
              data: { prefilledName: "", prefilledIban: formatIBAN(iban) },
            },
          },
        ],
        delayMs: 900,
      };
    }

    case "none": {
      return {
        nextState: "got_amount",
        context: { ...ctx, recipientQuery: result.query },
        messages: [
          {
            text: `I couldn't find "${result.query}" in your contacts. Would you like to add them as a new beneficiary?`,
            card: {
              type: "add_beneficiary",
              data: { prefilledName: result.query, prefilledIban: "" },
            },
          },
        ],
        delayMs: 900,
      };
    }
  }
}

/**
 * Validates the IBAN and decides: purpose question or summary card.
 * Called whenever we have both amount + resolved contact.
 */
function continueToValidating(ctx: SendMoneyContext): TransitionResult {
  const contact = ctx.resolvedContact!;
  const iban = (contact.iban ?? ctx.customIban)!;

  // Validate
  if (!validateIBAN(iban)) {
    return {
      nextState: "got_amount",
      context: { ...ctx, error: "invalid_iban" },
      messages: [
        {
          text: `The IBAN on file for ${contact.name} (${formatIBAN(iban)}) is not valid. Please enter a correct IBAN to continue.`,
          card: {
            type: "add_beneficiary",
            data: { prefilledName: contact.name, prefilledIban: "" },
          },
        },
      ],
      delayMs: 1_200,
    };
  }

  // International → need purpose
  if (isIntlIBAN(iban)) {
    const country = ibanCountry(iban);
    return {
      nextState: "purpose",
      context: { ...ctx, resolvedContact: contact },
      messages: [
        {
          text: `This transfer goes to ${contact.name} in **${country}**. UAE regulations require a purpose of payment for international transfers.`,
        },
        {
          card: {
            type: "purpose_picker",
            data: { options: PURPOSE_OPTIONS },
          },
        },
      ],
      delayMs: 1_300,
    };
  }

  // Domestic → show summary
  return {
    nextState: "summary",
    context: { ...ctx, resolvedContact: contact },
    messages: [
      {
        text: `Here's your transfer summary. Please review and confirm.`,
        card: {
          type: "transfer_confirm",
          data: buildConfirmCardData(ctx, contact, iban),
        },
      },
    ],
    delayMs: 1_200,
  };
}

// ─── Per-state handlers ────────────────────────────────────────────────────────

function handleIdle(
  event: BrainEvent,
  ctx: SendMoneyContext,
  contacts: WioContact[],
): TransitionResult {
  if (event.type !== "USER_TEXT") {
    return {
      nextState: "idle",
      context: ctx,
      messages: [{ text: "I'm not sure what you mean. Try typing a command or tap a quick action below." }],
      delayMs: 600,
    };
  }

  const intent: IntentType = parseIntent(event.text);

  // ── Non-transfer intents ──
  if (intent !== "TRANSFER_MONEY") {
    return handleNonTransferIntent(intent, event.text, ctx, contacts);
  }

  // ── Transfer intent ──
  const amount = parseAmount(event.text);

  if (!amount) {
    return {
      nextState: "idle",
      context: EMPTY_CONTEXT,
      messages: [
        { text: "Of course! How much would you like to send, and to whom?" },
      ],
      delayMs: 700,
    };
  }

  const recipientQuery = parseRecipient(event.text);
  const newCtx: SendMoneyContext = { ...EMPTY_CONTEXT, amount };

  if (!recipientQuery) {
    return {
      nextState: "got_amount",
      context: newCtx,
      messages: [
        {
          text: `Got it — **${amount.formatted}**. Who would you like to send it to? You can type a name or paste an IBAN.`,
        },
      ],
      delayMs: 700,
    };
  }

  // Both amount and recipient parsed — resolve contact and continue
  const result = findWioContact(recipientQuery, contacts);
  return resolveContactResult({ ...newCtx, recipientQuery }, result);
}

function handleGotAmount(
  event: BrainEvent,
  ctx: SendMoneyContext,
  contacts: WioContact[],
): TransitionResult {
  if (event.type === "USER_TEXT") {
    const result = findWioContact(event.text.trim(), contacts);
    return resolveContactResult({ ...ctx, recipientQuery: event.text.trim() }, result);
  }

  if (event.type === "CONTACT_SELECTED") {
    const contact = getContactById(event.contactId, contacts);
    if (!contact) {
      return {
        nextState: "got_amount",
        context: ctx,
        messages: [{ text: "I couldn't find that contact. Please try again." }],
        delayMs: 600,
      };
    }
    const iban = contact.iban ?? ctx.customIban;
    if (!iban) {
      return {
        nextState: "got_amount",
        context: { ...ctx, resolvedContact: contact },
        messages: [
          {
            text: `Please enter an IBAN for ${contact.name}.`,
            card: {
              type: "add_beneficiary",
              data: { prefilledName: contact.name, prefilledIban: "" },
            },
          },
        ],
        delayMs: 700,
      };
    }
    return continueToValidating({ ...ctx, resolvedContact: contact, customIban: iban });
  }

  if (event.type === "IBAN_SUBMITTED") {
    const { iban, name } = event;
    if (!validateIBAN(iban)) {
      return {
        nextState: "got_amount",
        context: { ...ctx, error: "invalid_iban" },
        messages: [
          {
            text: `That IBAN doesn't look right. Please check it and try again.`,
            card: {
              type: "add_beneficiary",
              data: { prefilledName: name, prefilledIban: formatIBAN(iban), error: "Invalid IBAN" },
            },
          },
        ],
        delayMs: 800,
      };
    }
    const contact = buildAdhocContact(name, iban);
    return continueToValidating({ ...ctx, resolvedContact: contact, customIban: iban });
  }

  if (event.type === "CANCEL") {
    return cancelFlow();
  }

  return {
    nextState: "got_amount",
    context: ctx,
    messages: [{ text: "Please type a contact name or IBAN, or tap a contact above." }],
    delayMs: 600,
  };
}

function handlePurpose(
  event: BrainEvent,
  ctx: SendMoneyContext,
): TransitionResult {
  if (event.type === "PURPOSE_SELECTED") {
    const { purposeCode, purposeLabel } = event;
    const contact = ctx.resolvedContact!;
    const iban = (contact.iban ?? ctx.customIban)!;
    const updatedCtx = { ...ctx, purposeCode };
    return {
      nextState: "summary",
      context: updatedCtx,
      messages: [
        {
          text: `Perfect — **${purposeLabel}** noted. Here's your international transfer summary:`,
          card: {
            type: "transfer_confirm",
            data: buildConfirmCardData(updatedCtx, contact, iban),
          },
        },
      ],
      delayMs: 800,
    };
  }

  if (event.type === "CANCEL") return cancelFlow();

  return {
    nextState: "purpose",
    context: ctx,
    messages: [{ text: "Please select a purpose of payment from the options above." }],
    delayMs: 600,
  };
}

function handleSummary(
  event: BrainEvent,
  ctx: SendMoneyContext,
): TransitionResult {
  if (event.type === "CONFIRM") {
    const ref = randomRef();
    const contact = ctx.resolvedContact!;
    const iban = (contact.iban ?? ctx.customIban)!;
    return {
      nextState: "done",
      context: { ...ctx, transferId: ref },
      messages: [
        {
          text: `Transfer sent! 🎉 Your payment of **${ctx.amount!.formatted}** to **${contact.name}** is being processed.`,
          card: {
            type: "transfer_done",
            data: {
              toContact: contact,
              amount: ctx.amount,
              iban: formatIBAN(iban),
              referenceNumber: ref,
              completedAt: new Date().toISOString(),
              purposeLabel:
                PURPOSE_OPTIONS.find((p) => p.code === ctx.purposeCode)?.label ?? null,
            },
          },
        },
      ],
      delayMs: 2_000, // Simulate payment processing
    };
  }

  if (event.type === "CANCEL") return cancelFlow();

  if (event.type === "USER_TEXT") {
    const lower = event.text.toLowerCase();
    if (/\b(yes|confirm|send|ok|go|proceed|do it)\b/.test(lower)) {
      return handleSummary({ type: "CONFIRM" }, ctx);
    }
    if (/\b(no|cancel|stop|abort|back)\b/.test(lower)) {
      return cancelFlow();
    }
  }

  return {
    nextState: "summary",
    context: ctx,
    messages: [{ text: `Please tap **Confirm** to send **${ctx.amount?.formatted}**, or **Cancel** to abort.` }],
    delayMs: 600,
  };
}

function handleDone(ctx: SendMoneyContext): TransitionResult {
  return {
    nextState: "idle",
    context: EMPTY_CONTEXT,
    messages: [
      {
        text: "Is there anything else I can help you with?",
      },
    ],
    delayMs: 600,
  };
}

function cancelFlow(): TransitionResult {
  return {
    nextState: "idle",
    context: EMPTY_CONTEXT,
    messages: [
      {
        text: "Transfer cancelled. No money has been moved. Is there anything else I can help you with?",
      },
    ],
    delayMs: 600,
  };
}

// ─── Non-transfer intent handlers ──────────────────────────────────────────────

function handleNonTransferIntent(
  intent: IntentType,
  text: string,
  ctx: SendMoneyContext,
  contacts: WioContact[],
): TransitionResult {
  switch (intent) {
    // ── Phase 3: Thanks ──────────────────────────────────────────────────────
    case "THANKS":
      return {
        nextState: "idle",
        context: EMPTY_CONTEXT,
        messages: [
          {
            text: "Happy to help, Khalid! Is there anything else I can do for you — a transfer, bill payment, or account query?",
          },
        ],
        delayMs: 600,
      };

    // ── Balance ──────────────────────────────────────────────────────────────
    case "CHECK_BALANCE":
      return {
        nextState: "idle",
        context: EMPTY_CONTEXT,
        messages: [
          {
            text: "Here's a live summary of your accounts:",
            card: { type: "balance_summary", data: {} },
          },
        ],
        delayMs: 700,
      };

    // ── Phase 3: Can I afford ─────────────────────────────────────────────────
    case "AFFORD_QUERY": {
      const amount = parseAmount(text);
      // MOCK_ACCOUNTS[0] balance = 24750
      const currentBalance = 24_750;
      if (amount) {
        const canAfford = amount.value <= currentBalance;
        const remaining = currentBalance - amount.value;
        return {
          nextState: "idle",
          context: EMPTY_CONTEXT,
          messages: [
            {
              text: canAfford
                ? `Yes, you can afford **${amount.formatted}**. After this purchase, you'd have **AED ${remaining.toLocaleString("en-AE", { minimumFractionDigits: 2 })}** left in your current account.`
                : `Your current account balance is **AED ${currentBalance.toLocaleString("en-AE")}**, which is AED ${(amount.value - currentBalance).toLocaleString("en-AE", { minimumFractionDigits: 2 })} short of **${amount.formatted}**. Would you like to top up from your savings?`,
            },
          ],
          delayMs: 800,
        };
      }
      return {
        nextState: "idle",
        context: EMPTY_CONTEXT,
        messages: [
          {
            text: `Your current account balance is **AED 24,750.00** and your savings account has **AED 55,000.00**. What amount are you checking?`,
          },
        ],
        delayMs: 700,
      };
    }

    // ── Phase 3: FX rate query ─────────────────────────────────────────────────
    case "FX_QUERY": {
      const toCurrency = parseFXCurrency(text);
      const amount = parseAmount(text);
      if (!toCurrency) {
        return {
          nextState: "idle",
          context: EMPTY_CONTEXT,
          messages: [
            {
              text: "Which currency would you like the rate for? I support USD, EUR, and GBP.",
            },
          ],
          delayMs: 700,
        };
      }
      return {
        nextState: "idle",
        context: EMPTY_CONTEXT,
        messages: [
          {
            text: amount
              ? `Here's the current AED → ${toCurrency} rate and your conversion:`
              : `Here's the current AED → ${toCurrency} exchange rate:`,
            card: {
              type: "fx_rate",
              data: {
                fromCurrency: "AED",
                toCurrency,
                amount: amount?.value ?? null,
              },
            },
          },
        ],
        delayMs: 900,
      };
    }

    // ── Phase 3: Spending breakdown ────────────────────────────────────────────
    case "SPENDING_QUERY":
      return {
        nextState: "idle",
        context: EMPTY_CONTEXT,
        messages: [
          {
            text: "Here's your spending breakdown for **April 2026**:",
            card: { type: "spending_breakdown", data: {} },
          },
        ],
        delayMs: 900,
      };

    // ── Transactions ──────────────────────────────────────────────────────────
    case "VIEW_TRANSACTIONS":
      return {
        nextState: "idle",
        context: EMPTY_CONTEXT,
        messages: [
          {
            text: "Here are your 5 most recent transactions:",
            card: { type: "transaction_list", data: {} },
          },
        ],
        delayMs: 800,
      };

    // ── Phase 3: Bill payment with known-biller shortcut ──────────────────────
    case "PAY_BILL": {
      const billerName = parseBiller(text);
      if (billerName) {
        // Known biller found — skip straight to the confirm card
        return {
          nextState: "idle",
          context: EMPTY_CONTEXT,
          messages: [
            {
              text: `I found your **${billerName}** bill. Please review and confirm:`,
              card: {
                type: "bill_pay_confirm",
                data: { billerName },
              },
            },
          ],
          delayMs: 900,
        };
      }
      return {
        nextState: "idle",
        context: EMPTY_CONTEXT,
        messages: [
          {
            text: "Which biller would you like to pay? Your upcoming bills are shown above. You can also say \"Pay Etisalat\", \"Pay DEWA\", or \"Pay Du\".",
          },
        ],
        delayMs: 800,
      };
    }

    // ── Phase 3: Freeze card ───────────────────────────────────────────────────
    case "FREEZE_CARD":
      return {
        nextState: "idle",
        context: EMPTY_CONTEXT,
        messages: [
          {
            text: "I can freeze your Visa debit card (**4512 •• 3891**) immediately. No new transactions will go through, but direct debits and scheduled payments are unaffected. Confirm?",
            card: { type: "freeze_confirm", data: {} },
          },
        ],
        delayMs: 900,
      };

    case "DISPUTE_TRANSACTION":
      return {
        nextState: "idle",
        context: EMPTY_CONTEXT,
        messages: [
          {
            text: "I'm sorry to hear that. Share the transaction details (amount, date, and merchant) and I'll raise a dispute with our team right away.",
          },
        ],
        delayMs: 800,
      };

    case "GET_STATEMENT":
      return {
        nextState: "idle",
        context: EMPTY_CONTEXT,
        messages: [
          {
            text: "I'll prepare your April 2026 statement as a PDF. Statement exports are coming in the next release — I'll notify you the moment it's ready.",
          },
        ],
        delayMs: 700,
      };

    default:
      return {
        nextState: "idle",
        context: EMPTY_CONTEXT,
        messages: [
          {
            text: "I'm here to help — transfers, balance checks, bills, exchange rates, and more. What would you like to do?",
          },
        ],
        delayMs: 700,
      };
  }
}

// ─── Main dispatcher ───────────────────────────────────────────────────────────

/**
 * Main state machine entry point.
 *
 * Given the current state, context, event, and contact list, returns the
 * next state, updated context, and AI messages to render.
 *
 * This function is pure (except for Date.now() / Math.random inside helpers).
 * Inject a test-controlled contacts array to make it deterministic.
 */
export function processSendMoney(
  state: SendMoneyState,
  context: SendMoneyContext,
  event: BrainEvent,
  contacts: WioContact[],
): TransitionResult {
  switch (state) {
    case "idle":
      return handleIdle(event, context, contacts);

    case "got_amount":
      return handleGotAmount(event, context, contacts);

    // got_recipient and validating are transient — the machine jumps through them
    // inside resolveContactResult / continueToValidating and never parks here.
    case "got_recipient":
    case "validating":
      return continueToValidating(context);

    case "purpose":
      return handlePurpose(event, context);

    case "summary":
      return handleSummary(event, context);

    case "confirmed":
    case "done":
      return handleDone(context);
  }
}
