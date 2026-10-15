// ============================================================================
// WHAT IS THIS FILE?
// This file handles the "Export CSV" button. When the on-screen app asks
// for an export, this code pops open a native "Save File" window (the
// same kind you'd see saving a Word document), and once you pick a
// location, it writes all the lead data into a plain text CSV file there.
//
// Why does this live in the background code instead of the on-screen app?
// Because the on-screen app is deliberately locked out of touching your
// actual file system directly (that's a safety feature — see preload.ts).
// So it has to ask this trusted background code to do the file-saving for it.
// ============================================================================

import { ipcMain, dialog, BrowserWindow } from "electron";
// ^ "dialog" is what shows the native "Save File" popup window.

import fs from "node:fs";
// ^ "fs" stands for "file system" — this is what actually writes data
//   into a file on your computer's hard drive.

import type { Lead } from "../../modules/leads/types/job.js";
// ^ Borrowing the shape/definition of a "Lead" so this file knows exactly
//   what fields (company name, job title, etc.) are available to export.

interface ExportResult {
  // The shape of the answer we send back to the on-screen app once the
  // export attempt is finished (successfully or not).
  ok: boolean;
  canceled?: boolean;
  filePath?: string;
  error?: string;
}

function toCsv(leads: Lead[]): string {
  // Turns our list of lead objects into one big block of text formatted
  // as a CSV (Comma-Separated Values) file — the same format Excel and
  // Google Sheets can open directly.

  const headers = ["Company", "Job Title", "Location", "Status", "Date", "URL"];
  // ^ The column titles that go in the very first row of the file.

  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  // ^ A little safety wrapper: turns any value into text, wraps it in
  //   quotation marks, and doubles up any quotation marks already inside
  //   it. This prevents the file from breaking if, say, a company name
  //   happens to contain a comma or a quote mark.

  const rows = leads.map((l) =>
    [
      escape(l.company_name),
      escape(l.job_title),
      escape(l.location ?? ""),
      // ^ "?? ''" means: "if location is empty/missing, use blank text
      //   instead" so we don't accidentally write the word "null" into
      //   the spreadsheet.
      escape(l.status),
      escape(l.date_posted ? l.date_posted.slice(0, 10) : ""),
      // ^ Dates are stored with extra time-of-day detail we don't need
      //   for this export, so we chop the text down to just the first
      //   10 characters, which is exactly "YYYY-MM-DD".
      escape(l.job_url),
    ].join(",")
    // ^ Joins those six pieces together into one line, separated by commas.
  );

  return [headers.join(","), ...rows].join("\n");
  // ^ Puts the header row first, then every lead's row below it, each on
  //   its own new line — this whole block of text IS the CSV file's contents.
}

export function registerExportIpc(getWindow: () => BrowserWindow | null): void {
  // Turns on the listener for export requests. It's given a small
  // function ("getWindow") that always returns the current app window,
  // so the "Save File" popup appears attached to the right window.

  ipcMain.handle("leads:export", async (_event, leads: Lead[]): Promise<ExportResult> => {
    // "async" means this function is allowed to pause and wait for things
    // (like the user actually clicking Save) without freezing the app.

    const win = getWindow();
    const defaultName = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
    // ^ Suggests a filename like "leads-export-2026-09-05.csv" so the user
    //   doesn't have to think one up.

    const { canceled, filePath } = win
      ? await dialog.showSaveDialog(win, {
          defaultPath: defaultName,
          filters: [{ name: "CSV", extensions: ["csv"] }],
        })
      : await dialog.showSaveDialog({
          defaultPath: defaultName,
          filters: [{ name: "CSV", extensions: ["csv"] }],
        });
    // ^ Opens the native "Save File" window and waits ("await") until the
    //   user either picks a location or cancels. "filters" makes sure the
    //   file browser defaults to showing/saving .csv files.

    if (canceled || !filePath) return { ok: false, canceled: true };
    // ^ If the user clicked Cancel, stop here and let the on-screen app
    //   know nothing was saved (this isn't treated as an error).

    try {
      fs.writeFileSync(filePath, toCsv(leads), "utf-8");
      // ^ Actually writes the CSV text we built above into the chosen file.
      return { ok: true, filePath };
    } catch (err) {
      // If writing the file failed for some reason (like a permissions
      // problem), report back what went wrong instead of crashing the app.
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  });
}
