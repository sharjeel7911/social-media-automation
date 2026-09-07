import type { SavedSearchRow } from './saved-search-row.type';

export interface SavedSearchesRepository {
  findActive(): Promise<SavedSearchRow[]>;
  updateLastRunAt(id: number, lastRunAt: string): Promise<void>;
}