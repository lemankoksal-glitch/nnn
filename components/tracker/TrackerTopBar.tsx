"use client";

import Link from "next/link";
import type { HeldTransfer } from "@/types";

interface Props {
  transfer: HeldTransfer;
  phase: "awaiting_docs" | "docs_submitted" | "processing" | "delivered";
}

const phaseConfig = {
  awaiting_docs: { label: "Action Required", cls: "bg-amber-100 text-amber-700" },
  docs_submitted: { label: "Under Review", cls: "bg-blue-100 text-blue-700" },
  processing: { label: "Processing", cls: "bg-blue-100 text-blue-700" },
  delivered: { label: "Delivered", cls: "bg-emerald-100 text-emerald-700" },
};

export function TrackerTopBar({ transfer, phase }: Props) {
  const cfg = phaseConfig[phase];

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-border">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors text-wio-slate-muted"
          aria-label="Back to home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-wio-slate truncate">
            Transfer to {transfer.toContact.name}
          </p>
          <p className="text-xs text-wio-slate-muted">
            {transfer.amount.formatted} &middot; Ref {transfer.id.replace("_", "-").toUpperCase()}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full text-[10px] font-semibold px-2.5 py-1 ${cfg.cls}`}
        >
          {cfg.label}
        </span>
      </div>
    </header>
  );
}
