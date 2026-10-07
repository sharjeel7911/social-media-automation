// ============================================================================
// WHAT IS THIS FILE?
// The shared "memory" for the whole SEO toolkit — one central place
// holding tracked keywords, audit history, competitor-gap results, and
// the Google Business Profile snapshot, plus every action that changes
// them. Any screen (Dashboard, Keyword Research, Rank Tracker, Site
// Audit, Competitor Gap, Google Business Profile) reads from and writes
// to this same shared store, the same pattern used in Module A/C.
// ============================================================================

import { create } from "zustand";
import type { KeywordSuggestion, TrackedKeyword } from "../../modules/seo/types/keyword";
import type { SiteAudit } from "../../modules/seo/types/audit";
import type { CompetitorGapResult } from "../../modules/seo/types/competitor";
import type { GbpSnapshot } from "../../modules/seo/types/gbp";

interface SeoState {
  // ---- Keyword research + tracking ----
  searchResults: KeywordSuggestion[];
  searching: boolean;
  trackedKeywords: TrackedKeyword[];
  loadingKeywords: boolean;
  searchKeywords: (query: string) => Promise<void>;
  loadTrackedKeywords: () => Promise<void>;
  trackKeyword: (suggestion: KeywordSuggestion) => Promise<void>;
  untrackKeyword: (id: number) => Promise<void>;

  // ---- Site audits ----
  audits: SiteAudit[];
  auditing: boolean;
  loadAudits: () => Promise<void>;
  runAudit: (url: string) => Promise<SiteAudit | null>;

  // ---- Competitor gap ----
  gapResults: CompetitorGapResult[];
  runningGap: boolean;
  loadGapResults: () => Promise<void>;
  runCompetitorGap: (yourUrl: string, competitorUrl: string) => Promise<CompetitorGapResult | null>;

  // ---- Google Business Profile ----
  gbp: GbpSnapshot | null;
  loadingGbp: boolean;
  refreshingGbp: boolean;
  loadGbp: () => Promise<void>;
  refreshGbp: () => Promise<void>;
}

export const useSeoStore = create<SeoState>((set) => ({
  searchResults: [],
  searching: false,
  trackedKeywords: [],
  loadingKeywords: true,

  searchKeywords: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    set({ searching: true });
    const results = await window.electronAPI.searchKeywords(query);
    set({ searchResults: results, searching: false });
  },

  loadTrackedKeywords: async () => {
    set({ loadingKeywords: true });
    const keywords = await window.electronAPI.getTrackedKeywords();
    set({ trackedKeywords: keywords, loadingKeywords: false });
  },

  trackKeyword: async (suggestion) => {
    const result = await window.electronAPI.trackKeyword(suggestion);
    if (result.ok) {
      set((state) => ({ trackedKeywords: [...state.trackedKeywords, result.keyword] }));
    }
  },

  untrackKeyword: async (id) => {
    await window.electronAPI.untrackKeyword(id);
    set((state) => ({ trackedKeywords: state.trackedKeywords.filter((k) => k.id !== id) }));
  },

  audits: [],
  auditing: false,

  loadAudits: async () => {
    const audits = await window.electronAPI.getAudits();
    set({ audits });
  },

  runAudit: async (url) => {
    set({ auditing: true });
    const result = await window.electronAPI.runAudit(url);
    set({ auditing: false });
    if (!result.ok) return null;
    set((state) => ({ audits: [result.audit, ...state.audits] }));
    return result.audit;
  },

  gapResults: [],
  runningGap: false,

  loadGapResults: async () => {
    const results = await window.electronAPI.getCompetitorGaps();
    set({ gapResults: results });
  },

  runCompetitorGap: async (yourUrl, competitorUrl) => {
    set({ runningGap: true });
    const result = await window.electronAPI.runCompetitorGap(yourUrl, competitorUrl);
    set({ runningGap: false });
    if (!result.ok) return null;
    set((state) => ({ gapResults: [result.result, ...state.gapResults] }));
    return result.result;
  },

  gbp: null,
  loadingGbp: true,
  refreshingGbp: false,

  loadGbp: async () => {
    set({ loadingGbp: true });
    const result = await window.electronAPI.getGbpSnapshot();
    set({ gbp: result.snapshot, loadingGbp: false });
  },

  refreshGbp: async () => {
    set({ refreshingGbp: true });
    const result = await window.electronAPI.refreshGbpSnapshot();
    set({ gbp: result.snapshot, refreshingGbp: false });
  },
}));
