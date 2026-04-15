import { OpsTopBar } from "@/components/ops/OpsTopBar";
import { KPICards } from "@/components/ops/KPICards";
import { TransactionQueue } from "@/components/ops/TransactionQueue";
import { FraudPanel } from "@/components/ops/FraudPanel";
import { RFIEngine } from "@/components/ops/RFIEngine";
import { AMLMonitor } from "@/components/ops/AMLMonitor";
import { DisputeCenter } from "@/components/ops/DisputeCenter";

export const metadata = {
  title: "Payment Ops Centre · Wio Pay",
  description: "Internal back-office dashboard for Wio Pay operations",
};

export default function OpsPage() {
  return (
    <div className="flex h-screen flex-col bg-gray-50 overflow-hidden">
      {/* Top bar */}
      <OpsTopBar />

      {/* Main content — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-screen-2xl px-6 py-6 space-y-6">
          {/* Page heading */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-wio-slate">Operations Dashboard</h1>
              <p className="text-xs text-wio-slate-muted">
                {new Date().toLocaleDateString("en-AE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })} · All data is mocked
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-wio-teal-light px-3 py-1.5 text-xs font-medium text-wio-teal">
                <span className="h-1.5 w-1.5 rounded-full bg-wio-teal animate-pulse" />
                Live · Mock
              </div>
              <button className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-wio-slate hover:bg-muted transition-colors">
                Export Report
              </button>
            </div>
          </div>

          {/* KPI row */}
          <KPICards />

          {/* Transaction queue — full width */}
          <TransactionQueue />

          {/* Two-column panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FraudPanel />
            <RFIEngine />
          </div>

          {/* AML + Disputes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AMLMonitor />
            <DisputeCenter />
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-wio-slate-muted pb-4">
            Wio Pay · Payment Operations Centre · Internal Use Only · All data mocked for MVP
          </div>
        </div>
      </div>
    </div>
  );
}
