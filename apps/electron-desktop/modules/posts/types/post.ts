// ============================================================================
// WHAT IS THIS FILE?
// This describes the SHAPE of a "Post" — one piece of content that's
// either a draft, scheduled for later, already published, or failed to
// publish. This is the shared contract: Person 2's database and scheduling
// backend will build real storage around this exact shape, and this
// frontend (Person 1's job) is built to expect exactly this shape back.
// Neither side needs to guess what the other is sending/receiving.
// ============================================================================

export type PostStatus = "Draft" | "Scheduled" | "Published" | "Failed";

export type PostPlatform =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "twitter"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "gbp";

export interface Post {
  id: number;
  content: string;
  image_url: string | null;
  platform: PostPlatform;
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  linkedin_post_id: string | null;
  error_message: string | null;

  // UTM / link-shortening
  original_url: string | null;
  short_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;

  // Evergreen recycling
  is_evergreen: boolean;
  recycle_interval_days: number | null;
  next_recycle_at: string | null;
  recycle_count: number;

  created_at: string;
  updated_at: string;
}

