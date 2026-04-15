/**
 * Wio Pay Chat API — request / response contracts.
 *
 * The server route at POST /api/chat accepts a ChatRequest and returns a
 * ChatResponse. The deterministic payment brain always runs first; AI may only
 * enrich the natural-language reply text, never change state or card data.
 */

import type {
  SendMoneyState,
  SendMoneyContext,
  BrainMessage,
} from "@/lib/payment-brain/state-machine";

// ─── Action codes ─────────────────────────────────────────────────────────────

/**
 * High-level action derived from the brain result.
 * Clients use this to know what the brain decided without inspecting card types.
 * The AI may NOT override this value.
 */
export type AssistantAction =
  | "reply_only"           // Plain text — no card
  | "ask_recipient"        // Brain is waiting for a recipient name / IBAN
  | "ask_purpose"          // Brain is showing the purpose-of-payment picker
  | "show_contact_picker"  // Multiple contacts matched
  | "show_add_beneficiary" // Unknown recipient — add-beneficiary form shown
  | "show_summary"         // Transfer confirm card shown
  | "show_done"            // Transfer complete card shown
  | "show_card";           // Some other card (balance, FX rate, etc.)

// ─── Event serialisation ──────────────────────────────────────────────────────

/** All brain event types that the client can send to the server */
export type ChatEventType =
  | "USER_TEXT"
  | "CONTACT_SELECTED"
  | "IBAN_SUBMITTED"
  | "PURPOSE_SELECTED"
  | "CONFIRM"
  | "CANCEL";

// ─── Request ──────────────────────────────────────────────────────────────────

export interface ChatRequest {
  /** Which brain event occurred */
  eventType: ChatEventType;
  /**
   * Typed event payload — keys depend on eventType:
   *  USER_TEXT          → { text: string }
   *  CONTACT_SELECTED   → { contactId: string }
   *  IBAN_SUBMITTED     → { iban: string; name: string }
   *  PURPOSE_SELECTED   → { purposeCode: string; purposeLabel: string }
   *  CONFIRM / CANCEL   → {}
   */
  eventPayload: Record<string, string>;
  /** Current state machine state on the client */
  state: SendMoneyState;
  /** Current state machine context (JSON-serialised, Dates become strings) */
  context: SendMoneyContext;
  /** Recent turns — up to 6 pairs — for AI context window */
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface ChatResponse {
  /** Brain-determined next state — client must apply this */
  nextState: SendMoneyState;
  /** Updated context — client must apply this */
  context: SendMoneyContext;
  /**
   * Messages to render. For USER_TEXT events, `.text` fields may be AI-enriched.
   * Card data is always computed deterministically by the brain.
   */
  messages: BrainMessage[];
  /** How long the client should show the typing indicator before rendering */
  delayMs: number;
  /** Derived action label for the client */
  action: AssistantAction;
  /** True when the AI enrichment call failed and canned brain text was used */
  usedFallback: boolean;
  /** Model identifier — "mock", "claude-haiku-4-5-20251001", or "local" */
  model: string;
}
