# Module D — Unified Dashboard

Electron + React + TypeScript desktop app. This is the **complete
frontend** for Module D from the project's Statement of Work: a home
dashboard, cross-platform analytics, a Kanban-style lead pipeline, and
exportable reports. This is a **fully standalone project** — it shares no
code, folders, or database with Modules A, B, or C; it's its own
independent `package.json` and repo.

## What is Module D, in plain terms?

Modules A, B, and C are three separate tools: one for social media posts,
one for SEO, one for finding sales leads. Module D is the **one screen
that sits on top of all three** so you can see how everything is doing
without opening each tool separately. Five tabs:

1. **Dashboard** — the home screen. Upcoming scheduled posts (from A),
   latest leads (from C), SEO health scores (from B), and engagement
   numbers, all in one view.
2. **Analytics** — trend charts for impressions, engagement rate, and
   follower growth over the last 30 days, plus a ranked list of your
   best-performing posts.
3. **Lead Pipeline** — a Kanban board with one column per lead status
   (New → Contacted → Replied → Qualified → Won / Lost). Drag a card to a
   different column to change that lead's status.
4. **Reports** — pick weekly or monthly, see a one-page summary of the
   numbers from across the whole app, and export it as a CSV file.
5. **Integrations** — a placeholder for pushing leads into a CRM
   (HubSpot / Pipedrive / Salesforce). The SOW lists this as an optional
   "Phase 5+" stretch goal, so the buttons are deliberately switched off
   and labeled "Planned" rather than pretending it works.

## ⚠️ The big open question (read this one)

Module D's whole job is to show data that lives in the **other three
modules**. But A, B, and C were each built as their own separate
standalone app, each with its own database. So this dashboard currently
has **no way to reach their real data**, and a real backend can't be
written until the team decides how that should work.

The three realistic options (also written up in
`modules/dashboard/services/dataSync.ts`):

1. **Merge all four modules into ONE app with ONE shared database.**
   Matches the SOW's original picture (one desktop app, Section 5), and
   makes Module D's backend simple. Probably the cleanest long-term answer,
   but it means combining the four separate projects.
2. **Keep them separate; Module D reads each one's database file directly.**
   Works, but fragile — if another module changes its table layout, this
   one breaks without warning.
3. **Keep them separate; each module exposes a small local API that
   Module D calls.** Cleaner than option 2, but extra work in every module.

This is worth raising with your team lead before anyone builds the real
backend, since the answer affects all four modules, not just this one.

## What's real vs. what's (deliberately) faked right now

Every screen is fully built and works end to end. The data behind them is
made up, isolated into exactly one file:

- **`electron/ipc/dashboard.ipc.ts`** — makes up realistic-looking posts,
  leads, SEO scores, 30 days of analytics, and report numbers, held in
  memory (they reset when you close the app). Moving a lead between
  Kanban columns works, but only until the app is closed.

**One thing is genuinely real:** exporting a report to CSV. It opens an
actual "Save File" window and writes an actual file to your computer. It
doesn't depend on any other module, so there was no reason to fake it. The
*numbers inside the file* are still placeholders.

**Not built yet:** PDF export (the SOW says "PDF or CSV"). It needs a
PDF-generating library on the background side — a sensible next step once
real data exists, since there's little point polishing the layout of fake
numbers.

The mock file is written to match the exact function names and data
shapes the real backend needs (see `modules/dashboard/types/`), so
swapping it out requires **zero frontend changes**.

## Project structure

```
electron/
  main.ts              → the app's starting point
  preload.ts            → the safe bridge between on-screen app and background code
  ipc/dashboard.ipc.ts    → TEMPORARY mock backend (fake data) + REAL CSV export

modules/dashboard/
  types/
    summaries.ts         → the post / lead / SEO summary shapes
    analytics.ts          → the analytics shapes
    report.ts              → the report shape
  services/dataSync.ts   → EMPTY placeholder + the architecture question above

src/
  App.tsx                → the very top-level component
  pages/DashboardPage.tsx  → the container with the 5-tab navigation
  moduleD/components/       → Dashboard, Analytics, LeadPipeline, Reports, Integrations,
                              plus small reusable pieces: LineChart, ScoreRing, LeadStatusBadge
  store/useDashboardStore.ts → shared app state for all five screens
  index.css                   → all colors/spacing/fonts
```

See `PROJECT_GUIDE.md` for a plain-English walkthrough of every file, and
inline comments throughout every file itself.

## Setup

```bash
npm install
```

No `.env` is needed to run this right now — see `.env.example`.

## Run in development

```bash
npm run dev
```

Starts the Vite dev server, compiles the background code, and opens the
Electron window (with Developer Tools attached in a separate panel).

## Build & package

```bash
npm run build   # type-check + bundle the on-screen app + compile the background code
npm run dist     # electron-builder — produces a Windows installer under release/
```
