import type { Movie, MovieDetail, SearchResponse, Video } from "~/types/movie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local and point it at the running API.",
  );
}

/**
 * Error thrown when an API request fails.
 * Carries the HTTP status code so callers can distinguish 404 from 503, etc.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Low-level fetch wrapper used by all API functions.
 * - Resolves the base URL from NEXT_PUBLIC_API_BASE_URL
 * - Sends Accept: application/json
 * - Throws ApiError on non-ok responses
 * - Accepts an optional AbortSignal to cancel in-flight requests
 */
async function apiFetch<T>(
  path: string,
  init?: RequestInit & { signal?: AbortSignal },
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });

  if (!response.ok) {
    throw new ApiError(
      `Request to ${path} failed with status ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

/**
 * Fetch the list of trending movies (GET /movies/trending).
 * Results are never cached (cache: "no-store") so the home page always
 * reflects the latest data from the API.
 */
export function getTrendingMovies(): Promise<Movie[]> {
  return apiFetch<Movie[]>("/movies/trending", { cache: "no-store" });
}

/**
 * Search movies by query and page (GET /movies/search).
 * @param query - Search term (must not be empty)
 * @param page - Page number, defaults to 1
 * @param signal - Optional AbortSignal to cancel the request
 */
export function searchMovies(
  query: string,
  page: number,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  return apiFetch<SearchResponse>(
    `/movies/search?query=${encodeURIComponent(query)}&page=${page}`,
    { cache: "no-store", signal },
  );
}

/**
 * Fetch a single movie by id (GET /movies/{id}).
 * @param signal - Optional AbortSignal to cancel the request
 */
export function getMovieDetail(
  id: number,
  signal?: AbortSignal,
): Promise<MovieDetail> {
  return apiFetch<MovieDetail>(`/movies/${id}`, { cache: "no-store", signal });
}

/**
 * Fetch videos for a movie (GET /movies/{id}/videos).
 * @param signal - Optional AbortSignal to cancel the request
 */
export function getMovieVideos(
  id: number,
  signal?: AbortSignal,
): Promise<Video[]> {
  return apiFetch<Video[]>(`/movies/${id}/videos`, {
    cache: "no-store",
    signal,
  });
}
