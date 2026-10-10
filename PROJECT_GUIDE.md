# A Plain-English Guide to This Project

This explains what every folder and file does, in everyday language — no
coding background needed. One file (`package.json`) is explained here
instead of with inline comments, because it's read by a tool (`npm`) that
breaks if you add comments directly inside it.

## What this app actually does

It's the "control room" that sits on top of the other three tools (social
posting, SEO, lead finding) and shows how everything is going in one place.
Five screens:

- **Dashboard** — the home screen: what posts are coming up, which new
  leads came in, how healthy the website's SEO is, and headline engagement
  numbers.
- **Analytics** — three small line charts (how many people saw your posts,
  what share of them reacted, how many followers you have) over the last
  30 days, plus a ranked list of your best posts.
- **Lead Pipeline** — a board with one column for each stage a sales lead
  can be in. You drag a lead's card from one column to the next as things
  progress (e.g. from "Contacted" to "Replied").
- **Reports** — a one-page summary for the past week or month, which you
  can save as a spreadsheet-style (CSV) file.
- **Integrations** — a "coming later" screen for connecting to CRM tools
  like HubSpot. It's intentionally switched off because the project plan
  marks it as an optional, later-phase extra.

**Important honesty note:** right now, none of the numbers are real. They're
realistic-looking made-up data, because this dashboard is supposed to pull
from the other three tools — and those are separate programs it can't
reach yet. See the "big open question" section in README.md for what the
team needs to decide. The one thing that IS real is saving a report as a
CSV file.

## The big picture

Like the other apps in this project, this has two halves:

- **The "front of house" (`src/` folder)** — everything you see and click.
- **The "back of house" (`electron/` and `modules/` folders)** — code that
  runs invisibly in the background, handling data and saving files.

The front of house politely asks the back of house to do things through a
narrow doorway (`electron/preload.ts`) — it can never touch your files
directly itself. This is a safety measure.

## Folder by folder

### `electron/`
- **`main.ts`** — the first thing that runs when you open the app. Opens
  the window and turns on the background feature.
- **`preload.ts`** — the safe "doorway." Lists exactly what the on-screen
  app is allowed to ask for.
- **`ipc/dashboard.ipc.ts`** — supplies all the dashboard's data (made up
  for now) and handles moving leads between columns and saving the CSV
  report file. See the big comment at the top of that file.

### `modules/dashboard/`
- **`types/summaries.ts`** — describes the small "summary" version of a
  post, a lead, and an SEO health snapshot that the dashboard shows.
- **`types/analytics.ts`** — describes the analytics numbers (impressions,
  engagement, followers, top posts).
- **`types/report.ts`** — describes what a weekly/monthly report contains.
- **`services/dataSync.ts`** — empty right now. This is where the real
  connection to the other three tools' data will go, once the team decides
  how that should work (the file explains the three options).

### `src/`
- **`main.tsx`** — the starting point; finds the empty box in `index.html`
  and tells React to draw the whole app inside it.
- **`App.tsx`** — just renders the one page this app has.
- **`vite-env.d.ts`** — a technical helper with no real logic; teaches
  TypeScript about `window.electronAPI`.
- **`index.css`** — every color, spacing, and font choice in the app.
- **`pages/DashboardPage.tsx`** — the container holding the 5-tab bar and
  deciding which screen is showing.
- **`moduleD/components/`**:
  - `Dashboard.tsx` — the home screen.
  - `Analytics.tsx` — the charts and top-posts table.
  - `LeadPipeline.tsx` — the drag-and-drop board.
  - `Reports.tsx` — the weekly/monthly summary and export button.
  - `Integrations.tsx` — the "planned" CRM screen.
  - `LineChart.tsx` — a small reusable line chart (used three times in
    Analytics). Drawn directly, with no charting library.
  - `ScoreRing.tsx` — a small reusable circular score (used for the SEO
    scores on the Dashboard).
  - `LeadStatusBadge.tsx` — the small colored "New / Contacted / Won"
    pill, plus the master list of statuses and their colors.
- **`store/useDashboardStore.ts`** — the app's shared memory: posts,
  leads, SEO snapshot, analytics, and the current report, plus every
  action that changes them. Any screen can read from or update this.

### Top-level files
- **`index.html`** — the empty page shell the whole app gets drawn into.
- **`.env.example`** — currently just a note on what secret keys might be
  needed once real data is connected.
- **`.gitignore`** — tells Git which files/folders to never track.
- **`tsconfig.json`** — TypeScript's mistake-catching rules for the
  on-screen app.
- **`tsconfig.node.json`** — the same, for the background code
  (`electron/main.ts`, the `ipc/` files, and `modules/`).
- **`tsconfig.preload.json`** — a THIRD set of rules just for
  `preload.ts`. Electron loads preload scripts in a special restricted
  mode that only understands old-style JavaScript, so that one file has to
  be compiled differently from everything else.
- **`vite.config.ts`** — settings for Vite, the tool that runs the app
  live while developing and bundles the finished version.

## `package.json` — explained here since it can't hold comments

The project's "ID card and shopping list," read by `npm`.

- **`"main"`** — tells Electron which compiled file to run on startup.
- **`"scripts"`**:
  - `npm run dev` — runs the app while developing, with instant reload.
  - `npm run build` — checks for mistakes and packages the finished app.
  - `npm run dist` — produces an actual Windows installer.
- **`"dependencies"`** — what the finished app needs: React (the
  on-screen framework), Zustand (shared app memory), `lucide-react` (icons).
- **`"devDependencies"`** — only needed while building: TypeScript, Vite,
  Electron, and the installer-packaging tool.
- **Not included yet, but likely needed later:** a database library
  (depending on the team's decision about how the modules share data) and
  a PDF-generating library (for the PDF report export the plan mentions).
