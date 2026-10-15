// ============================================================================
// WHAT IS THIS FILE?
// Shows a snapshot of the business's Google Business Profile — its local
// search ranking, review count/rating, and recent posts — per SOW Section
// 3.2 ("Google Business Profile post and local-ranking snapshot"). This
// is about LOCAL visibility specifically (e.g. ranking for "dentist near
// me"), separate from the regular keyword tracking elsewhere in this app.
// ============================================================================

import { useEffect } from "react";
import { RefreshCw, Star, MapPin, Loader2 } from "lucide-react";
import { useSeoStore } from "../../store/useSeoStore";

export function GoogleBusinessProfile() {
  const { gbp, loadingGbp, refreshingGbp, loadGbp, refreshGbp } = useSeoStore();

  useEffect(() => {
    loadGbp();
  }, [loadGbp]);

  if (loadingGbp) {
    return (
      <div className="loading-row">
        <Loader2 size={16} className="spin" /> Loading profile…
      </div>
    );
  }

  if (!gbp) {
    return <p className="empty-state">No Google Business Profile connected yet.</p>;
  }

  return (
    <div className="gbp">
      <div className="gbp__header">
        <div>
          <h3>{gbp.business_name}</h3>
          <p className="muted-text">Last checked {new Date(gbp.last_checked_at).toLocaleString()}</p>
        </div>
        <button className="secondary-button" onClick={refreshGbp} disabled={refreshingGbp}>
          {refreshingGbp ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>

      <div className="gbp__stats">
        <div className="stat-card">
          <MapPin size={18} color="#A6432D" />
          <div>
            <p className="stat-card__value">{gbp.local_rank ?? "—"}</p>
            <p className="muted-text">Local pack position</p>
          </div>
        </div>
        <div className="stat-card">
          <Star size={18} color="#8A5A16" />
          <div>
            <p className="stat-card__value">{gbp.average_rating.toFixed(1)}</p>
            <p className="muted-text">{gbp.review_count} reviews</p>
          </div>
        </div>
      </div>

      <h3>Recent posts</h3>
      {gbp.recent_posts.length === 0 && <p className="empty-state">No posts yet.</p>}
      {gbp.recent_posts.map((post) => (
        <div key={post.id} className="post-row" style={{ cursor: "default" }}>
          <div>
            <p className="post-row__content">{post.content}</p>
            <p className="muted-text">{new Date(post.posted_at).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
