"use client";

import { MOCK_FRAUD_ALERTS, type FraudAlert, type RiskLevel } from "@/mocks/ops-data";
import { cn } from "@/lib/utils";

const RISK_COLOURS: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  high:     { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  medium:   { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  low:      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

const TRIGGER_LABELS: Record<string, string> = {
  velocity_spike: "Velocity Spike",
  new_beneficiary: "New Beneficiary",
  high_value_intl: "High-Value Intl",
  structuring: "Structuring",
  velocity: "Velocity",
  geo_anomaly: "Geo Anomaly",
  device_fingerprint: "Device Anomaly",
  card_not_present: "CNP",
  unusual_merchant: "Unusual Merchant",
};

function StatusBadge({ status }: { status: FraudAlert["status"] }) {
  const cfg = {
    open: "bg-red-100 text-red-700",
    investigating: "bg-amber-100 text-amber-700",
    confirmed_fraud: "bg-red-600 text-white",
    false_positive: "bg-slate-100 text-slate-500",
  }[status];
  const label = {
    open: "Open",
    investigating: "Investigating",
    confirmed_fraud: "Confirmed Fraud",
    false_positive: "False Positive",
  }[status];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", cfg)}>
      {label}
    </span>
  );
}

export function FraudPanel() {
  const alerts = MOCK_FRAUD_ALERTS;

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <p className="text-sm font-semibold text-wio-slate">Fraud Analysis</p>
          <p className="text-xs text-wio-slate-muted">
            {alerts.filter((a) => a.status === "open").length} open · {alerts.filter((a) => a.riskLevel === "critical").length} critical
          </p>
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
          <svg className="h-3.5 w-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
          </svg>
        </div>
      </div>

      <div className="divide-y divide-border">
        {alerts.map((alert) => {
          const colours = RISK_COLOURS[alert.riskLevel];
          return (
            <div key={alert.id} className={cn("px-5 py-4 transition-colors hover:bg-muted/30 cursor-pointer", alert.riskLevel === "critical" && "bg-red-50/40")}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wide", colours.bg, colours.text, colours.border)}>
                      {alert.riskLevel}
                    </span>
                    <p className="text-xs font-semibold text-wio-slate">{alert.customerName}</p>
                  </div>
                  <p className="text-xs text-wio-slate-muted">
                    {alert.currency} {alert.amount.toLocaleString("en-AE")} · Ref: {alert.transactionRef.slice(-7)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={alert.status} />
                  {alert.assignedTo && (
                    <p className="text-[10px] text-wio-slate-muted">{alert.assignedTo}</p>
                  )}
                </div>
              </div>

              {/* Trigger chips */}
              <div className="flex flex-wrap gap-1 mb-2">
                {alert.triggers.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                  >
                    {TRIGGER_LABELS[t] ?? t}
                  </span>
                ))}
              </div>

              {/* Risk score bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", {
                      "bg-red-500": alert.riskScore >= 80,
                      "bg-orange-400": alert.riskScore >= 60 && alert.riskScore < 80,
                      "bg-amber-400": alert.riskScore >= 40 && alert.riskScore < 60,
                      "bg-emerald-400": alert.riskScore < 40,
                    })}
                    style={{ width: `${alert.riskScore}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-wio-slate-muted w-8 text-right">
                  {alert.riskScore}
                </span>
              </div>

              {/* Actions */}
              {alert.status === "open" && (
                <div className="flex gap-2 mt-3">
                  <button className="rounded-lg bg-wio-blue px-3 py-1 text-[11px] font-semibold text-white hover:bg-wio-blue/90 transition-colors">
                    Assign to Me
                  </button>
                  <button className="rounded-lg border border-border px-3 py-1 text-[11px] font-semibold text-wio-slate hover:bg-muted transition-colors">
                    Mark False Positive
                  </button>
                  {alert.riskLevel === "critical" && (
                    <button className="rounded-lg bg-red-500 px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-600 transition-colors">
                      Escalate to FIU
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
