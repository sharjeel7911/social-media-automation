// ============================================================================
// WHAT IS THIS FILE?
// Describes the shapes used by Keyword Research and Rank Tracking. This
// is the shared contract: whoever builds the real backend (connecting to
// a paid SEO data provider like DataForSEO, SEMrush, or Ahrefs — see SOW
// Section 5) will build real data in exactly these shapes, and this
// frontend is built to expect exactly this back.
// ============================================================================

export type RankTrend = "up" | "down" | "same" | "new";
// ^ Compared to the last time we checked: moved up, moved down, stayed
//   the same, or this is the first time we've ever ranked for it ("new").

// A single search result from Keyword Research — not tracked yet, just a
// suggestion the user can look at and decide whether to track.
export interface KeywordSuggestion {
  keyword: string;
  search_volume: number;
  // ^ Roughly how many times people search this per month.
  difficulty: number;
  // ^ 0–100: how hard it would be to rank on page 1 for this keyword.
  //   Higher = harder (more competition).
}

// One point in a tracked keyword's rank history — used to draw the little
// trend line showing how a ranking has moved over time.
export interface RankHistoryPoint {
  date: string;
  rank: number | null;
  // ^ null means "not ranking in the top 100" on that date.
}

// A keyword the user has chosen to actively track over time.
export interface TrackedKeyword {
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
