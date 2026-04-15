"use client";

import { MOCK_DISPUTES, type Dispute } from "@/mocks/ops-data";
import { cn } from "@/lib/utils";

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

function SLABadge({ dueAt }: { dueAt: Date }) {
  const days = daysUntil(dueAt);
  if (days < 0) return <span className="text-[10px] font-semibold text-red-600">SLA breached</span>;
  if (days === 0) return <span className="text-[10px] font-semibold text-red-500">Due today</span>;
  if (days <= 2) return <span className="text-[10px] font-semibold text-amber-600">{days}d left</span>;
  return <span className="text-[10px] text-wio-slate-muted">{days}d left</span>;
}

function StatusPill({ status }: { status: Dispute["status"] }) {
  const cfg: Record<Dispute["status"], string> = {
    open:                "bg-blue-50 text-blue-700 border-blue-200",
    under_review:        "bg-amber-50 text-amber-700 border-amber-200",
    resolved_customer:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    resolved_merchant:   "bg-slate-100 text-slate-600 border-slate-200",
    escalated:           "bg-red-50 text-red-600 border-red-200",
  };
  const labels: Record<Dispute["status"], string> = {
    open: "Open",
    under_review: "Under Review",
    resolved_customer: "Resolved (Customer)",
    resolved_merchant: "Resolved (Merchant)",
    escalated: "Escalated",
  };
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", cfg[status])}>
      {labels[status]}
    </span>
  );
}

export function DisputeCenter() {
  const disputes = MOCK_DISPUTES;
  const open = disputes.filter((d) => d.status !== "resolved_customer" && d.status !== "resolved_merchant").length;

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <p className="text-sm font-semibold text-wio-slate">Dispute Resolution Centre</p>
          <p className="text-xs text-wio-slate-muted">{open} active cases</p>
        </div>
        <button className="rounded-lg bg-wio-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-wio-blue/90 transition-colors">
          New Case
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Case Ref", "Customer", "Merchant", "Amount", "Category", "Status", "SLA", "Assigned"].map(
                (h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-wio-slate-muted uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {disputes.map((d) => (
              <tr
                key={d.id}
                className={cn(
                  "hover:bg-wio-blue-light/30 transition-colors cursor-pointer",
                  d.status === "escalated" && "bg-red-50/30",
                )}
              >
                <td className="px-4 py-3 font-mono text-wio-slate">{d.caseRef}</td>
                <td className="px-4 py-3 font-medium text-wio-slate">{d.customerName}</td>
                <td className="px-4 py-3 text-wio-slate-muted max-w-[120px] truncate">{d.merchant}</td>
                <td className="px-4 py-3 font-semibold text-wio-slate whitespace-nowrap">
                  {d.currency} {d.amount.toLocaleString("en-AE")}
                </td>
                <td className="px-4 py-3 text-wio-slate-muted">{d.categoryLabel}</td>
                <td className="px-4 py-3">
                  <StatusPill status={d.status} />
                </td>
                <td className="px-4 py-3">
                  <SLABadge dueAt={d.slaDueAt} />
                </td>
                <td className="px-4 py-3 text-wio-slate-muted">
                  {d.assignedAgent ?? (
                    <button className="rounded-md bg-wio-blue-light text-wio-blue px-2 py-0.5 text-[10px] font-medium hover:bg-wio-blue hover:text-white transition-colors">
                      Assign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
