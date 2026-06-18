# Product Plan

## Market Map

| Competitor | What they own | Gap Ledger Command can target |
| --- | --- | --- |
| YNAB | Zero-based budgeting discipline and education | Heavy manual habit, less executive decision framing |
| Monarch Money | Household planning, net worth, collaboration | Strong consumer household lens, less operator workflow |
| Rocket Money | Subscription detection, cancellation, bill negotiation | Actionable savings, but narrow around bills and subscriptions |
| Copilot Money | Premium tracking, Apple-quality UX, recommendations | Strong personal app feel, less finance control-room framing |
| Cleo | Conversational money coaching | Chat-first and consumer tone, less trusted for executive-grade decisions |
| Simplifi | Spending plan, watchlists, cash projection | Practical tracker, less differentiated voice and approval workflow |

## Product Thesis

Expense tracking is the wrong center of gravity. The product should help a serious operator answer:

- What changed since the last review?
- Which spend decisions need action today?
- Which vendors, renewals, and teams are driving burn?
- How does this affect runway?
- What would happen if we cut 5, 10, or 15 percent from non-core spend?

## Target User

Primary portfolio audience:

- Founders, finance leaders, product leaders, and engineering leaders who understand budget ownership.
- Reviewers who have seen many CRUD dashboards and want evidence of product thinking.

Eventual product user:

- High-income professionals, founders, and small business operators who want personal and operating finances in one command surface.

## Differentiation

Ledger Command should feel closer to an operating system than a budget app:

- Decision-first dashboard, not category-first charts.
- Voice and chat for financial questions.
- Forecasts and scenario planning.
- Approval and policy signals.
- Board-ready summaries.
- Audit-friendly action history.

## Assistant And Voice Roadmap

### Phase 1: Local Prototype

- Browser speech capture.
- Deterministic responses from mock finance data.
- Quick prompts that show the intended workflows.

### Phase 2: Streaming Analyst

- Add an assistant API route.
- Stream answers in the UI.
- Give the assistant read-only tools for transactions, budgets, merchants, subscriptions, and runway.
- Render assistant responses with proper markdown support.

### Phase 3: Agentic Controls

- Add approval gates for actions such as cancelling a subscription, changing a budget, or sending an owner reminder.
- Log every assistant recommendation and user action.
- Add evaluation fixtures for finance question accuracy.

### Phase 4: Voice-Native Workflows

- "What changed this week?"
- "Show vendors above $5,000."
- "Create a 10 percent savings plan."
- "Draft the board spend note."
- "Mark this renewal for review."

## Data Model

Core entities:

- User
- Organization
- Account
- Transaction
- Merchant
- Category
- Budget
- Subscription
- Approval
- ForecastScenario
- AssistantSession
- AuditEvent

Important constraints:

- Financial data must be encrypted at rest.
- Assistant tools should be read-only by default.
- Any money-moving or destructive action needs explicit approval.
- Imported and generated data should carry provenance.

## Build Phases

### Phase 1: Repo Transformation

- Move from compiled static output to source-controlled Next.js app.
- Create modern UI shell.
- Add local voice-command prototype.
- Document product and market direction.

Status: built in the current Next.js app. The previous compiled static output is preserved in `legacy-static/`.

### Phase 2: Real Expense Core

- Manual transaction entry.
- CSV import.
- Category rules.
- Monthly budget setup.
- Transaction search and filters.

Status: first local product slice is built. The dashboard now supports manual transaction entry, pasted or uploaded CSV import, rule-based categorization, live search, signal filters, approval state changes, editable monthly budgets, and budget health by owner.

### Phase 3: Intelligence Layer

- Assistant API.
- Spend summaries.
- Merchant overlap detection.
- Renewal forecast.
- Runway scenarios.

Status: partly built as deterministic local logic. The app now calculates controllable spend, savings scenarios, renewal exposure, software overlap, and the highest-pressure budget category from the live transaction state. The next step is a streamed assistant route that can query the same finance model.

### Phase 4: Production Layer

- Auth.
- Database.
- Bank sync.
- Background jobs.
- Error monitoring.
- Test coverage.
- Vercel deployment.

Status: not built yet. This should come after the local product flows are stable enough to preserve as fixtures and tests.

## Current Implementation Map

| Plan area | Current file | Notes |
| --- | --- | --- |
| Executive command surface | `src/components/finance-command-center.tsx` | Dashboard shell, KPI cards, cash chart, spend mix, voice panel, and product proof panels |
| Real expense core | `src/components/expense-workbench.tsx` | Manual entry, CSV import, filters, approvals, budgets, rules, and scenario controls |
| Finance model | `src/lib/finance-model.ts` | Currency formatting, CSV parsing, transaction creation, budget status, and savings scenario math |
| Demo data | `src/lib/finance-data.ts` | Seed transactions, budgets, category rules, KPIs, cash-flow data, and assistant prompts |
| Voice prototype | `src/components/voice-analyst.tsx` | Browser speech capture and deterministic finance responses |

## Next Engineering Milestones

1. Persist local transactions to a real database with a migration-backed schema.
2. Add authenticated organizations and user-owned budgets.
3. Convert category rules into editable records instead of fixed seed data.
4. Add a read-only assistant route over transactions, budgets, rules, and scenarios.
5. Add tests for CSV import, budget health, and scenario math.
6. Add deployment config and portfolio screenshots after visual verification.

## Portfolio Case Study Outline

1. Problem: academic tracker lacked product depth.
2. Research: category has strong incumbents across budgeting, subscription action, premium UX, and conversational coaching.
3. Strategy: reposition around executive decisions and trust.
4. Execution: rebuild in Next.js, Tailwind, and TypeScript with responsive UI.
5. Demo: show dashboard, transaction controls, voice analyst, and roadmap.
6. Next: connect real data and streamed assistant with approval gates.
