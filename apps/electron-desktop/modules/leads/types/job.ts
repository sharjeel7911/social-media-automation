// ============================================================================
// WHAT IS THIS FILE?
// This file doesn't DO anything by itself — it just describes the SHAPE
// of our data. Think of it like a form template: it says "a Lead has
// these fields, and each one holds this kind of information (text,
// number, yes/no, etc.)." Every other file that deals with leads or notes
// checks its work against this shape, so if someone tries to save a lead
// without a company name, for example, the mistake gets caught
// immediately instead of causing confusing bugs later.
//
// This shape matches our database table columns name-for-name, so there's
// only ONE definition of "what a lead looks like" to keep track of.
// ============================================================================

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Replied"
  | "Qualified"
  | "Won"
  | "Lost";
// ^ A "status" can ONLY ever be one of these six exact words — nothing
//   else is allowed. This stops typos like "Contactd" from ever sneaking in.

// One row in the "leads" table — one single job posting we're tracking.
export interface Lead {
  id: number;
  // ^ A unique number automatically given to each lead so we can tell
  //   them apart, even if two leads have the exact same company name.
  created_at: string;
  // ^ The exact date and time this lead was first added to our database.
  raw_job_id: number | null;
  // ^ A link back to the original, un-processed job posting this lead
  //   came from (before it was cleaned up). "| null" means "this can also
  //   just be empty/unknown."
  source_id: number | null;
  // ^ A link to which job board/website this posting came from.
  external_job_id: string | null;
  // ^ The ID this job posting has on the original job board's own system.
  company_name: string;
  // ^ The hiring company's name. This one is required — every lead must
  //   have a company name.
  company_domain: string | null;
  // ^ The company's website address, if we know it (e.g. "acme.com").
  job_title: string;
  // ^ The title of the job being advertised (e.g. "Remote Receptionist").
  job_url: string;
  // ^ A link to view the actual job posting online.
  location: string | null;
  // ^ Where the job is based (city/state, or "Remote").
  date_posted: string | null;
  // ^ When the job was originally posted.
  description: string | null;
  // ^ The full text of the job posting, if we have it.
  industry: string | null;
  // ^ What kind of business this company is (e.g. "Healthcare").
  remote_only: boolean;
  // ^ true/false — is this a fully remote position?
  employment_type: string | null;
  // ^ E.g. "Full-time", "Part-time", "Contract".
  deduplication_key: string | null;
  // ^ A special value used behind the scenes to detect and skip duplicate
  //   postings for the same job seen from multiple sources.
  status: LeadStatus;
  // ^ Where this lead currently stands in our sales pipeline (see the
  //   LeadStatus list above).
  updated_at: string;
  // ^ The date and time this lead's information was last changed.
}

// One row in the "lead_notes" table — a note someone on the team wrote
// about a specific lead.
export interface LeadNote {
  id: number;
  // ^ A unique number for this specific note.
  created_at: string;
  // ^ When this note was first written.
  lead_id: number;
  // ^ Which lead this note belongs to (matches a Lead's "id" above).
  note: string;
  // ^ The actual text of the note.
  updated_at: string;
  // ^ When this note was last edited.
}
