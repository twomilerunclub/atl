# TMR — Stack Modernization Report

The site looks and behaves the same. Everything underneath it changed.

---

## 1. Current stack → new stack

| Concern | Before | After |
| --- | --- | --- |
| Framework | One 153 KB `index.html` | Next.js 14 App Router + React 18 + TypeScript (strict) |
| Rendering | Client-side only; JS built every page | Server Components by default; client only where interactive |
| Routing | `go()` swapping `display:none` on `<section>` | File-based routes, real URLs, streaming, prefetch |
| Styling | `<style>` block | Same CSS, moved to `app/globals.css` (231 of 231 rules unchanged) |
| Fonts | Google Fonts `<link>` (third-party request) | `next/font` self-hosted, same three faces |
| Data | JS arrays in memory, lost on refresh | PostgreSQL via Supabase |
| Auth | `signIn('runner')` demo buttons | Supabase Auth: email+password, verification, Google OAuth, reset |
| Authorization | `if (user.role === 'admin')` in the browser | RLS policies in the database + server guards |
| Mutations | Direct array mutation | Server Actions, Zod-validated |
| Payments | Simulated modal | Stripe Checkout + signed webhook |
| Secrets | None (nothing to protect) | Env vars; service role isolated behind `server-only` |
| Cookies | None, no consent | 4-category consent with a documented registry |
| Deployment | GitHub Pages (static) | Vercel (default for Next.js) |

**Why Vercel over GitHub Pages:** Pages serves static files only. Server Actions, the Stripe webhook, and auth cookie refresh all need a server runtime. Vercel runs the middleware at the edge and the actions as functions with no config.

---

## 2. Architecture overview

```
Browser
  │
  ├── middleware.ts ──── refreshes the Supabase session cookie on every request
  │                      and redirects guests away from /dashboard /profile /blog
  │
  ├── Server Components ── lib/database/queries.ts ──┐
  │     (read path)         runs as the signed-in     │
  │                          user, RLS applies        │
  │                                                   ▼
  ├── Server Actions ───── lib/database/actions.ts ── Supabase Postgres
  │     (write path)        auth guard → Zod →        (RLS enforced here,
  │                          mutation → revalidate     not in the UI)
  │
  └── Client Components ── interactivity only: cart, search, countdown,
                            wizard steps, toast, consent panel
```

Four rules the codebase follows:

1. **Read on the server.** Pages fetch through `lib/database/queries.ts`; no `useEffect` data fetching anywhere.
2. **Write through actions.** Every mutation authenticates, validates with Zod, then writes. No client ever names its own `user_id` or sets `status: 'approved'`.
3. **The database is the last word.** If a policy would reject the write, the UI check is a courtesy, not the control.
4. **Client components are leaves.** They receive data as props and call actions. They never import server modules.

---

## 3. Folder structure

```
app/
  layout.tsx              root shell: fonts, nav, footer, consent, toasts
  page.tsx                home (ISR, 60s)
  about|runs|routes|leaderboard|merch/    public pages
  dashboard|profile|blog/                 protected pages
  auth/
    login|signup|reset-password|update-password/   pages
    callback/route.ts     OAuth code exchange
    confirm/route.ts      email verification + recovery links
    signout/route.ts
  api/
    checkout/route.ts     creates the Stripe session (prices read server-side)
    stripe-webhook/route.ts  signature-verified; records paid orders
  legal/privacy|cookies/
  globals.css             the original stylesheet, preserved
components/               17 presentational + interactive components
lib/
  supabase/               client.ts · server.ts · admin.ts · middleware.ts
  auth/                   actions.ts (sign in/up/reset/OAuth) · guards.ts
  database/               queries.ts (reads) · actions.ts (writes)
  validation/schemas.ts   every Zod schema
  cookies/                registry.ts (the documented cookie list) · actions.ts
  merch/catalog.ts        SKUs and prices — server-side source of truth
  points.ts               point rules + badges, shared by 3 pages
  format.ts               pace, duration, initials, dates
types/                    index.ts (domain) · database.types.ts (generated)
supabase/migrations/      4 version-controlled SQL files
middleware.ts
```

---

## 4. Database schema

19 tables. Highlights:

- **`profiles`** — 1:1 with `auth.users` via FK, created automatically by an `on_auth_user_created` trigger that also works for Google sign-ins. Holds only what Supabase Auth does not: name, avatar, role, running details, visibility. No password, no duplicated session data.
- **`member_details`** — waiver signature, emergency contact, medical notes, address. Split from `profiles` deliberately so the sensitive fields have their own, stricter policy and are never joined into a public query by accident.
- **`runs`** — `status` gates the points. `unique (user_id, strava_activity_id)` makes Strava re-imports idempotent.
- **`point_events`** — an append-only ledger rather than a running total on `profiles`. Every point is attributable, and the monthly reset is just a date filter instead of a scheduled job that mutates rows.
- **`leaderboard_monthly`** — a `security_invoker` view aggregating the ledger for the current month. The "resets monthly" behaviour is now a property of the query.
- **`cookie_consents`** — dated record of each decision. No IP, no user agent.

