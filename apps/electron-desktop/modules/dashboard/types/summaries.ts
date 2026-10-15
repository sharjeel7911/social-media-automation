// ============================================================================
// WHAT IS THIS FILE?
// Describes the SHAPES of the small "summary" records the dashboard shows
// from the other three modules: a post (Module A), a lead (Module C), and
// an SEO health snapshot (Module B). These are deliberately LIGHTER than
// the full records those modules keep — the dashboard only needs enough
// to show a quick overview line, not every detail.
//
// This file is the shared contract: whoever builds the real backend
// (see modules/dashboard/services/dataSync.ts for the big open question
// about how) builds data in exactly these shapes, and this frontend is
// built to expect exactly this back.
// ============================================================================

// ---- From Module A (social publishing) ----
export interface PostSummary {
  id: number;
  content: string;
  platform: "linkedin";
  status: "Scheduled" | "Published";
  scheduled_at: string | null;
  published_at: string | null;
}

// ---- From Module C (lead generation) ----
// These six statuses match Module C's own pipeline exactly, so a lead
// moved here means the same thing as a lead moved there.
export type LeadStatus = "New" | "Contacted" | "Replied" | "Qualified" | "Won" | "Lost";

export interface LeadSummary {
  id: number;
  company_name: string;
  job_title: string;
  status: LeadStatus;
  date_posted: string | null;
}

// ---- From Module B (SEO toolkit) ----
export interface SeoHealthSnapshot {
  onpage_score: number;
  // ^ 0–100, from the most recent site audit.
  page_speed_score: number;
  // ^ 0–100, from the most recent site audit.
  tracked_keywords: number;
  average_rank: number | null;
  local_rank: number | null;
  // ^ Google Business Profile local-pack position.
}
