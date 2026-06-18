import OpenAI from "openai";

type CompanionResponse = {
  answer: string;
  mood: "calm" | "watch" | "urgent";
  confidence: string;
  actions: string[];
  insights: string[];
  cards: CompanionCard[];
};

type CompanionCard = {
  title: string;
  value: string;
  body: string;
  tone: "mint" | "sky" | "gold" | "coral";
};

export async function POST(request: Request) {
  const { message, transactions, budgets, context, stream } = (await request.json()) as {
    message?: string;
    transactions?: unknown;
    budgets?: unknown;
    context?: unknown;
    stream?: boolean;
  };

  if (stream) {
    return streamCompanion({ message, transactions, budgets, context });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(localCompanionResponse(message), { status: 200 });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      input: [
        {
          role: "system",
          content:
            "You are Float's private money companion. Give concise personal finance guidance from user-provided transactions, budgets, cards, subscriptions, and page context. Do not give legal, tax, or investment advice. Never use em dashes. Return only valid JSON with these keys: answer, mood, confidence, actions, insights. mood must be calm, watch, or urgent. confidence should be a short phrase. actions and insights must each contain 2 to 4 short strings.",
        },
        {
          role: "user",
          content: JSON.stringify({
            question: message ?? "Summarize my spending.",
            transactions: transactions ?? [],
            budgets: budgets ?? [],
            context: context ?? {},
          }),
        },
      ],
    });

    return Response.json(parseCompanionResponse(response.output_text));
  } catch {
    return Response.json(
      {
        ...localCompanionResponse(message),
        confidence: "Live route unavailable",
      },
      { status: 200 },
    );
  }
}

function parseCompanionResponse(output: string): CompanionResponse {
  try {
    const parsed = JSON.parse(output) as Partial<CompanionResponse>;
    const mood = parsed.mood === "urgent" || parsed.mood === "watch" || parsed.mood === "calm" ? parsed.mood : "watch";

    return {
      answer: stringOrFallback(parsed.answer, output),
      mood,
      confidence: stringOrFallback(parsed.confidence, "Based on connected sample data"),
      actions: listOrFallback(parsed.actions, ["Review subscriptions", "Check budget pressure"]),
      insights: listOrFallback(parsed.insights, ["Float used the latest visible money context"]),
      cards: cardsOrFallback(parsed.cards, cardsForQuestion("")),
    };
  } catch {
    return {
      answer: output,
      mood: "watch",
      confidence: "Freeform answer",
      actions: ["Review subscriptions", "Check budget pressure"],
      insights: ["Float used the latest visible money context"],
      cards: cardsForQuestion(""),
    };
  }
}

function localCompanionResponse(message?: string): CompanionResponse {
  const query = message?.toLowerCase() ?? "";

  if (query.includes("subscription") || query.includes("waste") || query.includes("review")) {
    return {
      answer: "Start with Spotify Duo and Hulu. Spotify changed price, and Hulu looks unused this month. That is the cleanest recovery path before touching essentials.",
      mood: "watch",
      confidence: "Local preview",
      actions: ["Review Spotify Duo", "Check Hulu usage", "Keep iCloud if shared"],
      insights: ["Renewals are the loudest leak right now", "The rest of the card stack looks current"],
      cards: cardsForQuestion("subscription"),
    };
  }

  if (query.includes("save") || query.includes("plan") || query.includes("cut")) {
    return {
      answer: "A simple plan is to cap dinner at $42, pause one dusty subscription, and move $60 from shopping to groceries. Savings stay untouched.",
      mood: "calm",
      confidence: "Local preview",
      actions: ["Cap dinner at $42", "Move $60 to groceries", "Pause one renewal"],
      insights: ["Groceries are tight but manageable", "Emergency fund is ahead of target"],
      cards: cardsForQuestion("save"),
    };
  }

  if (query.includes("spend") || query.includes("afford") || query.includes("dinner")) {
    return {
      answer: "Dinner fits if it stays under $42. Your safe-to-spend number is $186 after bills, cards, goals, and planned groceries.",
      mood: "calm",
      confidence: "Local preview",
      actions: ["Keep dinner under $42", "Check again after groceries"],
      insights: ["No major bills are due for 5 days", "The weekend still stays green"],
      cards: cardsForQuestion("spend"),
    };
  }

  return {
    answer: "Add OPENAI_API_KEY to enable live companion responses. For now, Float can still preview spend, subscription, budget, and savings guidance from local product data.",
    mood: "watch",
    confidence: "Setup needed",
    actions: ["Ask about spending", "Find waste", "Plan savings"],
    insights: ["The key stays server-side", "The chat UI is connected to the assistant route"],
    cards: cardsForQuestion(""),
  };
}

