"use client";

import { Card, CardBody } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { SpendingBreakdown } from "@/types";

interface SpendingCardProps {
  breakdown: SpendingBreakdown;
}

const BAR_COLORS = [
  "bg-wio-blue",
  "bg-wio-teal",
  "bg-purple-400",
  "bg-orange-400",
  "bg-pink-400",
  "bg-slate-300",
];

export function SpendingCard({ breakdown }: SpendingCardProps) {
  return (
    <Card className="w-full max-w-xs">
      <CardBody className="pt-4">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="text-xs text-wio-slate-muted uppercase tracking-wide font-semibold">Spending</p>
            <p className="text-xs text-wio-slate-muted">{breakdown.period}</p>
          </div>
          <p className="text-base font-bold text-wio-slate">
            {formatCurrency(breakdown.total, breakdown.currency)}
          </p>
        </div>

        <div className="space-y-3">
          {breakdown.categories.map((cat, i) => (
            <div key={cat.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-wio-slate">{cat.label}</span>
                <span className="text-xs font-medium text-wio-slate">
                  {formatCurrency(cat.amount, cat.currency)}
                </span>
              </div>
              {/* Bar */}
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", BAR_COLORS[i % BAR_COLORS.length])}
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
