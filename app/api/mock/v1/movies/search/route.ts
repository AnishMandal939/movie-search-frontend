import { NextResponse } from "next/server";

import type { Movie } from "~/types/movie";

const SEARCH_FIXTURES: Movie[] = [
  {
    id: 268,
    title: "Batman",
    overview: "Batman must face his most ruthless nemesis…",
    posterPath: "/cij4dd21v2Rk2YtUQbV5kW69WB2.jpg",
    backdropPath: "/2va32apQP97gvUxaMnL5wYt4CRB.jpg",
    voteAverage: 7.2,
    releaseDate: "1989-06-21",
  },
  {
    id: 550,
    title: "Fight Club",
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground \"fight clubs\" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
    posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdropPath: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    voteAverage: 8.43,
    releaseDate: "1999-10-15",
  },
  {
    id: 883656,
    title: "GCW Fight Club",
    overview: "GCW presents Fight Club straight from the Showboat Hotel in Atlantic City, NJ! The event features the GCW World Championship match where Mox defends against Gage in a match that we have been waiting for during the last decade. Who will be the new GCW World Champion?",
    posterPath: "/a9RWdhRLyx3BqCjlwmZJHXyeMkR.jpg",
    backdropPath: null,
    voteAverage: 6.5,
    releaseDate: "2021-10-09",
  },
  {
    id: 209112,
    title: "Batman v Superman: Dawn of Justice",
    overview: "Batman and Superman clash while a new threat emerges.",
    posterPath: "/5UsK3grJvtQrtzEgqNlDljJW96w.jpg",
    backdropPath: "/5fX1oSGuYdKgwWmUTAN5MNSQGzr.jpg",
    voteAverage: 6.4,
    releaseDate: "2016-03-23",
  },
  {
    id: 468557,
    title: "The Batman",
    overview: "Bruce Wayne tracks a sadistic serial killer in Gotham.",
    posterPath: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdropPath: "/rvtdN5XkWAfGX6xDuPL6yYS2seK.jpg",
    voteAverage: 7.5,
    releaseDate: "2022-03-01",
  },
  {
    id: 10664,
    title: "Batman Begins",
    overview: "Bruce Wayne becomes Batman after training in the Himalayas.",
    posterPath: "/sPX89Td70IDDjVr85jdSBb4rWGr.jpg",
    backdropPath: "/9IIBboV7MCT0bTxzXHmWK1Hq558.jpg",
    voteAverage: 7.5,
    releaseDate: "2005-06-10",
  },
  {
    id: 269,
    title: "Batman Returns",
    overview: "Batman faces the Penguin and Catwoman in Gotham.",
    posterPath: "/sPX89Td70IDDjVr85jdSBb4rWGr.jpg",
    backdropPath: "/9IIBboV7MCT0bTxzXHmWK1Hq558.jpg",
    voteAverage: 6.9,
    releaseDate: "1992-06-19",
  },
  {
    id: 674,
    title: "Batman Forever",
    overview: "Batman battles Two-Face and the Riddler.",
    posterPath: "/i0fJS8M5UKoETjjJ0zwUiKaR8tr.jpg",
    backdropPath: "/snlu32RmjldF9b068UURJg8sQtn.jpg",
    voteAverage: 6.0,
    releaseDate: "1995-06-16",
  },
  {
    id: 757,
    title: "Batman & Robin",
    overview: "Batman and Robin face Mr. Freeze and Poison Ivy.",
    posterPath: "/i7hEUpDuMN2LOrCEifFyGSHZQSY.jpg",
    backdropPath: "/kEuQWHte2erRpAICrYqkAZaZAAY.jpg",
    voteAverage: 4.4,
    releaseDate: "1997-06-20",
  },
  {
    id: 12345,
    title: "Batman: The Animated Movie",
    overview: "Classic animated Batman adventure.",
    posterPath: "/hT4ehUteagUrhUOHAtmYiY7mp5l.jpg",
    backdropPath: "/cMUuAgVsMWOCawXonZ4D1dSMd6h.jpg",
    voteAverage: 7.1,
    releaseDate: "1993-07-25",
  },
  {
    id: 67890,
    title: "Batman Beyond: Return of the Joker",
    overview: "The new Batman faces the resurrected Joker.",
    posterPath: "/zH9fR6DLwiqXfpuNh4kecrgeOpd.jpg",
    backdropPath: "/cpsCU7XJ3GbyqK4oa34pYsCAycU.jpg",
    voteAverage: 7.3,
    releaseDate: "2000-12-12",
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
      : SEARCH_FIXTURES.filter((movie) =>
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
