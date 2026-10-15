// ============================================================================
// WHAT IS THIS FILE?
// This is the ONLY file in the whole app that directly talks to the
// database. Every other file that needs to read or save lead/note data
// goes through the functions defined here instead of touching the
// database itself. This keeps things organized — if we ever needed to
// change HOW we store data (say, moving to a different kind of database
// later), we'd only need to rewrite this one file, and nothing else in
// the app would need to change.
//
// We're using something called "SQLite" here, which stores the whole
// database as a single file on your computer (no separate database
// program needs to be running) — simple and reliable for a desktop app
// like this one.
// ============================================================================

import Database from "better-sqlite3";
// ^ The tool/library that actually knows how to read and write SQLite
//   database files.

import path from "node:path";
import { app } from "electron";
// ^ Used to find a safe, standard folder on the user's computer to store
//   our database file in.

import type { Lead, LeadNote, LeadStatus } from "../types/job.js";
// ^ Borrowing the shapes defined in job.ts.

let db: Database.Database | null = null;
// ^ This variable will hold our open connection to the database file,
//   once initDatabase() (below) has been run. It starts as "null"
//   (meaning "not connected yet").

interface LeadRow {
  // This describes exactly what a row looks like as SQLite hands it back
  // to us — almost identical to "Lead" from job.ts, except SQLite doesn't
  // have a true yes/no (boolean) type, so "remote_only" is stored as the
  // number 0 (no) or 1 (yes) instead.
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
  remote_only: number;
  employment_type: string | null;
  deduplication_key: string | null;
  status: LeadStatus;
  updated_at: string;
}

export function initDatabase(): void {
  // Call this once, when the app starts, to open (or create, if it
  // doesn't exist yet) the database file and make sure our tables exist.

  const dbPath = path.join(app.getPath("userData"), "signal-desk.db");
  // ^ "userData" is a special folder Electron sets aside for each app to
  //   store its own files — different on every operating system, but
  //   Electron figures out the right spot automatically. Our database
  //   file will be called "signal-desk.db" inside it.

  db = new Database(dbPath);
  // ^ Opens the connection to that file (creating an empty one if it
  //   doesn't exist yet).

  db.pragma("journal_mode = WAL");
  // ^ A performance/safety setting that makes reading and writing to the
  //   database faster and less likely to get corrupted if the app closes
  //   unexpectedly.

  db.pragma("foreign_keys = ON");
  // ^ Turns on a safety rule: you can't have a note that points to a lead
  //   that doesn't exist. Keeps the data consistent.

  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      raw_job_id INTEGER,
      source_id INTEGER,
      external_job_id TEXT,
      company_name TEXT NOT NULL,
      company_domain TEXT,
      job_title TEXT NOT NULL,
      job_url TEXT NOT NULL,
      location TEXT,
      date_posted TEXT,
      description TEXT,
      industry TEXT,
      remote_only INTEGER NOT NULL DEFAULT 0,
      employment_type TEXT,
      deduplication_key TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'New',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lead_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      note TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_lead_notes_leadId ON lead_notes(lead_id);
  `);
  // ^ This whole block is written in SQL (the language databases
  //   understand) and says: "Create a 'leads' table and a 'lead_notes'
  //   table with these exact columns, but ONLY if they don't already
  //   exist" — so running this over and over (every time the app starts)
  //   is completely safe and won't wipe out existing data.
  //   The last line creates an "index," which is like the index at the
  //   back of a book — it makes looking up a lead's notes much faster.
}

function getDb(): Database.Database {
  // A little safety-check helper used by every function below: makes
  // sure initDatabase() was actually called before anyone tries to use
  // the database, and gives a clear error message if not.
  if (!db) throw new Error("Database not initialized — call initDatabase() first.");
  return db;
}

function rowToLead(row: LeadRow): Lead {
  // Converts a raw database row into our nicer "Lead" shape — mainly,
  // turning the 0/1 number back into a proper true/false value for
  // "remote_only".
  return { ...row, remote_only: !!row.remote_only };
  // ^ "{ ...row }" copies every field from row as-is, then we overwrite
  //   just the remote_only field. "!!" is a quick trick to turn any
  //   number into true/false (0 becomes false, anything else becomes true).
}

export function getAllLeads(): Lead[] {
  // Fetches every single lead in the database, newest job posting first.
  const rows = getDb().prepare("SELECT * FROM leads ORDER BY date_posted DESC").all() as LeadRow[];
  return rows.map(rowToLead);
  // ^ Runs that conversion (above) on every row before handing them back.
}

export function updateLeadStatus(id: number, status: LeadStatus): void {
  // Changes one lead's status (like moving it from "New" to "Contacted"),
  // and updates its "last changed" timestamp at the same time.
  getDb()
    .prepare("UPDATE leads SET status = ?, updated_at = ? WHERE id = ?")
    .run(status, new Date().toISOString(), id);
  // ^ The "?" marks are placeholders — the actual values are filled in
  //   safely afterward. This prevents a class of security bug called "SQL
  //   injection," where someone could sneak harmful text into a query.
}

// Called by Person 1/2's pipeline once a posting has been normalized and
// de-duplicated. Inserts if new (by deduplication_key); otherwise a no-op,
// leaving any existing status/notes untouched.
export function upsertLead(lead: Omit<Lead, "created_at" | "updated_at" | "id"> & { id?: number }): void {
  // "Upsert" = "update if it exists, insert if it doesn't" (a mashed-
  // together word for the two actions). Here it always tries to insert a
  // new lead, but if one with the same deduplication_key already exists,
  // it just quietly does nothing instead of creating a duplicate.
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO leads (created_at, raw_job_id, source_id, external_job_id, company_name, company_domain, job_title, job_url, location, date_posted, description, industry, remote_only, employment_type, deduplication_key, status, updated_at)
       VALUES (@created_at, @raw_job_id, @source_id, @external_job_id, @company_name, @company_domain, @job_title, @job_url, @location, @date_posted, @description, @industry, @remote_only, @employment_type, @deduplication_key, @status, @updated_at)
       ON CONFLICT(deduplication_key) DO NOTHING`
    )
    .run({
      ...lead,
      remote_only: lead.remote_only ? 1 : 0,
      // ^ Flip true/false back into 1/0 since that's what SQLite actually stores.
      created_at: now,
      updated_at: now,
    });
}

