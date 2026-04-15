import type {
  User,
  Account,
  WioContact,
  Bill,
  AlertCard,
  Transaction,
  AmountObject,
  HeldTransfer,
  SpendingBreakdown,
} from "@/types";

// ─── Helper ────────────────────────────────────────────────────────────────────

export const aed = (value: number): AmountObject => ({
  value,
  currency: "AED",
  formatted: `AED ${value.toLocaleString("en-AE", { minimumFractionDigits: 2 })}`,
});

const usd = (value: number): AmountObject => ({
  value,
  currency: "USD",
  formatted: `USD ${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
});

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);
const hoursAgo = (n: number) => new Date(now.getTime() - n * 3_600_000);
const daysAhead = (n: number) => new Date(now.getTime() + n * 86_400_000);

// ─── User ──────────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: "user_001",
  name: "Khalid Al Marzooqi",
  email: "khalid@example.ae",
  role: "customer",
  phone: "+971 50 123 4567",
};

// ─── Accounts ──────────────────────────────────────────────────────────────────

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: "acc_001",
    userId: "user_001",
    type: "current",
    currency: "AED",
    balance: 24_750.0,
    // AE600331000000000000000 — pre-computed valid UAE IBAN (mod-97 = 1)
    iban: "AE600331000000000000000",
    label: "Current Account",
  },
  {
    id: "acc_002",
    userId: "user_001",
    type: "savings",
    currency: "AED",
    balance: 55_000.0,
    iban: "AE460090000001976097640",
    label: "Savings Account",
  },
];

// ─── Contacts ──────────────────────────────────────────────────────────────────
// Two contacts named "Ahmed" are deliberate — they trigger the partial-match picker.
// Emily and Ravi have international IBANs — they trigger the purpose-of-transfer flow.

export const MOCK_CONTACTS: WioContact[] = [
  {
    id: "contact_001",
    name: "Ahmed Al Rashidi",
    iban: "AE070331234567890123456",
    phone: "+971 50 234 5678",
    isFavorite: true,
    avatarInitials: "AA",
    avatarColor: "bg-blue-500",
  },
  {
    id: "contact_002",
    name: "Sara Al Mansouri",
    iban: "AE460090000002345678901",
    phone: "+971 55 345 6789",
    isFavorite: true,
    avatarInitials: "SM",
    avatarColor: "bg-purple-500",
  },
  {
    id: "contact_003",
    name: "Ahmed Hassan",
    iban: "AE070330000004567890123",
    phone: "+971 52 456 7890",
    isFavorite: false,
    avatarInitials: "AH",
    avatarColor: "bg-emerald-500",
  },
  {
    id: "contact_004",
    name: "Mohammed Al Kindi",
    iban: "AE290090000003456789012",
    phone: "+971 56 567 8901",
    isFavorite: false,
    avatarInitials: "MK",
    avatarColor: "bg-orange-500",
  },
  {
    id: "contact_005",
    name: "Emily Watson",
    iban: "GB82WEST12345698765432", // UK — triggers international flow
    phone: "+44 7700 900123",
    isFavorite: false,
    avatarInitials: "EW",
    avatarColor: "bg-pink-500",
  },
  {
    id: "contact_006",
    name: "Ravi Sharma",
    iban: "DE89370400440532013000", // Germany — triggers international flow
    phone: "+49 160 9000 1234",
    isFavorite: false,
    avatarInitials: "RS",
    avatarColor: "bg-yellow-600",
  },
];

// ─── Transactions ──────────────────────────────────────────────────────────────

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn_001",
    accountId: "acc_001",
    type: "debit",
    category: "payment",
    amount: 85.5,
    currency: "AED",
    description: "Careem · Ride",
    merchantName: "Careem",
    timestamp: hoursAgo(2),
    balanceAfter: 24_750.0,
  },
  {
    id: "txn_002",
    accountId: "acc_001",
    type: "debit",
    category: "payment",
    amount: 340.0,
    currency: "AED",
    description: "Noon.com · Order #4821",
    merchantName: "Noon",
    timestamp: daysAgo(1),
    balanceAfter: 24_835.5,
  },
  {
    id: "txn_003",
    accountId: "acc_001",
    type: "credit",
    category: "salary",
    amount: 15_000.0,
    currency: "AED",
    description: "Salary · April 2026",
    timestamp: daysAgo(2),
    balanceAfter: 25_175.5,
  },
  {
    id: "txn_004",
    accountId: "acc_001",
    type: "debit",
    category: "transfer",
    amount: 500.0,
    currency: "AED",
    description: "Transfer to Ahmed Al Rashidi",
    merchantName: "Ahmed Al Rashidi",
    timestamp: daysAgo(3),
    balanceAfter: 10_175.5,
  },
  {
    id: "txn_005",
    accountId: "acc_001",
    type: "debit",
    category: "payment",
    amount: 245.75,
    currency: "AED",
    description: "Spinneys Supermarket",
    merchantName: "Spinneys",
    timestamp: daysAgo(5),
    balanceAfter: 10_675.5,
  },
];

// ─── Bills ─────────────────────────────────────────────────────────────────────

export const MOCK_BILLS: Bill[] = [
  {
    id: "bill_001",
    provider: "Etisalat",
    accountNumber: "0500123456",
    dueDate: daysAhead(3),
    amount: aed(249.0),
    isPaid: false,
  },
  {
    id: "bill_002",
    provider: "DEWA",
    accountNumber: "100-5678-9012",
    dueDate: daysAhead(7),
    amount: aed(418.5),
    isPaid: false,
  },
  {
    id: "bill_003",
    provider: "Du",
    accountNumber: "DU-0987654",
    dueDate: daysAgo(1), // overdue
    amount: aed(149.0),
    isPaid: false,
  },
];

// ─── Alerts ────────────────────────────────────────────────────────────────────

export const MOCK_ALERTS: AlertCard[] = [
  {
    id: "alert_001",
    type: "bill_due",
    severity: "warning",
    title: "Bill Due in 3 Days",
    body: "Your Etisalat bill of AED 249.00 is due on April 18.",
    cta: { label: "Pay Now", action: "pay_bill:bill_001" },
    timestamp: hoursAgo(1),
    isDismissed: false,
  },
  {
    id: "alert_002",
    type: "payment_received",
    severity: "success",
    title: "Payment Received",
    body: "You received AED 1,200.00 from Mohammed Al Kindi.",
    timestamp: hoursAgo(5),
    isDismissed: false,
  },
];

// ─── Seed: initial chat messages ───────────────────────────────────────────────

export const SEED_MESSAGES = [
  {
    id: "seed_msg_001",
    sender: "ai" as const,
    text: "Good morning, Khalid! 👋 Your current account balance is **AED 24,750.00**. How can I help you today?",
    timestamp: hoursAgo(0.1),
    card: null,
  },
];

// ─── Held transfer ─────────────────────────────────────────────────────────────

export const MOCK_HELD_TRANSFER: HeldTransfer = {
  id: "held_001",
  toContact: MOCK_CONTACTS[5], // Ravi Sharma — Germany IBAN
  amount: aed(3_200.0),
  holdReason: "intl_compliance",
  holdReasonLabel: "International compliance review",
  initiatedAt: hoursAgo(3),
  expectedReleaseAt: new Date(now.getTime() + 24 * 3_600_000), // +24h
};

// ─── Spending breakdown ────────────────────────────────────────────────────────

export const MOCK_SPENDING: SpendingBreakdown = {
  period: "April 2026",
  total: 4_821.25,
  currency: "AED",
  categories: [
    { label: "Food & Dining", amount: 1_240.5, currency: "AED", pct: 26 },
    { label: "Shopping", amount: 985.75, currency: "AED", pct: 20 },
    { label: "Transport", amount: 612.0, currency: "AED", pct: 13 },
    { label: "Bills & Utilities", amount: 816.5, currency: "AED", pct: 17 },
    { label: "Entertainment", amount: 430.0, currency: "AED", pct: 9 },
    { label: "Other", amount: 736.5, currency: "AED", pct: 15 },
  ],
};

// ─── FX seed ──────────────────────────────────────────────────────────────────

export const MOCK_FX_QUOTE = {
  from: aed(500),
  to: usd(136.15),
  rate: 0.2723,
  provider: "Wio FX",
  validUntil: new Date(now.getTime() + 60_000),
};
