// ============================================================================
// WHAT IS THIS FILE?
// This describes the SHAPE of a connected LinkedIn account. Person 3's
// real OAuth + LinkedIn API work will produce data in this exact shape;
// this frontend (Person 1's job) is built to expect exactly this back.
// Note: this shape deliberately does NOT include the actual secret access
// token — that stays entirely on the backend side and is never sent to
// the on-screen app, the same safety pattern used for the Anthropic API
// key elsewhere in this project.
// ============================================================================

export interface LinkedInAccount {
  id: number;
  linkedin_user_id: string;
  // ^ LinkedIn's own internal ID for this person's account.
  name: string;
  headline: string | null;
  // ^ Their LinkedIn headline/title, e.g. "Marketing Lead at Acme Co."
  profile_picture_url: string | null;
  connected_at: string;
  // ^ When this account was connected to our app.
}
