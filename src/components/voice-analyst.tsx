"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Send, Sparkles, Volume2 } from "lucide-react";
import { assistantPrompts, transactions } from "@/lib/finance-data";

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type SpeechRecognitionResultItem = {
  transcript: string;
};

type SpeechRecognitionResult = {
  0?: SpeechRecognitionResultItem;
};

type SpeechRecognitionResultList = Iterable<SpeechRecognitionResult>;

type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
};

type SpeechRecognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type Message = {
  role: "user" | "analyst";
  text: string;
};

function responseFor(input: string) {
  const query = input.toLowerCase();

  if (query.includes("duplicate") || query.includes("saas")) {
    return "Duplicate design seats and the sales intelligence renewal should be reviewed first. Together they represent $11.8K of near-term controllable spend.";
  }

  if (query.includes("runway") || query.includes("scenario") || query.includes("10")) {
    return "A 10 percent reduction across cloud, sales tools, and travel adds roughly 2.1 months of runway without touching core hiring.";
  }

  if (query.includes("approval") || query.includes("review")) {
    const count = transactions.filter((transaction) => transaction.signal === "Review").length;
    return `${count} items need review today. Start with the founders retreat deposit, then clean up duplicate design seats.`;
  }

  if (query.includes("burn") || query.includes("changed")) {
    return "Burn is down 8.4 percent against plan. The main contributors are cloud credit usage, paused contractor spend, and slower travel release.";
  }

  return "I can summarize burn movement, find duplicate spend, build savings scenarios, or identify approvals due today.";
}

export function VoiceAnalyst() {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("Ready for typed or spoken commands");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "analyst",
      text: "Ask about burn, runway, vendor overlap, approvals, or savings scenarios.",
    },
  ]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const quickPrompts = useMemo(() => assistantPrompts, []);

  function submitCommand(command: string) {
    const trimmed = command.trim();

    if (!trimmed) {
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
      { role: "analyst", text: responseFor(trimmed) },
    ]);
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitCommand(input);
  }

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setStatus("Voice capture stopped");
      return;
    }

    const Recognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition ?? window.webkitSpeechRecognition
        : undefined;

    if (!Recognition) {
      setStatus("Voice capture is not supported in this browser");
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      setInput(transcript);
      submitCommand(transcript);
      setStatus("Voice command captured");
    };

    recognition.onerror = () => {
      setStatus("Voice capture failed. Try typing the command.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setStatus("Listening for a finance command");
  }

  return (
    <section className="border border-ink/15 bg-ink text-paper">
      <div className="flex items-center justify-between border-b border-paper/10 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-paper/55">Voice analyst</p>
          <h2 className="mt-1 text-lg font-semibold">Decision desk</h2>
        </div>
        <button
          type="button"
          onClick={toggleListening}
          className="relative grid h-11 w-11 place-items-center border border-paper/20 bg-paper/10 text-paper transition hover:bg-paper hover:text-ink"
          aria-label={listening ? "Stop voice command" : "Start voice command"}
        >
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
          {listening ? <span className="pulse-ring absolute inset-0 border border-paper/45" /> : null}
        </button>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="flex items-center gap-2 text-xs text-paper/55">
          <Volume2 size={14} />
          <span>{status}</span>
        </div>

        <div className="h-[264px] space-y-3 overflow-y-auto pr-1">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`border px-3 py-2 text-sm leading-6 ${
                message.role === "user"
                  ? "ml-8 border-brass/40 bg-brass/15 text-paper"
                  : "mr-8 border-paper/12 bg-paper/8 text-paper/82"
              }`}
            >
              {message.role === "analyst" ? (
                <Sparkles className="mr-2 inline-block text-brass" size={14} />
              ) : null}
              {message.text}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about burn, runway, approvals..."
            className="min-w-0 flex-1 border border-paper/15 bg-paper/8 px-3 py-3 text-sm text-paper outline-none placeholder:text-paper/35 focus:border-brass"
          />
          <button
            type="submit"
            className="grid h-12 w-12 place-items-center bg-brass text-ink transition hover:bg-paper"
            aria-label="Send command"
          >
            <Send size={17} />
          </button>
        </form>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => submitCommand(prompt)}
              className="border border-paper/10 px-3 py-2 text-left text-xs text-paper/68 transition hover:border-brass hover:text-paper"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
