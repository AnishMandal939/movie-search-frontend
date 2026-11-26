/**
 * Core movie shape shared by trending, search, and detail endpoints.
 * Matches the API contract exactly — field names and types must not change.
 *
 * Fields marked `string | null` may be null when the API has no value.
 */
export interface Movie {
  id: number;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string | null;
}

/**
 * Paginated search response (GET /movies/search).
 */
export interface SearchResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: Movie[];
}

/**
 * Movie detail extends Movie with extra fields from GET /movies/{id}.
 */
export interface MovieDetail extends Movie {
  runtime: number | null;
  tagline: string | null;
  genres: string[];
}

/**
 * Video object from GET /movies/{id}/videos.
 * Only videos with site === "YouTube" are embedded.
 */
export interface Video {
  key: string;
  name: string;
  site: string;
  type: string;
}
