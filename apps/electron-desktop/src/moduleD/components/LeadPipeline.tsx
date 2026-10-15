// ============================================================================
// WHAT IS THIS FILE?
// The Kanban-style lead pipeline — per SOW Section 3.4 ("Kanban-style lead
// pipeline view synced with Module C"). One column per status (New →
// Contacted → Replied → Qualified → Won / Lost), with each lead shown as
// a small card. Drag a card from one column to another to move that lead
// to a new status.
//
// "Synced with Module C" is the goal, but right now these leads are fake
// sample data (see electron/ipc/dashboard.ipc.ts). The real syncing
// depends on the team's decision described in
// modules/dashboard/services/dataSync.ts.
// ============================================================================

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { LEAD_STATUSES, STATUS_COLORS } from "./LeadStatusBadge";
import type { LeadStatus } from "../../../modules/dashboard/types/summaries";

export function LeadPipeline() {
  const { pipelineLeads, loadingPipeline, loadPipeline, moveLead } = useDashboardStore();
  const draggingId = useRef<number | null>(null);
  // ^ Remembers which card is currently being dragged. A "ref" is used
  //   instead of normal state since changing it shouldn't redraw the screen.
  const [hoverColumn, setHoverColumn] = useState<LeadStatus | null>(null);
  // ^ Which column the dragged card is currently hovering over, so we can
  //   highlight it as a drop target.

  useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  if (loadingPipeline) {
    return (
      <div className="loading-row">
        <Loader2 size={16} className="spin" /> Loading pipeline…
      </div>
    );
  }

  return (
    <div className="pipeline">
      {LEAD_STATUSES.map((status) => {
        const columnLeads = pipelineLeads.filter((l) => l.status === status);
        const color = STATUS_COLORS[status];
        return (
          <div
            key={status}
            className={hoverColumn === status ? "pipeline__column pipeline__column--hover" : "pipeline__column"}
            onDragOver={(e) => {
              e.preventDefault();
              // ^ Browsers block dropping by default — this one line is
              //   what permits a drop on this column.
              setHoverColumn(status);
            }}
            onDragLeave={() => setHoverColumn(null)}
            onDrop={() => {
              if (draggingId.current !== null) moveLead(draggingId.current, status);
              draggingId.current = null;
              setHoverColumn(null);
            }}
          >
            <div className="pipeline__column-header">
              <span style={{ color: color.ink }}>{status}</span>
              <span className="muted-text">{columnLeads.length}</span>
            </div>

            {columnLeads.length === 0 && <p className="pipeline__empty">Nothing here yet</p>}

            {columnLeads.map((lead) => (
              <div
                key={lead.id}
                className="pipeline__card"
                draggable
                onDragStart={() => {
                  draggingId.current = lead.id;
                }}
                style={{ borderLeft: `3px solid ${color.ink}` }}
              >
                <p className="pipeline__card-company">{lead.company_name}</p>
                <p className="muted-text">{lead.job_title}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
