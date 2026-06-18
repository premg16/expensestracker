export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  category: string;
  account: string;
  amount: number;
  signal: "Watch" | "Cleared" | "Review";
  source: "Manual" | "CSV" | "Bank";
  recurring?: boolean;
};

export type Budget = {
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

export const kpis = [
  {
    label: "Spent this month",
    value: "$4,286",
    change: "-6.2%",
    tone: "good",
    detail: "lower than last month",
  },
  {
    label: "Left to budget",
    value: "$1,214",
    change: "22%",
    tone: "good",
    detail: "available for the month",
  },
  {
    label: "Bills due",
    value: "$820",
    change: "4 items",
    tone: "warn",
    detail: "due in the next 7 days",
  },
  {
    label: "Savings rate",
    value: "18.5%",
    change: "+2.4%",
    tone: "neutral",
    detail: "after recurring expenses",
  },
];

export const allocations = [
  { name: "Housing", value: 35, amount: "$1.5K", color: "bg-ink" },
  { name: "Groceries", value: 18, amount: "$770", color: "bg-verdant" },
  { name: "Transport", value: 11, amount: "$470", color: "bg-brass" },
  { name: "Subscriptions", value: 9, amount: "$386", color: "bg-coral" },
  { name: "Shopping", value: 13, amount: "$557", color: "bg-steel" },
];

export const cashFlow = [
  { month: "Jan", actual: 3920, planned: 4300 },
  { month: "Feb", actual: 4080, planned: 4300 },
  { month: "Mar", actual: 4510, planned: 4400 },
  { month: "Apr", actual: 4275, planned: 4400 },
  { month: "May", actual: 4390, planned: 4500 },
  { month: "Jun", actual: 4286, planned: 4500 },
];

export const transactions: Transaction[] = [
  {
    id: "txn-rent",
    date: "2026-06-01",
    merchant: "Apartment rent",
    category: "Housing",
    account: "Checking",
    amount: 1500,
    signal: "Cleared",
    source: "Bank",
    recurring: true,
  },
  {
    id: "txn-groceries",
    date: "2026-06-04",
    merchant: "Whole Foods Market",
    category: "Groceries",
    account: "Credit card",
    amount: 186,
    signal: "Cleared",
    source: "Manual",
  },
  {
    id: "txn-uber",
    date: "2026-06-08",
    merchant: "Uber trip",
    category: "Transport",
    account: "Credit card",
    amount: 42,
    signal: "Watch",
    source: "Bank",
  },
  {
    id: "txn-netflix",
    date: "2026-06-12",
    merchant: "Netflix subscription",
    category: "Subscriptions",
    account: "Credit card",
    amount: 23,
    signal: "Review",
    source: "CSV",
    recurring: true,
  },
  {
    id: "txn-pharmacy",
    date: "2026-06-15",
    merchant: "CVS Pharmacy",
    category: "Health",
    account: "Debit card",
    amount: 64,
    signal: "Cleared",
    source: "Bank",
  },
];

export const budgets: Budget[] = [
  { category: "Housing", limit: 1650, account: "Checking" },
  { category: "Groceries", limit: 650, account: "Credit card" },
  { category: "Transport", limit: 350, account: "Credit card" },
  { category: "Subscriptions", limit: 120, account: "Credit card" },
  { category: "Shopping", limit: 450, account: "Credit card" },
  { category: "Health", limit: 250, account: "Debit card" },
];

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

export const assistantPrompts = [
  "How much did I spend this month?",
  "Find subscriptions I should review",
  "Create a 10 percent savings plan",
  "Which bills are coming up?",
];

export const tickerItems = [
  "Rent cleared on June 1",
  "Netflix is up for review",
  "Groceries are tracking close to budget",
  "Savings rate improved this month",
  "Transport spend is below plan",
  "Four bills due this week",
];
