// ============================================================================
// Evergreen Queue Management screen for Module A
// Displays posts designated as evergreen content, their recycle frequency,
// times recycled so far, and next scheduled recycle timestamp.
// Allows pausing/resuming evergreen recycling and modifying intervals.
// ============================================================================

import { useState } from "react";
import { Repeat, Calendar, CheckCircle2, Clock, Trash2, Edit3, Sparkles } from "lucide-react";
import { usePostsStore } from "../../store/usePostsStore";
import { PostStatusBadge } from "./PostStatusBadge";
import type { Post } from "../../../modules/posts/types/post";

interface EvergreenQueueProps {
  onOpenPost: (post: Post) => void;
}

export function EvergreenQueue({ onOpenPost }: EvergreenQueueProps) {
  const { posts, updatePost } = usePostsStore();
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  const evergreenPosts = posts.filter((p) => p.is_evergreen);
  const filtered = filterPlatform === "all"
    ? evergreenPosts
    : evergreenPosts.filter((p) => p.platform === filterPlatform);

  async function handleToggleEvergreen(post: Post) {
    await updatePost(post.id, {
      is_evergreen: !post.is_evergreen,
    });
  }

  async function handleChangeInterval(post: Post, newDays: number) {
    if (newDays < 1) return;
    await updatePost(post.id, {
      recycle_interval_days: newDays,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Repeat size={18} color="var(--color-primary)" /> Evergreen Content Queue
          </h2>
          <p className="muted-text" style={{ margin: "0.25rem 0 0" }}>
            High-performing posts automatically recycled back to Scheduled status after their cooldown interval.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>Platform:</span>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            style={{
              padding: "0.35rem 0.6rem",
              borderRadius: "6px",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
              fontSize: "0.85rem",
            }}
          >
            <option value="all">All Platforms</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">X / Twitter</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="pinterest">Pinterest</option>
            <option value="gbp">Google Business Profile</option>
          </select>
        </div>
      </div>

      {/* Stats summary */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <Repeat size={18} color="#3B82F6" />
          <div>
            <p className="stat-card__value">{evergreenPosts.length}</p>
            <p className="muted-text">Active Evergreen Posts</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle2 size={18} color="#10B981" />
          <div>
            <p className="stat-card__value">
              {evergreenPosts.reduce((acc, p) => acc + (p.recycle_count || 0), 0)}
            </p>
            <p className="muted-text">Total Reposts Triggered</p>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={18} color="#8B5CF6" />
          <div>
            <p className="stat-card__value">
              {evergreenPosts.length > 0
                ? Math.round(evergreenPosts.reduce((acc, p) => acc + (p.recycle_interval_days || 30), 0) / evergreenPosts.length)
                : 0} d
            </p>
            <p className="muted-text">Avg Recycle Cooldown</p>
          </div>
        </div>
      </div>

      {/* Table of posts */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", border: "1px dashed var(--color-border)", borderRadius: "8px" }}>
          <Repeat size={32} style={{ opacity: 0.3, margin: "0 auto 0.75rem" }} />
          <p style={{ fontWeight: 500, margin: 0 }}>No evergreen posts found</p>
          <p className="muted-text" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Enable the "Evergreen / Auto-recycle" toggle when creating or editing a post to add it to this queue.
          </p>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden", background: "var(--color-surface)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", background: "rgba(0,0,0,0.02)" }}>
                <th style={{ padding: "0.75rem 1rem" }}>Content</th>
                <th style={{ padding: "0.75rem 1rem" }}>Platform</th>
                <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem" }}>Interval (Days)</th>
                <th style={{ padding: "0.75rem 1rem" }}>Recycle Count</th>
                <th style={{ padding: "0.75rem 1rem" }}>Next Recycle</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td style={{ padding: "0.75rem 1rem", maxWidth: "260px" }}>
                    <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {post.content}
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textTransform: "capitalize" }}>
                    {post.platform || "linkedin"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <PostStatusBadge status={post.status} />
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      defaultValue={post.recycle_interval_days || 30}
                      onBlur={(e) => handleChangeInterval(post, parseInt(e.target.value, 10))}
                      style={{
                        width: "60px",
                        padding: "0.25rem 0.4rem",
                        borderRadius: "4px",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.85rem",
                      }}
                    />
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {post.recycle_count || 0} times
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--color-text-secondary)" }}>
                    {post.next_recycle_at ? new Date(post.next_recycle_at).toLocaleDateString() : "Pending publish"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                      <button
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          border: "1px solid var(--color-border)",
                          background: "var(--color-surface)",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                        onClick={() => onOpenPost(post)}
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          border: "1px solid var(--color-border)",
                          background: "var(--color-surface)",
                          color: "var(--color-danger, #ef4444)",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                        }}
                        onClick={() => handleToggleEvergreen(post)}
                        title="Remove from evergreen"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
