"use client";

import { useState } from "react";
import { HeldTransferCard } from "@/components/cards/HeldTransferCard";
import { BillDueCard } from "@/components/cards/BillDueCard";
import { BudgetAlertCard } from "@/components/cards/BudgetAlertCard";
import { MOCK_HELD_TRANSFER, MOCK_BILLS, MOCK_ALERTS } from "@/mocks/data";
import type { Bill, AlertCard } from "@/types";

interface ProactiveAlertsSectionProps {
  onBillPay: (bill: Bill) => void;
  onAlertAction: (action: string) => void;
  onHeldTransferRelease: () => void;
  onHeldTransferCancel: () => void;
}

export function ProactiveAlertsSection({
  onBillPay,
  onAlertAction,
  onHeldTransferRelease,
  onHeldTransferCancel,
}: ProactiveAlertsSectionProps) {
  const [heldDismissed, setHeldDismissed] = useState(false);
  const [dismissedBills, setDismissedBills] = useState<Set<string>>(new Set());
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const visibleBills = MOCK_BILLS.filter(
    (b) => !b.isPaid && !dismissedBills.has(b.id),
  );
  const visibleAlerts = MOCK_ALERTS.filter(
    (a) => !a.isDismissed && !dismissedAlerts.has(a.id),
  );
  const showHeld = !heldDismissed;

  const hasAnything = showHeld || visibleBills.length > 0 || visibleAlerts.length > 0;
  if (!hasAnything) return null;

  return (
    <div className="border-b border-border bg-gray-50 px-4 py-3 space-y-2">
      {/* Held transfer — most urgent */}
      {showHeld && (
        <HeldTransferCard
          transfer={MOCK_HELD_TRANSFER}
          onDismiss={() => setHeldDismissed(true)}
          onRelease={() => {
            setHeldDismissed(true);
            onHeldTransferRelease();
          }}
          onCancel={() => {
            setHeldDismissed(true);
            onHeldTransferCancel();
          }}
        />
      )}

      {/* Bills due */}
      {visibleBills.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {visibleBills.map((bill) => (
            <BillDueCard
              key={bill.id}
              bill={bill}
              compact
              onDismiss={() => setDismissedBills((prev) => new Set(Array.from(prev).concat(bill.id)))}
              onPay={() => {
                setDismissedBills((prev) => new Set(Array.from(prev).concat(bill.id)));
                onBillPay(bill);
              }}
            />
          ))}
        </div>
      )}

      {/* System alerts */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-2">
          {visibleAlerts.map((alert) => (
            <BudgetAlertCard
              key={alert.id}
              alert={alert}
              onDismiss={() => setDismissedAlerts((prev) => new Set(Array.from(prev).concat(alert.id)))}
              onAction={(action) => {
                setDismissedAlerts((prev) => new Set(Array.from(prev).concat(alert.id)));
                onAlertAction(action);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
