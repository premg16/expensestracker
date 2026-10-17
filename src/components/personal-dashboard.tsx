"use client";

import { AddTransactionForm, BudgetForm, CsvImport, DeleteButton, focusSection } from "@/components/entry-forms";
import { FloatingFinanceCompanion } from "@/components/floating-finance-companion";
import { HapticLink } from "@/components/haptic-link";
import type { Budget, Transaction } from "@/lib/finance-data";
import {
  accountSummaries,
  budgetStatus,
  buildActionQueue,
  categorySpend,
  currency,
  isoDate,
  latestRecurring,
  monthSnapshot,
  floorCents,
  safeToSpend,
  type ActionItem,
  type BudgetLine,
} from "@/lib/finance-model";
import { appNav } from "@/lib/float-data";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  Bell,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  Landmark,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PiggyBank,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  Target,
  TrendingDown,
  WalletCards,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

type AppView = "overview" | "activity" | "budgets" | "cards";
type DashboardLoadPhase = "loading" | "revealing" | "ready";

type DashboardCopy = {
  eyebrow: string;
  title: string;
  body: string;
  primaryAction: string;
  // Either links to another page or scrolls to a form on this one.
  href?: string;
  section?: string;
};

const viewCopy: Record<AppView, DashboardCopy> = {
  overview: {
    eyebrow: "Daily command",
    title: "Know what is safe to spend.",
    body: "Income, spending, budgets, and review items in one scan.",
    primaryAction: "Add expense",
    href: "/app/activity#add-transaction",
  },
  activity: {
    eyebrow: "Activity ledger",
    title: "Review transactions without digging.",
    body: "Search, filter, add, and import the money that moves.",
    primaryAction: "Import CSV",
    section: "import-csv",
  },
  budgets: {
    eyebrow: "Budget control",
    title: "See pressure before it becomes a miss.",
    body: "Category limits, risks, and what is left for the month.",
    primaryAction: "Set a budget",
    section: "budget-form",
  },
  cards: {
    eyebrow: "Accounts and renewals",
    title: "See where money leaves, and what repeats.",
    body: "Spending by account and the recurring charges you track.",
    primaryAction: "Add transaction",
    href: "/app/activity#add-transaction",
  },
};

const activityFilters = ["All", "Review", "Recurring", "Income"] as const;
const PAGE_SIZE = 100;

const cursorCardProps = { "data-cursor-card": "true" } as const;

function isActiveView(view: AppView, href: string) {
  return (
    (view === "overview" && href === "/app") ||
    (view === "activity" && href.includes("activity")) ||
    (view === "budgets" && href.includes("budgets")) ||
    (view === "cards" && href.includes("cards"))
  );
}

function useCursorReactiveCards(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduceMotion.matches || !canHover.matches) {
      return;
    }

    let activeCard: HTMLElement | null = null;
    let frame = 0;

    const resetCard = (card: HTMLElement) => {
      card.dataset.cursorActive = "false";
      card.style.setProperty("--cursor-x", "50%");
      card.style.setProperty("--cursor-y", "50%");
    };

    const updateCard = (event: PointerEvent) => {
      const target = event.target instanceof Element ? (event.target.closest("[data-cursor-card='true']") as HTMLElement | null) : null;

      if (!target || !root.contains(target)) {
        if (activeCard) {
          resetCard(activeCard);
          activeCard = null;
        }
        return;
      }

      if (activeCard && activeCard !== target) {
        resetCard(activeCard);
      }

      activeCard = target;
      const rect = target.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

      target.dataset.cursorActive = "true";
      target.style.setProperty("--cursor-x", `${x * 100}%`);
      target.style.setProperty("--cursor-y", `${y * 100}%`);
    };

    const onPointerMove = (event: PointerEvent) => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => updateCard(event));
    };

    const onPointerLeave = () => {
      window.cancelAnimationFrame(frame);
      if (activeCard) {
        resetCard(activeCard);
        activeCard = null;
      }
    };

    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [rootRef]);
}

type DashboardModel = ReturnType<typeof deriveModel>;

function deriveModel(transactions: Transaction[], budgets: Budget[], today: string) {
  const snapshot = monthSnapshot(transactions, today);
  const lines = budgetStatus(snapshot.inMonth, budgets);
  const safe = safeToSpend(snapshot, lines);
  const weekStart = shiftDays(today, -6);
  const budgetLimit = lines.reduce((total, line) => total + line.limit, 0);
  const budgetUsed = lines.reduce((total, line) => total + line.used, 0);

  return {
    transactions,
    budgets,
    today,
    snapshot,
    lines,
    safe,
    actions: buildActionQueue(lines, transactions, snapshot.daysLeft),
    weekSpend: transactions
      .filter((item) => item.kind === "expense" && item.date >= weekStart && item.date <= today)
      .reduce((total, item) => total + item.amount, 0),
    usedPercent:
      lines.length > 0
        ? Math.round((budgetUsed / Math.max(budgetLimit, 1)) * 100)
        : snapshot.income > 0
          ? Math.round((snapshot.spend / snapshot.income) * 100)
          : 0,
    categories: [...new Set([...budgets.map((item) => item.category), ...transactions.map((item) => item.category)])].sort(),
    accounts: [...new Set(transactions.map((item) => item.account))].sort(),
  };
}

function shiftDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDay(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

const noopSubscribe = () => () => {};

// Server renders the UTC date; the browser swaps in the user's local date without a hydration mismatch.
function useToday(serverToday: string) {
  return useSyncExternalStore(noopSubscribe, () => isoDate(new Date()), () => serverToday);
}

export function PersonalDashboard({
  view = "overview",
  transactions,
  budgets,
  today: serverToday,
}: {
  view?: AppView;
  transactions: Transaction[];
  budgets: Budget[];
  today: string;
}) {
  const copy = viewCopy[view];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dashboardRef = useRef<HTMLElement | null>(null);
  const today = useToday(serverToday);
  const model = deriveModel(transactions, budgets, today);

  useCursorReactiveCards(dashboardRef);

  return (
    <main ref={dashboardRef} className="relative h-dvh overflow-hidden text-ink">
      <DashboardRhythmBackground />
      <div className="relative z-10 h-full p-3 sm:p-4 lg:p-5">
        <div
          className={`grid h-full gap-3 transition-[grid-template-columns] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${sidebarOpen ? "lg:grid-cols-[248px_minmax(0,1fr)]" : "lg:grid-cols-[82px_minmax(0,1fr)]"
            }`}
        >
          <AppSidebar view={view} collapsed={!sidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} />

          <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
            <AppHeader copy={copy} transactions={transactions} />

            <div className="relative min-h-0 flex-1 overflow-y-auto">
              <div className="relative min-h-full">
                <DashboardContentStage key={view} view={view} model={model} />
              </div>
            </div>
          </section>
        </div>
      </div>

      <MobileNav view={view} />
      <FloatingFinanceCompanion view={view} />
    </main>
  );
}

function DashboardRhythmBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_12%_8%,rgba(255,255,255,0.72),transparent_28rem),radial-gradient(circle_at_88%_18%,rgba(135,220,251,0.42),transparent_32rem),radial-gradient(circle_at_46%_92%,rgba(255,207,110,0.20),transparent_26rem)]"
      aria-hidden="true"
    />
  );
}

