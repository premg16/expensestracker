import { boolean, date, index, integer, numeric, pgTable, primaryKey, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    date: date("date").notNull(),
    merchant: text("merchant").notNull(),
    category: text("category").notNull(),
    account: text("account").notNull(),
    // always positive; `kind` says which way the money moved
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    kind: text("kind").notNull().default("expense"),
    signal: text("signal").notNull(),
    source: text("source").notNull(),
    recurring: boolean("recurring").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("transactions_user_date_idx").on(table.userId, table.date)],
);

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    category: text("category").notNull(),
    limit: numeric("limit", { precision: 12, scale: 2 }).notNull(),
    account: text("account").notNull().default(""),
  },
  (table) => [unique("budgets_user_category_unique").on(table.userId, table.category)],
);

export const aiUsage = pgTable(
  "ai_usage",
  {
    userId: text("user_id").notNull(),
    day: date("day").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.day] })],
);
