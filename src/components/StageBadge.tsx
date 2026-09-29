// ============================================================================
// WHAT IS THIS FILE?
// A small, reusable piece of on-screen decoration: the little colored
// pill/badge that shows a lead's status (like "New" or "Won"), with a
// different color for each status so you can spot them at a glance.
// ============================================================================

import type { LeadStatus } from "../../modules/leads/types/job";

export const STAGES: LeadStatus[] = ["New", "Contacted", "Replied", "Qualified", "Won", "Lost"];
// ^ The full list of possible statuses, in the order we want them shown
//   in dropdown menus elsewhere in the app.

const TINTS: Record<LeadStatus, { tint: string; ink: string }> = {
  // For every status, this picks a soft background color ("tint") and a
  // matching darker text color ("ink") so the badge is easy to read.
  New: { tint: "#F7ECD9", ink: "#8A5A16" },
  Contacted: { tint: "#E6ECF5", ink: "#3D5D8A" },
  Replied: { tint: "#E1EFEC", ink: "#2F6F63" },
  Qualified: { tint: "#D9E6DE", ink: "#1F4E3F" },
  Won: { tint: "#E3EEDF", ink: "#2F6B2A" },
  Lost: { tint: "#F3E2DC", ink: "#A6432D" },
};

export function stageMeta(key: LeadStatus) {
  // A little lookup helper: given a status, hand back its colors.
  return TINTS[key] ?? TINTS.New;
  // ^ Falls back to the "New" colors if somehow given a status we don't recognize.
}

export function StageBadge({ status }: { status: LeadStatus }) {
  // The actual on-screen badge component. Give it a status, it draws a
  // small colored pill with that status's name inside it.
  const m = stageMeta(status);
  return (
    <span className="stage-badge" style={{ backgroundColor: m.tint, color: m.ink }}>
      {status}
    </span>
  );
}
