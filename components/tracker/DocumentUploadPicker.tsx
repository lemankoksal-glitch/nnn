"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface DocUpload {
  id: string;
  label: string;
  hint: string;
  state: "idle" | "uploading" | "uploaded";
  fileName?: string;
  progress: number; // 0–100
}

interface Props {
  docs: DocUpload[];
  onUpload: (docId: string) => void;
  onSubmit: () => void;
  submitted: boolean;
}

export function DocumentUploadPicker({ docs, onUpload, onSubmit, submitted }: Props) {
  const allUploaded = docs.every((d) => d.state === "uploaded");

  return (
    <div className="rounded-xl bg-white border border-border px-5 py-4 space-y-4">
      <div>
        <p className="text-sm font-semibold text-wio-slate">Required documents</p>
        <p className="text-xs text-wio-slate-muted mt-0.5">
          Both documents are needed before we can release your transfer.
        </p>
      </div>

      <div className="space-y-3">
        {docs.map((doc) => (
          <DocRow key={doc.id} doc={doc} onUpload={onUpload} disabled={submitted} />
        ))}
      </div>

      <button
        onClick={onSubmit}
        disabled={!allUploaded || submitted}
        className={cn(
          "w-full rounded-lg py-2.5 text-sm font-semibold transition-colors",
          allUploaded && !submitted
            ? "bg-wio-blue text-white hover:bg-wio-blue/90"
            : "bg-muted text-wio-slate-muted cursor-not-allowed",
        )}
      >
        {submitted ? "Documents submitted ✓" : "Submit documents"}
      </button>
    </div>
  );
}

function DocRow({
  doc,
  onUpload,
  disabled,
}: {
  doc: DocUpload;
  onUpload: (id: string) => void;
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 transition-colors",
        doc.state === "uploaded"
          ? "border-emerald-200 bg-emerald-50"
          : doc.state === "uploading"
          ? "border-wio-blue/30 bg-wio-blue-light"
          : "border-border bg-muted/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-wio-slate">{doc.label}</p>
          <p className="text-xs text-wio-slate-muted mt-0.5">{doc.hint}</p>
          {doc.state === "uploaded" && doc.fileName && (
            <p className="text-xs text-emerald-700 mt-1 truncate">✓ {doc.fileName}</p>
          )}
        </div>

        {doc.state === "idle" && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={() => {
                if (!disabled) onUpload(doc.id);
              }}
              disabled={disabled}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="shrink-0 rounded-lg border border-wio-blue text-wio-blue px-3 py-1.5 text-xs font-semibold hover:bg-wio-blue hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Choose file
            </button>
          </>
        )}

        {doc.state === "uploading" && (
          <span className="shrink-0 text-xs text-wio-blue font-medium">Uploading…</span>
        )}

        {doc.state === "uploaded" && (
          <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs">
            ✓
          </span>
        )}
      </div>

      {doc.state === "uploading" && (
        <div className="mt-2.5">
          <div className="h-1.5 rounded-full bg-wio-blue/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-wio-blue transition-all duration-300"
              style={{ width: `${doc.progress}%` }}
            />
          </div>
          <p className="text-[10px] text-wio-blue mt-1">{doc.progress}%</p>
        </div>
      )}
    </div>
  );
}
