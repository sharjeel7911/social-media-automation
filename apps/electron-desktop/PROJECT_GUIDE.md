# A Plain-English Guide to This Project

This explains what every folder and file does, in everyday language —
no coding background needed. Two files (`package.json` and
`package-lock.json`) are explained here instead of with inline comments,
because those files are read by tools (`npm`) that break if you add
comments directly inside them.

## The big picture

This is a desktop app (built with a tool called **Electron**, which is how
apps like Slack and VS Code are made — a real app window, not a website).
It has two halves that work together:

- **The "front of house" (`src/` folder)** — everything you actually see
  and click on: the grid of job leads, the buttons, the pop-up windows.
- **The "back of house" (`electron/` and `modules/` folders)** — code that
  runs invisibly in the background: talking to the database, saving
  files to your computer, and calling the AI.

These two halves are kept deliberately separate for safety — the "front
of house" is not allowed to touch your files or secrets directly. It has
to politely ask the "back of house" to do things for it, through a very
narrow, specific doorway (`electron/preload.ts`).

## Folder by folder

### `electron/`
The code that starts the app and runs behind the scenes.
- **`main.ts`** — the very first thing that runs when you open the app.
  Opens the window, turns on the database, turns on all the background
  features.
- **`preload.ts`** — the safe "doorway" between what you see on screen and
  the background code. Lists exactly which actions the on-screen app is
  allowed to ask for.
- **`ipc/`** — a folder of files, one per feature, that actually carry out
  requests coming through that doorway:
  - `leads.ipc.ts` — fetching leads, changing status, reading/saving notes.
  - `export.ipc.ts` — saving leads as a CSV file.
  - `outreach.ipc.ts` — asking the AI to write an outreach message.

### `modules/leads/`
The "brains" of the lead-tracking feature — kept separate from the
Electron-specific plumbing above so it's more organized and easier for
different people on the team to work on their own piece.
- **`types/job.ts`** — describes exactly what information a "Lead" and a
  "Note" contain (company name, job title, status, etc.) — like a form
  template every other file checks its work against.
- **`database/database.ts`** — the only file that actually talks to the
  database. Every other file goes through the functions defined here.
- **`database/seedLeads.ts`** — a list of made-up sample leads, just so the
  app has something to show before real data is flowing in.
- **`services/`** — four currently-empty files reserved for teammates'
  work: finding job postings that match what you're looking for
  (`filter.ts`), cleaning up messy data into our standard shape
  (`normalizer.ts`), removing duplicate postings (`deduplicator.ts`), and
  the "conductor" that runs all of that in order (`lead-engine.ts`).

### `src/`
Everything that actually appears on screen.
- **`main.tsx`** — the starting point; finds the empty box in `index.html`
  and tells React to draw the whole app inside it.
- **`App.tsx`** — the top-level component. Loads the leads when the app
  opens and arranges the toolbar, the grid, and the pop-up windows.
- **`vite-env.d.ts`** — a technical helper file with no real logic in it;
  just teaches TypeScript about a feature (`window.electronAPI`) that
  isn't set up the "normal" way.
- **`index.css`** — the stylesheet: every color, spacing, and font choice
  in the app lives here.
- **`components/`** — one file per reusable piece of the screen:
  - `Toolbar.tsx` — the search box, filters, sort dropdown, and buttons at
    the top.
  - `LeadGrid.tsx` — arranges all the lead boxes into the 3-column grid.
  - `LeadBox.tsx` — a single lead's box (company, title, status, buttons).
  - `StageBadge.tsx` — the small colored "New / Contacted / Won" pill.
  - `NotesModal.tsx` — the pop-up for reading/writing a lead's note.
  - `OutreachModal.tsx` — the pop-up for generating an AI outreach message.
- **`store/useLeadsStore.ts`** — the app's shared memory: the current list
  of leads, search text, filters, and sort order, plus the actions that
  change them. Any part of the on-screen app can read from or update this.
- **`utils/format.ts`** — small helper functions for turning raw dates into
  friendlier text (like "Aug 29, 2026" or "3 days ago").

### Top-level files
- **`index.html`** — the empty page shell the whole app gets drawn into.
- **`.env.example`** — a template showing what your real, secret `.env`
  file should contain. Copy it to `.env` and fill in your real API key.
- **`.gitignore`** — tells Git which files/folders to never track or
  upload (things like `node_modules/`, build output, and your secrets).
- **`tsconfig.json`** / **`tsconfig.node.json`** — settings for
  TypeScript, the tool that double-checks our code for mistakes before it
  even runs. There are two because the on-screen code and the background
  code run in slightly different environments with different rules.
- **`vite.config.ts`** — settings for Vite, the tool that runs the app
  while developing (with instant reload) and packages the finished
  version.

## `package.json` — explained here since it can't hold comments

This file is the project's "ID card and shopping list," read by `npm`
(the tool that installs all our dependencies). A few of the important
parts:

- **`"main"`** — tells Electron which compiled file to actually run when
  the app starts (`dist-electron/electron/main.js` — the built version of
  `electron/main.ts`).
- **`"scripts"`** — shortcuts for common commands:
  - `npm run dev` — runs the app while you're developing it, with instant
    reload on save.
  - `npm run build` — checks for mistakes and packages the finished app.
  - `npm run rebuild` — re-compiles the database library
    (`better-sqlite3`) specifically for Electron. Needed after every
    `npm install` — see the README for why.
  - `npm run dist` — produces an actual installer (like a `.exe`) other
    people can download and run.
- **`"dependencies"`** — the packages the finished app actually needs to
  run: React (the on-screen framework), Zustand (shared memory), axios
  (for calling the AI), `better-sqlite3` (our local database),
  `lucide-react` (icons), `dotenv` (reads the `.env` file).
- **`"devDependencies"`** — packages only needed while building/developing
  the app, not by the finished product itself: TypeScript, Vite, Electron
  itself, and the tools that package everything into an installer.
- **`"build"`** — settings for `electron-builder`, the tool that turns
  everything into a proper Windows installer.

## `package-lock.json` — explained here too

You never need to read or edit this file by hand — it's automatically
generated and updated every time you run `npm install`. It records the
*exact* version of every single package (and every package THOSE packages
depend on, and so on) that got installed, down to the smallest detail.
Its whole purpose is making sure that if you and a teammate both run
`npm install`, you both end up with the identical set of code — instead
of npm quietly picking slightly different versions on different
computers, which can cause "works on my machine" bugs. Just leave it
alone and let npm manage it.
