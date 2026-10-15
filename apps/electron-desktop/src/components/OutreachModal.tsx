// ============================================================================
// WHAT IS THIS FILE?
// This is the pop-up window that opens when you click "Generate outreach"
// on a lead. It lets you ask the AI to write an outreach email for that
// specific lead, shows the result so you can read/edit it, and lets you
// copy it to your clipboard to paste into an actual email.
// ============================================================================

import { useState } from "react";
import { X, Send, Loader2, Copy, Check } from "lucide-react";
import type { Lead } from "../../modules/leads/types/job";

interface OutreachModalProps {
  lead: Lead;
  onClose: () => void;
}

export function OutreachModal({ lead, onClose }: OutreachModalProps) {
  const [draft, setDraft] = useState("");
  // ^ Holds the AI-written message once we have one (starts empty).
  const [loading, setLoading] = useState(false);
  // ^ True while we're waiting for the AI to respond.
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  // ^ Briefly true right after clicking "Copy," to show a checkmark
  //   confirming it worked.

  async function generate() {
    // Runs when "Generate outreach message" (or "Regenerate") is clicked.
    setLoading(true);
    setError("");
    try {
      const result = await window.electronAPI.generateOutreach(lead);
      // ^ Asks the background code to ask the AI to write a message for
      //   this lead, and waits for the answer.
      if (!result.ok) {
        setError(result.error || "Couldn't generate a draft just now.");
      } else {
        setDraft(result.text ?? "");
      }
    } catch (e) {
      setError("Couldn't reach the app's backend. Is the main process running?");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    // Copies the current draft text to the computer's clipboard, so the
    // user can paste it straight into their email program.
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    // ^ Shows a checkmark for a second and a half to confirm it worked.
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal--wide">
        <div className="modal__header">
          <div>
            <h3 className="modal__title">Outreach message</h3>
            <p className="modal__subtitle">
              {lead.company_name} · {lead.job_title}
            </p>
          </div>
          <button onClick={onClose} className="icon-button" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal__body">
          {!draft && !loading && (
            // Before anything's been generated yet, show one big button
            // inviting the user to start.
            <button onClick={generate} className="primary-button primary-button--full">
              <Send size={15} /> Generate outreach message
            </button>
          )}

          {loading && (
            <div className="loading-row">
              <Loader2 size={16} className="spin" /> Drafting message…
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          {draft && !loading && (
            // Once we have a message, show it in an editable textbox plus
            // buttons to regenerate or copy it.
            <>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={7} className="textarea" />
              {/* The user can freely edit the AI's draft before copying it —
                  it's a starting point, not a locked-in final answer. */}
              <div className="button-row">
                <button onClick={generate} className="secondary-button">
                  Regenerate
                </button>
                <button onClick={copyToClipboard} className="secondary-button button-row__push-right">
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
