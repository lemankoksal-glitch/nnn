export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-1">
      {/* Wio AI avatar */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-wio-blue">
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.703-1.395 2.426l-2.705-.54A4.422 4.422 0 0012 18.75c-1.16 0-2.265.434-3.102 1.219l-2.705.54C4.77 20.705 3.8 19 4.8 18l1.4-1.4" />
        </svg>
      </div>

      {/* Animated dots */}
      <div className="rounded-2xl rounded-bl-sm bg-wio-blue-light border border-wio-blue/10 px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-wio-blue animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
          />
        ))}
      </div>
    </div>
  );
}
