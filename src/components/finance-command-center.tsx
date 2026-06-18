"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Filter,
  Goal,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  ReceiptText,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { allocations, cashFlow, kpis, tickerItems } from "@/lib/finance-data";
import { ExpenseWorkbench } from "@/components/expense-workbench";
import { VoiceAnalyst } from "@/components/voice-analyst";

const tabs = ["Command", "Spend", "Forecast", "Controls"];

export function FinanceCommandCenter() {
  const [activeTab, setActiveTab] = useState("Command");
  const maxCash = Math.max(...cashFlow.map((item) => item.planned));

  return (
    <main className="min-h-screen overflow-x-hidden px-3 py-3 text-ink sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1480px] overflow-hidden border border-ink/15 bg-paper/80 shadow-[0_24px_80px_rgba(16,18,20,0.12)]">
        <header className="border-b border-ink/15 bg-paper/95">
          <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center bg-ink text-paper">
                <WalletCards size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-steel">Ledger Command</p>
                <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
                  Executive finance operating room
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex h-10 items-center gap-2 border border-ink/15 bg-paper px-3 text-sm transition hover:bg-ink hover:text-paper">
                <Search size={16} />
                Search
              </button>
              <button className="inline-flex h-10 items-center gap-2 border border-ink/15 bg-paper px-3 text-sm transition hover:bg-ink hover:text-paper">
                <Filter size={16} />
                Filters
              </button>
              <button className="inline-flex h-10 items-center gap-2 bg-ink px-3 text-sm text-paper transition hover:bg-charcoal">
                <FileText size={16} />
                Board brief
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-hidden border-t border-ink/10 bg-ink py-2 text-xs uppercase tracking-[0.18em] text-paper/75">
            <div className="shrink-0 pl-4 text-brass lg:pl-6">Live signals</div>
            <div className="ticker flex min-w-max gap-8">
              {[...tickerItems, ...tickerItems].map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[76px_minmax(0,1fr)]">
          <aside className="hidden border-r border-ink/15 bg-paper/70 lg:block">
            <nav className="sticky top-0 flex min-h-[calc(100vh-118px)] flex-col items-center gap-3 py-5">
              {[LayoutDashboard, ReceiptText, Banknote, Goal, ShieldCheck, Menu].map((Icon, index) => (
                <button
                  key={index}
                  className={`grid h-11 w-11 place-items-center border text-ink transition hover:bg-ink hover:text-paper ${
                    index === 0 ? "border-ink bg-ink text-paper" : "border-ink/12 bg-paper"
                  }`}
                  aria-label={`Navigation item ${index + 1}`}
                >
                  <Icon size={18} />
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 p-4 sm:p-5 lg:p-6">
            <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,0.8fr)]">
              <div className="min-w-0 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {kpis.map((kpi) => (
                    <article key={kpi.label} className="border border-ink/15 bg-white/72 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-steel">{kpi.label}</p>
                        <span
                          className={`inline-flex items-center gap-1 text-xs ${
                            kpi.tone === "good"
                              ? "text-verdant"
                              : kpi.tone === "warn"
                                ? "text-coral"
                                : "text-brass"
                          }`}
                        >
                          {kpi.tone === "warn" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          {kpi.change}
                        </span>
                      </div>
                      <p className="mt-5 font-mono text-3xl font-semibold tracking-normal">{kpi.value}</p>
                      <p className="mt-2 text-sm text-steel">{kpi.detail}</p>
                    </article>
                  ))}
                </div>

                <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                  <article className="min-w-0 border border-ink/15 bg-white/72">
                    <div className="flex flex-col gap-3 border-b border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-steel">Cash movement</p>
                        <h2 className="mt-1 text-xl font-semibold">Actual vs operating plan</h2>
                      </div>
                      <div className="inline-flex w-fit border border-ink/12 bg-paper p-1">
                        {tabs.map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`h-8 px-3 text-xs transition ${
                              activeTab === tab ? "bg-ink text-paper" : "text-steel hover:text-ink"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="hairline-grid p-4">
                      <div className="flex h-[286px] items-end gap-3 sm:gap-5">
                        {cashFlow.map((item) => (
                          <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                            <div className="flex h-[224px] w-full items-end justify-center gap-1.5">
                              <div
                                className="w-full max-w-7 bg-verdant"
                                style={{ height: `${(item.actual / maxCash) * 100}%` }}
                              />
                              <div
                                className="w-full max-w-7 border border-ink/30 bg-paper"
                                style={{ height: `${(item.planned / maxCash) * 100}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs text-steel">{item.month}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-steel">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-4 bg-verdant" />
                          Actual burn
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-4 border border-ink/30 bg-paper" />
                          Board plan
                        </span>
                      </div>
                    </div>
                  </article>

                  <article className="min-w-0 border border-ink/15 bg-white/72 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-steel">Allocation</p>
                        <h2 className="mt-1 text-xl font-semibold">Spend mix</h2>
                      </div>
                      <CreditCard size={20} className="text-brass" />
                    </div>

                    <div className="mt-5 space-y-4">
                      {allocations.map((item) => (
                        <div key={item.name}>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-mono text-steel">{item.amount}</span>
                          </div>
                          <div className="h-2 bg-ink/8">
                            <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="border border-ink/10 p-3">
                        <Clock3 size={17} className="text-coral" />
                        <p className="mt-4 font-mono text-xl">$42K</p>
                        <p className="text-xs text-steel">renewals due in 30 days</p>
                      </div>
                      <div className="border border-ink/10 p-3">
                        <LockKeyhole size={17} className="text-verdant" />
                        <p className="mt-4 font-mono text-xl">97%</p>
                        <p className="text-xs text-steel">policy matched</p>
                      </div>
                    </div>
                  </article>
                </section>

                <ExpenseWorkbench />
              </div>

              <div className="min-w-0 space-y-4">
                <VoiceAnalyst />

                <section className="border border-ink/15 bg-white/72 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-steel">Portfolio proof</p>
                  <h2 className="mt-1 text-xl font-semibold">What this demo shows</h2>
                  <div className="mt-5 space-y-3">
                    {[
                      ["Modern stack", "Next.js App Router, TypeScript, Tailwind CSS, responsive client interactions."],
                      ["Executive UX", "Decision-first metrics, approvals, runway, and savings levers instead of basic expense logging."],
                      ["Assistant path", "Voice input works locally today and can later connect to a streaming finance analyst."],
                    ].map(([title, body]) => (
                      <div key={title} className="flex gap-3 border-t border-ink/10 pt-3">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-verdant" size={18} />
                        <div>
                          <p className="font-medium">{title}</p>
                          <p className="mt-1 text-sm leading-6 text-steel">{body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="border border-ink/15 bg-charcoal p-4 text-paper">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-paper/50">Next milestone</p>
                      <h2 className="mt-1 text-xl font-semibold">Private finance agent</h2>
                    </div>
                    <ShieldCheck className="text-brass" size={22} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-paper/70">
                    Connect accounts, normalize transactions, stream answers, require approval for money-moving
                    actions, and log every recommendation for auditability.
                  </p>
                </section>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
