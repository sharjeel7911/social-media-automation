// ============================================================================
// WHAT IS THIS FILE?
// The small colored pill showing a lead's pipeline status (New /
// Contacted / Replied / Qualified / Won / Lost). Uses the same colors as
// Module C's status badges, so a lead looks the same in both places.
// ============================================================================

import type { LeadStatus } from "../../../modules/dashboard/types/summaries";

export const LEAD_STATUSES: LeadStatus[] = ["New", "Contacted", "Replied", "Qualified", "Won", "Lost"];
// ^ The full list, in pipeline order — also used to build the Kanban columns.

export const STATUS_COLORS: Record<LeadStatus, { tint: string; ink: string }> = {
  New: { tint: "#F7ECD9", ink: "#8A5A16" },
  Contacted: { tint: "#E6ECF5", ink: "#3D5D8A" },
  Replied: { tint: "#E1EFEC", ink: "#2F6F63" },
  Qualified: { tint: "#D9E6DE", ink: "#1F4E3F" },
  Won: { tint: "#E3EEDF", ink: "#2F6B2A" },
  Lost: { tint: "#F3E2DC", ink: "#A6432D" },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <span className="stage-badge" style={{ backgroundColor: c.tint, color: c.ink }}>
      {status}
    </span>
  );
}
