// ============================================================================
// WHAT IS THIS FILE?
// The reports screen — per SOW Section 3.4 ("Exportable weekly/monthly
// PDF or CSV reports"). Pick weekly or monthly, see a one-page summary of
// the numbers from across the whole app, and export it as a CSV file you
// can open in Excel or Google Sheets.
//
// The CSV export is REAL — it opens a genuine "Save File" window and
// writes an actual file. The numbers inside it are placeholder data for
// now. PDF export isn't built yet: it needs a PDF-generating library on
// the background side, which is a reasonable next step once the real data
// sources exist (no point polishing the layout of fake numbers).
// ============================================================================

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import type { ReportPeriod } from "../../../modules/dashboard/types/report";

export function Reports() {
  const { report, loadingReport, loadReport, exportReport, exportStatus } = useDashboardStore();
  const [period, setPeriod] = useState<ReportPeriod>("weekly");

  useEffect(() => {
    loadReport(period);
  }, [period, loadReport]);
  // ^ Re-fetches the report whenever the weekly/monthly toggle changes.

  const rows: Array<[string, string]> = report
    ? [
        ["Posts published", String(report.posts_published)],
        ["Total impressions", report.total_impressions.toLocaleString()],
        ["Average engagement rate", `${report.average_engagement_rate}%`],
        ["Follower growth", `+${report.follower_growth}`],
        ["Leads added", String(report.leads_added)],
        ["Leads won", String(report.leads_won)],
        ["Average SEO score", String(report.average_seo_score)],
      ]
    : [];

  return (
    <div className="reports">
      <div className="button-row">
        <button
          className={period === "weekly" ? "secondary-button secondary-button--active" : "secondary-button"}
          onClick={() => setPeriod("weekly")}
        >
          Weekly
        </button>
        <button
          className={period === "monthly" ? "secondary-button secondary-button--active" : "secondary-button"}
          onClick={() => setPeriod("monthly")}
        >
          Monthly
        </button>
        <button className="primary-button reports__export" onClick={exportReport} disabled={!report || loadingReport}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {exportStatus && <p className="muted-text export-status">{exportStatus}</p>}

      {loadingReport || !report ? (
        <div className="loading-row">
          <Loader2 size={16} className="spin" /> Building report…
        </div>
      ) : (
        <div className="report-card">
          <h3>{period === "weekly" ? "Weekly" : "Monthly"} report</h3>
          <p className="muted-text">
            {new Date(report.period_start).toLocaleDateString()} – {new Date(report.period_end).toLocaleDateString()}
          </p>
          <table className="data-table report-card__table">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="report-card__value">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
