// ============================================================================
// WHAT IS THIS FILE?
// Describes the shape of a Competitor Content-Gap Analysis result — per
// SOW Section 3.2. The idea: compare your site against a competitor's,
// and find keywords they rank for that you don't (an opportunity list).
// ============================================================================

// One keyword where a gap exists between you and a competitor.
export interface KeywordGap {
  keyword: string;
  competitor_rank: number;
  your_rank: number | null;
  // ^ null means you don't rank for this keyword at all.
  search_volume: number;
}

export interface CompetitorGapResult {
  id: number;
  your_url: string;
  competitor_url: string;
  created_at: string;
  gaps: KeywordGap[];
}
