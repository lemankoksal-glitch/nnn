"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MOCK_KPIS } from "@/mocks/ops-data";

const alertCount = 7 + 12; // fraud + RFIs

export function OpsTopBar() {
  return (
    <header className="flex items-center justify-between bg-wio-slate px-6 py-3 text-white shadow-lg shrink-0">
      {/* Left — logo + title */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-wio-blue">
            <span className="text-xs font-bold text-white">W</span>
          </div>
          <span className="text-sm font-semibold text-white/80">Wio Pay</span>
        </Link>
        <div className="h-4 w-px bg-white/20" />
        <div>
          <p className="text-sm font-semibold">Payment Ops Centre</p>
          <p className="text-xs text-white/50">Internal · Back Office</p>
        </div>
      </div>

      {/* Centre — nav tabs */}
      <nav className="hidden md:flex items-center gap-1">
        {[
          { label: "Dashboard", active: true },
          { label: "Transactions", active: false },
          { label: "Compliance", active: false },
          { label: "Reports", active: false },
        ].map((tab) => (
          <button
            key={tab.label}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors ${
              tab.active
                ? "bg-white/10 text-white"
                : "text-white/50 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Right — agent info + alert badge */}
      <div className="flex items-center gap-3">
        {alertCount > 0 && (
          <div className="relative">
            <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-wio-teal text-xs font-bold text-white">
            LH
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-white">Layla Hassan</p>
            <p className="text-[10px] text-white/50">Senior Ops Analyst</p>
          </div>
        </div>
      </div>
    </header>
  );
}
