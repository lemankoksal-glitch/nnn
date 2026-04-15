"use client";

import { useState } from "react";
import { MOCK_TXN_QUEUE, type OpsTransaction, type RiskLevel } from "@/mocks/ops-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  held: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-600 border-red-200",
  reversed: "bg-slate-100 text-slate-600 border-slate-200",
};

const RISK_DOT: Record<RiskLevel, string> = {
  low: "bg-emerald-400",
  medium: "bg-amber-400",
  high: "bg-orange-500",
  critical: "bg-red-500 animate-pulse",
};

function RiskBadge({ level, score }: { level: RiskLevel; score: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", RISK_DOT[level])} />
      <span className={cn(
        "text-xs font-medium",
        level === "critical" && "text-red-600",
        level === "high" && "text-orange-600",
        level === "medium" && "text-amber-600",
        level === "low" && "text-emerald-600",
      )}>
        {score}
      </span>
    </div>
  );
}

type Filter = "all" | "held" | "high_risk";

export function TransactionQueue() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = MOCK_TXN_QUEUE.filter((t) => {
    if (filter === "held") return t.status === "held";
    if (filter === "high_risk") return t.riskLevel === "high" || t.riskLevel === "critical";
    return true;
  });

  const selected = MOCK_TXN_QUEUE.find((t) => t.id === selectedId);

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <p className="text-sm font-semibold text-wio-slate">Live Transaction Queue</p>
          <p className="text-xs text-wio-slate-muted">
            {MOCK_TXN_QUEUE.filter((t) => t.status === "held").length} held · updates every 30s
          </p>
        </div>
        <div className="flex gap-1">
          {(["all", "held", "high_risk"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f
                  ? "bg-wio-blue text-white"
                  : "bg-muted text-wio-slate-muted hover:bg-wio-blue-light hover:text-wio-blue",
              )}
            >
              {f === "all" ? "All" : f === "held" ? "Held" : "High Risk"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Ref", "Sender → Receiver", "Amount", "Type", "Status", "Risk", "Time", ""].map(
                (h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-wio-slate-muted uppercase tracking-wide">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((txn) => (
              <tr
                key={txn.id}
                onClick={() => setSelectedId(txn.id === selectedId ? null : txn.id)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-wio-blue-light/40",
                  selectedId === txn.id && "bg-wio-blue-light/60",
                  txn.riskLevel === "critical" && "bg-red-50/50",
                )}
              >
                <td className="px-4 py-3 font-mono text-wio-slate">{txn.ref.slice(-7)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-wio-slate truncate max-w-[180px]">{txn.senderName}</p>
                  <p className="text-wio-slate-muted truncate max-w-[180px]">→ {txn.receiverName}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-wio-slate whitespace-nowrap">
                  {txn.currency} {txn.amount.toLocaleString("en-AE")}
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                    txn.type === "international"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-slate-50 text-slate-600 border-slate-200",
                  )}>
                    {txn.type === "international" ? `Intl · ${txn.country}` : "Domestic"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                    STATUS_STYLES[txn.status],
                  )}>
                    {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <RiskBadge level={txn.riskLevel} score={txn.riskScore} />
                </td>
                <td className="px-4 py-3 text-wio-slate-muted whitespace-nowrap">
                  {txn.timestamp.toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3">
                  {txn.status === "held" && (
                    <div className="flex gap-1">
                      <button className="rounded-md bg-wio-blue px-2 py-1 text-[10px] font-semibold text-white hover:bg-wio-blue/90 transition-colors">
                        Release
                      </button>
                      <button className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-wio-slate-muted hover:bg-muted transition-colors">
                        Hold
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded detail panel */}
      {selected && (
        <div className="border-t border-border bg-slate-50 px-5 py-4">
          <p className="text-xs font-semibold text-wio-slate mb-3">
            Transaction Detail — {selected.ref}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-wio-slate-muted mb-0.5">Sender IBAN</p>
              <p className="font-mono text-wio-slate">{selected.senderIban}</p>
            </div>
            <div>
              <p className="text-wio-slate-muted mb-0.5">Receiver IBAN</p>
              <p className="font-mono text-wio-slate">{selected.receiverIban}</p>
            </div>
            <div>
              <p className="text-wio-slate-muted mb-0.5">Channel</p>
              <p className="text-wio-slate capitalize">{selected.channel}</p>
            </div>
            <div>
              <p className="text-wio-slate-muted mb-0.5">Risk Score</p>
              <p className="font-bold text-wio-slate">{selected.riskScore} / 100</p>
            </div>
            {selected.holdReason && (
              <div className="col-span-2">
                <p className="text-wio-slate-muted mb-0.5">Hold Reason</p>
                <p className="text-amber-700">{selected.holdReason}</p>
              </div>
            )}
            {selected.flagReason && (
              <div className="col-span-2">
                <p className="text-wio-slate-muted mb-0.5">Flag Reason</p>
                <p className="text-red-600">{selected.flagReason}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
