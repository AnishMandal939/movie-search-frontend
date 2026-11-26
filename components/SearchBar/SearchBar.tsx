"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { searchMovies, searchTvSeries } from "~/lib/api";
import { TrendingGrid } from "~/components/TrendingGrid";
import type { Movie } from "~/types/movie";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300; // milliseconds to wait after the user stops typing before sending a request

/**
 * SearchBar is the client-side search component.
 *
 * Responsibilities:
 * - Capture a search query from an accessible form input
 * - Call GET /movies/search or GET /tv/search via lib/api#searchMovies / #searchTvSeries
 * - Debounce input changes (300ms) to avoid rapid-fire API calls
 * - Cancel in-flight requests when a new search starts (prevents flicker
 *   when the user clicks Search multiple times quickly)
 * - Render paginated results using the existing TrendingGrid / MovieCard
 * - Surface loading, empty, and error states without a full page reload
 * - Toggle between Movies and TV series search
 *
 * Search results are cached short-term (60s TTL) in lib/api.ts keyed by
 * mediaType:query:page so repeat searches hit memory, not the network.
 *
 * The component does not know whether it talks to the mock API or the real
 * backend — that is controlled entirely by NEXT_PUBLIC_API_BASE_URL.
 */
export function SearchBar() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<Movie[]>([]); // current page of results, not the full result set
  const [totalPages, setTotalPages] = useState(0); // this is for pagination, not the total results count
  const [totalResults, setTotalResults] = useState(0); // total number of results across all pages, used for display only
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");

  // Clear results when switching media type so stale results don't show
  useEffect(() => {
    setResults([]);
    setTotalPages(0);
    setTotalResults(0);
    setPage(1);
    setError(null);
  }, [mediaType]);

  /**
   * Perform a search for the given query and page.
   * Aborts any previously in-flight request before starting a new one.
   */
  const search = useCallback(
    async (mediaType: "movie" | "tv", q: string, p: number) => {
      // Cancel the previous request so rapid clicks don't race or flicker
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const searchFn = mediaType === "movie" ? searchMovies : searchTvSeries;
        const data = await searchFn(q, p, abortController.current.signal);
        // Ignore stale responses if a newer search has already started
        if (abortController.current.signal.aborted) return;

        setResults(data.results);
        setTotalPages(data.totalPages);
        setTotalResults(data.totalResults);
        setPage(data.page);
      } catch (err) {
        // Aborted requests are not errors — skip silently
        if (err instanceof DOMException && err.name === "AbortError") return;

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
        setResults([]);
        setTotalPages(0);
        setTotalResults(0);
      } finally {
        if (!abortController.current?.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [searchMovies, searchTvSeries],
  );

  const handleQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setQuery(value);

      // clear previous timer
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      const trimmed = value.trim();
      if (trimmed === "") {
        setError(null);
        setResults([]);
        setTotalPages(0);
        setTotalResults(0);
        setPage(1);
        return;
      }

      // Debounce: only search after user stops typing
      debounceTimer.current = setTimeout(() => {
        setPage(1);
        void search(mediaType, trimmed, 1);
      }, DEBOUNCE_MS);
    },
    [mediaType, search],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    const trimmed = query.trim();

    // Empty or whitespace-only queries must not trigger a search
    if (trimmed === "") {
      setError("Please enter a search query.");
      return;
    }

    setPage(1);
    void search(mediaType, trimmed, 1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    const trimmed = query.trim();
    if (trimmed === "") return;
    void search(mediaType, trimmed, nextPage);
  };

  const handleRetry = () => {
    const trimmed = query.trim();
    if (trimmed === "") return;
    void search(mediaType, trimmed, page);
  };

  const totalPagesClamped = Math.max(totalPages, 1); // Ensure we always show at least "Page 1 of 1" even when there are no results

  return (
    <section className="flex w-full flex-col gap-6">
      <div
        role="radiogroup"
        aria-label="Search media type"
        className="flex gap-1"
      >
        <button
          role="radio"
          aria-checked={mediaType === "movie"}
          onClick={() => setMediaType("movie")}
          className={`rounded-md px-3 py-1 text-sm ${
            mediaType === "movie"
              ? "bg-brand-600 text-white"
              : "border border-border bg-surface text-foreground"
          }`}
        >
          Movies
        </button>
        <button
          role="radio"
          aria-checked={mediaType === "tv"}
          onClick={() => setMediaType("tv")}
          className={`rounded-md px-3 py-1 text-sm ${
            mediaType === "tv"
              ? "bg-brand-600 text-white"
              : "border border-border bg-surface text-foreground"
          }`}
        >
          TV Series
        </button>
      </div>
      {/* Search form stays compact */}
      <div className="flex w-full max-w-md gap-2">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <label htmlFor="movie-search" className="sr-only">
            Search for a movie
          </label>
          <input
            id="movie-search"
            type="search"
            name="query"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search for a movie…"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-0 placeholder:text-muted focus:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
          <button
            type="submit"
            disabled={loading || query.trim() === ""}
            className="cursor-pointer rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
      </div>

      {error && (
        <div
          role="alert"
          className="flex w-full max-w-md rounded-md border border-red-500 bg-red-500/10 p-3 text-sm text-red-200"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-2 inline text-sm font-medium text-brand-400 hover:underline focus-visible:underline focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Only render the results section when there is an actual query.
          Clearing the input hides the results entirely. */}
      {query.trim() !== "" && (
        <section className="flex w-full flex-col gap-4">
          <div
            className="flex items-center gap-2 text-sm text-muted"
            aria-live="polite"
            aria-atomic="true"
          >
            {loading
              ? `Searching for “${query}”…`
              : totalResults === 0
                ? `No results for “${query}”`
                : `Showing results ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                    page * PAGE_SIZE,
                    totalResults,
                  )} of ${totalResults} for “${query}”`}
          </div>

          {loading ? (
            <p className="text-sm text-muted">Loading results…</p>
          ) : totalResults === 0 ? (
            <p className="text-sm text-muted">No {mediaType === "tv" ? "TV shows" : "movies"} found.</p>
          ) : (
            <TrendingGrid movies={results} />
          )}

          {totalPages > 1 && !loading && (
            <nav
              aria-label="Search results pagination"
              className="mt-2 flex w-full items-center justify-center gap-2"
            >
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
                aria-label="Previous page"
                className="flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>←</span>
                <span>Prev</span>
              </button>

              <span className="flex items-center gap-1 px-2 text-sm text-muted">
                Page&nbsp;
                <span className="font-medium text-foreground">{page}</span>
                &nbsp;of&nbsp;
                <span className="font-medium text-foreground">
                  {totalPagesClamped}
                </span>
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
                aria-label="Next page"
                className="flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            </nav>
          )}
        </section>
      )}
    </section>
  );
}
