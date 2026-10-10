// ============================================================================
// WHAT IS THIS FILE?
// The shared "memory" for the whole dashboard — one central place holding
// upcoming posts, leads, the SEO snapshot, analytics numbers, and the
// current report, plus every action that changes them. Every screen reads
// from and writes to this same store (same pattern as the other modules).
// ============================================================================

import { create } from "zustand";
import type { PostSummary, LeadSummary, LeadStatus, SeoHealthSnapshot } from "../../modules/dashboard/types/summaries";
import type { AnalyticsSummary } from "../../modules/dashboard/types/analytics";
import type { Report, ReportPeriod } from "../../modules/dashboard/types/report";

interface DashboardState {
  // ---- Home dashboard ----
  upcomingPosts: PostSummary[];
  latestLeads: LeadSummary[];
  seo: SeoHealthSnapshot | null;
  loadingHome: boolean;
  loadHome: () => Promise<void>;

  // ---- Analytics ----
  analytics: AnalyticsSummary | null;
  loadingAnalytics: boolean;
  loadAnalytics: () => Promise<void>;

  // ---- Lead pipeline (Kanban) ----
  pipelineLeads: LeadSummary[];
  loadingPipeline: boolean;
  loadPipeline: () => Promise<void>;
  moveLead: (id: number, status: LeadStatus) => Promise<void>;

  // ---- Reports ----
  report: Report | null;
  loadingReport: boolean;
  exportStatus: string;
  loadReport: (period: ReportPeriod) => Promise<void>;
  exportReport: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  upcomingPosts: [],
  latestLeads: [],
  seo: null,
  loadingHome: true,

  loadHome: async () => {
    set({ loadingHome: true });
    // Fetch all three at the same time instead of one after another.
    const [upcomingPosts, latestLeads, seo] = await Promise.all([
      window.electronAPI.getUpcomingPosts(),
      window.electronAPI.getLatestLeads(),
      window.electronAPI.getSeoSnapshot(),
    ]);
    set({ upcomingPosts, latestLeads, seo, loadingHome: false });
  },

  analytics: null,
  loadingAnalytics: true,

  loadAnalytics: async () => {
    set({ loadingAnalytics: true });
    const analytics = await window.electronAPI.getAnalytics();
    set({ analytics, loadingAnalytics: false });
  },

  pipelineLeads: [],
  loadingPipeline: true,

  loadPipeline: async () => {
    set({ loadingPipeline: true });
    const pipelineLeads = await window.electronAPI.getPipelineLeads();
    set({ pipelineLeads, loadingPipeline: false });
  },

  moveLead: async (id, status) => {
    // Update the screen INSTANTLY (so dragging feels smooth), then quietly
    // tell the background code to remember the change.
    set((state) => ({
      pipelineLeads: state.pipelineLeads.map((l) => (l.id === id ? { ...l, status } : l)),
    }));
    await window.electronAPI.updateLeadStatus(id, status);
  },

  report: null,
  loadingReport: true,
  exportStatus: "",

  loadReport: async (period) => {
    set({ loadingReport: true });
    const report = await window.electronAPI.getReport(period);
    set({ report, loadingReport: false });
  },

  exportReport: async () => {
    const { report } = get();
    if (!report) return;
    const result = await window.electronAPI.exportReport(report);
    if (result.ok) {
      set({ exportStatus: `Saved to ${result.filePath}` });
    } else if (!result.canceled) {
      set({ exportStatus: result.error || "Export failed." });
    }
    setTimeout(() => set({ exportStatus: "" }), 4000);
    // ^ Clears the confirmation message after 4 seconds.
  },
}));