function DashboardContentStage({ view, model }: { view: AppView; model: DashboardModel }) {
  const [phase, setPhase] = useState<DashboardLoadPhase>("loading");
  const contentVisible = phase !== "loading";

  useEffect(() => {
    const revealTimer = window.setTimeout(() => setPhase("revealing"), 820);
    const readyTimer = window.setTimeout(() => setPhase("ready"), 1180);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(readyTimer);
    };
  }, []);

  return (
    <div className="relative min-h-full" aria-busy={phase !== "ready"}>
      <div
        className={`dashboard-view-stage mx-auto w-full max-w-[1440px] p-3 pb-24 transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(.16,1,.3,1)] sm:p-5 lg:pb-6 ${contentVisible ? "translate-y-0 scale-100 opacity-100 blur-0" : "translate-y-3 scale-[0.992] opacity-0 blur-sm"
          } ${phase === "revealing" ? "dashboard-page-transition" : ""}`}
      >
        {view === "overview" && <OverviewView model={model} />}
        {view === "activity" && <ActivityView model={model} />}
        {view === "budgets" && <BudgetsView model={model} />}
        {view === "cards" && <AccountsView model={model} />}
      </div>

      {phase !== "ready" && <DashboardLoadingStage phase={phase} view={view} />}
    </div>
  );
}

