import { NextResponse } from "next/server";

import type { Movie } from "~/types/movie";

const TV_SEARCH_FIXTURES: Movie[] = [
  {
    id: 101,
    title: "Friends",
    overview: "Six young people navigate life and love in New York City.",
    posterPath: "/2koX1xLkpTQM4IZebYvKysFW1Nh.jpg",
    backdropPath: "/l0qVZIpXtIo7km9u5Yqh0nKPOr5.jpg",
    voteAverage: 8.5,
    releaseDate: "1994-09-22",
  },
  {
    id: 102,
    title: "Breaking Bad",
    overview: "A chemistry teacher turns to making methamphetamine.",
    posterPath: "/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg",
    backdropPath: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    voteAverage: 8.9,
    releaseDate: "2008-01-20",
  },
  {
    id: 103,
    title: "Stranger Things",
    overview: "Kids uncover supernatural mysteries in a small town.",
    posterPath: "/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg",
    backdropPath: "/9P4IIMYY3HifqeruZq0ZZ9g7YUi.jpg",
    voteAverage: 8.2,
    releaseDate: "2016-07-15",
  },
  {
    id: 104,
    title: "The Office",
    overview: "A mockumentary on the daily lives of office employees.",
    posterPath: "/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg",
    backdropPath: "/9vMzIrMIncPmtalcxh1MOrgcE6C.jpg",
    voteAverage: 8.4,
    releaseDate: "2005-03-24",
  },
  {
    id: 105,
    title: "Game of Thrones",
    overview: "Noble families vie for control of the Iron Throne.",
    posterPath: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    backdropPath: "/zZqpAXxVSBtxV9qPBcscfXBcL2w.jpg",
    voteAverage: 8.6,
    releaseDate: "2011-04-17",
  },
];

const RESULTS_PER_PAGE = 4;

function errorResponse(status: number, title: string, detail: string) {
  return new NextResponse(
    JSON.stringify({
      type: "about:blank",
      title,
      status,
      detail,
    }),
    {
      status,
      headers: { "Content-Type": "application/problem+json" },
    },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const pageParam = searchParams.get("page");

  if (!query || query.trim() === "") {
    return errorResponse(
      400,
      "Invalid request",
      "The 'query' parameter is required.",
    );
  }

  let page = 1;
  if (pageParam !== null) {
    const parsed = Number(pageParam);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 500) {
      return errorResponse(
        400,
        "Invalid request",
        "The 'page' parameter must be a whole number from 1 to 500.",
      );
    }
    page = parsed;
  }

  if (query.toLowerCase() === "error") {
    return errorResponse(
      503,
      "Service Unavailable",
      "TMDB is down or did not respond.",
    );
  }

  if (query.toLowerCase() === "slow") {
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  const normalized = query.toLowerCase().trim();
  const matches =
    normalized === "noresults"
      ? []
      : TV_SEARCH_FIXTURES.filter((movie) =>
          movie.title.toLowerCase().includes(normalized),
        );

  const totalResults = matches.length;
  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE) || 0;
  const safePage = page > totalPages && totalPages > 0 ? totalPages : page;
  const start = (safePage - 1) * RESULTS_PER_PAGE;
  const results = matches.slice(start, start + RESULTS_PER_PAGE);

  return NextResponse.json({
    page: safePage,
    totalPages,
    totalResults,
    results,
  });
}
