export interface SavedSearchRow {
  id: number;
  created_at: string;
  use_id: number;
  name: string;
  keywords: string | null;
  locations: string | null;
  job_titles: string | null;
  industries: string | null;
  remote_only: boolean | null;
  date_posted_after: string | null;
  date_posted_before: string | null;
  is_active: boolean;
  schedule: string | null;
  last_run_at: string | null;
  updated_at: string | null;
}