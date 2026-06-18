"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import {
  Check,
  Download,
  FileUp,
  ListFilter,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import {
  budgets as seedBudgets,
  categoryRules,
  transactions as seedTransactions,
  type Budget,
  type Transaction,
} from "@/lib/finance-data";
import {
  budgetStatus,
  currency,
  makeTransaction,
  parseCsvTransactions,
  scenarioSummary,
} from "@/lib/finance-model";

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  merchant: "",
  category: "",
  owner: "",
  amount: "",
};

const sampleCsv = `date,merchant,amount,category,owner,signal,recurring
2026-06-17,Notion enterprise seats,4200,Software,Product,Watch,true
2026-06-18,AWS anomaly charge,6900,Cloud,Infra,Review,false`;

export function ExpenseWorkbench() {
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(seedBudgets);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [signal, setSignal] = useState("All");
  const [form, setForm] = useState(emptyForm);
  const [csv, setCsv] = useState(sampleCsv);
  const [reduction, setReduction] = useState(10);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set([...budgets.map((budget) => budget.category), ...transactions.map((item) => item.category)]))],
    [budgets, transactions],
  );

  const filteredTransactions = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesQuery =
        !needle ||
        [transaction.merchant, transaction.category, transaction.owner, transaction.source]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      const matchesCategory = category === "All" || transaction.category === category;
      const matchesSignal = signal === "All" || transaction.signal === signal;

      return matchesQuery && matchesCategory && matchesSignal;
    });
  }, [category, query, signal, transactions]);

  const statuses = useMemo(() => budgetStatus(transactions, budgets), [budgets, transactions]);
  const scenario = useMemo(() => scenarioSummary(transactions, reduction), [reduction, transactions]);
  const renewalExposure = transactions
    .filter((transaction) => transaction.recurring)
    .reduce((total, transaction) => total + transaction.amount, 0);
  const overlapSpend = transactions
    .filter(
      (transaction) =>
        transaction.category === "Software" &&
        /seat|duplicate|license|subscription/i.test(transaction.merchant),
    )
    .reduce((total, transaction) => total + transaction.amount, 0);
  const tightestBudget = [...statuses].sort((left, right) => right.ratio - left.ratio)[0];
  const reviewCount = transactions.filter((transaction) => transaction.signal === "Review").length;
  const monthlySpend = transactions.reduce((total, transaction) => total + transaction.amount, 0);

  function updateForm(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(form.amount);

    if (!form.merchant.trim() || Number.isNaN(amount) || amount <= 0) {
      return;
    }

    setTransactions((current) => [
      makeTransaction(
        {
          date: form.date,
          merchant: form.merchant,
          category: form.category,
          owner: form.owner,
          amount,
          source: "Manual",
        },
        categoryRules,
      ),
      ...current,
    ]);
    setForm(emptyForm);
  }

  function importCsv() {
    const imported = parseCsvTransactions(csv, categoryRules);

    if (imported.length === 0) {
      return;
    }

    setTransactions((current) => [...imported, ...current]);
  }

  function updateBudget(categoryName: string, value: string) {
    const limit = Number(value);

    if (Number.isNaN(limit) || limit < 0) {
      return;
    }

    setBudgets((current) =>
      current.map((budget) => (budget.category === categoryName ? { ...budget, limit } : budget)),
    );
  }

  function updateSignal(id: string, nextSignal: Transaction["signal"]) {
    setTransactions((current) =>
      current.map((transaction) => (transaction.id === id ? { ...transaction, signal: nextSignal } : transaction)),
    );
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    void file.text().then(setCsv);
  }

  return (
    <section className="min-w-0 space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <MetricTile label="Tracked monthly spend" value={currency(monthlySpend)} detail={`${transactions.length} items`} />
        <MetricTile label="Needs approval" value={String(reviewCount)} detail="review queue" tone="warn" />
        <MetricTile
          label="Scenario savings"
          value={currency(scenario.monthlySavings)}
          detail={`${reduction}% controllable spend cut`}
          tone="good"
        />
      </div>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <article className="min-w-0 border border-ink/15 bg-white/72">
          <div className="border-b border-ink/10 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-steel">Real expense core</p>
                <h2 className="mt-1 text-xl font-semibold">Search, filter, import, approve</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex h-10 cursor-pointer items-center gap-2 border border-ink/15 px-3 text-sm transition hover:bg-ink hover:text-paper">
                  <FileUp size={16} />
                  Upload CSV
                  <input type="file" accept=".csv,text/csv" className="sr-only" onChange={handleFile} />
                </label>
                <button
                  type="button"
                  onClick={() => setTransactions(seedTransactions)}
                  className="inline-flex h-10 items-center gap-2 border border-ink/15 px-3 text-sm transition hover:bg-ink hover:text-paper"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_160px]">
              <label className="flex h-11 items-center gap-2 border border-ink/15 bg-paper px-3">
                <Search size={16} className="text-steel" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search merchant, owner, source..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-steel/60"
                />
              </label>
              <Select value={category} onChange={setCategory} icon={<ListFilter size={16} />}>
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
              <Select value={signal} onChange={setSignal} icon={<SlidersHorizontal size={16} />}>
                {["All", "Review", "Watch", "Approved"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead className="bg-paper/80 text-left text-xs uppercase tracking-[0.18em] text-steel">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Merchant</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-right font-medium">Signal</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-ink/10 align-middle">
                    <td className="px-4 py-4 font-mono text-xs text-steel">{transaction.date}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{transaction.merchant}</p>
                      <p className="mt-1 text-xs text-steel">{transaction.source}</p>
                    </td>
                    <td className="px-4 py-4 text-steel">{transaction.category}</td>
                    <td className="px-4 py-4 text-steel">{transaction.owner}</td>
                    <td className="px-4 py-4 text-right font-mono">{currency(transaction.amount)}</td>
                    <td className="px-4 py-4 text-right">
                      <SignalBadge signal={transaction.signal} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => updateSignal(transaction.id, "Approved")}
                          className="grid h-8 w-8 place-items-center border border-verdant/25 text-verdant transition hover:bg-verdant hover:text-paper"
                          aria-label={`Approve ${transaction.merchant}`}
                        >
                          <Check size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSignal(transaction.id, "Review")}
                          className="grid h-8 w-8 place-items-center border border-coral/25 text-coral transition hover:bg-coral hover:text-paper"
                          aria-label={`Send ${transaction.merchant} to review`}
                        >
                          !
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="min-w-0 space-y-4">
          <article className="border border-ink/15 bg-white/72 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-steel">Manual entry</p>
            <h3 className="mt-1 text-lg font-semibold">Add a transaction</h3>
            <form onSubmit={addTransaction} className="mt-4 grid gap-2">
              <input
                type="date"
                value={form.date}
                onChange={(event) => updateForm("date", event.target.value)}
                className="h-11 border border-ink/15 bg-paper px-3 text-sm outline-none focus:border-brass"
              />
              <input
                value={form.merchant}
                onChange={(event) => updateForm("merchant", event.target.value)}
                placeholder="Merchant"
                className="h-11 border border-ink/15 bg-paper px-3 text-sm outline-none placeholder:text-steel/60 focus:border-brass"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={form.category}
                  onChange={(event) => updateForm("category", event.target.value)}
                  placeholder="Category"
                  className="h-11 min-w-0 border border-ink/15 bg-paper px-3 text-sm outline-none placeholder:text-steel/60 focus:border-brass"
                />
                <input
                  value={form.owner}
                  onChange={(event) => updateForm("owner", event.target.value)}
                  placeholder="Owner"
                  className="h-11 min-w-0 border border-ink/15 bg-paper px-3 text-sm outline-none placeholder:text-steel/60 focus:border-brass"
                />
              </div>
              <input
                value={form.amount}
                onChange={(event) => updateForm("amount", event.target.value)}
                inputMode="decimal"
                placeholder="Amount"
                className="h-11 border border-ink/15 bg-paper px-3 text-sm outline-none placeholder:text-steel/60 focus:border-brass"
              />
              <button
                type="submit"
                className="mt-1 inline-flex h-11 items-center justify-center gap-2 bg-ink px-3 text-sm text-paper transition hover:bg-charcoal"
              >
                <Plus size={16} />
                Add transaction
              </button>
            </form>
          </article>

          <article className="border border-ink/15 bg-white/72 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-steel">CSV import</p>
            <h3 className="mt-1 text-lg font-semibold">Paste bank export</h3>
            <textarea
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              className="mt-4 h-36 w-full resize-none border border-ink/15 bg-paper p-3 font-mono text-xs leading-5 outline-none focus:border-brass"
            />
            <button
              type="button"
              onClick={importCsv}
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 border border-ink/15 text-sm transition hover:bg-ink hover:text-paper"
            >
              <Upload size={16} />
              Import rows
            </button>
          </article>
        </div>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="min-w-0 border border-ink/15 bg-white/72 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-steel">Budget setup</p>
              <h2 className="mt-1 text-xl font-semibold">Monthly limits by owner</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-steel">
              Each budget updates the health status from live transactions and gives the assistant a clean planning
              layer later.
            </p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {statuses.map((budget) => (
              <div key={budget.category} className="border border-ink/10 bg-paper/70 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{budget.category}</p>
                    <p className="mt-1 text-xs text-steel">{budget.owner}</p>
                  </div>
                  <span
                    className={`border px-2 py-1 text-xs ${
                      budget.state === "Over"
                        ? "border-coral/25 bg-coral/10 text-coral"
                        : budget.state === "Tight"
                          ? "border-brass/25 bg-brass/10 text-brass"
                          : "border-verdant/20 bg-verdant/10 text-verdant"
                    }`}
                  >
                    {budget.state}
                  </span>
                </div>
                <div className="mt-4 h-2 bg-ink/8">
                  <div
                    className={`h-full ${budget.ratio >= 1 ? "bg-coral" : budget.ratio >= 0.82 ? "bg-brass" : "bg-verdant"}`}
                    style={{ width: `${Math.min(budget.ratio * 100, 100)}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="font-mono text-sm">{currency(budget.used)}</p>
                  <input
                    value={budget.limit}
                    onChange={(event) => updateBudget(budget.category, event.target.value)}
                    inputMode="decimal"
                    aria-label={`${budget.category} budget limit`}
                    className="h-9 w-28 border border-ink/15 bg-white px-2 text-right font-mono text-sm outline-none focus:border-brass"
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="min-w-0 border border-ink/15 bg-charcoal p-4 text-paper">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-paper/50">Scenario planning</p>
              <h2 className="mt-1 text-xl font-semibold">Runway lever</h2>
            </div>
            <Download className="text-brass" size={20} />
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm">
              <span>Reduction target</span>
              <span className="font-mono text-brass">{reduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={reduction}
              onChange={(event) => setReduction(Number(event.target.value))}
              className="mt-4 w-full accent-[#a9772b]"
            />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <DarkMetric label="Monthly" value={currency(scenario.monthlySavings)} />
            <DarkMetric label="Annual" value={currency(scenario.annualSavings)} />
          </div>
          <p className="mt-5 border-t border-paper/10 pt-4 text-sm leading-6 text-paper/70">
            This scenario targets controllable cloud, software, sales, travel, and operations spend. The next backend
            step is saving scenarios and exporting a board-ready narrative.
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <InsightCard
          label="Renewal forecast"
          value={currency(renewalExposure)}
          detail="recurring monthly exposure detected from imported and bank-like transactions"
        />
        <InsightCard
          label="Merchant overlap"
          value={currency(overlapSpend)}
          detail="software seat or duplicate subscription spend marked for cleanup"
        />
        <InsightCard
          label="Budget pressure"
          value={tightestBudget?.category ?? "None"}
          detail={
            tightestBudget
              ? `${Math.round(tightestBudget.ratio * 100)}% of ${currency(tightestBudget.limit)} used by ${tightestBudget.owner}`
              : "no budget pressure yet"
          }
        />
      </section>

      <section className="border border-ink/15 bg-white/72 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-steel">Category rules</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {categoryRules.map((rule) => (
            <div key={rule.id} className="border border-ink/10 bg-paper/70 p-3 text-sm">
              <p className="font-mono text-xs text-steel">contains {rule.matcher}</p>
              <p className="mt-2 font-medium">{rule.category}</p>
              <p className="mt-1 text-xs text-steel">
                {rule.owner} / {rule.signal}
              </p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function MetricTile({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "good" | "warn" | "neutral";
}) {
  return (
    <div className="border border-ink/15 bg-white/72 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-steel">{label}</p>
      <p
        className={`mt-4 font-mono text-2xl font-semibold ${
          tone === "good" ? "text-verdant" : tone === "warn" ? "text-coral" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-steel">{detail}</p>
    </div>
  );
}

function Select({
  value,
  onChange,
  icon,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex h-11 items-center gap-2 border border-ink/15 bg-paper px-3">
      <span className="text-steel">{icon}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
      >
        {children}
      </select>
    </label>
  );
}

function SignalBadge({ signal }: { signal: Transaction["signal"] }) {
  const classes = {
    Approved: "border-verdant/20 bg-verdant/10 text-verdant",
    Watch: "border-brass/25 bg-brass/10 text-brass",
    Review: "border-coral/25 bg-coral/10 text-coral",
  };

  return (
    <span className={`inline-flex min-w-20 justify-center border px-2 py-1 text-xs ${classes[signal]}`}>
      {signal}
    </span>
  );
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-paper/10 bg-paper/8 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-paper/45">{label}</p>
      <p className="mt-3 font-mono text-xl text-paper">{value}</p>
    </div>
  );
}

function InsightCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="border border-ink/15 bg-white/72 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-steel">{label}</p>
      <p className="mt-4 font-mono text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-steel">{detail}</p>
    </article>
  );
}
