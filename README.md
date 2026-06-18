# Ledger Command

Ledger Command turns the old academic expense tracker into a portfolio-grade finance command center. The product direction is no longer "add an expense and see a chart." It is an executive operating room for burn, runway, vendor risk, approvals, and spoken financial decisions.

## Current Build

- Next.js App Router with TypeScript.
- Tailwind CSS v4 styling.
- Responsive dashboard for mobile and desktop.
- Local voice-command prototype using browser speech capture when available.
- Manual transaction entry, CSV import, search, filters, category rules, approval signals, budget setup, and scenario planning.
- Seed executive finance data so the app runs without bank, database, or model setup.
- Legacy static build preserved in `legacy-static/`.

## Run Locally

```bash
bun install
bun run dev
```

Then open the local URL shown in the terminal.

## Product Positioning

The consumer budgeting market is crowded. YNAB owns disciplined zero-based budgeting, Monarch owns household planning and net worth, Rocket Money owns subscription cancellation, Copilot Money owns polished premium tracking, and Cleo owns conversational coaching.

Ledger Command should not compete as another simple tracker. The stronger wedge is:

> A private finance command center for high-agency operators who want decisions, controls, and forecasts from their money data.

## Roadmap

1. **Portfolio MVP**
   - Upgrade visual system.
   - Show executive dashboard, spend mix, policy signals, and transactions.
   - Add local voice-command prototype.

2. **Product MVP**
   - Add authenticated accounts.
   - Store transactions, categories, budgets, merchants, and approvals.
   - Add CSV import and manual entry.
   - Add assistant route for streamed finance answers.

3. **Premium Product**
   - Bank sync through a provider such as Plaid or Teller.
   - Receipt capture and extraction.
   - Vendor renewal detection.
   - Forecasting and scenario planning.
   - Approval workflow with audit log.

4. **Executive Differentiation**
   - Board-ready monthly brief.
   - Voice-first transaction search.
   - Human approval gates for money-moving actions.
   - Privacy-first controls for sensitive financial data.

## Suggested Stack

- Next.js, React, TypeScript, Tailwind CSS.
- Vercel deployment.
- PostgreSQL with Drizzle or Prisma.
- Auth through Clerk, Auth.js, or Supabase Auth.
- Vercel AI SDK for streaming assistant UX once data models are ready.
- Plaid or Teller for account aggregation.
- Background jobs for recurring categorization, alerts, and renewal checks.

## Portfolio Story

Use this as a "product transformation" case study:

- Started with an academic expense tracker.
- Researched the competitive category.
- Repositioned the app around executive decisions.
- Rebuilt the repository into a modern maintainable stack.
- Added a credible assistant and voice path without pretending the full backend exists yet.
