import { Injectable } from '@nestjs/common';

export interface KeywordResearchResult {
  term: string;
  searchVolume: number;
  difficulty: number; // 0-100
}

export interface RankCheckResult {
  rank: number | null; // null = not found in top results (e.g. beyond position 100)
}

export interface KeywordDataProvider {
  research(term: string): Promise<KeywordResearchResult>;
  checkRank(term: string, targetUrl: string): Promise<RankCheckResult>;
}

export const KEYWORD_DATA_PROVIDER = 'KEYWORD_DATA_PROVIDER';

@Injectable()
export class MockKeywordDataProvider implements KeywordDataProvider {
  async research(term: string): Promise<KeywordResearchResult> {
    // Deterministic fake data based on the term, so results are stable across calls
    // (not random) — makes it easier to test the frontend against consistent numbers.
    const hash = this.hashString(term);
    return {
      term,
      searchVolume: 100 + (hash % 9900), // 100 - 9999
      difficulty: hash % 100, // 0 - 99
    };
  }

  async checkRank(term: string, targetUrl: string): Promise<RankCheckResult> {
    console.log('MOCK RANK CHECK ->', term, targetUrl);
    const hash = this.hashString(term + targetUrl);
    // ~80% of the time return a plausible rank, ~20% "not found"
    if (hash % 5 === 0) return { rank: null };
    return { rank: 1 + (hash % 100) }; // 1 - 100
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}