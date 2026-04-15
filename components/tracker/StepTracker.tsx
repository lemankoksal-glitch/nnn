import { cn } from "@/lib/utils";

type Phase = "awaiting_docs" | "docs_submitted" | "processing" | "delivered";

interface Step {
  id: string;
  label: string;
  description: string;
  status: "done" | "active" | "pending";
  timestamp?: string;
}

function buildSteps(phase: Phase, initiatedAt: Date, expectedAt: Date): Step[] {
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit", hour12: true }) +
    ", " +
    d.toLocaleDateString("en-AE", { day: "numeric", month: "short" });

  const steps: Step[] = [
    {
      id: "initiated",
      label: "Transfer initiated",
      description: "Your transfer request was received.",
      status: "done",
      timestamp: fmt(initiatedAt),
    },
    {
      id: "compliance",
      label: "Compliance review",
      description:
        phase === "awaiting_docs"
          ? "Awaiting your documents to proceed."
          : phase === "docs_submitted"
          ? "Documents received — our team is reviewing."
          : "Documents verified.",
      status:
        phase === "awaiting_docs" || phase === "docs_submitted"
          ? "active"
          : "done",
      timestamp:
        phase === "docs_submitted" || phase === "processing" || phase === "delivered"
          ? "Submitted"
          : undefined,
    },
    {
      id: "bank",
      label: "Bank processing",
      description: "Correspondent bank processes and routes the funds.",
      status:
        phase === "processing"
          ? "active"
          : phase === "delivered"
          ? "done"
          : "pending",
    },
    {
      id: "delivered",
      label: "Delivered",
      description: `Funds arrive in recipient's account.`,
      status: phase === "delivered" ? "done" : "pending",
      timestamp: phase === "delivered" ? fmt(new Date()) : `Est. ${fmt(expectedAt)}`,
    },
  ];

  return steps;
}

interface Props {
  phase: Phase;
  initiatedAt: Date;
  expectedReleaseAt: Date;
}

export function StepTracker({ phase, initiatedAt, expectedReleaseAt }: Props) {
  const steps = buildSteps(phase, initiatedAt, expectedReleaseAt);

  return (
    <div className="rounded-xl bg-white border border-border px-5 py-4">
      <p className="text-xs font-semibold text-wio-slate-muted uppercase tracking-wide mb-4">
        Transfer status
      </p>
      <ol className="relative space-y-0">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <li key={step.id} className="flex gap-4">
              {/* Timeline spine */}
              <div className="flex flex-col items-center">
                <StepDot status={step.status} />
                {!isLast && (
                  <div
                    className={cn(
                      "w-px flex-1 my-1",
                      step.status === "done" ? "bg-wio-teal" : "bg-border",
                    )}
                    style={{ minHeight: "28px" }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-5", isLast && "pb-0")}>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      step.status === "pending" ? "text-wio-slate-muted" : "text-wio-slate",
                    )}
                  >
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <span className="text-[10px] text-wio-slate-muted">{step.timestamp}</span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs mt-0.5 leading-relaxed",
                    step.status === "pending" ? "text-wio-slate-muted/70" : "text-wio-slate-muted",
                  )}
                >
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepDot({ status }: { status: Step["status"] }) {
  if (status === "done") {
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-wio-teal shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }
  if (status === "active") {
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-wio-blue bg-wio-blue-light shrink-0">
        <div className="w-2 h-2 rounded-full bg-wio-blue animate-pulse" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-border bg-white shrink-0">
      <div className="w-2 h-2 rounded-full bg-border" />
    </div>
  );
}
