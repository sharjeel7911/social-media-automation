// ============================================================================
// WHAT IS THIS FILE?
// This lays out ALL the leads as a grid of boxes (three per row, using
// LeadBox.tsx for each individual box), or shows a friendly message if
// there's nothing to show (for example, if the current search/filters
// don't match any leads).
// ============================================================================

import type { Lead } from "../../modules/leads/types/job";
import { LeadBox } from "./LeadBox";

interface LeadGridProps {
  leads: Lead[];
  // ^ The already-filtered-and-sorted list of leads to display.
  onOpenNotes: (lead: Lead) => void;
  onOpenOutreach: (lead: Lead) => void;
  // ^ Passed straight through to each individual LeadBox, so clicking
  //   its buttons still works.
}

export function LeadGrid({ leads, onOpenNotes, onOpenOutreach }: LeadGridProps) {
  if (leads.length === 0) {
    // Nothing to show — display a helpful message instead of an empty screen.
    return <p className="empty-state">No leads match these filters. Try clearing filters and sort.</p>;
  }

  return (
    <div className="lead-grid">
      {leads.map((lead) => (
        // For every lead in the list, draw one LeadBox. "key={lead.id}" is
        // a technical requirement React needs whenever you draw a list of
        // similar things — it helps React keep track of which box is
        // which if the list ever changes.
        <LeadBox key={lead.id} lead={lead} onOpenNotes={onOpenNotes} onOpenOutreach={onOpenOutreach} />
      ))}
    </div>
  );
}
