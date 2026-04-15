/**
 * POST /api/chat
 *
 * Architecture contract:
 *  1. The deterministic payment brain ALWAYS runs first and is the source of truth.
 *     State transitions, card data, and payment execution are never delegated to AI.
 *  2. For USER_TEXT events only, the AI may enrich the reply text fields on
 *     BrainMessages to produce a more natural conversational tone.
 *     Card data is untouched.
 *  3. If the AI call fails for any reason, the original brain text is used and
 *     usedFallback=true is set in the response.
 */

import { NextRequest, NextResponse } from "next/server";
import type { ChatRequest, ChatResponse, AssistantAction } from "@/types/api";
import type {
  BrainEvent,
  SendMoneyState,
  SendMoneyContext,
  BrainMessage,
} from "@/lib/payment-brain/state-machine";
import { processSendMoney, EMPTY_CONTEXT } from "@/lib/payment-brain/state-machine";
import { MOCK_CONTACTS } from "@/mocks/data";
import { createAdapter, type ModelAdapter } from "@/lib/model-adapter";

// ─── Event reconstruction ─────────────────────────────────────────────────────

function toBrainEvent(
  eventType: string,
  payload: Record<string, string>,
): BrainEvent | { error: string } {
  switch (eventType) {
    case "USER_TEXT":
      if (!payload.text) return { error: "USER_TEXT requires payload.text" };
      return { type: "USER_TEXT", text: payload.text };

    case "CONTACT_SELECTED":
      if (!payload.contactId) return { error: "CONTACT_SELECTED requires payload.contactId" };
      return { type: "CONTACT_SELECTED", contactId: payload.contactId };

    case "IBAN_SUBMITTED":
      if (!payload.iban || !payload.name)
        return { error: "IBAN_SUBMITTED requires payload.iban and payload.name" };
      return { type: "IBAN_SUBMITTED", iban: payload.iban, name: payload.name };

    case "PURPOSE_SELECTED":
      if (!payload.purposeCode || !payload.purposeLabel)
        return { error: "PURPOSE_SELECTED requires payload.purposeCode and payload.purposeLabel" };
      return {
        type: "PURPOSE_SELECTED",
        purposeCode: payload.purposeCode,
        purposeLabel: payload.purposeLabel,
      };

    case "CONFIRM":
      return { type: "CONFIRM" };

    case "CANCEL":
      return { type: "CANCEL" };

    default:
      return { error: `Unknown eventType: ${eventType}` };
  }
}

// ─── Action derivation ────────────────────────────────────────────────────────

/**
 * Maps the deterministic brain result to a high-level AssistantAction code.
 * This is derived from brain output — the AI may never override it.
 */
function deriveAction(
  nextState: SendMoneyState,
  messages: BrainMessage[],
): AssistantAction {
  const lastCard = [...messages].reverse().find((m) => m.card)?.card;

  if (!lastCard) {
    // Pure text response — label it by what state we're waiting in
    if (nextState === "got_amount") return "ask_recipient";
    if (nextState === "purpose") return "ask_purpose";
    return "reply_only";
  }

  switch (lastCard.type) {
    case "contact_picker":   return "show_contact_picker";
    case "add_beneficiary":  return "show_add_beneficiary";
    case "purpose_picker":   return "ask_purpose";
    case "transfer_confirm": return "show_summary";
    case "transfer_done":    return "show_done";
    default:                 return "show_card";
  }
}

// ─── AI text enrichment ───────────────────────────────────────────────────────

const ENRICH_SYSTEM = `You are Wio Pay, a friendly UAE banking assistant.
The payment rules engine generates messages that can sound robotic. Your job:
- Rewrite each message to be natural, warm, and direct (max 2 sentences).
- Preserve ALL factual data: amounts, names, IBANs, reference numbers.
- Keep bold markdown (**text**) exactly as-is.
- Never change the meaning, add disclaimers, or add information not in the original.

Respond with a JSON array only — one entry per input message.
Each entry must be either a rewritten string or null (null = keep the original).
No explanation, no code fences.`;

