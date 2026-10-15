// ============================================================================
// WHAT IS THIS FILE?
// Safe bridge between Electron main process and renderer process.
// Exposes window.electronAPI with typed methods across all 4 modules:
//   - Module A: Social Media Scheduling & Publishing (Posts, LinkedIn)
//   - Module B: SEO Toolkit (Keywords, Audits, Competitors, GBP)
//   - Module C: Lead Generation Engine (Leads, Notes, AI Outreach, CSV Export)
//   - Module D: Unified Dashboard (Cross-module metrics, Reports, Analytics)
// ============================================================================

import { contextBridge, ipcRenderer } from "electron";

// ---- Module A Types ----
type PostStatus = "Draft" | "Scheduled" | "Published" | "Failed";

interface Post {
  id: number;
  content: string;
  image_url: string | null;
  platform: "linkedin";
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  linkedin_post_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface LinkedInAccount {
  id: number;
  linkedin_user_id: string;
  name: string;
  headline: string | null;
  profile_picture_url: string | null;
  connected_at: string;
}

// ---- Module B Types ----
interface KeywordSuggestion {
  keyword: string;
  search_volume: number;
  difficulty: number;
  cpc?: number;
}

interface RankTrend {
  date: string;
  rank: number;
}

interface TrackedKeyword {
  id: number;
  keyword: string;
  search_volume: number;
  difficulty: number;
  current_rank: number | null;
  previous_rank: number | null;
  trend: "up" | "down" | "same";
  history: RankTrend[];
  tracked_at: string;
  updated_at: string;
}

type CheckStatus = "pass" | "warning" | "fail";

interface AuditCheck {
  id: string;
  name: string;
  category: "onpage" | "technical";
  status: CheckStatus;
  message: string;
  recommendation?: string;
}

interface SiteAudit {
  id: number;
  url: string;
  overall_score: number;
  onpage_score: number;
  technical_score: number;
  checks: AuditCheck[];
  created_at: string;
}

interface KeywordGap {
  keyword: string;
  competitor_rank: number;
  your_rank: number | null;
  search_volume: number;
  opportunity: "high" | "medium" | "low";
}

interface CompetitorGapResult {
  id: number;
  your_url: string;
  competitor_url: string;
  shared_keywords_count: number;
  gap_keywords_count: number;
  gaps: KeywordGap[];
  analyzed_at: string;
}

interface GbpPost {
  id: number;
  content: string;
  posted_at: string;
}

interface GbpSnapshot {
  business_name: string;
  address: string;
  phone: string;
  website: string;
  local_rank: number | null;
  review_count: number;
  average_rating: number;
  recent_posts: GbpPost[];
  last_checked_at: string;
}

// ---- Module C Types ----
type LeadStatus = "New" | "Contacted" | "Replied" | "Qualified" | "Won" | "Lost";

interface Lead {
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

// ---- Module D Types ----
interface PostSummary {
  id: number;
  content: string;
  platform: "linkedin";
  status: "Scheduled" | "Published";
  scheduled_at: string | null;
  published_at: string | null;
}

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

// ============================================================================
// ElectronAPI Interface
// ============================================================================
export interface ElectronAPI {
  ping: () => string;

  // ---- Module A (Posts & LinkedIn) ----
  getPosts: () => Promise<Post[]>;
  createPost: (input: {
    content: string;
    image_url: string | null;
    scheduled_at: string | null;
    status: PostStatus;
  }) => Promise<{ ok: boolean; post: Post }>;
  updatePost: (
    id: number,
    input: Partial<Pick<Post, "content" | "image_url" | "scheduled_at" | "status">>
  ) => Promise<{ ok: boolean; post?: Post; error?: string }>;
  deletePost: (id: number) => Promise<{ ok: boolean }>;
  publishPostNow: (id: number) => Promise<{ ok: boolean; post?: Post; error?: string }>;
  getLinkedInAccount: () => Promise<{ ok: boolean; account: LinkedInAccount | null }>;
  connectLinkedIn: () => Promise<{ ok: boolean; account?: LinkedInAccount }>;
  disconnectLinkedIn: () => Promise<{ ok: boolean }>;

  // ---- Module B (SEO Toolkit) ----
  searchKeywords: (query: string) => Promise<KeywordSuggestion[]>;
  getTrackedKeywords: () => Promise<TrackedKeyword[]>;
  trackKeyword: (suggestion: KeywordSuggestion) => Promise<{ ok: boolean; keyword: TrackedKeyword }>;
  untrackKeyword: (id: number) => Promise<{ ok: boolean }>;
  runAudit: (url: string) => Promise<{ ok: boolean; audit: SiteAudit }>;
  getAudits: () => Promise<SiteAudit[]>;
  runCompetitorGap: (yourUrl: string, competitorUrl: string) => Promise<{ ok: boolean; result: CompetitorGapResult }>;
  getCompetitorGaps: () => Promise<CompetitorGapResult[]>;
  getGbpSnapshot: () => Promise<{ ok: boolean; snapshot: GbpSnapshot | null }>;
  refreshGbpSnapshot: () => Promise<{ ok: boolean; snapshot: GbpSnapshot | null }>;

