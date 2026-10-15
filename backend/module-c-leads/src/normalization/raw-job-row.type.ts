export interface RawJobRow {
  id: number;
  created_at: string;
  source_id: number;
  external_job_id: string;
  raw_data: string;
  fetched_at: string;
}