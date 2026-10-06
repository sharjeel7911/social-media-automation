// ============================================================================
// WHAT IS THIS FILE?
// Renders a post the way it would roughly look on LinkedIn's actual feed
// — profile picture, name, headline, the post text, an optional image,
// and some placeholder engagement icons (like/comment/share) purely for
// visual realism. This is reused in two places: live inside the Create
// Post screen (so you can see what you're about to publish), and inside
// a "view" pop-up when clicking a post elsewhere in the app.
// ============================================================================

import { ThumbsUp, MessageCircle, Repeat2, Send, Globe2 } from "lucide-react";
import type { LinkedInAccount } from "../../../modules/linkedin/types/account";

interface PostPreviewProps {
  content: string;
  imageUrl: string | null;
  account: LinkedInAccount | null;
  // ^ Whoever is "posting" this — shown at the top of the card. If no
  //   account is connected yet, we show a generic placeholder instead.
}

export function PostPreview({ content, imageUrl, account }: PostPreviewProps) {
  return (
    <div className="li-preview">
      <div className="li-preview__header">
        <div className="li-preview__avatar">
          {account?.profile_picture_url ? (
            <img src={account.profile_picture_url} alt="" />
          ) : (
            <span>{account ? account.name.charAt(0) : "?"}</span>
            // ^ If there's no real profile picture, fall back to just the
            //   first letter of their name (or a "?" if not connected at all).
          )}
        </div>
        <div>
          <p className="li-preview__name">{account ? account.name : "Your name (connect LinkedIn)"}</p>
          <p className="li-preview__headline">{account?.headline ?? "Headline appears here once connected"}</p>
          <p className="li-preview__meta">
            Now · <Globe2 size={11} /> Anyone
          </p>
        </div>
      </div>

      <p className="li-preview__content">{content || "Your post text will appear here…"}</p>
      {/* Falls back to placeholder text if the content box is still empty,
          so the preview never looks broken/blank. */}

      {imageUrl && (
        <div className="li-preview__image">
          <img src={imageUrl} alt="" />
        </div>
      )}

      <div className="li-preview__actions">
        <span>
          <ThumbsUp size={15} /> Like
        </span>
        <span>
          <MessageCircle size={15} /> Comment
        </span>
        <span>
          <Repeat2 size={15} /> Repost
        </span>
        <span>
          <Send size={15} /> Send
        </span>
        {/* These buttons don't actually do anything — they're purely
            decorative, to make the preview look convincingly like a real
            LinkedIn post. */}
      </div>
    </div>
  );
}
