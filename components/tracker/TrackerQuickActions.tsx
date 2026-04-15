"use client";

import { cn } from "@/lib/utils";
import type { HeldTransfer } from "@/types";

interface QuickAction {
  id: string;
  question: string;
  answer: (transfer: HeldTransfer) => string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "why_paused",
    question: "Why is it paused?",
    answer: (t) =>
      `International transfers above AED 3,000 require compliance checks under UAE Central Bank regulations. Because ${t.toContact.name} is in Germany, we need to verify the source of funds before we can send. This protects you and ensures the transfer complies with anti-money-laundering rules.`,
  },
  {
    id: "when_arrive",
    question: "When will it arrive?",
    answer: (t) =>
      `Once your documents are approved (usually within a few hours), the transfer typically takes 1–2 business days to reach ${t.toContact.name}'s account. The funds should arrive by ${t.expectedReleaseAt.toLocaleDateString("en-AE", { weekday: "long", day: "numeric", month: "long" })} at the latest.`,
  },
  {
    id: "can_cancel",
    question: "Can I cancel?",
    answer: () =>
      `Yes — you can cancel this transfer at any time while it's on hold. Tap the cancel option in your chat or contact support. Once we release it and the correspondent bank picks it up, cancellation is no longer possible.`,
  },
];

interface Props {
  transfer: HeldTransfer;
  openId: string | null;
  onToggle: (id: string) => void;
}

export function TrackerQuickActions({ transfer, openId, onToggle }: Props) {
  return (
    <div className="rounded-xl bg-white border border-border overflow-hidden">
      <p className="px-5 py-3 text-xs font-semibold text-wio-slate-muted uppercase tracking-wide border-b border-border">
        Quick answers
      </p>
      <div className="divide-y divide-border">
        {QUICK_ACTIONS.map((qa) => {
          const isOpen = openId === qa.id;
          return (
            <div key={qa.id}>
              <button
                onClick={() => onToggle(qa.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-muted/40 transition-colors"
              >
                <span className="text-sm font-medium text-wio-slate">{qa.question}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "shrink-0 text-wio-slate-muted transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-wio-slate-muted leading-relaxed">
                    {qa.answer(transfer)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
