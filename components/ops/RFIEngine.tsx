"use client";

import { MOCK_RFIS, type RFI } from "@/mocks/ops-data";
import { cn } from "@/lib/utils";

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

function StatusPill({ status }: { status: RFI["status"] }) {
  const cfg = {
    open:      "bg-blue-50 text-blue-700 border-blue-200",
    responded: "bg-emerald-50 text-emerald-700 border-emerald-200",
    overdue:   "bg-red-50 text-red-600 border-red-200",
    closed:    "bg-slate-100 text-slate-500 border-slate-200",
  }[status];
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize", cfg)}>
      {status}
    </span>
  );
}

function DueBadge({ dueAt }: { dueAt: Date }) {
  const days = daysUntil(dueAt);
  if (days < 0) return <span className="text-[10px] font-semibold text-red-600">{Math.abs(days)}d overdue</span>;
  if (days === 0) return <span className="text-[10px] font-semibold text-amber-600">Due today</span>;
  if (days <= 2) return <span className="text-[10px] font-semibold text-amber-500">Due in {days}d</span>;
  return <span className="text-[10px] text-wio-slate-muted">Due in {days}d</span>;
}

export function RFIEngine() {
  const rfis = MOCK_RFIS;
  const overdue = rfis.filter((r) => r.status === "overdue").length;
  const open = rfis.filter((r) => r.status === "open").length;

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <p className="text-sm font-semibold text-wio-slate">Correspondent Bank RFI Engine</p>
          <p className="text-xs text-wio-slate-muted">
            {open} open · <span className="text-red-600 font-medium">{overdue} overdue</span>
          </p>
        </div>
        <button className="rounded-lg bg-wio-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-wio-blue/90 transition-colors">
          New RFI
        </button>
      </div>

      <div className="divide-y divide-border">
        {rfis.map((rfi) => (
          <div
            key={rfi.id}
            className={cn(
              "px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors",
              rfi.status === "overdue" && "bg-red-50/30",
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-xs font-semibold text-wio-slate">{rfi.correspondentBank}</p>
                  <span className="text-[10px] text-wio-slate-muted">·</span>
                  <p className="text-[10px] text-wio-slate-muted">{rfi.country}</p>
                </div>
                <p className="text-xs text-wio-slate-muted">
                  {rfi.queryTypeLabel} · {rfi.currency} {rfi.amount.toLocaleString("en-AE")} · Ref: {rfi.transactionRef.slice(-7)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <StatusPill status={rfi.status} />
                <DueBadge dueAt={rfi.dueAt} />
              </div>
            </div>

            {rfi.notes && (
              <p className="text-[11px] text-wio-slate-muted leading-relaxed mb-2 line-clamp-2">
                {rfi.notes}
              </p>
            )}

            {(rfi.status === "open" || rfi.status === "overdue") && (
              <div className="flex gap-2 mt-2">
                <button className="rounded-lg bg-wio-blue px-3 py-1 text-[11px] font-semibold text-white hover:bg-wio-blue/90 transition-colors">
                  Respond
                </button>
                <button className="rounded-lg border border-border px-3 py-1 text-[11px] text-wio-slate-muted hover:bg-muted transition-colors">
                  Request Extension
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
