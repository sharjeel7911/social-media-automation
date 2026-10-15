// ============================================================================
// ⚠️ TEMPORARY MOCK — whoever builds the real backend will replace this.
//
// This stands in for data that really belongs to OTHER modules (posts from
// Module A, SEO numbers from Module B, leads from Module C). Because those
// are separate apps, this file just MAKES UP realistic-looking data for
// all of it. See modules/dashboard/services/dataSync.ts (empty) for the
// open team decision about how the real version will get that data.
//
// What's fake vs. real in this file:
//   - FAKE: upcoming posts, leads, SEO snapshot, analytics numbers, and
//     the weekly/monthly report figures. Held in memory — they reset
//     every time the app restarts. Moving a lead between pipeline
//     columns works, but only until you close the app.
//   - REAL: exporting a report to a CSV file. That genuinely opens a
//     "Save File" window and writes a real file to your computer — it
//     doesn't depend on any other module, so there was no reason to fake it.
//
// Every function name and return shape matches what the real version
// needs to have, so swapping this file out requires ZERO frontend changes.
// ============================================================================

import { ipcMain, dialog, BrowserWindow } from "electron";
import fs from "node:fs";
import type { PostSummary, LeadSummary, LeadStatus, SeoHealthSnapshot } from "../../modules/dashboard/types/summaries.js";
import type { AnalyticsSummary, AnalyticsPoint, TopPost } from "../../modules/dashboard/types/analytics.js";
import type { Report, ReportPeriod } from "../../modules/dashboard/types/report.js";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
  // ^ A short fake delay so loading states are visible, like a real call.
}
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Fake posts (stand-in for Module A)
// ---------------------------------------------------------------------------
const posts: PostSummary[] = [
  { id: 1, content: "Hiring a receptionist? See what an AI front desk can do — 24/7 coverage, zero sick days.", platform: "linkedin", status: "Scheduled", scheduled_at: daysFromNow(1), published_at: null },
  { id: 2, content: "Case study: how a 12-location dental group cut missed calls by 90% in month one.", platform: "linkedin", status: "Scheduled", scheduled_at: daysFromNow(3), published_at: null },
  { id: 3, content: "5 signs your small business is losing customers to unanswered calls.", platform: "linkedin", status: "Scheduled", scheduled_at: daysFromNow(6), published_at: null },
  { id: 4, content: "Our AI receptionist just crossed 10,000 calls handled this month!", platform: "linkedin", status: "Published", scheduled_at: null, published_at: daysFromNow(-3) },
];

// ---------------------------------------------------------------------------
// Fake leads (stand-in for Module C) — used by both the dashboard's
// "latest leads" list and the Kanban pipeline.
// ---------------------------------------------------------------------------
let leads: LeadSummary[] = [
  { id: 1, company_name: "Harborline Dental Group", job_title: "Remote Receptionist", status: "New", date_posted: daysFromNow(-1) },
  { id: 2, company_name: "Crestpoint Legal Partners", job_title: "Virtual Receptionist", status: "New", date_posted: daysFromNow(-2) },
  { id: 3, company_name: "Palisade Insurance Advisors", job_title: "Remote Receptionist", status: "New", date_posted: daysFromNow(-3) },
  { id: 4, company_name: "Bluefin Property Management", job_title: "Answering Service Coordinator", status: "Contacted", date_posted: daysFromNow(-4) },
  { id: 5, company_name: "Norwood Veterinary Clinic", job_title: "Front Desk Receptionist", status: "Contacted", date_posted: daysFromNow(-5) },
  { id: 6, company_name: "Alcove Coworking", job_title: "Remote Receptionist", status: "Replied", date_posted: daysFromNow(-6) },
  { id: 7, company_name: "Meridian Home Health", job_title: "Remote Receptionist", status: "Qualified", date_posted: daysFromNow(-8) },
  { id: 8, company_name: "Kettlewell & Sons Plumbing", job_title: "Answering Service Coordinator", status: "Qualified", date_posted: daysFromNow(-9) },
  { id: 9, company_name: "Fernbrook Orthodontics", job_title: "Remote Receptionist", status: "Won", date_posted: daysFromNow(-12) },
  { id: 10, company_name: "Driftwood Realty Group", job_title: "Virtual Receptionist", status: "Lost", date_posted: daysFromNow(-14) },
];

