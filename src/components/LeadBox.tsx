// ============================================================================
// WHAT IS THIS FILE?
// This describes ONE single box in the grid of leads — everything you see
// for a single job posting: the company name, job title, location, a
// "Remote" badge if it applies, the status badge, the date, a link to the
// real posting, and the "Edit notes" / "Generate outreach" buttons.
// ============================================================================

import { StickyNote, Send, MapPin, ExternalLink, Globe, Building2 } from "lucide-react";
// ^ Small icon pictures (a sticky note, a paper airplane, a map pin, etc.)
//   from an icon library, used to make buttons and labels easier to
//   recognize at a glance.

import type { Lead } from "../../modules/leads/types/job";
import { StageBadge } from "./StageBadge";
import { formatDate, daysAgo } from "../utils/format";

interface LeadBoxProps {
  // "Props" are the pieces of information a component needs to be handed
  // from whoever is using it — like arguments to a function. This box
  // needs to know WHICH lead to show, and what to do when its two buttons
  // are clicked.
  lead: Lead;
  onOpenNotes: (lead: Lead) => void;
  onOpenOutreach: (lead: Lead) => void;
}

export function LeadBox({ lead, onOpenNotes, onOpenOutreach }: LeadBoxProps) {
  // Everything below this line describes what actually gets drawn on
  // screen for one lead box. This kind of HTML-looking code (called JSX)
  // is how React components describe their own appearance.
  return (
    <div className="lead-box">
      <div className="lead-box__header">
        <div>
          <p className="lead-box__company">
            <Building2 size={14} /> {lead.company_name}
            {/* The building icon plus the company's name. */}
          </p>
          <p className="lead-box__title">{lead.job_title}</p>
          {/* The job title, shown smaller/quieter underneath the company name. */}
        </div>
        <StageBadge status={lead.status} />
        {/* The colored status pill from StageBadge.tsx, in the top-right corner. */}
      </div>

      <div className="lead-box__meta">
        <span>
          <MapPin size={12} /> {lead.location ?? "Unknown"}
          {/* Shows the location, or the word "Unknown" if we don't have one. */}
        </span>
        {lead.remote_only && (
          <span className="lead-box__remote">
            <Globe size={12} /> Remote
          </span>
        )}
        {/* This whole "Remote" badge ONLY appears if remote_only is true —
            "lead.remote_only && (...)" is a common shortcut meaning
            "only show the stuff in parentheses if this condition is true." */}
      </div>

      <div className="lead-box__meta">
        <span>{formatDate(lead.date_posted)}</span>
        <span className="muted-text">· {daysAgo(lead.date_posted)}</span>
        {/* Shows both the exact date ("Aug 29, 2026") and the friendly
            relative version ("3 days ago") side by side. */}
      </div>

      <a href={lead.job_url} target="_blank" rel="noreferrer" className="lead-box__link">
        View posting <ExternalLink size={11} />
      </a>
      {/* A clickable link to the real job posting. "target=_blank" opens it
          in a new window/tab instead of replacing our app. */}

      <div className="lead-box__footer">
        <button className="secondary-button" onClick={() => onOpenNotes(lead)}>
          <StickyNote size={13} /> Edit notes
        </button>
        {/* Clicking this tells whoever is using LeadBox "the user wants to
            edit notes for THIS lead" — the actual notes window is handled
            elsewhere (see NotesModal.tsx and App.tsx). */}
        <button className="secondary-button" onClick={() => onOpenOutreach(lead)}>
          <Send size={13} /> Generate outreach
        </button>
        {/* Same idea, but for opening the AI outreach-message window. */}
      </div>
    </div>
  );
}
