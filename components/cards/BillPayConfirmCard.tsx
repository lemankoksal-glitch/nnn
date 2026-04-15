"use client";

import { Card, CardBody, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Bill } from "@/types";

interface BillPayConfirmCardProps {
  bill: Bill;
  isActive?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

function daysLabel(date: Date): string {
  const diff = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `Due in ${diff} days`;
}

export function BillPayConfirmCard({
  bill,
  isActive = true,
  onConfirm,
  onCancel,
}: BillPayConfirmCardProps) {
  const days = Math.ceil((bill.dueDate.getTime() - Date.now()) / 86_400_000);
  const urgency = days < 0 ? "error" : days <= 3 ? "warning" : "info";

  return (
    <Card className="w-full max-w-xs">
      <CardBody className="pt-4">
        {/* Biller */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-wio-slate">{bill.provider}</p>
            <p className="text-xs text-wio-slate-muted">Acct: {bill.accountNumber}</p>
          </div>
          <Badge variant={urgency}>{daysLabel(bill.dueDate)}</Badge>
        </div>

        {/* Amount */}
        <div className="rounded-xl bg-wio-blue-light px-4 py-3 text-center mb-3">
          <p className="text-xs text-wio-slate-muted mb-0.5">Amount to pay</p>
          <p className="text-xl font-bold text-wio-blue">{bill.amount.formatted}</p>
        </div>

        {/* Details */}
        <div className="text-xs text-wio-slate-muted space-y-1.5">
          <div className="flex justify-between">
            <span>Due date</span>
            <span className="text-wio-slate">
              {bill.dueDate.toLocaleDateString("en-AE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Payment fee</span>
            <span className="text-wio-slate">Free</span>
          </div>
          <div className="flex justify-between">
            <span>Processing</span>
            <span className="text-wio-slate">Instant</span>
          </div>
        </div>
      </CardBody>

      {isActive ? (
        <CardFooter className="gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" className="flex-1" onClick={onConfirm}>
            Pay Now
          </Button>
        </CardFooter>
      ) : (
        <div className="px-4 pb-3 pt-1">
          <Badge variant="success" className="text-xs">Payment submitted</Badge>
        </div>
      )}
    </Card>
  );
}