interface EnrichResult {
  messages: BrainMessage[];
  usedFallback: boolean;
}

async function enrichMessages(
  adapter: ModelAdapter,
  messages: BrainMessage[],
  userText: string,
  action: AssistantAction,
  ctx: SendMoneyContext,
): Promise<EnrichResult> {
  // Only text-bearing messages can be enriched; card data is never touched
  const textMessages = messages.filter((m) => m.text);
  if (textMessages.length === 0) {
    return { messages, usedFallback: false };
  }

  const userContent = JSON.stringify({
    userText,
    action,
    messages: textMessages.map((m) => m.text),
    context: {
      amount: ctx.amount?.formatted ?? null,
      recipient: ctx.resolvedContact?.name ?? ctx.recipientQuery ?? null,
      purpose: ctx.purposeCode ?? null,
    },
  });

  try {
    const output = await adapter.complete({
      system: ENRICH_SYSTEM,
      messages: [{ role: "user", content: userContent }],
      maxTokens: 512,
    });

    // Strip code fences if the model wrapped the JSON anyway
    const cleaned = output.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const enriched = JSON.parse(cleaned) as Array<string | null>;

    if (!Array.isArray(enriched)) throw new Error("AI returned non-array");

    // Apply enriched texts — only replace where the AI gave a non-null string
    let textIdx = 0;
    const result = messages.map((m) => {
      if (!m.text) return m;
      const replacement = enriched[textIdx++];
      return typeof replacement === "string" && replacement.length > 0
        ? { ...m, text: replacement }
        : m;
    });

    return { messages: result, usedFallback: false };
  } catch (err) {
    // AI failed — log server-side, surface usedFallback=true in response
    console.error("[wio/api/chat] AI enrichment failed:", err instanceof Error ? err.message : err);
    return { messages, usedFallback: true };
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const chatReq = body as Partial<ChatRequest>;

  // Validate required fields
  if (!chatReq.eventType) {
    return NextResponse.json({ error: "Missing required field: eventType" }, { status: 400 });
  }

  // Reconstruct the typed brain event
  const eventOrError = toBrainEvent(chatReq.eventType, chatReq.eventPayload ?? {});
  if ("error" in eventOrError) {
    return NextResponse.json({ error: eventOrError.error }, { status: 400 });
  }
  const event = eventOrError;

  // Deserialise context — the client sends a JSON-serialised SendMoneyContext.
  // All fields are primitives / plain objects so JSON round-trip is safe.
  const context: SendMoneyContext = chatReq.context ?? EMPTY_CONTEXT;

  // ── Step 1: Run the deterministic brain ──────────────────────────────────────
  const state: SendMoneyState = chatReq.state ?? "idle";
  const brainResult = processSendMoney(state, context, event, MOCK_CONTACTS);
  const action = deriveAction(brainResult.nextState, brainResult.messages);

  // ── Step 2: Optionally enrich reply text with AI ─────────────────────────────
  // Only USER_TEXT events warrant AI enrichment.
  // Card actions (CONFIRM, CANCEL, etc.) keep canned strings — they are transient
  // UI acknowledgements, not conversational responses.
  let finalMessages = brainResult.messages;
  let usedFallback = false;
  let model = "none";

  if (event.type === "USER_TEXT") {
    const adapter = createAdapter();
    model = adapter.name;
    const enriched = await enrichMessages(
      adapter,
      brainResult.messages,
      event.text,
      action,
      brainResult.context,
    );
    finalMessages = enriched.messages;
    usedFallback = enriched.usedFallback;
  }

  const response: ChatResponse = {
    nextState: brainResult.nextState,
    context: brainResult.context,
    messages: finalMessages,
    delayMs: brainResult.delayMs,
    action,
    usedFallback,
    model,
  };

  return NextResponse.json(response);
}