function AppSidebar({
  view,
  collapsed,
  onToggle,
}: {
  view: AppView;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={`relative hidden h-full min-h-0 flex-col overflow-hidden rounded-4xl border border-white/70 bg-white/72 p-3 text-ink shadow-[0_28px_90px_rgba(23,23,23,0.12)] backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] lg:flex ${collapsed ? "items-center" : "items-stretch"
        }`}
    >
      <div className={`border-b border-ink/8 pb-4 ${collapsed ? "grid place-items-center" : "flex items-center gap-3"}`}>
        <div className={`min-w-0 ${collapsed ? "grid place-items-center" : "flex items-center gap-3"}`}>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
            <WalletCards size={19} />
          </span>
          {!collapsed && (
            <div className="min-w-0 animate-in">
              <p className="font-display display-kern text-xl font-black leading-none">Float</p>
              <p className="mt-1 text-xs font-semibold text-ink/48">Personal money desk</p>
            </div>
          )}
        </div>
      </div>

      <nav className={collapsed ? "mt-5 flex w-full flex-col items-center gap-3" : "mt-5 space-y-1"}>
        {appNav.map((item) => {
          const active = isActiveView(view, item.href);

          return (
            <HapticLink
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={
                collapsed
                  ? `grid h-12 w-12 place-items-center rounded-full text-sm font-bold transition duration-300 hover:-translate-y-0.5 active:scale-95 ${active ? "bg-ink text-white shadow-[0_12px_30px_rgba(23,23,23,0.18)]" : "text-ink/45 hover:bg-white/76 hover:text-ink"
                  }`
                  : `group flex h-11 items-center gap-3 rounded-full px-3 text-sm font-bold transition duration-300 hover:translate-x-1 active:scale-[0.98] ${active ? "bg-ink text-white shadow-sm" : "text-ink/55 hover:bg-white/76 hover:text-ink"
                  }`
              }
            >
              <item.icon size={17} className="shrink-0 transition duration-300 group-hover:rotate-[-6deg]" />
              {!collapsed && <span className="flex-1 overflow-hidden whitespace-nowrap transition duration-300 group-hover:translate-x-0.5">{item.label}</span>}
              {active && !collapsed && <span className="h-2 w-2 rounded-full bg-[#f9d85f]" />}
            </HapticLink>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-ink/8 pt-4">
        <SidebarUser collapsed={collapsed} />
        <button
          type="button"
          onClick={onToggle}
          className={`haptic grid h-11 shrink-0 place-items-center rounded-full border border-ink/10 bg-white/72 text-sm font-black text-ink/62 shadow-sm transition duration-300 hover:bg-ink hover:text-white active:scale-95 ${collapsed ? "mx-auto w-11" : "w-full grid-cols-[auto_1fr] gap-2 px-4"
            }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && <span className="text-left">Collapse menu</span>}
        </button>
      </div>
    </aside>
  );
}

function SidebarUser({ collapsed }: { collapsed: boolean }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const name = user?.firstName ?? (email ? email.split("@")[0] : "Your account");

  return (
    <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "gap-3"}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ff9a76] text-sm font-black uppercase text-ink">
        {name[0] ?? "F"}
      </span>
      {!collapsed && (
        <div className="min-w-0 flex-1 animate-in">
          <p className="truncate text-sm font-black leading-none">{name}</p>
          <p className="mt-1 truncate text-xs text-ink/42">{email || "Signed in"}</p>
        </div>
      )}
      <button
        type="button"
        onClick={() => void signOut({ redirectUrl: "/" })}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/10 bg-white/62 text-ink/50 transition hover:bg-ink hover:text-white active:scale-95"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}

function AppHeader({ copy, transactions }: { copy: DashboardCopy; transactions: Transaction[] }) {
  const { signOut } = useClerk();
  const buttonClass = "black-button haptic inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-black";
  const label = (
    <>
      <Plus size={16} />
      <span className="hidden sm:inline">{copy.primaryAction}</span>
      <span className="sm:hidden">Add</span>
    </>
  );

  return (
    <header className="sticky top-0 z-20 p-3 sm:p-4">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 rounded-[1.75rem] border border-white/70 bg-white/82 px-3 py-3 shadow-[0_18px_60px_rgba(23,23,23,0.10)] backdrop-blur-2xl sm:px-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/42">{copy.eyebrow}</p>
          <h1 className="font-display display-kern mt-1 text-2xl font-black leading-tight tracking-normal sm:text-3xl">{copy.title}</h1>
          <p className="mt-1 hidden max-w-2xl text-sm font-medium leading-5 text-ink/52 md:block">{copy.body}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => exportCsv(transactions)}
            disabled={transactions.length === 0}
            className="hidden h-10 items-center gap-2 rounded-full border border-ink/10 bg-white/72 px-4 text-sm font-bold text-ink/70 shadow-sm transition hover:border-ink hover:text-ink disabled:opacity-40 sm:inline-flex"
          >
            <Download size={16} />
            Export
          </button>
          {copy.href ? (
            <HapticLink href={copy.href} className={buttonClass}>
              {label}
            </HapticLink>
          ) : (
            <button type="button" onClick={() => focusSection(copy.section ?? "")} className={buttonClass}>
              {label}
            </button>
          )}
          <button
            type="button"
            onClick={() => void signOut({ redirectUrl: "/" })}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white/72 text-ink/58 shadow-sm transition hover:border-ink hover:text-ink lg:hidden"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

function exportCsv(transactions: Transaction[]) {
  const cell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  // Prefix user-typed text so spreadsheets don't run it as a formula; amount keeps its leading "-".
  const text = (value: string) => cell(/^[=+\-@\t\r]/.test(value) ? `'${value}` : value);
  const rows = transactions.map((item) =>
    [
      cell(item.date),
      text(item.merchant),
      cell(String(item.kind === "income" ? -item.amount : item.amount)),
      text(item.category),
      text(item.account),
      cell(item.signal),
      cell(String(item.recurring === true)),
    ].join(","),
  );
  const blob = new Blob([["date,merchant,amount,category,account,signal,recurring", ...rows].join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "float-transactions.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function MobileNav({ view }: { view: AppView }) {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-[1.35rem] border border-white/70 bg-white/88 p-1.5 text-ink shadow-[0_18px_60px_rgba(23,23,23,0.18)] backdrop-blur-2xl lg:hidden">
      {appNav.map((item) => {
        const active = isActiveView(view, item.href);
        return (
          <HapticLink
            key={item.href}
            href={item.href}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-black transition ${active ? "bg-ink text-white" : "text-ink/52"
              }`}
          >
            <item.icon size={17} />
            <span className="truncate">{item.label}</span>
          </HapticLink>
        );
      })}
    </nav>
  );
}

function DashboardLoadingStage({ phase, view }: { phase: DashboardLoadPhase; view: AppView }) {
  return (
    <div
      aria-hidden="true"
      data-phase={phase}
      data-view={view}
      className="dashboard-loader-stage dashboard-loader-shimmer pointer-events-none absolute inset-0 z-20 mx-auto w-full max-w-[1440px] p-3 pb-24 sm:p-5 lg:pb-6"
    >
      {view === "overview" && <OverviewLoadingLayout />}
      {view === "activity" && <ActivityLoadingLayout />}
      {view === "budgets" && <BudgetsLoadingLayout />}
      {view === "cards" && <CardsLoadingLayout />}
    </div>
  );
}

function OverviewLoadingLayout() {
  return (
    <div className="grid content-start gap-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="dashboard-loader-step card-black rounded-[2.35rem] p-5">
          <div className="dashboard-loader-meter h-1 rounded-full bg-[linear-gradient(90deg,#87dcfb,#c8e9ca,#ffcf6e,#ff9a76)]" />
          <div className="mt-7 flex gap-2">
            <div className="h-7 w-20 rounded-full bg-white/12" />
            <div className="h-7 w-32 rounded-full bg-mint/80" />
          </div>
          <div className="mt-10 h-4 w-36 rounded-full bg-white/16" />
          <div className="mt-4 h-20 w-56 rounded-[1.25rem] bg-white/12" />
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <DarkLoaderTile key={item} />
            ))}
          </div>
        </div>

        <div className="dashboard-loader-step rounded-[2.35rem] bg-[#ffcf6e] p-5 shadow-[0_24px_80px_rgba(23,23,23,0.12)]">
          <div className="h-3 w-24 rounded-full bg-ink/14" />
          <div className="mt-5 h-12 w-56 rounded-2xl bg-ink/10" />
          <div className="mt-4 h-4 w-64 max-w-full rounded-full bg-ink/10" />
          <div className="mt-7 grid grid-cols-2 gap-2">
            <div className="h-20 rounded-[1.25rem] bg-white/55" />
            <div className="h-20 rounded-[1.25rem] bg-white/55" />
          </div>
          <div className="mt-4 h-11 rounded-full bg-ink" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          ["#ff9a76", "13rem"],
          ["#87dcfb", "10rem"],
          ["#c8e9ca", "12rem"],
        ].map(([color, width], index) => (
          <ColorLoaderCard key={color} color={color} width={width} delay={120 + index * 70} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <WhiteLoaderPanel rows={2} />
        <WhiteLoaderPanel rows={4} />
      </div>
    </div>
  );
}

function ActivityLoadingLayout() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="dashboard-loader-step overflow-hidden rounded-4xl border border-white/75 bg-white/72 shadow-[0_24px_80px_rgba(23,23,23,0.10)]">
        <div className="flex flex-col gap-3 border-b border-ink/8 p-4 md:flex-row md:items-center md:justify-between">
          <div className="h-8 w-44 rounded-[0.9rem] bg-ink/10" />
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className={`h-9 rounded-full ${item === 0 ? "w-14 bg-ink" : "w-20 border border-white/75 bg-white/66"}`} />
            ))}
          </div>
        </div>
        <div className="hidden grid-cols-[minmax(0,1.4fr)_110px_92px] border-b border-ink/8 bg-white/50 px-4 py-3 sm:grid">
          <div className="h-3 w-20 rounded-full bg-ink/10" />
          <div className="h-3 w-16 rounded-full bg-ink/10" />
          <div className="ml-auto h-3 w-16 rounded-full bg-ink/10" />
        </div>
        <div className="divide-y divide-ink/8">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <TransactionLoaderRow key={item} index={item} />
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="dashboard-loader-step card-black rounded-4xl p-4 text-white shadow-[0_34px_100px_rgba(23,23,23,0.20)]">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-full bg-sky" />
            <div className="h-7 w-24 rounded-full bg-white/10" />
          </div>
          <div className="mt-8 h-16 rounded-[1.25rem] bg-white/12" />
          <div className="mt-4 h-4 w-full rounded-full bg-white/10" />
          <div className="mt-2 h-4 w-3/4 rounded-full bg-white/10" />
        </section>
        <WhiteLoaderPanel rows={4} />
      </aside>
    </div>
  );
}

function BudgetsLoadingLayout() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="dashboard-loader-step rounded-4xl border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)]">
        <div className="flex flex-col gap-3 border-b border-ink/8 pb-4 md:flex-row md:items-end md:justify-between">
          <div className="h-8 w-72 max-w-full rounded-[0.9rem] bg-ink/10" />
          <div className="h-10 w-44 rounded-full border border-white/80 bg-white/70" />
        </div>
        <div className="mt-4 grid gap-3">
          {[0, 1, 2, 3, 4].map((item) => (
            <BudgetLoaderRow key={item} index={item} />
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="dashboard-loader-step rounded-4xl bg-[#ffcf6e] p-5 shadow-[0_24px_80px_rgba(23,23,23,0.12)]">
          <div className="h-16 rounded-[1.25rem] bg-ink/10" />
          <div className="mt-4 h-4 w-full rounded-full bg-ink/10" />
          <div className="mt-2 h-4 w-4/5 rounded-full bg-ink/10" />
          <div className="mt-5 h-10 rounded-full bg-ink" />
        </section>
        <WhiteLoaderPanel rows={3} />
      </aside>
    </div>
  );
}

function CardsLoadingLayout() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <section className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <MetricLoaderPanel key={item} index={item} />
          ))}
        </section>

        <section className="dashboard-loader-step overflow-hidden rounded-4xl border border-white/75 bg-white/72 shadow-[0_24px_80px_rgba(23,23,23,0.10)]">
          <div className="flex flex-col gap-3 border-b border-ink/8 p-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="h-8 w-64 max-w-full rounded-[0.9rem] bg-ink/10" />
            <div className="h-10 w-36 rounded-full border border-white/80 bg-white/70" />
          </div>
          <div className="divide-y divide-ink/8">
            {[0, 1, 2].map((item) => (
              <CardLoaderRow key={item} index={item} />
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <WhiteLoaderPanel rows={4} />
        <section className="dashboard-loader-step card-black rounded-4xl p-5 text-white shadow-[0_34px_100px_rgba(23,23,23,0.20)]">
          <div className="h-12 w-24 rounded-2xl bg-white/12" />
          <div className="mt-3 h-4 w-52 rounded-full bg-white/10" />
          <div className="mt-5 h-2 rounded-full bg-white/12">
            <div className="dashboard-loader-meter h-full w-[22%] rounded-full bg-[#8fd6a1]" />
          </div>
          <div className="mt-5 h-4 w-full rounded-full bg-white/10" />
          <div className="mt-2 h-4 w-4/5 rounded-full bg-white/10" />
        </section>
      </aside>
    </div>
  );
}

function DarkLoaderTile() {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/9 p-3">
      <div className="h-9 w-9 rounded-full bg-white/18" />
      <div className="mt-5 h-3 w-20 rounded-full bg-white/14" />
      <div className="mt-3 h-5 w-16 rounded-full bg-white/16" />
    </div>
  );
}

function ColorLoaderCard({ color, width, delay }: { color: string; width: string; delay: number }) {
  return (
    <div className="dashboard-loader-step rounded-4xl p-4 shadow-[0_24px_70px_rgba(23,23,23,0.10)]" style={{ backgroundColor: color, animationDelay: `${delay}ms` }}>
      <div className="h-11 w-11 rounded-full bg-white/50" />
      <div className="mt-8 h-5 w-44 rounded-full bg-ink/12" />
      <div className="mt-3 h-4 rounded-full bg-ink/10" style={{ width }} />
    </div>
  );
}

function WhiteLoaderPanel({ rows }: { rows: number }) {
  return (
    <section className="dashboard-loader-step rounded-4xl border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)]">
      <div className="flex items-center justify-between gap-3">
        <div className="h-8 w-44 rounded-[0.9rem] bg-ink/10" />
        <div className="h-8 w-8 rounded-full bg-ink/8" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-[1.25rem] border border-ink/6 bg-white/70 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-full ${index % 3 === 0 ? "bg-sky" : index % 3 === 1 ? "bg-[#ffcf6e]" : "bg-mint"}`} />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-2/3 rounded-full bg-ink/10" />
                <div className="mt-2 h-3 w-1/2 rounded-full bg-ink/8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TransactionLoaderRow({ index }: { index: number }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-3 p-4 sm:grid-cols-[auto_minmax(0,1.4fr)_110px_92px] sm:items-center">
      <div className={`h-10 w-10 rounded-full ${index % 3 === 0 ? "bg-sky" : index % 3 === 1 ? "bg-[#ffcf6e]" : "bg-mint"}`} />
      <div className="min-w-0">
        <div className="h-4 w-40 rounded-full bg-ink/10" />
        <div className="mt-2 h-3 w-28 rounded-full bg-ink/8" />
      </div>
      <div className="hidden h-8 w-20 rounded-full bg-white/70 sm:block" />
      <div className="h-5 w-16 rounded-full bg-ink/10" />
    </div>
  );
}

function BudgetLoaderRow({ index }: { index: number }) {
  const widths = ["82%", "79%", "66%", "54%", "42%"];
  return (
    <div className="rounded-[1.35rem] border border-ink/6 bg-white/70 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-5 w-44 rounded-full bg-ink/10" />
          <div className="mt-2 h-3 w-64 max-w-full rounded-full bg-ink/8" />
        </div>
        <div className="h-9 w-20 rounded-full bg-ink/10" />
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-ink/8">
        <div className="dashboard-loader-meter h-full rounded-full bg-[linear-gradient(90deg,#87dcfb,#ffcf6e,#ff9a76)]" style={{ width: widths[index] }} />
      </div>
    </div>
  );
}

function MetricLoaderPanel({ index }: { index: number }) {
  const tones = ["bg-mint", "bg-sky", "bg-[#ff9a76]"];
  return (
    <article className="dashboard-loader-step rounded-4xl border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-3 w-24 rounded-full bg-ink/10" />
          <div className="mt-4 h-10 w-24 rounded-[0.9rem] bg-ink/10" />
          <div className="mt-3 h-4 w-32 rounded-full bg-ink/8" />
        </div>
        <div className={`h-10 w-10 rounded-full ${tones[index % tones.length]}`} />
      </div>
    </article>
  );
}

function CardLoaderRow({ index }: { index: number }) {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_170px_130px] md:items-center">
      <div>
        <div className="h-5 w-44 rounded-full bg-ink/10" />
        <div className="mt-2 h-3 w-64 max-w-full rounded-full bg-ink/8" />
      </div>
      <div className="h-3 rounded-full bg-ink/8">
        <div className="dashboard-loader-meter h-full rounded-full bg-[#8fd6a1]" style={{ width: `${22 + index * 12}%` }} />
      </div>
      <div className="h-8 w-24 rounded-full bg-ink/10 md:ml-auto" />
    </div>
  );
}

function useMounted(delay: number) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  return mounted;
}

// Landing on /app/activity#add-transaction (from another page) focuses the form once the page has revealed.
function useHashFocus(hash: string, id: string) {
  useEffect(() => {
    if (window.location.hash !== hash) {
      return;
    }

    const timer = window.setTimeout(() => focusSection(id), 1300);
    return () => window.clearTimeout(timer);
  }, [hash, id]);
}

const panelClass = "cursor-reactive rounded-4xl border border-white/75 bg-white/72 shadow-[0_24px_80px_rgba(23,23,23,0.10)] backdrop-blur-xl";

function EmptyState({
  icon: Icon,
  title,
  body,
  children,
  className = "",
}: {
  icon: typeof Plus;
  title: string;
  body: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`animate-in flex flex-col items-center px-5 py-10 text-center ${className}`}>
      <span className="grid h-14 w-14 place-items-center rounded-full bg-sky text-ink">
        <Icon size={22} />
      </span>
      <h3 className="font-display display-kern mt-5 text-2xl font-black leading-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-ink/52">{body}</p>
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

const primaryButton = "black-button haptic inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-black";
const quietButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 text-sm font-black text-ink/70 shadow-sm transition hover:border-ink hover:text-ink";

function OverviewView({ model }: { model: DashboardModel }) {
  const mounted = useMounted(120);
  const { snapshot, safe, lines, transactions } = model;
  const budgetLeft = lines.length > 0 ? lines.reduce((total, line) => total + line.remaining, 0) : null;
  const perDay = safe ? floorCents(safe.perDay) : null;
  const moneyFlow = [
    { label: "Income this month", value: currency(snapshot.income), icon: Landmark, tone: "bg-mint text-ink" },
    { label: "Spent this month", value: `${snapshot.spend > 0 ? "-" : ""}${currency(snapshot.spend)}`, icon: ReceiptText, tone: "bg-[#ff9a76] text-ink" },
    { label: "Budget left", value: budgetLeft === null ? "No budget" : currency(budgetLeft), icon: PiggyBank, tone: "bg-sky text-ink" },
    { label: "Safe to spend", value: perDay === null ? "Not set" : `${currency(perDay)}/day`, icon: BadgeDollarSign, tone: "bg-[#f9d85f] text-ink" },
  ];
  const note = !safe
    ? "Add a transaction or set a budget and Float works out what you can spend each day."
    : safe.left <= 0
      ? safe.basis === "budget"
        ? "This month's budget is used up, so safe to spend is zero until it resets."
        : "Spending has caught up with income this month."
      : safe.basis === "budget"
        ? `${currency(safe.left)} of budget left, spread over the ${snapshot.daysLeft} ${snapshot.daysLeft === 1 ? "day" : "days"} remaining.`
        : `${currency(safe.left)} left after this month's income and spending, spread over ${snapshot.daysLeft} ${snapshot.daysLeft === 1 ? "day" : "days"}.`;

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article {...cursorCardProps} className="cursor-reactive card-black relative overflow-hidden rounded-[2.35rem] p-5 text-white shadow-[0_34px_110px_rgba(23,23,23,0.22)] sm:p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#87dcfb,#c8e9ca,#ffcf6e,#ff9a76)]" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/70">{formatDay(model.today)}</span>
                <span className="rounded-full bg-mint px-3 py-1 text-xs font-black text-ink">
                  {snapshot.daysLeft} {snapshot.daysLeft === 1 ? "day" : "days"} left
                </span>
              </div>
              <p className="mt-8 text-sm font-bold text-white/46">Safe to spend today</p>
              <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
                <p className="money-figures font-mono text-7xl font-black leading-none tracking-normal sm:text-8xl">
                  {currency(perDay ?? 0)}
                </p>
                <p className="max-w-[18rem] pb-2 text-sm font-semibold leading-5 text-white/48">{note}</p>
              </div>
            </div>
            <SpendGauge model={model} mounted={mounted} />
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {moneyFlow.map((item) => (
              <MoneyFlowStep key={item.label} item={item} />
            ))}
          </div>
        </article>

        <SpendFitCard model={model} />
      </section>

      {model.actions.length > 0 ? (
        <section className={`grid gap-3 ${["", "md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3"][model.actions.length]}`}>
          {model.actions.map((item, index) => (
            <PlayfulActionCard key={item.title} item={item} index={index} />
          ))}
        </section>
      ) : (
        <section {...cursorCardProps} className="cursor-reactive animate-in flex items-center gap-4 rounded-4xl bg-mint p-4 shadow-[0_24px_70px_rgba(23,23,23,0.12)] sm:p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/70 text-ink shadow-sm">
            <ShieldCheck size={18} />
          </span>
          <div className="min-w-0">
            <h3 className="font-display display-kern text-xl font-black leading-tight">All calm.</h3>
            <p className="mt-1 text-sm font-bold leading-5 text-ink/62">
              {transactions.length === 0
                ? "Nothing to flag yet. Log a few transactions and Float will point out what needs attention."
                : "No budgets near their limit and nothing waiting for review."}
            </p>
          </div>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <BudgetPressure model={model} mounted={mounted} />
        <FeedPreview transactions={transactions} />
      </section>
    </div>
  );
}

function ActivityView({ model }: { model: DashboardModel }) {
  const { transactions } = model;
  const [filter, setFilter] = useState<(typeof activityFilters)[number]>("All");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  useHashFocus("#add-transaction", "add-transaction");

  const needle = query.trim().toLowerCase();
  const filtered = transactions.filter((item) => {
    const matchesFilter =
      filter === "All" ||
      (filter === "Review" && item.signal === "Review") ||
      (filter === "Recurring" && item.recurring === true) ||
      (filter === "Income" && item.kind === "income");
    const matchesQuery = !needle || `${item.merchant} ${item.category} ${item.account}`.toLowerCase().includes(needle);

    return matchesFilter && matchesQuery;
  });
  const reviewCount = transactions.filter((item) => item.signal === "Review").length;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section {...cursorCardProps} className={`${panelClass} min-w-0 overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-ink/8 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display display-kern text-2xl font-black">Latest activity</h2>
            <p className="mt-1 text-xs font-bold text-ink/42">
              {filtered.length} of {transactions.length} {transactions.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {activityFilters.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={filter === name}
                onClick={() => {
                  setFilter(name);
                  setLimit(PAGE_SIZE);
                }}
                className={`h-9 rounded-full px-3 text-xs font-black transition ${filter === name ? "bg-ink text-white" : "border border-white/75 bg-white/66 text-ink/62 hover:border-ink hover:text-ink"
                  }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {transactions.length > 0 && (
          <div className="border-b border-ink/8 p-3">
            <label className="flex h-10 items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4">
              <Search size={15} className="shrink-0 text-ink/42" />
              <span className="sr-only">Search transactions</span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setLimit(PAGE_SIZE);
                }}
                placeholder="Search merchant, category, or account"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:font-semibold placeholder:text-ink/34"
              />
            </label>
          </div>
        )}

        {transactions.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Your ledger is empty."
            body="Add your first transaction or import a bank export. Float builds your daily number from what you log."
          >
            <button type="button" onClick={() => focusSection("add-transaction")} className={primaryButton}>
              <Plus size={16} />
              Add a transaction
            </button>
            <button type="button" onClick={() => focusSection("import-csv")} className={quietButton}>
              Import a CSV
            </button>
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Search} title="Nothing matches." body="Try a different search or filter.">
            <button
              type="button"
              onClick={() => {
                setFilter("All");
                setQuery("");
              }}
              className={quietButton}
            >
              Clear filters
            </button>
          </EmptyState>
        ) : (
          <>
            <div className="grid grid-cols-[2.5rem_minmax(0,1.4fr)_110px_92px_2.25rem] gap-3 border-b border-ink/8 bg-white/50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-ink/45 max-sm:hidden">
              <span />
              <span>Merchant</span>
              <span>State</span>
              <span className="text-right">Amount</span>
              <span />
            </div>
            <div className="divide-y divide-ink/8">
              {filtered.slice(0, limit).map((item) => (
                <TransactionRow key={item.id} item={item} deletable />
              ))}
            </div>
            {filtered.length > limit && (
              <div className="border-t border-ink/8 p-3 text-center">
                <button type="button" onClick={() => setLimit((current) => current + PAGE_SIZE)} className={quietButton}>
                  Show more
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <aside className="space-y-4">
        <section {...cursorCardProps} className="cursor-reactive card-black rounded-4xl p-4 text-white shadow-[0_34px_100px_rgba(23,23,23,0.20)]">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-sky text-ink">
              <Zap size={18} />
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/56">
              {transactions.length} {transactions.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <h2 className="font-display display-kern mt-8 text-3xl font-black leading-tight">
            {transactions.length === 0 ? "Start with one entry." : reviewCount > 0 ? `${reviewCount} waiting for review.` : "Everything looks clean."}
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-white/50">
            {transactions.length === 0
              ? "Log a purchase by hand or import a CSV from your bank. Both land in the same ledger."
              : reviewCount > 0
                ? "Charges marked Review are worth a second look before they repeat."
                : "No charges are flagged. Add or import more to keep your daily number accurate."}
          </p>
        </section>

        <section id="add-transaction" {...cursorCardProps} className={`${panelClass} scroll-mt-24 p-4`}>
          <div className="flex items-center justify-between">
            <h2 className="font-display display-kern text-2xl font-black">Add transaction</h2>
            <Plus size={18} className="text-ink/42" />
          </div>
          <AddTransactionForm today={model.today} categories={model.categories} accounts={model.accounts} />
        </section>

        <section id="import-csv" {...cursorCardProps} className={`${panelClass} scroll-mt-24 p-4`}>
          <div className="flex items-center justify-between">
            <h2 className="font-display display-kern text-2xl font-black">Import CSV</h2>
            <Download size={18} className="text-ink/42" />
          </div>
          <CsvImport />
        </section>
      </aside>
    </div>
  );
}

function BudgetsView({ model }: { model: DashboardModel }) {
  const mounted = useMounted(140);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const { lines, snapshot } = model;
  const ranked = [...lines].sort((a, b) => b.ratio - a.ratio);
  const budgeted = new Set(lines.map((line) => line.category));
  const unbudgeted = Object.entries(categorySpend(snapshot.inMonth))
    .filter(([name]) => !budgeted.has(name))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const tightest = ranked[0];

  function edit(line: BudgetLine) {
    setCategory(line.category);
    setLimit(String(line.limit));
    focusSection("budget-form");
  }

  function startFor(name: string) {
    setCategory(name);
    setLimit("");
    focusSection("budget-form");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section {...cursorCardProps} className={`${panelClass} p-4`}>
        <div className="border-b border-ink/8 pb-4">
          <h2 className="font-display display-kern text-2xl font-black">Budget pressure by category</h2>
          <p className="mt-1 text-xs font-bold text-ink/42">This month, by category</p>
        </div>

        {ranked.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No budgets yet."
            body="Pick a category and a monthly limit. Float tracks it against your spending and uses it for your daily number."
          >
            <button type="button" onClick={() => focusSection("budget-form")} className={primaryButton}>
              <Plus size={16} />
              Set your first budget
            </button>
            {unbudgeted.slice(0, 3).map(([name]) => (
              <button key={name} type="button" onClick={() => startFor(name)} className={quietButton}>
                {name}
              </button>
            ))}
          </EmptyState>
        ) : (
          <div className="mt-4 grid gap-3">
            {ranked.map((line, index) => (
              <BudgetRow key={line.id} line={line} index={index} mounted={mounted} onEdit={() => edit(line)} />
            ))}
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <section {...cursorCardProps} className="cursor-reactive rounded-4xl bg-[#ffcf6e] p-5 shadow-[0_24px_80px_rgba(23,23,23,0.12)]">
          {tightest ? (
            <>
              <h2 className="font-display display-kern text-3xl font-black leading-tight">
                {tightest.category}: {tightest.state.toLowerCase()}.
              </h2>
              <p className="mt-3 text-sm font-bold leading-6 text-ink/62">
                {currency(tightest.used)} of {currency(tightest.limit)} used,{" "}
                {tightest.remaining >= 0 ? `${currency(tightest.remaining)} left` : `${currency(-tightest.remaining)} over`} with {snapshot.daysLeft}{" "}
                {snapshot.daysLeft === 1 ? "day" : "days"} to go.
              </p>
              <button type="button" onClick={() => edit(tightest)} className="black-button haptic mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-black">
                Adjust limit
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <h2 className="font-display display-kern text-3xl font-black leading-tight">Give your month a shape.</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-ink/62">
                Limits turn into a daily number you can trust. Start with the category you spend in most.
              </p>
              <button type="button" onClick={() => focusSection("budget-form")} className="black-button haptic mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-black">
                Set a budget
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </section>

        <section id="budget-form" {...cursorCardProps} className={`${panelClass} scroll-mt-24 p-4`}>
          <div className="flex items-center justify-between">
            <h2 className="font-display display-kern text-2xl font-black">Set a limit</h2>
            <Target size={18} className="text-ink/42" />
          </div>
          <BudgetForm category={category} limit={limit} onCategory={setCategory} onLimit={setLimit} categories={model.categories} />
        </section>

        {unbudgeted.length > 0 && (
          <section {...cursorCardProps} className={`${panelClass} p-4`}>
            <h2 className="font-display display-kern text-2xl font-black">Spending without a budget</h2>
            <div className="mt-4 space-y-2">
              {unbudgeted.map(([name, amount]) => (
                <div key={name} {...cursorCardProps} className="cursor-reactive flex items-center justify-between gap-3 rounded-[1.25rem] border border-ink/6 bg-white/70 p-3 shadow-sm">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{name}</p>
                    <p className="mt-1 font-mono text-xs font-bold text-ink/48">{currency(amount)} this month</p>
                  </div>
                  <button type="button" onClick={() => startFor(name)} className="shrink-0 rounded-full bg-mint px-3 py-1 text-xs font-black text-ink">
                    Set limit
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}

function AccountsView({ model }: { model: DashboardModel }) {
  const { transactions, snapshot } = model;
  const accounts = accountSummaries(transactions, model.today);
  const recurring = latestRecurring(transactions);
  const recurringTotal = recurring.reduce((total, item) => total + item.amount, 0);
  const recurringShare = snapshot.spend > 0 ? Math.min(100, Math.round((recurringTotal / snapshot.spend) * 100)) : 0;
  const metrics = [
    { label: "Accounts", value: String(accounts.length), detail: accounts.length === 0 ? "none tracked yet" : "found in your activity" },
    { label: "Spent this month", value: currency(Math.round(snapshot.spend)), detail: `across ${accounts.filter((item) => item.monthSpend > 0).length} accounts` },
    { label: "Recurring", value: currency(Math.round(recurringTotal)), detail: `${recurring.length} ${recurring.length === 1 ? "charge" : "charges"} a month` },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <section className="grid gap-4 md:grid-cols-3">
          {metrics.map((item, index) => (
            <MetricPanel key={item.label} item={item} index={index} />
          ))}
        </section>

        <section {...cursorCardProps} className={`${panelClass} overflow-hidden`}>
          <div className="flex flex-col gap-3 border-b border-ink/8 p-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display display-kern text-2xl font-black">Spending by account</h2>
            <HapticLink href="/app/activity#add-transaction" className={quietButton}>
              <Plus size={16} />
              Add transaction
            </HapticLink>
          </div>
          {accounts.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No accounts yet."
              body="Accounts appear here as you log transactions. Name the account on each one, like Checking or Credit card."
            >
              <HapticLink href="/app/activity#add-transaction" className={primaryButton}>
                <Plus size={16} />
                Add your first transaction
              </HapticLink>
            </EmptyState>
          ) : (
            <div className="divide-y divide-ink/8">
              {accounts.map((account, index) => (
                <AccountRow
                  key={account.account}
                  account={account}
                  index={index}
                  share={snapshot.spend > 0 ? Math.round((account.monthSpend / snapshot.spend) * 100) : 0}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <section {...cursorCardProps} className={`${panelClass} p-4`}>
          <div className="flex items-center justify-between">
            <h2 className="font-display display-kern text-2xl font-black">Subscriptions and renewals</h2>
            <CalendarClock size={18} className="shrink-0 text-ink/42" />
          </div>
          {recurring.length === 0 ? (
            <p className="mt-4 rounded-[1.25rem] border border-ink/6 bg-white/70 p-4 text-sm font-medium leading-6 text-ink/52">
              Nothing recurring yet. Tick &quot;Repeats every month&quot; when you add a bill or subscription and it shows up here.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {recurring.map((item) => (
                <SubscriptionRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <section {...cursorCardProps} className="cursor-reactive card-black rounded-4xl p-5 text-white shadow-[0_34px_100px_rgba(23,23,23,0.20)]">
          <h2 className="money-figures font-mono text-4xl font-black leading-none">{recurringShare}%</h2>
          <p className="mt-2 text-sm font-bold text-white/46">of this month&apos;s spending is recurring</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/12">
            <div className="h-full rounded-full bg-[#8fd6a1]" style={{ width: `${recurringShare}%` }} />
          </div>
          <p className="mt-4 text-sm font-medium leading-6 text-white/50">
            {recurring.length === 0
              ? "Nothing recurring is tracked, so there is nothing quietly renewing."
              : `${currency(recurringTotal)} renews every month across ${recurring.length} ${recurring.length === 1 ? "charge" : "charges"}.`}
          </p>
        </section>
      </aside>
    </div>
  );
}

function MoneyFlowStep({ item }: { item: { label: string; value: string; icon: typeof Landmark; tone: string } }) {
  return (
    <div {...cursorCardProps} className="cursor-reactive rounded-[1.2rem] border border-white/10 bg-white/9 p-3">
      <span className={`grid h-9 w-9 place-items-center rounded-full ${item.tone}`}>
        <item.icon size={16} />
      </span>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-white/36">{item.label}</p>
      <p className="mt-1 truncate font-mono text-lg font-black tabular-nums">{item.value}</p>
    </div>
  );
}

function SpendGauge({ model, mounted }: { model: DashboardModel; mounted: boolean }) {
  const { snapshot, lines } = model;
  const percent = Math.min(model.usedPercent, 100);
  const stats: [string, string][] = [
    ["Day", `${snapshot.day}/${snapshot.daysInMonth}`],
    ["Days left", `${snapshot.daysLeft}d`],
    ["Entries", String(snapshot.inMonth.length)],
  ];

  return (
    <div {...cursorCardProps} className="cursor-reactive rounded-[1.45rem] border border-white/10 bg-white/8 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-white/54">{lines.length > 0 ? "Budget used" : "Income used"}</p>
        <p className="font-mono text-sm font-black text-[#f9d85f]">{model.usedPercent}%</p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/12">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#8fd6a1,#f9d85f,#ff9a76)] transition-[width] duration-700 ease-out"
          style={{ width: mounted ? `${percent}%` : "0%" }}
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/8 px-2 py-2">
            <p className="font-mono text-sm font-black">{value}</p>
            <p className="mt-1 text-[10px] font-bold text-white/36">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpendFitCard({ model }: { model: DashboardModel }) {
  const { safe, snapshot } = model;

  return (
    <section {...cursorCardProps} className="cursor-reactive relative overflow-hidden rounded-[2.35rem] border border-white/75 bg-[#ffcf6e] p-5 shadow-[0_24px_80px_rgba(23,23,23,0.12)]">
      <div className="relative">
        <h2 className="font-display display-kern text-5xl font-black leading-none">{safe ? "Stay on plan." : "Start here."}</h2>
        <p className="mt-3 max-w-xs text-sm font-bold leading-6 text-ink/62">
          {safe
            ? `Keep each day under ${currency(floorCents(safe.perDay))} and the month holds.`
            : "Log your first transaction or set a budget, and Float turns it into a number for today."}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-2">
          {[
            ["Last 7 days", currency(model.weekSpend)],
            [safe?.basis === "budget" ? "Budget left" : "Month left", safe ? currency(Math.max(0, safe.left)) : currency(snapshot.income)],
          ].map(([label, value]) => (
            <div key={label} {...cursorCardProps} className="cursor-reactive rounded-[1.25rem] bg-white/62 p-3 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink/42">{label}</p>
              <p className="mt-3 truncate text-2xl font-black tabular-nums">{value}</p>
            </div>
          ))}
        </div>
        <HapticLink
          href={safe ? "/app/activity#add-transaction" : "/app/budgets"}
          className="black-button haptic mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-black"
        >
          {safe ? "Log a purchase" : "Set a budget"}
          <ArrowRight size={16} />
        </HapticLink>
      </div>
    </section>
  );
}

function PlayfulActionCard({ item, index }: { item: ActionItem; index: number }) {
  const styles = { urgent: "bg-[#ff9a76]", warn: "bg-[#ffcf6e]", good: "bg-mint" };
  const Icon = item.tone === "urgent" ? Bell : item.tone === "warn" ? CalendarClock : ShieldCheck;

  return (
    <article
      {...cursorCardProps}
      style={{ animationDelay: `${index * 55}ms` }}
      className={`cursor-reactive animate-in relative overflow-hidden rounded-4xl p-4 shadow-[0_24px_70px_rgba(23,23,23,0.12)] ${styles[item.tone]}`}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/28" />
      <div className="relative flex min-h-40 flex-col">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/70 text-ink shadow-sm">
          <Icon size={18} />
        </span>
        <h3 className="font-display display-kern mt-5 text-xl font-black leading-tight">{item.title}</h3>
        <p className="mt-2 text-sm font-bold leading-5 text-ink/62">{item.detail}</p>
        <HapticLink href={item.href} className="mt-auto inline-flex h-9 w-fit items-center gap-2 rounded-full bg-ink px-4 text-xs font-black text-white">
          {item.action}
          <ArrowRight size={14} />
        </HapticLink>
      </div>
    </article>
  );
}

function MetricPanel({ item, index }: { item: { label: string; value: string; detail: string }; index: number }) {
  const tones = ["bg-mint", "bg-sky", "bg-[#ff9a76]"];

  return (
    <article {...cursorCardProps} className="cursor-reactive rounded-4xl border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-ink/42">{item.label}</p>
          <p className="mt-4 text-3xl font-black leading-none tabular-nums">{item.value}</p>
          <p className="mt-2 text-sm font-medium text-ink/50">{item.detail}</p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${tones[index % tones.length]}`}>
          {index === 0 ? <Target size={18} /> : index === 1 ? <CircleDollarSign size={18} /> : <TrendingDown size={18} />}
        </span>
      </div>
    </article>
  );
}

function BudgetPressure({ model, mounted }: { model: DashboardModel; mounted: boolean }) {
  const top = [...model.lines].sort((a, b) => b.ratio - a.ratio).slice(0, 4);

  return (
    <section {...cursorCardProps} className={`${panelClass} p-4`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display display-kern text-2xl font-black">Categories to watch</h2>
        <HapticLink href="/app/budgets" className="inline-flex items-center gap-1 text-sm font-black text-ink/52 transition hover:text-ink">
          Open
          <ChevronRight size={15} />
        </HapticLink>
      </div>
      {top.length === 0 ? (
        <EmptyState icon={Target} title="No budgets yet." body="Set a monthly limit for a category and the ones under pressure show up here." className="py-8">
          <HapticLink href="/app/budgets" className={primaryButton}>
            Set a budget
          </HapticLink>
        </EmptyState>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {top.map((line, index) => (
            <BudgetMini key={line.id} line={line} index={index} mounted={mounted} />
          ))}
        </div>
      )}
    </section>
  );
}

function BudgetMini({ line, index, mounted }: { line: BudgetLine; index: number; mounted: boolean }) {
  return (
    <div {...cursorCardProps} className="cursor-reactive rounded-[1.25rem] border border-ink/6 bg-white/70 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black">{line.category}</p>
          <p className="mt-1 text-xs font-bold text-ink/48">
            {currency(line.used)} of {currency(line.limit)}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-black text-ink ${stateTone(line.state)}`}>{line.percent}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/8">
        <div className={`h-full rounded-full ${budgetColor(index)}`} style={{ width: mounted ? `${Math.min(line.percent, 100)}%` : "0%" }} />
      </div>
    </div>
  );
}

function FeedPreview({ transactions }: { transactions: Transaction[] }) {
  return (
    <section {...cursorCardProps} className={`${panelClass} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-ink/8 p-4">
        <h2 className="font-display display-kern text-2xl font-black">Latest moves</h2>
        <HapticLink href="/app/activity" className="inline-flex items-center gap-1 text-sm font-black text-ink/52 transition hover:text-ink">
          View all
          <ChevronRight size={15} />
        </HapticLink>
      </div>
      {transactions.length === 0 ? (
        <EmptyState icon={ReceiptText} title="Nothing logged yet." body="Your newest transactions land here." className="py-8">
          <HapticLink href="/app/activity#add-transaction" className={primaryButton}>
            Add one
          </HapticLink>
        </EmptyState>
      ) : (
        <div className="divide-y divide-ink/8">
          {transactions.slice(0, 4).map((item) => (
            <TransactionRow key={item.id} item={item} compact />
          ))}
        </div>
      )}
    </section>
  );
}

function TransactionRow({ item, compact = false, deletable = false }: { item: Transaction; compact?: boolean; deletable?: boolean }) {
  const isIncome = item.kind === "income";
  const tone = isIncome ? "bg-mint text-ink" : item.signal === "Review" ? "bg-[#ffcf6e] text-ink" : item.signal === "Watch" ? "bg-sky text-ink" : "bg-mint text-ink";
  const state = item.signal === "Review" ? "Review" : item.recurring ? "Recurring" : isIncome ? "Income" : item.signal;

  return (
    <div
      {...cursorCardProps}
      className={`cursor-reactive grid items-center gap-3 p-4 transition hover:bg-white/55 ${compact ? "grid-cols-[auto_1fr_auto]" : "grid-cols-[auto_1fr_auto] sm:grid-cols-[2.5rem_minmax(0,1.4fr)_110px_92px_2.25rem]"}`}
    >
      <span className={`grid h-10 w-10 place-items-center rounded-full ${tone}`}>{isIncome ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-black">{item.merchant}</p>
        <p className="mt-1 truncate text-xs font-medium text-ink/46">
          {item.category} / {compact ? "" : `${item.account} / `}
          {formatDay(item.date)}
        </p>
      </div>
      {!compact && (
        <span className="hidden h-8 items-center justify-center rounded-full bg-white/70 px-3 text-xs font-black text-ink/56 shadow-sm sm:flex">{state}</span>
      )}
      <div className="text-right">
        <p className={`font-mono text-sm font-black tabular-nums ${isIncome ? "text-verdant" : "text-ink"}`}>
          {isIncome ? "+" : "-"}
          {currency(item.amount)}
        </p>
      </div>
      {!compact && (deletable ? <DeleteButton id={item.id} label={item.merchant} kind="transaction" /> : <span className="max-sm:hidden" />)}
    </div>
  );
}

function BudgetRow({ line, index, mounted, onEdit }: { line: BudgetLine; index: number; mounted: boolean; onEdit: () => void }) {
  return (
    <article {...cursorCardProps} className="cursor-reactive grid gap-3 rounded-[1.35rem] border border-ink/6 bg-white/70 p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_140px] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-black">{line.category}</h3>
          <span className={`rounded-full px-2 py-1 text-xs font-black text-ink ${stateTone(line.state)}`}>{line.state}</span>
          <button type="button" onClick={onEdit} className="rounded-full px-2 py-1 text-xs font-black text-ink/48 transition hover:bg-ink/8 hover:text-ink">
            Edit
          </button>
          <DeleteButton id={line.id} label={`${line.category} budget`} kind="budget" />
        </div>
        <p className="mt-1 text-sm font-medium text-ink/50">
          {line.remaining >= 0 ? `${currency(line.remaining)} left this month` : `${currency(-line.remaining)} over this month`}
        </p>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-ink/8">
          <div className={`h-full rounded-full ${budgetColor(index)} transition-[width] duration-700`} style={{ width: mounted ? `${Math.min(line.percent, 100)}%` : "0%" }} />
        </div>
      </div>
      <div className="text-left md:text-right">
        <p className="font-mono text-2xl font-black tabular-nums">{currency(line.used)}</p>
        <p className="mt-1 text-xs font-bold text-ink/46">of {currency(line.limit)}</p>
        <p className="mt-2 text-xs font-black text-ink/62">{line.percent}% used</p>
      </div>
    </article>
  );
}

function AccountRow({ account, index, share }: { account: { account: string; monthSpend: number; count: number }; index: number; share: number }) {
  const tone = index === 0 ? "card-mint" : index === 1 ? "card-blue" : "card-black text-white";

  return (
    <div {...cursorCardProps} className="cursor-reactive grid gap-3 p-4 transition hover:bg-white/55 md:grid-cols-[minmax(0,1fr)_140px_120px] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${tone}`}>
          <CreditCard size={19} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-black">{account.account}</p>
          <p className="mt-1 font-mono text-xs font-bold text-ink/45">
            {account.count} {account.count === 1 ? "transaction" : "transactions"}
          </p>
        </div>
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-ink/38">This month</p>
        <p className="mt-1 font-mono text-base font-black">{currency(account.monthSpend)}</p>
      </div>
      <div className="md:text-right">
        <span className="inline-flex h-8 items-center rounded-full bg-white/70 px-3 text-xs font-black text-ink/62 shadow-sm">{share}% of spend</span>
      </div>
    </div>
  );
}

function SubscriptionRow({ item }: { item: Transaction }) {
  const review = item.signal === "Review";

  return (
    <div {...cursorCardProps} className="cursor-reactive grid grid-cols-[1fr_auto] gap-3 rounded-[1.25rem] border border-ink/6 bg-white/70 p-3 shadow-sm">
      <div className="min-w-0">
        <p className="truncate text-sm font-black">{item.merchant}</p>
        <p className="mt-1 truncate text-xs font-medium text-ink/48">
          Last charged {formatDay(item.date)} / {item.account}
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm font-black">{currency(item.amount)}</p>
        <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-black text-ink ${review ? "bg-[#ffcf6e]" : "bg-mint"}`}>{review ? "Review" : "Active"}</span>
      </div>
    </div>
  );
}

function budgetColor(index: number) {
  return ["bg-sky", "bg-[#ffcf6e]", "bg-[#ff9a76]", "bg-mint"][index % 4];
}

function stateTone(state: BudgetLine["state"]) {
  return state === "Over" || state === "Tight" ? "bg-[#ff9a76]" : state === "Watch" ? "bg-[#ffcf6e]" : "bg-mint";
}
