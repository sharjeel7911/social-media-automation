// ============================================================================
// WHAT IS THIS FILE?
// This is the STARTING POINT of the whole desktop app — the very first
// code that runs when someone double-clicks Signal Desk. Its jobs are:
//   1. Open the app's window.
//   2. Turn on the local database.
//   3. Turn on all the "backend" features (saving notes, exporting CSV,
//      asking the AI to write outreach messages) so the on-screen part
//      of the app can use them.
// Nothing in this file draws anything on screen — it just sets the stage.
// ============================================================================

import { app, BrowserWindow, dialog } from "electron";
// ^ "app" controls the whole application (start it, quit it, etc).
//   "BrowserWindow" is the actual window that appears on your screen —
//   like opening a new Chrome window, but it's our app inside it.
//   "dialog" lets us pop up a native message box — used below so that if
//   something goes wrong while starting up, you SEE an error instead of
//   the app just quietly failing to work.

import path from "node:path";
// ^ A built-in tool for building file paths (like folder/subfolder/file)
//   in a way that works correctly on Windows, Mac, and Linux, even though
//   they use slashes differently.

import { fileURLToPath } from "node:url";
// ^ A small helper used just below to figure out which folder this very
//   file is sitting in.

import dotenv from "dotenv";
// ^ A tool that reads the ".env" file (your secret settings, like the AI
//   key) and makes those values available to the rest of this file.

import { initDatabase, seedIfEmpty } from "../modules/leads/database/database.js";
// ^ Brings in two functions from our database file:
//   - initDatabase: turns on/connects to the local database file.
//   - seedIfEmpty: fills the database with sample leads ONLY if it's
//     completely empty, so the app isn't blank the first time you open it.

import { seedLeads } from "../modules/leads/database/seedLeads.js";
// ^ The actual list of sample/demo leads used by seedIfEmpty above.

import { registerLeadsIpc } from "./ipc/leads.ipc.js";
// ^ Turns on the messaging system that lets the on-screen part of the app
//   ask for leads, change a lead's status, and read/save notes.

import { registerExportIpc } from "./ipc/export.ipc.js";
// ^ Turns on the feature that lets the on-screen part of the app ask this
//   background code to save a CSV file to your computer.

import { registerOutreachIpc } from "./ipc/outreach.ipc.js";
// ^ Turns on the feature that lets the on-screen part of the app ask this
//   background code to generate an AI outreach message.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ^ Figures out the folder this file lives in once it's up and running,
//   so we can reliably find other files (like preload.js) sitting next to it.

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
// ^ Actually loads your secret .env file's contents (like ANTHROPIC_API_KEY)
//   so the rest of the app can use them. The "..", ".." part is just
//   "go up two folders" to reach the project's main folder where .env lives.

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
    //   to remember a keyboard shortcut or worry about which window has
    //   focus. This line does NOT run in the packaged/finished app.
  }

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    // If the app window fails to even load its own page (for example,
    // because the dev server at localhost:5173 isn't running yet), print
    // exactly why to the terminal instead of just showing a blank window
    // with no explanation.
    console.error(`Window failed to load: ${errorDescription} (code ${errorCode})`);
  });

  mainWindow.on("closed", () => {
    // When the user closes the window, forget about it (free up memory).
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Everything in here runs once Electron has finished starting up.
  try {
    initDatabase();
    // Turn on the local database.

    seedIfEmpty(seedLeads);
    // If the database is empty, fill it with demo leads so there's
    // something to look at.

    registerLeadsIpc();
    registerExportIpc(() => mainWindow);
    registerOutreachIpc();
    // Turn on the three messaging systems described above. Export needs to
    // know which window to show the "Save File" popup on, so we pass it a
    // tiny function that always returns the current window.

    createWindow();
    // Finally, actually open the app window.
  } catch (err) {
    // If ANYTHING above throws an error, show it in a visible popup
    // instead of silently failing with no window and no explanation.
    // This is exactly the kind of problem that's hard to diagnose
    // otherwise — a broken database, a locked file, a bad path — so we
    // make sure it's never invisible.
    const message = err instanceof Error ? err.message : String(err);
    dialog.showErrorBox("Signal Desk failed to start", message);
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
