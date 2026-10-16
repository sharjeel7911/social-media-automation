// ============================================================================
// IPC handler for Social Media Posts (Module A).
// Backed by: modules/posts/database/database.ts (SQLite)
//            modules/linkedin/api/publish.ts (LinkedIn Publishing API)
//            modules/posts/services/scheduler.ts (Background timer)
// ============================================================================

import { ipcMain } from "electron";
import type { PostStatus, PostPlatform } from "../../modules/posts/types/post.js";
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../../modules/posts/database/database.js";
import { publishToLinkedIn } from "../../modules/linkedin/api/publish.js";

export function registerPostsIpc(): void {
  // ---- Get all ----
  ipcMain.handle("posts:getAll", () => {
    try {
      return getAllPosts();
    } catch (err: any) {
      console.error("Error in posts:getAll:", err);
      return [];
    }
  });

  // ---- Create single ----
  ipcMain.handle(
    "posts:create",
    (
      _event,
      input: {
        content: string;
        image_url: string | null;
        scheduled_at: string | null;
        status: PostStatus;
        platform?: PostPlatform;
        original_url?: string | null;
        short_url?: string | null;
        utm_source?: string | null;
        utm_medium?: string | null;
        utm_campaign?: string | null;
        is_evergreen?: boolean;
        recycle_interval_days?: number | null;
      }
    ) => {
      try {
        const post = createPost(input);
        return { ok: true, post };
      } catch (err: any) {
        console.error("Error in posts:create:", err);
        return { ok: false, error: err.message };
      }
    }
  );

  // ---- Bulk create (CSV import) ----
  ipcMain.handle(
    "posts:bulkCreate",
    (
      _event,
      items: Array<{
        content: string;
        image_url?: string | null;
        scheduled_at?: string | null;
        status?: PostStatus;
        platform?: PostPlatform;
        utm_source?: string | null;
        utm_medium?: string | null;
        utm_campaign?: string | null;
      }>
    ) => {
      try {
        if (!Array.isArray(items) || items.length === 0) {
          return { ok: false, error: "No posts provided." };
        }
        if (items.length > 500) {
          return { ok: false, error: "Maximum 500 posts per import." };
        }
        const posts = items.map((item) =>
          createPost({
            content:               item.content,
            image_url:             item.image_url ?? null,
            scheduled_at:          item.scheduled_at ?? null,
            status:                item.status ?? "Draft",
            platform:              item.platform ?? "linkedin",
            utm_source:            item.utm_source ?? null,
            utm_medium:            item.utm_medium ?? null,
            utm_campaign:          item.utm_campaign ?? null,
          })
        );
        return { ok: true, count: posts.length };
      } catch (err: any) {
        console.error("Error in posts:bulkCreate:", err);
        return { ok: false, error: err.message };
      }
    }
  );

  // ---- Update ----
  ipcMain.handle(
    "posts:update",
    (
      _event,
      id: number,
      input: Partial<{
        content: string;
        image_url: string | null;
        scheduled_at: string | null;
        status: PostStatus;
        platform: PostPlatform;
        original_url: string | null;
        short_url: string | null;
        utm_source: string | null;
        utm_medium: string | null;
        utm_campaign: string | null;
        is_evergreen: boolean;
        recycle_interval_days: number | null;
      }>
    ) => {
      try {
        const post = updatePost(id, input);
        if (!post) return { ok: false, error: "Post not found." };
        return { ok: true, post };
      } catch (err: any) {
        console.error("Error in posts:update:", err);
        return { ok: false, error: err.message };
      }
    }
  );

  // ---- Delete ----
  ipcMain.handle("posts:delete", (_event, id: number) => {
    try {
      deletePost(id);
      return { ok: true };
    } catch (err: any) {
      console.error("Error in posts:delete:", err);
      return { ok: false, error: err.message };
    }
  });

  // ---- Publish now (LinkedIn only for now) ----
  ipcMain.handle("posts:publishNow", async (_event, id: number) => {
    try {
      const post = getPostById(id);
      if (!post) return { ok: false, error: "Post not found." };

      // Only LinkedIn publishing is wired up; other platforms fall through
      // to their platform adapters once those OAuth integrations are built.
      const result = await publishToLinkedIn({
        content:   post.content,
        image_url: post.image_url,
      });

      if (!result.ok) {
        const failedPost = updatePost(id, {
          status:        "Failed",
          error_message: result.error || "LinkedIn publishing failed.",
        });
        return { ok: false, error: result.error, post: failedPost ?? post };
      }

      const publishedPost = updatePost(id, {
        status:           "Published",
        published_at:     new Date().toISOString(),
        linkedin_post_id: result.external_id || null,
        error_message:    null,
      });

      return { ok: true, post: publishedPost ?? post };
    } catch (err: any) {
      console.error("Error in posts:publishNow:", err);
      return { ok: false, error: err.message || "Failed to publish post." };
    }
  });
}
