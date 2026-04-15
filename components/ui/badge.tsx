import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
  children: React.ReactNode;
}

const variantClasses = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-wio-teal-light text-wio-teal",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  error: "bg-red-50 text-red-600 border border-red-200",
  info: "bg-wio-blue-light text-wio-blue",
};

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
