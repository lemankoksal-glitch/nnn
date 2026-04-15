// ─── Primitives ────────────────────────────────────────────────────────────────

export type Currency = "AED" | "USD" | "EUR" | "GBP";

export interface AmountObject {
  value: number;
  currency: Currency;
  /** Pre-formatted display string, e.g. "AED 1,500.00" */
  formatted: string;
}

// ─── User & Auth ───────────────────────────────────────────────────────────────

export type UserRole = "customer" | "agent" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
}

// ─── Contacts ──────────────────────────────────────────────────────────────────

export interface WioContact {
  id: string;
  name: string;
  iban?: string;
  phone?: string;
  isFavorite: boolean;
  /** Two-letter initials rendered in avatar when no image */
  avatarInitials: string;
  avatarColor?: string; // tailwind bg-* class
}

// ─── Bills ─────────────────────────────────────────────────────────────────────

export interface Bill {
  id: string;
  provider: string; // e.g. "Etisalat", "DEWA", "Du"
  accountNumber: string;
  dueDate: Date;
  amount: AmountObject;
  isPaid: boolean;
  logoUrl?: string;
}

// ─── Alerts ────────────────────────────────────────────────────────────────────

export type AlertType =
  | "low_balance"
  | "unusual_spend"
  | "bill_due"
  | "payment_received"
  | "card_abroad";

export type AlertSeverity = "info" | "warning" | "success";

export interface AlertCard {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  body: string;
  cta?: {
    label: string;
    /** Identifier for the action handler, e.g. "pay_bill:bill_123" */
    action: string;
  };
  timestamp: Date;
  isDismissed: boolean;
}

// ─── Transfers ─────────────────────────────────────────────────────────────────

export type TransferStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "done"
  | "failed";

export interface TransferSummary {
  id: string;
  toContact: WioContact;
  amount: AmountObject;
  note?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  status: TransferStatus;
  referenceNumber?: string;
}

// ─── AI / Intent ───────────────────────────────────────────────────────────────

export type IntentType =
  | "CHECK_BALANCE"
  | "TRANSFER_MONEY"
  | "PAY_BILL"
  | "VIEW_TRANSACTIONS"
  | "SPENDING_QUERY"
  | "AFFORD_QUERY"
  | "FX_QUERY"
  | "FREEZE_CARD"
  | "DISPUTE_TRANSACTION"
  | "GET_STATEMENT"
  | "ALERT_ACKNOWLEDGEMENT"
  | "THANKS"
  | "GENERAL_QUERY";

// ─── Bill payment ──────────────────────────────────────────────────────────────

export type BillPayStatus = "pending" | "confirmed" | "done" | "failed";

export interface BillPaySummary {
  bill: Bill;
  status: BillPayStatus;
  paidAt?: Date;
  referenceNumber?: string;
}

// ─── Held transfer ─────────────────────────────────────────────────────────────

export type HeldTransferReason =
  | "security_review"
  | "intl_compliance"
  | "unusual_amount"
  | "new_beneficiary";

export interface HeldTransfer {
  id: string;
  toContact: WioContact;
  amount: AmountObject;
  holdReason: HeldTransferReason;
  holdReasonLabel: string;
  initiatedAt: Date;
  expectedReleaseAt: Date;
}

// ─── Spending breakdown ────────────────────────────────────────────────────────

export interface SpendingCategory {
  label: string;
  amount: number;
  currency: Currency;
  pct: number; // 0-100
}

export interface SpendingBreakdown {
  period: string; // e.g. "April 2026"
  total: number;
  currency: Currency;
  categories: SpendingCategory[];
}

export type FlowStep =
  | "COLLECT_DETAILS"
  | "CONFIRM"
  | "PROCESSING"
  | "DONE"
  | "FAILED";

// ─── Chat / Messaging ──────────────────────────────────────────────────────────

export type MessageSender = "customer" | "ai" | "agent";
export type MessageStatus = "sending" | "sent" | "failed";

/** A structured card rendered inline in a chat message */
export type InlineCardType =
  | "balance_summary"
  | "transfer_confirm"
  | "transfer_done"
  | "bill_payment"
  | "transaction_list"
  | "alert"
  | "freeze_confirm";

export interface InlineCard {
  type: InlineCardType;
  data: Record<string, unknown>;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  intentType?: IntentType;
  flowStep?: FlowStep;
  inlineCard?: InlineCard;
}

// ─── Conversation ──────────────────────────────────────────────────────────────

export type ConversationStatus = "open" | "resolved" | "waiting_on_customer";

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatarUrl?: string;
  status: ConversationStatus;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  messages: Message[];
}

// ─── Banking / Accounts ────────────────────────────────────────────────────────

export type AccountType = "current" | "savings" | "business";

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  iban: string;
  label: string;
}

export type TransactionType = "debit" | "credit";
export type TransactionCategory =
  | "transfer"
  | "payment"
  | "refund"
  | "fee"
  | "salary"
  | "other";

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  currency: Currency;
  description: string;
  merchantName?: string;
  timestamp: Date;
  balanceAfter: number;
}
