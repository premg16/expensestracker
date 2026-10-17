import type { Budget, CategoryRule, Transaction } from "@/lib/finance-data";

export type TransactionDraft = {
  date: string;
  merchant: string;
  category?: string;
  account?: string;
  amount: number;
  kind?: Transaction["kind"];
  signal?: Transaction["signal"];
  source: Transaction["source"];
  recurring?: boolean;
};

export type BudgetState = "On track" | "Watch" | "Tight" | "Over";

// Round money down to the cent so a "safe" number never overstates what's left.
export function floorCents(value: number) {
  return Math.floor(value * 100) / 100;
}

export function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function isoDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Accepts YYYY-MM-DD or M/D/YYYY and returns a real calendar date as YYYY-MM-DD, else null.
export function normalizeDate(value: string | undefined) {
  const text = value?.trim() ?? "";
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  const iso = us
    ? `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`
    : /^\d{4}-\d{2}-\d{2}$/.test(text)
      ? text
      : null;

  if (!iso) {
    return null;
  }

  const parsed = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso ? iso : null;
}

export function makeTransaction(draft: TransactionDraft, rules: CategoryRule[]): Transaction {
  const kind = draft.kind ?? "expense";
  const rule = kind === "expense" ? rules.find((item) => draft.merchant.toLowerCase().includes(item.matcher.toLowerCase())) : undefined;

  return {
    id: `txn-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: draft.date,
    merchant: draft.merchant,
    category: draft.category?.trim() || rule?.category || (kind === "income" ? "Income" : "Uncategorized"),
    account: draft.account?.trim() || rule?.account || "Checking",
    amount: draft.amount,
    kind,
    signal: draft.signal || rule?.signal || (kind === "income" ? "Cleared" : "Watch"),
    source: draft.source,
    recurring: draft.recurring,
  };
}

export function expensesOnly(transactions: Transaction[]) {
  return transactions.filter((transaction) => transaction.kind === "expense");
}

export function categorySpend(transactions: Transaction[]) {
  return expensesOnly(transactions).reduce<Record<string, number>>((totals, transaction) => {
    totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
    return totals;
  }, {});
}

export function budgetState(ratio: number): BudgetState {
  return ratio > 1 ? "Over" : ratio >= 0.85 ? "Tight" : ratio >= 0.6 ? "Watch" : "On track";
}

// Pass this month's transactions: budgets are monthly limits.
export function budgetStatus(transactions: Transaction[], budgets: Budget[]) {
  const spend = categorySpend(transactions);

  return budgets.map((budget) => {
    const used = spend[budget.category] ?? 0;
    const remaining = budget.limit - used;
    const ratio = budget.limit > 0 ? used / budget.limit : used > 0 ? 2 : 0;

    return {
      ...budget,
      used,
      remaining,
      ratio,
      percent: Math.floor(ratio * 100),
      state: budgetState(ratio),
    };
  });
}

export type BudgetLine = ReturnType<typeof budgetStatus>[number];

export function monthSnapshot(transactions: Transaction[], today: string) {
  const month = today.slice(0, 7);
  const inMonth = transactions.filter((transaction) => transaction.date.startsWith(month));
  const day = Number(today.slice(8, 10));
  const daysInMonth = new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 0)).getUTCDate();

  return {
    inMonth,
    income: inMonth.filter((item) => item.kind === "income").reduce((total, item) => total + item.amount, 0),
    spend: expensesOnly(inMonth).reduce((total, item) => total + item.amount, 0),
    day,
    daysInMonth,
    daysLeft: daysInMonth - day + 1, // counts today
    monthPercent: Math.round((day / daysInMonth) * 100),
  };
}

export type MonthSnapshot = ReturnType<typeof monthSnapshot>;

// Safe to spend today = what is left for the month spread over the days that remain.
// With budgets: budget limits minus spend in budgeted categories. Without: income minus spend.
export function safeToSpend(snapshot: MonthSnapshot, lines: BudgetLine[]) {
  const budgeted = lines.length > 0;
  const budgetLeft = lines.reduce((total, line) => total + line.remaining, 0);

  if (!budgeted && snapshot.income === 0 && snapshot.spend === 0) {
    return null;
  }

  const left = budgeted ? budgetLeft : snapshot.income - snapshot.spend;

  return {
    basis: budgeted ? ("budget" as const) : ("cashflow" as const),
    left,
    perDay: Math.max(0, left) / snapshot.daysLeft,
  };
}

export type ActionItem = {
  title: string;
  detail: string;
  action: string;
  href: string;
  tone: "urgent" | "warn" | "good";
};

export function buildActionQueue(lines: BudgetLine[], transactions: Transaction[], daysLeft: number): ActionItem[] {
  const items: ActionItem[] = [];
  const tight = lines.filter((line) => line.ratio >= 0.8).sort((a, b) => b.ratio - a.ratio);

  for (const line of tight.slice(0, 2)) {
    items.push(
      line.remaining < 0
        ? {
            title: `${line.category} is over budget`,
            detail: `${currency(-line.remaining)} past the ${currency(line.limit)} limit.`,
            action: "Adjust",
            href: "/app/budgets",
            tone: "urgent",
          }
        : {
            title: `${line.category} is tight`,
            detail: `${currency(line.remaining)} left with ${daysLeft} ${daysLeft === 1 ? "day" : "days"} to go.`,
            action: "Plan",
            href: "/app/budgets",
            tone: "warn",
          },
    );
  }

  const review = transactions.filter((transaction) => transaction.signal === "Review");
  if (review.length > 0) {
    items.push({
      title: `${review.length} ${review.length === 1 ? "charge needs" : "charges need"} a look`,
      detail: review
        .slice(0, 2)
        .map((transaction) => transaction.merchant)
        .join(", "),
      action: "Review",
      href: "/app/activity",
      tone: "warn",
    });
  }

  const recurring = latestRecurring(transactions);
  if (recurring.length > 0) {
    items.push({
      title: `${recurring.length} recurring ${recurring.length === 1 ? "charge" : "charges"}`,
      detail: `${currency(recurring.reduce((total, item) => total + item.amount, 0))} a month keeps renewing.`,
      action: "See",
      href: "/app/cards",
      tone: "good",
    });
  }

  return items.slice(0, 3);
}

// Latest recurring expense per merchant.
export function latestRecurring(transactions: Transaction[]) {
  const latest = new Map<string, Transaction>();

  for (const transaction of transactions) {
    if (!transaction.recurring || transaction.kind !== "expense") {
      continue;
    }

    const key = transaction.merchant.trim().toLowerCase();
    const current = latest.get(key);
    if (!current || transaction.date > current.date) {
      latest.set(key, transaction);
    }
  }

  return [...latest.values()].sort((a, b) => b.amount - a.amount);
}

export function accountSummaries(transactions: Transaction[], today: string) {
  const month = today.slice(0, 7);
  const accounts = new Map<string, { account: string; monthSpend: number; count: number }>();

  for (const transaction of transactions) {
    const entry = accounts.get(transaction.account) ?? { account: transaction.account, monthSpend: 0, count: 0 };
    entry.count += 1;
    if (transaction.kind === "expense" && transaction.date.startsWith(month)) {
      entry.monthSpend += transaction.amount;
    }
    accounts.set(transaction.account, entry);
  }

  return [...accounts.values()].sort((a, b) => b.monthSpend - a.monthSpend || b.count - a.count);
}

export function parseCsvTransactions(csv: string, rules: CategoryRule[]) {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0].replace(/^\uFEFF/, "")).map((header) => header.toLowerCase().trim());

  return lines.slice(1).flatMap((line) => {
    const values = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]));
    const amount = Number(row.amount?.replace(/[$,]/g, ""));
    const merchant = row.merchant || row.description || row.payee;
    const date = row.date ? normalizeDate(row.date) : isoDate(new Date());

    if (!merchant || !date || row.amount === "" || Number.isNaN(amount)) {
      return [];
    }

    // Bank-export convention: positive = money out, negative = money in.
    const income = amount < 0 || row.category?.trim().toLowerCase() === "income";

    return [
      makeTransaction(
        {
          date,
          merchant,
          category: row.category,
          account: row.account,
          amount: Math.abs(amount),
          kind: income ? "income" : "expense",
          signal: normalizeSignal(row.signal || row.status),
          source: "CSV",
          recurring: row.recurring?.toLowerCase() === "true",
        },
        rules,
      ),
    ];
  });
}

function normalizeSignal(value?: string): Transaction["signal"] | undefined {
  const signal = value?.toLowerCase();

  if (signal === "cleared") {
    return "Cleared";
  }

  if (signal === "review") {
    return "Review";
  }

  if (signal === "watch") {
    return "Watch";
  }

  return undefined;
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (const character of line) {
    if (character === '"') {
      quoted = !quoted;
      continue;
    }

    if (character === "," && !quoted) {
      cells.push(cell);
      cell = "";
      continue;
    }

    cell += character;
  }

  cells.push(cell);
  return cells;
}
