"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  processSendMoney,
  EMPTY_CONTEXT,
  type SendMoneyState,
  type SendMoneyContext,
  type BrainEvent,
  type BrainMessage,
} from "@/lib/payment-brain";
import type { ChatRequest, ChatResponse } from "@/types/api";
import { MOCK_CONTACTS, MOCK_USER, MOCK_ACCOUNTS, MOCK_BILLS } from "@/mocks/data";
import { formatCurrency } from "@/lib/utils";
import {
  MessageBubble,
  type UIMessage,
  type CardCallbacks,
} from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { QuickActions } from "@/components/chat/QuickActions";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ProactiveAlertsSection } from "@/components/chat/ProactiveAlertsSection";
import type { Bill } from "@/types";

// ─── Helpers ───────────────────────────────────────────────────────────────────

let msgCounter = 0;
function nextId() {
  return `msg_${++msgCounter}_${Date.now()}`;
}

function brainMessagesToUI(msgs: BrainMessage[]): UIMessage[] {
  return msgs.map((m) => ({
    id: nextId(),
    sender: "ai" as const,
    text: m.text,
    card: m.card,
    timestamp: new Date(),
    isCardActive: false,
  }));
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Seed messages ──────────────────────────────────────────────────────────────

const PRIMARY = MOCK_ACCOUNTS[0];

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: nextId(),
    sender: "ai",
    text: `Good morning, ${MOCK_USER.name.split(" ")[0]}! Your current account balance is **${formatCurrency(PRIMARY.balance, PRIMARY.currency)}**. How can I help you today?`,
    timestamp: new Date(Date.now() - 60_000),
    isCardActive: false,
  },
];

// ─── Event serialisation helpers ───────────────────────────────────────────────

