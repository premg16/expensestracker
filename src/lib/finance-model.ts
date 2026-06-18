import type { Budget, CategoryRule, Transaction } from "@/lib/finance-data";

export type TransactionDraft = {
  date: string;
  merchant: string;
  category?: string;
  owner?: string;
  amount: number;
  signal?: Transaction["signal"];
  source: Transaction["source"];
  recurring?: boolean;
};

export function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function makeTransaction(draft: TransactionDraft, rules: CategoryRule[]): Transaction {
  const rule = rules.find((item) => draft.merchant.toLowerCase().includes(item.matcher.toLowerCase()));

  return {
    id: `txn-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: draft.date,
    merchant: draft.merchant,
    category: draft.category?.trim() || rule?.category || "Uncategorized",
    owner: draft.owner?.trim() || rule?.owner || "Finance",
    amount: draft.amount,
    signal: draft.signal || rule?.signal || "Watch",
    source: draft.source,
    recurring: draft.recurring,
  };
}

export function categorySpend(transactions: Transaction[]) {
  return transactions.reduce<Record<string, number>>((totals, transaction) => {
    totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
    return totals;
  }, {});
}

export function budgetStatus(transactions: Transaction[], budgets: Budget[]) {
  const spend = categorySpend(transactions);

  return budgets.map((budget) => {
    const used = spend[budget.category] ?? 0;
    const remaining = budget.limit - used;
    const ratio = budget.limit > 0 ? used / budget.limit : 0;

    return {
      ...budget,
      used,
      remaining,
      ratio,
      state: ratio >= 1 ? "Over" : ratio >= 0.82 ? "Tight" : "Healthy",
    };
  });
}

export function parseCsvTransactions(csv: string, rules: CategoryRule[]) {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase().trim());

  return lines.slice(1).flatMap((line) => {
    const values = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? ""]));
    const amount = Number(row.amount?.replace(/[$,]/g, ""));
    const merchant = row.merchant || row.description || row.vendor;

    if (!merchant || Number.isNaN(amount)) {
      return [];
    }

    return [
      makeTransaction(
        {
          date: row.date || new Date().toISOString().slice(0, 10),
          merchant,
          category: row.category,
          owner: row.owner,
          amount: Math.abs(amount),
          signal: normalizeSignal(row.signal),
          source: "CSV",
          recurring: row.recurring?.toLowerCase() === "true",
        },
        rules,
      ),
    ];
  });
}

export function scenarioSummary(transactions: Transaction[], reductionPercent: number) {
  const controllableCategories = new Set(["Cloud", "Sales", "Software", "Travel", "Operations"]);
  const controllable = transactions
    .filter((transaction) => controllableCategories.has(transaction.category))
    .reduce((total, transaction) => total + transaction.amount, 0);
  const monthlySavings = controllable * (reductionPercent / 100);
  const annualSavings = monthlySavings * 12;
  const runwayMonths = monthlySavings > 0 ? monthlySavings / 95000 : 0;

  return {
    controllable,
    monthlySavings,
    annualSavings,
    runwayMonths,
  };
}

function normalizeSignal(value?: string): Transaction["signal"] | undefined {
  const signal = value?.toLowerCase();

  if (signal === "approved") {
    return "Approved";
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
