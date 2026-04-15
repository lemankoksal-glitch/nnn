"use client";

import { useState } from "react";
import { Card, CardBody, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddBeneficiaryCardProps {
  prefilledName?: string;
  prefilledIban?: string;
  error?: string;
  isActive?: boolean;
  onSubmit?: (iban: string, name: string) => void;
}

export function AddBeneficiaryCard({
  prefilledName = "",
  prefilledIban = "",
  error: serverError,
  isActive = true,
  onSubmit,
}: AddBeneficiaryCardProps) {
  const [name, setName] = useState(prefilledName);
  const [iban, setIban] = useState(prefilledIban);
  const [errors, setErrors] = useState<{ name?: string; iban?: string }>({});

  function handleSubmit() {
    const errs: { name?: string; iban?: string } = {};
    if (!name.trim()) errs.name = "Name is required";
    const cleanIban = iban.replace(/\s+/g, "").toUpperCase();
    if (!cleanIban) errs.iban = "IBAN is required";
    else if (cleanIban.length < 10) errs.iban = "IBAN is too short";

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit?.(cleanIban, name.trim());
  }

  return (
    <Card className="w-full max-w-xs">
      <CardBody className="pt-4 space-y-3">
        <p className="text-sm font-semibold text-wio-slate">Add New Beneficiary</p>

        {serverError && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{serverError}</p>
        )}

        <Input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!isActive}
          error={errors.name}
        />
        <Input
          placeholder="IBAN (e.g. AE07 0331 …)"
          value={iban}
          onChange={(e) => setIban(e.target.value.toUpperCase())}
          disabled={!isActive}
          error={errors.iban}
          className="font-mono text-xs"
        />
        {!isActive && (
          <p className="text-xs text-wio-slate-muted">Beneficiary submitted.</p>
        )}
      </CardBody>
      {isActive && (
        <CardFooter>
          <Button variant="primary" size="sm" className="w-full" onClick={handleSubmit}>
            Continue
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
