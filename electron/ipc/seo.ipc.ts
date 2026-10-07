// ============================================================================
// ⚠️ TEMPORARY MOCK — whoever builds the real SEO backend will replace this.
//
// This is a stand-in for several real integrations that don't exist yet:
//   - modules/seo/services/keywordProvider.ts (real keyword data — EMPTY)
//   - modules/seo/services/technicalChecks.ts (real audits — EMPTY)
//   - modules/seo/services/gbpApi.ts (real Google Business Profile — EMPTY)
//   - modules/seo/database/database.ts (real permanent storage — EMPTY)
//
// Every function below makes up realistic-looking fake numbers instead of
// calling a real paid SEO data provider or Google API, and stores
// everything in plain in-memory arrays instead of a real database — so:
//   - Every function name/shape here matches what the real version should
//     have, so swapping mocks for real implementations needs ZERO
//     changes to the frontend.
//   - Data does NOT persist — closing the app resets everything back to
//     the sample data seeded below.
// ============================================================================

import { ipcMain } from "electron";
import type { KeywordSuggestion, TrackedKeyword, RankTrend } from "../../modules/seo/types/keyword.js";
import type { SiteAudit, AuditCheck, CheckStatus } from "../../modules/seo/types/audit.js";
import type { CompetitorGapResult, KeywordGap } from "../../modules/seo/types/competitor.js";
import type { GbpSnapshot } from "../../modules/seo/types/gbp.js";

// ---------------------------------------------------------------------------
// Small random-data helpers, used throughout this mock file.
// ---------------------------------------------------------------------------
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
  // ^ A short fake delay used everywhere below, so loading states in the
  //   UI are actually visible instead of resolving instantly — closer to
  //   what it'll feel like once this is a real network call.
}

// ---------------------------------------------------------------------------
// Keyword research + rank tracking
// ---------------------------------------------------------------------------
let trackedKeywords: TrackedKeyword[] = [];
let nextKeywordId = 1;

function seedTrackedKeywords(): void {
  const seed: Array<Omit<TrackedKeyword, "id" | "tracked_at" | "updated_at">> = [
    { keyword: "ai receptionist for small business", search_volume: 2400, difficulty: 38, current_rank: 7, previous_rank: 11, trend: "up", history: buildHistory(11, 7) },
    { keyword: "virtual receptionist software", search_volume: 3600, difficulty: 54, current_rank: 15, previous_rank: 12, trend: "down", history: buildHistory(12, 15) },
    { keyword: "automated phone answering service", search_volume: 1900, difficulty: 29, current_rank: 4, previous_rank: 4, trend: "same", history: buildHistory(4, 4) },
  ];
  for (const k of seed) {
    const now = new Date().toISOString();
    trackedKeywords.push({ ...k, id: nextKeywordId++, tracked_at: now, updated_at: now });
  }
}

function buildHistory(startRank: number, endRank: number) {
  // Builds a simple week-long trend line between two rank values, purely
  // for the little sparkline chart on the Rank Tracker screen.
  const points = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const progress = (6 - i) / 6;
    const rank = Math.round(startRank + (endRank - startRank) * progress);
    points.push({ date: d.toISOString(), rank });
  }
  return points;
}

seedTrackedKeywords();

function registerKeywordHandlers(): void {
  ipcMain.handle("seo:searchKeywords", async (_event, query: string): Promise<KeywordSuggestion[]> => {
    await wait(500);
    const modifiers = ["best", "near me", "for small business", "pricing", "vs competitors", "reviews", "how to choose"];
    return modifiers.slice(0, 6).map((mod) => ({
      keyword: `${mod === "best" ? "best " + query : `${query} ${mod}`}`,
      search_volume: randomInt(200, 6000),
      difficulty: randomInt(10, 90),
    }));
  });

  ipcMain.handle("seo:getTrackedKeywords", () => {
    return [...trackedKeywords].sort((a, b) => (a.current_rank ?? 999) - (b.current_rank ?? 999));
  });

  ipcMain.handle("seo:trackKeyword", (_event, suggestion: KeywordSuggestion) => {
    const now = new Date().toISOString();
    const startRank = randomInt(8, 60);
    const tracked: TrackedKeyword = {
      id: nextKeywordId++,
      keyword: suggestion.keyword,
      search_volume: suggestion.search_volume,
      difficulty: suggestion.difficulty,
      current_rank: startRank,
      previous_rank: null,
      trend: "new" as RankTrend,
      history: [{ date: now, rank: startRank }],
      tracked_at: now,
      updated_at: now,
    };
    trackedKeywords.push(tracked);
    return { ok: true, keyword: tracked };
  });

  ipcMain.handle("seo:untrackKeyword", (_event, id: number) => {
    trackedKeywords = trackedKeywords.filter((k) => k.id !== id);
    return { ok: true };
  });
}

// ---------------------------------------------------------------------------
// Site audits (on-page + technical, combined per-URL)
// ---------------------------------------------------------------------------
let audits: SiteAudit[] = [];
let nextAuditId = 1;

