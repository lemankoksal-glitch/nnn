"use client";

import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_ACCOUNTS } from "@/mocks/data";
import { formatCurrency } from "@/lib/utils";

export function BalanceCard() {
  const total = MOCK_ACCOUNTS.reduce((sum, a) => sum + a.balance, 0);

  return (
    <Card className="w-full max-w-xs overflow-hidden">
      <div className="bg-wio-blue px-4 pt-4 pb-5">
        <p className="text-xs text-white/70 mb-1">Total Balance</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(total)}</p>
      </div>
      <CardBody className="pt-3 space-y-2">
        {MOCK_ACCOUNTS.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <Badge variant="info">{account.type}</Badge>
              <span className="text-wio-slate-muted">{account.label}</span>
            </div>
            <span className="font-semibold text-wio-slate">
              {formatCurrency(account.balance, account.currency)}
            </span>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
