"use client";

import { addTransaction, deleteBudget, deleteTransaction, importCsv, upsertBudget } from "@/app/app/actions";
import { categoryRules } from "@/lib/finance-data";
import { parseCsvTransactions } from "@/lib/finance-model";
import { FileUp, LoaderCircle, Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState, useTransition, type FormEvent } from "react";

const MAX_CSV_ROWS = 2000;
const fieldClass =
  "h-11 w-full min-w-0 rounded-[1.1rem] border border-ink/10 bg-white/80 px-4 text-sm font-bold text-ink outline-none transition placeholder:font-semibold placeholder:text-ink/34 focus:border-ink disabled:opacity-60";
const labelClass = "grid gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-ink/42";

// Scroll a form card into view and focus its first field (used by header buttons and empty states).
export function focusSection(id: string) {
  const section = document.getElementById(id);
  section?.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => section?.querySelector<HTMLElement>("input, textarea")?.focus({ preventScroll: true }), 350);
}

function FormMessage({ error, notice }: { error: string | null; notice: string | null }) {
  if (error) {
    return (
      <p role="alert" className="animate-in rounded-[1rem] bg-[#ff9a76]/45 px-3 py-2 text-xs font-bold">
        {error}
      </p>
    );
  }

  return notice ? (
    <p role="status" className="animate-in rounded-[1rem] bg-mint px-3 py-2 text-xs font-bold">
      {notice}
    </p>
  ) : null;
}

