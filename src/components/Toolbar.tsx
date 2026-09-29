// ============================================================================
// WHAT IS THIS FILE?
// This is the bar of controls at the very top of the app: the title,
// search box, status filter, remote/on-site filter, sort dropdown, the
// "Clear" button, and the "Export CSV" button. It doesn't hold any of
// this information itself — it just displays the CURRENT values (passed
// in from App.tsx / the shared store) and reports back up whenever the
// user changes something.
// ============================================================================

import { Search, Download, ArrowUpDown, RotateCcw } from "lucide-react";
import { STAGES } from "./StageBadge";
import type { LeadStatus } from "../../modules/leads/types/job";
import type { RemoteFilter, SortKey } from "../store/useLeadsStore";

interface ToolbarProps {
  // Everything this component needs to know (current values) and every
  // action it can trigger (functions), handed to it from outside.
  query: string;
  setQuery: (q: string) => void;
  statusFilter: LeadStatus | "All";
  setStatusFilter: (s: LeadStatus | "All") => void;
  remoteFilter: RemoteFilter;
  setRemoteFilter: (r: RemoteFilter) => void;
  sort: { key: SortKey; dir: "asc" | "desc" };
  toggleSort: (key: SortKey) => void;
  onClear: () => void;
  onExport: () => void;
}

const SORT_OPTIONS: Array<[SortKey, string]> = [
  ["date_posted", "Date posted"],
  ["company_name", "Company"],
  ["location", "Location"],
  ["status", "Status"],
];
// ^ The list of choices shown in the "Sort by" dropdown, paired with a
//   friendlier label to display for each one.

export function Toolbar({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  remoteFilter,
  setRemoteFilter,
  sort,
  toggleSort,
  onClear,
  onExport,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar__title">
        <h1>Signal Desk</h1>
        <p>Job postings matching your buyer signal, tracked from first sighting to close.</p>
      </div>

      <div className="search-box">
        <Search size={14} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, title, location" />
        {/* Every keystroke here immediately updates the shared search text
            via setQuery, which the grid then filters against. */}
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "All")}
        className="select-input"
      >
        <option value="All">All statuses</option>
        {STAGES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
        {/* Builds one dropdown option per status (New, Contacted, etc.),
            plus an "All statuses" option at the top to clear the filter. */}
      </select>

      <select
        value={remoteFilter}
        onChange={(e) => setRemoteFilter(e.target.value as RemoteFilter)}
        className="select-input"
      >
        <option value="all">Remote + on-site</option>
        <option value="remote">Remote only</option>
        <option value="onsite">On-site only</option>
      </select>

      <select value={sort.key} onChange={(e) => toggleSort(e.target.value as SortKey)} className="select-input">
        {SORT_OPTIONS.map(([key, label]) => (
          <option key={key} value={key}>
            Sort: {label} {sort.key === key ? (sort.dir === "asc" ? "↑" : "↓") : ""}
            {/* Shows a little up/down arrow next to whichever sort option
                is currently active, so you can see the direction at a glance. */}
          </option>
        ))}
      </select>
      <button className="icon-button" onClick={() => toggleSort(sort.key)} aria-label="Flip sort direction">
        <ArrowUpDown size={16} />
        {/* Clicking this flips the current sort's direction without
            changing which field it's sorting by. */}
      </button>

      <button className="secondary-button" onClick={onClear}>
        <RotateCcw size={13} /> Clear
      </button>
      {/* Resets every filter and the sort order back to their defaults. */}

      <button className="primary-button" onClick={onExport}>
        <Download size={14} /> Export CSV
      </button>
      {/* Triggers the CSV export flow (see export.ipc.ts). */}
    </div>
  );
}
