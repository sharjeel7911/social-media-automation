// ============================================================================
// WHAT IS THIS FILE?
// This is a "types-only" file — it contains no actual working code, it
// just teaches TypeScript about something that exists but that it
// couldn't otherwise figure out on its own: window.electronAPI.
//
// Without this file, if you typed "window.electronAPI.getLeads()"
// anywhere in our on-screen app code, TypeScript would complain
// "I don't know what electronAPI is!" — because electronAPI is added at
// runtime by preload.ts, not through a normal import. This file simply
// says "trust me, window will have an electronAPI on it, and here's
// exactly what it looks like," so TypeScript stops worrying and can
// actually help catch mistakes when we use it.
// ============================================================================

/// <reference types="vite/client" />
// ^ Pulls in Vite's own built-in type definitions (for things like
//   importing images or environment variables the Vite way).

import type { ElectronAPI } from "../electron/preload";
// ^ Borrows the exact shape of electronAPI that we defined in preload.ts,
//   so both files always agree on what functions are available.

declare global {
  // "declare global" means "I'm about to describe something that exists
  // everywhere in this project, not just in this file."
  interface Window {
    electronAPI: ElectronAPI;
    // ^ Tells TypeScript: "every 'window' object in this app also has an
    //   'electronAPI' property, shaped exactly like ElectronAPI."
  }
}
