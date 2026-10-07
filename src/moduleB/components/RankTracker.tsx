// ============================================================================
// WHAT IS THIS FILE?
// Shows every keyword you're actively tracking, its current ranking
// position, how that's changed since last time (up/down/same), and a
// small trend line of its rank history — per SOW Section 3.2 ("Rank
// tracking for target keywords over time").
// ============================================================================

import { useEffect } from "react";
import { ArrowUp, ArrowDown, Minus, Sparkles, Trash2 } from "lucide-react";
import { useSeoStore } from "../../store/useSeoStore";
import type { TrackedKeyword } from "../../../modules/seo/types/keyword";

function TrendIcon({ trend }: { trend: TrackedKeyword["trend"] }) {
  if (trend === "up") return <ArrowUp size={14} color="#2F6B2A" />;
  if (trend === "down") return <ArrowDown size={14} color="#A6432D" />;
  if (trend === "new") return <Sparkles size={14} color="#3D5D8A" />;
  return <Minus size={14} color="var(--ink-muted)" />;
}

function Sparkline({ history }: { history: TrackedKeyword["history"] }) {
  // Draws a tiny line chart of rank over time, using plain SVG — no
  // charting library needed for something this small. Note: a LOWER rank
  // number is better (rank 1 beats rank 50), so the line is drawn
  // upside-down on purpose (low rank = high on the chart).
  const ranks = history.map((h) => h.rank ?? 100);
  const max = Math.max(...ranks, 1);
  const min = Math.min(...ranks, 1);
  const range = Math.max(max - min, 1);
  const width = 80;
  const height = 24;

  const points = ranks
    .map((rank, i) => {
      const x = (i / Math.max(ranks.length - 1, 1)) * width;
      const y = ((rank - min) / range) * height;
      // ^ NOT flipped the usual way — since lower rank is better, a
      //   smaller "y" (higher on screen) should represent a BETTER rank,
      //   which this formula already does naturally.
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="sparkline">
      <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
    </svg>
  );
}

export function RankTracker() {
  const { trackedKeywords, loadingKeywords, loadTrackedKeywords, untrackKeyword } = useSeoStore();

  useEffect(() => {
    loadTrackedKeywords();
  }, [loadTrackedKeywords]);

  return (
    <div className="rank-tracker">
      {loadingKeywords && <p className="muted-text">Loading…</p>}
      {!loadingKeywords && trackedKeywords.length === 0 && (
        <p className="empty-state">
          Nothing tracked yet — search for a keyword on the Keyword Research tab and click "Track".
        </p>
      )}

      {trackedKeywords.length > 0 && (
        <table className="rank-table">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Rank</th>
              <th>Trend</th>
              <th>History</th>
              <th>Volume</th>
              <th>Difficulty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {trackedKeywords.map((k) => (
              <tr key={k.id}>
                <td>{k.keyword}</td>
                <td>{k.current_rank ?? "—"}</td>
                <td>
                  <span className="rank-table__trend">
                    <TrendIcon trend={k.trend} />
                    {k.previous_rank !== null && k.current_rank !== null
                      ? Math.abs(k.previous_rank - k.current_rank)
                      : ""}
                  </span>
                </td>
                <td>
                  <Sparkline history={k.history} />
                </td>
                <td>{k.search_volume.toLocaleString()}</td>
                <td>{k.difficulty}</td>
                <td>
                  <button className="icon-button" onClick={() => untrackKeyword(k.id)} aria-label="Stop tracking">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
