// ============================================================================
// WHAT IS THIS FILE?
// A placeholder for the optional CRM push feature. The SOW (Section 3.4)
// lists "Optional CRM push (HubSpot / Pipedrive / Salesforce)" as a
// STRETCH GOAL, "Phase 5+" — meaning it's explicitly not part of the
// first version. So rather than pretend it's built, this screen shows the
// three CRMs with their buttons switched off and a clear "Planned" label.
// When it's eventually built, each button would start that CRM's login
// flow, and "Won" leads would be sent over to it.
// ============================================================================

import { Plug } from "lucide-react";

const CRMS = [
  { name: "HubSpot", note: "Send qualified and won leads to HubSpot contacts." },
  { name: "Pipedrive", note: "Create Pipedrive deals from your lead pipeline." },
  { name: "Salesforce", note: "Push leads into Salesforce as new records." },
];

export function Integrations() {
  return (
    <div className="integrations">
      <p className="muted-text integrations__note">
        CRM push is a stretch goal for a later phase (SOW Section 3.4, "Phase 5+"), so these are
        not connected yet.
      </p>
      <div className="integrations__grid">
        {CRMS.map((crm) => (
          <div key={crm.name} className="connect-card connect-card--small">
            <Plug size={22} color="var(--ink-muted)" />
            <p className="connect-card__title">{crm.name}</p>
            <p className="muted-text">{crm.note}</p>
            <button className="secondary-button" disabled>
              Planned — not available yet
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
