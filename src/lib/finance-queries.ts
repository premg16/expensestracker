import { getDb } from "@/db";
import { budgets, transactions } from "@/db/schema";
import type { Budget, Transaction } from "@/lib/finance-data";
import { desc, eq } from "drizzle-orm";

// Server-only: every read is scoped by the Clerk user id.
export async function getUserFinance(userId: string, options: { transactionLimit?: number } = {}) {
  const db = getDb();
  const [transactionRows, budgetRows] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(options.transactionLimit ?? 5000),
    db.select().from(budgets).where(eq(budgets.userId, userId)).orderBy(budgets.category),
  ]);

  return {
    // numeric columns come back as strings: convert at this boundary
    transactions: transactionRows.map(
      (row): Transaction => ({
        id: row.id,
        date: row.date,
        merchant: row.merchant,
        category: row.category,
        account: row.account,
        amount: Number(row.amount),
        kind: row.kind === "income" ? "income" : "expense",
        signal: row.signal as Transaction["signal"],
        source: row.source as Transaction["source"],
        recurring: row.recurring,
      }),
    ),
    budgets: budgetRows.map(
      (row): Budget => ({
        id: row.id,
        category: row.category,
        limit: Number(row.limit),
        account: row.account,
      }),
    ),
  };
}
