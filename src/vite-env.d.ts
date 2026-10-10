// ============================================================================
// WHAT IS THIS FILE?
// A "types-only" file — no real code. It teaches TypeScript about
// something that exists but that it couldn't otherwise figure out on its
// own: window.electronAPI (added at runtime by preload.ts, not through a
// normal import).
// ============================================================================

/// <reference types="vite/client" />

import type { ElectronAPI } from "../electron/preload";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
