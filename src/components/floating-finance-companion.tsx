"use client";

import { budgets, transactions } from "@/lib/finance-data";
import {
  budgetRooms,
  cardStack,
  liveFeed,
  moneyMood,
  subscriptionStack,
  userProfile,
} from "@/lib/spendpilot-data";
import {
  Bot,
  CalendarClock,
  LoaderCircle,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type AppView = "overview" | "activity" | "budgets" | "cards";

type CompanionMood = "calm" | "watch" | "urgent";

type CompanionCard = {
  title: string;
  value: string;
  body: string;
  tone: "mint" | "sky" | "gold" | "coral";
};

type CompanionMessage = {
  id: string;
  role: "user" | "companion";
  text: string;
  mood?: CompanionMood;
  confidence?: string;
  actions?: string[];
  insights?: string[];
  cards?: CompanionCard[];
  streaming?: boolean;
};

type CompanionResponse = {
  answer?: string;
  mood?: CompanionMood;
  confidence?: string;
  actions?: string[];
  insights?: string[];
  cards?: CompanionCard[];
};

const viewLabels: Record<AppView, string> = {
  overview: "Daily command",
  activity: "Activity ledger",
  budgets: "Budget control",
  cards: "Cards and renewals",
};

const promptsByView: Record<AppView, string[]> = {
  overview: ["Can I spend tonight?", "What changed today?", "Find waste"],
  activity: ["Which charge is odd?", "Explain review items", "Create a cleanup list"],
  budgets: ["Where am I tight?", "Plan a $500 save", "What should I move?"],
  cards: ["Review subscriptions", "Any card risk?", "What bill is next?"],
};

const moodCopy: Record<CompanionMood, { label: string; className: string; dot: string }> = {
  calm: {
    label: "Calm",
    className: "bg-mint text-ink",
    dot: "bg-verdant",
  },
  watch: {
    label: "Watch",
    className: "bg-[#ffcf6e] text-ink",
    dot: "bg-[#e7a900]",
  },
  urgent: {
    label: "Urgent",
    className: "bg-[#ff9a76] text-ink",
    dot: "bg-coral",
  },
};

const starterMessage: CompanionMessage = {
  id: "starter",
  role: "companion",
  text: "I can read the visible money context and give you one clear next move.",
  mood: "calm",
  confidence: "Ready",
  actions: ["Ask about tonight", "Find waste", "Plan savings"],
  insights: ["Safe-to-spend is $186", "Groceries and renewals need the closest watch"],
};

export function FloatingFinanceCompanion({ view }: { view: AppView }) {
  const [open, setOpen] = useState(false);
  const [motionActive, setMotionActive] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<CompanionMessage[]>([starterMessage]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageCounterRef = useRef(0);
  const quickPrompts = useMemo(() => promptsByView[view], [view]);
  const latestMood = messages.findLast((message) => message.role === "companion" && message.mood)?.mood ?? "calm";
  const mood = moodCopy[latestMood];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function askCompanion(command: string) {
    const trimmed = command.trim();

    if (!trimmed || loading) {
      return;
    }

    const userMessage: CompanionMessage = {
      id: nextMessageId("user"),
      role: "user",
      text: trimmed,
    };
    const companionId = nextMessageId("companion");

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: companionId,
        role: "companion",
        text: "",
        mood: "calm",
        confidence: "Reading context",
        streaming: true,
      },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          transactions,
          budgets,
          context: buildMoneyContext(view),
          stream: true,
        }),
      });

      if (!response.body) {
        const data = (await response.json()) as CompanionResponse;
        updateCompanionMessage(companionId, {
          text: data.answer ?? "I could not read that answer. Try asking again in a simpler way.",
          mood: data.mood ?? "watch",
          confidence: data.confidence ?? "Based on visible context",
          actions: normalizeList(data.actions, ["Review subscriptions", "Check budgets"]),
          insights: normalizeList(data.insights, ["Float used the current dashboard context"]),
          cards: normalizeCards(data.cards),
          streaming: false,
        });
        return;
      }

      await readCompanionStream(response, companionId);
    } catch {
      updateCompanionMessage(companionId, {
        text: "The companion route did not answer. Check the assistant route or environment, then try again.",
        mood: "urgent",
        confidence: "Connection issue",
        actions: ["Retry question", "Check environment"],
        insights: ["The floating UI is working", "The server route needs attention"],
        cards: [
          {
            title: "Connection",
            value: "Retry",
            body: "The panel is working, but the server route did not finish.",
            tone: "coral",
          },
        ],
        streaming: false,
      });
    } finally {
      setLoading(false);
    }
  }

  async function readCompanionStream(response: Response, messageId: string) {
    const reader = response.body?.getReader();

    if (!reader) {
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) {
          continue;
        }

        handleStreamEvent(line, messageId);
      }
    }

    if (buffer.trim()) {
      handleStreamEvent(buffer, messageId);
    }

    updateCompanionMessage(messageId, { streaming: false });
  }

  function handleStreamEvent(line: string, messageId: string) {
    try {
      const event = JSON.parse(line) as { type?: string; text?: string } & Partial<CompanionResponse>;

      if (event.type === "delta" && event.text) {
        setMessages((current) =>
          current.map((message) =>
            message.id === messageId ? { ...message, text: `${message.text}${event.text}` } : message,
          ),
        );
        return;
      }

      if (event.type === "done") {
        updateCompanionMessage(messageId, {
          mood: event.mood ?? "watch",
          confidence: event.confidence ?? "Based on visible context",
          actions: normalizeList(event.actions, ["Review subscriptions", "Check budgets"]),
          insights: normalizeList(event.insights, ["Float used the current dashboard context"]),
          cards: normalizeCards(event.cards),
          streaming: false,
        });
      }
    } catch {
      setMessages((current) =>
        current.map((message) => (message.id === messageId ? { ...message, text: `${message.text}${line}` } : message)),
      );
    }
  }

  function updateCompanionMessage(messageId: string, patch: Partial<CompanionMessage>) {
    setMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...message, ...patch } : message)),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void askCompanion(input);
  }

  function openCompanion() {
    setMotionActive(true);
    setOpen(true);
  }

  function closeCompanion() {
    setMotionActive(true);
    setOpen(false);
  }

  function nextMessageId(prefix: string) {
    messageCounterRef.current += 1;
    return `${prefix}-${messageCounterRef.current}`;
  }

  return (
    <>
      <div
        className="finance-companion-shell fixed bottom-24 right-3 z-40 lg:bottom-6"
        data-motion={motionActive ? "active" : "idle"}
        data-state={open ? "open" : "closed"}
      >
        <button
          type="button"
          onClick={openCompanion}
          className="finance-companion-closed-face grid h-full w-full place-items-center bg-ink text-white"
          aria-label="Open Float companion"
          aria-expanded={open}
        >
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-[#ffcf6e] text-ink">
            <Bot size={22} className="transition duration-300 group-hover:rotate-12" />
            <span className="pulse-ring absolute inset-0 rounded-full border border-[#ffcf6e]" />
          </span>
        </button>

        <section className="finance-companion-open-face flex h-full min-w-[min(calc(100vw-1.5rem),420px)] flex-col overflow-hidden border border-white/76 bg-white/88 text-ink shadow-[0_26px_90px_rgba(23,23,23,0.22)] backdrop-blur-2xl">
          <div className="relative shrink-0 overflow-hidden bg-ink p-4 text-white">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky/24" />
            <div className="absolute right-12 top-8 h-12 w-12 rounded-full bg-[#ffcf6e]/24" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ffcf6e] text-ink shadow-[0_12px_34px_rgba(255,207,110,0.34)]">
                  <Bot size={20} />
                  <span className={`absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink ${mood.dot}`} />
                </span>
                <div>
                  <h2 className="font-display display-kern text-2xl font-black leading-none">Float</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCompanion}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-coral text-white shadow-[0_12px_34px_rgba(238,95,86,0.3)] transition hover:scale-105 hover:bg-[#ff746b] active:scale-95"
                aria-label="Close companion"
              >
                <X size={18} />
              </button>
            </div>

          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {loading && !messages.some((message) => message.streaming) ? <OrganicThinking /> : null}
          </div>

          <div className="shrink-0 border-t border-ink/8 bg-white/78 p-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => askCompanion(prompt)}
                  disabled={loading}
                  className="haptic shrink-0 rounded-full border border-ink/10 bg-white/80 px-3 py-2 text-xs font-black text-ink/60 shadow-sm transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-[minmax(0,1fr)_44px] gap-2">
              <label className="flex h-12 items-center gap-2 rounded-full border border-ink/10 bg-smoke px-4 shadow-inner">
                <Sparkles size={16} className="shrink-0 text-ink/36" />
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask if tonight fits..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-ink/32"
                />
              </label>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="black-button haptic grid h-12 w-12 place-items-center rounded-full disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Ask Float"
              >
                {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />}
              </button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}

