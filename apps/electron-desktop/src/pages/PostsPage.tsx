// ============================================================================
// WHAT IS THIS FILE?
// The container for all of Module A. Holds a tab bar:
//   - Dashboard
//   - Calendar
//   - Create Post
//   - Bulk Import (CSV)
//   - Media Library & Crop Presets
//   - Evergreen Queue
//   - Connect LinkedIn
// ============================================================================

import { useState } from "react";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  PenSquare,
  Upload,
  Image as ImageIcon,
  Repeat,
} from "lucide-react";
import { Dashboard } from "../moduleA/components/Dashboard";
import { Calendar } from "../moduleA/components/Calendar";
import { CreatePost } from "../moduleA/components/CreatePost";
import { BulkImport } from "../moduleA/components/BulkImport";
import { MediaLibrary } from "../moduleA/components/MediaLibrary";
import { EvergreenQueue } from "../moduleA/components/EvergreenQueue";
import { LinkedInConnect } from "../moduleA/components/LinkedInConnect";
import { LinkedInMark } from "../moduleA/components/LinkedInMark";
import type { Post } from "../../modules/posts/types/post";

type Tab = "dashboard" | "calendar" | "create" | "bulk" | "media" | "evergreen" | "connect";

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

  function handleSelectMediaFromLibrary(url: string) {
    setTab("create");
  }

  return (
    <div className="page">
      <div className="subnav">
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
          className={tab === "bulk" ? "subnav__button subnav__button--active" : "subnav__button"}
          onClick={() => setTab("bulk")}
        >
          <Upload size={14} /> Bulk Import
        </button>
        <button
          className={tab === "media" ? "subnav__button subnav__button--active" : "subnav__button"}
          onClick={() => setTab("media")}
        >
          <ImageIcon size={14} /> Media Library
        </button>
        <button
          className={tab === "evergreen" ? "subnav__button subnav__button--active" : "subnav__button"}
          onClick={() => setTab("evergreen")}
        >
          <Repeat size={14} /> Evergreen
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
        {tab === "bulk" && <BulkImport onDone={backToDashboard} />}
        {tab === "media" && <MediaLibrary onSelectImage={handleSelectMediaFromLibrary} />}
        {tab === "evergreen" && <EvergreenQueue onOpenPost={openPost} />}
        {tab === "connect" && <LinkedInConnect />}
      </div>
    </div>
  );
}