function streamCompanion({
  message,
  transactions,
  budgets,
  context,
}: {
  message?: string;
  transactions?: unknown;
  budgets?: unknown;
  context?: unknown;
}) {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        const send = (event: unknown) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        };

        try {
          if (!process.env.OPENAI_API_KEY) {
            await streamLocalText(send, localCompanionResponse(message));
            controller.close();
            return;
          }

          const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          const response = await client.responses.create({
            model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
            stream: true,
            input: [
              {
                role: "system",
                content:
                  "You are Float's private money companion. Write a concise, warm finance answer in plain text. Use the user's transactions, budgets, cards, subscriptions, and page context. Do not give legal, tax, or investment advice. Never use em dashes. Do not return JSON.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  question: message ?? "Summarize my spending.",
                  transactions: transactions ?? [],
                  budgets: budgets ?? [],
                  context: context ?? {},
                }),
              },
            ],
          });

          for await (const event of response as AsyncIterable<{ type?: string; delta?: string; error?: unknown }>) {
            if (event.type === "response.output_text.delta" && event.delta) {
              send({ type: "delta", text: event.delta });
            }

            if (event.type === "error") {
              send({ type: "delta", text: "I hit a live route issue. Try again in a moment." });
            }
          }

          send(streamDoneEvent(message, "Live stream"));
          controller.close();
        } catch {
          await streamLocalText(send, {
            ...localCompanionResponse(message),
            confidence: "Live route unavailable",
          });
          controller.close();
        }
      },
    }),
    {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    },
  );
}

async function streamLocalText(send: (event: unknown) => void, response: CompanionResponse) {
  const chunks = response.answer.match(/.{1,18}(\s|$)/g) ?? [response.answer];

  for (const chunk of chunks) {
    send({ type: "delta", text: chunk });
    await new Promise((resolve) => setTimeout(resolve, 26));
  }

  send({
    type: "done",
    mood: response.mood,
    confidence: response.confidence,
    actions: response.actions,
    insights: response.insights,
    cards: response.cards,
  });
}

function streamDoneEvent(message: string | undefined, confidence: string) {
  const local = localCompanionResponse(message);

  return {
    type: "done",
    mood: local.mood,
    confidence,
    actions: local.actions,
    insights: local.insights,
    cards: local.cards,
  };
}

function stringOrFallback(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function listOrFallback(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 4);
  return items.length > 0 ? items : fallback;
}

function cardsOrFallback(value: unknown, fallback: CompanionCard[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const cards = value.flatMap((item) => {
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

  return cards.length > 0 ? cards.slice(0, 4) : fallback;
}

function cardsForQuestion(message: string | undefined): CompanionCard[] {
  const query = message?.toLowerCase() ?? "";

  if (query.includes("subscription") || query.includes("waste") || query.includes("review")) {
    return [
      {
        title: "Recoverable",
        value: "$36",
        body: "Spotify and Hulu are the cleanest places to check first.",
        tone: "gold",
      },
      {
        title: "Risk",
        value: "Low",
        body: "This is a watch item, not an emergency.",
        tone: "mint",
      },
    ];
  }

  if (query.includes("save") || query.includes("plan") || query.includes("cut")) {
    return [
      {
        title: "Move",
        value: "$60",
        body: "Shift shopping room into groceries without touching savings.",
        tone: "sky",
      },
      {
        title: "Goal",
        value: "$500",
        body: "A weekly cap plus one paused renewal keeps this realistic.",
        tone: "mint",
      },
    ];
  }

  if (query.includes("spend") || query.includes("afford") || query.includes("dinner")) {
    return [
      {
        title: "Tonight",
        value: "$42",
        body: "Keep dinner near this number and the weekend stays green.",
        tone: "gold",
      },
      {
        title: "Buffer",
        value: "$186",
        body: "Current safe-to-spend after bills, cards, and goals.",
        tone: "mint",
      },
    ];
  }

  return [
    {
      title: "Float",
      value: "$186",
      body: "Safe-to-spend is the current anchor for quick decisions.",
      tone: "mint",
    },
    {
      title: "Watch",
      value: "2",
      body: "Groceries and renewals deserve the closest look.",
      tone: "gold",
    },
  ];
}
