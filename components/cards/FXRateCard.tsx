"use client";

import { Card, CardBody } from "@/components/ui/card";
import { FX_RATES, rateLabel } from "@/lib/payment-brain/fx";
import type { Currency } from "@/types";

interface FXRateCardProps {
  fromCurrency?: Currency;
  toCurrency: Currency;
  amount?: number; // optional: how much they're converting
}

const CURRENCY_FLAGS: Record<Currency, string> = {
  AED: "🇦🇪",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
};

const CURRENCY_NAMES: Record<Currency, string> = {
  AED: "UAE Dirham",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
};

export function FXRateCard({
  fromCurrency = "AED",
  toCurrency,
  amount,
}: FXRateCardProps) {
  const rate = FX_RATES[toCurrency] / FX_RATES[fromCurrency];
  const convertedAmount = amount ? amount * rate : null;

  const fmt = (val: number, cur: Currency) =>
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 4,
    }).format(val);

  return (
    <Card className="w-full max-w-xs">
      <CardBody className="pt-4">
        <p className="text-xs font-semibold text-wio-slate-muted uppercase tracking-wide mb-3">
          Exchange Rate
        </p>

        {/* Rate row */}
        <div className="flex items-center justify-between rounded-xl bg-wio-blue-light px-4 py-3 mb-3">
          <div className="text-center">
            <p className="text-lg">{CURRENCY_FLAGS[fromCurrency]}</p>
            <p className="text-xs font-semibold text-wio-slate">{fromCurrency}</p>
            <p className="text-[10px] text-wio-slate-muted">{CURRENCY_NAMES[fromCurrency]}</p>
          </div>

          <div className="text-center px-3">
            <p className="text-xs text-wio-blue font-mono font-semibold">{rate.toFixed(4)}</p>
            <svg className="h-4 w-4 text-wio-slate-muted mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-lg">{CURRENCY_FLAGS[toCurrency]}</p>
            <p className="text-xs font-semibold text-wio-slate">{toCurrency}</p>
            <p className="text-[10px] text-wio-slate-muted">{CURRENCY_NAMES[toCurrency]}</p>
          </div>
        </div>

        {/* Conversion if amount provided */}
        {convertedAmount !== null && amount && (
          <div className="text-center text-sm">
            <span className="text-wio-slate-muted">
              {new Intl.NumberFormat("en-AE", { style: "currency", currency: fromCurrency }).format(amount)}
            </span>
            <span className="text-wio-slate-muted mx-2">→</span>
            <span className="font-semibold text-wio-blue">
              {fmt(convertedAmount, toCurrency)}
            </span>
          </div>
        )}

        <p className="text-[10px] text-wio-slate-muted/60 text-center mt-2">
          Indicative rate · Wio FX · 0.5% spread applies
        </p>
      </CardBody>
    </Card>
  );
}
