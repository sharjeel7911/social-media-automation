// ============================================================================
// WHAT IS THIS FILE?
// Enter a URL, run an audit, and see two things together: an on-page
// content-optimization score with a checklist (title tag, meta
// description, headings, etc.) and the technical SEO checklist (sitemap,
// broken links, HTTPS, mobile-friendliness) plus a page-speed score — per
// SOW Section 3.2's "On-page SEO audit" and "Technical SEO checks"
// bullets. They're shown together here since both naturally happen "per
// URL you're checking," even though a real backend would treat them as
// two separate integrations (see modules/seo/services/technicalChecks.ts).
// ============================================================================

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useSeoStore } from "../../store/useSeoStore";
import { ScoreRing } from "./ScoreRing";
import { CheckRow } from "./CheckRow";

export function SiteAudit() {
  const { audits, loadAudits, auditing, runAudit } = useSeoStore();
  const [url, setUrl] = useState("");

  useEffect(() => {
    loadAudits();
  }, [loadAudits]);

  async function handleRun() {
    if (!url.trim()) return;
    await runAudit(url.trim());
  }

  const latest = audits[0] ?? null;

  return (
    <div className="site-audit">
      <div className="button-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRun()}
          placeholder="https://your-site.com/page-to-check"
          className="text-input"
        />
        <button className="primary-button" onClick={handleRun} disabled={auditing || !url.trim()}>
          {auditing ? <Loader2 size={14} className="spin" /> : <Search size={14} />}
          Run audit
        </button>
      </div>

      {auditing && (
        <div className="loading-row">
          <Loader2 size={16} className="spin" /> Checking the page…
        </div>
      )}

      {!auditing && !latest && <p className="empty-state">Run your first audit by entering a URL above.</p>}

      {!auditing && latest && (
        <div className="site-audit__result">
          <div className="site-audit__scores">
            <ScoreRing score={latest.onpage_score} label="On-page score" size={88} />
            <ScoreRing score={latest.page_speed_score} label="Page speed" size={88} />
            <p className="muted-text site-audit__url">{latest.url}</p>
          </div>

          <div className="site-audit__columns">
            <div>
              <h3>On-page checks</h3>
              {latest.onpage_checks.map((check, i) => (
                <CheckRow key={i} check={check} />
              ))}
            </div>
            <div>
              <h3>Technical checks</h3>
              {latest.technical_checks.map((check, i) => (
                <CheckRow key={i} check={check} />
              ))}
            </div>
          </div>
        </div>
      )}

      {audits.length > 1 && (
        <div className="site-audit__history">
          <h3>Past audits</h3>
          {audits.slice(1).map((a) => (
            <div key={a.id} className="post-row">
              <div>
                <p className="post-row__content">{a.url}</p>
                <p className="muted-text">{new Date(a.created_at).toLocaleString()}</p>
              </div>
              <span className="muted-text">Score: {a.onpage_score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
