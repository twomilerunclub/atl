# TMR Club | ATL — website

Static site for GitHub Pages. No build step, no dependencies. Drop these files at the
root of the `tmrclub.github.io/atl` repo and it's live.

```
index.html      Home
routes.html     Routes, with reviews and likes
about.html      About us
join.html       Registration
404.html        Not found
assets/css/site.css
assets/js/site.js       club details + signup
assets/js/routes.js     route data + reviews
assets/img/      square_logo.png, banner_logo.png, tmrclub_banner.png
```

## 1. Set your club details

Everything the site says about *when* and *where* lives in one place: the `CLUB` object
at the top of `assets/js/site.js`. Change it there and every page updates.

| Field | What it does |
| --- | --- |
| `run.day`, `run.time`, `run.spot` | The text shown across the site |
| `run.dayIndex` | 0 = Sunday … 6 = Saturday. Used by "Add to calendar" |
| `run.start24`, `run.end24` | 24-hour times for the calendar file |
| `run.mapUrl` | Where "Open in maps" goes |
| `links.instagram` / `strava` / `groupChat` / `email` | Footer and signup links. Leave any as `""` and it disappears instead of linking nowhere |

**Placeholders to replace before you publish:** the meetup spot, the map link, the
Instagram URL, and the contact email. Everything else is real copy you can keep.

## 2. Connect the signup form

The form doesn't post anywhere until you give it an endpoint. Free option that works on
GitHub Pages:

1. Sign up at [formspree.io](https://formspree.io) and create a form.
2. Copy the endpoint it gives you (`https://formspree.io/f/xxxxxxx`).
3. Paste it into `formEndpoint` in `assets/js/site.js`.

Signups then arrive in your Formspree inbox and can be exported to CSV or forwarded to
email. Until you set it, the page tells you it isn't connected rather than quietly
dropping people.

If you'd rather use Google Forms, Mailchimp, or Airtable, any of them will work — swap
the `fetch` call in the `registration()` function for their endpoint.

## 3. Set up your routes

Routes live in the `ROUTES` array at the top of `assets/js/routes.js`. Add, remove or
reorder them there — the page, the difficulty filter and the route count all follow.

Each route needs a distance, elevation and difficulty (`Easy`, `Moderate` or `Hilly` —
the filter matches on that exact word), plus a one-line summary, start point and surface.

**The maps are drawings, not real maps.** Each route's `path` is an SVG line on a
400 × 260 canvas, so they're schematic — they show the shape of a route, not turn-by-turn
directions. Every card links out to the real thing via `mapUrl`. To use a real map
instead, screenshot it, drop it in `assets/img/`, and set `image: "assets/img/route-krog.png"`
on that route — it replaces the drawing.

`profile` draws the elevation sparkline: twelve numbers between 0 and 1, low point to
high point. It's a shape, not survey data, so eyeball it against the route.

**Video previews** are supported but empty by default. Set `video` on a route to either a
YouTube or Vimeo *embed* URL (`https://www.youtube.com/embed/XXXXXXX` — the plain
`watch?v=` link won't load in a frame) or a file you host yourself
(`assets/video/krog.mp4`). The player appears at the top of that route's panel. Leave it
as `""` and the section doesn't render at all, so there's never an empty box.

A phone held horizontally, walking the route, is plenty — the point is showing someone the
sidewalk and the turns before they commit their Saturday.

**Testimonials** on the routes page build themselves: the page takes the three
highest-liked reviews across all routes and shows them with the route they came from.
Nothing separate to maintain — as your reviews change, so does that section.

### Reviews and likes — read this before publishing

- **The seeded reviews are placeholders.** The two from your mockup are real (Varun P and
  Sam S); the rest I wrote as examples of the right length and tone. Replace them with
  real ones or delete them — fake reviews are worse than an empty section, and the page
  handles "no reviews yet" gracefully.
- **New reviews go to your form endpoint**, tagged `form_type: route_review` with the
  route name attached. They don't appear on the page automatically — you read them, then
  paste the good ones into that route's `reviews` array. For a club this size, moderating
  by hand is the right call.
- **Likes are per-visitor.** They're stored in the visitor's own browser, so the count
  someone sees is the starting number in your data file plus their own taps. Nobody else
  sees it. That's the honest limit of a static site — if you want real shared counts,
  you'd need a small backend (a Google Apps Script endpoint or a free Supabase table are
  the two cheapest routes).

## 4. Publish

Push to `main`, then Settings → Pages → deploy from `main` / root.

## Notes

- **Bib numbers** are generated in the browser as a welcome touch, so two people can get
  the same one. If you want real sequential numbers, assign them from your signup list
  when you email the meetup pin.
- **The About page** is written to be true to the club but the origin story is a guess —
  rewrite "The short version" in your own words, it'll be the best thing on the site.
- **Photos** would lift this a lot. If you add real shots from a run, the strongest
  places are between the hero and the "Two miles" statement on the home page, and
  beside "Probably people like you" on the About page.
- Colours are intentionally only black and white, matching the logo. If you ever add an
  accent, add it in `:root` in `site.css` so it stays consistent.