Constraints and indexes throughout: FKs with intentional `on delete` behaviour, `check` constraints on distance/duration/caption length, a `position between 1 and 3` constraint that enforces the 3-photo limit in the database, and composite indexes on the columns actually filtered (`runs(user_id, ran_on desc)`, `posts(status, created_at desc)`).

Points are awarded by SQL triggers, not application code: 10 per approved run, +15 on the third run of a week, 5–20 for performance derived from pace, 25 on referral, +15 when the referred member reaches 3 approved runs. A client cannot argue with a trigger.

---

## 5. Authentication architecture

| Flow | Implementation |
| --- | --- |
| Email + password sign-up | `signUp` action → Supabase → verification email → `/auth/confirm` |
| Email verification | `verifyOtp` in a route handler; unverified users cannot sign in |
| Sign in | `signInWithPassword`; failures return one generic message so the form cannot be used to discover which addresses are registered |
| Google OAuth | `signInWithOAuth` → Google → `/auth/callback` exchanges the code for a session |
| Password reset | `resetPasswordForEmail` → `/auth/confirm?next=/auth/update-password`; the response is identical whether or not the address exists |
| Session persistence | `@supabase/ssr` cookie storage, refreshed by middleware on every request |
| Route protection | Middleware redirect **plus** `requireProfile()` / `requireAdmin()` in the page, **plus** RLS |

Sessions use `getUser()` rather than `getSession()` everywhere it matters. `getSession()` trusts the cookie; `getUser()` revalidates the JWT with Supabase, so a forged cookie fails.

The five-step join wizard is preserved exactly — same steps, same fields, same waiver checkboxes and signature. It now creates a real account and writes the waiver to `member_details`.

---

## 6. Cookie and privacy architecture

`lib/cookies/registry.ts` is the single source of truth: it drives the preference panel *and* the `/legal/cookies` table, so the disclosure cannot drift from reality.

| Category | Contents | Default |
| --- | --- | --- |
| Necessary | Supabase auth token, the consent cookie itself, Stripe fraud cookies during checkout | Always on |
| Functional | Merch size/colour memory | Off |
| Analytics | Aggregate page views | Off |
| Marketing | Event-link attribution | Off |

The banner offers Accept all, Reject non-essential, and Customize. Choices persist for 6 months, then the site asks again. Bumping `CONSENT_VERSION` invalidates every stored decision, which is what you want when the policy changes. The footer link reopens the panel on any page. The merch component checks for functional consent before writing its preference cookie — the enforcement is real, not just a banner.

Data minimization: medical notes and emergency contacts are optional, stored in a separate table, and readable only by their owner and admins. Card details never touch the server.

---

## 7. Security improvements

| Risk before | Mitigation now |
| --- | --- |
| Role was a JS variable — anyone could set `user.role='admin'` in the console | Role lives in Postgres; `is_admin()` is `SECURITY DEFINER` with a pinned `search_path`; admin actions call `requireAdmin()` and are re-checked by RLS |
| Any client could mark a run approved | Insert policy requires `status = 'pending'`; only the admin policy can transition it |
| No data isolation | RLS on all 19 tables, deny-by-default, with policies written per operation |
| Prices were client-side | `/api/checkout` reads prices from `lib/merch/catalog.ts` and ignores client amounts |
| N/A | Stripe webhook verifies the signature before writing anything |
| N/A | Service-role key imported through `server-only`, so a client import fails the build |
| N/A | OAuth `next` params must start with `/`, blocking open-redirect attacks |
| N/A | Security headers: HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy |
| N/A | Zod validates every action input; length caps mirror the DB check constraints |
| N/A | `point_events` has read policies but no write policies — only triggers can award points |

One deliberate design note: users can edit their own runs only while `status = 'pending'`, so nobody can quietly rewrite an approved run's distance after points post.

---

## 8. Dependencies

