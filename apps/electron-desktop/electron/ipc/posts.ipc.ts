// ============================================================================
// ⚠️ TEMPORARY MOCK — Person 2 will replace this file.
//
// This is a stand-in for the real posts database and scheduling backend
// (modules/posts/database/database.ts and modules/posts/services/scheduler.ts,
// currently empty placeholders). It stores posts in a plain JavaScript
// array in memory instead of a real database, so:
//   - Every function below matches the name/shape Person 2's real
//     database functions should have, so swapping this file for the real
//     thing requires ZERO changes to the frontend.
//   - Data does NOT persist — closing the app resets everything back to
//     the sample posts seeded below.
//   - "Publishing" a post here just flips its status and makes up a fake
//     LinkedIn post ID — it does not actually talk to LinkedIn. That real
//     work belongs in modules/linkedin/api/publish.ts (Person 3).
// ============================================================================

import { ipcMain } from "electron";
import type { Post, PostStatus } from "../../modules/posts/types/post.js";

let posts: Post[] = [];
let nextId = 1;

function addSamplePost(data: Omit<Post, "id" | "created_at" | "updated_at">): void {
  const now = new Date().toISOString();
  posts.push({ ...data, id: nextId++, created_at: now, updated_at: now });
}

function seedSamplePosts(): void {
  // A handful of realistic-looking posts across every status, so the
  // Dashboard and Calendar have something to show immediately.
  const today = new Date();
  const inDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString();
  };

  addSamplePost({
    content: "Excited to share that our AI receptionist just crossed 10,000 calls handled this month! 📞 Thank you to every customer who trusted us with their front desk.",
    image_url: null,
    platform: "linkedin",
    status: "Published",
    scheduled_at: null,
    published_at: inDays(-3),
    linkedin_post_id: "urn:li:share:mock1",
    error_message: null,
  });
  addSamplePost({
    content: "Hiring a receptionist? Before you post that job listing, see what an AI front desk can do for your business — 24/7 coverage, zero sick days.",
    image_url: null,
    platform: "linkedin",
    status: "Scheduled",
    scheduled_at: inDays(1),
    published_at: null,
    linkedin_post_id: null,
    error_message: null,
  });
  addSamplePost({
    content: "Case study: how a 12-location dental group cut missed calls by 90% in their first month with our AI receptionist.",
    image_url: null,
    platform: "linkedin",
    status: "Scheduled",
    scheduled_at: inDays(3),
    published_at: null,
    linkedin_post_id: null,
    error_message: null,
  });
  addSamplePost({
    content: "Draft: thoughts on why small businesses are switching to AI-first customer service in 2026...",
    image_url: null,
    platform: "linkedin",
    status: "Draft",
    scheduled_at: null,
    published_at: null,
    linkedin_post_id: null,
    error_message: null,
  });
  addSamplePost({
    content: "We're at [conference name] this week — come say hi at booth 42!",
    image_url: null,
    platform: "linkedin",
    status: "Failed",
    scheduled_at: inDays(-1),
    published_at: null,
    linkedin_post_id: null,
    error_message: "LinkedIn account was disconnected before this post could go out.",
  });
}

seedSamplePosts();

export function registerPostsIpc(): void {
  ipcMain.handle("posts:getAll", () => {
    // Newest-scheduled-or-created first, so the list feels current.
    return [...posts].sort((a, b) => {
      const at = a.scheduled_at ?? a.created_at;
      const bt = b.scheduled_at ?? b.created_at;
      return new Date(bt).getTime() - new Date(at).getTime();
    });
  });

  ipcMain.handle(
    "posts:create",
    (
      _event,
      input: {
        content: string;
        image_url: string | null;
        scheduled_at: string | null;
        status: PostStatus;
      }
    ) => {
      const now = new Date().toISOString();
      const post: Post = {
        id: nextId++,
        content: input.content,
        image_url: input.image_url,
        platform: "linkedin",
        status: input.status,
        scheduled_at: input.scheduled_at,
        published_at: null,
        linkedin_post_id: null,
        error_message: null,
        created_at: now,
        updated_at: now,
      };
      posts.push(post);
      return { ok: true, post };
    }
  );

  ipcMain.handle(
    "posts:update",
    (
      _event,
      id: number,
      input: Partial<Pick<Post, "content" | "image_url" | "scheduled_at" | "status">>
    ) => {
      const post = posts.find((p) => p.id === id);
      if (!post) return { ok: false, error: "Post not found." };
      Object.assign(post, input, { updated_at: new Date().toISOString() });
      return { ok: true, post };
    }
  );

  ipcMain.handle("posts:delete", (_event, id: number) => {
    posts = posts.filter((p) => p.id !== id);
    return { ok: true };
  });

  ipcMain.handle("posts:publishNow", async (_event, id: number) => {
    // TEMPORARY: fakes a publish instead of really calling LinkedIn.
    // Person 3's real modules/linkedin/api/publish.ts should be called
    // from here once it exists.
    const post = posts.find((p) => p.id === id);
    if (!post) return { ok: false, error: "Post not found." };

    await new Promise((resolve) => setTimeout(resolve, 600));
    // ^ A short fake delay, just so the "Publishing…" state in the UI is
    //   actually visible instead of finishing instantly.

    post.status = "Published";
    post.published_at = new Date().toISOString();
    post.linkedin_post_id = `urn:li:share:mock${post.id}`;
    post.error_message = null;
    post.updated_at = new Date().toISOString();
    return { ok: true, post };
  });
}
