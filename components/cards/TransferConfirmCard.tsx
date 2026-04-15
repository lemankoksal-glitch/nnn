"use client";

import { Card, CardBody, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { WioContact, AmountObject } from "@/types";

interface TransferConfirmCardProps {
  toContact: WioContact;
  amount: AmountObject;
  iban: string;
  isIntl?: boolean;
  country?: string;
  purposeLabel?: string | null;
  isActive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function TransferConfirmCard({
  toContact,
  amount,
  iban,
  isIntl = false,
  country,
  purposeLabel,
  isActive = true,
  onConfirm,
  onCancel,
}: TransferConfirmCardProps) {
  return (
    <Card className="w-full max-w-xs">
      <CardBody className="pt-4">
        {/* Recipient */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar
            initials={toContact.avatarInitials}
            colorClass={toContact.avatarColor}
            size="lg"
          />
          <div>
            <p className="font-semibold text-wio-slate text-sm">{toContact.name}</p>
            <p className="text-xs text-wio-slate-muted font-mono">{iban}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="rounded-xl bg-wio-blue-light px-4 py-3 text-center mb-3">
          <p className="text-xs text-wio-slate-muted mb-0.5">You send</p>
          <p className="text-xl font-bold text-wio-blue">{amount.formatted}</p>
        </div>

        {/* Metadata rows */}
        <div className="space-y-1.5 text-xs">
          {isIntl && country && (
            <div className="flex justify-between text-wio-slate-muted">
              <span>Destination</span>
              <div className="flex items-center gap-1">
                <Badge variant="warning">International</Badge>
                <span className="text-wio-slate">{country}</span>
              </div>
            </div>
          )}
          {purposeLabel && (
            <div className="flex justify-between text-wio-slate-muted">
              <span>Purpose</span>
              <span className="text-wio-slate">{purposeLabel}</span>
            </div>
          )}
          <div className="flex justify-between text-wio-slate-muted">
            <span>Fee</span>
            <span className="text-wio-slate">{isIntl ? "AED 10.00" : "Free"}</span>
          </div>
          <div className="flex justify-between text-wio-slate-muted">
            <span>Arrives</span>
            <span className="text-wio-slate">{isIntl ? "1–3 business days" : "Instant"}</span>
          </div>
        </div>
      </CardBody>

      {isActive ? (
        <CardFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={onConfirm}
          >
            Confirm & Send
          </Button>
        </CardFooter>
      ) : (
        <div className="px-4 pb-3 pt-1">
          <Badge variant="info" className="text-xs">Submitted</Badge>
        </div>
      )}
    </Card>
  );
}
