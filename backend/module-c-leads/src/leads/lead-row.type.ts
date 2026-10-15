export interface LeadRow {
  id?: number;
  created_at?: string;
  raw_job_id: number;
  source_id: number;
  external_job_id: string;
  company_name: string;
  company_domain: string | null;
  job_title: string;
  job_url: string;
  location: string | null;
  date_posted: string | null;
  description: string | null;
  industry: string | null;
  remote_only: boolean | null;
  employment_type: string | null;
  deduplication_key: string;
  status: string;
  updated_at?: string;
  enrichment_contact_name?: string | null;
  enrichment_contact_email?: string | null;
  enrichment_contact_title?: string | null;
  enrichment_source?: string | null;
  enriched_at?: string | null;
}