  // ---- Module C (Leads Engine) ----
  getLeads: () => Promise<Lead[]>;
  updateLeadStatus: (id: number, status: LeadStatus) => Promise<{ ok: boolean }>;
  getNote: (leadId: number) => Promise<{ ok: boolean; note: LeadNote | null }>;
  saveNote: (leadId: number, text: string) => Promise<{ ok: boolean; note: LeadNote }>;
  exportLeads: (
    leads: Lead[]
  ) => Promise<{ ok: boolean; canceled?: boolean; filePath?: string; error?: string }>;
  generateOutreach: (lead: Lead) => Promise<{ ok: boolean; text?: string; error?: string }>;

  // ---- Module D (Unified Dashboard) ----
  getUpcomingPosts: () => Promise<PostSummary[]>;
  getLatestLeads: () => Promise<LeadSummary[]>;
  getSeoSnapshot: () => Promise<SeoHealthSnapshot>;
  getAnalytics: () => Promise<AnalyticsSummary>;
  getPipelineLeads: () => Promise<LeadSummary[]>;
  getReport: (period: ReportPeriod) => Promise<Report>;
  exportReport: (
    report: Report
  ) => Promise<{ ok: boolean; canceled?: boolean; filePath?: string; error?: string }>;
}

const api: ElectronAPI = {
  ping: () => "pong",

  // Module A
  getPosts: () => ipcRenderer.invoke("posts:getAll"),
  createPost: (input) => ipcRenderer.invoke("posts:create", input),
  updatePost: (id, input) => ipcRenderer.invoke("posts:update", id, input),
  deletePost: (id) => ipcRenderer.invoke("posts:delete", id),
  publishPostNow: (id) => ipcRenderer.invoke("posts:publishNow", id),
  getLinkedInAccount: () => ipcRenderer.invoke("linkedin:getAccount"),
  connectLinkedIn: () => ipcRenderer.invoke("linkedin:connect"),
  disconnectLinkedIn: () => ipcRenderer.invoke("linkedin:disconnect"),

  // Module B
  searchKeywords: (query) => ipcRenderer.invoke("seo:searchKeywords", query),
  getTrackedKeywords: () => ipcRenderer.invoke("seo:getTrackedKeywords"),
  trackKeyword: (suggestion) => ipcRenderer.invoke("seo:trackKeyword", suggestion),
  untrackKeyword: (id) => ipcRenderer.invoke("seo:untrackKeyword", id),
  runAudit: (url) => ipcRenderer.invoke("seo:runAudit", url),
  getAudits: () => ipcRenderer.invoke("seo:getAudits"),
  runCompetitorGap: (yourUrl, compUrl) => ipcRenderer.invoke("seo:runCompetitorGap", yourUrl, compUrl),
  getCompetitorGaps: () => ipcRenderer.invoke("seo:getCompetitorGaps"),
  getGbpSnapshot: () => ipcRenderer.invoke("seo:getGbpSnapshot"),
  refreshGbpSnapshot: () => ipcRenderer.invoke("seo:refreshGbpSnapshot"),

  // Module C
  getLeads: () => ipcRenderer.invoke("leads:getAll"),
  updateLeadStatus: (id, status) => ipcRenderer.invoke("leads:updateStatus", id, status),
  getNote: (leadId) => ipcRenderer.invoke("leads:getNote", leadId),
  saveNote: (leadId, text) => ipcRenderer.invoke("leads:saveNote", leadId, text),
  exportLeads: (leads) => ipcRenderer.invoke("leads:export", leads),
  generateOutreach: (lead) => ipcRenderer.invoke("leads:generateOutreach", lead),

  // Module D
  getUpcomingPosts: () => ipcRenderer.invoke("dashboard:getUpcomingPosts"),
  getLatestLeads: () => ipcRenderer.invoke("dashboard:getLatestLeads"),
  getSeoSnapshot: () => ipcRenderer.invoke("dashboard:getSeoSnapshot"),
  getAnalytics: () => ipcRenderer.invoke("dashboard:getAnalytics"),
  getPipelineLeads: () => ipcRenderer.invoke("dashboard:getPipelineLeads"),
  getReport: (period) => ipcRenderer.invoke("dashboard:getReport", period),
  exportReport: (report) => ipcRenderer.invoke("dashboard:exportReport", report),
};

contextBridge.exposeInMainWorld("electronAPI", api);
