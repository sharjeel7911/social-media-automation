// ============================================================================
// WHAT IS THIS FILE?
// The SEO module's weekly report screen — per TASKS.md Module B "Weekly
// report view". Fetches and displays the weekly SEO health summary:
// tracked keywords, average rank, recent audits, technical checks, and
// rank history. Uses the `seo:getWeeklyReport` IPC channel which calls
// the NestJS Module B backend's ReportsService.
// ============================================================================

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, TrendingUp, Search, FileSearch, Shield, Download } from "lucide-react";
import { ScoreRing } from "./ScoreRing";

interface WeeklyKeyword {
  id: number;
  term: string;
  targetUrl: string | null;
  searchVolume: number;
  difficulty: number;
  currentRank: number | null;
  isTracked: boolean;
  createdAt: string;
}
interface WeeklyRankEntry {
  id: number;
  keywordId: number;
  rank: number | null;
  checkedAt: string;
}
interface WeeklyAudit {
  id: number;
  url: string;
  targetKeyword: string | null;
  score: number;
  createdAt: string;
}
interface WeeklyTechnicalCheck {
  id: number;
  url: string;
  score: number;
  createdAt: string;
}
interface WeeklyReport {
  period: { from: string; to: string };
  summary: {
    trackedKeywords: number;
    rankChecks: number;
    averageRank: number | null;
    auditsCompleted: number;
    averageAuditScore: number | null;
    technicalChecksCompleted: number;
    averageTechnicalScore: number | null;
  };
  keywords: WeeklyKeyword[];
  rankHistory: WeeklyRankEntry[];
  audits: WeeklyAudit[];
  technicalChecks: WeeklyTechnicalCheck[];
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Search;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="stat-card">
      <Icon size={18} color={color} />
      <div>
        <p className="stat-card__value">{value}</p>
        <p className="muted-text">{label}</p>
      </div>
    </div>
  );
}

export function WeeklyReport() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchReport() {
    setLoading(true);
    setError(null);
    try {
      const data = await window.electronAPI.getSeoWeeklyReport();
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, []);

  function exportCsv() {
    if (!report) return;
    const rows: string[] = ["Keyword,Volume,Difficulty,Current Rank"];
    for (const kw of report.keywords) {
      rows.push(
        `"${kw.term}",${kw.searchVolume},${kw.difficulty},${kw.currentRank ?? "—"}`
      );
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-weekly-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="loading-row">
        <Loader2 size={16} className="spin" /> Loading weekly SEO report…
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-report">
        <p className="empty-state">{error}</p>
        <button className="secondary-button" onClick={fetchReport}>
          <RefreshCw size={13} /> Try again
        </button>
      </div>
    );
  }

  if (!report) return null;

  const fromDate = new Date(report.period.from).toLocaleDateString();
  const toDate = new Date(report.period.to).toLocaleDateString();
  const { summary } = report;

  return (
    <div className="weekly-report">
      <div className="weekly-report__header">
        <div>
          <h3 className="weekly-report__title">Weekly SEO Report</h3>
          <p className="muted-text">
            {fromDate} – {toDate}
          </p>
        </div>
        <div className="button-row">
          <button className="secondary-button" onClick={fetchReport}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="primary-button" onClick={exportCsv} disabled={!report.keywords.length}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      <div className="dashboard__stats">
        <StatCard icon={Search} value={summary.trackedKeywords} label="Keywords tracked" color="#3D5D8A" />
        <StatCard icon={TrendingUp} value={summary.averageRank ?? "—"} label="Avg. rank this week" color="#2F6B2A" />
        <StatCard icon={FileSearch} value={summary.auditsCompleted} label="Audits completed" color="#8A5A16" />
        <StatCard icon={Shield} value={summary.technicalChecksCompleted} label="Technical checks" color="#A6432D" />
      </div>

      {(summary.averageAuditScore !== null || summary.averageTechnicalScore !== null) && (
        <div className="weekly-report__scores">
          {summary.averageAuditScore !== null && (
            <ScoreRing score={summary.averageAuditScore} label="Avg. on-page score" size={80} />
          )}
          {summary.averageTechnicalScore !== null && (
            <ScoreRing score={summary.averageTechnicalScore} label="Avg. technical score" size={80} />
          )}
        </div>
      )}

      <div className="dashboard__columns dashboard__columns--three">
        <div className="dashboard__column">
          <h3>Tracked keywords</h3>
          {report.keywords.length === 0 ? (
            <p className="empty-state">No keywords tracked yet.</p>
          ) : (
            <table className="rank-table">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Rank</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {report.keywords.map((kw) => (
                  <tr key={kw.id}>
                    <td>{kw.term}</td>
                    <td>{kw.currentRank ?? "—"}</td>
                    <td>{kw.searchVolume.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dashboard__column">
          <h3>Audits this week</h3>
          {report.audits.length === 0 ? (
            <p className="empty-state">No audits completed this week.</p>
          ) : (
            <div>
              {report.audits.map((audit) => (
                <div key={audit.id} className="post-row post-row--static">
                  <div>
                    <p className="post-row__content">{audit.url || "(raw content)"}</p>
                    <p className="muted-text">
                      Score: {audit.score} · {new Date(audit.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ScoreRing score={audit.score} label="" size={40} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard__column">
          <h3>Technical checks this week</h3>
          {report.technicalChecks.length === 0 ? (
            <p className="empty-state">No technical checks this week.</p>
          ) : (
            <div>
              {report.technicalChecks.map((tc) => (
                <div key={tc.id} className="post-row post-row--static">
                  <div>
                    <p className="post-row__content">{tc.url}</p>
                    <p className="muted-text">
                      Score: {tc.score} · {new Date(tc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ScoreRing score={tc.score} label="" size={40} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {report.rankHistory.length > 0 && (
        <div className="site-audit__history">
          <h3>Rank checks this week ({report.rankHistory.length})</h3>
          <table className="rank-table">
            <thead>
              <tr>
                <th>Keyword ID</th>
                <th>Rank</th>
                <th>Checked</th>
              </tr>
            </thead>
            <tbody>
              {report.rankHistory.slice(0, 20).map((entry) => (
                <tr key={entry.id}>
                  <td>#{entry.keywordId}</td>
                  <td>{entry.rank ?? "—"}</td>
                  <td>{new Date(entry.checkedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {report.rankHistory.length === 0 && (
        <p className="muted-text" style={{ marginTop: 16 }}>
          No rank checks recorded this week — the daily scheduler runs at 2 AM or trigger a manual check from the Rank Tracker tab.
        </p>
      )}
    </div>
  );
}
