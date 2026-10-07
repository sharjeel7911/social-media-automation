# A Plain-English Guide to This Project

This explains what every folder and file does, in everyday language — no
coding background needed. One file (`package.json`) is explained here
instead of with inline comments, because it's read by a tool (`npm`) that
breaks if you add comments directly inside it.

## What this app actually does

It helps a business understand and improve how they show up in Google
search. Five tools, plus a dashboard that summarizes all of them:

- **Keyword Research** — type in a topic idea, get back related search
  terms with how popular they are and how hard they'd be to rank for.
- **Rank Tracker** — a running list of keywords you care about, with
  where you currently rank in Google for each one, and whether that's
  gotten better or worse recently.
- **Site Audit** — paste in a web page's address, get a report card: is
  the content well-optimized (good title, headings, etc.), and is the
  page technically healthy (loads fast, no broken links, works on
  mobile)?
- **Competitor Gap** — compare your website to a competitor's and see
  which search terms they show up for that you don't.
- **Google Business Profile** — specifically about LOCAL search (like
  when someone searches "plumber near me") — your ranking, reviews, and
  recent posts there.

**Important honesty note:** right now, none of the actual numbers are
real — they're realistic-looking made-up data, because getting real
numbers requires a paid subscription to a data company (like SEMrush or
Ahrefs) and access to a few Google services, none of which are set up
yet. See README.md's "What's real vs. what's faked" section for exactly
what that means and why it's completely fine at this stage — every
SCREEN works, it's only the underlying data that's placeholder for now.

## The big picture

Like other desktop apps in this project, this has two halves:

- **The "front of house" (`src/` folder)** — everything you actually see
  and click on.
- **The "back of house" (`electron/` and `modules/` folders)** — code
  that runs invisibly in the background, handling data.

The front of house politely asks the back of house to do things for it,
through a narrow doorway (`electron/preload.ts`) — it can never touch
your files or the internet directly itself. This is a safety measure.

## Folder by folder

### `electron/`
- **`main.ts`** — the very first thing that runs when you open the app.
  Opens the window, turns on the SEO toolkit's background feature.
- **`preload.ts`** — the safe "doorway." Lists exactly what the on-screen
  app is allowed to ask for.
- **`ipc/seo.ipc.ts`** — handles every single SEO feature: keyword
  search, tracking, site audits, competitor comparisons, and the Google
  Business Profile snapshot. Currently a TEMPORARY stand-in generating
  realistic fake numbers — see the big comment at the top of that file.

### `modules/seo/`
- **`types/keyword.ts`** — describes what a keyword search result and a
  tracked keyword look like.
- **`types/audit.ts`** — describes what a site audit result looks like
  (scores + checklist items).
- **`types/competitor.ts`** — describes what a competitor-gap result
  looks like.
- **`types/gbp.ts`** — describes what a Google Business Profile snapshot
  looks like.
- **`services/keywordProvider.ts`** — empty right now. Where the real
  connection to a paid keyword-data company will go.
- **`services/technicalChecks.ts`** — empty right now. Where the real
  website health-check logic (using Google's free PageSpeed tool) will go.
- **`services/gbpApi.ts`** — empty right now. Where the real connection
  to Google's Business Profile service will go.
- **`database/database.ts`** — empty right now. Where real, permanent
  storage (so your tracked keywords and audit history survive restarting
  the app) will go.

### `src/`
- **`main.tsx`** — the starting point; finds the empty box in `index.html`
  and tells React to draw the whole app inside it.
- **`App.tsx`** — just renders the one page this whole app has.
- **`vite-env.d.ts`** — a technical helper with no real logic; teaches
  TypeScript about `window.electronAPI`.
- **`index.css`** — every color, spacing, and font choice in the app.
- **`pages/SeoPage.tsx`** — the container holding the 6-tab navigation
  and deciding which screen is currently showing.
- **`moduleB/components/`**:
  - `Dashboard.tsx` — the one-glance overview screen.
  - `KeywordResearch.tsx` — the keyword search screen.
  - `RankTracker.tsx` — the tracked-keywords table with trend arrows and
    a little history line for each one.
  - `SiteAudit.tsx` — the URL checker, showing score circles and a
    pass/warn/fail checklist.
  - `CompetitorGap.tsx` — the two-site comparison screen.
  - `GoogleBusinessProfile.tsx` — the local-search snapshot screen.
  - `ScoreRing.tsx` — a small reusable circular score visual (used in
    both the Dashboard and Site Audit).
  - `CheckRow.tsx` — a small reusable pass/warn/fail checklist row (used
    by Site Audit).
- **`store/useSeoStore.ts`** — the app's shared memory: tracked keywords,
  audit history, competitor results, and the Google Business Profile
  snapshot, plus every action that changes them. Any screen can read from
  or update this.

### Top-level files
- **`index.html`** — the empty page shell the whole app gets drawn into.
- **`.env.example`** — currently just an explanation of what secret keys
  will eventually be needed, once real data sources are connected.
- **`.gitignore`** — tells Git which files/folders to never track (like
  `node_modules/` and build output).
- **`tsconfig.json`** — TypeScript's mistake-catching rules for the
  on-screen app.
- **`tsconfig.node.json`** — the same, but for the background code
  (`electron/main.ts`, the `ipc/` files, and everything in `modules/`).
- **`tsconfig.preload.json`** — a THIRD, separate set of rules,
  specifically for `preload.ts`. Electron loads preload scripts through a
  special restricted mode that can only run old-style JavaScript, so that
  one file has to be compiled differently from everything else.
- **`vite.config.ts`** — settings for Vite, the tool that runs the app
  live while developing and bundles the finished version.

## `package.json` — explained here since it can't hold comments

This is the project's "ID card and shopping list," read by `npm`.

- **`"main"`** — tells Electron which compiled file to run on startup.
- **`"scripts"`**:
  - `npm run dev` — runs the app while developing, with instant reload.
  - `npm run build` — checks for mistakes and packages the finished app.
  - `npm run dist` — produces an actual Windows installer.
- **`"dependencies"`** — packages the finished app actually needs: React
  (the on-screen framework), Zustand (shared app memory), `lucide-react`
  (icons).
- **`"devDependencies"`** — only needed while building/developing:
  TypeScript, Vite, Electron, and the installer-packaging tool.
- **Not included yet, but will be needed later:** `better-sqlite3` (real
  database) and something to make real web requests, like `axios` (for
  calling the real SEO/Google APIs). Adding these is part of building the
  real backend, not part of this frontend.