export function getNoteForLead(leadId: number): LeadNote | null {
  // Looks up whether this lead already has a note. If it has more than
  // one for some reason, we just grab the newest one. If it has none at
  // all, we return "null" (meaning "nothing found") instead of crashing.
  const row = getDb()
    .prepare("SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC LIMIT 1")
    .get(leadId) as LeadNote | undefined;
  return row ?? null;
}

// Upsert-by-lead: updates the existing note if one exists for this lead,
// otherwise inserts a new row.
export function saveNoteForLead(leadId: number, text: string): LeadNote {
  const existing = getNoteForLead(leadId);
  const now = new Date().toISOString();

  if (existing) {
    // A note already exists for this lead — just update its text.
    getDb().prepare("UPDATE lead_notes SET note = ?, updated_at = ? WHERE id = ?").run(text, now, existing.id);
    return { ...existing, note: text, updated_at: now };
  }

  // No note exists yet — create a brand new one.
  const info = getDb()
    .prepare("INSERT INTO lead_notes (created_at, lead_id, note, updated_at) VALUES (?, ?, ?, ?)")
    .run(now, leadId, text, now);
  return { id: Number(info.lastInsertRowid), created_at: now, lead_id: leadId, note: text, updated_at: now };
  // ^ "lastInsertRowid" tells us the auto-generated ID number SQLite just
  //   gave this brand new note, so we can hand back a complete note object.
}

// Dev/demo convenience so the UI has something to show before Person 1's
// connector is wired up. Only inserts if the table is empty.
export function seedIfEmpty(seed: Array<Omit<Lead, "created_at" | "updated_at" | "id">>): void {
  const { count } = getDb().prepare("SELECT COUNT(*) as count FROM leads").get() as { count: number };
  // ^ Counts how many leads currently exist in the database.

  if (count > 0) return;
  // ^ If there's already at least one lead, don't add the demo data — the
  //   app already has real data to show.

  const insert = getDb().transaction((leads: typeof seed) => {
    for (const lead of leads) upsertLead(lead);
  });
  // ^ A "transaction" bundles many inserts together as one all-or-nothing
  //   action — either all the demo leads get added, or (if something goes
  //   wrong partway through) none of them do. This also makes inserting
  //   many rows at once much faster.

  insert(seed);
  // ^ Actually runs it with our list of sample leads.
}
