"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { HeldTransfer } from "@/types";

interface HeldTransferCardProps {
  transfer: HeldTransfer;
  onRelease?: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
}

export function HeldTransferCard({
  transfer,
  onRelease,
  onCancel,
  onDismiss,
}: HeldTransferCardProps) {
  const releaseDate = transfer.expectedReleaseAt.toLocaleDateString("en-AE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-3 top-3 text-amber-400 hover:text-amber-600 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-900">Transfer on Hold</p>
          <p className="text-xs text-amber-700">{transfer.holdReasonLabel}</p>
        </div>
      </div>

      {/* Transfer details */}
      <div className="flex items-center gap-3 mb-3 rounded-xl bg-white px-3 py-2.5 border border-amber-100">
        <Avatar
          initials={transfer.toContact.avatarInitials}
          colorClass={transfer.toContact.avatarColor}
          size="sm"
        />
        <div className="flex-1">
          <p className="text-xs font-medium text-wio-slate">{transfer.toContact.name}</p>
          <p className="text-xs text-wio-slate-muted">Est. release: {releaseDate}</p>
        </div>
        <p className="text-sm font-bold text-amber-800">{transfer.amount.formatted}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-100"
          onClick={onCancel}
        >
          Cancel Transfer
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
          onClick={onRelease}
        >
          Release
        </Button>
      </div>
    </div>
  );
}
