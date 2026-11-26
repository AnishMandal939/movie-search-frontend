import { SearchBar } from "~/components/SearchBar";
import { TrendingGrid } from "~/components/TrendingGrid";
import { getTrendingMovies } from "~/lib/api";

/**
 * Home page (server component).
 *
 * - Renders per-request (force-dynamic) because it depends on the live API
 *   being reachable — not safe to statically generate at build time in CI
 * - Fetches trending movies via GET /movies/trending
 * - Renders the SearchBar (client component) for user-initiated search
 * - Rendering strategy: server-rendered trending, client-rendered search
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const trendingMovies = await getTrendingMovies();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Movie Search Case
        </h1>
        <SearchBar />
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-foreground">
          Trending this week
        </h2>
        <TrendingGrid movies={trendingMovies} />
      </section>
    </main>
  );
}
