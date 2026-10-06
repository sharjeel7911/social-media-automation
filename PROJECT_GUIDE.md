# A Plain-English Guide to This Project

This explains what every folder and file does, in everyday language — no
coding background needed. One file (`package.json`) is explained here
instead of with inline comments, because it's read by a tool (`npm`) that
breaks if you add comments directly inside it.

## What this app actually does

It lets you write a LinkedIn post, preview exactly what it'll look like,
and either publish it immediately or schedule it for later — all from one
place, without manually logging into LinkedIn's website. There's a
calendar showing everything scheduled, and a dashboard giving you the
quick overview.

Right now the actual "talking to LinkedIn" part and the "saving
permanently" part are both temporarily faked (see README.md's "What's real
vs. what's faked" section) — but every screen works and looks finished.

## The big picture

Like most desktop apps built this way, this has two halves:

- **The "front of house" (`src/` folder)** — everything you actually see
  and click on.
- **The "back of house" (`electron/` and `modules/` folders)** — code that
  runs invisibly in the background, handling data.

The front of house is not allowed to touch your files directly — it has
to politely ask the back of house to do things for it, through a narrow,
specific doorway (`electron/preload.ts`). This is a safety measure so a
bug (or, if this were ever a web page, a malicious one) can't reach your
computer directly.

## Folder by folder

### `electron/`
- **`main.ts`** — the very first thing that runs when you open the app.
  Opens the window, turns on the two background features.
- **`preload.ts`** — the safe "doorway." Lists exactly what the on-screen
  app is allowed to ask for.
- **`ipc/posts.ipc.ts`** — handles fetching, creating, editing, deleting,
  and "publishing" posts. Currently a TEMPORARY stand-in using an
  in-memory list — see the big comment at the top of that file.
- **`ipc/linkedin.ipc.ts`** — handles connecting/disconnecting a LinkedIn
  account. Currently a TEMPORARY stand-in that fakes a successful login.

### `modules/posts/`
- **`types/post.ts`** — describes exactly what a "Post" looks like
  (its text, image, status, scheduled time, etc.) — a shared agreement
  every other file checks its work against.
- **`database/database.ts`** — empty right now. This is where the real,
  permanent database storage will go (Person 2's job).
- **`services/scheduler.ts`** — empty right now. This is where the
  background timer that actually fires off scheduled posts will go
  (Person 2's job).

### `modules/linkedin/`
- **`types/account.ts`** — describes what a connected LinkedIn account
  looks like (name, headline, profile picture, etc.).
- **`auth/oauth.ts`** — empty right now. This is where the real LinkedIn
  login flow will go (Person 3's job).
- **`api/publish.ts`** — empty right now. This is where the real call to
  actually post something to LinkedIn will go (Person 3's job).

### `src/`
- **`main.tsx`** — the starting point; finds the empty box in `index.html`
  and tells React to draw the whole app inside it.
- **`App.tsx`** — just renders the one page this whole app has.
- **`vite-env.d.ts`** — a technical helper with no real logic; teaches
  TypeScript about `window.electronAPI`.
- **`index.css`** — every color, spacing, and font choice in the app.
- **`pages/PostsPage.tsx`** — the container holding the 4-tab navigation
  (Dashboard / Calendar / Create post / Connect LinkedIn) and deciding
  which one is currently showing.
- **`moduleA/components/`**:
  - `Dashboard.tsx` — the overview screen.
  - `Calendar.tsx` — the month-grid calendar.
  - `CreatePost.tsx` — the post editor + its live preview.
  - `PostPreview.tsx` — the reusable LinkedIn-style preview card (used
    both inside the editor and when viewing a post).
  - `PostStatusBadge.tsx` — the small colored "Draft / Scheduled /
    Published / Failed" pill.
  - `LinkedInConnect.tsx` — the connect/disconnect screen.
  - `LinkedInMark.tsx` — a small "in" badge standing in for a real
    LinkedIn logo (the icon library this project uses doesn't include
    actual brand logos, since those are trademarked).
- **`store/usePostsStore.ts`** — the app's shared memory: the current
  list of posts, the connected LinkedIn account, and loading states, plus
  every action that changes them. Any screen can read from or update this.

### Top-level files
- **`index.html`** — the empty page shell the whole app gets drawn into.
- **`.env.example`** — currently just an explanation that no secret keys
  are needed yet (see the file itself for what will be needed later).
- **`.gitignore`** — tells Git which files/folders to never track (like
  `node_modules/` and build output).
- **`tsconfig.json`** — settings for TypeScript (the tool that
  double-checks our code for mistakes) as it applies to the on-screen app.
- **`tsconfig.node.json`** — the same, but for the background code
  (`electron/main.ts`, the `ipc/` files, and everything in `modules/`).
  This code runs as modern JavaScript modules, so it needs slightly
  different rules than the on-screen app.
- **`tsconfig.preload.json`** — a THIRD, separate set of TypeScript rules,
  specifically for `preload.ts`. Electron loads preload scripts through a
  special restricted mode that can only run old-style JavaScript, so that
  one file has to be compiled differently from everything else — this is
  a real, easy-to-miss trap in Electron projects, which is exactly why it
  gets its own dedicated settings file here.
- **`vite.config.ts`** — settings for Vite, the tool that runs the app
  live while developing (instant reload on save) and bundles the finished
  version.

## `package.json` — explained here since it can't hold comments

This is the project's "ID card and shopping list," read by `npm`. A few
important parts:

- **`"main"`** — tells Electron which compiled file to run when the app
  starts (`dist-electron/electron/main.js` — the built version of
  `electron/main.ts`).
- **`"scripts"`**:
  - `npm run dev` — runs the app while developing, with instant reload.
  - `npm run build` — checks for mistakes and packages the finished app.
  - `npm run dist` — produces an actual Windows installer.
- **`"dependencies"`** — packages the finished app actually needs: React
  (the on-screen framework), Zustand (shared app memory), `lucide-react`
  (icons).
- **`"devDependencies"`** — only needed while building/developing, not by
  the finished app itself: TypeScript, Vite, Electron, and the tool that
  packages everything into an installer.
- **Not included yet, but will be needed later:** `better-sqlite3` (for
  Person 2's real database) and something to make real web requests, like
  `axios` (for Person 3's real LinkedIn API calls). Adding these is part
  of building the real backend pieces, not part of this frontend.
