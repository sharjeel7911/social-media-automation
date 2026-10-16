// ============================================================================
// WHAT IS THIS FILE?
// SQLite-backed storage for social media posts (Module A).
// Uses better-sqlite3 with WAL mode. All new columns (platform, UTM,
// evergreen) use ALTER TABLE … ADD COLUMN IF NOT EXISTS–style guards so
// existing databases are migrated automatically on first startup.
// ============================================================================

import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { app } from "electron";
import type { Post, PostStatus, PostPlatform } from "../types/post.js";

let db: Database.Database | null = null;

interface PostRow {
  id: number;
  content: string;
  image_url: string | null;
  platform: string;
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  linkedin_post_id: string | null;
  error_message: string | null;
  original_url: string | null;
  short_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  is_evergreen: number;       // stored as 0/1
  recycle_interval_days: number | null;
  next_recycle_at: string | null;
  recycle_count: number;
  created_at: string;
  updated_at: string;
}

export function initPostsDatabase(): void {
  const userDir = app.getPath("userData");
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  const dbPath = path.join(userDir, "signal-desk.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Core table (safe to run on every startup — CREATE IF NOT EXISTS).
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      content               TEXT    NOT NULL,
      image_url             TEXT,
      platform              TEXT    NOT NULL DEFAULT 'linkedin',
      status                TEXT    NOT NULL DEFAULT 'Draft',
      scheduled_at          TEXT,
      published_at          TEXT,
      linkedin_post_id      TEXT,
      error_message         TEXT,
      original_url          TEXT,
      short_url             TEXT,
      utm_source            TEXT,
      utm_medium            TEXT,
      utm_campaign          TEXT,
      is_evergreen          INTEGER NOT NULL DEFAULT 0,
      recycle_interval_days INTEGER,
      next_recycle_at       TEXT,
      recycle_count         INTEGER NOT NULL DEFAULT 0,
      created_at            TEXT    NOT NULL,
      updated_at            TEXT    NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_posts_status       ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at);
  `);

  // Safe migrations: add new columns to old databases.
  const migrations = [
    "ALTER TABLE posts ADD COLUMN platform              TEXT    NOT NULL DEFAULT 'linkedin'",
    "ALTER TABLE posts ADD COLUMN original_url          TEXT",
    "ALTER TABLE posts ADD COLUMN short_url             TEXT",
    "ALTER TABLE posts ADD COLUMN utm_source            TEXT",
    "ALTER TABLE posts ADD COLUMN utm_medium            TEXT",
    "ALTER TABLE posts ADD COLUMN utm_campaign          TEXT",
    "ALTER TABLE posts ADD COLUMN is_evergreen          INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE posts ADD COLUMN recycle_interval_days INTEGER",
    "ALTER TABLE posts ADD COLUMN next_recycle_at       TEXT",
    "ALTER TABLE posts ADD COLUMN recycle_count         INTEGER NOT NULL DEFAULT 0",
  ];
  for (const sql of migrations) {
    try { db.exec(sql); } catch { /* column already exists — ignore */ }
  }
}

function getDb(): Database.Database {
  if (!db) initPostsDatabase();
  return db!;
}

function rowToPost(row: PostRow): Post {
  return {
    id:                   row.id,
    content:              row.content,
    image_url:            row.image_url,
    platform:             (row.platform as PostPlatform) || "linkedin",
    status:               row.status,
    scheduled_at:         row.scheduled_at,
    published_at:         row.published_at,
    linkedin_post_id:     row.linkedin_post_id,
    error_message:        row.error_message,
    original_url:         row.original_url,
    short_url:            row.short_url,
    utm_source:           row.utm_source,
    utm_medium:           row.utm_medium,
    utm_campaign:         row.utm_campaign,
    is_evergreen:         !!row.is_evergreen,
    recycle_interval_days: row.recycle_interval_days,
    next_recycle_at:      row.next_recycle_at,
    recycle_count:        row.recycle_count ?? 0,
    created_at:           row.created_at,
    updated_at:           row.updated_at,
  };
}

export function getAllPosts(): Post[] {
  const rows = getDb()
    .prepare("SELECT * FROM posts ORDER BY COALESCE(scheduled_at, created_at) DESC")
    .all() as PostRow[];
  return rows.map(rowToPost);
}

export function getPostById(id: number): Post | null {
  const row = getDb().prepare("SELECT * FROM posts WHERE id = ?").get(id) as PostRow | undefined;
  return row ? rowToPost(row) : null;
}

export function createPost(input: {
  content: string;
  image_url: string | null;
  scheduled_at: string | null;
  status: PostStatus;
  platform?: PostPlatform;
  original_url?: string | null;
  short_url?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  is_evergreen?: boolean;
  recycle_interval_days?: number | null;
}): Post {
  const now = new Date().toISOString();
  const info = getDb()
    .prepare(
      `INSERT INTO posts (
         content, image_url, platform, status, scheduled_at, published_at,
         linkedin_post_id, error_message,
         original_url, short_url, utm_source, utm_medium, utm_campaign,
         is_evergreen, recycle_interval_days, recycle_count,
         created_at, updated_at
       ) VALUES (
         @content, @image_url, @platform, @status, @scheduled_at, NULL,
         NULL, NULL,
         @original_url, @short_url, @utm_source, @utm_medium, @utm_campaign,
         @is_evergreen, @recycle_interval_days, 0,
         @created_at, @updated_at
       )`
    )
    .run({
      content:               input.content,
      image_url:             input.image_url ?? null,
      platform:              input.platform ?? "linkedin",
      status:                input.status,
      scheduled_at:          input.scheduled_at ?? null,
      original_url:          input.original_url ?? null,
      short_url:             input.short_url ?? null,
      utm_source:            input.utm_source ?? null,
      utm_medium:            input.utm_medium ?? null,
      utm_campaign:          input.utm_campaign ?? null,
      is_evergreen:          input.is_evergreen ? 1 : 0,
      recycle_interval_days: input.recycle_interval_days ?? null,
      created_at:            now,
      updated_at:            now,
    });

  return getPostById(Number(info.lastInsertRowid))!;
}

export function updatePost(
  id: number,
  input: Partial<
    Pick<
      Post,
      | "content" | "image_url" | "scheduled_at" | "status" | "published_at"
      | "linkedin_post_id" | "error_message"
      | "platform" | "original_url" | "short_url"
      | "utm_source" | "utm_medium" | "utm_campaign"
      | "is_evergreen" | "recycle_interval_days" | "next_recycle_at" | "recycle_count"
    >
  >
): Post | null {
  const existing = getPostById(id);
  if (!existing) return null;

  const now     = new Date().toISOString();
  const merged  = { ...existing, ...input };

  getDb()
    .prepare(
      `UPDATE posts SET
         content               = @content,
         image_url             = @image_url,
         platform              = @platform,
         scheduled_at          = @scheduled_at,
         status                = @status,
         published_at          = @published_at,
         linkedin_post_id      = @linkedin_post_id,
         error_message         = @error_message,
         original_url          = @original_url,
         short_url             = @short_url,
         utm_source            = @utm_source,
         utm_medium            = @utm_medium,
         utm_campaign          = @utm_campaign,
         is_evergreen          = @is_evergreen,
         recycle_interval_days = @recycle_interval_days,
         next_recycle_at       = @next_recycle_at,
         recycle_count         = @recycle_count,
         updated_at            = @updated_at
       WHERE id = @id`
    )
    .run({
      id,
      content:               merged.content,
      image_url:             merged.image_url,
      platform:              merged.platform,
      scheduled_at:          merged.scheduled_at,
      status:                merged.status,
      published_at:          merged.published_at,
      linkedin_post_id:      merged.linkedin_post_id,
      error_message:         merged.error_message,
      original_url:          merged.original_url,
      short_url:             merged.short_url,
      utm_source:            merged.utm_source,
      utm_medium:            merged.utm_medium,
      utm_campaign:          merged.utm_campaign,
      is_evergreen:          merged.is_evergreen ? 1 : 0,
      recycle_interval_days: merged.recycle_interval_days,
      next_recycle_at:       merged.next_recycle_at,
      recycle_count:         merged.recycle_count,
      updated_at:            now,
    });

  return getPostById(id);
}

export function deletePost(id: number): boolean {
  const res = getDb().prepare("DELETE FROM posts WHERE id = ?").run(id);
  return res.changes > 0;
}

export function getDuePosts(now: Date = new Date()): Post[] {
  const nowIso = now.toISOString();
  const rows   = getDb()
    .prepare(
      "SELECT * FROM posts WHERE status = 'Scheduled' AND scheduled_at <= ? ORDER BY scheduled_at ASC"
    )
    .all(nowIso) as PostRow[];
  return rows.map(rowToPost);
}

export function seedPostsIfEmpty(): void {
  const { count } = getDb().prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
  if (count > 0) return;

  const today   = new Date();
  const inDays  = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString(); };

  const samplePosts: Array<Omit<Post, "id" | "created_at" | "updated_at">> = [
    {
      content:               "Excited to share that our AI receptionist just crossed 10,000 calls handled this month! 📞 Thank you to every customer who trusted us.",
      image_url:             null,
      platform:              "linkedin",
      status:                "Published",
      scheduled_at:          null,
      published_at:          inDays(-3),
      linkedin_post_id:      "urn:li:share:mock1",
      error_message:         null,
      original_url:          null, short_url: null, utm_source: null, utm_medium: null, utm_campaign: null,
      is_evergreen:          false, recycle_interval_days: null, next_recycle_at: null, recycle_count: 0,
    },
    {
      content:               "Hiring a receptionist? Before you post that job listing, see what an AI front desk can do — 24/7 coverage, zero sick days.",
      image_url:             null,
      platform:              "linkedin",
      status:                "Scheduled",
      scheduled_at:          inDays(1),
      published_at:          null,
      linkedin_post_id:      null,
      error_message:         null,
      original_url:          null, short_url: null, utm_source: null, utm_medium: null, utm_campaign: null,
      is_evergreen:          true, recycle_interval_days: 14, next_recycle_at: null, recycle_count: 0,
    },
    {
      content:               "Case study: how a 12-location dental group cut missed calls by 90% in month one with our AI receptionist.",
      image_url:             null,
      platform:              "facebook",
      status:                "Scheduled",
      scheduled_at:          inDays(3),
      published_at:          null,
      linkedin_post_id:      null,
      error_message:         null,
      original_url:          null, short_url: null, utm_source: null, utm_medium: null, utm_campaign: null,
      is_evergreen:          false, recycle_interval_days: null, next_recycle_at: null, recycle_count: 0,
    },
    {
      content:               "Draft: thoughts on why small businesses are switching to AI-first customer service in 2026...",
      image_url:             null,
      platform:              "linkedin",
      status:                "Draft",
      scheduled_at:          null,
      published_at:          null,
      linkedin_post_id:      null,
      error_message:         null,
      original_url:          null, short_url: null, utm_source: null, utm_medium: null, utm_campaign: null,
      is_evergreen:          false, recycle_interval_days: null, next_recycle_at: null, recycle_count: 0,
    },
    {
      content:               "We're at [conference name] this week — come say hi at booth 42!",
      image_url:             null,
      platform:              "twitter",
      status:                "Failed",
      scheduled_at:          inDays(-1),
      published_at:          null,
      linkedin_post_id:      null,
      error_message:         "Account token expired before this post could go out.",
      original_url:          null, short_url: null, utm_source: null, utm_medium: null, utm_campaign: null,
      is_evergreen:          false, recycle_interval_days: null, next_recycle_at: null, recycle_count: 0,
    },
  ];

  const insert = getDb().transaction((items: typeof samplePosts) => {
    for (const item of items) {
      const now = new Date().toISOString();
      getDb()
        .prepare(
          `INSERT INTO posts (
             content, image_url, platform, status, scheduled_at, published_at,
             linkedin_post_id, error_message,
             original_url, short_url, utm_source, utm_medium, utm_campaign,
             is_evergreen, recycle_interval_days, next_recycle_at, recycle_count,
             created_at, updated_at
           ) VALUES (
             @content, @image_url, @platform, @status, @scheduled_at, @published_at,
             @linkedin_post_id, @error_message,
             @original_url, @short_url, @utm_source, @utm_medium, @utm_campaign,
             @is_evergreen, @recycle_interval_days, @next_recycle_at, @recycle_count,
             @created_at, @updated_at
           )`
        )
        .run({
          ...item,
          is_evergreen: item.is_evergreen ? 1 : 0,
          created_at: now,
          updated_at: now,
        });
    }
  });

  insert(samplePosts);
}
