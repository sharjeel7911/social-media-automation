// ============================================================================
// WHAT IS THIS FILE?
// Describes the shapes used by the Analytics screen — per SOW Section 3.4:
// "impressions, engagement rate, follower growth, top-performing posts."
// ============================================================================

// One day's numbers — used to draw the trend charts.
export interface AnalyticsPoint {
  date: string;
  impressions: number;
  // ^ How many times posts were shown to people that day.
  engagement_rate: number;
  // ^ Percentage (e.g. 4.2 means 4.2%) of viewers who liked/commented/shared.
  followers: number;
  // ^ Total follower count at the end of that day.
}

// One of the best-performing posts.
export interface TopPost {
  id: number;
  content: string;
  impressions: number;
  engagement_rate: number;
}

export interface AnalyticsSummary {
  history: AnalyticsPoint[];
  top_posts: TopPost[];
  total_impressions_30d: number;
  average_engagement_rate_30d: number;
  follower_growth_30d: number;
}
