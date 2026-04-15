"use client";

import type { AlertCard } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BudgetAlertCardProps {
  alert: AlertCard;
  onAction?: (action: string) => void;
  onDismiss?: () => void;
}

const severityConfig = {
  warning: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    icon: (
      <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    iconBg: "bg-amber-100",
    badgeVariant: "warning" as const,
    titleColor: "text-amber-900",
    bodyColor: "text-amber-800",
  },
  success: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    icon: (
      <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: "bg-emerald-100",
    badgeVariant: "success" as const,
    titleColor: "text-emerald-900",
    bodyColor: "text-emerald-800",
  },
  info: {
    border: "border-wio-blue/20",
    bg: "bg-wio-blue-light",
    icon: (
      <svg className="h-4 w-4 text-wio-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
    iconBg: "bg-wio-blue/10",
    badgeVariant: "info" as const,
    titleColor: "text-wio-slate",
    bodyColor: "text-wio-slate-muted",
  },
};

export function BudgetAlertCard({ alert, onAction, onDismiss }: BudgetAlertCardProps) {
  const cfg = severityConfig[alert.severity];

  return (
    <div className={cn("relative rounded-2xl border p-4 shadow-sm", cfg.border, cfg.bg)}>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-3 top-3 text-wio-slate-muted/60 hover:text-wio-slate transition-colors"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="flex items-start gap-3">
        <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", cfg.iconBg)}>
          {cfg.icon}
        </div>
        <div className="flex-1 pr-6">
          <p className={cn("text-sm font-semibold", cfg.titleColor)}>{alert.title}</p>
          <p className={cn("text-xs mt-0.5 leading-relaxed", cfg.bodyColor)}>{alert.body}</p>
          {alert.cta && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3 text-xs h-7"
              onClick={() => onAction?.(alert.cta!.action)}
            >
              {alert.cta.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
