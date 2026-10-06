# Module A — Social Publisher

Electron + React + TypeScript desktop app. This is the **Person 1 slice**
of Module A from the project's Statement of Work: the complete frontend —
Dashboard, Calendar, Create Post (with a live preview), and LinkedIn
connection. This is a **fully standalone project** — it shares no code,
folders, or database with Module C (the separate lead-tracking app);
it's its own independent `package.json` and repo.

## What is Module A, in plain terms?

The idea: instead of manually logging into LinkedIn every time you want
to post something, you write your post once in this app, see exactly
what it'll look like, and either publish it right away or schedule it
for later — all from one place. Eventually (per the SOW) this extends to
other platforms (Facebook, Instagram, etc.), but this phase of the
project is scoped to LinkedIn only.

The work is split three ways:
- **Person 1 (this project): the entire visible app.** Every screen you
  click through — Dashboard, Calendar, the post editor, the LinkedIn
  connect screen.
- **Person 2: the real database.** Right now, posts are stored in a
  plain in-memory list that resets every time you close the app. Person
  2 will replace that with a real, permanent SQLite database.
- **Person 3: the real LinkedIn connection.** Right now, clicking
  "Connect LinkedIn" doesn't talk to LinkedIn at all — it just fakes a
  successful login after a short delay. Person 3 will replace that with
  a real LinkedIn login flow and real publishing.

## What's real vs. what's (deliberately) faked right now

Every SCREEN in this project is fully built and works end to end. What's
temporarily faked is the two things listed above, both isolated into
exactly two files:

- **`electron/ipc/posts.ipc.ts`** — stores posts in a plain JavaScript
  array in memory instead of a real database. You can create, edit,
  delete, schedule, and "publish" posts, and it all works — it just
  doesn't survive restarting the app yet.
- **`electron/ipc/linkedin.ipc.ts`** — "connects" a made-up demo LinkedIn
  account (name: "Jordan Ellis") after a short fake delay, instead of
  really opening LinkedIn's login page.

Both files are written to match the exact function names and data shapes
that the REAL versions need to have. This means: once Person 2 and Person
3 build the real versions, they can swap in their own files and **nothing
in this frontend needs to change at all** — the shapes are already agreed
on (see `modules/posts/types/post.ts` and
`modules/linkedin/types/account.ts`).

## The four screens

- **Dashboard** — LinkedIn connection status, counts of scheduled/
  published/draft posts, and short lists of what's coming up and what
  recently went out. Click any post to open and edit it.
- **Calendar** — a real month grid. Every scheduled or published post
  shows as a small colored tag on its date. Click a tag to open that
  post, or the small "+" on any day to start a new post pre-dated for
  that day.
- **Create post** — the editor: post text (with a live character count
  against LinkedIn's real 3,000-character limit), an optional image URL,
  and a choice of Save as draft / Schedule / Publish now — with a live
  preview alongside showing exactly what the post will look like.
- **Connect LinkedIn** — connect or disconnect the LinkedIn account.
  Without one connected, "Publish now" is disabled (but drafting and
  scheduling still work).

## Project structure

```
electron/            → the background code (window setup, IPC handlers)
  main.ts             → the app's starting point
  preload.ts           → the safe bridge between on-screen app and background code
  ipc/
    posts.ipc.ts        → TEMPORARY mock posts backend (Person 2 replaces)
    linkedin.ipc.ts      → TEMPORARY mock LinkedIn backend (Person 3 replaces)

modules/              → shared data shapes + where the real backend logic will live
  posts/
    types/post.ts        → the "Post" shape (the contract both frontend and Person 2 build against)
    database/database.ts → EMPTY placeholder for Person 2's real SQLite storage
    services/scheduler.ts→ EMPTY placeholder for Person 2's background auto-publish timer
  linkedin/
    types/account.ts     → the "LinkedInAccount" shape
    auth/oauth.ts         → EMPTY placeholder for Person 3's real LinkedIn login flow
    api/publish.ts         → EMPTY placeholder for Person 3's real publishing calls

src/                  → the on-screen app
  App.tsx               → the very top-level component
  pages/PostsPage.tsx    → the container with the 4-tab navigation
  moduleA/components/    → Dashboard, Calendar, CreatePost, PostPreview, LinkedInConnect, etc.
  store/usePostsStore.ts → shared app state (the current posts, LinkedIn account, loading flags)
  index.css               → all colors/spacing/fonts
```

See `PROJECT_GUIDE.md` for a plain-English walkthrough of every file, and
inline comments throughout every file itself.

## Setup

```bash
npm install
```

No `.env` setup is required to run this right now — see `.env.example`
for what will need to be added once Person 3 builds the real LinkedIn
connection.

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

## Notes for whoever builds the real backend pieces

**Person 2** (real database): replace `modules/posts/database/database.ts`
(currently empty) with real SQLite storage — see Module C's
`modules/leads/database/database.ts` in the other project for the exact
pattern this codebase already uses (same `better-sqlite3` library, same
style). Then update `electron/ipc/posts.ipc.ts` to call your real
functions instead of using the in-memory array — the IPC channel names
(`posts:getAll`, `posts:create`, etc.) and what they return should stay
the same, since the frontend already expects those exact shapes.

**Person 3** (real LinkedIn): replace `modules/linkedin/auth/oauth.ts` and
`modules/linkedin/api/publish.ts` (currently empty) with the real OAuth
flow and publishing calls, then update `electron/ipc/linkedin.ipc.ts` and
the `publishPostNow` handler in `posts.ipc.ts` to call your real code
instead of faking success. Real LinkedIn API access requires registering
an app on LinkedIn's developer portal first (see SOW Section 6 — this has
its own approval lead time, separate from the coding work).
