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
// ^ Every post is in exactly one of these four states at any time.

export type PostPlatform = "linkedin";
// ^ Only LinkedIn for now, matching this phase of the project (Person 3's
//   assignment is specifically LinkedIn integration). Written as a list of
//   one so it's easy to add "twitter" | "instagram" etc. later without
//   changing every place that uses this type.

export interface Post {
  id: number;
  content: string;
  // ^ The actual text of the post.
  image_url: string | null;
  // ^ A single attached image, if any (LinkedIn posts can include one).
  platform: PostPlatform;
  status: PostStatus;
  scheduled_at: string | null;
  // ^ When this post is set to go out automatically. Null for drafts, or
  //   for posts published immediately rather than scheduled.
  published_at: string | null;
  // ^ When this post actually went out. Stays null until it's really published.
  linkedin_post_id: string | null;
  // ^ The ID LinkedIn itself gives back once the post is live there —
  //   filled in by Person 3's real publishing code once it exists.
  error_message: string | null;
  // ^ If publishing failed, why — shown to the user so they know what to fix.
  created_at: string;
  updated_at: string;
}