export function AddTransactionForm({ today, categories, accounts }: { today: string; categories: string[]; accounts: string[] }) {
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState<string | null>(null);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    start(async () => {
      const result = await addTransaction({
        date: date ?? today,
        merchant,
        amount: Number(amount.replace(/[$,]/g, "")),
        category,
        account,
        kind,
        recurring,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMerchant("");
      setAmount("");
      setCategory("");
      setRecurring(false);
      setNotice(`${kind === "income" ? "Income" : "Expense"} added.`);
    });
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-ink/6 p-1" role="group" aria-label="Transaction type">
        {(["expense", "income"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setKind(option)}
            aria-pressed={kind === option}
            className={`h-9 rounded-full text-xs font-black capitalize transition ${kind === option ? "bg-ink text-white shadow-sm" : "text-ink/56 hover:text-ink"}`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className={labelClass}>
          Date
          <input type="date" value={date ?? today} onChange={(event) => setDate(event.target.value)} required className={fieldClass} />
        </label>
        <label className={labelClass}>
          Amount
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            required
            className={`${fieldClass} font-mono`}
          />
        </label>
      </div>

      <label className={labelClass}>
        {kind === "income" ? "Source" : "Merchant"}
        <input
          value={merchant}
          onChange={(event) => setMerchant(event.target.value)}
          maxLength={100}
          placeholder={kind === "income" ? "Paycheck" : "Trader Joe's"}
          required
          className={fieldClass}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className={labelClass}>
          Category
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            list="float-categories"
            maxLength={100}
            placeholder="Auto"
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Account
          <input
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            list="float-accounts"
            maxLength={100}
            placeholder="Checking"
            className={fieldClass}
          />
        </label>
      </div>
      <datalist id="float-categories">
        {categories.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      <datalist id="float-accounts">
        {accounts.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      <label className="flex items-center gap-2 text-xs font-bold text-ink/62">
        <input type="checkbox" checked={recurring} onChange={(event) => setRecurring(event.target.checked)} className="h-4 w-4 accent-ink" />
        Repeats every month
      </label>

      <button type="submit" disabled={pending} className="black-button haptic inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-black disabled:opacity-60">
        {pending ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}
        Add {kind}
      </button>
      <FormMessage error={error} notice={notice} />
    </form>
  );
}

export function CsvImport() {
  const [csv, setCsv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const lines = csv.split(/\r?\n/).filter((line) => line.trim()).length;
  const ready = csv.trim() ? parseCsvTransactions(csv, categoryRules).length : 0;
  const skipped = Math.max(0, lines - 1 - ready);
  const tooMany = ready > MAX_CSV_ROWS;

  async function readFile(file: File | undefined) {
    if (!file) return;
    setNotice(null);

    if (file.size > 1_000_000) {
      setError("That file is over 1 MB. Split it into smaller imports.");
      return;
    }

    setError(null);
    setCsv(await file.text());
  }

  function submit() {
    setError(null);
    setNotice(null);

    start(async () => {
      const result = await importCsv(csv);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setCsv("");
      if (fileRef.current) fileRef.current.value = "";
      setNotice(`Imported ${result.count} ${result.count === 1 ? "row" : "rows"}${result.skipped ? `, skipped ${result.skipped}` : ""}.`);
    });
  }

  return (
    <div className="mt-4 grid gap-3">
      <p className="rounded-[1rem] bg-white/70 px-3 py-2 font-mono text-[11px] font-bold leading-5 text-ink/62">
        date,merchant,amount,category,account
        <span className="block font-sans text-[11px] font-semibold text-ink/46">Positive amounts are money out, negative amounts are money in.</span>
      </p>

      <label className="haptic inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 text-sm font-black text-ink/70 transition hover:border-ink hover:text-ink">
        <FileUp size={16} />
        Upload a .csv file
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => void readFile(event.target.files?.[0])} />
      </label>

      <label className={labelClass}>
        Or paste rows
        <textarea
          value={csv}
          onChange={(event) => {
            setCsv(event.target.value);
            setNotice(null);
          }}
          rows={5}
          placeholder={"2026-06-17,Spotify,11,Subscriptions,Credit card"}
          className="w-full resize-none rounded-[1.1rem] border border-ink/10 bg-white/80 p-3 font-mono text-xs font-semibold normal-case leading-5 tracking-normal text-ink outline-none placeholder:text-ink/30 focus:border-ink"
        />
      </label>

      {csv.trim() && (
        <p className="text-xs font-bold text-ink/56" aria-live="polite">
          {ready} {ready === 1 ? "row" : "rows"} ready{skipped > 0 ? `, ${skipped} will be skipped` : ""}
          {tooMany ? `. Imports are capped at ${MAX_CSV_ROWS.toLocaleString()} rows.` : "."}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={pending || ready === 0 || tooMany}
        className="black-button haptic inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-black disabled:opacity-50"
      >
        {pending ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
        Import {ready > 0 ? `${ready} ${ready === 1 ? "row" : "rows"}` : "CSV"}
      </button>
      <FormMessage error={error} notice={notice} />
    </div>
  );
}

export function BudgetForm({
  category,
  limit,
  onCategory,
  onLimit,
  categories,
}: {
  category: string;
  limit: string;
  onCategory: (value: string) => void;
  onLimit: (value: string) => void;
  categories: string[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    start(async () => {
      const result = await upsertBudget({ category, limit: Number(limit.replace(/[$,]/g, "")) });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setNotice(`${category.trim()} budget saved.`);
      onCategory("");
      onLimit("");
    });
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3">
      <label className={labelClass}>
        Category
        <input
          value={category}
          onChange={(event) => onCategory(event.target.value)}
          list="float-budget-categories"
          maxLength={100}
          placeholder="Groceries"
          required
          className={fieldClass}
        />
      </label>
      <datalist id="float-budget-categories">
        {categories.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      <label className={labelClass}>
        Monthly limit
        <input
          value={limit}
          onChange={(event) => onLimit(event.target.value)}
          inputMode="decimal"
          placeholder="500"
          required
          className={`${fieldClass} font-mono`}
        />
      </label>
      <button type="submit" disabled={pending} className="black-button haptic inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-black disabled:opacity-60">
        {pending ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}
        Save budget
      </button>
      <p className="text-xs font-semibold text-ink/46">Saving an existing category updates its limit.</p>
      <FormMessage error={error} notice={notice} />
    </form>
  );
}

// Two-step delete (first click arms it) so a stray tap cannot remove data.
export function DeleteButton({ id, label, kind }: { id: string; label: string; kind: "transaction" | "budget" }) {
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState(false);
  const [pending, start] = useTransition();

  function onClick() {
    if (!armed) {
      setArmed(true);
      window.setTimeout(() => setArmed(false), 3000);
      return;
    }

    start(async () => {
      const result = await (kind === "transaction" ? deleteTransaction(id) : deleteBudget(id));
      if (!result.ok) {
        setError(true);
        setArmed(false);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={armed ? `Confirm delete ${label}` : `Delete ${label}`}
      title={error ? "Could not delete. Try again." : armed ? "Click again to delete" : "Delete"}
      className={`grid h-9 shrink-0 place-items-center rounded-full text-xs font-black transition active:scale-95 disabled:opacity-50 ${
        armed ? "w-auto bg-[#ee5f56] px-3 text-white" : error ? "w-9 bg-[#ff9a76]/50 text-ink" : "w-9 text-ink/36 hover:bg-ink/8 hover:text-ink"
      }`}
    >
      {pending ? <LoaderCircle size={15} className="animate-spin" /> : armed ? "Delete?" : <Trash2 size={15} />}
    </button>
  );
}
