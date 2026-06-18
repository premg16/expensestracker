export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  category: string;
  owner: string;
  amount: number;
  signal: "Watch" | "Approved" | "Review";
  source: "Manual" | "CSV" | "Bank";
  recurring?: boolean;
};

export type Budget = {
  category: string;
  limit: number;
  owner: string;
};

export type CategoryRule = {
  id: string;
  matcher: string;
  category: string;
  owner: string;
  signal: Transaction["signal"];
};

export const kpis = [
  {
    label: "Monthly burn",
    value: "$184.2K",
    change: "-8.4%",
    tone: "good",
    detail: "lower than board plan",
  },
  {
    label: "Runway",
    value: "21.7 mo",
    change: "+2.1 mo",
    tone: "good",
    detail: "after vendor actions",
  },
  {
    label: "Unreviewed spend",
    value: "$27.8K",
    change: "14 items",
    tone: "warn",
    detail: "needs owner decision",
  },
  {
    label: "Savings pipeline",
    value: "$1.42M",
    change: "12 levers",
    tone: "neutral",
    detail: "annualized options",
  },
];

export const allocations = [
  { name: "People", value: 42, amount: "$77.4K", color: "bg-ink" },
  { name: "Cloud", value: 21, amount: "$38.6K", color: "bg-verdant" },
  { name: "Sales", value: 17, amount: "$31.3K", color: "bg-brass" },
  { name: "Travel", value: 9, amount: "$16.6K", color: "bg-coral" },
  { name: "Other", value: 11, amount: "$20.3K", color: "bg-steel" },
];

export const cashFlow = [
  { month: "Jan", actual: 156, planned: 174 },
  { month: "Feb", actual: 171, planned: 180 },
  { month: "Mar", actual: 169, planned: 182 },
  { month: "Apr", actual: 188, planned: 186 },
  { month: "May", actual: 181, planned: 192 },
  { month: "Jun", actual: 164, planned: 190 },
];

export const transactions: Transaction[] = [
  {
    id: "txn-aws-credits",
    date: "2026-06-02",
    merchant: "AWS enterprise credits",
    category: "Cloud",
    owner: "Infra",
    amount: 18420,
    signal: "Approved",
    source: "Bank",
    recurring: true,
  },
  {
    id: "txn-retreat-deposit",
    date: "2026-06-04",
    merchant: "Founders retreat deposit",
    category: "Travel",
    owner: "CEO office",
    amount: 12400,
    signal: "Review",
    source: "Manual",
  },
  {
    id: "txn-sales-renewal",
    date: "2026-06-08",
    merchant: "Sales intelligence renewal",
    category: "Sales",
    owner: "Revenue",
    amount: 9600,
    signal: "Watch",
    source: "Bank",
    recurring: true,
  },
  {
    id: "txn-legal-retainer",
    date: "2026-06-12",
    merchant: "Legal counsel retainer",
    category: "Operations",
    owner: "Finance",
    amount: 7200,
    signal: "Approved",
    source: "CSV",
    recurring: true,
  },
  {
    id: "txn-design-seats",
    date: "2026-06-15",
    merchant: "Duplicate design seats",
    category: "Software",
    owner: "Product",
    amount: 2240,
    signal: "Review",
    source: "Bank",
    recurring: true,
  },
];

export const budgets: Budget[] = [
  { category: "Cloud", limit: 42000, owner: "Infra" },
  { category: "Travel", limit: 14000, owner: "CEO office" },
  { category: "Sales", limit: 26000, owner: "Revenue" },
  { category: "Software", limit: 18000, owner: "Product" },
  { category: "Operations", limit: 22000, owner: "Finance" },
];

export const categoryRules: CategoryRule[] = [
  {
    id: "rule-aws-cloud",
    matcher: "aws",
    category: "Cloud",
    owner: "Infra",
    signal: "Approved",
  },
  {
    id: "rule-sales-tools",
    matcher: "sales",
    category: "Sales",
    owner: "Revenue",
    signal: "Watch",
  },
  {
    id: "rule-seat-overlap",
    matcher: "duplicate",
    category: "Software",
    owner: "Product",
    signal: "Review",
  },
  {
    id: "rule-retreat-policy",
    matcher: "retreat",
    category: "Travel",
    owner: "CEO office",
    signal: "Review",
  },
];

export const assistantPrompts = [
  "What changed in burn this month?",
  "Find duplicate SaaS spend",
  "Create a 10 percent savings scenario",
  "Which expenses need approval today?",
];

export const tickerItems = [
  "Cloud variance -12.8%",
  "Travel deposits above policy",
  "Two vendor renewals due Friday",
  "Runway improves after seat cleanup",
  "Sales tools overlap detected",
  "June burn tracking below plan",
];
