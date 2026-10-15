// ============================================================================
// ⚠️ TEMPORARY MOCK — Person 3 will replace this file.
//
// This is a stand-in for the real LinkedIn OAuth connection flow
// (modules/linkedin/auth/oauth.ts, currently an empty placeholder). It
// "connects" a made-up account after a short fake delay instead of
// actually opening LinkedIn's real login page — so:
//   - Every function below matches the name/shape Person 3's real OAuth
//     functions should have, so swapping this file for the real thing
//     requires ZERO changes to the frontend.
//   - No real LinkedIn account, login page, or access token is involved
//     anywhere in this file.
// ============================================================================

import { ipcMain } from "electron";
import type { LinkedInAccount } from "../../modules/linkedin/types/account.js";

let connectedAccount: LinkedInAccount | null = null;
// ^ Starts disconnected. Nothing is remembered between app restarts,
//   since this is only in-memory — the real version (Person 3's job) will
//   store this in SQLite so the connection survives restarts.

export function registerLinkedInIpc(): void {
  ipcMain.handle("linkedin:getAccount", () => {
    return { ok: true, account: connectedAccount };
  });

  ipcMain.handle("linkedin:connect", async () => {
    // TEMPORARY: fakes a successful login instead of really opening
    // LinkedIn's OAuth page. Person 3's real modules/linkedin/auth/oauth.ts
    // should replace this entire function body.
    await new Promise((resolve) => setTimeout(resolve, 900));
    // ^ A short fake delay, so the "Connecting…" state in the UI is
    //   actually visible instead of finishing instantly.

    connectedAccount = {
      id: 1,
      linkedin_user_id: "mock-user-123",
      name: "Jordan Ellis",
      headline: "Growth Marketing (demo account)",
      profile_picture_url: null,
      connected_at: new Date().toISOString(),
    };
    return { ok: true, account: connectedAccount };
  });

  ipcMain.handle("linkedin:disconnect", () => {
    connectedAccount = null;
    return { ok: true };
  });
}
