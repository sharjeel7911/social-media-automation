// ============================================================================
// WHAT IS THIS FILE?
// The form for writing a post: the text content, an optional image, and a
// choice between saving as a draft, scheduling for later, or publishing
// right away — with a live preview alongside showing exactly what it'll
// look like once it's live. Also doubles as the EDIT screen: opening an
// existing post (from the Dashboard or Calendar) pre-fills this same form.
// ============================================================================

import { useEffect, useState } from "react";
import { Loader2, Send, Calendar as CalendarIcon, Save, Trash2 } from "lucide-react";
import { usePostsStore } from "../../store/usePostsStore";
import { PostPreview } from "./PostPreview";
import type { Post } from "../../../modules/posts/types/post";

const LINKEDIN_CHAR_LIMIT = 3000;
// ^ LinkedIn's real limit on a single text post — shown as a live counter
//   so you don't write something that gets rejected.

interface CreatePostProps {
  existingPost: Post | null;
  // ^ If set, we're editing this post rather than starting a new one.
  prefillDate: Date | null;
  // ^ If set (from clicking "+" on a Calendar day), the schedule date
  //   field starts pre-filled with this date.
  onDone: () => void;
  // ^ Called after saving/publishing/canceling, so the parent screen can
  //   navigate away from this form.
}

function toDateTimeLocalValue(iso: string | null): string {
  // Converts a stored ISO date string into the format the browser's
  // datetime-local input field expects ("YYYY-MM-DDTHH:mm").
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CreatePost({ existingPost, prefillDate, onDone }: CreatePostProps) {
  const { account, createPost, updatePost, deletePost, publishNow } = usePostsStore();

  const [content, setContent] = useState(existingPost?.content ?? "");
  const [imageUrl, setImageUrl] = useState(existingPost?.image_url ?? "");
  const [scheduleMode, setScheduleMode] = useState<"draft" | "schedule" | "now">(
    existingPost?.status === "Scheduled" ? "schedule" : "draft"
  );
  const [scheduledAt, setScheduledAt] = useState(
    toDateTimeLocalValue(existingPost?.scheduled_at ?? (prefillDate ? prefillDate.toISOString() : null))
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If a prefill date arrives after the form is already open (unlikely,
    // but safe to handle), switch the mode to "schedule" automatically.
    if (prefillDate && !existingPost) setScheduleMode("schedule");
  }, [prefillDate, existingPost]);

  const overLimit = content.length > LINKEDIN_CHAR_LIMIT;

  async function handleSave() {
    if (!content.trim()) {
      setError("Write something before saving.");
      return;
    }
    if (scheduleMode === "schedule" && !scheduledAt) {
      setError("Pick a date and time to schedule this for.");
      return;
    }
    setError("");
    setSaving(true);

    const status = scheduleMode === "schedule" ? "Scheduled" : "Draft";
    const scheduled_at = scheduleMode === "schedule" ? new Date(scheduledAt).toISOString() : null;

    if (existingPost) {
      await updatePost(existingPost.id, { content, image_url: imageUrl || null, scheduled_at, status });
    } else {
      await createPost({ content, image_url: imageUrl || null, scheduled_at, status });
    }
    setSaving(false);
    onDone();
  }

  async function handlePublishNow() {
    if (!content.trim()) {
      setError("Write something before publishing.");
      return;
    }
    setError("");
    setPublishing(true);

    // Make sure the content/image are saved first (creating the post if
    // it's brand new), then trigger the actual publish step.
    let post = existingPost;
    if (!post) {
      post = await createPost({ content, image_url: imageUrl || null, scheduled_at: null, status: "Draft" });
    } else {
      await updatePost(post.id, { content, image_url: imageUrl || null });
    }
    if (!post) {
      setPublishing(false);
      setError("Couldn't save the post before publishing.");
      return;
    }

    const result = await publishNow(post.id);
    setPublishing(false);
    if (!result.ok) {
      setError(result.error || "Publishing failed.");
      return;
    }
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
        <label className="field-label">Post content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="textarea"
          placeholder="What do you want to share on LinkedIn?"
        />
        <p className={overLimit ? "error-text" : "muted-text"}>
          {content.length} / {LINKEDIN_CHAR_LIMIT} characters
        </p>

        <label className="field-label">Image URL (optional)</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="text-input"
          placeholder="https://…"
        />

        <label className="field-label">When</label>
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
          <button className="secondary-button" onClick={onDone}>
            Cancel
          </button>
          <button className="secondary-button button-row__push-right" onClick={handleSave} disabled={saving || overLimit}>
            {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
            {scheduleMode === "schedule" ? "Save schedule" : "Save draft"}
          </button>
          <button className="primary-button" onClick={handlePublishNow} disabled={publishing || overLimit || !account}>
            {publishing ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
            Publish now
          </button>
        </div>
        {!account && <p className="muted-text">Connect a LinkedIn account to publish immediately.</p>}
      </div>

      <div className="create-post__preview">
        <p className="field-label">Preview</p>
        <PostPreview content={content} imageUrl={imageUrl || null} account={account} />
      </div>
    </div>
  );
}
