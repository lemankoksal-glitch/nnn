"use client";

import { Card, CardBody } from "@/components/ui/card";
import { MOCK_TRANSACTIONS } from "@/mocks/data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function TransactionListCard() {
  const txns = MOCK_TRANSACTIONS.slice(0, 5);

  return (
    <Card className="w-full max-w-xs">
      <CardBody className="pt-4">
        <p className="text-xs font-semibold text-wio-slate-muted uppercase tracking-wide mb-3">
          Recent Transactions
        </p>
        <div className="space-y-3">
          {txns.map((t) => {
            const isCredit = t.type === "credit";
            const date = new Date(t.timestamp);
            const dateStr = date.toLocaleDateString("en-AE", {
              day: "numeric",
              month: "short",
            });
            return (
              <div key={t.id} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    isCredit
                      ? "bg-wio-teal-light text-wio-teal"
                      : "bg-red-50 text-red-400",
                  )}
                >
                  {isCredit ? "+" : "−"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-wio-slate truncate">
                    {t.merchantName ?? t.description}
                  </p>
                  <p className="text-xs text-wio-slate-muted">{dateStr}</p>
                </div>
                <p
                  className={cn(
                    "text-xs font-semibold shrink-0",
                    isCredit ? "text-wio-teal" : "text-wio-slate",
                  )}
                >
                  {isCredit ? "+" : "−"}{formatCurrency(t.amount, t.currency)}
                </p>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
