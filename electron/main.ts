// ============================================================================
// WHAT IS THIS FILE?
// This is the STARTING POINT of the whole desktop app — the very first
// code that runs when someone double-clicks the app. Its jobs are:
//   1. Open the app's window.
//   2. Turn on the two background features (posts, LinkedIn connection)
//      so the on-screen part of the app can use them.
// Nothing in this file draws anything on screen — it just sets the stage.
// ============================================================================

import { app, BrowserWindow, dialog } from "electron";
// ^ "app" controls the whole application (start it, quit it, etc).
//   "BrowserWindow" is the actual window that appears on your screen.
//   "dialog" lets us pop up a native message box — used below so that if
//   something goes wrong while starting up, you SEE an error instead of
//   the app just quietly failing to work.

import path from "node:path";
import { fileURLToPath } from "node:url";
// ^ Used just below to figure out which folder this very file is sitting in.

import { registerPostsIpc } from "./ipc/posts.ipc.js";
// ^ Turns on the feature that lets the on-screen app fetch, create, edit,
//   delete, and publish posts. (Currently a TEMPORARY in-memory mock —
//   see that file's comments.)

import { registerLinkedInIpc } from "./ipc/linkedin.ipc.js";
// ^ Turns on the feature that lets the on-screen app connect, check, and
//   disconnect a LinkedIn account. (Currently a TEMPORARY in-memory mock
//   — see that file's comments.)

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ^ Figures out the folder this file lives in once it's up and running,
//   so we can reliably find other files (like preload.js) sitting next to it.

let mainWindow: BrowserWindow | null = null;
// ^ A variable to keep track of our one app window. It starts as "null"
//   (meaning "no window yet") until createWindow() below actually makes one.

function createWindow() {
  // This function builds and opens the actual app window.

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    // ^ The window's starting size, in pixels.
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // ^ Loads our "preload" script (explained in preload.ts) before
      //   anything else, so the on-screen app can safely talk to this
      //   background code.
      contextIsolation: true,
      // ^ A safety wall: keeps the on-screen app's code separate from this
      //   powerful background code, so a bug or malicious webpage can't
      //   reach your files or secrets directly.
      nodeIntegration: false,
      // ^ Also for safety: stops the on-screen app from directly running
      //   system-level commands. It has to go through the safe messaging
      //   system (the "ipc" files) instead.
    },
  });

  if (app.isPackaged) {
    // "Packaged" means this is the finished, installed app (not us
    // developing it). In that case, load the already-built files.
    mainWindow.loadFile(path.join(__dirname, "..", "..", "dist", "index.html"));
  } else {
    // While developing, load the live preview server instead, which
    // refreshes instantly every time we save a change.
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
    // ^ Automatically opens the Developer Tools panel (in its own
    //   separate window) every time we're developing, so you never have
    //   to remember a keyboard shortcut. Does NOT run in the packaged app.
  }

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    // If the app window fails to even load its own page (for example,
    // because the dev server at localhost:5173 isn't running yet), print
    // exactly why to the terminal instead of just showing a blank window.
    console.error(`Window failed to load: ${errorDescription} (code ${errorCode})`);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Everything in here runs once Electron has finished starting up.
  try {
    registerPostsIpc();
    registerLinkedInIpc();
    // Turn on both messaging systems described above.

    createWindow();
    // Finally, actually open the app window.
  } catch (err) {
    // If ANYTHING above throws an error, show it in a visible popup
    // instead of silently failing with no window and no explanation.
    const message = err instanceof Error ? err.message : String(err);
    dialog.showErrorBox("Module A failed to start", message);
    app.quit();
  }

  app.on("activate", () => {
    // On Mac, clicking the app's icon in the dock after all windows are
    // closed should reopen a window instead of doing nothing.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // What to do when every window has been closed.
  if (process.platform !== "darwin") {
    // On Windows/Linux, closing all windows should quit the app entirely.
    // ("darwin" is the technical name for macOS — Mac apps conventionally
    // stay running in the dock even with no windows open, so we skip
    // quitting there.)
    app.quit();
  }
});
