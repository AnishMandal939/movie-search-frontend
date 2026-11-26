import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { getMovieDetail, getMovieVideos } from "~/lib/api";
import type { MovieDetail } from "~/types/movie";
import { YouTubeTrailer } from "~/components/YouTubeTrailer";

export const dynamic = "force-dynamic";

/**
 * MovieDetailPage renders the details for a single movie.
 *
 * - Server component (force-dynamic) because it depends on live API data
 * - Fetches movie details (GET /movies/{id}) and videos (GET /movies/{id}/videos)
 * - Returns 404 via next/navigation#notFound when the movie does not exist
 * - Embeds the first YouTube trailer, if any
 * - Uses `unoptimized` on <Image> to avoid upstream 404 from mock fixture paths
 */
export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);

  let movie: MovieDetail;
  try {
    movie = await getMovieDetail(movieId);
  } catch (err) {
    if (
      err instanceof Error &&
      "status" in err &&
      (err as { status: number }).status === 404
    ) {
      notFound();
    }
    throw err;
  }

  const videos = await getMovieVideos(movieId);
  const trailers = videos.filter((video) => video.site === "YouTube");

  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : null;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <nav className="flex gap-2">
        <Link
          href="/"
          className="rounded-md border border-border bg-surface px-3 py-1 text-sm text-foreground hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          ← Back to search
        </Link>
      </nav>

      <article className="flex flex-col gap-6 md:flex-row md:gap-8">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-border bg-surface">
            {movie.posterPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
                alt={`${movie.title} poster`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 200px, 45vw"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                No poster
              </div>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {movie.title}
          </h1>
          <p className="text-sm text-muted">
            {year} · ★ {movie.voteAverage.toFixed(1)}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {movie.overview && (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-medium text-foreground">Overview</h2>
              <p className="text-sm text-foreground">{movie.overview}</p>
            </section>
          )}
          {movie.tagline && (
            <section className="flex flex-col gap-1">
              <h3 className="text-sm font-medium text-muted">Tagline</h3>
              <p className="text-sm text-foreground italic">
                “{movie.tagline}”
              </p>
            </section>
          )}
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted">Details</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-foreground">
              {movie.runtime && <li>Runtime: {movie.runtime} minutes</li>}
              {movie.genres.length > 0 && (
                <li>Genres: {movie.genres.join(", ")}</li>
              )}
              {movie.releaseDate && <li>Release date: {movie.releaseDate}</li>}
            </ul>
          </section>
          {trailers.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-medium text-foreground">Trailer</h2>
              <YouTubeTrailer videos={trailers} />
            </section>
          )}
        </div>
      </article>
    </main>
  );
}