**Added (7 runtime):** `next`, `react`, `react-dom`, `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `stripe`.
**Dev (6):** `typescript`, `@types/*`, `eslint`, `eslint-config-next`.

**Removed:** the Google Fonts CDN request (now self-hosted). Nothing else — the original had no dependencies to drop.

No charting library: the consistency bars and pace line are hand-rolled SVG rendered on the server, so they cost zero client JS. No CSS framework: the original stylesheet was already good.

---

## 9. Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Project endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Safe by design — RLS is what protects the data |
| `SUPABASE_SERVICE_ROLE_KEY` | **private** | Bypasses RLS; webhook only |
| `NEXT_PUBLIC_SITE_URL` | public | Redirect base for auth links |
| `STRIPE_SECRET_KEY` | **private** | Creates checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | **private** | Verifies webhook signatures |
| `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` | private | Reserved for the Strava import |

See `.env.example`. Anything without `NEXT_PUBLIC_` never reaches the browser.

---

## 10. Database migration instructions

```bash
npm install
npx supabase link --project-ref <your-project-ref>
npx supabase db push          # applies the 4 migrations in order
npm run db:types              # regenerates types/database.types.ts from the live schema
```

Then in the Supabase dashboard: **Authentication → Providers → Google**, paste your Google OAuth client ID and secret, and add `https://<your-domain>/auth/callback` to the redirect allow-list. Under **URL Configuration**, set the site URL to your domain.

Run `npm run db:types` after every schema change — that generated file is what makes the query layer type-safe end to end.

---

## 11. Deployment instructions

```bash
vercel                        # link the project
# add every variable from .env.example in Vercel → Settings → Environment Variables
vercel --prod
```

Then point the Stripe webhook at `https://<your-domain>/api/stripe-webhook` (event: `checkout.session.completed`) and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

Locally: `npm run dev`.

---

## 12. What changed in the frontend

Every page, every class name, and every string of copy is preserved. The markup was transcribed from the original DOM into JSX; the stylesheet diff is three lines, all of them font-variable plumbing that keeps the original stacks as fallbacks.

| Original | Now |
| --- | --- |
| `go()` page switcher | Next.js routes at real URLs |
| `signIn('runner')` demo buttons | Sign in / Sign up links |
| `toast()` global function | `ToastProvider` context, same `#toast` element and CSS |
| `renderLB()` + innerHTML | `<LeaderboardTable>`, same table markup |
| `renderMerch()` + innerHTML | `<MerchStore>`, same cards, swatches, cart |
| Signup modal wizard | `<RegistrationWizard>`, same 5 steps and waiver |
| Demo Stripe modal | Real Stripe Checkout redirect |
| Inline base64 logo (26 KB × 2) | `/public/logo.png` via `next/image` |
| — | Cookie banner, `/legal/privacy`, `/legal/cookies` (new, additive) |

---

## 13. Performance

- Leaderboard, routes, and events render on the server; the client bundle carries only genuinely interactive components.
- ISR where it fits: home 60s, leaderboard 30s, about 300s. Dashboard and profile are `force-dynamic` because they are per-user.
- `react.cache()` dedupes repeated queries inside one render.
- The logo dropped out of the HTML payload (it was base64-inlined twice) and is now an optimized, cached image.
- Fonts self-hosted: one fewer DNS lookup and TLS handshake on first paint.
- Charts are server-rendered SVG, so no charting library ships.

---

## 14. Remaining technical debt

Honest list of what is not finished:

1. **`types/database.types.ts` is a permissive placeholder.** Real types come from `npm run db:types` after the first push. Until then the query layer uses `any` in a few spots — the `(r: any)` casts in `queries.ts` disappear once generated.
2. **Strava import is scaffolded, not built.** The schema, source tags, and UI all handle imported runs; the OAuth exchange and sync job are not written. Env vars are reserved.
3. **Blog photos store a path string, not an upload.** Wire `post_photos.path` to a Supabase Storage bucket with its own policies.
4. **Luma sync is manual.** `events` is a real table an admin can fill; a scheduled function to pull from Luma would remove the copying.
5. **Milestone emails are described but not sent.** Add a Supabase Edge Function on `point_events` insert, or Resend from a server action.
6. **No automated tests.** The verification checklist below is manual. Playwright against the auth flows and an RLS test suite (sign in as user A, try to read user B's `member_details`, expect zero rows) are the two highest-value additions.
7. **Weekly-streak points** are displayed in the rules but not yet awarded by a trigger; the other five rules are. It needs a weekly scheduled job.
8. **Admin "promote to admin"** exists as an action but has no UI entry point yet.
9. **CSP header is not set.** The other security headers are; a Content-Security-Policy needs a nonce strategy for Next's inline scripts.

---

## 15. Verification checklist

Run after `db push` and a first deploy:

```bash
npm run typecheck && npm run lint && npm run build
```

Then walk through: sign up → verify email → sign in → Google OAuth → password reset → sign out. Confirm `/dashboard` redirects guests to login. Log a run, confirm it shows Pending; approve it as an admin, confirm points appear on the leaderboard. Open the cookie banner, reject non-essential, confirm no `tmr_prefs` cookie is written; accept functional, confirm it is. As user A, query user B's `member_details` from the browser console with the anon client and confirm it returns zero rows.

Compare each page against the original at 390px and 1280px — the CSS is unchanged, so any difference is a markup transcription bug worth fixing.
