// ============================================================================
// WHAT IS THIS FILE?
// Where you search for a keyword idea and see suggested related keywords
// with their estimated search volume and ranking difficulty — per SOW
// Section 3.2 ("Keyword research with search-volume/difficulty lookups").
// From here, you can "Track" any suggestion to start following its actual
// ranking over time on the Rank Tracker screen.
// ============================================================================

import { useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { useSeoStore } from "../../store/useSeoStore";
import type { KeywordSuggestion } from "../../../modules/seo/types/keyword";

function difficultyLabel(difficulty: number): string {
  if (difficulty < 30) return "Easy";
  if (difficulty < 60) return "Medium";
  return "Hard";
}

export function KeywordResearch() {
  const { searchResults, searching, searchKeywords, trackKeyword, trackedKeywords } = useSeoStore();
  const [query, setQuery] = useState("");

  function handleSearch() {
    searchKeywords(query);
  }

  const alreadyTracked = (keyword: string) => trackedKeywords.some((k) => k.keyword === keyword);

  return (
    <div className="keyword-research">
      <div className="search-box search-box--wide">
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Enter a keyword idea, e.g. 'ai receptionist'"
        />
      </div>
      <button className="primary-button" onClick={handleSearch} disabled={searching || !query.trim()}>
        {searching ? <Loader2 size={14} className="spin" /> : <Search size={14} />}
        Search
      </button>

      <p className="muted-text seo-source-note">
        Search volume and difficulty shown here are placeholder estimates — see
        modules/seo/services/keywordProvider.ts for where real data from a paid
        provider (DataForSEO / SEMrush / Ahrefs) will plug in.
      </p>

      {searching && (
        <div className="loading-row">
          <Loader2 size={16} className="spin" /> Searching…
        </div>
      )}

      {!searching && searchResults.length === 0 && query && (
        <p className="empty-state">No results yet — try searching above.</p>
      )}

      <div className="keyword-list">
        {searchResults.map((result: KeywordSuggestion) => (
          <div key={result.keyword} className="keyword-row">
            <div>
              <p className="keyword-row__term">{result.keyword}</p>
              <p className="muted-text">
                Vol. {result.search_volume.toLocaleString()}/mo · {difficultyLabel(result.difficulty)} ({result.difficulty})
              </p>
            </div>
            <button
              className="secondary-button"
              disabled={alreadyTracked(result.keyword)}
              onClick={() => trackKeyword(result)}
            >
              <Plus size={13} /> {alreadyTracked(result.keyword) ? "Tracked" : "Track"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
