// ============================================================================
// WHAT IS THIS FILE?
// A small collection of helper functions for turning raw data (like a
// database date string) into friendlier text to show on screen. Nothing
// in here changes any data — these functions just take something in and
// hand back a nicely formatted version of it.
// ============================================================================

export function formatDate(dateStr: string | null): string {
  // Turns a raw date (like "2026-08-29T00:00:00.000Z") into something
  // easier to read (like "Aug 29, 2026"). If there's no date at all, it
  // shows a dash instead of blank space or the word "null".
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  // ^ "toLocaleDateString" is a built-in JavaScript function that knows
  //   how to format dates nicely; the options here pick the exact style
  //   ("Aug 29, 2026" rather than, say, "8/29/26").
}

export function daysAgo(dateStr: string | null): string {
  // Turns a raw date into a friendly relative description, like "3 days
  // ago" or "today" — the kind of phrasing you see on social media posts.
  if (!dateStr) return "";
  const diff = Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  // ^ Subtracts the given date from right now, giving a difference in
  //   milliseconds, then divides by 86,400,000 (the number of
  //   milliseconds in one day) to get a whole number of days.
  if (diff <= 0) return "today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}
