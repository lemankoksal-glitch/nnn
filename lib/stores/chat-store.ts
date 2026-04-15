/**
 * Zustand store for the Wio Pay customer chat flow.
 *
 * Design rules (mirror the spec):
 *  - State slices are plain serialisable values — no functions, no class instances.
 *  - `flowStep` maps to the high-level FlowStep type; null means the flow is idle.
 *  - `isIntl` is derived automatically whenever pendingContact is set.
 *  - `confirmTransfer` deducts the pending amount from userBalance and advances
 *    flowStep to "DONE". It is a // MOCK operation — no real payment is executed.
 *  - Card interactivity: only the last message that contains a card has
 *    isCardActive=true. All others are read-only.
 */

import { create } from "zustand";
import type { AmountObject, WioContact, FlowStep } from "@/types";
import type { BrainCard } from "@/lib/payment-brain";
import { isIntlIBAN } from "@/lib/payment-brain";
import { MOCK_USER, MOCK_ACCOUNTS, MOCK_CONTACTS } from "@/mocks/data";
import { formatCurrency } from "@/lib/utils";

// ─── ChatMessage ──────────────────────────────────────────────────────────────
// Mirrors UIMessage in MessageBubble.tsx so components can accept either type.

export interface ChatMessage {
  id: string;
  sender: "customer" | "ai";
  text?: string;
  card?: BrainCard;
  timestamp: Date;
  /** True only for the most-recently added card; makes its buttons interactive */
  isCardActive?: boolean;
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface ChatState {
  /** Full message thread rendered in the chat feed */
  messages: ChatMessage[];

  /**
   * High-level flow step.
   * null          → idle (no transfer in progress)
   * COLLECT_DETAILS → gathering amount / recipient / purpose
   * CONFIRM       → summary card shown, waiting for user confirmation
   * PROCESSING    → transfer submitted, showing spinner/processing state
   * DONE          → transfer complete
   * FAILED        → transfer failed or was cancelled
   */
  flowStep: FlowStep | null;

  /** Amount the user intends to send */
  pendingAmt: AmountObject | null;

  /** Resolved recipient contact */
  pendingContact: WioContact | null;

  /** Purpose-of-payment code (e.g. "FAM", "BUS") — required for intl transfers */
  pendingPurpose: string | null;

  /** True when pendingContact has a non-AE IBAN */
  isIntl: boolean;

  /** Current account balance (decremented on confirmTransfer) */
  userBalance: number;

  /** Display name of the authenticated user */
  userName: string;

  /** Full contact list available for recipient lookup */
  wioContacts: WioContact[];
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export interface ChatActions {
  /** Append a customer-sent message and deactivate all card buttons */
  addUserMessage: (text: string) => void;

  /**
   * Append an AI response message, optionally with an inline card.
   * Automatically marks the new message as the active card (if it has one)
   * and deactivates all previous cards.
   */
  addAssistantMessage: (text: string, card?: BrainCard) => void;

  setPendingAmount: (amount: AmountObject | null) => void;

  /**
   * Set the resolved recipient. Also updates isIntl based on the IBAN prefix.
   */
  setPendingContact: (contact: WioContact | null) => void;

  /** Set the purpose-of-payment code */
  setPendingPurpose: (purposeCode: string | null) => void;

  /** Explicitly advance the flow step */
  setFlowStep: (step: FlowStep | null) => void;

  /**
   * Execute the pending transfer.
   * // MOCK — deducts pendingAmt from userBalance, sets flowStep to "DONE".
   * Pending fields are kept so the done-card can read them; call resetFlow()
   * after the done card is dismissed to fully clear state.
   * No-op if pendingAmt or pendingContact is null.
   */
  confirmTransfer: () => void;

  /**
   * Abort the in-progress transfer.
   * Clears all pending fields and sets flowStep to null (idle).
   */
  cancelTransfer: () => void;

  /**
   * Full reset: clears the message thread and all pending transfer state,
   * then re-seeds with the initial welcome message.
   */
  resetFlow: () => void;
}

export type ChatStore = ChatState & ChatActions;

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _seq = 0;
function genId(): string {
  return `msg_${++_seq}_${Date.now()}`;
}

/**
 * Ensure only the last message that carries a card has isCardActive=true.
 * All earlier card messages are set to false so their buttons become read-only.
 */
function withRefreshedCardActive(messages: ChatMessage[]): ChatMessage[] {
  let lastCardIdx = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].card) {
      lastCardIdx = i;
      break;
    }
  }
  return messages.map((m, i) =>
    m.card ? { ...m, isCardActive: i === lastCardIdx } : m,
  );
}

