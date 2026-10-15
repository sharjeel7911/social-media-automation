// ============================================================================
// WHAT IS THIS FILE?
// Describes the shape of a Site Audit — the combined result of running
// an on-page content check AND the technical SEO checks (sitemap, broken
// links, meta tags, page speed) against one URL, per SOW Section 3.2.
// These two checks are shown together on one screen in this frontend
// since they're both "run against the same URL at the same time," even
// though the real backend work behind them is two separate integrations
// (an on-page scoring engine, and Google's PageSpeed Insights / Search
// Console APIs for the technical side).
// ============================================================================

export type CheckStatus = "pass" | "warn" | "fail";

// One individual check within an audit — e.g. "Title tag length: pass".
export interface AuditCheck {
  label: string;
  status: CheckStatus;
  detail: string;
  // ^ A short explanation of why it passed/warned/failed, and what to do
  //   about it if not passing.
}

export interface SiteAudit {
  id: number;
  url: string;
  created_at: string;
  onpage_score: number;
  // ^ 0–100 overall content-optimization score.
  onpage_checks: AuditCheck[];
  technical_checks: AuditCheck[];
  page_speed_score: number;
  // ^ 0–100, the kind of score Google's PageSpeed Insights returns.
}
