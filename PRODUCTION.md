# Going to production

A checklist for taking Float from the Clerk **Development** instance to a public launch. Nothing here is automated. You do these steps in the Clerk, Google Cloud, and Vercel dashboards.

Clerk was provisioned through the **Vercel Marketplace** (team `premg16s-projects`, project `expensestracker`), and that changes a few steps compared with a standalone Clerk app. Those steps are called out below.

## 1. Pick and attach the production domain

Clerk production instances can't run on `*.vercel.app` because Clerk needs DNS records on a domain you control.

1. Buy or choose a domain, e.g. `float.example`.
2. Vercel → **expensestracker → Settings → Domains**: add `float.example` (and `www.float.example` if you want it), and wait until Vercel shows the domain as valid.

## 2. Create the Clerk production instance

1. Vercel → **Integrations → Clerk → Open in Clerk** (this opens the Vercel-managed Clerk app).
2. At the top of the Clerk Dashboard, click **Development** → **Create production instance**.
3. Choose **Clone development instance settings** so the email-code and Google sign-in settings carry over.
4. Enter `float.example` as the production domain. For Marketplace apps, the production domain is owned by the Vercel integration. If Clerk sends you there (or if you ever need to change the domain later), set it under Vercel → **Integrations → Clerk → Settings**. The Clerk dashboard's **Change domain** button just links to that page.
5. Settings that don't clone over: **SSO connections**, **Integrations**, and **Paths**. Re-check them in the production instance (Google is covered in step 4 below, and Paths should point sign-in at `https://float.example/sign-in`).

## 3. Add the DNS records Clerk asks for

Clerk Dashboard (production instance) → **Domains**. That page lists the exact records. Copy the values from there, not from this file. For a standard setup it's five CNAMEs, roughly:

| Host | Points to |
| --- | --- |
| `clerk.float.example` | `frontend-api.clerk.services` |
| `accounts.float.example` | `accounts.clerk.services` |
| `clkmail.float.example` | `mail.<id>.clerk.services` |
| `clk._domainkey.float.example` | `dkim1.<id>.clerk.services` |
| `clk2._domainkey.float.example` | `dkim2.<id>.clerk.services` |

- If the domain's DNS is on Vercel, add these under Vercel → **Domains → float.example → DNS Records**. Otherwise add them at your registrar.
- If you use Cloudflare, set every Clerk record to **DNS only** (grey cloud). Proxied records break Clerk's SSL issuance.
- Propagation can take up to 48 hours. When the Domains page shows everything verified, Clerk issues the certificates.

The `clkmail` and DKIM records are what let the email sign-in codes come from your domain and stay out of spam.

## 4. Use your own Google OAuth client

In development Clerk lends you shared Google credentials. Production requires your own.

