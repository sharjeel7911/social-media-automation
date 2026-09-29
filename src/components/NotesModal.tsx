// ============================================================================
// WHAT IS THIS FILE?
// This is the pop-up ("modal") window that opens when you click "Edit
// notes" on a lead. It does three things:
//   1. As soon as it opens, it asks the database "does this lead already
//      have a note?" and shows it if so (or starts blank if not).
//   2. Lets you type/edit the note text.
//   3. Saves it back to the database when you click Save — creating a
//      brand-new note if there wasn't one, or updating the existing one.
// ============================================================================

import { useEffect, useState } from "react";
// ^ Two of React's built-in tools:
//   "useState" lets a component remember information that can change
//   over time (like what's currently typed in the textbox).
//   "useEffect" lets a component run some code automatically at a
//   specific moment — here, right when the window first opens.

import { X, Loader2, Check } from "lucide-react";
// ^ Icon pictures: an X (close button), a spinning loader, and a checkmark.

import type { Lead } from "../../modules/leads/types/job";

interface NotesModalProps {
  lead: Lead;
  // ^ Which lead we're editing notes for.
  onClose: () => void;
  // ^ What to do when the user wants to close this window.
}

export function NotesModal({ lead, onClose }: NotesModalProps) {
  const [text, setText] = useState("");
  // ^ Remembers whatever's currently typed in the notes textbox.
  const [loading, setLoading] = useState(true);
  // ^ True while we're still fetching the existing note from the database.
  const [saving, setSaving] = useState(false);
  // ^ True while a save is in progress (so we can disable the button and
  //   show a spinner).
  const [saved, setSaved] = useState(false);
  // ^ Briefly true right after a successful save, to show a checkmark.
  const [error, setError] = useState("");
  // ^ Holds an error message, if something goes wrong.
  const [isNew, setIsNew] = useState(false);
  // ^ True if this lead doesn't have a note yet (so the button says
  //   "Add note" instead of "Save changes").

  useEffect(() => {
    // This block runs automatically once, right when the window opens
    // (or if you somehow open it for a different lead without closing it
    // first — that's what "[lead.id]" at the very bottom controls).
    let cancelled = false;
    // ^ A safety flag: if the window gets closed WHILE we're still
    //   waiting for the database to respond, this stops us from trying to
    //   update a window that no longer exists.

    async function fetchNote() {
      setLoading(true);
      setError("");
      try {
        const result = await window.electronAPI.getNote(lead.id);
        // ^ Asks the background code: "does this lead have a note?"
        if (cancelled) return;
        if (result.note) {
          // A note already exists — load its text into the textbox.
          setText(result.note.note);
          setIsNew(false);
        } else {
          // No note yet — start with an empty textbox.
          setText("");
          setIsNew(true);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchNote();

    return () => {
      // This runs automatically if the window closes before fetchNote()
      // finishes — it flips our safety flag so any late-arriving response
      // gets ignored instead of causing errors.
      cancelled = true;
    };
  }, [lead.id]);

  async function save() {
    // Runs when the Save/Add button is clicked.
    setSaving(true);
    setError("");
    try {
      await window.electronAPI.saveNote(lead.id, text);
      // ^ Tells the background code to save this text as the lead's note
      //   (creating or updating it, whichever applies).
      setIsNew(false);
      // ^ Now that it's saved, this is no longer a "new" note.
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      // ^ Shows the "Saved" checkmark for a second and a half, then
      //   switches the button text back to normal.
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      {/* This is the dimmed background that covers the whole app while
          the pop-up is open. */}
      <div className="modal">
        <div className="modal__header">
          <div>
            <h3 className="modal__title">{isNew ? "Add note" : "Edit note"}</h3>
            {/* The title changes depending on whether this lead already
                had a note or not. */}
            <p className="modal__subtitle">{lead.company_name}</p>
          </div>
          <button onClick={onClose} className="icon-button" aria-label="Close">
            <X size={18} />
          </button>
          {/* The little X button in the corner to close the window. */}
        </div>

        <div className="modal__body">
          {loading ? (
            // While we're still fetching the note, show a spinner instead
            // of an empty/misleading textbox.
            <div className="loading-row">
              <Loader2 size={16} className="spin" /> Loading note…
            </div>
          ) : (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                // ^ Every time the user types, update our remembered text.
                rows={6}
                placeholder="Log a call, an objection, or a next step…"
                className="textarea"
                autoFocus
                // ^ Automatically puts the cursor in this box as soon as
                //   the window opens, so you can start typing right away.
              />
              {error && <p className="error-text">{error}</p>}
              {/* Only shown if there actually IS an error message. */}
            </>
          )}
        </div>

        <div className="modal__footer">
          <button onClick={onClose} className="secondary-button">
            Close
          </button>
          <button onClick={save} disabled={loading || saving} className="primary-button button-row__push-right">
            {/* The button is grayed out/unclickable while loading or saving. */}
            {saving ? (
              <Loader2 size={14} className="spin" />
            ) : saved ? (
              <Check size={14} />
            ) : null}
            {/* Shows a spinner while saving, a checkmark right after
                saving, or nothing extra otherwise. */}
            {saved ? "Saved" : isNew ? "Add note" : "Save changes"}
            {/* The button's text changes to match what's currently happening. */}
          </button>
        </div>
      </div>
    </div>
  );
}
