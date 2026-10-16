// ============================================================================
// WHAT IS THIS FILE?
// The form for writing a post: content, optional image, platform selector,
// UTM tracking fields, and a choice between draft / scheduled / publish now
// — with a live preview alongside. Also doubles as the EDIT screen when
// an existing post is passed in as `existingPost`.
// ============================================================================

import { useEffect, useState } from "react";
import {
  Loader2, Send, Calendar as CalendarIcon, Save, Trash2,
  Link2, RefreshCw, Globe,
} from "lucide-react";
import { usePostsStore } from "../../store/usePostsStore";
import { PostPreview } from "./PostPreview";
import type { Post } from "../../../modules/posts/types/post";

const LINKEDIN_CHAR_LIMIT = 3000;

const PLATFORMS: Array<{ value: Post["platform"]; label: string; charLimit: number }> = [
  { value: "linkedin",  label: "LinkedIn",          charLimit: 3000  },
  { value: "facebook",  label: "Facebook",           charLimit: 63206 },
  { value: "instagram", label: "Instagram",          charLimit: 2200  },
  { value: "twitter",   label: "X / Twitter",        charLimit: 280   },
  { value: "tiktok",    label: "TikTok",             charLimit: 2200  },
  { value: "youtube",   label: "YouTube",            charLimit: 5000  },
  { value: "pinterest", label: "Pinterest",          charLimit: 500   },
  { value: "gbp",       label: "Google Business",   charLimit: 1500  },
];

interface CreatePostProps {
  existingPost: Post | null;
  prefillDate: Date | null;
  onDone: () => void;
}

function toDateTimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CreatePost({ existingPost, prefillDate, onDone }: CreatePostProps) {
  const { account, createPost, updatePost, deletePost, publishNow } = usePostsStore();

  const [content, setContent]     = useState(existingPost?.content ?? "");
  const [imageUrl, setImageUrl]   = useState(existingPost?.image_url ?? "");
  const [platform, setPlatform]   = useState<Post["platform"]>(existingPost?.platform ?? "linkedin");
  const [scheduleMode, setScheduleMode] = useState<"draft" | "schedule" | "now">(
    existingPost?.status === "Scheduled" ? "schedule" : "draft"
  );
  const [scheduledAt, setScheduledAt] = useState(
    toDateTimeLocalValue(
      existingPost?.scheduled_at ?? (prefillDate ? prefillDate.toISOString() : null)
    )
  );

  // UTM / link-shortening
  const [showUtm, setShowUtm]         = useState(false);
  const [originalUrl, setOriginalUrl] = useState("");
  const [utmSource, setUtmSource]     = useState("linkedin");
  const [utmMedium, setUtmMedium]     = useState("social");
  const [utmCampaign, setUtmCampaign] = useState("");

  // Evergreen
  const [isEvergreen, setIsEvergreen]           = useState(existingPost?.is_evergreen ?? false);
  const [recycleIntervalDays, setRecycleDays]   = useState<number>(existingPost?.recycle_interval_days ?? 30);

  const [saving, setSaving]       = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError]         = useState("");

  const currentPlatform = PLATFORMS.find((p) => p.value === platform) ?? PLATFORMS[0];
  const overLimit = content.length > currentPlatform.charLimit;

  useEffect(() => {
    if (prefillDate && !existingPost) setScheduleMode("schedule");
  }, [prefillDate, existingPost]);

  // Pre-fill UTM source from platform name
  useEffect(() => {
    setUtmSource(platform);
  }, [platform]);

  async function handleSave() {
    if (!content.trim()) { setError("Write something before saving."); return; }
    if (scheduleMode === "schedule" && !scheduledAt) { setError("Pick a date and time."); return; }
    setError(""); setSaving(true);

    const status      = scheduleMode === "schedule" ? "Scheduled" : "Draft";
    const scheduled_at = scheduleMode === "schedule" ? new Date(scheduledAt).toISOString() : null;

    const payload = {
      content,
      image_url: imageUrl || null,
      scheduled_at,
      status: status as Post["status"],
      platform,
      original_url: showUtm && originalUrl ? originalUrl : null,
      utm_source:   showUtm ? utmSource   : null,
      utm_medium:   showUtm ? utmMedium   : null,
      utm_campaign: showUtm ? utmCampaign : null,
      is_evergreen: isEvergreen,
      recycle_interval_days: isEvergreen ? recycleIntervalDays : null,
    };

    if (existingPost) {
      await updatePost(existingPost.id, payload);
    } else {
      await createPost(payload);
    }
    setSaving(false);
    onDone();
  }

  async function handlePublishNow() {
    if (!content.trim()) { setError("Write something before publishing."); return; }
    setError(""); setPublishing(true);

    let post = existingPost;
    if (!post) {
      post = await createPost({
        content, image_url: imageUrl || null, scheduled_at: null,
        status: "Draft", platform,
      });
    } else {
      await updatePost(post.id, { content, image_url: imageUrl || null, platform });
    }
    if (!post) { setPublishing(false); setError("Couldn't save the post before publishing."); return; }

    const result = await publishNow(post.id);
    setPublishing(false);
    if (!result.ok) { setError(result.error || "Publishing failed."); return; }
    onDone();
  }

  async function handleDelete() {
    if (!existingPost) return;
    await deletePost(existingPost.id);
    onDone();
  }

  return (
    <div className="create-post">
      <div className="create-post__form">

        {/* Platform selector */}
        <label className="field-label">
          <Globe size={13} style={{ display: "inline", marginRight: 4 }} />
          Platform
        </label>
        <div className="button-row platform-picker" style={{ flexWrap: "wrap", gap: 6 }}>
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={platform === p.value ? "secondary-button secondary-button--active" : "secondary-button"}
              style={{ padding: "4px 10px", fontSize: 12 }}
              onClick={() => setPlatform(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <label className="field-label" style={{ marginTop: 12 }}>Post content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={7}
          className="textarea"
          placeholder={`What do you want to share on ${currentPlatform.label}?`}
        />
        <p className={overLimit ? "error-text" : "muted-text"}>
          {content.length} / {currentPlatform.charLimit.toLocaleString()} characters
        </p>

        {/* Image URL */}
        <label className="field-label">Image URL (optional)</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="text-input"
          placeholder="https://…"
        />

        {/* UTM / Link shortening */}
        <button
          type="button"
          className="secondary-button"
          style={{ marginTop: 10, gap: 6, fontSize: 12 }}
          onClick={() => setShowUtm((v) => !v)}
        >
          <Link2 size={13} /> {showUtm ? "Hide" : "Add"} UTM tracking
        </button>

        {showUtm && (
          <div className="utm-panel" style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <input
              className="text-input"
              placeholder="URL to shorten + tag (e.g. https://yoursite.com/page)"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
            <div className="button-row" style={{ gap: 6 }}>
              <input
                className="text-input"
                placeholder="utm_source"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                className="text-input"
                placeholder="utm_medium"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                className="text-input"
                placeholder="utm_campaign"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
            <p className="muted-text" style={{ fontSize: 11 }}>
              A short link with these UTM parameters will be generated and embedded when the post is saved.
            </p>
          </div>
        )}

        {/* Evergreen toggle */}
        <div className="button-row" style={{ marginTop: 12, gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className={isEvergreen ? "secondary-button secondary-button--active" : "secondary-button"}
            style={{ gap: 6, fontSize: 12 }}
            onClick={() => setIsEvergreen((v) => !v)}
          >
            <RefreshCw size={13} /> Evergreen / auto-recycle
          </button>
          {isEvergreen && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="muted-text" style={{ fontSize: 12 }}>every</span>
              <input
                type="number"
                min={1}
                max={365}
                value={recycleIntervalDays}
                onChange={(e) => setRecycleDays(Number(e.target.value))}
                className="text-input"
                style={{ width: 60, padding: "4px 8px" }}
              />
              <span className="muted-text" style={{ fontSize: 12 }}>days</span>
            </div>
          )}
        </div>
        {isEvergreen && (
          <p className="muted-text" style={{ fontSize: 11, marginTop: 4 }}>
            After publishing, this post will be automatically re-scheduled every {recycleIntervalDays} day(s).
          </p>
        )}

        {/* Schedule mode */}
        <label className="field-label" style={{ marginTop: 12 }}>When</label>
        <div className="button-row">
          <button
            className={scheduleMode === "draft" ? "secondary-button secondary-button--active" : "secondary-button"}
            onClick={() => setScheduleMode("draft")}
          >
            <Save size={13} /> Save as draft
          </button>
          <button
            className={scheduleMode === "schedule" ? "secondary-button secondary-button--active" : "secondary-button"}
            onClick={() => setScheduleMode("schedule")}
          >
            <CalendarIcon size={13} /> Schedule
          </button>
        </div>
        {scheduleMode === "schedule" && (
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="text-input"
          />
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="button-row create-post__actions">
          {existingPost && (
            <button className="secondary-button" onClick={handleDelete}>
              <Trash2 size={13} /> Delete
            </button>
          )}
          <button className="secondary-button" onClick={onDone}>Cancel</button>
          <button
            className="secondary-button button-row__push-right"
            onClick={handleSave}
            disabled={saving || overLimit}
          >
            {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
            {scheduleMode === "schedule" ? "Save schedule" : "Save draft"}
          </button>
          <button
            className="primary-button"
            onClick={handlePublishNow}
            disabled={publishing || overLimit || !account}
          >
            {publishing ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
            Publish now
          </button>
        </div>
        {!account && (
          <p className="muted-text">Connect a LinkedIn account to publish immediately.</p>
        )}
      </div>

      <div className="create-post__preview">
        <p className="field-label">Preview</p>
        <PostPreview content={content} imageUrl={imageUrl || null} account={account} />
      </div>
    </div>
  );
}
