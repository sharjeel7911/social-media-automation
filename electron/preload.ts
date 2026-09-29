// ============================================================================
// WHAT IS THIS FILE?
// This is a SAFE GO-BETWEEN connecting the on-screen app (which the user
// can click around in) with the powerful background code (which can read
// files, talk to the database, and call the AI). Without this file, the
// on-screen app would either have NO access to any of that (useless), or
// FULL access to your entire computer (dangerous). This file opens a
// narrow, specific doorway: only the exact features listed below, nothing
// more.
//
// IMPORTANT TECHNICAL NOTE: Electron loads preload scripts through a
// special restricted "sandbox" that only understands the OLD-style
// "require()" way of importing code, not the modern "import" syntax the
// rest of this project uses. So unlike every other file, this one gets
// compiled completely separately (see tsconfig.preload.json) into
// old-style code, and — on purpose — doesn't import anything from other
// files in this project (like modules/leads/types/job.ts), even though
// that would normally be totally fine. Instead, the few small type shapes
// it needs are simply written out again below. If you change the "Lead"
// or "LeadNote" shape in modules/leads/types/job.ts, update the matching
// shape here too.
// ============================================================================

import { contextBridge, ipcRenderer } from "electron";
// ^ "contextBridge" is what lets us safely expose a few specific functions
//   to the on-screen app. "ipcRenderer" is what actually sends a request
//   over to the background code and waits for its answer
//   ("ipc" = "inter-process communication", a fancy way of saying
//   "message-passing between two separate programs running side by side").

type LeadStatus = "New" | "Contacted" | "Replied" | "Qualified" | "Won" | "Lost";
// ^ A stand-alone copy of the same status list from modules/leads/types/job.ts.

interface Lead {
  // A stand-alone copy of the "Lead" shape, just for describing what goes
  // in and out of the functions below — see the note above for why.
  id: number;
  created_at: string;
  raw_job_id: number | null;
  source_id: number | null;
  external_job_id: string | null;
  company_name: string;
  company_domain: string | null;
  job_title: string;
  job_url: string;
  location: string | null;
  date_posted: string | null;
  description: string | null;
  industry: string | null;
  remote_only: boolean;
  employment_type: string | null;
  deduplication_key: string | null;
  status: LeadStatus;
  updated_at: string;
}

interface LeadNote {
  id: number;
  created_at: string;
  lead_id: number;
  note: string;
  updated_at: string;
}

export interface ElectronAPI {
  // This describes exactly what functions we're allowing the on-screen
  // app to call, and what kind of information goes in and comes back out
  // of each one. Think of it as a menu of allowed actions.
  ping: () => string;
  getLeads: () => Promise<Lead[]>;
  updateLeadStatus: (id: number, status: LeadStatus) => Promise<{ ok: boolean }>;
  getNote: (leadId: number) => Promise<{ ok: boolean; note: LeadNote | null }>;
  saveNote: (leadId: number, text: string) => Promise<{ ok: boolean; note: LeadNote }>;
  exportLeads: (
    leads: Lead[]
  ) => Promise<{ ok: boolean; canceled?: boolean; filePath?: string; error?: string }>;
  generateOutreach: (lead: Lead) => Promise<{ ok: boolean; text?: string; error?: string }>;
}

const api: ElectronAPI = {
  // Here's the ACTUAL code behind each item on that "menu" above. Every
  // one of these just quietly forwards the request to the background code
  // and hands back whatever answer comes back.

  ping: () => "pong",
  // A tiny test function — if you call this and get back "pong", you know
  // the connection between the on-screen app and background code is working.

  getLeads: () => ipcRenderer.invoke("leads:getAll"),
  // Asks the background code: "give me every lead in the database."

  updateLeadStatus: (id, status) => ipcRenderer.invoke("leads:updateStatus", id, status),
  // Asks the background code: "change this lead's status (like from
  // 'New' to 'Contacted')."

  getNote: (leadId) => ipcRenderer.invoke("leads:getNote", leadId),
  // Asks the background code: "does this lead already have a note? If so,
  // send it to me."

  saveNote: (leadId, text) => ipcRenderer.invoke("leads:saveNote", leadId, text),
  // Asks the background code: "save this note text for this lead" (it
  // will create a new note or update the existing one, whichever applies).

  exportLeads: (leads) => ipcRenderer.invoke("leads:export", leads),
  // Asks the background code: "let the user pick a save location, then
  // write these leads out as a CSV file there."

  generateOutreach: (lead) => ipcRenderer.invoke("leads:generateOutreach", lead),
  // Asks the background code: "write me an outreach message for this
  // specific lead" (which then asks the AI on our behalf).
};

contextBridge.exposeInMainWorld("electronAPI", api);
// ^ This is the actual "opening the doorway" step. From this point on,
//   the on-screen app can call things like window.electronAPI.getLeads()
//   and it will work — but it CANNOT do anything beyond what's listed
//   above. Everything else about your computer stays off-limits to it.