function MessageBubble({ message }: { message: CompanionMessage }) {
  if (message.role === "user") {
    return (
      <div className="finance-message-bubble ml-10 rounded-[1.25rem] bg-ink px-3 py-2 text-sm font-bold leading-6 text-white shadow-[0_14px_40px_rgba(23,23,23,0.14)]">
        {message.text}
      </div>
    );
  }

  const mood = message.mood ? moodCopy[message.mood] : moodCopy.watch;

  return (
    <div className="finance-message-bubble mr-6 overflow-hidden rounded-[1.35rem] border border-ink/8 bg-white/76 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-ink/8 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-sky text-ink">
            <Sparkles size={15} />
          </span>
          <span className="text-xs font-black text-ink/44">{message.confidence ?? "Based on context"}</span>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-black ${mood.className}`}>{mood.label}</span>
      </div>
      <div className="space-y-3 p-3">
        {message.text ? (
          <p className="whitespace-pre-wrap text-sm font-bold leading-6 text-ink/78">
            {message.text}
            {message.streaming ? <span className="finance-stream-cursor ml-0.5 inline-block h-4 w-1 rounded-full bg-ink/50 align-[-2px]" /> : null}
          </p>
        ) : message.streaming ? (
          <StreamingSkeleton confidence={message.confidence} />
        ) : null}

        {message.cards?.length ? <GeneratedCards cards={message.cards} /> : null}

        {message.insights?.length ? (
          <div className="grid gap-2">
            {message.insights.map((insight, index) => (
              <div key={`${insight}-${index}`} className="flex items-start gap-2 rounded-2xl bg-smoke px-3 py-2">
                {index % 2 === 0 ? (
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-verdant" />
                ) : (
                  <TrendingDown size={15} className="mt-0.5 shrink-0 text-coral" />
                )}
                <p className="text-xs font-bold leading-5 text-ink/58">{insight}</p>
              </div>
            ))}
          </div>
        ) : null}

        {message.actions?.length ? (
          <div className="flex flex-wrap gap-2">
            {message.actions.map((action) => (
              <span key={action} className="inline-flex items-center gap-1 rounded-full bg-[#ffcf6e] px-3 py-1.5 text-xs font-black text-ink">
                <CalendarClock size={13} />
                {action}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OrganicThinking() {
  return (
    <div className="finance-message-bubble mr-10 overflow-hidden rounded-[1.25rem] border border-ink/8 bg-white/72 p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="organic-blob grid h-10 w-10 place-items-center bg-sky text-ink">
          <Sparkles size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ink/38">Thinking</p>
          <div className="mt-2 grid gap-1.5">
            <span className="skeleton block h-2.5 w-full rounded-full" />
            <span className="skeleton block h-2.5 w-2/3 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StreamingSkeleton({ confidence }: { confidence?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-smoke p-3">
      <span className="organic-blob grid h-10 w-10 shrink-0 place-items-center bg-sky text-ink">
        <Sparkles size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink/38">{confidence ?? "Thinking"}</p>
        <div className="mt-2 grid gap-1.5">
          <span className="skeleton block h-2.5 w-full rounded-full" />
          <span className="skeleton block h-2.5 w-11/12 rounded-full" />
          <span className="skeleton block h-2.5 w-2/3 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function GeneratedCards({ cards }: { cards: CompanionCard[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {cards.map((card) => (
        <div key={`${card.title}-${card.value}`} className={`finance-generated-card rounded-2xl p-3 ${cardTone(card.tone)}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-ink/45">{card.title}</p>
          <p className="mt-2 font-mono text-xl font-black leading-none tabular-nums">{card.value}</p>
          <p className="mt-2 text-xs font-bold leading-5 text-ink/58">{card.body}</p>
        </div>
      ))}
    </div>
  );
}

function cardTone(tone: CompanionCard["tone"]) {
  if (tone === "mint") {
    return "bg-mint";
  }

  if (tone === "sky") {
    return "bg-sky";
  }

  if (tone === "coral") {
    return "bg-[#ff9a76]";
  }

  return "bg-[#ffcf6e]";
}

function buildMoneyContext(view: AppView) {
  return {
    page: viewLabels[view],
    user: userProfile,
    safeToSpend: "$186",
    moneyMood,
    liveFeed,
    budgetRooms,
    subscriptionStack,
    cardStack,
  };
}

function normalizeList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 4);
  return items.length > 0 ? items : fallback;
}

function normalizeCards(value: unknown): CompanionCard[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const card = item as Partial<CompanionCard>;
    const tone = card.tone === "mint" || card.tone === "sky" || card.tone === "gold" || card.tone === "coral" ? card.tone : "gold";

    if (!card.title || !card.value || !card.body) {
      return [];
    }

    return [
      {
        title: card.title,
        value: card.value,
        body: card.body,
        tone,
      },
    ];
  });
}
