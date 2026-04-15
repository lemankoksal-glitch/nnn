"use client";

import { cn } from "@/lib/utils";
import { BalanceCard } from "@/components/cards/BalanceCard";
import { TransferConfirmCard } from "@/components/cards/TransferConfirmCard";
import { TransferDoneCard } from "@/components/cards/TransferDoneCard";
import { ContactPickerCard } from "@/components/cards/ContactPickerCard";
import { AddBeneficiaryCard } from "@/components/cards/AddBeneficiaryCard";
import { PurposeCard } from "@/components/cards/PurposeCard";
import { TransactionListCard } from "@/components/cards/TransactionListCard";
import { FXRateCard } from "@/components/cards/FXRateCard";
import { SpendingCard } from "@/components/cards/SpendingCard";
import { BillPayConfirmCard } from "@/components/cards/BillPayConfirmCard";
import { MOCK_BILLS, MOCK_SPENDING } from "@/mocks/data";
import type { BrainCard } from "@/lib/payment-brain";
import type { WioContact, AmountObject, Currency } from "@/types";

// ─── Card callbacks ─────────────────────────────────────────────────────────────

export interface CardCallbacks {
  onContactSelected: (contactId: string) => void;
  onIbanSubmitted: (iban: string, name: string) => void;
  onPurposeSelected: (code: string, label: string) => void;
  onConfirm: () => void;
  onBillConfirm: (billerName: string) => void;
  onCancel: () => void;
}

// ─── Inline markdown renderer (minimal) ────────────────────────────────────────

function renderText(text: string) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Card renderer ──────────────────────────────────────────────────────────────

function InlineCardRenderer({
  card,
  isActive,
  callbacks,
}: {
  card: BrainCard;
  isActive: boolean;
  callbacks: CardCallbacks;
}) {
  switch (card.type) {
    case "balance_summary":
      return <BalanceCard />;

    case "transaction_list":
      return <TransactionListCard />;

    case "contact_picker":
      return (
        <ContactPickerCard
          matches={card.data.matches as WioContact[]}
          amount={card.data.amount as AmountObject | null}
          isActive={isActive}
          onSelect={callbacks.onContactSelected}
        />
      );

    case "add_beneficiary":
      return (
        <AddBeneficiaryCard
          prefilledName={(card.data.prefilledName as string) ?? ""}
          prefilledIban={(card.data.prefilledIban as string) ?? ""}
          error={card.data.error as string | undefined}
          isActive={isActive}
          onSubmit={callbacks.onIbanSubmitted}
        />
      );

    case "purpose_picker":
      return (
        <PurposeCard
          isActive={isActive}
          onSelect={callbacks.onPurposeSelected}
        />
      );

    case "transfer_confirm":
      return (
        <TransferConfirmCard
          toContact={card.data.toContact as WioContact}
          amount={card.data.amount as AmountObject}
          iban={card.data.iban as string}
          isIntl={card.data.isIntl as boolean}
          country={card.data.country as string}
          purposeLabel={card.data.purposeLabel as string | null}
          isActive={isActive}
          onConfirm={callbacks.onConfirm}
          onCancel={callbacks.onCancel}
        />
      );

    case "transfer_done":
      return (
        <TransferDoneCard
          toContact={card.data.toContact as WioContact}
          amount={card.data.amount as AmountObject}
          iban={card.data.iban as string}
          referenceNumber={card.data.referenceNumber as string}
          completedAt={card.data.completedAt as string}
          purposeLabel={card.data.purposeLabel as string | null}
        />
      );

    case "freeze_confirm":
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 max-w-xs w-full">
          <p className="text-sm font-semibold text-red-700 mb-1">Freeze Debit Card</p>
          <p className="text-xs text-red-600 mb-3">Card ending in 3891 will be instantly blocked. No new purchases, ATM, or online payments.</p>
          {isActive ? (
            <div className="flex gap-2">
              <button onClick={callbacks.onCancel} className="flex-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 transition-colors">
                Cancel
              </button>
              <button onClick={callbacks.onConfirm} className="flex-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white hover:bg-red-600 transition-colors">
                Freeze Card
              </button>
            </div>
          ) : (
            <p className="text-xs text-red-500 font-medium">Card frozen successfully.</p>
          )}
        </div>
      );

    case "fx_rate":
      return (
        <FXRateCard
          fromCurrency={(card.data.fromCurrency as Currency) ?? "AED"}
          toCurrency={card.data.toCurrency as Currency}
          amount={card.data.amount as number | undefined}
        />
      );

    case "spending_breakdown":
      return <SpendingCard breakdown={MOCK_SPENDING} />;

    case "bill_pay_confirm": {
      const billerName = card.data.billerName as string;
      const bill = MOCK_BILLS.find(
        (b) => b.provider.toLowerCase() === billerName.toLowerCase(),
      );
      if (!bill) return (
        <div className="rounded-2xl border border-border bg-white px-4 py-3 max-w-xs text-sm text-wio-slate-muted">
          No unpaid {billerName} bill found.
        </div>
      );
      return (
        <BillPayConfirmCard
          bill={bill}
          isActive={isActive}
          onConfirm={() => callbacks.onBillConfirm(billerName)}
          onCancel={callbacks.onCancel}
        />
      );
    }

    case "bill_pay_done":
      return (
        <div className="rounded-2xl border border-wio-teal/30 bg-wio-teal-light px-4 py-3 max-w-xs">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-wio-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-wio-teal">Bill Paid!</p>
              <p className="text-xs text-wio-slate-muted">
                {card.data.billerName as string} · {card.data.amount as string} · Ref: {card.data.ref as string}
              </p>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

// ─── Message bubble ─────────────────────────────────────────────────────────────

export interface UIMessage {
  id: string;
  sender: "customer" | "ai";
  text?: string;
  card?: BrainCard;
  timestamp: Date;
  /** Only the most-recent interactive card should be active */
  isCardActive?: boolean;
}

interface MessageBubbleProps {
  message: UIMessage;
  callbacks: CardCallbacks;
}

export function MessageBubble({ message, callbacks }: MessageBubbleProps) {
  const isCustomer = message.sender === "customer";

  return (
    <div
      className={cn(
        "flex items-end gap-2 px-4 py-1 animate-fade-in",
        isCustomer ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      {!isCustomer && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-wio-blue">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className={cn("flex flex-col gap-1.5 max-w-[75%]", isCustomer && "items-end")}>
        {/* Text bubble */}
        {message.text && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              isCustomer
                ? "rounded-br-sm bg-wio-blue text-white"
                : "rounded-bl-sm bg-wio-blue-light text-wio-slate border border-wio-blue/10",
            )}
          >
            {renderText(message.text)}
          </div>
        )}

        {/* Inline card */}
        {message.card && (
          <InlineCardRenderer
            card={message.card}
            isActive={message.isCardActive ?? false}
            callbacks={callbacks}
          />
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-wio-slate-muted px-1">
          {message.timestamp.toLocaleTimeString("en-AE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
