# Float

Float is a frontend portfolio product for personal finance. It is designed to look like a consumer app that is already in-market: vibrant landing page, premium auth, multi-page app shell, PWA setup, realistic money data, and polished micro-interactions.

## Current Build

- Marketing landing page at `/` with lifestyle imagery, animated SVGs, scale metrics, testimonials, and product narrative.
- Premium sign-in page at `/sign-in` with Google route, passkey-style UI, and direct app access.
- Multi-page app at `/app`, `/app/activity`, `/app/budgets`, and `/app/cards`.
- Product data layer with realistic accounts, transactions, budgets, subscriptions, challenges, trust states, and user profile.
- Server-side OpenAI route at `/api/assistant`.
- PWA manifest and service worker.
- Vercel config using Bun.

## Run Locally

```bash
bun install
bun run dev
```

Then open the local URL shown in the terminal.

## Environment

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required for live integrations:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Product Direction

The goal is frontend hiring impact. Float should feel like a real, loved finance product even when backend integrations are mocked.

Core promise:

- Make spending easy to understand.
- Make bills and subscriptions visible before they surprise the user.
- Make budgeting feel visual and approachable.
- Make the app feel excellent on mobile and desktop.
- Keep the experience portfolio-ready without pretending the backend is complete.

## Deploy On Vercel

1. Push `main`.
2. Import the repo in Vercel.
3. Add the environment variables above.
4. Build command: `bun run build`.
5. Install command: `bun install`.

## Next Build Priorities

1. Add authenticated route protection.
2. Add database persistence for users, accounts, transactions, budgets, and subscriptions.
3. Add import review queue for CSV, email alerts, and bank sync previews.
4. Add real provider connection screens.
5. Add Playwright flows for landing, auth, app navigation, and PWA installability.
