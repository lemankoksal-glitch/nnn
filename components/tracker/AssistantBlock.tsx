import type { HeldTransfer } from "@/types";

interface Props {
  transfer: HeldTransfer;
  phase: "awaiting_docs" | "docs_submitted" | "processing" | "delivered";
}

const messages: Record<Props["phase"], (t: HeldTransfer) => string> = {
  awaiting_docs: (t) =>
    `We need to verify the source of funds for your ${t.amount.formatted} transfer to ${t.toContact.name} — this is a standard requirement for international transfers above AED 3,000. Upload the two documents below and we'll release it as quickly as possible.`,
  docs_submitted: (t) =>
    `Got your documents. Our compliance team is reviewing them now. Your ${t.amount.formatted} transfer to ${t.toContact.name} will continue automatically once they're approved — usually within a few hours.`,
  processing: (t) =>
    `All clear. Your ${t.amount.formatted} is on its way to ${t.toContact.name}. The correspondent bank is processing it now. Expect delivery within 1–2 business days.`,
  delivered: (t) =>
    `Your transfer of ${t.amount.formatted} has been delivered to ${t.toContact.name}. If they don't see it within 2 business days, contact us and we'll investigate.`,
};

export function AssistantBlock({ transfer, phase }: Props) {
  return (
    <div className="rounded-xl bg-wio-blue-light border border-wio-blue/20 px-4 py-3.5 flex gap-3">
      <div className="shrink-0 w-7 h-7 rounded-full bg-wio-blue flex items-center justify-center text-white text-xs font-bold">
        W
      </div>
      <p className="text-sm text-wio-slate leading-relaxed">{messages[phase](transfer)}</p>
    </div>
  );
}