function makeCheck(label: string, passLikely = 0.6): AuditCheck {
  const roll = Math.random();
  const status: CheckStatus = roll < passLikely ? "pass" : roll < passLikely + 0.25 ? "warn" : "fail";
  const details: Record<CheckStatus, string> = {
    pass: "Looks good — no action needed.",
    warn: "Could be improved — see recommendations.",
    fail: "Needs attention before this will help your ranking.",
  };
  return { label, status, detail: details[status] };
}

function seedAudit(): void {
  audits.push({
    id: nextAuditId++,
    url: "https://example-ai-receptionist.com",
    created_at: new Date().toISOString(),
    onpage_score: 72,
    onpage_checks: [
      makeCheck("Title tag length", 0.8),
      makeCheck("Meta description present", 0.7),
      makeCheck("Heading structure (H1/H2)", 0.6),
      makeCheck("Target keyword in first paragraph", 0.5),
      makeCheck("Image alt text", 0.4),
      makeCheck("Internal links", 0.6),
    ],
    technical_checks: [
      makeCheck("Sitemap found and valid", 0.8),
      makeCheck("No broken links", 0.6),
      makeCheck("HTTPS enabled", 0.95),
      makeCheck("Mobile-friendly", 0.75),
    ],
    page_speed_score: 68,
  });
}
seedAudit();

function registerAuditHandlers(): void {
  ipcMain.handle("seo:runAudit", async (_event, url: string) => {
    await wait(1200);
    const audit: SiteAudit = {
      id: nextAuditId++,
      url,
      created_at: new Date().toISOString(),
      onpage_score: randomInt(40, 96),
      onpage_checks: [
        makeCheck("Title tag length"),
        makeCheck("Meta description present"),
        makeCheck("Heading structure (H1/H2)"),
        makeCheck("Target keyword in first paragraph"),
        makeCheck("Image alt text"),
        makeCheck("Internal links"),
      ],
      technical_checks: [
        makeCheck("Sitemap found and valid"),
        makeCheck("No broken links"),
        makeCheck("HTTPS enabled", 0.9),
        makeCheck("Mobile-friendly"),
      ],
      page_speed_score: randomInt(30, 95),
    };
    audits.unshift(audit);
    return { ok: true, audit };
  });

  ipcMain.handle("seo:getAudits", () => {
    return audits;
  });
}

// ---------------------------------------------------------------------------
// Competitor content-gap analysis
// ---------------------------------------------------------------------------
let gapResults: CompetitorGapResult[] = [];
let nextGapId = 1;

function registerCompetitorHandlers(): void {
  ipcMain.handle("seo:runCompetitorGap", async (_event, yourUrl: string, competitorUrl: string) => {
    await wait(1400);
    const sampleKeywords = [
      "ai phone answering service",
      "virtual receptionist pricing",
      "best answering service for dentists",
      "24/7 call answering ai",
      "receptionist alternative software",
      "automated appointment scheduling",
      "small business call handling",
      "ai customer service phone",
    ];
    const gaps: KeywordGap[] = sampleKeywords.map((keyword) => {
      const youRank = Math.random() < 0.4;
      return {
        keyword,
        competitor_rank: randomInt(1, 15),
        your_rank: youRank ? randomInt(16, 90) : null,
        search_volume: randomInt(300, 5000),
      };
    });
    const result: CompetitorGapResult = {
      id: nextGapId++,
      your_url: yourUrl,
      competitor_url: competitorUrl,
      created_at: new Date().toISOString(),
      gaps,
    };
    gapResults.unshift(result);
    return { ok: true, result };
  });

  ipcMain.handle("seo:getCompetitorGaps", () => {
    return gapResults;
  });
}

// ---------------------------------------------------------------------------
// Google Business Profile snapshot
// ---------------------------------------------------------------------------
let gbpSnapshot: GbpSnapshot | null = {
  business_name: "Demo Business (mock account)",
  local_rank: 3,
  review_count: 128,
  average_rating: 4.6,
  recent_posts: [
    { id: 1, content: "We're now offering 24/7 AI-powered call answering — ask us about a free trial!", posted_at: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: 2, content: "Thank you to everyone who stopped by our booth at the local business expo this week!", posted_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  ],
  last_checked_at: new Date().toISOString(),
};

function registerGbpHandlers(): void {
  ipcMain.handle("seo:getGbpSnapshot", () => {
    return { ok: true, snapshot: gbpSnapshot };
  });

  ipcMain.handle("seo:refreshGbpSnapshot", async () => {
    await wait(900);
    if (gbpSnapshot) {
      gbpSnapshot = {
        ...gbpSnapshot,
        local_rank: Math.max(1, (gbpSnapshot.local_rank ?? 5) + pick([-1, 0, 1])),
        review_count: gbpSnapshot.review_count + randomInt(0, 3),
        last_checked_at: new Date().toISOString(),
      };
    }
    return { ok: true, snapshot: gbpSnapshot };
  });
}

export function registerSeoIpc(): void {
  registerKeywordHandlers();
  registerAuditHandlers();
  registerCompetitorHandlers();
  registerGbpHandlers();
}
