import { useEffect, useState } from "react";
import { useLeadsStore } from "../store/useLeadsStore";
import { Toolbar } from "../components/Toolbar";
import { LeadGrid } from "../components/LeadGrid";
import { NotesModal } from "../components/NotesModal";
import { OutreachModal } from "../components/OutreachModal";
import type { Lead } from "../../modules/leads/types/job";

export function LeadsPage() {
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

  const [notesLead, setNotesLead] = useState<Lead | null>(null);
  const [outreachLead, setOutreachLead] = useState<Lead | null>(null);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const leads = filteredLeads();

  return (
    <div className="leads-page">
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
      />

      <div className="status-row">
        <p className="muted-text">{loading ? "Loading leads…" : `${leads.length} leads shown`}</p>
        {(exportStatus || error) && <p className="muted-text export-status">{exportStatus || error}</p>}
      </div>

      {loading ? (
        <p className="empty-state">Loading leads from the database…</p>
      ) : (
        <LeadGrid leads={leads} onOpenNotes={setNotesLead} onOpenOutreach={setOutreachLead} />
      )}

      {notesLead && <NotesModal lead={notesLead} onClose={() => setNotesLead(null)} />}
      {outreachLead && <OutreachModal lead={outreachLead} onClose={() => setOutreachLead(null)} />}
    </div>
  );
}
