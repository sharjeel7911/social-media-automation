// ============================================================================
// WHAT IS THIS FILE?
// This is a SAFE GO-BETWEEN connecting the on-screen app (which the user
// can click around in) with the powerful background code. Without this
// file, the on-screen app would either have NO access to any of that
// (useless), or FULL access to your entire computer (dangerous). This
// file opens a narrow, specific doorway: only the exact features listed
// below, nothing more.
//
// IMPORTANT TECHNICAL NOTE: Electron loads preload scripts through a
// special restricted "sandbox" that only understands the OLD-style
// "require()" way of importing code, not the modern "import" syntax the
// rest of this project uses. So unlike every other file, this one gets
// compiled completely separately (see tsconfig.preload.json) into
// old-style code, and — on purpose — doesn't import anything from other
// files in this project, even though that would normally be totally
// fine. Instead, the few small type shapes it needs are simply written
// out again below. If you change a shape in modules/seo/types/, update
// the matching shape here too.
// ============================================================================

import { contextBridge, ipcRenderer } from "electron";
// ^ "contextBridge" is what lets us safely expose a few specific functions
//   to the on-screen app. "ipcRenderer" is what actually sends a request
//   over to the background code and waits for its answer.

// ---- Stand-alone copies of the shared types (see the note above) ----

type RankTrend = "up" | "down" | "same" | "new";

interface KeywordSuggestion {
  keyword: string;
  search_volume: number;
  difficulty: number;
}

interface RankHistoryPoint {
  date: string;
  rank: number | null;
}

interface TrackedKeyword {
  id: number;
  keyword: string;
  search_volume: number;
  difficulty: number;
  current_rank: number | null;
  previous_rank: number | null;
  trend: RankTrend;
  history: RankHistoryPoint[];
  tracked_at: string;
  updated_at: string;
}

type CheckStatus = "pass" | "warn" | "fail";

interface AuditCheck {
  label: string;
  status: CheckStatus;
  detail: string;
}

interface SiteAudit {
  id: number;
  url: string;
  created_at: string;
  onpage_score: number;
  onpage_checks: AuditCheck[];
  technical_checks: AuditCheck[];
  page_speed_score: number;
}

interface KeywordGap {
  keyword: string;
  competitor_rank: number;
  your_rank: number | null;
  search_volume: number;
}

interface CompetitorGapResult {
  id: number;
  your_url: string;
  competitor_url: string;
  created_at: string;
  gaps: KeywordGap[];
}

interface GbpPost {
  id: number;
  content: string;
  posted_at: string;
}

interface GbpSnapshot {
  business_name: string;
  local_rank: number | null;
  review_count: number;
  average_rating: number;
  recent_posts: GbpPost[];
  last_checked_at: string;
}

export interface ElectronAPI {
  // This describes exactly what functions we're allowing the on-screen
  // app to call, and what kind of information goes in and comes back out
  // of each one. Think of it as a menu of allowed actions.
  ping: () => string;

  // ---- Keyword research + rank tracking ----
  searchKeywords: (query: string) => Promise<KeywordSuggestion[]>;
  getTrackedKeywords: () => Promise<TrackedKeyword[]>;
  trackKeyword: (suggestion: KeywordSuggestion) => Promise<{ ok: boolean; keyword: TrackedKeyword }>;
  untrackKeyword: (id: number) => Promise<{ ok: boolean }>;

  // ---- Site audits (on-page + technical) ----
  runAudit: (url: string) => Promise<{ ok: boolean; audit: SiteAudit }>;
  getAudits: () => Promise<SiteAudit[]>;

  // ---- Competitor content-gap analysis ----
  runCompetitorGap: (yourUrl: string, competitorUrl: string) => Promise<{ ok: boolean; result: CompetitorGapResult }>;
  getCompetitorGaps: () => Promise<CompetitorGapResult[]>;

  // ---- Google Business Profile ----
  getGbpSnapshot: () => Promise<{ ok: boolean; snapshot: GbpSnapshot | null }>;
  refreshGbpSnapshot: () => Promise<{ ok: boolean; snapshot: GbpSnapshot | null }>;
}

const api: ElectronAPI = {
  // Here's the ACTUAL code behind each item on that "menu" above. Every
  // one of these just quietly forwards the request to the background code
  // and hands back whatever answer comes back.

  ping: () => "pong",
  // A tiny test function — if you call this and get back "pong", you know
  // the connection between the on-screen app and background code is working.

  searchKeywords: (query) => ipcRenderer.invoke("seo:searchKeywords", query),
  getTrackedKeywords: () => ipcRenderer.invoke("seo:getTrackedKeywords"),
  trackKeyword: (suggestion) => ipcRenderer.invoke("seo:trackKeyword", suggestion),
  untrackKeyword: (id) => ipcRenderer.invoke("seo:untrackKeyword", id),

  runAudit: (url) => ipcRenderer.invoke("seo:runAudit", url),
  getAudits: () => ipcRenderer.invoke("seo:getAudits"),

  runCompetitorGap: (yourUrl, competitorUrl) => ipcRenderer.invoke("seo:runCompetitorGap", yourUrl, competitorUrl),
  getCompetitorGaps: () => ipcRenderer.invoke("seo:getCompetitorGaps"),

  getGbpSnapshot: () => ipcRenderer.invoke("seo:getGbpSnapshot"),
  refreshGbpSnapshot: () => ipcRenderer.invoke("seo:refreshGbpSnapshot"),
};

contextBridge.exposeInMainWorld("electronAPI", api);
// ^ This is the actual "opening the doorway" step. From this point on,
//   the on-screen app can call things like window.electronAPI.runAudit()
//   and it will work — but it CANNOT do anything beyond what's listed
//   above. Everything else about your computer stays off-limits to it.
