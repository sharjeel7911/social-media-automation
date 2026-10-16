// ============================================================================
// WHAT IS THIS FILE?
// SQLite-backed storage for connected LinkedIn accounts.
//
// Following the exact same architecture as modules/leads/database/database.ts:
//   - Uses better-sqlite3 with WAL mode and safe parameterized queries.
//   - Stores LinkedIn account credentials safely (access token, refresh token,
//     expiration, user URN/id, display name, headline, avatar).
//   - Exposes clean methods that return the public LinkedInAccount shape
//     (safe for renderer — secret token is never leaked across IPC) while
//     providing getConnectedAccountCredentials() internally for LinkedIn
//     publishing and OAuth token refresh.
// ============================================================================

import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { app } from "electron";
import type { LinkedInAccount } from "../types/account.js";

let db: Database.Database | null = null;

export interface LinkedInAccountRow {
  id: number;
  linkedin_user_id: string;
  name: string;
  headline: string | null;
  profile_picture_url: string | null;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  scope: string | null;
  connected_at: string;
  updated_at: string;
}

export function initLinkedInDatabase(): void {
  const userDir = app.getPath("userData");
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  const dbPath = path.join(userDir, "signal-desk.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS linkedin_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      linkedin_user_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      headline TEXT,
      profile_picture_url TEXT,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_at TEXT,
      scope TEXT,
      connected_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

function getDb(): Database.Database {
  if (!db) {
    initLinkedInDatabase();
  }
  return db!;
}

function rowToAccount(row: LinkedInAccountRow): LinkedInAccount {
  return {
    id: row.id,
    linkedin_user_id: row.linkedin_user_id,
    name: row.name,
    headline: row.headline,
    profile_picture_url: row.profile_picture_url,
    connected_at: row.connected_at,
  };
}

/**
 * Returns the currently active connected LinkedIn account (public view without secret tokens).
 */
export function getConnectedLinkedInAccount(): LinkedInAccount | null {
  const row = getDb()
    .prepare("SELECT * FROM linkedin_accounts ORDER BY id DESC LIMIT 1")
    .get() as LinkedInAccountRow | undefined;

  return row ? rowToAccount(row) : null;
}

/**
 * Returns the full account row including secret access token (strictly for backend use: OAuth & publishing).
 */
export function getConnectedLinkedInCredentials(): LinkedInAccountRow | null {
  const row = getDb()
    .prepare("SELECT * FROM linkedin_accounts ORDER BY id DESC LIMIT 1")
    .get() as LinkedInAccountRow | undefined;

  return row ?? null;
}

/**
 * Saves or updates a connected LinkedIn account after OAuth authentication.
 */
export function saveLinkedInAccount(accountData: {
  linkedin_user_id: string;
  name: string;
  headline?: string | null;
  profile_picture_url?: string | null;
  access_token: string;
  refresh_token?: string | null;
  expires_in?: number | null;
  scope?: string | null;
}): LinkedInAccount {
  const now = new Date().toISOString();
  const expiresAt = accountData.expires_in
    ? new Date(Date.now() + accountData.expires_in * 1000).toISOString()
    : null;

  const existing = getDb()
    .prepare("SELECT id FROM linkedin_accounts WHERE linkedin_user_id = ?")
    .get(accountData.linkedin_user_id) as { id: number } | undefined;

  if (existing) {
    getDb()
      .prepare(
        `UPDATE linkedin_accounts SET
          name = @name,
          headline = @headline,
          profile_picture_url = @profile_picture_url,
          access_token = @access_token,
          refresh_token = @refresh_token,
          expires_at = @expires_at,
          scope = @scope,
          updated_at = @updated_at
        WHERE id = @id`
      )
      .run({
        id: existing.id,
        name: accountData.name,
        headline: accountData.headline ?? null,
        profile_picture_url: accountData.profile_picture_url ?? null,
        access_token: accountData.access_token,
        refresh_token: accountData.refresh_token ?? null,
        expires_at: expiresAt,
        scope: accountData.scope ?? null,
        updated_at: now,
      });

    return {
      id: existing.id,
      linkedin_user_id: accountData.linkedin_user_id,
      name: accountData.name,
      headline: accountData.headline ?? null,
      profile_picture_url: accountData.profile_picture_url ?? null,
      connected_at: now,
    };
  } else {
    const info = getDb()
      .prepare(
        `INSERT INTO linkedin_accounts (
          linkedin_user_id, name, headline, profile_picture_url,
          access_token, refresh_token, expires_at, scope,
          connected_at, updated_at
        ) VALUES (
          @linkedin_user_id, @name, @headline, @profile_picture_url,
          @access_token, @refresh_token, @expires_at, @scope,
          @connected_at, @updated_at
        )`
      )
      .run({
        linkedin_user_id: accountData.linkedin_user_id,
        name: accountData.name,
        headline: accountData.headline ?? null,
        profile_picture_url: accountData.profile_picture_url ?? null,
        access_token: accountData.access_token,
        refresh_token: accountData.refresh_token ?? null,
        expires_at: expiresAt,
        scope: accountData.scope ?? null,
        connected_at: now,
        updated_at: now,
      });

    return {
      id: Number(info.lastInsertRowid),
      linkedin_user_id: accountData.linkedin_user_id,
      name: accountData.name,
      headline: accountData.headline ?? null,
      profile_picture_url: accountData.profile_picture_url ?? null,
      connected_at: now,
    };
  }
}

/**
 * Disconnects (deletes) the LinkedIn account from SQLite.
 */
export function deleteLinkedInAccount(): void {
  getDb().prepare("DELETE FROM linkedin_accounts").run();
}
