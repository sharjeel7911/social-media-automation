import type { RawJobRow } from '../normalization/raw-job-row.type';

export interface RawJobsRepository {
  findAll(): Promise<RawJobRow[]>;
}