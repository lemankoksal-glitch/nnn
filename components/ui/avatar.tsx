import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  colorClass?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({
  initials,
  colorClass = "bg-wio-blue",
  size = "md",
  className,
}: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none",
        {
          "h-7 w-7 text-xs": size === "sm",
          "h-9 w-9 text-sm": size === "md",
          "h-11 w-11 text-base": size === "lg",
        },
        colorClass,
        className,
      )}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}
