# Submission notes

## Prioritized / skipped

- **P0 (core)**: complete. Mock API (trending + search), `searchMovies(query, page)` in `lib/api.ts`, `SearchBar` wired to `GET /movies/search`, results rendered with `MovieCard`/`TrendingGrid`, pagination driven by `page`/`totalPages`/`totalResults`.
- **P1**: complete. Loading, empty and error states for search; accessibility (labels, `focus-visible` rings, `aria-live` results announcement, `aria-label` on controls). Verified via mock trigger values (`slow`, `error`, `noresults`, empty query).
- **P2**: complete. Movie detail page at `/movies/[id]` using `GET /movies/{id}`; YouTube trailer embed via `GET /movies/{id}/videos`; both endpoints added to the mock. `MovieCard` links to the detail page.
- **P3 (stretch)**: skipped (TV/series search, debouncing/caching) to keep scope focused and all P0–P2 checks passing.

## Mock API

Built with Next.js route handlers under `app/api/mock/v1/` (no new tools, easy to delete later). Fixed JSON fixtures only; no TMDB calls. App code only knows `NEXT_PUBLIC_API_BASE_URL` — switching to the real backend requires changing only that env var to `http://localhost:5080/api/v1`.

Search trigger values (`GET /movies/search?query=...&page=...`):

| Query                                 | Case                                                           | Status |
| ------------------------------------- | -------------------------------------------------------------- | ------ |
| `batman`                              | Results across multiple pages (≥3)                             | 200    |
| `noresults`                           | No results (`totalPages: 0`, `totalResults: 0`, `results: []`) | 200    |
| `slow`                                | ~3 second delay                                                | 200    |
| `error`                               | Server unavailable                                             | 503    |
| empty `query` or `page` outside 1–500 | Invalid request                                                | 400    |

All errors use `application/problem+json` (`type`, `title`, `status`, `detail`).

Detail (`GET /movies/{id}`): id `268` (Batman) and `49026` (The Dark Knight) return full detail; any unknown id returns 404.
Videos (`GET /movies/{id}/videos`): id `268` and `49026` return YouTube trailers; other ids return an empty array.

## Rendering strategy

- **Trending** (`/`): Server Component (`page.tsx` is `async` with `dynamic = "force-dynamic"`), fetched per-request via `getTrendingMovies()` (`cache: "no-store"`). Reason: depends on the live API being reachable at request time; not safe to statically generate at build (CI can't reach the backend).
- **Search** (`SearchBar`): Client Component. User-driven interactivity (submit, pagination, loading/empty/error without full-page reload). Data fetched via `searchMovies()` following the same `apiFetch` pattern.
- **Detail** (`/movies/[id]`): Server Component (`force-dynamic`), fetches `getMovieDetail` + `getMovieVideos` server-side; 404 handled with `notFound()`. Trailer embed is a client component (`YouTubeTrailer`) since it renders an `<iframe>`.
- **Loading/Error**: Next.js `loading.tsx`/`error.tsx` boundaries for server-rendered fallback UI; client-side search states managed in `SearchBar` state with an `aria-live` region.

## Switching to the real API

Change only `NEXT_PUBLIC_API_BASE_URL` in `.env.local` from `http://localhost:3000/api/mock/v1` to `http://localhost:5080/api/v1`. No app code changes required.

## Verification

`pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` all pass.

## Known environment notes

- Fixture poster paths point to TMDB image URLs that do not exist in the mock environment. `<Image>` uses `unoptimized` to prevent Next.js from fetching/optimizing them upstream (avoids 404 errors and hydration mismatch).
- The `className="hydrated"` difference on `<html>` in dev is from Next.js dev tooling / browser extensions, not application code.
