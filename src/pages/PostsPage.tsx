// ============================================================================
// WHAT IS THIS FILE?
// The container for all of Module A. Holds a small internal tab bar
// (Dashboard / Calendar / Create Post / Connect LinkedIn) and decides
// which one of those four screens is currently showing. Clicking a post
// anywhere (Dashboard's lists, a Calendar chip) jumps straight to the
// Create Post screen in EDIT mode for that post.
// ============================================================================

import { useState } from "react";
import { LayoutDashboard, Calendar as CalendarIcon, PenSquare } from "lucide-react";
import { Dashboard } from "../moduleA/components/Dashboard";
import { Calendar } from "../moduleA/components/Calendar";
import { CreatePost } from "../moduleA/components/CreatePost";
import { LinkedInConnect } from "../moduleA/components/LinkedInConnect";
import { LinkedInMark } from "../moduleA/components/LinkedInMark";
import type { Post } from "../../modules/posts/types/post";

type Tab = "dashboard" | "calendar" | "create" | "connect";

export function PostsPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [prefillDate, setPrefillDate] = useState<Date | null>(null);

  function openPost(post: Post) {
    setEditingPost(post);
    setPrefillDate(null);
    setTab("create");
  }

  function createNew() {
    setEditingPost(null);
    setPrefillDate(null);
    setTab("create");
  }

  function createForDate(date: Date) {
    setEditingPost(null);
    setPrefillDate(date);
    setTab("create");
  }

  function backToDashboard() {
    setEditingPost(null);
    setPrefillDate(null);
    setTab("dashboard");
  }

  return (
    <div className="page">
      <div className="subnav">
        {/* Each tab button is written out individually rather than looped
            from a shared list, since one of them (Connect LinkedIn) uses
            our own LinkedInMark component instead of a lucide-react icon. */}
        <button
          className={tab === "dashboard" ? "subnav__button subnav__button--active" : "subnav__button"}
          onClick={() => setTab("dashboard")}
        >
          <LayoutDashboard size={14} /> Dashboard
        </button>
        <button
          className={tab === "calendar" ? "subnav__button subnav__button--active" : "subnav__button"}
          onClick={() => setTab("calendar")}
        >
          <CalendarIcon size={14} /> Calendar
        </button>
        <button
          className={tab === "create" ? "subnav__button subnav__button--active" : "subnav__button"}
          onClick={() => setTab("create")}
        >
          <PenSquare size={14} /> Create post
        </button>
        <button
          className={tab === "connect" ? "subnav__button subnav__button--active" : "subnav__button"}
          onClick={() => setTab("connect")}
        >
          <LinkedInMark size={14} /> Connect LinkedIn
        </button>
      </div>

      <div className="page__body">
        {tab === "dashboard" && (
          <Dashboard onCreatePost={createNew} onOpenPost={openPost} onGoToConnect={() => setTab("connect")} />
        )}
        {tab === "calendar" && <Calendar onOpenPost={openPost} onCreateForDate={createForDate} />}
        {tab === "create" && (
          <CreatePost existingPost={editingPost} prefillDate={prefillDate} onDone={backToDashboard} />
        )}
        {tab === "connect" && <LinkedInConnect />}
      </div>
    </div>
  );
}