function eventToPayload(event: BrainEvent): Record<string, string> {
  switch (event.type) {
    case "USER_TEXT":        return { text: event.text };
    case "CONTACT_SELECTED": return { contactId: event.contactId };
    case "IBAN_SUBMITTED":   return { iban: event.iban, name: event.name };
    case "PURPOSE_SELECTED": return { purposeCode: event.purposeCode, purposeLabel: event.purposeLabel };
    case "CONFIRM":          return {};
    case "CANCEL":           return {};
  }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<UIMessage[]>(INITIAL_MESSAGES);
  const [smState, setSmState] = useState<SendMoneyState>("idle");
  const [smContext, setSmContext] = useState<SendMoneyContext>(EMPTY_CONTEXT);
  const [isTyping, setIsTyping] = useState(false);
  const [lastModel, setLastModel] = useState<string>("—");
  const [lastFallback, setLastFallback] = useState(false);
  const [history, setHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages / typing
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Mark only the last card as interactive ────────────────────────────────────
  function markLastCardActive(msgs: UIMessage[]): UIMessage[] {
    const lastCardIdx = [...msgs].reverse().findIndex((m) => m.card);
    if (lastCardIdx === -1) return msgs;
    const targetIdx = msgs.length - 1 - lastCardIdx;
    return msgs.map((m, i) => ({ ...m, isCardActive: i === targetIdx }));
  }

  function deactivateAllCards(msgs: UIMessage[]): UIMessage[] {
    return msgs.map((m) => ({ ...m, isCardActive: false }));
  }

  // ── Core: dispatch event via server API (with local brain fallback) ───────────
  const dispatchEvent = useCallback(
    async (event: BrainEvent) => {
      setIsTyping(true);

      // ── Call server API ──────────────────────────────────────────────────────
      let result: ChatResponse;
      try {
        const reqBody: ChatRequest = {
          eventType: event.type as ChatRequest["eventType"],
          eventPayload: eventToPayload(event),
          state: smState,
          context: smContext,
          history: history.slice(-6),
        };
        const resp = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
        });
        if (!resp.ok) {
          throw new Error(`API responded ${resp.status}`);
        }
        result = (await resp.json()) as ChatResponse;
      } catch (err) {
        // Network / server error — fall back to local deterministic brain
        console.warn("[wio/chat] API unavailable, using local brain:", err);
        const local = processSendMoney(smState, smContext, event, MOCK_CONTACTS);
        result = { ...local, action: "reply_only", usedFallback: true, model: "local" };
      }

      await sleep(result.delayMs);

      setSmState(result.nextState);
      setSmContext(result.context);
      setLastModel(result.model);
      setLastFallback(result.usedFallback);
      setIsTyping(false);

      // Update conversation history for USER_TEXT events
      if (event.type === "USER_TEXT") {
        const aiText = result.messages
          .filter((m) => m.text)
          .map((m) => m.text!)
          .join(" ");
        setHistory((prev) => [
          ...prev.slice(-10),
          { role: "user" as const, content: event.text },
          ...(aiText ? [{ role: "assistant" as const, content: aiText }] : []),
        ]);
      }

      const newMsgs = brainMessagesToUI(result.messages);
      setMessages((prev) => {
        const combined = [...prev, ...newMsgs];
        return markLastCardActive(combined);
      });

      // Auto-reset after done
      if (result.nextState === "done") {
        await sleep(800);
        setSmState("idle");
        setSmContext(EMPTY_CONTEXT);
      }
    },
    [smState, smContext, history],
  );

  // ── User sends a text message ─────────────────────────────────────────────────
  const handleUserText = useCallback(
    async (text: string) => {
      const userMsg: UIMessage = {
        id: nextId(),
        sender: "customer",
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...deactivateAllCards(prev), userMsg]);
      await dispatchEvent({ type: "USER_TEXT", text });
    },
    [dispatchEvent],
  );

  // ── Bill payment (from proactive card or chat) ────────────────────────────────
  const handleBillPay = useCallback(
    async (bill: Bill) => {
      // Inject as a user message so the chat thread reflects the action
      const userMsg: UIMessage = {
        id: nextId(),
        sender: "customer",
        text: `Pay my ${bill.provider} bill`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...deactivateAllCards(prev), userMsg]);
      await dispatchEvent({ type: "USER_TEXT", text: `Pay my ${bill.provider} bill` });
    },
    [dispatchEvent],
  );

  // ── Alert action (from proactive section) ─────────────────────────────────────
  const handleAlertAction = useCallback(
    async (action: string) => {
      // e.g. "pay_bill:bill_001"
      if (action.startsWith("pay_bill:")) {
        const billId = action.split(":")[1];
        const bill = MOCK_BILLS.find((b) => b.id === billId);
        if (bill) await handleBillPay(bill);
      }
    },
    [handleBillPay],
  );

  // ── Held transfer actions ──────────────────────────────────────────────────────
  const handleHeldRelease = useCallback(async () => {
    const aiMsg: UIMessage = {
      id: nextId(),
      sender: "ai",
      text: "Your transfer to **Ravi Sharma** of **AED 3,200.00** has been released for processing. It will arrive within 1–3 business days. Reference: WIO20260415.",
      timestamp: new Date(),
      isCardActive: false,
    };
    setMessages((prev) => [...prev, aiMsg]);
  }, []);

  const handleHeldCancel = useCallback(async () => {
    const aiMsg: UIMessage = {
      id: nextId(),
      sender: "ai",
      text: "Your held transfer to Ravi Sharma has been cancelled. No funds have been deducted from your account.",
      timestamp: new Date(),
      isCardActive: false,
    };
    setMessages((prev) => [...prev, aiMsg]);
  }, []);

  // ── Bill confirm in chat ───────────────────────────────────────────────────────
  const handleBillConfirm = useCallback(
    async (billerName: string) => {
      const bill = MOCK_BILLS.find(
        (b) => b.provider.toLowerCase() === billerName.toLowerCase(),
      );
      setMessages((prev) => deactivateAllCards(prev));
      setIsTyping(true);
      await sleep(1_500);
      setIsTyping(false);
      const ref = `WIO${Date.now().toString().slice(-8)}`;
      const doneMsg: UIMessage = {
        id: nextId(),
        sender: "ai",
        text: `Your **${billerName}** bill has been paid successfully!`,
        card: {
          type: "bill_pay_done",
          data: {
            billerName,
            amount: bill?.amount.formatted ?? "",
            ref,
          },
        },
        timestamp: new Date(),
        isCardActive: false,
      };
      setMessages((prev) => [...prev, doneMsg]);
    },
    [],
  );

  // ── Card callbacks ─────────────────────────────────────────────────────────────
  const cardCallbacks: CardCallbacks = {
    onContactSelected: (contactId) => {
      dispatchEvent({ type: "CONTACT_SELECTED", contactId });
    },
    onIbanSubmitted: (iban, name) => {
      dispatchEvent({ type: "IBAN_SUBMITTED", iban, name });
    },
    onPurposeSelected: (purposeCode, purposeLabel) => {
      dispatchEvent({ type: "PURPOSE_SELECTED", purposeCode, purposeLabel });
    },
    onConfirm: () => {
      dispatchEvent({ type: "CONFIRM" });
    },
    onCancel: () => {
      dispatchEvent({ type: "CANCEL" });
      setMessages((prev) => deactivateAllCards(prev));
    },
    onBillConfirm: handleBillConfirm,
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-wio-slate-muted hover:text-wio-slate transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-wio-blue">
              <span className="text-xs font-bold text-white">W</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-wio-slate">Wio Pay</p>
              <p className="text-xs text-wio-teal flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-wio-teal inline-block animate-pulse" />
                AI Assistant · Online
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-wio-slate-muted">{MOCK_USER.name}</p>
          <p className="text-sm font-semibold text-wio-slate">
            {formatCurrency(PRIMARY.balance, PRIMARY.currency)}
          </p>
        </div>
      </header>

      {/* ── Dev state bar ─────────────────────────────────────────────────────── */}
      {process.env.NODE_ENV === "development" && (
        <div className="shrink-0 bg-slate-800 text-slate-200 text-xs px-4 py-1 font-mono flex gap-4 overflow-x-auto">
          <span>state: <strong className="text-green-400">{smState}</strong></span>
          {smContext.amount && <span>amt: <strong>{smContext.amount.formatted}</strong></span>}
          {smContext.resolvedContact && <span>to: <strong>{smContext.resolvedContact.name}</strong></span>}
          {smContext.purposeCode && <span>purpose: <strong>{smContext.purposeCode}</strong></span>}
          <span>model: <strong className="text-yellow-400">{lastModel}</strong></span>
          {lastFallback && <span className="text-red-400">⚠ fallback</span>}
        </div>
      )}

      {/* ── Proactive alerts (above message thread) ─────────────────────────── */}
      <div className="shrink-0">
        <ProactiveAlertsSection
          onBillPay={handleBillPay}
          onAlertAction={handleAlertAction}
          onHeldTransferRelease={handleHeldRelease}
          onHeldTransferCancel={handleHeldCancel}
        />
      </div>

      {/* ── Message list ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto chat-scroll py-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} callbacks={cardCallbacks} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick actions + input ─────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-t border-border">
        <QuickActions onSelect={handleUserText} disabled={isTyping} />
        <MessageInput onSend={handleUserText} disabled={isTyping} />
      </div>
    </div>
  );
}
