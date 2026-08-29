# Two Mile Run Club — atl

Website for Two Mile Run Club (TMR), an Atlanta running community.

**Live at:** https://twomilerunclub.github.io/atl/

## What's here

| File | Purpose |
| --- | --- |
| `index.html` | The entire site — HTML, CSS, JS, and the logo (base64) in one file. No build step, no dependencies to install. |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is instead of running Jekyll. |

Pages: Home, About, Runs, Routes, Leaderboard, Dashboard, Profile, Blog, Merch. Each page has its own link — `.../atl/#leaderboard`, `.../atl/#merch`, and so on.

## Deploy

1. Push this folder to the `atl` repository under the `twomilerunclub` account.
2. Repo → **Settings** → **Pages** → Source: **Deploy from a branch**, Branch: `main`, Folder: `/ (root)` → **Save**.
3. Wait ~1 minute, then open https://twomilerunclub.github.io/atl/

Every push to `main` republishes automatically.

## Editing

Open `index.html` and edit directly — the whole site is in that one file, organized in sections:

- `PRODUCTS` / `SOON` — merch items, prices, and the coming-soon list
- `STRIPE.paymentLinks` — paste live Stripe Payment Link URLs here to take real payments
- `POINT_RULES` / `BADGES` — the leaderboard point system and badge list (used on Leaderboard, Profile, and Dashboard)
- `EVENTS` — upcoming runs
- `routes` — featured routes
- `runners` — leaderboard entries

## Current limitations

This is a front-end site. Data lives in the browser, so sign-ups, logged runs, RSVPs, and cart contents reset on refresh and aren't shared between visitors. To make them permanent you'll need a backend (a database plus auth) and live credentials for Stripe, Strava, Luma, and Gmail.
