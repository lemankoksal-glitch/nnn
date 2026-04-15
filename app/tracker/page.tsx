"use client";

import { useState, useCallback } from "react";
import { MOCK_HELD_TRANSFER } from "@/mocks/data";
import { TrackerTopBar } from "@/components/tracker/TrackerTopBar";
import { AmberAlertBanner } from "@/components/tracker/AmberAlertBanner";
import { StepTracker } from "@/components/tracker/StepTracker";
import { AssistantBlock } from "@/components/tracker/AssistantBlock";
import {
  DocumentUploadPicker,
  type DocUpload,
} from "@/components/tracker/DocumentUploadPicker";
import { TrackerQuickActions } from "@/components/tracker/TrackerQuickActions";

type Phase = "awaiting_docs" | "docs_submitted" | "processing" | "delivered";

const INITIAL_DOCS: DocUpload[] = [
  {
    id: "source_of_funds",
    label: "Source of funds declaration",
    hint: "Bank statement, payslip, or letter confirming origin of funds — PDF or image.",
    state: "idle",
    progress: 0,
  },
  {
    id: "purpose_letter",
    label: "Purpose of transfer",
    hint: "Invoice, contract, or a short letter explaining why you are sending this money.",
    state: "idle",
    progress: 0,
  },
];

export default function TrackerPage() {
  const transfer = MOCK_HELD_TRANSFER;

  const [phase, setPhase] = useState<Phase>("awaiting_docs");
  const [docs, setDocs] = useState<DocUpload[]>(INITIAL_DOCS);
  const [docsSubmitted, setDocsSubmitted] = useState(false);
  const [openAction, setOpenAction] = useState<string | null>(null);

  // Simulate a file upload: progress ticks every 100ms → completes in ~1.5s
  const handleUpload = useCallback((docId: string) => {
    const fakeFileName = docId === "source_of_funds" ? "bank_statement.pdf" : "transfer_purpose.pdf";

    setDocs((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, state: "uploading", progress: 0, fileName: fakeFileName } : d)),
    );

    let pct = 0;
    const tick = setInterval(() => {
      pct += Math.floor(Math.random() * 18) + 8; // 8–25% per tick
      if (pct >= 100) {
        pct = 100;
        clearInterval(tick);
        setDocs((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, state: "uploaded", progress: 100 } : d)),
        );
      } else {
        setDocs((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, progress: pct } : d)),
        );
      }
    }, 150);
  }, []);

  const handleSubmit = useCallback(() => {
    setDocsSubmitted(true);
    setPhase("docs_submitted");

    // After 3s → move to "processing"
    setTimeout(() => {
      setPhase("processing");

      // After 4s more → "delivered"
      setTimeout(() => {
        setPhase("delivered");
      }, 4_000);
    }, 3_000);
  }, []);

  const handleToggleAction = useCallback((id: string) => {
    setOpenAction((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TrackerTopBar transfer={transfer} phase={phase} />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-4">
        <AmberAlertBanner phase={phase} recipientName={transfer.toContact.name} />

        <StepTracker
          phase={phase}
          initiatedAt={transfer.initiatedAt}
          expectedReleaseAt={transfer.expectedReleaseAt}
        />

        <AssistantBlock transfer={transfer} phase={phase} />

        {(phase === "awaiting_docs" || phase === "docs_submitted") && (
          <DocumentUploadPicker
            docs={docs}
            onUpload={handleUpload}
            onSubmit={handleSubmit}
            submitted={docsSubmitted}
          />
        )}

        <TrackerQuickActions
          transfer={transfer}
          openId={openAction}
          onToggle={handleToggleAction}
        />

        {/* Transfer details card */}
        <div className="rounded-xl bg-white border border-border px-5 py-4">
          <p className="text-xs font-semibold text-wio-slate-muted uppercase tracking-wide mb-3">
            Transfer details
          </p>
          <dl className="space-y-2">
            <DetailRow label="Recipient" value={transfer.toContact.name} />
            <DetailRow label="IBAN" value={transfer.toContact.iban ?? "—"} mono />
            <DetailRow label="Amount" value={transfer.amount.formatted} />
            <DetailRow label="Reference" value={transfer.id.replace("_", "-").toUpperCase()} mono />
            <DetailRow
              label="Initiated"
              value={transfer.initiatedAt.toLocaleString("en-AE", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
            <DetailRow label="Hold reason" value={transfer.holdReasonLabel} />
          </dl>
        </div>

        <p className="text-center text-[10px] text-wio-slate-muted pb-4">
          Wio Pay · International Transfer Tracker · All data is mocked
        </p>
      </main>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs text-wio-slate-muted shrink-0">{label}</dt>
      <dd
        className={`text-xs text-wio-slate text-right truncate max-w-[200px] ${mono ? "font-mono" : "font-medium"}`}
      >
        {value}
      </dd>
    </div>
  );
}