1. Clerk Dashboard (production) → **SSO connections** → **Add connection → For all users → Google**. Turn on **Enable for sign-up and sign-in** and **Use custom credentials**. Copy the **Authorized Redirect URI** it shows (it will be on `clerk.float.example`) and keep the tab open.
2. [Google Cloud Console](https://console.cloud.google.com/) → pick or create a project → **APIs & Services → OAuth consent screen**: set the app name, support email, and the `float.example` authorized domain, and add the scopes `openid`, `email`, and `profile`.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**:
   - **Authorized JavaScript origins**: `https://float.example` (plus `https://www.float.example` if used).
   - **Authorized redirect URIs**: the URI copied from Clerk.
4. Paste the **Client ID** and **Client Secret** back into Clerk's Google connection and save.
5. Back on the consent screen, **Publish app** (move it from Testing to **In production**). Until you do, only the test users listed there can sign in with Google.

The app's own callback route (`/sign-in/sso-callback`) is a path on your site, so it needs no change.

## 5. Production keys in Vercel

The production instance has its own keys: `pk_live_…` and `sk_live_…` (development uses `pk_test_…` and `sk_test_…`).

The Marketplace integration syncs the keys for you: Clerk's production instance maps to Vercel **Production**, and the development instance maps to **Preview** and **Development**. After creating the instance, check Vercel → **Settings → Environment Variables**:

| Variable | Production | Preview | Development |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` (prod instance) | `pk_test_…` (dev instance) | `pk_test_…` |
| `CLERK_SECRET_KEY` | `sk_live_…` (prod instance) | `sk_test_…` | `sk_test_…` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | `/sign-in` | `/sign-in` |

- If Production still shows `pk_test_`/`sk_test_` values, the sync didn't happen. Copy the live keys from Clerk → **API keys** (production instance) and set them for **Production only**.
- Keep live keys out of Preview. Preview deployments run on `*.vercel.app`, where the live keys don't work, and you don't want preview builds creating real accounts.
- `.env.local` stays on the dev keys (`vercel env pull` pulls the Development values).
- `NEXT_PUBLIC_*` values are baked in at build time, so **redeploy Production** after the keys change.

## 6. After the switch

- **User IDs change.** Production Clerk users get new `user_…` IDs, and every Neon row is keyed by `user_id`. Transactions, budgets, and AI usage created under development accounts won't show up for the same email in production. Re-import anything you want to keep.
- Clerk test emails (`name+clerk_test@example.com` with code `424242`) only work in development unless you turn on test mode for production. Leave it off.
- Smoke test on `https://float.example`: email-code sign-in, Google sign-in, add a transaction, ask the companion one question.

## Built-in limits

These caps exist so open sign-up can't run up storage or the OpenAI bill:

| Limit | Value | Where |
| --- | --- | --- |
| Transactions per user | 25,000 | `MAX_TRANSACTIONS_PER_USER` in `src/app/app/actions.ts` |
| Rows per CSV import | 2,000 | `MAX_CSV_ROWS`, same file |
| Companion questions per user per UTC day | 50 | `DAILY_LIMIT` in `src/app/api/assistant/route.ts` |
| Companion questions across all users per UTC day | 2,000 | `GLOBAL_DAILY_LIMIT`, same file (stored in `ai_usage` as `user_id = '*'`) |

Set a monthly spend limit in the OpenAI dashboard as well. The global cap counts questions, not tokens.

## Landing page content to replace before launch

The landing page still has invented social proof and claims for features the app doesn't have yet. Publishing invented testimonials or reviews to real users is misleading (and in the US the FTC treats fake reviews and testimonials as deceptive). Replace each item with real content or remove it.

**`src/lib/float-data.ts`**

- `testimonials`: three invented people ("Maya, Product designer, Brooklyn", "Andre, Founder, Austin", "Nina, Product lead, Seattle") with made-up quotes and results ("Found $52…"). Rendered on the landing page. **Remove, or replace with real quotes you have permission to use.**
- `pressQuotes`: three unattributed quotes styled as press or user praise. Not rendered right now. **Delete.**
- `productStats`: "$42 recovered this week", "18 day streak", "< 5m daily time in app". These are presented as outcomes, but there are no streaks and no usage measurement. Not rendered right now. **Delete.**
- `trustSignals`: "Connect only what you choose" (there are no account connections) and "Review imports before saving" (CSV imports save right away). Not rendered right now. **Delete, or fix the copy if it gets wired up.**
- `landingFeatures`: also unused. It describes price-change detection, unused-trial and duplicate detection, streaks, and "spending rooms", none of which exist. **Delete.**

**`src/components/landing-page.tsx`**

- Social proof section (`#love`, around line 679): the eyebrow says **"What users actually say"** above the fabricated `testimonials`, plus a five-star row (around line 717) that implies ratings nobody gave. **Remove the section or the stars until you have real reviews.**
- Feature copy describing things Float can't do yet:
  - "Morning brief / What changed today? / Spotify rose $2" and "Price moves, quiet renewals… show up as decisions" (around lines 61–65, 108–111, 395, 914): there's no automatic price-change or renewal detection.
  - "A short daily brief…", "Five minutes a day", "< 5m", "weekly recovery, and spending rooms" (around lines 32–33, 140–143): there's no daily brief, streaks, or rooms.
  - "Email import path / Receipts and renewal notices can become useful cards" (around lines 179–181): there's no email import. Entry is manual or CSV.
  - "Voice-first money questions" (around line 194): the voice feature was removed. The companion is text only.
  - "Bills, goals, card payments… leave first" and the "Rent already committed / Card closes Friday" breakdown (around lines 22–23, 92–94, 379–381): the app doesn't track goals or card due dates, and it has no bank connection.
- The same "after rent, cards, goals, and every quiet renewal" claim appears in the site description in `src/app/layout.tsx` (line 28) and in `src/app/manifest.ts`. Update those along with the landing copy.
- The mock dollar figures in the product illustrations ($186, $4,812, $42 and so on) are fine as clearly illustrative UI, as long as the surrounding copy doesn't present them as real customer results.
