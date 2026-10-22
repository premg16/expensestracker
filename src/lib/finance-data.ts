export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  category: string;
  account: string;
  amount: number;
  kind: "expense" | "income";
  signal: "Watch" | "Cleared" | "Review";
  source: "Manual" | "CSV" | "Bank";
  recurring?: boolean;
};

export type Budget = {
  id: string;
  category: string;
  limit: number;
  account: string;
};

export type CategoryRule = {
  id: string;
  matcher: string;
  category: string;
  account: string;
  signal: Transaction["signal"];
};

// Built-in merchant matchers used to guess a category when the user leaves it blank.
export const categoryRules: CategoryRule[] = [
  {
    id: "rule-rent",
    matcher: "rent",
    category: "Housing",
    account: "Checking",
    signal: "Cleared",
  },
  {
    id: "rule-grocery",
    matcher: "market",
    category: "Groceries",
    account: "Credit card",
    signal: "Cleared",
  },
  {
    id: "rule-ride",
    matcher: "uber",
    category: "Transport",
    account: "Credit card",
    signal: "Watch",
  },
  {
    id: "rule-subscription",
    matcher: "subscription",
    category: "Subscriptions",
    account: "Credit card",
    signal: "Review",
  },
];