// ---------------------------------------------------------------------------
// Fake analytics (stand-in for real platform analytics) — 30 days of
// gently trending numbers, so the charts have a believable shape.
// ---------------------------------------------------------------------------
function buildAnalytics(): AnalyticsSummary {
  const history: AnalyticsPoint[] = [];
  let followers = 1840;
  for (let i = 29; i >= 0; i--) {
    followers += randomInt(0, 9);
    history.push({
      date: daysFromNow(-i),
      impressions: randomInt(900, 2600) + (29 - i) * 20,
      engagement_rate: Math.round((randomInt(25, 58) / 10) * 10) / 10,
      followers,
    });
  }
  const topPosts: TopPost[] = [
    { id: 4, content: "Our AI receptionist just crossed 10,000 calls handled this month!", impressions: 8420, engagement_rate: 6.1 },
    { id: 11, content: "Why 'we'll call you back' is costing you customers.", impressions: 6310, engagement_rate: 5.4 },
    { id: 12, content: "Behind the scenes: how our AI learns your business.", impressions: 4980, engagement_rate: 4.8 },
    { id: 13, content: "3 questions to ask before hiring a front-desk receptionist.", impressions: 3720, engagement_rate: 4.2 },
  ];
  return {
    history,
    top_posts: topPosts,
    total_impressions_30d: history.reduce((sum, p) => sum + p.impressions, 0),
    average_engagement_rate_30d: Math.round((history.reduce((s, p) => s + p.engagement_rate, 0) / history.length) * 10) / 10,
    follower_growth_30d: history[history.length - 1].followers - history[0].followers,
  };
}
const analytics = buildAnalytics();

// ---------------------------------------------------------------------------
// CSV export helper (REAL, not mocked)
// ---------------------------------------------------------------------------
function reportToCsv(report: Report): string {
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows: Array<[string, string | number]> = [
    ["Report type", report.period],
    ["Period start", report.period_start.slice(0, 10)],
    ["Period end", report.period_end.slice(0, 10)],
    ["Posts published", report.posts_published],
    ["Total impressions", report.total_impressions],
    ["Average engagement rate (%)", report.average_engagement_rate],
    ["Follower growth", report.follower_growth],
    ["Leads added", report.leads_added],
    ["Leads won", report.leads_won],
    ["Average SEO score", report.average_seo_score],
  ];
  return [["Metric", "Value"].map(escape).join(","), ...rows.map(([k, v]) => [escape(k), escape(v)].join(","))].join("\n");
}

export function registerDashboardIpc(getWindow: () => BrowserWindow | null): void {
  ipcMain.handle("dashboard:getUpcomingPosts", (): PostSummary[] => {
    return posts
      .filter((p) => p.status === "Scheduled")
      .sort((a, b) => new Date(a.scheduled_at ?? 0).getTime() - new Date(b.scheduled_at ?? 0).getTime());
  });

  ipcMain.handle("dashboard:getLatestLeads", (): LeadSummary[] => {
    return [...leads].sort((a, b) => new Date(b.date_posted ?? 0).getTime() - new Date(a.date_posted ?? 0).getTime()).slice(0, 5);
  });

  ipcMain.handle("dashboard:getSeoSnapshot", (): SeoHealthSnapshot => {
    return { onpage_score: 72, page_speed_score: 68, tracked_keywords: 3, average_rank: 9, local_rank: 3 };
  });

  ipcMain.handle("dashboard:getAnalytics", async (): Promise<AnalyticsSummary> => {
    await wait(400);
    return analytics;
  });

  ipcMain.handle("dashboard:getPipelineLeads", (): LeadSummary[] => {
    return leads;
  });

  ipcMain.handle("dashboard:updateLeadStatus", (_event, id: number, status: LeadStatus) => {
    leads = leads.map((l) => (l.id === id ? { ...l, status } : l));
    return { ok: true };
  });

  ipcMain.handle("dashboard:getReport", async (_event, period: ReportPeriod): Promise<Report> => {
    await wait(300);
    const days = period === "weekly" ? 7 : 30;
    const slice = analytics.history.slice(-days);
    return {
      period,
      period_start: daysFromNow(-days),
      period_end: new Date().toISOString(),
      posts_published: period === "weekly" ? 3 : 11,
      total_impressions: slice.reduce((s, p) => s + p.impressions, 0),
      average_engagement_rate: Math.round((slice.reduce((s, p) => s + p.engagement_rate, 0) / slice.length) * 10) / 10,
      follower_growth: slice[slice.length - 1].followers - slice[0].followers,
      leads_added: period === "weekly" ? 6 : 24,
      leads_won: leads.filter((l) => l.status === "Won").length,
      average_seo_score: 72,
    };
  });

  ipcMain.handle("dashboard:exportReport", async (_event, report: Report) => {
    // REAL: opens a native "Save File" window and writes an actual file.
    const win = getWindow();
    const defaultName = `${report.period}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    const options = { defaultPath: defaultName, filters: [{ name: "CSV", extensions: ["csv"] }] };
    const { canceled, filePath } = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options);
    if (canceled || !filePath) return { ok: false, canceled: true };
    try {
      fs.writeFileSync(filePath, reportToCsv(report), "utf-8");
      return { ok: true, filePath };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });
}
