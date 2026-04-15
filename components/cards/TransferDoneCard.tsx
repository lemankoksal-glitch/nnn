"use client";

import { Card, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { WioContact, AmountObject } from "@/types";

interface TransferDoneCardProps {
  toContact: WioContact;
  amount: AmountObject;
  iban: string;
  referenceNumber: string;
  completedAt: string;
  purposeLabel?: string | null;
}

export function TransferDoneCard({
  toContact,
  amount,
  iban,
  referenceNumber,
  completedAt,
  purposeLabel,
}: TransferDoneCardProps) {
  const date = new Date(completedAt);
  const timeStr = date.toLocaleTimeString("en-AE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = date.toLocaleDateString("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="w-full max-w-xs overflow-hidden">
      {/* Success header */}
      <div className="bg-wio-teal px-4 py-4 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-white">Transfer Sent!</p>
        <p className="text-xl font-bold text-white mt-0.5">{amount.formatted}</p>
      </div>

      <CardBody className="pt-4 space-y-3">
        {/* Recipient */}
        <div className="flex items-center gap-3">
          <Avatar
            initials={toContact.avatarInitials}
            colorClass={toContact.avatarColor}
          />
          <div>
            <p className="text-sm font-medium text-wio-slate">{toContact.name}</p>
            <p className="text-xs text-wio-slate-muted font-mono">{iban}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-xs border-t border-border pt-3">
          <div className="flex justify-between">
            <span className="text-wio-slate-muted">Reference</span>
            <span className="font-mono font-medium text-wio-slate">{referenceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-wio-slate-muted">Date & Time</span>
            <span className="text-wio-slate">{dateStr} · {timeStr}</span>
          </div>
          {purposeLabel && (
            <div className="flex justify-between">
              <span className="text-wio-slate-muted">Purpose</span>
              <span className="text-wio-slate">{purposeLabel}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-wio-slate-muted">Status</span>
            <span className="text-wio-teal font-medium">Completed</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
