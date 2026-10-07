// ============================================================================
// WHAT IS THIS FILE?
// Compare your site against a competitor's and find keywords they rank
// for that you don't (or rank much lower for) — an opportunity list, per
// SOW Section 3.2 ("Competitor content-gap analysis").
// ============================================================================

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useSeoStore } from "../../store/useSeoStore";

export function CompetitorGap() {
  const { gapResults, loadGapResults, runningGap, runCompetitorGap } = useSeoStore();
  const [yourUrl, setYourUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");

  useEffect(() => {
    loadGapResults();
  }, [loadGapResults]);

  async function handleRun() {
    if (!yourUrl.trim() || !competitorUrl.trim()) return;
    await runCompetitorGap(yourUrl.trim(), competitorUrl.trim());
  }

  const latest = gapResults[0] ?? null;

  return (
    <div className="competitor-gap">
      <label className="field-label">Your site</label>
      <input value={yourUrl} onChange={(e) => setYourUrl(e.target.value)} placeholder="https://your-site.com" className="text-input" />

      <label className="field-label">Competitor's site</label>
      <input
        value={competitorUrl}
        onChange={(e) => setCompetitorUrl(e.target.value)}
        placeholder="https://competitor.com"
        className="text-input"
      />

      <button className="primary-button" style={{ marginTop: 12 }} onClick={handleRun} disabled={runningGap || !yourUrl.trim() || !competitorUrl.trim()}>
        {runningGap ? <Loader2 size={14} className="spin" /> : <Search size={14} />}
        Compare
      </button>

      {runningGap && (
        <div className="loading-row">
          <Loader2 size={16} className="spin" /> Comparing keyword rankings…
        </div>
      )}

      {!runningGap && !latest && <p className="empty-state">Enter both URLs above to find keyword gaps.</p>}

      {!runningGap && latest && (
        <table className="rank-table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Their rank</th>
              <th>Your rank</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {latest.gaps
              .sort((a, b) => a.competitor_rank - b.competitor_rank)
              .map((gap) => (
                <tr key={gap.keyword}>
                  <td>{gap.keyword}</td>
                  <td>#{gap.competitor_rank}</td>
                  <td className={gap.your_rank === null ? "error-text" : undefined}>
                    {gap.your_rank === null ? "Not ranking" : `#${gap.your_rank}`}
                  </td>
                  <td>{gap.search_volume.toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
