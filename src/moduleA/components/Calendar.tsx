// ============================================================================
// WHAT IS THIS FILE?
// A month-view calendar (like a normal desk calendar grid) showing every
// scheduled or published post as a small chip on the date it's set for
// (or was actually published on). Click a chip to view that post; click
// the "+" on any day to start a new post pre-filled for that date.
// ============================================================================

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { usePostsStore } from "../../store/usePostsStore";
import type { Post } from "../../../modules/posts/types/post";

interface CalendarProps {
  onOpenPost: (post: Post) => void;
  onCreateForDate: (date: Date) => void;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function Calendar({ onOpenPost, onCreateForDate }: CalendarProps) {
  const { posts, loading, loadPosts } = usePostsStore();
  const [cursor, setCursor] = useState(new Date());
  // ^ Which month is currently being viewed. Starts on today's month.

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  // ^ Which weekday (0 = Sunday) the 1st of the month falls on, so we know
  //   how many blank cells to pad the grid with before day 1.
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<Date | null> = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  // ^ Builds one flat list: some blank leading cells, then one Date per
  //   actual day of the month. The grid below just renders this list in order.

  function postsOnDay(day: Date): Post[] {
    return posts.filter((p) => {
      const relevant = p.status === "Published" ? p.published_at : p.scheduled_at;
      return relevant && sameDay(new Date(relevant), day);
    });
    // ^ A published post shows on the day it actually went out; anything
    //   else (scheduled, draft, failed) shows on its scheduled date, if it has one.
  }

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button className="icon-button" onClick={() => setCursor(new Date(year, month - 1, 1))}>
          <ChevronLeft size={16} />
        </button>
        <h3>{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3>
        <button className="icon-button" onClick={() => setCursor(new Date(year, month + 1, 1))}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="calendar__weekdays">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {loading ? (
        <p className="empty-state">Loading posts…</p>
      ) : (
        <div className="calendar__grid">
          {cells.map((day, i) =>
            day ? (
              <div key={i} className="calendar__cell">
                <div className="calendar__cell-header">
                  <span>{day.getDate()}</span>
                  <button className="icon-button icon-button--tiny" onClick={() => onCreateForDate(day)} aria-label="New post for this day">
                    <Plus size={12} />
                  </button>
                </div>
                {postsOnDay(day).map((post) => (
                  <button key={post.id} className={`calendar__chip calendar__chip--${post.status.toLowerCase()}`} onClick={() => onOpenPost(post)}>
                    {post.content.slice(0, 28)}
                  </button>
                ))}
              </div>
            ) : (
              <div key={i} className="calendar__cell calendar__cell--empty" />
              // ^ A blank filler cell before day 1 of the month.
            )
          )}
        </div>
      )}
    </div>
  );
}
