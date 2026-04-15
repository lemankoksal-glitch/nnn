# Wio Pay — Product Specification

**Version:** 0.1 (MVP)
**Status:** Draft
**Last updated:** 2026-04-15

---

## 1. Vision

Wio Pay is an **AI-first banking product** that replaces the traditional mobile banking app with a single, intelligent chat interface. Customers interact with a conversational AI that can answer questions, initiate payments, surface alerts, and escalate to a human agent — all in one thread.

> "Your bank should feel like texting a smart friend who happens to have your account open."

---

## 2. Target Users

| Persona | Description |
|---|---|
| **Retail Customer** | Individual using Wio Pay for daily banking (UAE focus, AED primary currency) |
| **Support Agent** | Internal Wio employee handling escalated conversations |
| **Admin** | Internal operator managing users, permissions, and AI configuration |

---

## 3. Core Features (MVP Scope)

### 3.1 Customer Chat Interface

- Single-screen chat layout (no tab navigation)
- Message input with send button and voice placeholder
- AI responds instantly with text or structured **cards**
- Customer can trigger intents via natural language or quick-action chips

### 3.2 Intent Recognition

The AI resolves the following intent types:

| Intent | Trigger examples |
|---|---|
| `CHECK_BALANCE` | "What's my balance?", "How much do I have?" |
| `TRANSFER_MONEY` | "Send 500 to Ahmed", "Transfer AED 1000 to my savings" |
| `PAY_BILL` | "Pay my Etisalat bill", "Settle my DEWA" |
| `VIEW_TRANSACTIONS` | "Show my last 5 transactions", "What did I spend on?" |
| `FREEZE_CARD` | "Freeze my card", "Block my debit card" |
| `DISPUTE_TRANSACTION` | "I didn't make this payment", "Dispute charge from Amazon" |
| `GET_STATEMENT` | "Download my statement", "Send me my March statement" |
| `ALERT_ACKNOWLEDGEMENT` | Customer replies to a system-generated alert |
| `GENERAL_QUERY` | Anything not matched above — AI handles or escalates |

### 3.3 Payment Flow (Simplified for MVP)

Payments follow a multi-step **flow**:

```
COLLECT_DETAILS → CONFIRM → PROCESSING → DONE | FAILED
```

Each step maps to a `FlowStep` type. The AI surfaces a confirmation card before executing any transaction.

### 3.4 Alert Cards

The system proactively pushes alerts into the chat thread:

- Low balance warning
- Unusual spend detected
- Upcoming bill due
- Payment received notification
- Card used abroad

### 3.5 Agent Escalation

If the AI confidence is low or the customer requests a human:
- Conversation is flagged and routed to the Agent Dashboard
- Agent sees full chat history + account context panel
- Agent can reply directly or push structured cards

---

## 4. Design System

### 4.1 Brand Tokens

| Token | Value | Usage |
|---|---|---|
| `wio-blue` | `#0052CC` | Primary CTA, links, AI bubble border |
| `wio-blue-light` | `#EFF4FF` | AI message bubble background |
| `wio-teal` | `#00B8A9` | Success states, confirmed payments |
| `wio-teal-light` | `#E6FAF9` | Success card backgrounds |
| `wio-slate` | `#1E293B` | Primary text |
| `wio-slate-muted` | `#64748B` | Secondary text, timestamps |
| `wio-red` | `#EF4444` | Error states, freeze confirmations |
| `wio-amber` | `#F59E0B` | Warning alerts |

### 4.2 Typography

- Font: **Inter** (Google Fonts)
- Base size: 14px / `text-sm`
- Heading: 16px semibold / `text-base font-semibold`
- Caption: 12px / `text-xs`

### 4.3 Components

| Component | Description |
|---|---|
| `MessageBubble` | Text message from customer, AI, or agent |
| `BalanceCard` | Shows account balance inline in chat |
| `TransferCard` | Confirmation card for a money transfer |
| `BillCard` | Bill payment summary with due date |
| `AlertCard` | System-generated notification (warning/info/success) |
| `TransactionListCard` | Compact list of recent transactions |
| `QuickActions` | Horizontal chip row for common actions |
| `MessageInput` | Text input + send + attachment area |

---

## 5. Data Models

### 5.1 Core Types

```typescript
type IntentType =
  | "CHECK_BALANCE"
  | "TRANSFER_MONEY"
  | "PAY_BILL"
  | "VIEW_TRANSACTIONS"
  | "FREEZE_CARD"
  | "DISPUTE_TRANSACTION"
  | "GET_STATEMENT"
  | "ALERT_ACKNOWLEDGEMENT"
  | "GENERAL_QUERY";

type FlowStep = "COLLECT_DETAILS" | "CONFIRM" | "PROCESSING" | "DONE" | "FAILED";

interface AmountObject {
  value: number;
  currency: Currency;
  formatted: string; // e.g. "AED 1,500.00"
}

interface WioContact {
  id: string;
  name: string;
  iban?: string;
  phone?: string;
  isFavorite: boolean;
  avatarInitials: string;
}

interface Bill {
  id: string;
  provider: string;        // e.g. "Etisalat", "DEWA"
  accountNumber: string;
  dueDate: Date;
  amount: AmountObject;
  isPaid: boolean;
  logoUrl?: string;
}

interface AlertCard {
  id: string;
  type: "low_balance" | "unusual_spend" | "bill_due" | "payment_received" | "card_abroad";
  severity: "info" | "warning" | "success";
  title: string;
  body: string;
  cta?: { label: string; action: string };
  timestamp: Date;
}

interface TransferSummary {
  id: string;
  toContact: WioContact;
  amount: AmountObject;
  note?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  status: "pending" | "confirmed" | "processing" | "done" | "failed";
  referenceNumber?: string;
}
```

---

## 6. Architecture

```
app/
├── (customer)/          # Customer-facing routes (auth group)
│   ├── chat/            # Main chat screen
│   └── profile/         # Account profile
├── (agent)/             # Agent dashboard (auth group)
│   └── dashboard/
└── api/
    ├── chat/            # AI message handler → LLM
    ├── transfer/        # Payment intent processor
    └── webhooks/        # Supabase realtime / external events

components/
├── chat/                # Chat-specific components
├── cards/               # Inline card components (balance, transfer, etc.)
├── ui/                  # Base shadcn/ui components
└── layout/              # Shell, sidebar, headers

lib/
├── supabase.ts          # Supabase client
├── ai.ts                # AI client (Anthropic / OpenAI)
└── utils.ts

mocks/                   # Seeded local data (Phase 1 only)
types/                   # Shared TypeScript types
```

---

## 7. Supabase Schema (Target)

### Tables

- `users` — auth.users extended with role, profile
- `accounts` — bank accounts per user
- `transactions` — ledger entries
- `conversations` — chat threads
- `messages` — individual messages with sender, content, metadata
- `contacts` — customer address book
- `bills` — bill payment records

### Realtime

- `messages` channel — push new AI/agent messages to customer UI
- `alerts` channel — push proactive system alerts

---

## 8. Phases

| Phase | Scope |
|---|---|
| **Phase 1** | Scaffold, design system, chat UI, mocked data, types |
| **Phase 2** | Supabase auth + DB, real account/transaction data |
| **Phase 3** | AI integration (intent detection, response generation) |
| **Phase 4** | Payment engine (transfer, bill pay) |
| **Phase 5** | Agent dashboard, escalation flows |
| **Phase 6** | Alerts, realtime, push notifications |

---

## 9. Non-Goals (MVP)

- Native mobile app
- Multi-currency wallets
- Crypto
- Open banking / PSD2 integrations
- Full KYC flow
