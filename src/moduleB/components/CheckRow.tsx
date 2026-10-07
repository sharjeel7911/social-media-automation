// ============================================================================
// WHAT IS THIS FILE?
// A single row in a checklist — a label, a pass/warn/fail icon, and a
// short explanation. Used by the Site Audit screen for both the on-page
// checks and the technical checks (sitemap, broken links, etc.).
// ============================================================================

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { AuditCheck } from "../../../modules/seo/types/audit";

const ICONS = {
  pass: <CheckCircle2 size={16} color="#2F6B2A" />,
  warn: <AlertTriangle size={16} color="#8A5A16" />,
  fail: <XCircle size={16} color="#A6432D" />,
};

export function CheckRow({ check }: { check: AuditCheck }) {
  return (
    <div className="check-row">
      {ICONS[check.status]}
      <div>
        <p className="check-row__label">{check.label}</p>
        <p className="muted-text">{check.detail}</p>
      </div>
    </div>
  );
}
