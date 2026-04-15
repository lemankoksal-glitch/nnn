"use client";

import { Card, CardBody } from "@/components/ui/card";
import { PURPOSE_OPTIONS } from "@/lib/payment-brain/state-machine";
import { cn } from "@/lib/utils";

interface PurposeCardProps {
  isActive?: boolean;
  selectedCode?: string | null;
  onSelect?: (code: string, label: string) => void;
}

export function PurposeCard({
  isActive = true,
  selectedCode,
  onSelect,
}: PurposeCardProps) {
  return (
    <Card className="w-full max-w-xs">
      <CardBody className="pt-4">
        <p className="text-xs text-wio-slate-muted mb-3">
          Purpose of international transfer:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PURPOSE_OPTIONS.map(({ code, label }) => {
            const isSelected = selectedCode === code;
            return (
              <button
                key={code}
                disabled={!isActive}
                onClick={() => onSelect?.(code, label)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left text-xs transition-all",
                  isSelected
                    ? "border-wio-blue bg-wio-blue-light text-wio-blue font-medium"
                    : "border-border bg-white text-wio-slate hover:border-wio-blue hover:bg-wio-blue-light",
                  !isActive && "opacity-60 cursor-default",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
