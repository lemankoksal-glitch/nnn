"use client";

import { MOCK_KPIS } from "@/mocks/ops-data";
import { cn } from "@/lib/utils";

export function KPICards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {MOCK_KPIS.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-2xl border border-border bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-xs text-wio-slate-muted mb-1 truncate">{kpi.label}</p>
          <p className="text-xl font-bold text-wio-slate font-mono leading-none">
            {kpi.value}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={cn(
                "text-xs font-medium",
                kpi.deltaPositive ? "text-wio-teal" : "text-red-500",
              )}
            >
              {kpi.deltaPositive ? "↑" : "↓"} {kpi.delta}
            </span>
            {kpi.sub && (
              <span className="text-[10px] text-wio-slate-muted truncate">
                {kpi.sub}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
