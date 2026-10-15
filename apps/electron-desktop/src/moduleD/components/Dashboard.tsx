// ============================================================================
// WHAT IS THIS FILE?
// The home screen — per SOW Section 3.4 ("Home dashboard: upcoming
// scheduled posts, latest leads, SEO health snapshot, engagement KPIs").
// It pulls one small slice from each of the other modules into a single
// at-a-glance view, so you can see how everything is going without
// opening each tool separately.
// ============================================================================

import { useEffect } from "react";
import { CalendarClock, Target, Gauge, TrendingUp } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { ScoreRing } from "./ScoreRing";

interface DashboardProps {
  onGoTo: (tab: "analytics" | "pipeline") => void;
}

export function Dashboard({ onGoTo }: DashboardProps) {
  const { upcomingPosts, latestLeads, seo, loadingHome, loadHome, analytics, loadAnalytics } = useDashboardStore();

  useEffect(() => {
    loadHome();
    loadAnalytics();
    // The engagement KPIs on this screen come from the same numbers the
    // Analytics screen uses, so we make sure those are loaded too.
  }, [loadHome, loadAnalytics]);

  const newLeads = latestLeads.filter((l) => l.status === "New").length;

  return (
    <div className="dashboard">
      <div className="dashboard__stats">
        <button className="stat-card stat-card--clickable" onClick={() => onGoTo("analytics")}>
          <TrendingUp size={18} color="#3D5D8A" />
          <div>
            <p className="stat-card__value">{analytics ? analytics.total_impressions_30d.toLocaleString() : "…"}</p>
            <p className="muted-text">Impressions (30 days)</p>
          </div>
        </button>
        <button className="stat-card stat-card--clickable" onClick={() => onGoTo("analytics")}>
          <div>
            <p className="stat-card__value">{analytics ? `${analytics.average_engagement_rate_30d}%` : "…"}</p>
            <p className="muted-text">Avg. engagement rate</p>
          </div>
        </button>
        <button className="stat-card stat-card--clickable" onClick={() => onGoTo("analytics")}>
          <div>
            <p className="stat-card__value">{analytics ? `+${analytics.follower_growth_30d}` : "…"}</p>
            <p className="muted-text">New followers (30 days)</p>
          </div>
        </button>
        <button className="stat-card stat-card--clickable" onClick={() => onGoTo("pipeline")}>
          <Target size={18} color="#A6432D" />
          <div>
            <p className="stat-card__value">{loadingHome ? "…" : newLeads}</p>
            <p className="muted-text">New leads waiting</p>
          </div>
        </button>
      </div>

      <div className="dashboard__columns dashboard__columns--three">
        <div className="dashboard__column">
          <h3>
            <CalendarClock size={14} /> Upcoming posts
          </h3>
          {loadingHome && <p className="muted-text">Loading…</p>}
          {!loadingHome && upcomingPosts.length === 0 && <p className="empty-state">Nothing scheduled.</p>}
          {upcomingPosts.slice(0, 4).map((post) => (
            <div key={post.id} className="post-row post-row--static">
              <div>
                <p className="post-row__content">{post.content.slice(0, 70)}</p>
                <p className="muted-text">{post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "—"}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard__column">
          <h3>
            <Target size={14} /> Latest leads
          </h3>
          {loadingHome && <p className="muted-text">Loading…</p>}
          {latestLeads.map((lead) => (
            <div key={lead.id} className="post-row" onClick={() => onGoTo("pipeline")}>
              <div>
                <p className="post-row__content">{lead.company_name}</p>
                <p className="muted-text">{lead.job_title}</p>
              </div>
              <LeadStatusBadge status={lead.status} />
            </div>
          ))}
        </div>

        <div className="dashboard__column">
          <h3>
            <Gauge size={14} /> SEO health
          </h3>
          {loadingHome && <p className="muted-text">Loading…</p>}
          {seo && (
            <>
              <div className="seo-rings">
                <ScoreRing score={seo.onpage_score} label="On-page" size={68} />
                <ScoreRing score={seo.page_speed_score} label="Page speed" size={68} />
              </div>
              <p className="muted-text">
                {seo.tracked_keywords} keywords tracked · avg. position {seo.average_rank ?? "—"} · local rank #
                {seo.local_rank ?? "—"}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
