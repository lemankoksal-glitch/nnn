"use client";

import { Card, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import type { WioContact, AmountObject } from "@/types";

interface ContactPickerCardProps {
  matches: WioContact[];
  amount: AmountObject | null;
  isActive?: boolean;
  onSelect?: (contactId: string) => void;
}

export function ContactPickerCard({
  matches,
  amount,
  isActive = true,
  onSelect,
}: ContactPickerCardProps) {
  return (
    <Card className="w-full max-w-xs">
      <CardBody className="pt-4">
        <p className="text-xs text-wio-slate-muted mb-3">
          {amount ? `Sending ${amount.formatted} — select recipient:` : "Select a contact:"}
        </p>
        <div className="space-y-1">
          {matches.map((c) => (
            <button
              key={c.id}
              disabled={!isActive}
              onClick={() => onSelect?.(c.id)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-wio-blue-light disabled:opacity-50 disabled:cursor-default"
            >
              <Avatar
                initials={c.avatarInitials}
                colorClass={c.avatarColor}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-wio-slate">{c.name}</p>
                {c.iban && (
                  <p className="text-xs text-wio-slate-muted font-mono truncate">
                    {c.iban.replace(/(.{4})/g, "$1 ").trim()}
                  </p>
                )}
              </div>
              {c.isFavorite && (
                <svg className="h-3.5 w-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
