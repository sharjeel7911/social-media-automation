// ============================================================================
// WHAT IS THIS FILE?
// The Module A home screen: a quick at-a-glance view of the LinkedIn
// connection status, how many posts are scheduled vs. already published,
// and two short lists (what's coming up, what went out recently) so you
// don't have to open the full calendar just to check on things.
// ============================================================================

import { useEffect } from "react";
import { Plus, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { usePostsStore, upcomingScheduled, recentlyPublished } from "../../store/usePostsStore";
import { PostStatusBadge } from "./PostStatusBadge";
import { LinkedInMark } from "./LinkedInMark";
import type { Post } from "../../../modules/posts/types/post";

interface DashboardProps {
  onCreatePost: () => void;
  onOpenPost: (post: Post) => void;
  onGoToConnect: () => void;
}

export function Dashboard({ onCreatePost, onOpenPost, onGoToConnect }: DashboardProps) {
  const { posts, loading, account, accountLoading, loadPosts, loadAccount } = usePostsStore();

  useEffect(() => {
    loadPosts();
    loadAccount();
  }, [loadPosts, loadAccount]);

  const upcoming = upcomingScheduled(posts);
  const published = recentlyPublished(posts);
  const draftCount = posts.filter((p) => p.status === "Draft").length;

  return (
    <div className="dashboard">
      <div className="dashboard__stats">
        <div className="stat-card" onClick={!accountLoading && !account ? onGoToConnect : undefined}>
          <LinkedInMark size={18} />
          <div>
            <p className="stat-card__value">{accountLoading ? "…" : account ? "Connected" : "Not connected"}</p>
            <p className="muted-text">LinkedIn account</p>
          </div>
        </div>
        <div className="stat-card">
          <CalendarIcon size={18} color="#3D5D8A" />
          <div>
            <p className="stat-card__value">{upcoming.length}</p>
            <p className="muted-text">Scheduled</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle2 size={18} color="#2F6B2A" />
          <div>
            <p className="stat-card__value">{published.length}</p>
            <p className="muted-text">Published</p>
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-card__value">{draftCount}</p>
          <p className="muted-text">Drafts</p>
        </div>
      </div>

      <button className="primary-button" onClick={onCreatePost}>
        <Plus size={14} /> New post
      </button>

      <div className="dashboard__columns">
        <div className="dashboard__column">
          <h3>Coming up</h3>
          {loading && <p className="muted-text">Loading…</p>}
          {!loading && upcoming.length === 0 && <p className="empty-state">Nothing scheduled yet.</p>}
          {upcoming.slice(0, 5).map((post) => (
            <button key={post.id} className="post-row" onClick={() => onOpenPost(post)}>
              <div>
                <p className="post-row__content">{post.content.slice(0, 80)}</p>
                <p className="muted-text">
                  {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "—"}
                </p>
              </div>
              <PostStatusBadge status={post.status} />
            </button>
          ))}
        </div>

        <div className="dashboard__column">
          <h3>Recently published</h3>
          {loading && <p className="muted-text">Loading…</p>}
          {!loading && published.length === 0 && <p className="empty-state">Nothing published yet.</p>}
          {published.slice(0, 5).map((post) => (
            <button key={post.id} className="post-row" onClick={() => onOpenPost(post)}>
              <div>
                <p className="post-row__content">{post.content.slice(0, 80)}</p>
                <p className="muted-text">
                  {post.published_at ? new Date(post.published_at).toLocaleString() : "—"}
                </p>
              </div>
              <PostStatusBadge status={post.status} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
