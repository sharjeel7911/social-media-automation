// ============================================================================
// WHAT IS THIS FILE?
// The SEO toolkit's home screen: a quick at-a-glance "SEO health" summary
// — how many keywords are tracked and their average position, the most
// recent site audit's score, and the Google Business Profile's local
// ranking — so you don't have to open every individual tool just to check
// how things are doing overall. This is the frontend's stand-in for the
// SOW's "automated weekly SEO health report" (Section 3.2) — a real
// scheduled report/export is a backend feature for later; this screen is
// the always-up-to-date equivalent you can check any time.
// ============================================================================

import { useEffect } from "react";
import { Search, FileSearch, Users, MapPin } from "lucide-react";
import { useSeoStore } from "../../store/useSeoStore";
import { ScoreRing } from "./ScoreRing";

interface DashboardProps {
  onGoTo: (tab: "keywords" | "rank" | "audit" | "competitor" | "gbp") => void;
}

export function Dashboard({ onGoTo }: DashboardProps) {
  const { trackedKeywords, loadTrackedKeywords, audits, loadAudits, gbp, loadGbp, loadingGbp } = useSeoStore();

  useEffect(() => {
    loadTrackedKeywords();
    loadAudits();
    loadGbp();
  }, [loadTrackedKeywords, loadAudits, loadGbp]);

  const rankedKeywords = trackedKeywords.filter((k) => k.current_rank !== null);
  const averageRank = rankedKeywords.length
    ? Math.round(rankedKeywords.reduce((sum, k) => sum + (k.current_rank ?? 0), 0) / rankedKeywords.length)
    : null;
  const latestAudit = audits[0] ?? null;

  return (
    <div className="dashboard">
      <div className="dashboard__stats">
        <button className="stat-card stat-card--clickable" onClick={() => onGoTo("rank")}>
          <Search size={18} color="#3D5D8A" />
          <div>
            <p className="stat-card__value">{trackedKeywords.length}</p>
            <p className="muted-text">Keywords tracked</p>
          </div>
        </button>
        <button className="stat-card stat-card--clickable" onClick={() => onGoTo("rank")}>
          <div>
            <p className="stat-card__value">{averageRank ?? "—"}</p>
            <p className="muted-text">Average position</p>
          </div>
        </button>
        <button className="stat-card stat-card--clickable" onClick={() => onGoTo("audit")}>
          <FileSearch size={18} color="#2F6B2A" />
          <div>
            <p className="stat-card__value">{latestAudit ? latestAudit.onpage_score : "—"}</p>
            <p className="muted-text">Latest audit score</p>
          </div>
        </button>
        <button className="stat-card stat-card--clickable" onClick={() => onGoTo("gbp")}>
          <MapPin size={18} color="#A6432D" />
          <div>
            <p className="stat-card__value">{loadingGbp ? "…" : gbp?.local_rank ?? "—"}</p>
            <p className="muted-text">Local pack rank</p>
          </div>
        </button>
      </div>

      <div className="dashboard__columns dashboard__columns--three">
        <div className="dashboard__column">
          <h3>Top tracked keywords</h3>
          {trackedKeywords.length === 0 && <p className="empty-state">No keywords tracked yet.</p>}
          {trackedKeywords.slice(0, 5).map((k) => (
            <div key={k.id} className="post-row" onClick={() => onGoTo("rank")}>
              <div>
                <p className="post-row__content">{k.keyword}</p>
                <p className="muted-text">Vol. {k.search_volume.toLocaleString()} · Difficulty {k.difficulty}</p>
              </div>
              <span className="muted-text">#{k.current_rank ?? "—"}</span>
            </div>
          ))}
        </div>

        <div className="dashboard__column">
          <h3>Most recent audit</h3>
          {!latestAudit && <p className="empty-state">No audits run yet.</p>}
          {latestAudit && (
            <div className="audit-summary" onClick={() => onGoTo("audit")}>
              <ScoreRing score={latestAudit.onpage_score} label="On-page" size={60} />
              <ScoreRing score={latestAudit.page_speed_score} label="Page speed" size={60} />
              <p className="muted-text">{latestAudit.url}</p>
            </div>
          )}
        </div>

        <div className="dashboard__column">
          <h3>Google Business Profile</h3>
          {loadingGbp && <p className="muted-text">Loading…</p>}
          {!loadingGbp && !gbp && <p className="empty-state">Not connected yet.</p>}
          {gbp && (
            <div onClick={() => onGoTo("gbp")} className="post-row" style={{ cursor: "pointer" }}>
              <div>
                <p className="post-row__content">{gbp.business_name}</p>
                <p className="muted-text">
                  {gbp.average_rating.toFixed(1)}★ · {gbp.review_count} reviews
                </p>
              </div>
              <Users size={16} color="var(--ink-muted)" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
