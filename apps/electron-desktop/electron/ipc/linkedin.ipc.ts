// ============================================================================
// WHAT IS THIS FILE?
// IPC handler for LinkedIn account connection, disconnection, and profile fetching.
//
// Backed by:
//   - modules/linkedin/auth/oauth.ts (OAuth 2.0 flow & authentication)
//   - modules/linkedin/database/accountDatabase.ts (SQLite persistence in signal-desk.db)
//
// State is persisted in SQLite across app restarts and safely exposes public
// account info to the renderer process.
// ============================================================================

import { ipcMain } from "electron";
import {
  authenticateLinkedIn,
  disconnectLinkedIn,
  getCurrentLinkedInAccount,
} from "../../modules/linkedin/auth/oauth.js";

export function registerLinkedInIpc(): void {
  ipcMain.handle("linkedin:getAccount", () => {
    try {
      const account = getCurrentLinkedInAccount();
      return { ok: true, account };
    } catch (err: any) {
      console.error("Error fetching LinkedIn account:", err);
      return { ok: false, account: null, error: err.message };
    }
  });

  ipcMain.handle("linkedin:connect", async () => {
    try {
      const account = await authenticateLinkedIn();
      return { ok: true, account };
    } catch (err: any) {
      console.error("LinkedIn OAuth connection failed:", err);
      return { ok: false, error: err.message || "Failed to connect LinkedIn account." };
    }
  });

  ipcMain.handle("linkedin:disconnect", async () => {
    try {
      await disconnectLinkedIn();
      return { ok: true };
    } catch (err: any) {
      console.error("LinkedIn disconnect failed:", err);
      return { ok: false, error: err.message };
    }
  });
}
