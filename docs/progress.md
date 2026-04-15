# Wio Pay — Build Progress

Last updated: 2026-04-15

---

## Phase 1 — Scaffold ✅

**Status:** Complete  
**Routes:** `/` (landing), `/chat` (chat UI)

### What was built
- Next.js 14 App Router project with TypeScript, Tailwind CSS, shadcn-style primitives
- `tailwind.config.ts` with Wio brand tokens (`wio-blue`, `wio-teal`, `wio-slate`, etc.)
- Full TypeScript type system: `Message`, `IntentType`, `FlowStep`, `AmountObject`, `WioContact`, `Bill`, `AlertCard`, `TransferSummary`, `HeldTransfer`, `SpendingBreakdown`
- `mocks/data.ts` — seeded with: user profile, 2 accounts, 6 contacts (2 with intl IBANs), 5 transactions, 3 bills, 2 system alerts, 1 held transfer
- UI primitives: `Button`, `Avatar`, `Badge`, `Card`, `Input`
- Docs: `docs/wio-pay-spec.md`, `CLAUDE.md` with project rules

---

## Phase 2 — Payment Brain ✅

**Status:** Complete  
**New logic:** `lib/payment-brain/`

### Payment brain modules

| File | Exports |
|---|---|
| `parse.ts` | `parseIntent`, `parseAmount`, `parseRecipient`, `parseFXCurrency`, `parseBiller`, `looksLikeIBAN` |
| `contacts.ts` | `findWioContact`, `getContactById`, `buildAdhocContact` |
| `iban.ts` | `validateIBAN`, `isIntlIBAN`, `formatIBAN`, `ibanCountry` |
| `fx.ts` | `convertFX`, `rateFor`, `rateLabel`, `makeAmount`, `FX_RATES` |
| `state-machine.ts` | `processSendMoney`, `EMPTY_CONTEXT`, `PURPOSE_OPTIONS` |

### State machine

```
idle → got_amount → got_recipient → validating → purpose → summary → confirmed → done
```

Handles:
- ✅ Known contact (exact match)
- ✅ Partial match → contact picker card
- ✅ Unknown contact → add beneficiary card
- ✅ IBAN validation (ISO 13616 mod-97)
- ✅ International IBAN → purpose-of-payment question
- ✅ Domestic summary card → confirm / cancel
- ✅ Success state with reference number

### Chat UI components

| Component | Description |
|---|---|
| `MessageBubble` | Renders text + inline card per message |
| `MessageInput` | Textarea with send button, Shift+Enter for newlines |
| `QuickActions` | Horizontal chip row (6 pre-set actions) |
| `TypingIndicator` | Animated 3-dot bounce |
| `BalanceCard` | Shows both accounts with total |
| `TransferConfirmCard` | Pre-send summary with confirm/cancel |
| `TransferDoneCard` | Success receipt with reference |
| `ContactPickerCard` | Multi-match resolver |
| `AddBeneficiaryCard` | New contact form with IBAN input |
| `PurposeCard` | 8-option purpose grid |
| `TransactionListCard` | Last 5 transactions |

---

## Phase 3 — Proactive Features ✅

**Status:** Complete

### New features

| Feature | Implementation |
|---|---|
| **Proactive alerts bar** | `ProactiveAlertsSection` rendered above chat feed |
| **Held transfer card** | `HeldTransferCard` — release or cancel a held intl transfer |
| **Bill due cards** | `BillDueCard` — compact row per bill, "Pay Now" triggers flow |
| **Budget alert card** | `BudgetAlertCard` — severity-coloured alert (warning/success/info) |
| **Bill payment shortcut** | Known billers (Etisalat, DEWA, Du) skip straight to confirm card |
| **Balance query** | Shows `BalanceCard` |
| **Spending query** | `SpendingCard` with bar chart breakdown by category |
| **Can I afford query** | Compares amount to current balance, gives clear yes/no |
| **FX rate query** | `FXRateCard` with live mock rate for USD/EUR/GBP |
| **Freeze card** | Inline card with confirm/cancel, shows card details |
| **Thanks response** | Friendly acknowledgement, prompts next action |

### New intent patterns added

`THANKS`, `AFFORD_QUERY`, `FX_QUERY`, `SPENDING_QUERY` — all handled in the state machine's `handleNonTransferIntent`.

---

## Phase 4 — Payment Ops Centre ✅