// ─── Initial state factory ────────────────────────────────────────────────────

const PRIMARY_ACCOUNT = MOCK_ACCOUNTS[0];

function makeInitialState(): ChatState {
  return {
    messages: [
      {
        id: "msg_seed",
        sender: "ai",
        text: `Good morning, ${MOCK_USER.name.split(" ")[0]}! Your current account balance is **${formatCurrency(PRIMARY_ACCOUNT.balance, PRIMARY_ACCOUNT.currency)}**. How can I help you today?`,
        timestamp: new Date(Date.now() - 60_000),
        isCardActive: false,
      },
    ],
    flowStep: null,
    pendingAmt: null,
    pendingContact: null,
    pendingPurpose: null,
    isIntl: false,
    userBalance: PRIMARY_ACCOUNT.balance,
    userName: MOCK_USER.name,
    wioContacts: MOCK_CONTACTS,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useChatStore = create<ChatStore>((set) => ({
  ...makeInitialState(),

  // ── Message actions ─────────────────────────────────────────────────────────

  addUserMessage: (text) =>
    set((s) => ({
      messages: [
        // Deactivate all card buttons when user sends a new message
        ...s.messages.map((m) => ({ ...m, isCardActive: false })),
        {
          id: genId(),
          sender: "customer" as const,
          text,
          timestamp: new Date(),
        },
      ],
    })),

  addAssistantMessage: (text, card) =>
    set((s) => {
      const msg: ChatMessage = {
        id: genId(),
        sender: "ai",
        text,
        card,
        timestamp: new Date(),
        isCardActive: false,
      };
      return {
        messages: withRefreshedCardActive([...s.messages, msg]),
      };
    }),

  // ── Pending transfer setters ────────────────────────────────────────────────

  setPendingAmount: (amount) => set({ pendingAmt: amount }),

  setPendingContact: (contact) =>
    set({
      pendingContact: contact,
      // Derive isIntl from IBAN prefix whenever contact changes
      isIntl: contact?.iban ? isIntlIBAN(contact.iban) : false,
    }),

  setPendingPurpose: (purposeCode) => set({ pendingPurpose: purposeCode }),

  setFlowStep: (step) => set({ flowStep: step }),

  // ── Flow lifecycle actions ──────────────────────────────────────────────────

  confirmTransfer: () =>
    set((s) => {
      // Guard: both amount and contact must be present
      if (!s.pendingAmt || !s.pendingContact) return {};

      return {
        // MOCK — deduct the transfer amount from the current balance
        userBalance: Math.max(0, s.userBalance - s.pendingAmt.value),
        flowStep: "DONE" as FlowStep,
        // Pending fields are intentionally kept for the done card to display
      };
    }),

  cancelTransfer: () =>
    set({
      flowStep: null,
      pendingAmt: null,
      pendingContact: null,
      pendingPurpose: null,
      isIntl: false,
    }),

  resetFlow: () => set(makeInitialState()),
}));

// ─── Selectors ────────────────────────────────────────────────────────────────
// Fine-grained selectors reduce re-renders when only one slice changes.

export const selectMessages = (s: ChatStore) => s.messages;
export const selectFlowStep = (s: ChatStore) => s.flowStep;
export const selectPendingAmt = (s: ChatStore) => s.pendingAmt;
export const selectPendingContact = (s: ChatStore) => s.pendingContact;
export const selectPendingPurpose = (s: ChatStore) => s.pendingPurpose;
export const selectIsIntl = (s: ChatStore) => s.isIntl;
export const selectUserBalance = (s: ChatStore) => s.userBalance;
export const selectUserName = (s: ChatStore) => s.userName;
export const selectWioContacts = (s: ChatStore) => s.wioContacts;

/** Returns true when a transfer is in an actionable (non-idle, non-done) state */
export const selectFlowActive = (s: ChatStore) =>
  s.flowStep !== null && s.flowStep !== "DONE" && s.flowStep !== "FAILED";

/** All pending fields as a single object for summary cards */
export const selectPendingSummary = (s: ChatStore) => ({
  amt: s.pendingAmt,
  contact: s.pendingContact,
  purpose: s.pendingPurpose,
  isIntl: s.isIntl,
});
