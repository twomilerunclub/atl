# Two Mile Run Club

Next.js 14 + TypeScript + Supabase. Same site, modern foundation.
Full migration notes: [MIGRATION.md](./MIGRATION.md)

## Quick start

```bash
npm install
cp .env.example .env.local        # fill in Supabase + Stripe values
npx supabase link --project-ref <ref>
npx supabase db push              # applies migrations + seed
npm run db:types                  # generate types from the live schema
npm run dev
```

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply migrations |
| `npm run db:types` | Regenerate `types/database.types.ts` |

## Where things live

- **Pages** — `app/`, one folder per route
- **Reads** — `lib/database/queries.ts` (Server Components only)
- **Writes** — `lib/database/actions.ts` (Server Actions: guard → validate → mutate → revalidate)
- **Auth** — `lib/auth/` and `app/auth/`
- **Schema** — `supabase/migrations/`, applied in filename order
- **Styling** — `app/globals.css`, the original stylesheet preserved

## Two rules worth keeping

1. Never trust the client for identity, role, price, or approval status. RLS is the enforcement layer; UI checks are courtesy.
2. `SUPABASE_SERVICE_ROLE_KEY` is used in exactly one file (`lib/supabase/admin.ts`), which imports `server-only` so a client import breaks the build. Keep it that way.