**Status:** Complete  
**Route:** `/ops`

### What was built

| Section | Component | Description |
|---|---|---|
| Top bar | `OpsTopBar` | Agent identity, nav tabs, alert badge |
| KPI row | `KPICards` | 6 metrics: volume, transactions, held, fraud, RFIs, STP rate |
| Transaction queue | `TransactionQueue` | Filterable table (All / Held / High Risk) with expandable detail panel |
| Fraud analysis | `FraudPanel` | Alert list with risk scores, trigger chips, assign/escalate actions |
| RFI engine | `RFIEngine` | Correspondent bank request tracker with overdue highlighting |
| AML monitoring | `AMLMonitor` | AML alerts by trigger type (velocity, structuring, PEP, sanctions) |
| Dispute resolution | `DisputeCenter` | Case table with SLA countdown, status, and assign buttons |

### Mock data (`mocks/ops-data.ts`)
- 6 KPI metrics
- 7 transactions in queue (3 held, 2 flagged critical)
- 4 fraud alerts
- 5 RFIs (2 overdue, 1 responded)
- 5 AML alerts (2 critical, 1 cleared)
- 4 dispute cases (1 SLA breached)

---

## Phase 5 — International Transfer Tracker ✅

**Status:** Complete  
**Route:** `/tracker`

### What was built

| Component | Description |
|---|---|
| `TrackerTopBar` | Sticky header — recipient name, amount, transfer ref, status badge (On Hold / Under Review / Processing / Delivered), back-to-home nav |
| `AmberAlertBanner` | Context-aware banner: amber (awaiting docs) → blue (docs submitted / processing) → green (delivered) |
| `StepTracker` | Vertical 4-step timeline: Initiated ✓ → Compliance Review 🔄 → Bank Processing → Delivered. Active step has animated dot; completed steps have teal checkmark |
| `AssistantBlock` | Human-tone explanation paragraph from Wio that updates with each phase change |
| `DocumentUploadPicker` | Two required doc slots (Source of Funds + Purpose of Transfer). Clicking "Choose file" triggers mock upload with animated progress bar. Submit button enables when both are uploaded |
| `TrackerQuickActions` | Expandable accordion with 3 questions: Why is it paused? / When will it arrive? / Can I cancel? |
| Transfer details card | Read-only summary: recipient, IBAN, amount, reference, initiated time, hold reason |

### Phase progression (all mocked with setTimeout)

```
awaiting_docs → [submit docs] → docs_submitted (3s) → processing (4s) → delivered
```

All UI (banner, step tracker, assistant message, top-bar badge) updates in sync with each phase transition.

---

## Testing the flows

Start the dev server:
```bash
npm run dev
# → http://localhost:3000
```

| Test scenario | Input |
|---|---|
| Balance check | "What's my balance?" or tap **Balance** chip |
| Single recipient transfer | "Send 500 to Sara" |
| Partial match picker | "Send 200 to Ahmed" |
| Unknown contact | "Send 100 to Ibrahim" |
| International transfer | "Send 200 AED to Emily Watson" |
| IBAN entry | "Send 300 to AE600331000000000000000" |
| Bill payment shortcut | "Pay my Etisalat bill" or tap **Pay Bill** chip |
| FX rate | "What's the USD exchange rate?" |
| Can I afford | "Can I afford AED 5000?" |
| Spending breakdown | "Show my spending breakdown" |
| Freeze card | "Freeze my card" |
| Thanks | "Thank you" |
| Held transfer | Use **Release** or **Cancel Transfer** in the proactive bar |
| Transfer tracker | Go to `/tracker` → upload both docs → watch phase progress |

---

## File structure

```
app/
  chat/page.tsx        Customer chat UI
  ops/page.tsx         Payment Ops Centre (Phase 4)
  tracker/page.tsx     International Transfer Tracker (Phase 5)
  layout.tsx
  page.tsx             Landing

components/
  cards/               9 card components
  chat/                5 chat components (+ ProactiveAlertsSection)
  ops/                 7 ops dashboard components (Phase 4)
  tracker/             6 tracker components (Phase 5)
  ui/                  5 primitives

lib/
  payment-brain/       6 modules
  utils.ts

mocks/
  data.ts              Full seeded dataset
  ops-data.ts          Ops Centre data (Phase 4)

types/index.ts         All shared types
docs/
  wio-pay-spec.md
  progress.md          This file
```
