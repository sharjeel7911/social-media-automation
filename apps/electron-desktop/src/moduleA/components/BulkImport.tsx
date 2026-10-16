// ============================================================================
// WHAT IS THIS FILE?
// CSV bulk import screen for Module A.
// Lets users paste or upload a CSV with columns:
//   content, scheduled_at (optional), platform (optional), utm_campaign (optional)
// Shows a parsed preview table, then submits all rows in one batch call.
// ============================================================================

import { useRef, useState } from "react";
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { usePostsStore } from "../../store/usePostsStore";
import type { Post } from "../../../modules/posts/types/post";

type ImportRow = {
  content: string;
  scheduled_at: string | null;
  platform: Post["platform"];
  utm_campaign: string | null;
  error?: string;
};

const PLATFORMS: Post["platform"][] = [
  "linkedin", "facebook", "instagram", "twitter",
  "tiktok", "youtube", "pinterest", "gbp",
];

function parseRows(csv: string): ImportRow[] {
  const lines = csv.trim().split(/\r?\n/);
  if (!lines.length) return [];

  // Detect header row
  const firstLineLower = lines[0].toLowerCase();
  const hasHeader = firstLineLower.includes("content");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  // Rough CSV parser (handles quoted fields)
  function parseLine(line: string): string[] {
    const fields: string[] = [];
    let inQuote = false;
    let cur = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        fields.push(cur); cur = "";
      } else {
        cur += ch;
      }
    }
    fields.push(cur);
    return fields.map((f) => f.trim());
  }

  return dataLines
    .filter((l) => l.trim())
    .map((line): ImportRow => {
      const [content, scheduled_at_raw, platform_raw, utm_campaign] = parseLine(line);
      const content_clean = content?.replace(/^"|"$/g, "").trim();
      if (!content_clean) return { content: "", scheduled_at: null, platform: "linkedin", utm_campaign: null, error: "Empty content" };

      let scheduled_at: string | null = null;
      if (scheduled_at_raw?.trim()) {
        const d = new Date(scheduled_at_raw.trim());
        scheduled_at = isNaN(d.getTime()) ? null : d.toISOString();
        if (!scheduled_at) return { content: content_clean, scheduled_at: null, platform: "linkedin", utm_campaign: null, error: `Bad date: "${scheduled_at_raw}"` };
      }

      const platform_val = platform_raw?.trim().toLowerCase() as Post["platform"];
      const platform: Post["platform"] = PLATFORMS.includes(platform_val) ? platform_val : "linkedin";

      return {
        content: content_clean,
        scheduled_at,
        platform,
        utm_campaign: utm_campaign?.trim() || null,
      };
    });
}

interface BulkImportProps {
  onDone: () => void;
}

export function BulkImport({ onDone }: BulkImportProps) {
  const { bulkCreatePosts } = usePostsStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [csv, setCsv]         = useState("");
  const [rows, setRows]       = useState<ImportRow[]>([]);
  const [parsed, setParsed]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ ok: boolean; count?: number; error?: string } | null>(null);

  function handleParse() {
    const r = parseRows(csv);
    setRows(r);
    setParsed(true);
    setResult(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setCsv(String(reader.result)); setParsed(false); };
    reader.readAsText(file);
  }

  async function handleImport() {
    const valid = rows.filter((r) => !r.error && r.content);
    if (!valid.length) return;
    setLoading(true);
    const res = await bulkCreatePosts(valid);
    setLoading(false);
    setResult(res);
    if (res.ok) { setCsv(""); setRows([]); setParsed(false); }
  }

  const validCount = rows.filter((r) => !r.error).length;
  const errorCount = rows.filter((r) => r.error).length;

  return (
    <div className="bulk-import">
      <h2 className="section-title">Bulk CSV Import</h2>
      <p className="muted-text bulk-import__desc">
        Import up to 500 posts at once from a CSV file. Each row becomes a post.
      </p>

      <div className="bulk-import__format">
        <p className="field-label">CSV format (header row is optional):</p>
        <code className="bulk-import__code">
          content, scheduled_at, platform, utm_campaign{"\n"}
          "Your post text here", 2026-11-01T09:00, linkedin, q4-promo
        </code>
      </div>

      <div className="button-row" style={{ gap: 8, marginBottom: 12 }}>
        <button className="secondary-button" onClick={() => fileRef.current?.click()}>
          <Upload size={14} /> Upload CSV file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      <label className="field-label">Or paste CSV directly:</label>
      <textarea
        className="textarea"
        rows={8}
        placeholder={`content, scheduled_at, platform, utm_campaign\n"Post text here",2026-11-01T09:00,linkedin,q4-campaign\n"Another post",2026-11-05T10:00,facebook,`}
        value={csv}
        onChange={(e) => { setCsv(e.target.value); setParsed(false); }}
      />

      <div className="button-row" style={{ marginTop: 8 }}>
        <button className="secondary-button" onClick={handleParse} disabled={!csv.trim()}>
          <FileText size={14} /> Parse &amp; Preview
        </button>
        {parsed && validCount > 0 && (
          <button className="primary-button" onClick={handleImport} disabled={loading}>
            {loading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
            Import {validCount} post{validCount !== 1 ? "s" : ""}
          </button>
        )}
        <button className="secondary-button" style={{ marginLeft: "auto" }} onClick={onDone}>
          Cancel
        </button>
      </div>

      {result && (
        <div className={`bulk-import__result ${result.ok ? "bulk-import__result--ok" : "bulk-import__result--error"}`}>
          {result.ok
            ? <><CheckCircle2 size={16} /> Successfully imported {result.count} post{result.count !== 1 ? "s" : ""}.</>
            : <><XCircle size={16} /> Import failed: {result.error}</>
          }
        </div>
      )}

      {parsed && rows.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p className="field-label">
            Preview — {validCount} valid, {errorCount} with errors
          </p>
          <div className="bulk-import__table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Content</th>
                  <th>Platform</th>
                  <th>Scheduled at</th>
                  <th>UTM campaign</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={row.error ? "bulk-import__row--error" : ""}>
                    <td>{i + 1}</td>
                    <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.content || "—"}
                    </td>
                    <td>{row.platform}</td>
                    <td>{row.scheduled_at ? new Date(row.scheduled_at).toLocaleString() : "Draft"}</td>
                    <td>{row.utm_campaign || "—"}</td>
                    <td>
                      {row.error
                        ? <span style={{ color: "var(--color-danger, #c0392b)" }}><XCircle size={13} style={{ display: "inline" }} /> {row.error}</span>
                        : <span style={{ color: "var(--color-success, #2F6B2A)" }}><CheckCircle2 size={13} style={{ display: "inline" }} /> OK</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
