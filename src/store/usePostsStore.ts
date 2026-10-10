// ============================================================================
// WHAT IS THIS FILE?
// Module A's version of the same "shared memory" pattern used in
// useLeadsStore.ts — one central place holding the current list of posts
// and the connected LinkedIn account (if any), plus every action that
// changes them. Any Module A screen (Dashboard, Calendar, Create Post,
// Connect) reads from and writes to this same shared store.
// ============================================================================

import { create } from "zustand";
import type { Post, PostStatus } from "../../modules/posts/types/post";
import type { LinkedInAccount } from "../../modules/linkedin/types/account";

interface PostsState {
  posts: Post[];
  loading: boolean;
  account: LinkedInAccount | null;
  accountLoading: boolean;
  connecting: boolean;

  loadPosts: () => Promise<void>;
  loadAccount: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  createPost: (input: {
    content: string;
    image_url: string | null;
    scheduled_at: string | null;
    status: PostStatus;
  }) => Promise<Post | null>;
  updatePost: (
    id: number,
    input: Partial<Pick<Post, "content" | "image_url" | "scheduled_at" | "status">>
  ) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  publishNow: (id: number) => Promise<{ ok: boolean; error?: string }>;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: true,
  account: null,
  accountLoading: true,
  connecting: false,

  loadPosts: async () => {
    set({ loading: true });
    const posts = await window.electronAPI.getPosts();
    set({ posts, loading: false });
  },

  loadAccount: async () => {
    set({ accountLoading: true });
    const result = await window.electronAPI.getLinkedInAccount();
    set({ account: result.account, accountLoading: false });
  },

  connect: async () => {
    // Kicks off the (currently mocked) LinkedIn login flow. "connecting"
    // lets the Connect screen show a "Connecting…" state while it waits.
    set({ connecting: true });
    const result = await window.electronAPI.connectLinkedIn();
    set({ connecting: false, account: result.account ?? null });
  },

  disconnect: async () => {
    await window.electronAPI.disconnectLinkedIn();
    set({ account: null });
  },

  createPost: async (input) => {
    const result = await window.electronAPI.createPost(input);
    if (!result.ok) return null;
    set((state) => ({ posts: [result.post, ...state.posts] }));
    return result.post;
  },

  updatePost: async (id, input) => {
    const result = await window.electronAPI.updatePost(id, input);
    if (!result.ok || !result.post) return;
    const updated = result.post;
    set((state) => ({ posts: state.posts.map((p) => (p.id === id ? updated : p)) }));
  },

  deletePost: async (id) => {
    await window.electronAPI.deletePost(id);
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
  },

  publishNow: async (id) => {
    const result = await window.electronAPI.publishPostNow(id);
    if (result.ok && result.post) {
      const updated = result.post;
      set((state) => ({ posts: state.posts.map((p) => (p.id === id ? updated : p)) }));
      return { ok: true };
    }
    return { ok: false, error: result.error };
  },
}));

// Small shared helpers other Module A components use.
export function upcomingScheduled(posts: Post[]): Post[] {
  return posts
    .filter((p) => p.status === "Scheduled")
    .sort((a, b) => new Date(a.scheduled_at ?? 0).getTime() - new Date(b.scheduled_at ?? 0).getTime());
}

export function recentlyPublished(posts: Post[]): Post[] {
  return posts
    .filter((p) => p.status === "Published")
    .sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime());
}

export function draftPosts(posts: Post[]): Post[] {
  // Drafts have no scheduled_at or published_at to sort by (they're not
  // tied to any date yet), so newest-created is the most sensible order —
  // whatever you were most recently working on shows up first.
  return posts
    .filter((p) => p.status === "Draft")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
