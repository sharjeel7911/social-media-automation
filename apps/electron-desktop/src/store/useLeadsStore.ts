// ============================================================================
// WHAT IS THIS FILE?
// This is the app's shared "memory" — the one central place that holds:
//   - the full list of leads
//   - what the user has typed into the search box
//   - which filters/sort order are currently selected
//   - whether we're still loading data
// Any component on screen (the grid, the toolbar, etc.) can read from this
// shared memory and can also update it. When one part of the app changes
// something here, every other part that's showing that information
// updates automatically — nobody has to manually pass information around
// between components.
//
// This pattern is called a "store," and we're using a small library
// called Zustand to build it (Zustand is German for "state," which is the
// technical term for "the current values everything remembers").
// ============================================================================

import { create } from "zustand";
// ^ The function Zustand gives us to build a new store.

import type { Lead, LeadStatus } from "../../modules/leads/types/job";

export type SortKey = "date_posted" | "company_name" | "location" | "status";
// ^ The only four things we're allowed to sort by.

export type RemoteFilter = "all" | "remote" | "onsite";
// ^ The only three choices for the remote/on-site filter.

interface LeadsState {
  // This describes everything our shared memory holds, AND every action
  // (function) available to change it. Think of it as a table of contents
  // for the whole store.
  leads: Lead[];
  loading: boolean;
  error: string;

  query: string;
  statusFilter: LeadStatus | "All";
  remoteFilter: RemoteFilter;
  sort: { key: SortKey; dir: "asc" | "desc" };
  exportStatus: string;

  loadLeads: () => Promise<void>;
  setQuery: (query: string) => void;
  setStatusFilter: (status: LeadStatus | "All") => void;
  setRemoteFilter: (filter: RemoteFilter) => void;
  toggleSort: (key: SortKey) => void;
  clearFiltersAndSort: () => void;
  moveLead: (id: number, status: LeadStatus) => Promise<void>;
  exportLeads: (leads: Lead[]) => Promise<void>;
  filteredLeads: () => Lead[];
}

const DEFAULT_SORT: { key: SortKey; dir: "asc" | "desc" } = { key: "date_posted", dir: "desc" };
// ^ What the sort order resets to whenever "Clear" is pressed: newest
//   date-posted first.

export const useLeadsStore = create<LeadsState>((set, get) => ({
  // "set" lets us update the store's memory. "get" lets us read the
  // store's CURRENT memory from inside one of these functions (useful
  // when one action needs to check something else before proceeding).

  leads: [],
  loading: true,
  error: "",

  query: "",
  statusFilter: "All",
  remoteFilter: "all",
  sort: DEFAULT_SORT,
  exportStatus: "",
  // ^ These are the starting values, before anything has loaded or the
  //   user has touched anything.

  loadLeads: async () => {
    // Fetches the real list of leads from the database (through the
    // background code) and stores it in memory.
    set({ loading: true, error: "" });
    try {
      const leads = await window.electronAPI.getLeads();
      set({ leads, loading: false });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : String(err) });
    }
  },

  setQuery: (query) => set({ query }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setRemoteFilter: (remoteFilter) => set({ remoteFilter }),
  // ^ Three simple "just remember whatever the user picked" actions.

  toggleSort: (key) =>
    set((state) => ({
      sort: state.sort.key === key ? { key, dir: state.sort.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    })),
  // ^ If you pick the SAME sort option you're already using, this flips
  //   the direction (ascending becomes descending, and vice versa).
  //   If you pick a DIFFERENT one, it switches to that, starting ascending.

  clearFiltersAndSort: () =>
    set({ query: "", statusFilter: "All", remoteFilter: "all", sort: DEFAULT_SORT }),
  // ^ The "Clear" button — resets every filter and the sort order back to
  //   their starting values in one go.

  moveLead: async (id, status) => {
    // Changes a lead's status. Updates it on screen INSTANTLY (so it
    // feels fast), and then quietly tells the database to save the same
    // change in the background.
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, status } : l)),
      // ^ Goes through every lead; leaves all of them exactly as they
      //   were, except the one matching this id, which gets its status
      //   replaced.
    }));
    await window.electronAPI.updateLeadStatus(id, status);
  },

  exportLeads: async (leads) => {
    // Asks the background code to save these leads as a CSV file, then
    // shows a short confirmation (or error) message that fades away after
    // a few seconds.
    const result = await window.electronAPI.exportLeads(leads);
    if (result.ok) {
      set({ exportStatus: `Saved to ${result.filePath}` });
    } else if (!result.canceled) {
      set({ exportStatus: result.error || "Export failed." });
    }
    setTimeout(() => set({ exportStatus: "" }), 4000);
    // ^ Clears that message automatically after 4 seconds (4000
    //   milliseconds), so it doesn't sit on screen forever.
  },

  filteredLeads: () => {
    // This is the important one: it takes the FULL list of leads and
    // narrows it down to only the ones matching the current search text
    // and filters, then puts them in the currently selected sort order.
    // Nothing here changes the original list — it just calculates what
    // SHOULD be shown right now.
    const { leads, query, statusFilter, remoteFilter, sort } = get();
    const q = query.trim().toLowerCase();
    // ^ Cleans up the search text: removes extra spaces and makes it all
    //   lowercase, so searching isn't case-sensitive.

    const out = leads.filter((l) => {
      const matchesQuery =
        !q ||
        l.company_name.toLowerCase().includes(q) ||
        l.job_title.toLowerCase().includes(q) ||
        (l.location ?? "").toLowerCase().includes(q);
      // ^ A lead "matches" the search box if there's no search text at
      //   all, OR if the company name, job title, or location contains
      //   what was typed.

      const matchesStatus = statusFilter === "All" || l.status === statusFilter;
      // ^ Matches if "All statuses" is selected, or the lead's exact
      //   status matches the chosen filter.

      const matchesRemote =
        remoteFilter === "all" ||
        (remoteFilter === "remote" && l.remote_only) ||
        (remoteFilter === "onsite" && !l.remote_only);
      // ^ Matches if "Remote + on-site" is selected (i.e. no filtering),
      //   or the lead's remote/on-site status matches what was chosen.

      return matchesQuery && matchesStatus && matchesRemote;
      // ^ A lead only shows up if ALL THREE checks above pass.
    });

    out.sort((a, b) => {
      // Puts the filtered list in order, based on whichever sort option
      // and direction is currently selected.
      const dir = sort.dir === "asc" ? 1 : -1;
      // ^ Ascending order compares normally; descending just flips the
      //   comparison result, which is a quick trick to reuse the same
      //   comparison logic for both directions.

      if (sort.key === "date_posted") {
        const at = a.date_posted ? new Date(a.date_posted).getTime() : 0;
        const bt = b.date_posted ? new Date(b.date_posted).getTime() : 0;
        return dir * (at - bt);
        // ^ Dates need special handling: convert them to plain numbers
        //   (milliseconds since a fixed point in time) before comparing,
        //   since you can't directly subtract one date from another.
      }
      const av = String(a[sort.key] ?? "");
      const bv = String(b[sort.key] ?? "");
      return dir * av.localeCompare(bv);
      // ^ For text fields (company, location, status), "localeCompare"
      //   does an alphabetical comparison.
    });

    return out;
  },
}));
