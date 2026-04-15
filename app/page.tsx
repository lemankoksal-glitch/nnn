import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-wio-blue-light to-white p-8">
      <div className="text-center space-y-6 max-w-lg">
        <div className="inline-flex items-center gap-2 rounded-full bg-wio-blue px-4 py-1.5 text-sm font-medium text-white">
          MVP · Internal Preview
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-wio-slate">
          Wio Pay
        </h1>
        <p className="text-lg text-wio-slate-muted">
          AI-first banking. Instant answers. Seamless payments.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/chat"
            className="inline-flex items-center justify-center rounded-lg bg-wio-blue px-6 py-3 text-sm font-semibold text-white hover:bg-wio-blue/90 transition-colors"
          >
            Open Customer Chat
          </Link>
          <Link
            href="/ops"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-wio-slate hover:bg-muted transition-colors"
          >
            Payment Ops Centre →
          </Link>
        </div>
        <p className="text-xs text-muted-foreground pt-4">
          All data is mocked — no live API connections yet.
        </p>
      </div>
    </main>
  );
}
