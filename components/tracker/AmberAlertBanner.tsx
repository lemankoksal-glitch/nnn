interface Props {
  phase: "awaiting_docs" | "docs_submitted" | "processing" | "delivered";
  recipientName: string;
}

export function AmberAlertBanner({ phase, recipientName }: Props) {
  if (phase === "delivered") {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3.5 flex gap-3">
        <span className="text-emerald-500 text-lg mt-0.5">✓</span>
        <div>
          <p className="text-sm font-semibold text-emerald-800">Transfer delivered</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            The funds have been sent to {recipientName}. It may take 1–2 business days to appear in their account.
          </p>
        </div>
      </div>
    );
  }

  if (phase === "processing") {
    return (
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3.5 flex gap-3">
        <span className="text-blue-500 text-lg mt-0.5 animate-pulse">⏳</span>
        <div>
          <p className="text-sm font-semibold text-blue-800">Processing your transfer</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Documents verified. Your transfer to {recipientName} is now being processed by the correspondent bank.
          </p>
        </div>
      </div>
    );
  }

  if (phase === "docs_submitted") {
    return (
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3.5 flex gap-3">
        <span className="text-blue-500 text-lg mt-0.5">🔍</span>
        <div>
          <p className="text-sm font-semibold text-blue-800">Documents received — under review</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Our compliance team is reviewing your documents. This usually takes a few hours. We&apos;ll notify you when it&apos;s done.
          </p>
        </div>
      </div>
    );
  }

  // awaiting_docs
  return (
    <div className="rounded-xl bg-amber-50 border border-amber-300 px-4 py-3.5 flex gap-3">
      <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
      <div>
        <p className="text-sm font-semibold text-amber-800">Your transfer is on hold</p>
        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
          International regulations require us to verify the source of funds for this transfer to {recipientName}.
          Upload the two documents below to release it.
        </p>
      </div>
    </div>
  );
}
