"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Bill } from "@/types";

interface BillDueCardProps {
  bill: Bill;
  compact?: boolean; // compact = proactive bar style; full = chat card style
  onPay?: () => void;
  onDismiss?: () => void;
}

function daysUntil(date: Date): number {
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

function urgencyVariant(days: number): "error" | "warning" | "info" {
  if (days < 0) return "error";
  if (days <= 3) return "warning";
  return "info";
}

function urgencyLabel(days: number): string {
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) > 1 ? "s" : ""}`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export function BillDueCard({ bill, compact = false, onPay, onDismiss }: BillDueCardProps) {
  const days = daysUntil(bill.dueDate);
  const variant = urgencyVariant(days);
  const label = urgencyLabel(days);

  if (compact) {
    return (
      <div className="relative flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 shadow-sm min-w-[240px]">
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-semibold text-wio-slate">{bill.provider}</p>
            <Badge variant={variant}>{label}</Badge>
          </div>
          <p className="text-sm font-bold text-wio-blue">{bill.amount.formatted}</p>
        </div>
        <Button size="sm" variant="primary" onClick={onPay} className="ml-4 shrink-0">
          Pay Now
        </Button>
      </div>
    );
  }

  // Full card (shown inside chat)
  return (
    <div className="rounded-2xl border border-border bg-white w-full max-w-xs overflow-hidden shadow-sm">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-wio-slate">{bill.provider}</p>
            <p className="text-xs text-wio-slate-muted">Acct: {bill.accountNumber}</p>
          </div>
          <Badge variant={variant}>{label}</Badge>
        </div>
        <div className="rounded-xl bg-wio-blue-light px-4 py-3 text-center mb-3">
          <p className="text-xs text-wio-slate-muted mb-0.5">Amount Due</p>
          <p className="text-xl font-bold text-wio-blue">{bill.amount.formatted}</p>
        </div>
        <div className="text-xs text-wio-slate-muted space-y-1">
          <div className="flex justify-between">
            <span>Due date</span>
            <span className="text-wio-slate">
              {bill.dueDate.toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Fee</span>
            <span className="text-wio-slate">Free</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 border-t border-border px-4 py-3">
        <Button variant="outline" size="sm" className="flex-1" onClick={onDismiss}>
          Dismiss
        </Button>
        <Button variant="primary" size="sm" className="flex-1" onClick={onPay}>
          Pay {bill.amount.formatted}
        </Button>
      </div>
    </div>
  );
}
