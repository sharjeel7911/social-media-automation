// ============================================================================
// WHAT IS THIS FILE?
// Describes the shape of a weekly or monthly report — per SOW Section 3.4
// ("Exportable weekly/monthly PDF or CSV reports"). One number from each
// area of the whole app, rolled up over a time period.
// ============================================================================

export type ReportPeriod = "weekly" | "monthly";

export interface Report {
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
