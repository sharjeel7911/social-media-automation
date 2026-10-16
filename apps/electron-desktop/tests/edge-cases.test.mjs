import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDbDir = path.join(__dirname, "..", "data-test");
const testDbPath = path.join(testDbDir, "test-edge.db");

test.beforeEach(() => {
  if (fs.existsSync(testDbDir)) {
    fs.rmSync(testDbDir, { recursive: true, force: true });
  }
  fs.mkdirSync(testDbDir, { recursive: true });
});

test.afterEach(() => {
  if (fs.existsSync(testDbDir)) {
    fs.rmSync(testDbDir, { recursive: true, force: true });
  }
});

test("Edge Case 1: Special Characters, SQL Injection payloads, and unicode in post content and UTMs", () => {
  const db = new Database(testDbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      image_url TEXT,
      platform TEXT NOT NULL DEFAULT 'linkedin',
      status TEXT NOT NULL DEFAULT 'Draft',
      scheduled_at TEXT,
      published_at TEXT,
      linkedin_post_id TEXT,
      error_message TEXT,
      original_url TEXT,
      short_url TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      is_evergreen INTEGER DEFAULT 0,
      recycle_interval_days INTEGER,
      next_recycle_at TEXT,
      recycle_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  const maliciousPayloads = [
    "'; DROP TABLE posts; --",
    "Robert'); DROP TABLE Students;--",
    "🚀✨ Multi-byte Unicode: 𠜎 𠜱 𠝹 𠱓 𠱸 𠲖 𠳏 and emoji combo 👨‍👩‍👧‍👦",
    "Line breaks\r\nand Windows CR-LF\r\nand null bytes \u0000 stripped safely",
    "HTML script: <script>alert('xss')</script> &amp; quote: \" ' `",
  ];

  for (const payload of maliciousPayloads) {
    const stmt = db.prepare(`
      INSERT INTO posts (content, status, utm_campaign, created_at, updated_at)
      VALUES (?, 'Draft', ?, datetime('now'), datetime('now'))
    `);
    const info = stmt.run(payload, payload);
    assert.ok(info.lastInsertRowid > 0, "Insert should succeed with parameterized statement");

    const fetched = db.prepare("SELECT * FROM posts WHERE id = ?").get(info.lastInsertRowid);
    assert.equal(fetched.content, payload, "Payload content must match exactly without SQL corruption");
    assert.equal(fetched.utm_campaign, payload, "UTM campaign must match exactly");
  }

  // Ensure table still intact and contains all rows
  const count = db.prepare("SELECT COUNT(*) as count FROM posts").get();
  assert.equal(count.count, maliciousPayloads.length);
  db.close();
});

test("Edge Case 2: Deduplication and Unique Constraints with Malformed Data", () => {
  const db = new Database(testDbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      job_title TEXT NOT NULL,
      job_url TEXT NOT NULL,
      deduplication_key TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  const stmt = db.prepare(`
    INSERT INTO leads (company_name, job_title, job_url, deduplication_key, status, created_at)
    VALUES (?, ?, ?, ?, 'New', datetime('now'))
  `);

  // First insert succeeds
  stmt.run("Acme Corp", "AI Lead Engineer", "https://example.com/jobs/1", "acme-ai-lead-1");

  // Duplicate deduplication_key should fail intentionally with UNIQUE constraint error
  assert.throws(
    () => {
      stmt.run("Acme Corp New", "AI Lead Engineer", "https://example.com/jobs/1-alt", "acme-ai-lead-1");
    },
    { message: /UNIQUE constraint failed/ }
  );

  db.close();
});

test("Edge Case 3: Windows file path separators, backslashes, and cross-platform CSV escaping", () => {
  const leads = [
    {
      company_name: "Acme, Inc. \"Global\"",
      job_title: "C# & .NET Windows Developer\r\n(Remote)",
      location: "Redmond, WA; C:\\Program Files\\App",
      status: "Contacted",
      date_posted: "2026-10-15T12:00:00.000Z",
      job_url: "https://example.com/job?id=123&ref=win\\path",
    },
    {
      company_name: "Plain Corp",
      job_title: "Simple Title",
      location: null,
      status: "New",
      date_posted: null,
      job_url: "https://example.com/plain",
    },
  ];

  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const headers = ["Company", "Job Title", "Location", "Status", "Date", "URL"];
  const rows = leads.map((l) => [
    escape(l.company_name),
    escape(l.job_title),
    escape(l.location ?? ""),
    escape(l.status),
    escape(l.date_posted ? l.date_posted.slice(0, 10) : ""),
    escape(l.job_url),
  ].join(","));

  const csvContent = [headers.join(","), ...rows].join("\r\n"); // Windows CRLF

  // Verify quotes are doubled and commas/newlines are enclosed
  assert.ok(csvContent.includes('"Acme, Inc. ""Global"""'));
  assert.ok(csvContent.includes('"Redmond, WA; C:\\Program Files\\App"'));
  assert.ok(csvContent.includes('""')); // empty location for second row
  assert.ok(csvContent.includes('"2026-10-15"'));

  // Test writing to Windows-style normalized paths
  const winSimulatedPath = path.join(testDbDir, "nested", "folder", "export.csv");
  fs.mkdirSync(path.dirname(winSimulatedPath), { recursive: true });
  fs.writeFileSync(winSimulatedPath, csvContent, "utf-8");

  assert.ok(fs.existsSync(winSimulatedPath));
  const readBack = fs.readFileSync(winSimulatedPath, "utf-8");
  assert.equal(readBack, csvContent);
});

test("Edge Case 4: Evergreen post recycling calculation edge cases (0 days, leap year, negative values)", () => {
  const calculateNextRecycle = (intervalDays, baseDate = new Date()) => {
    if (!intervalDays || intervalDays <= 0 || isNaN(intervalDays)) {
      return null;
    }
    const d = new Date(baseDate);
    d.setDate(d.getDate() + intervalDays);
    return d.toISOString();
  };

  // Zero days: should return null (prevent infinite loop)
  assert.equal(calculateNextRecycle(0), null);

  // Negative days: should return null
  assert.equal(calculateNextRecycle(-5), null);

  // Null / undefined / NaN
  assert.equal(calculateNextRecycle(null), null);
  assert.equal(calculateNextRecycle(NaN), null);

  // Standard valid interval
  const now = new Date("2026-10-15T00:00:00.000Z");
  const next14 = calculateNextRecycle(14, now);
  assert.equal(next14, "2026-10-29T00:00:00.000Z");

  // Leap-year month boundary test (Feb 28 to March)
  const leapBase = new Date("2028-02-28T00:00:00.000Z"); // 2028 is a leap year
  const nextLeap = calculateNextRecycle(1, leapBase);
  assert.equal(nextLeap, "2028-02-29T00:00:00.000Z");
});

test("Edge Case 5: LinkedIn Sandbox/Demo token generation and Mock Fallback handling", () => {
  const mockToken = "mock_li_token_1234567890abcdef";
  const realToken = "AQV789_real_oauth_token";

  const isDemo = (token) => token.startsWith("mock_li_token_");

  assert.equal(isDemo(mockToken), true);
  assert.equal(isDemo(realToken), false);

  // Expired token calculation
  const isExpired = (expiresAtStr) => {
    if (!expiresAtStr) return false;
    return Date.now() > new Date(expiresAtStr).getTime();
  };

  const pastDate = new Date(Date.now() - 60_000).toISOString();
  const futureDate = new Date(Date.now() + 60_000).toISOString();

  assert.equal(isExpired(pastDate), true);
  assert.equal(isExpired(futureDate), false);
  assert.equal(isExpired(null), false);
});
