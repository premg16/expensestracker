"use server";

import { getDb } from "@/db";
import { budgets, transactions } from "@/db/schema";
import { categoryRules } from "@/lib/finance-data";
import { makeTransaction, normalizeDate, parseCsvTransactions } from "@/lib/finance-model";
import { auth } from "@clerk/nextjs/server";
import { and, count, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const MAX_CSV_ROWS = 2000;
const MAX_CSV_CHARS = 900_000; // stays under the 1 MB server action body limit
const MAX_AMOUNT = 10_000_000;
const MAX_TRANSACTIONS_PER_USER = 25_000;
const SIGNALS = ["Watch", "Cleared", "Review"] as const;
const KINDS = ["expense", "income"] as const;

type Signal = (typeof SIGNALS)[number];
type Kind = (typeof KINDS)[number];

async function requireUser() {
  const { userId } = await auth();
  return userId;
}

function cleanText(value: unknown, max = 100) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 && text.length <= max ? text : null;
}

function cleanAmount(value: unknown) {
  const amount = typeof value === "number" ? value : Number(value);
  const rounded = Math.round(amount * 100) / 100;
  return Number.isFinite(rounded) && rounded > 0 && rounded <= MAX_AMOUNT ? rounded : null;
}

const FAILED = { ok: false, error: "Something went wrong saving that. Try again." } as const;

// ponytail: count-then-insert, so two concurrent imports can overshoot a little. Soft cap; fine for storage abuse.
async function transactionCount(userId: string) {
  const [row] = await getDb().select({ n: count() }).from(transactions).where(eq(transactions.userId, userId));
  return row?.n ?? 0;
}

const STORAGE_FULL = `You have reached the ${MAX_TRANSACTIONS_PER_USER.toLocaleString()} transaction limit. Delete some old ones to add more.`;

function refresh() {
  revalidatePath("/app", "layout");
}

export async function addTransaction(input: {
  date: string;
  merchant: string;
  category?: string;
  account?: string;
  amount: number;
  kind: Kind;
  signal?: Signal;
  recurring?: boolean;
}): Promise<ActionResult> {
  const userId = await requireUser();
  if (!userId) return { ok: false, error: "Please sign in again." };

  const date = normalizeDate(input?.date);
  const merchant = cleanText(input?.merchant);
  const amount = cleanAmount(input?.amount);
  const category = input?.category?.trim() ? cleanText(input.category) : "";
  const account = input?.account?.trim() ? cleanText(input.account) : "";

  if (!merchant) return { ok: false, error: "Add a merchant (up to 100 characters)." };
  if (amount === null) return { ok: false, error: "Amount must be more than 0 and at most 10,000,000." };
  if (!date) return { ok: false, error: "Pick a valid date." };
  if (category === null || account === null) return { ok: false, error: "Category and account can be up to 100 characters." };
  if (!KINDS.includes(input.kind)) return { ok: false, error: "Choose expense or income." };
  if (input.signal && !SIGNALS.includes(input.signal)) return { ok: false, error: "Unknown status." };

  const row = makeTransaction(
    { date, merchant, category, account, amount, kind: input.kind, signal: input.signal, source: "Manual", recurring: input.recurring === true },
    categoryRules,
  );

  try {
    if ((await transactionCount(userId)) >= MAX_TRANSACTIONS_PER_USER) return { ok: false, error: STORAGE_FULL };

    await getDb().insert(transactions).values({
      userId,
      date: row.date,
      merchant: row.merchant,
      category: row.category,
      account: row.account,
      amount: row.amount.toFixed(2),
      kind: row.kind,
      signal: row.signal,
      source: row.source,
      recurring: row.recurring === true,
    });
  } catch {
    return FAILED;
  }

  refresh();
  return { ok: true };
}

export async function importCsv(csvText: string): Promise<ActionResult<{ count: number; skipped: number }>> {
  const userId = await requireUser();
  if (!userId) return { ok: false, error: "Please sign in again." };
  if (typeof csvText !== "string" || csvText.trim() === "") return { ok: false, error: "Paste or upload a CSV first." };
  if (csvText.length > MAX_CSV_CHARS) return { ok: false, error: "That file is too large. Split it into smaller imports." };

  const dataLines = csvText.split(/\r?\n/).filter((line) => line.trim()).length - 1;
  const parsed = parseCsvTransactions(csvText, categoryRules).filter(
    (row) =>
      cleanText(row.merchant) !== null &&
      cleanText(row.category) !== null &&
      cleanText(row.account) !== null &&
      cleanAmount(row.amount) !== null,
  );

  if (parsed.length === 0) {
    return { ok: false, error: "No valid rows found. Use the header: date,merchant,amount,category,account." };
  }
  if (parsed.length > MAX_CSV_ROWS) {
    return { ok: false, error: `Imports are capped at ${MAX_CSV_ROWS.toLocaleString()} rows. Split the file and try again.` };
  }

  try {
    const room = MAX_TRANSACTIONS_PER_USER - (await transactionCount(userId));
    if (room <= 0) return { ok: false, error: STORAGE_FULL };
    if (parsed.length > room) {
      return {
        ok: false,
        error: `That import has ${parsed.length.toLocaleString()} rows, but you only have room for ${room.toLocaleString()} more (limit ${MAX_TRANSACTIONS_PER_USER.toLocaleString()}).`,
      };
    }

    await getDb()
      .insert(transactions)
      .values(
        parsed.map((row) => ({
          userId,
          date: row.date,
          merchant: row.merchant.trim(),
          category: row.category,
          account: row.account,
          amount: row.amount.toFixed(2),
          kind: row.kind,
          signal: row.signal,
          source: "CSV",
          recurring: row.recurring === true,
        })),
      );
  } catch {
    return FAILED;
  }

  refresh();
  return { ok: true, count: parsed.length, skipped: Math.max(0, dataLines - parsed.length) };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const userId = await requireUser();
  if (!userId) return { ok: false, error: "Please sign in again." };
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Unknown transaction." };

  try {
    await getDb().delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  } catch {
    return FAILED;
  }

  refresh();
  return { ok: true };
}

export async function upsertBudget(input: { category: string; limit: number }): Promise<ActionResult> {
  const userId = await requireUser();
  if (!userId) return { ok: false, error: "Please sign in again." };

  const category = cleanText(input?.category);
  const limit = cleanAmount(input?.limit);

  if (!category) return { ok: false, error: "Add a category (up to 100 characters)." };
  if (limit === null) return { ok: false, error: "Limit must be more than 0 and at most 10,000,000." };

  try {
    await getDb()
      .insert(budgets)
      .values({ userId, category, limit: limit.toFixed(2) })
      .onConflictDoUpdate({ target: [budgets.userId, budgets.category], set: { limit: sql`excluded.limit` } });
  } catch {
    return FAILED;
  }

  refresh();
  return { ok: true };
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  const userId = await requireUser();
  if (!userId) return { ok: false, error: "Please sign in again." };
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, error: "Unknown budget." };

  try {
    await getDb().delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
  } catch {
    return FAILED;
  }

  refresh();
  return { ok: true };
}
