"use client";

import { MOCK_AML_ALERTS, type AMLAlert, type RiskLevel } from "@/mocks/ops-data";
import { cn } from "@/lib/utils";

const RISK_BADGE: Record<RiskLevel, string> = {
  critical: "bg-red-100 text-red-700 border-red-300",
  high:     "bg-orange-100 text-orange-700 border-orange-300",
  medium:   "bg-amber-100 text-amber-700 border-amber-300",
  low:      "bg-emerald-100 text-emerald-700 border-emerald-300",
};

const TRIGGER_ICON: Record<string, string> = {
  velocity:       "⚡",
  structuring:    "🔢",
  sanctions_hit:  "🚫",
  geo_anomaly:    "🌍",
  dark_web:       "🕸",
  pep:            "👤",
};

function AMLStatusPill({ status }: { status: AMLAlert["status"] }) {
  const cfg = {
    open:              "bg-blue-50 text-blue-700 border-blue-200",
    cleared:           "bg-slate-100 text-slate-500 border-slate-200",
    escalated_to_fiu:  "bg-red-100 text-red-700 border-red-200",
    sar_filed:         "bg-purple-100 text-purple-700 border-purple-200",
  }[status];
  const labels: Record<AMLAlert["status"], string> = {
    open: "Open",
    cleared: "Cleared",
    escalated_to_fiu: "Escalated → FIU",
    sar_filed: "SAR Filed",
  };
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", cfg)}>
      {labels[status]}
    </span>
  );
}

export function AMLMonitor() {
  const alerts = MOCK_AML_ALERTS;

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <p className="text-sm font-semibold text-wio-slate">AML Monitoring</p>
          <p className="text-xs text-wio-slate-muted">
            {alerts.filter((a) => a.status === "open").length} open alerts · {alerts.filter((a) => a.riskLevel === "critical").length} critical
          </p>
        </div>
        <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-wio-slate hover:bg-muted transition-colors">
          File SAR
        </button>
      </div>

      <div className="divide-y divide-border">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "px-5 py-4 hover:bg-muted/20 transition-colors",
              alert.riskLevel === "critical" && alert.status === "open" && "bg-red-50/30",
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-base leading-none">{TRIGGER_ICON[alert.trigger]}</span>
                  <p className="text-xs font-semibold text-wio-slate">{alert.customerName}</p>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", RISK_BADGE[alert.riskLevel])}>
                    {alert.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-wio-slate-muted">
                  {alert.triggerLabel} · {alert.currency} {alert.amount.toLocaleString("en-AE")}
                </p>
              </div>
              <AMLStatusPill status={alert.status} />
            </div>

            <p className="text-[11px] text-wio-slate-muted leading-relaxed mb-2 line-clamp-2">
              {alert.details}
            </p>

            <p className="text-[10px] text-wio-slate-muted">
              Detected: {alert.detectedAt.toLocaleString("en-AE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>

            {alert.status === "open" && (
              <div className="flex gap-2 mt-3 flex-wrap">
                <button className="rounded-lg bg-wio-blue px-3 py-1 text-[11px] font-semibold text-white hover:bg-wio-blue/90 transition-colors">
                  Investigate
                </button>
                <button className="rounded-lg border border-border px-3 py-1 text-[11px] text-wio-slate-muted hover:bg-muted transition-colors">
                  Clear Alert
                </button>
                {alert.riskLevel === "critical" && (
                  <button className="rounded-lg bg-red-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-600 transition-colors">
                    Escalate to FIU
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
