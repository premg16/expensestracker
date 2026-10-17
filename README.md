# Float

Float is a personal finance app that shows what you can safely spend today, built with Next.js, Clerk, and Neon Postgres.

## Current Build

- Marketing landing page at `/`.
- Real sign-in at `/sign-in`: Google or a one-time email code, powered by Clerk. New users are created on first sign-in.
- Protected app at `/app`, `/app/activity`, `/app/budgets`, and `/app/cards` (accounts and renewals). Unauthenticated visitors are sent to `/sign-in`.
- Neon Postgres (via Drizzle) stores each user's transactions and budgets. Every query is scoped to the signed-in user.
- Manual transaction entry and CSV import (`date,merchant,amount,category,account`; negative amounts count as income).
- Authenticated `/api/assistant` route that reads the user's own data server-side, with a 50 questions per user per day limit.
- PWA manifest and a service worker that never caches personal pages or API responses.

## Run Locally

```bash
bun install
cp .env.example .env.local   # then fill in the values below
bun run db:push              # create the tables in your Neon database
bun run dev
```

Then open the local URL shown in the terminal. `bun run db:studio` opens Drizzle Studio.

## Environment

Create `.env.local` from `.env.example`:

- `DATABASE_URL` (Neon pooled connection string)
- `DATABASE_URL_UNPOOLED` (Neon direct connection string, used by `db:push`)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `OPENAI_API_KEY` and `OPENAI_MODEL` (optional: without a key the companion answers from local summaries of your data)

In the Clerk dashboard, enable Google and email code sign-in, and turn off "Require password" so new email sign-ups complete with a code alone.

## Product Direction

Float should feel like a real, loved finance product.

Core promise:

- Make spending easy to understand.
- Make bills and subscriptions visible before they surprise the user.
- Make budgeting feel visual and approachable.
- Make the app feel excellent on mobile and desktop.

## Deploy On Vercel

1. Push `main`.
2. Import the repo in Vercel.
3. Add the environment variables above.
4. Build command: `bun run build`.
5. Install command: `bun install`.

## Next Build Priorities

1. Bank sync and an import review queue.
2. Monthly snapshots and savings plans.
3. Playwright flows for sign-in, entry, and PWA installability.
