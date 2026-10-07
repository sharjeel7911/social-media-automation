# Module B — SEO Toolkit

Electron + React + TypeScript desktop app. This is the **complete
frontend** for Module B from the project's Statement of Work: keyword
research, rank tracking, site audits, competitor gap analysis, and a
Google Business Profile snapshot. This is a **fully standalone project**
— it shares no code, folders, or database with Module A or Module C;
it's its own independent `package.json` and repo.

## What is Module B, in plain terms?

The idea: give a small business one place to understand and improve how
they show up in Google search, without needing to be an SEO expert or
juggle five different tools. Concretely, this app answers five questions:

1. **"What should I be writing content about?"** → Keyword Research:
   search an idea, see how many people search it monthly and how hard
   it'd be to rank for.
2. **"Am I actually ranking for the keywords I care about?"** → Rank
   Tracker: a running list of tracked keywords with their current Google
   ranking position and how it's trended over time.
3. **"Is this specific page optimized well?"** → Site Audit: paste in a
   URL, get a content score (title tags, headings, etc.) and a technical
   health check (broken links, page speed, mobile-friendliness, etc.).
4. **"What is my competitor doing better than me?"** → Competitor Gap:
   compare two sites and see keywords they rank for that you don't.
5. **"How am I doing in local search (like 'near me' results)?"** →
   Google Business Profile: local ranking position, reviews, and recent posts.

All five roll up into the **Dashboard**, a one-glance health summary.

## What's real vs. what's (deliberately) faked right now

Every SCREEN in this project is fully built and works end to end. What's
faked is the underlying data, since real SEO data requires paid
third-party services this phase of the project hasn't set up yet (per
SOW Section 10: "A paid SEO data API subscription... is procured before
Phase 2 begins" — a purchasing step, not something code alone can solve).
Everything fake is isolated into exactly one file:

- **`electron/ipc/seo.ipc.ts`** — generates realistic-looking random
  numbers for keyword volume/difficulty, audit scores/checklists,
  competitor gaps, and a demo Google Business Profile, and stores
  everything in memory instead of a real database. Nothing here talks to
  Google, DataForSEO, SEMrush, Ahrefs, or any other real service.

This file is written to match the exact function names and data shapes
the REAL backend needs to have (see the four empty placeholder files in
`modules/seo/services/` and `modules/seo/database/`, each explaining
exactly what real integration belongs there). This means: once someone
builds the real version, they can swap in their own implementation and
**nothing in this frontend needs to change at all**.

## The six screens

- **Dashboard** — a one-glance health summary pulling from all five
  tools below: tracked keyword count and average position, the latest
  site audit's score, and the local search ranking.
- **Keyword Research** — search a keyword idea, see suggested related
  keywords with estimated volume/difficulty, and track any of them.
- **Rank Tracker** — every tracked keyword, its current position, how
  it's trending (up/down/same/new), and a small history trend line.
- **Site Audit** — paste a URL, get an on-page content score + checklist
  and a technical SEO checklist + page speed score, together.
- **Competitor Gap** — compare your site to a competitor's and see
  keyword opportunities you're missing.
- **Google Business Profile** — local search ranking, reviews, and
  recent posts, with a refresh button.

## Project structure

```
electron/
  main.ts            → the app's starting point
  preload.ts          → the safe bridge between on-screen app and background code
  ipc/seo.ipc.ts        → TEMPORARY mock backend for ALL of Module B (see above)

modules/seo/
  types/               → shared data shapes (keyword.ts, audit.ts, competitor.ts, gbp.ts)
  services/            → EMPTY placeholders for the real integrations:
    keywordProvider.ts    → real keyword data (DataForSEO / SEMrush / Ahrefs)
    technicalChecks.ts    → real technical audits (PageSpeed Insights / Search Console)
    gbpApi.ts               → real Google Business Profile API
  database/database.ts  → EMPTY placeholder for real permanent SQLite storage

src/
  App.tsx               → the very top-level component
  pages/SeoPage.tsx       → the container with the 6-tab navigation
  moduleB/components/      → Dashboard, KeywordResearch, RankTracker, SiteAudit,
                             CompetitorGap, GoogleBusinessProfile, plus two small
                             reusable pieces: ScoreRing and CheckRow
  store/useSeoStore.ts      → shared app state for all six screens
  index.css                  → all colors/spacing/fonts
```

See `PROJECT_GUIDE.md` for a plain-English walkthrough of every file, and
inline comments throughout every file itself.

## Setup

```bash
npm install
```

No `.env` setup is required to run this right now — see `.env.example`
for what real services will need credentials once this moves past mocks.

## Run in development

```bash
npm run dev
```

Starts the Vite dev server, compiles the background code, and opens the
Electron app window (with Developer Tools automatically attached, in its
own separate panel).

## Build & package

```bash
npm run build   # type-check + bundle the on-screen app + compile the background code
npm run dist     # electron-builder — produces a Windows installer under release/
```

## Notes for whoever builds the real backend

Each of the four empty files under `modules/seo/` has a comment at the
top explaining exactly what real integration belongs there and which
mock function in `electron/ipc/seo.ipc.ts` it replaces. The general
pattern (same one used in the Module C project, for consistency):

1. Build the real logic in the relevant `modules/seo/...` file.
2. Update the matching handler in `electron/ipc/seo.ipc.ts` to call it
   instead of generating fake data — keep the IPC channel names
   (`seo:searchKeywords`, `seo:runAudit`, etc.) and return shapes the
   same, since the frontend already expects exactly those.
3. For permanent storage, follow `modules/leads/database/database.ts` in
   the Module C project as the pattern to copy (same `better-sqlite3`
   library, same style).
