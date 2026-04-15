"use client";

import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  message: string;
  icon?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Balance", message: "What's my balance?", icon: "💰" },
  { label: "Send Money", message: "Send 500 AED to Ahmed", icon: "↗" },
  { label: "Transactions", message: "Show my last 5 transactions", icon: "📋" },
  { label: "Pay Bill", message: "Pay my Etisalat bill", icon: "🧾" },
  { label: "Freeze Card", message: "Freeze my card", icon: "🔒" },
  { label: "International", message: "Send 200 AED to Emily Watson", icon: "🌍" },
];

interface QuickActionsProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
}

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => !disabled && onSelect(action.message)}
          disabled={disabled}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-wio-slate whitespace-nowrap transition-colors",
            !disabled && "hover:border-wio-blue hover:bg-wio-blue-light hover:text-wio-blue",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {action.icon && <span className="text-sm leading-none">{action.icon}</span>}
          {action.label}
        </button>
      ))}
    </div>
  );
}
