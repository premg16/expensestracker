"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  Bell,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  Landmark,
  ListFilter,
  PanelLeftClose,
  PanelLeftOpen,
  PiggyBank,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
  Zap,
} from "lucide-react";
import { HapticLink } from "@/components/haptic-link";
import { FloatingFinanceCompanion } from "@/components/floating-finance-companion";
import {
  appNav,
  budgetRooms,
  cardStack,
  challenges,
  liveFeed,
  subscriptionStack,
  userProfile,
} from "@/lib/spendpilot-data";

type AppView = "overview" | "activity" | "budgets" | "cards";
type DashboardLoadPhase = "loading" | "revealing" | "ready";

type DashboardCopy = {
  eyebrow: string;
  title: string;
  body: string;
  primaryAction: string;
};

const viewCopy: Record<AppView, DashboardCopy> = {
  overview: {
    eyebrow: "Daily command",
    title: "Know what is safe to spend.",
    body: "Cash, bills, budgets, cards, and review items in one scan.",
    primaryAction: "Add expense",
  },
  activity: {
    eyebrow: "Activity ledger",
    title: "Review transactions without digging.",
    body: "Search, filter, and clear the items that need attention.",
    primaryAction: "Import CSV",
  },
  budgets: {
    eyebrow: "Budget control",
    title: "See pressure before it becomes a miss.",
    body: "Category limits, risks, and practical moves for the month.",
    primaryAction: "Adjust limits",
  },
  cards: {
    eyebrow: "Cards and renewals",
    title: "Track balances, due dates, and quiet charges.",
    body: "Card utilization, payment timing, and subscription decisions.",
    primaryAction: "Add card",
  },
};

const moneyFlow = [
  { label: "Income cleared", value: "$8,420", icon: Landmark, tone: "bg-[#c8e9ca] text-ink" },
  { label: "Fixed bills", value: "-$3,240", icon: ReceiptText, tone: "bg-[#ff9a76] text-ink" },
  { label: "Goals reserved", value: "-$820", icon: PiggyBank, tone: "bg-[#87dcfb] text-ink" },
  { label: "Safe to spend", value: "$186", icon: BadgeDollarSign, tone: "bg-[#f9d85f] text-ink" },
];

const actionQueue = [
  {
    title: "Spotify Duo increased",
    detail: "Price changed by $2. Decide before the next renewal.",
    action: "Review",
    tone: "urgent",
  },
  {
    title: "Groceries are tight",
    detail: "$138 left with 12 days to go.",
    action: "Plan",
    tone: "warn",
  },
  {
    title: "Emergency fund ahead",
    detail: "6.4 months covered. Extra transfer can pause this week.",
    action: "Keep",
    tone: "good",
  },
];

const activityFilters = ["All", "Review", "Recurring", "Income"];
const cardHealth = [
  { label: "Utilization", value: "22%", detail: "healthy range" },
  { label: "Autopay", value: "On", detail: "all cards" },
  { label: "Next due", value: "5d", detail: "Travel Card" },
];

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

