import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-wio-slate placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-wio-blue/30 focus:border-wio-blue transition-colors",
          error && "border-red-400 focus:ring-red-200",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  ),
);
Input.displayName = "Input";
