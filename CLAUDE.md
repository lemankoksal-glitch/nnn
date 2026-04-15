# Wio Pay — Claude Code Project Rules

## Project Overview

Wio Pay is an AI-first banking chat product built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase. Development follows the phased roadmap in `docs/wio-pay-spec.md`.

## Repository Layout

```
app/                   Next.js App Router pages
components/
  chat/                Chat-specific UI (bubbles, input, list)
  cards/               Inline card components rendered in chat
  ui/                  Base primitives (shadcn/ui style)
  layout/              Page shells, sidebars
lib/                   Utility functions and API clients
mocks/                 Seeded local data (Phase 1 only — delete in Phase 2+)
types/                 Shared TypeScript interfaces and enums
docs/                  Product specs and ADRs
```

## Coding Standards

### TypeScript
- Strict mode is ON — no `any`, no `@ts-ignore` without a comment explaining why.
- Export types from `types/index.ts`. Import with `@/types`.
- Prefer `interface` over `type` for object shapes; use `type` for unions/aliases.

### React / Next.js
- Use the **App Router** (not Pages Router).
- Default to **Server Components**; add `"use client"` only when using hooks or browser APIs.
- Co-locate component logic with the component file. No barrel `index.ts` files unless there are 5+ exports.
- Keep components small — if a component is > 150 lines, split it.

### Styling
- Use **Tailwind utility classes** only. No inline `style={{}}` unless animating dynamic values.
- Reference brand tokens via the `wio-*` color keys defined in `tailwind.config.ts`.
- Never hardcode hex colors in JSX.

### Data & State
- Phase 1: all data lives in `mocks/data.ts` as typed constants.
- Phase 2+: replace mocks with Supabase queries. Do NOT mix real and mock data.
- No global state library yet (no Redux, Zustand). Use `useState` / `useReducer` + React context where needed.
- No `localStorage` or `sessionStorage` — Supabase handles persistence.

### AI / LLM calls
- All AI calls go through `app/api/chat/route.ts` — never call the LLM directly from the client.
- Use streaming responses (`ReadableStream`) so the UI feels instant.
- Log intent type and latency on every AI response (server-side only).

### Payments
- No real payment execution until Phase 4.
- Any function that would move money must have a `// MOCK` comment until the payment engine is live.

## File Naming

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `MessageBubble.tsx` |
| Hooks | camelCase with `use` prefix | `useConversation.ts` |
| Utils | camelCase | `formatCurrency.ts` |
| API routes | `route.ts` inside folder | `app/api/chat/route.ts` |
| Types | PascalCase interfaces, SCREAMING_SNAKE enums | `IntentType`, `FlowStep` |

## Do Not

- Do not commit `.env.local` or any secrets.
- Do not add `console.log` in production paths — use structured logging (TBD in Phase 3).
- Do not build Phase N+1 features while Phase N is incomplete.
- Do not skip TypeScript types to save time — types are the contract.
- Do not use `fetch` inside React Server Components for Supabase — use the server client from `lib/supabase.ts`.

## Environment Variables

```bash
# .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only
OPENAI_API_KEY=                  # or ANTHROPIC_API_KEY
```

## Running the Project

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run lint
npm run build
```

## Git Conventions

- Branch: `claude/<feature-name>` for AI-generated work
- Commits: imperative mood, present tense ("Add MessageBubble component")
- Do not push directly to `main`

## Phase Tracking

Current phase: **Phase 1 — Scaffold + Chat UI + Mocked Data**

See `docs/wio-pay-spec.md` § 8 for the full phase roadmap.