export function PersonalDashboard({ view = "overview" }: { view?: AppView }) {
  const copy = viewCopy[view];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dashboardRef = useRef<HTMLElement | null>(null);

  useCursorReactiveCards(dashboardRef);

  return (
    <main ref={dashboardRef} className="relative h-[100dvh] overflow-hidden text-ink">
      <DashboardRhythmBackground />
      <div className="relative z-10 h-full p-3 sm:p-4 lg:p-5">
        <div
          className={`grid h-full gap-3 transition-[grid-template-columns] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
            sidebarOpen ? "lg:grid-cols-[248px_minmax(0,1fr)]" : "lg:grid-cols-[82px_minmax(0,1fr)]"
          }`}
        >
          <AppSidebar view={view} collapsed={!sidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} />

          <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
            <AppHeader copy={copy} />

            <div className="relative min-h-0 flex-1 overflow-y-auto">
              <div className="relative min-h-full">
                <DashboardContentStage key={view} view={view} />
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

function DashboardContentStage({ view }: { view: AppView }) {
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
        className={`mx-auto w-full max-w-[1440px] p-3 pb-24 transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(.16,1,.3,1)] sm:p-5 lg:pb-6 ${
          contentVisible ? "translate-y-0 scale-100 opacity-100 blur-0" : "translate-y-3 scale-[0.992] opacity-0 blur-sm"
        } ${phase === "revealing" ? "dashboard-page-transition" : ""}`}
      >
        {view === "overview" && <OverviewView />}
        {view === "activity" && <ActivityView />}
        {view === "budgets" && <BudgetsView />}
        {view === "cards" && <CardsView />}
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
      className={`relative hidden h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 p-3 text-ink shadow-[0_28px_90px_rgba(23,23,23,0.12)] backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] lg:flex ${
        collapsed ? "items-center" : "items-stretch"
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
                  ? `grid h-12 w-12 place-items-center rounded-full text-sm font-bold transition duration-300 hover:-translate-y-0.5 active:scale-95 ${
                      active ? "bg-ink text-white shadow-[0_12px_30px_rgba(23,23,23,0.18)]" : "text-ink/45 hover:bg-white/76 hover:text-ink"
                    }`
                  : `group flex h-11 items-center gap-3 rounded-full px-3 text-sm font-bold transition duration-300 hover:translate-x-1 active:scale-[0.98] ${
                      active ? "bg-ink text-white shadow-sm" : "text-ink/55 hover:bg-white/76 hover:text-ink"
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
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ff9a76] text-sm font-black text-ink">
            {userProfile.name[0]}
          </span>
          <div
            className={`min-w-0 flex-1 overflow-hidden transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "w-28 opacity-100"
            }`}
          >
            <p className="truncate text-sm font-black leading-none">{userProfile.name}</p>
            <p className="mt-1 text-xs text-ink/42">{userProfile.plan}</p>
          </div>
          {!collapsed && (
            <button className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-white/62 text-ink/50 transition hover:bg-ink hover:text-white" aria-label="Notifications">
              <Bell size={16} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`haptic grid h-11 shrink-0 place-items-center rounded-full border border-ink/10 bg-white/72 text-sm font-black text-ink/62 shadow-sm transition duration-300 hover:bg-ink hover:text-white active:scale-95 ${
            collapsed ? "mx-auto w-11" : "w-full grid-cols-[auto_1fr] gap-2 px-4"
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

function AppHeader({ copy }: { copy: DashboardCopy }) {
  return (
    <header className="sticky top-0 z-20 p-3 sm:p-4">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 rounded-[1.75rem] border border-white/70 bg-white/82 px-3 py-3 shadow-[0_18px_60px_rgba(23,23,23,0.10)] backdrop-blur-2xl sm:px-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/42">{copy.eyebrow}</p>
          <h1 className="font-display display-kern mt-1 text-2xl font-black leading-tight tracking-normal sm:text-3xl">{copy.title}</h1>
          <p className="mt-1 hidden max-w-2xl text-sm font-medium leading-5 text-ink/52 md:block">{copy.body}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-white/72 text-ink/58 shadow-sm transition hover:border-ink hover:text-ink" aria-label="Search">
            <Search size={17} />
          </button>
          <button className="hidden h-10 items-center gap-2 rounded-full border border-ink/10 bg-white/72 px-4 text-sm font-bold text-ink/70 shadow-sm transition hover:border-ink hover:text-ink sm:inline-flex">
            <Download size={16} />
            Export
          </button>
          <button className="black-button haptic inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-black">
            <Plus size={16} />
            <span className="hidden sm:inline">{copy.primaryAction}</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
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
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-black transition ${
              active ? "bg-ink text-white" : "text-ink/52"
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
      className="dashboard-loader-stage pointer-events-none absolute inset-0 z-20 mx-auto w-full max-w-[1440px] p-3 pb-24 sm:p-5 lg:pb-6"
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
            <div className="h-7 w-32 rounded-full bg-[#c8e9ca]/80" />
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
          <div className="mt-5 h-12 w-56 rounded-[1rem] bg-ink/10" />
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
      <section className="dashboard-loader-step overflow-hidden rounded-[2rem] border border-white/75 bg-white/72 shadow-[0_24px_80px_rgba(23,23,23,0.10)]">
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
        <section className="dashboard-loader-step card-black rounded-[2rem] p-4 text-white shadow-[0_34px_100px_rgba(23,23,23,0.20)]">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-full bg-[#87dcfb]" />
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
      <section className="dashboard-loader-step rounded-[2rem] border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)]">
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
        <section className="dashboard-loader-step rounded-[2rem] bg-[#ffcf6e] p-5 shadow-[0_24px_80px_rgba(23,23,23,0.12)]">
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

        <section className="dashboard-loader-step overflow-hidden rounded-[2rem] border border-white/75 bg-white/72 shadow-[0_24px_80px_rgba(23,23,23,0.10)]">
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
        <section className="dashboard-loader-step card-black rounded-[2rem] p-5 text-white shadow-[0_34px_100px_rgba(23,23,23,0.20)]">
          <div className="h-12 w-24 rounded-[1rem] bg-white/12" />
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
    <div className="dashboard-loader-step rounded-[2rem] p-4 shadow-[0_24px_70px_rgba(23,23,23,0.10)]" style={{ backgroundColor: color, animationDelay: `${delay}ms` }}>
      <div className="h-11 w-11 rounded-full bg-white/50" />
      <div className="mt-8 h-5 w-44 rounded-full bg-ink/12" />
      <div className="mt-3 h-4 rounded-full bg-ink/10" style={{ width }} />
    </div>
  );
}

function WhiteLoaderPanel({ rows }: { rows: number }) {
  return (
    <section className="dashboard-loader-step rounded-[2rem] border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)]">
      <div className="flex items-center justify-between gap-3">
        <div className="h-8 w-44 rounded-[0.9rem] bg-ink/10" />
        <div className="h-8 w-8 rounded-full bg-ink/8" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-[1.25rem] border border-ink/6 bg-white/70 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-full ${index % 3 === 0 ? "bg-[#87dcfb]" : index % 3 === 1 ? "bg-[#ffcf6e]" : "bg-[#c8e9ca]"}`} />
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
      <div className={`h-10 w-10 rounded-full ${index % 3 === 0 ? "bg-[#87dcfb]" : index % 3 === 1 ? "bg-[#ffcf6e]" : "bg-[#c8e9ca]"}`} />
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
  const tones = ["bg-[#c8e9ca]", "bg-[#87dcfb]", "bg-[#ff9a76]"];
  return (
    <article className="dashboard-loader-step rounded-[2rem] border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)]">
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

function OverviewView() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article {...cursorCardProps} className="cursor-reactive card-black relative overflow-hidden rounded-[2.35rem] p-5 text-white shadow-[0_34px_110px_rgba(23,23,23,0.22)] sm:p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#87dcfb,#c8e9ca,#ffcf6e,#ff9a76)]" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/70">June 18</span>
                <span className="rounded-full bg-[#c8e9ca] px-3 py-1 text-xs font-black text-ink">Updated 8:42 AM</span>
              </div>
              <p className="mt-8 text-sm font-bold text-white/46">Safe to spend today</p>
              <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
                <p className="money-figures font-mono text-7xl font-black leading-none tracking-normal sm:text-8xl">$186</p>
                <p className="max-w-[18rem] pb-2 text-sm font-semibold leading-5 text-white/48">
                  After rent, cards, goals, groceries, and weekend plans already claimed their share.
                </p>
              </div>
            </div>
            <SpendGauge percent={62} mounted={mounted} />
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {moneyFlow.map((item) => (
              <MoneyFlowStep key={item.label} item={item} />
            ))}
          </div>
        </article>

        <SpendFitCard />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {actionQueue.map((item, index) => (
          <PlayfulActionCard key={item.title} item={item} index={index} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <BudgetPressure mounted={mounted} />
        <FeedPreview />
      </section>
    </div>
  );
}

function ActivityView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section {...cursorCardProps} className="cursor-reactive min-w-0 overflow-hidden rounded-[2rem] border border-white/75 bg-white/72 shadow-[0_24px_80px_rgba(23,23,23,0.10)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 border-b border-ink/8 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display display-kern text-2xl font-black">Latest activity</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {activityFilters.map((filter, index) => (
              <button
                key={filter}
                className={`h-9 rounded-full px-3 text-xs font-black transition ${
                  index === 0 ? "bg-ink text-white" : "border border-white/75 bg-white/66 text-ink/62 hover:border-ink hover:text-ink"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1.4fr)_110px_92px] border-b border-ink/8 bg-white/50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-ink/45 max-sm:hidden">
          <span>Merchant</span>
          <span>State</span>
          <span className="text-right">Amount</span>
        </div>
        <div className="divide-y divide-ink/8">
          {liveFeed.map((item, index) => (
            <TransactionRow key={`${item.merchant}-${item.time}`} item={item} index={index} />
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section {...cursorCardProps} className="cursor-reactive card-black rounded-[2rem] p-4 text-white shadow-[0_34px_100px_rgba(23,23,23,0.20)]">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#87dcfb] text-ink">
              <Zap size={18} />
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/56">48 active</span>
          </div>
          <h2 className="font-display display-kern mt-8 text-3xl font-black leading-tight">Most of the feed is already clean.</h2>
          <p className="mt-3 text-sm font-medium leading-6 text-white/50">
            Coffee, grocery, payroll, rent, and subscriptions are classified automatically. Price changes still go to review.
          </p>
        </section>

        <section {...cursorCardProps} className="cursor-reactive rounded-[2rem] border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display display-kern text-2xl font-black">This week</h2>
            </div>
            <ListFilter size={18} className="text-ink/42" />
          </div>
          <div className="mt-4 space-y-2">
            {["Spotify price increased", "Uber is 23% lower", "Trader Joe's on plan", "Payroll matched"].map((item, index) => (
              <div key={item} {...cursorCardProps} className="cursor-reactive flex items-center gap-3 rounded-[1.25rem] border border-ink/6 bg-white/70 p-3 shadow-sm">
                <span className={`grid h-8 w-8 place-items-center rounded-full ${index === 0 ? "bg-[#ffcf6e] text-ink" : "bg-[#c8e9ca] text-ink"}`}>
                  {index === 0 ? <TrendingUp size={15} /> : <Check size={15} />}
                </span>
                <p className="text-sm font-bold">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function BudgetsView() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 140);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section {...cursorCardProps} className="cursor-reactive rounded-[2rem] border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 border-b border-ink/8 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display display-kern text-2xl font-black">Budget pressure by category</h2>
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 text-sm font-black text-ink/70 shadow-sm transition hover:border-ink hover:text-ink">
            <SlidersHorizontal size={16} />
            Edit monthly plan
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {budgetRooms.map((room, index) => (
            <BudgetRow key={room.name} room={room} index={index} mounted={mounted} />
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section {...cursorCardProps} className="cursor-reactive rounded-[2rem] bg-[#ffcf6e] p-5 shadow-[0_24px_80px_rgba(23,23,23,0.12)]">
          <h2 className="font-display display-kern text-3xl font-black leading-tight">Move $60 from shopping to food.</h2>
          <p className="mt-3 text-sm font-bold leading-6 text-ink/62">
            Weekend dinner plans are creating pressure. This keeps savings untouched and gives groceries more room.
          </p>
          <button className="black-button haptic mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-black">
            Apply change
            <ArrowRight size={16} />
          </button>
        </section>

        <section {...cursorCardProps} className="cursor-reactive rounded-[2rem] border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display display-kern text-2xl font-black">Active this week</h2>
            </div>
            <Target size={18} className="text-ink/42" />
          </div>
          <div className="mt-4 space-y-2">
            {challenges.map((challenge) => (
              <div key={challenge.title} {...cursorCardProps} className="cursor-reactive rounded-[1.25rem] border border-ink/6 bg-white/70 p-3 shadow-sm">
                <p className="text-sm font-black">{challenge.title}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-ink/48">{challenge.progress}</span>
                  <span className="text-xs font-black text-[#2b8f5a]">{challenge.prize}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

function CardsView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <section className="grid gap-4 md:grid-cols-3">
          {cardHealth.map((item, index) => (
            <MetricPanel key={item.label} item={item} index={index} />
          ))}
        </section>

        <section {...cursorCardProps} className="cursor-reactive overflow-hidden rounded-[2rem] border border-white/75 bg-white/72 shadow-[0_24px_80px_rgba(23,23,23,0.10)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 border-b border-ink/8 p-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display display-kern text-2xl font-black">Balances and payment timing</h2>
            </div>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 text-sm font-black text-ink/70 shadow-sm transition hover:border-ink hover:text-ink">
              <CreditCard size={16} />
              Manage cards
            </button>
          </div>
          <div className="divide-y divide-ink/8">
            {cardStack.map((card, index) => (
              <CardRow key={card.name} card={card} index={index} />
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section {...cursorCardProps} className="cursor-reactive rounded-[2rem] border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display display-kern text-2xl font-black">Subscriptions this month</h2>
            </div>
            <CalendarClock size={18} className="text-ink/42" />
          </div>
          <div className="mt-4 space-y-2">
            {subscriptionStack.map((subscription) => (
              <SubscriptionRow key={subscription.name} subscription={subscription} />
            ))}
          </div>
        </section>

        <section {...cursorCardProps} className="cursor-reactive card-black rounded-[2rem] p-5 text-white shadow-[0_34px_100px_rgba(23,23,23,0.20)]">
          <h2 className="money-figures font-mono text-4xl font-black leading-none">22%</h2>
          <p className="mt-2 text-sm font-bold text-white/46">utilization across connected cards</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/12">
            <div className="h-full w-[22%] rounded-full bg-[#8fd6a1]" />
          </div>
          <p className="mt-4 text-sm font-medium leading-6 text-white/50">
            Autopay is on. Travel Card closes in 9 days with no risky balance.
          </p>
        </section>
      </aside>
    </div>
  );
}

function MoneyFlowStep({ item }: { item: (typeof moneyFlow)[number] }) {
  return (
    <div {...cursorCardProps} className="cursor-reactive rounded-[1.2rem] border border-white/10 bg-white/9 p-3">
      <span className={`grid h-9 w-9 place-items-center rounded-full ${item.tone}`}>
        <item.icon size={16} />
      </span>
      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-white/36">{item.label}</p>
      <p className="mt-1 font-mono text-lg font-black tabular-nums">{item.value}</p>
    </div>
  );
}

function SpendGauge({ percent, mounted }: { percent: number; mounted: boolean }) {
  return (
    <div {...cursorCardProps} className="cursor-reactive rounded-[1.45rem] border border-white/10 bg-white/8 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-white/54">Month used</p>
        <p className="font-mono text-sm font-black text-[#f9d85f]">{percent}%</p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/12">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#8fd6a1,#f9d85f,#ff9a76)] transition-[width] duration-700 ease-out"
          style={{ width: mounted ? `${percent}%` : "0%" }}
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {["Payday", "Bills", "Close"].map((label, index) => (
          <div key={label} className="rounded-[1rem] bg-white/8 px-2 py-2">
            <p className="font-mono text-sm font-black">{index === 0 ? "12d" : index === 1 ? "5d" : "9d"}</p>
            <p className="mt-1 text-[10px] font-bold text-white/36">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpendFitCard() {
  return (
    <section {...cursorCardProps} className="cursor-reactive relative overflow-hidden rounded-[2.35rem] border border-white/75 bg-[#ffcf6e] p-5 shadow-[0_24px_80px_rgba(23,23,23,0.12)]">
      <div className="relative">
        <h2 className="font-display display-kern text-5xl font-black leading-none">Dinner fits.</h2>
        <p className="mt-3 max-w-xs text-sm font-bold leading-6 text-ink/62">
          Keep it under $42 and the weekend still stays green.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-2">
          {[
            ["Tonight", "$42"],
            ["Weekend", "$186"],
          ].map(([label, value]) => (
            <div key={label} {...cursorCardProps} className="cursor-reactive rounded-[1.25rem] bg-white/62 p-3 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink/42">{label}</p>
              <p className="mt-3 text-2xl font-black tabular-nums">{value}</p>
            </div>
          ))}
        </div>
        <button className="black-button haptic mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-black">
          Check another plan
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

function PlayfulActionCard({ item, index }: { item: (typeof actionQueue)[number]; index: number }) {
  const styles = [
    "bg-[#ff9a76]",
    "bg-[#87dcfb]",
    "bg-[#c8e9ca]",
  ];
  const icons = [Bell, PiggyBank, ShieldCheck];
  const Icon = icons[index % icons.length];

  return (
    <article {...cursorCardProps} className={`cursor-reactive relative overflow-hidden rounded-[2rem] p-4 shadow-[0_24px_70px_rgba(23,23,23,0.12)] ${styles[index % styles.length]}`}>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/28" />
      <div className="relative flex min-h-40 flex-col">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/70 text-ink shadow-sm">
          <Icon size={18} />
        </span>
        <h3 className="font-display display-kern mt-5 text-xl font-black leading-tight">{item.title}</h3>
        <p className="mt-2 text-sm font-bold leading-5 text-ink/62">{item.detail}</p>
        <button className="mt-auto inline-flex h-9 w-fit items-center gap-2 rounded-full bg-ink px-4 text-xs font-black text-white">
          {item.action}
          <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

function MetricPanel({ item, index }: { item: { label: string; value: string; detail: string }; index: number }) {
  const tones = ["bg-[#c8e9ca]", "bg-[#87dcfb]", "bg-[#ff9a76]"];

  return (
    <article {...cursorCardProps} className="cursor-reactive rounded-[2rem] border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-ink/42">{item.label}</p>
          <p className="mt-4 text-4xl font-black leading-none tabular-nums">{item.value}</p>
          <p className="mt-2 text-sm font-medium text-ink/50">{item.detail}</p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${tones[index % tones.length]}`}>
          {index === 0 ? <Target size={18} /> : index === 1 ? <CircleDollarSign size={18} /> : <TrendingDown size={18} />}
        </span>
      </div>
    </article>
  );
}

function BudgetPressure({ mounted }: { mounted: boolean }) {
  return (
    <section {...cursorCardProps} className="cursor-reactive rounded-[2rem] border border-white/75 bg-white/72 p-4 shadow-[0_24px_80px_rgba(23,23,23,0.10)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display display-kern text-2xl font-black">Categories to watch</h2>
        </div>
        <HapticLink href="/app/budgets" className="inline-flex items-center gap-1 text-sm font-black text-ink/52 transition hover:text-ink">
          Open
          <ChevronRight size={15} />
        </HapticLink>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {budgetRooms.map((room, index) => (
          <BudgetMini key={room.name} room={room} index={index} mounted={mounted} />
        ))}
      </div>
    </section>
  );
}

function BudgetMini({
  room,
  index,
  mounted,
}: {
  room: (typeof budgetRooms)[number];
  index: number;
  mounted: boolean;
}) {
  const color = budgetColor(index);

  return (
    <div {...cursorCardProps} className="cursor-reactive rounded-[1.25rem] border border-ink/6 bg-white/70 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black">{room.name}</p>
          <p className="mt-1 text-xs font-bold text-ink/48">{room.spent} of {room.limit}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-black ${room.percent > 80 ? "bg-[#ffcf6e] text-ink" : "bg-[#c8e9ca] text-ink"}`}>
          {room.percent}%
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/8">
        <div className={`h-full rounded-full ${color}`} style={{ width: mounted ? `${room.percent}%` : "0%" }} />
      </div>
    </div>
  );
}

function FeedPreview() {
  return (
    <section {...cursorCardProps} className="cursor-reactive overflow-hidden rounded-[2rem] border border-white/75 bg-white/72 shadow-[0_24px_80px_rgba(23,23,23,0.10)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-ink/8 p-4">
        <div>
          <h2 className="font-display display-kern text-2xl font-black">Latest moves</h2>
        </div>
        <HapticLink href="/app/activity" className="inline-flex items-center gap-1 text-sm font-black text-ink/52 transition hover:text-ink">
          View all
          <ChevronRight size={15} />
        </HapticLink>
      </div>
      <div className="divide-y divide-ink/8">
        {liveFeed.slice(0, 4).map((item, index) => (
          <TransactionRow key={`${item.merchant}-${item.time}`} item={item} index={index} compact />
        ))}
      </div>
    </section>
  );
}

function TransactionRow({
  item,
  index,
  compact = false,
}: {
  item: (typeof liveFeed)[number];
  index: number;
  compact?: boolean;
}) {
  const isIncome = item.amount.startsWith("+");
  const tone = transactionTone(item.tone);

  return (
    <div {...cursorCardProps} className={`cursor-reactive grid gap-3 p-4 transition hover:bg-white/55 ${compact ? "grid-cols-[auto_1fr_auto]" : "grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_minmax(0,1.4fr)_110px_92px]"}`}>
      <span className={`grid h-10 w-10 place-items-center rounded-full ${tone}`}>
        {isIncome ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-black">{item.merchant}</p>
        <p className="mt-1 text-xs font-medium text-ink/46">
          {item.category} / {item.time}
        </p>
      </div>
      {!compact && (
        <span className="hidden h-8 items-center justify-center rounded-full bg-white/70 px-3 text-xs font-black text-ink/56 shadow-sm sm:flex">
          {item.status}
        </span>
      )}
      <div className="text-right">
        <p className={`font-mono text-sm font-black tabular-nums ${isIncome ? "text-[#2b8f5a]" : "text-ink"}`}>{item.amount}</p>
        {!compact && <p className="mt-1 text-[10px] font-bold text-ink/36">#{index + 1}</p>}
      </div>
    </div>
  );
}

function BudgetRow({
  room,
  index,
  mounted,
}: {
  room: (typeof budgetRooms)[number];
  index: number;
  mounted: boolean;
}) {
  const color = budgetColor(index);
  const state = room.percent >= 82 ? "Tight" : room.percent >= 70 ? "Watch" : "Healthy";

  return (
    <article {...cursorCardProps} className="cursor-reactive grid gap-3 rounded-[1.35rem] border border-ink/6 bg-white/70 p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_140px] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-black">{room.name}</h3>
          <span className={`rounded-full px-2 py-1 text-xs font-black ${state === "Tight" ? "bg-[#ff9a76] text-ink" : state === "Watch" ? "bg-[#ffcf6e] text-ink" : "bg-[#c8e9ca] text-ink"}`}>
            {state}
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-ink/50">{room.vibe}</p>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-ink/8">
          <div className={`h-full rounded-full ${color} transition-[width] duration-700`} style={{ width: mounted ? `${room.percent}%` : "0%" }} />
        </div>
      </div>
      <div className="text-left md:text-right">
        <p className="font-mono text-2xl font-black tabular-nums">{room.spent}</p>
        <p className="mt-1 text-xs font-bold text-ink/46">of {room.limit}</p>
        <p className="mt-2 text-xs font-black text-ink/62">{room.percent}% used</p>
      </div>
    </article>
  );
}

function CardRow({ card, index }: { card: (typeof cardStack)[number]; index: number }) {
  const due = index === 0 ? "Due in 14d" : index === 1 ? "Closes in 9d" : "Savings";
  const tone = index === 0 ? "card-mint" : index === 1 ? "card-blue" : "card-black text-white";

  return (
    <div {...cursorCardProps} className="cursor-reactive grid gap-3 p-4 transition hover:bg-white/55 md:grid-cols-[minmax(0,1fr)_140px_120px] md:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${tone}`}>
          <CreditCard size={19} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-black">{card.name}</p>
          <p className="mt-1 font-mono text-xs font-bold text-ink/45">Card ending {card.digits} / {card.network}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-ink/38">Balance</p>
        <p className="mt-1 font-mono text-base font-black">{card.balance}</p>
      </div>
      <div className="md:text-right">
        <span className="inline-flex h-8 items-center rounded-full bg-white/70 px-3 text-xs font-black text-ink/62 shadow-sm">{due}</span>
      </div>
    </div>
  );
}

function SubscriptionRow({ subscription }: { subscription: (typeof subscriptionStack)[number] }) {
  const risky = subscription.action === "Pause" || subscription.action === "Review";

  return (
    <div {...cursorCardProps} className="cursor-reactive grid grid-cols-[1fr_auto] gap-3 rounded-[1.25rem] border border-ink/6 bg-white/70 p-3 shadow-sm">
      <div className="min-w-0">
        <p className="truncate text-sm font-black">{subscription.name}</p>
        <p className="mt-1 text-xs font-medium text-ink/48">{subscription.note}</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm font-black">{subscription.price}</p>
        <button className={`mt-2 rounded-full px-3 py-1 text-xs font-black ${risky ? "bg-[#ffcf6e] text-ink" : "bg-[#c8e9ca] text-ink"}`}>
          {subscription.action}
        </button>
      </div>
    </div>
  );
}

function budgetColor(index: number) {
  return ["bg-[#87dcfb]", "bg-[#ffcf6e]", "bg-[#ff9a76]", "bg-[#c8e9ca]"][index % 4];
}

function transactionTone(tone: string) {
  if (tone === "good") {
    return "bg-[#c8e9ca] text-ink";
  }

  if (tone === "warn") {
    return "bg-[#ffcf6e] text-ink";
  }

  if (tone === "pink") {
    return "bg-[#ff9a76] text-ink";
  }

  return "bg-[#87dcfb] text-ink";
}
