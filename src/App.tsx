// ============================================================================
// WHAT IS THIS FILE?
// This is the "conductor" of the whole on-screen app — the top-level
// component everything else lives inside of. Its job is to:
//   1. Ask the shared store (useLeadsStore.ts) for the current leads,
//      filters, and sort order.
//   2. Trigger loading the leads from the database as soon as the app opens.
//   3. Decide which pop-up window (if any) should currently be showing.
//   4. Arrange the Toolbar and LeadGrid components on screen.
// ============================================================================

import { useEffect, useState } from "react";
import { useLeadsStore } from "./store/useLeadsStore";
import { Toolbar } from "./components/Toolbar";
import { LeadGrid } from "./components/LeadGrid";
import { NotesModal } from "./components/NotesModal";
import { OutreachModal } from "./components/OutreachModal";
import type { Lead } from "../modules/leads/types/job";

function App() {
  const {
    loading,
    error,
    query,
    statusFilter,
    remoteFilter,
    sort,
    exportStatus,
    loadLeads,
    setQuery,
    setStatusFilter,
    setRemoteFilter,
    toggleSort,
    clearFiltersAndSort,
    exportLeads,
    filteredLeads,
  } = useLeadsStore();
  // ^ Pulls out everything this component needs from the shared store —
  //   both the current values and the actions that can change them.

  const [notesLead, setNotesLead] = useState<Lead | null>(null);
  // ^ Which lead (if any) currently has its notes pop-up open. "null"
  //   means "no pop-up is open right now."
  const [outreachLead, setOutreachLead] = useState<Lead | null>(null);
  // ^ Same idea, but for the outreach-message pop-up.

  useEffect(() => {
    loadLeads();
    // ^ As soon as the app first appears on screen, fetch the real leads
    //   from the database. The empty "[]" just below means "only run this
    //   once, right at the start" rather than repeatedly.
  }, [loadLeads]);

  const leads = filteredLeads();
  // ^ Gets the current, already-filtered-and-sorted list of leads to display.

  return (
    <div className="app">
      <Toolbar
        query={query}
        setQuery={setQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        remoteFilter={remoteFilter}
        setRemoteFilter={setRemoteFilter}
        sort={sort}
        toggleSort={toggleSort}
        onClear={clearFiltersAndSort}
        onExport={() => exportLeads(leads)}
        // ^ When Export is clicked, export exactly what's currently being
        //   shown (i.e. respecting the active search/filters).
      />

      <div className="status-row">
        <p className="muted-text">{loading ? "Loading leads…" : `${leads.length} leads shown`}</p>
        {(exportStatus || error) && <p className="muted-text export-status">{exportStatus || error}</p>}
        {/* A small status line showing either "Loading leads…", a live
            count of leads currently shown, or an export confirmation/error
            message. */}
      </div>

      {loading ? (
        <p className="empty-state">Loading leads from the database…</p>
      ) : (
        <LeadGrid leads={leads} onOpenNotes={setNotesLead} onOpenOutreach={setOutreachLead} />
      )}
      {/* While still loading, show a message. Once loaded, show the grid
          of lead boxes, and hand it the functions to open either pop-up
          window when a box's buttons are clicked. */}

      {notesLead && <NotesModal lead={notesLead} onClose={() => setNotesLead(null)} />}
      {outreachLead && <OutreachModal lead={outreachLead} onClose={() => setOutreachLead(null)} />}
      {/* These pop-up windows only actually appear on screen when there's
          a lead selected for them (notesLead / outreachLead isn't null).
          Closing either one sets it back to null, which makes it disappear. */}
    </div>
  );
}

export default App;
