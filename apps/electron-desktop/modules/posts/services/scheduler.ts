// ============================================================================
// WHAT IS THIS FILE?
// Background scheduler for automated social post publishing (Module A).
//
// Periodically checks SQLite for posts whose scheduled_at time has arrived,
// claims them, calls modules/linkedin/api/publish.ts to publish them, and
// updates their status to "Published" or "Failed" in SQLite.
// ============================================================================

import { getDuePosts, updatePost } from "../database/database.js";
import { publishToLinkedIn } from "../../linkedin/api/publish.js";

let intervalId: NodeJS.Timeout | null = null;
let isProcessing = false;

export async function processDuePosts(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const duePosts = getDuePosts(new Date());
    for (const post of duePosts) {
      try {
        console.log(`[Scheduler] Publishing due post #${post.id}...`);
        const result = await publishToLinkedIn({
          content: post.content,
          image_url: post.image_url,
        });

        if (result.ok) {
          updatePost(post.id, {
            status: "Published",
            published_at: new Date().toISOString(),
            linkedin_post_id: result.external_id || null,
            error_message: null,
          });
          console.log(`[Scheduler] Successfully published post #${post.id}`);
        } else {
          updatePost(post.id, {
            status: "Failed",
            error_message: result.error || "Publishing failed.",
          });
          console.warn(`[Scheduler] Failed to publish post #${post.id}: ${result.error}`);
        }
      } catch (err: any) {
        updatePost(post.id, {
          status: "Failed",
          error_message: err.message || "Unexpected publishing error.",
        });
        console.error(`[Scheduler] Error publishing post #${post.id}:`, err);
      }
    }
  } finally {
    isProcessing = false;
  }
}

/**
 * Starts the background post scheduler.
 * Runs check every 30 seconds.
 */
export function startPostScheduler(intervalMs = 30_000): void {
  if (intervalId) return;

  // Run initial check
  processDuePosts().catch(console.error);

  intervalId = setInterval(() => {
    processDuePosts().catch(console.error);
  }, intervalMs);
}

/**
 * Stops the background scheduler.
 */
export function stopPostScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
