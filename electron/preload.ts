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
// rest of this project uses. So this file gets compiled completely
// separately (see tsconfig.preload.json) into old-style code, and — on
// purpose — doesn't import anything from other files in this project.
// Instead, the small type shapes it needs are simply written out again
// below. If you change a shape in modules/dashboard/types/, update the
// matching shape here too.
// ============================================================================

import { contextBridge, ipcRenderer } from "electron";
// ^ "contextBridge" lets us safely expose a few specific functions to the
//   on-screen app. "ipcRenderer" sends a request to the background code
//   and waits for its answer.

// ---- Stand-alone copies of the shared types (see the note above) ----

interface PostSummary {
  id: number;
  content: string;
  platform: "linkedin";
  status: "Scheduled" | "Published";
  scheduled_at: string | null;
  published_at: string | null;
}

type LeadStatus = "New" | "Contacted" | "Replied" | "Qualified" | "Won" | "Lost";

interface LeadSummary {
  id: number;
  company_name: string;
  job_title: string;
  status: LeadStatus;
  date_posted: string | null;
}

interface SeoHealthSnapshot {
  onpage_score: number;
  page_speed_score: number;
  tracked_keywords: number;
  average_rank: number | null;
  local_rank: number | null;
}

interface AnalyticsPoint {
  date: string;
  impressions: number;
  engagement_rate: number;
  followers: number;
}

interface TopPost {
  id: number;
  content: string;
  impressions: number;
  engagement_rate: number;
}

interface AnalyticsSummary {
  history: AnalyticsPoint[];
  top_posts: TopPost[];
  total_impressions_30d: number;
  average_engagement_rate_30d: number;
  follower_growth_30d: number;
}

type ReportPeriod = "weekly" | "monthly";

interface Report {
  period: ReportPeriod;
  period_start: string;
  period_end: string;
  posts_published: number;
  total_impressions: number;
  average_engagement_rate: number;
  follower_growth: number;
  leads_added: number;
  leads_won: number;
  average_seo_score: number;
}

export interface ElectronAPI {
  // The menu of actions the on-screen app is allowed to ask for.
  ping: () => string;
  getUpcomingPosts: () => Promise<PostSummary[]>;
  getLatestLeads: () => Promise<LeadSummary[]>;
  getSeoSnapshot: () => Promise<SeoHealthSnapshot>;
  getAnalytics: () => Promise<AnalyticsSummary>;
  getPipelineLeads: () => Promise<LeadSummary[]>;
  updateLeadStatus: (id: number, status: LeadStatus) => Promise<{ ok: boolean }>;
  getReport: (period: ReportPeriod) => Promise<Report>;
  exportReport: (
    report: Report
  ) => Promise<{ ok: boolean; canceled?: boolean; filePath?: string; error?: string }>;
}

const api: ElectronAPI = {
  // The ACTUAL code behind each item on that menu. Each one just forwards
  // the request to the background code and hands back the answer.
  ping: () => "pong",
  getUpcomingPosts: () => ipcRenderer.invoke("dashboard:getUpcomingPosts"),
  getLatestLeads: () => ipcRenderer.invoke("dashboard:getLatestLeads"),
  getSeoSnapshot: () => ipcRenderer.invoke("dashboard:getSeoSnapshot"),
  getAnalytics: () => ipcRenderer.invoke("dashboard:getAnalytics"),
  getPipelineLeads: () => ipcRenderer.invoke("dashboard:getPipelineLeads"),
  updateLeadStatus: (id, status) => ipcRenderer.invoke("dashboard:updateLeadStatus", id, status),
  getReport: (period) => ipcRenderer.invoke("dashboard:getReport", period),
  exportReport: (report) => ipcRenderer.invoke("dashboard:exportReport", report),
};

contextBridge.exposeInMainWorld("electronAPI", api);
// ^ The actual "opening the doorway" step. From here on, the on-screen app
//   can call things like window.electronAPI.getAnalytics(), but CANNOT do
//   anything beyond what's listed above.
