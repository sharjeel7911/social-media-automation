# Signal Desk — Module C (Lead Generation Engine)

Electron + React + TypeScript desktop app. This covers the Person 3 slice —
lead display, notes, CSV export, AI outreach — backed by a local SQLite
database, per SOW Section 5.

## Fixes made to the original scaffold

A few things in the initial project skeleton didn't actually work; fixed
here so `npm run build` / `npm run dev` run clean:

- `tsconfig.node.json` only included `vite.config.ts`, so `build:electron`
  compiled nothing. It now includes `electron/**/*.ts` and `modules/**/*.ts`.
- `index.html` pointed at `/src/main.jsx`, which doesn't exist — the real
  entry file is `main.tsx`.
- `.gitignore` was wrapped in a markdown code fence (```gitignore ... ```),
  which isn't valid — cleaned up to a plain ignore file.
- Removed duplicate `vite.config.js` / `vite.config.d.ts` sitting alongside
  `vite.config.ts` (stale build artifacts that shouldn't have been committed).

## Architecture

- **`electron/main.ts`** — creates the window, initializes the SQLite
  database, registers IPC handlers.
- **`electron/preload.ts`** — the only bridge the sandboxed renderer can
  use (`contextIsolation: true`, `nodeIntegration: false`). Exposes
  `window.electronAPI`.
- **`electron/ipc/*.ipc.ts`** — one file per concern: `leads.ipc.ts` (CRUD),
  `export.ipc.ts` (CSV), `outreach.ipc.ts` (AI draft).
- **`modules/leads/database/database.ts`** — all SQLite queries live here
  (via `better-sqlite3`). Nothing outside this file touches the DB file
  directly. The `.db` file itself lives in Electron's per-OS user data
  folder (`app.getPath("userData")`), not in the project folder.
- **`modules/leads/types/job.ts`** — the `Lead` / `LeadNote` types. Field
  names (snake_case) mirror the team's original Postgres/Supabase table
  design, so nothing else in the app needs to change if this ever moves
  to a hosted DB again.
- **`src/`** — the renderer: `App.tsx`, `components/`, and a Zustand store
  (`store/useLeadsStore.ts`) holding leads, filters, sort, and view state.

The Anthropic API key lives only in the main process (`.env`, loaded via
`dotenv`) — the renderer never sees it.

## What's implemented

- **Grid display**: leads render as a responsive 3-column grid of boxes
  (`src/components/LeadGrid.tsx` / `LeadBox.tsx`), each showing company,
  job title, location, remote badge, status badge, date posted, and a link
  to the posting.
- **Notes**: "Edit notes" opens a modal that fetches the existing note for
  that lead from `lead_notes` (if any), lets you edit it, and saves via
  upsert — insert if none existed, update if it did.
- **Sort**: by date posted, company, location, or status, with a direction
  toggle.
- **Filter**: by status and remote/on-site, plus free-text search across
  company/title/location. "Clear" resets all filters and sort.
- **CSV export**: exact columns requested — `Company,Job Title,Location,
  Status,Date,URL` — written via a native save dialog.
- **AI outreach**: "Generate outreach" calls the Anthropic API (server-side,
  via axios in the main process) seeded with the lead's company, title,
  location, and industry, and shows an editable draft.

## Setup

```bash
npm install
npm run rebuild          # rebuilds better-sqlite3's native binding for Electron's Node ABI — required, see note below
cp .env.example .env     # fill in ANTHROPIC_API_KEY
```

### About `npm run rebuild`

`better-sqlite3` is a native module (compiled C++), and Electron bundles its
own Node.js build with a different ABI than the Node.js you run `npm
install` with. Without this step you'll typically see an error like `NODE_MODULE_VERSION` mismatch, or the app crashing on startup with something
like `invalid ELF header` / `was compiled against a different Node.js
version`. Run `npm run rebuild` once after every `npm install` (and after
switching Node/Electron versions) to fix it. This does require your machine
to actually compile native code, so make sure you have the normal native
build toolchain available (on Windows: `npm install --global
windows-build-tools` or Visual Studio Build Tools; on macOS: Xcode Command
Line Tools; on Linux: `build-essential`/`python3`).

The database starts empty and auto-seeds with demo leads (matching the SOW's
"virtual receptionist" example) on first run — see
`modules/leads/database/seedLeads.ts`. Delete that call in `main.ts` once
Person 1/2's real connector is writing into the `leads` table.

## Run in development

```bash
npm run dev
```

Starts the Vite dev server, watches/compiles the Electron TS files, and
launches the Electron window pointed at `http://localhost:5173`.

## Build & package

```bash
npm run build   # tsc type-check + vite build (renderer) + tsc (electron)
npm run dist    # electron-builder — produces a Windows installer under release/
```

Packaging a native module like `better-sqlite3` into an installer also
requires `electron-builder`'s native-module rebuild step, which it runs
automatically as part of `npm run dist` — if that fails, run `npm run
rebuild` first and try again.

## Not in this pass (Person 1 / Person 2 scope)

- Populating `leads` from job-board connectors (Indeed, RemoteOK, etc.) and
  the LinkedIn partner API.
- Normalization, de-duplication, and saved searches.
- `modules/leads/services/{normalizer,deduplicator,filter,lead-engine}.ts`
  are left as empty stubs — untouched, since they're outside this scope.
