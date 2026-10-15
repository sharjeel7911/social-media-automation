// ============================================================================
// WHAT IS THIS FILE?
// This file listens for requests coming from the on-screen app (through
// the "doorway" set up in preload.ts) and answers them using the
// database. It handles the everyday lead actions: "show me all the
// leads," "change this lead's status," "get/save a note."
// ============================================================================

import { ipcMain } from "electron";
// ^ The background-code half of the messaging system. "ipcMain" LISTENS
//   for requests; "ipcRenderer" (used in preload.ts) SENDS them. Together
//   they're how the on-screen app and background code talk safely.

import {
  getAllLeads,
  updateLeadStatus,
  getNoteForLead,
  saveNoteForLead,
} from "../../modules/leads/database/database.js";
// ^ The actual database functions that do the real work — this file just
//   connects requests to them.

import type { LeadStatus } from "../../modules/leads/types/job.js";
// ^ Borrowing the definition of what a valid "status" value looks like.

export function registerLeadsIpc(): void {
  // This function turns on all the "listeners" below. It gets called
  // once, when the app starts up (see main.ts).

  ipcMain.handle("leads:getAll", () => {
    // When the on-screen app asks for "leads:getAll", run this and send
    // back whatever it returns.
    return getAllLeads();
  });

  ipcMain.handle("leads:updateStatus", (_event, id: number, status: LeadStatus) => {
    // When asked to update a status, do it, then reply with { ok: true }
    // so the on-screen app knows it worked.
    // (The first parameter, "_event", is technical info about the
    // request itself that we don't need, so its name starts with an
    // underscore as a hint that we're intentionally ignoring it.)
    updateLeadStatus(id, status);
    return { ok: true };
  });

  ipcMain.handle("leads:getNote", (_event, leadId: number) => {
    // Look up whether this lead already has a note, and send it back
    // (or send back "null" if there isn't one yet).
    const note = getNoteForLead(leadId);
    return { ok: true, note };
  });

  ipcMain.handle("leads:saveNote", (_event, leadId: number, text: string) => {
    // Save this note text for this lead (creating or updating it as
    // needed), then send back the saved note.
    const note = saveNoteForLead(leadId, text);
    return { ok: true, note };
  });
}
