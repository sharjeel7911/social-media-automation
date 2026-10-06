// ============================================================================
// WHAT IS THIS FILE?
// The small colored pill showing a post's status (Draft / Scheduled /
// Published / Failed) — the Module A equivalent of StageBadge.tsx from
// Module C, same idea, different set of statuses/colors.
// ============================================================================

import type { PostStatus } from "../../../modules/posts/types/post";

const TINTS: Record<PostStatus, { tint: string; ink: string }> = {
  Draft: { tint: "#E6E4DC", ink: "#5B5647" },
  Scheduled: { tint: "#E6ECF5", ink: "#3D5D8A" },
  Published: { tint: "#E3EEDF", ink: "#2F6B2A" },
  Failed: { tint: "#F3E2DC", ink: "#A6432D" },
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const m = TINTS[status];
  return (
    <span className="stage-badge" style={{ backgroundColor: m.tint, color: m.ink }}>
      {status}
    </span>
  );
}
