// ============================================================================
// WHAT IS THIS FILE?
// This is a SAFE GO-BETWEEN connecting the on-screen app (which the user
// can click around in) with the powerful background code (which can read
// files and store data). Without this file, the on-screen app would
// either have NO access to any of that (useless), or FULL access to your
// entire computer (dangerous). This file opens a narrow, specific
// doorway: only the exact features listed below, nothing more.
//
// IMPORTANT TECHNICAL NOTE: Electron loads preload scripts through a
// special restricted "sandbox" that only understands the OLD-style
// "require()" way of importing code, not the modern "import" syntax the
// rest of this project uses. So unlike every other file, this one gets
// compiled completely separately (see tsconfig.preload.json) into
// old-style code, and — on purpose — doesn't import anything from other
// files in this project, even though that would normally be totally
// fine. Instead, the few small type shapes it needs are simply written
// out again below. If you change the "Post" or "LinkedInAccount" shape
// in modules/posts/types/post.ts or modules/linkedin/types/account.ts,
// update the matching shape here too.
// ============================================================================

import { contextBridge, ipcRenderer } from "electron";
// ^ "contextBridge" is what lets us safely expose a few specific functions
//   to the on-screen app. "ipcRenderer" is what actually sends a request
//   over to the background code and waits for its answer.

type PostStatus = "Draft" | "Scheduled" | "Published" | "Failed";
// ^ A stand-alone copy of the same status list from modules/posts/types/post.ts.

interface Post {
  // A stand-alone copy of the "Post" shape — see the note above for why.
  id: number;
  content: string;
  image_url: string | null;
  platform: "linkedin";
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  linkedin_post_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface LinkedInAccount {
  // A stand-alone copy of the "LinkedInAccount" shape.
  id: number;
  linkedin_user_id: string;
  name: string;
  headline: string | null;
  profile_picture_url: string | null;
  connected_at: string;
}

export interface ElectronAPI {
  // This describes exactly what functions we're allowing the on-screen
  // app to call, and what kind of information goes in and comes back out
  // of each one. Think of it as a menu of allowed actions.
  ping: () => string;

  // ---- Posts ----
  getPosts: () => Promise<Post[]>;
  createPost: (input: {
    content: string;
    image_url: string | null;
    scheduled_at: string | null;
    status: PostStatus;
  }) => Promise<{ ok: boolean; post: Post }>;
  updatePost: (
    id: number,
    input: Partial<Pick<Post, "content" | "image_url" | "scheduled_at" | "status">>
  ) => Promise<{ ok: boolean; post?: Post; error?: string }>;
  deletePost: (id: number) => Promise<{ ok: boolean }>;
  publishPostNow: (id: number) => Promise<{ ok: boolean; post?: Post; error?: string }>;

  // ---- LinkedIn connection ----
  getLinkedInAccount: () => Promise<{ ok: boolean; account: LinkedInAccount | null }>;
  connectLinkedIn: () => Promise<{ ok: boolean; account?: LinkedInAccount }>;
  disconnectLinkedIn: () => Promise<{ ok: boolean }>;
}

const api: ElectronAPI = {
  // Here's the ACTUAL code behind each item on that "menu" above. Every
  // one of these just quietly forwards the request to the background code
  // and hands back whatever answer comes back.

  ping: () => "pong",
  // A tiny test function — if you call this and get back "pong", you know
  // the connection between the on-screen app and background code is working.

  getPosts: () => ipcRenderer.invoke("posts:getAll"),
  createPost: (input) => ipcRenderer.invoke("posts:create", input),
  updatePost: (id, input) => ipcRenderer.invoke("posts:update", id, input),
  deletePost: (id) => ipcRenderer.invoke("posts:delete", id),
  publishPostNow: (id) => ipcRenderer.invoke("posts:publishNow", id),

  getLinkedInAccount: () => ipcRenderer.invoke("linkedin:getAccount"),
  connectLinkedIn: () => ipcRenderer.invoke("linkedin:connect"),
  disconnectLinkedIn: () => ipcRenderer.invoke("linkedin:disconnect"),
};

contextBridge.exposeInMainWorld("electronAPI", api);
// ^ This is the actual "opening the doorway" step. From this point on,
//   the on-screen app can call things like window.electronAPI.getPosts()
//   and it will work — but it CANNOT do anything beyond what's listed
//   above. Everything else about your computer stays off-limits to it.
