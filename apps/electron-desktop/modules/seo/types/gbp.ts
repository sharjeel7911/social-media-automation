// ============================================================================
// WHAT IS THIS FILE?
// Describes the shape of a Google Business Profile snapshot — per SOW
// Section 3.2 ("Google Business Profile post and local-ranking snapshot").
// This is about LOCAL search visibility specifically — e.g. how a
// business shows up when someone searches "dentist near me" — which is a
// different thing from the regular keyword/rank tracking above.
// ============================================================================

export interface GbpPost {
  id: number;
  content: string;
  posted_at: string;
}

export interface GbpSnapshot {
  business_name: string;
  local_rank: number | null;
  // ^ Roughly: position in the "local pack" (the map + 3 listings Google
  //   shows for local searches). null if not appearing at all.
  review_count: number;
  average_rating: number;
  recent_posts: GbpPost[];
  last_checked_at: string;
}
