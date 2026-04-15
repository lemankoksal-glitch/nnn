// Public API for the Wio Pay payment brain

export { parseIntent, parseAmount, parseRecipient, looksLikeIBAN } from "./parse";
export { findWioContact, getContactById, buildAdhocContact } from "./contacts";
export type { ContactSearchResult } from "./contacts";
export { validateIBAN, isIntlIBAN, formatIBAN, ibanCountry } from "./iban";
export { convertFX, rateFor, rateLabel, makeAmount, FX_RATES } from "./fx";
export {
  processSendMoney,
  EMPTY_CONTEXT,
  PURPOSE_OPTIONS,
} from "./state-machine";
export type {
  SendMoneyState,
  SendMoneyContext,
  BrainEvent,
  BrainMessage,
  BrainCard,
  CardType,
  TransitionResult,
} from "./state-machine";
