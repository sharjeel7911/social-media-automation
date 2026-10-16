// ============================================================================
// SEO database helpers — lightweight bridge so other modules (e.g. Module D
// dashboard IPC) can read SEO summary data without importing the entire
// seo.ipc.ts mock.
//
// Once the real SEO SQLite storage is built this file will do actual DB
// queries. For now it returns safe null/zero defaults so the dashboard
// shows a genuine "no SEO data yet" state rather than hardcoded numbers.
// ============================================================================

import type { SeoHealthSnapshot } from "../../dashboard/types/summaries.js";

/**
 * Returns the latest SEO health snapshot, or null if no audit data exists yet.
 * Called by dashboard.ipc.ts to populate the Module D home screen SEO panel.
 */
export async function getSeoSnapshot(): Promise<SeoHealthSnapshot | null> {
  // No real DB yet — return null so the caller uses its own safe default.
  return null;
}
