// ============================================================================
// WHAT IS THIS FILE?
// This is the STARTING POINT of the unified desktop app. Its jobs are:
//   1. Open the app window.
//   2. Initialize the local SQLite database for leads.
//   3. Register IPC handlers for all four modules (A, B, C, D).
// ============================================================================

import { app, BrowserWindow, dialog } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

import { initDatabase, seedIfEmpty } from "../modules/leads/database/database.js";
import { seedLeads } from "../modules/leads/database/seedLeads.js";

// Module IPC registrations
import { registerLeadsIpc } from "./ipc/leads.ipc.js";
import { registerExportIpc } from "./ipc/export.ipc.js";
import { registerOutreachIpc } from "./ipc/outreach.ipc.js";
import { registerPostsIpc } from "./ipc/posts.ipc.js";
import { registerLinkedInIpc } from "./ipc/linkedin.ipc.js";
import { registerSeoIpc } from "./ipc/seo.ipc.js";
import { registerDashboardIpc } from "./ipc/dashboard.ipc.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "Marketing Automation Platform",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "..", "..", "dist", "index.html"));
  } else {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error(`Window failed to load: ${errorDescription} (code ${errorCode})`);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  try {
    initDatabase();
    seedIfEmpty(seedLeads);

    // Register all module IPC channels
    registerLeadsIpc();
    registerExportIpc(() => mainWindow);
    registerOutreachIpc();
    registerPostsIpc();
    registerLinkedInIpc();
    registerSeoIpc();
    registerDashboardIpc(() => mainWindow);

    createWindow();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    dialog.showErrorBox("Marketing Automation Platform failed to start", message);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
