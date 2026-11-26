import { NextResponse } from "next/server";

import type { MovieDetail } from "~/types/movie";

const DETAIL_FIXTURES: Record<number, MovieDetail> = {
  268: {
    id: 268,
    title: "Batman",
    overview: "Batman must face his most ruthless nemesis…",
    posterPath: "/cij4dd21v2Rk2YtUQbV5kW69WB2.jpg",
    backdropPath: "/2va32apQP97gvUxaMnL5wYt4CRB.jpg",
    voteAverage: 7.2,
    releaseDate: "1989-06-21",
    runtime: 126,
    tagline: "Have you ever danced with the devil in the pale moonlight?",
    genres: ["Fantasy", "Action", "Crime"],
  },
  868759: {
    id: 868759,
    title: "Ghosted",
    overview:
      "Salt-of-the-earth Cole falls head over heels for enigmatic Sadie — but then makes the shocking discovery that she’s a secret agent. Before they can decide on a second date, Cole and Sadie are swept away on an international adventure to save the world.",
    posterPath: "/liLN69YgoovHVgmlHJ876PKi5Yi.jpg",
    backdropPath: "/b9UCfDzwiWw7mIFsIQR9ZJUeh7q.jpg",
    voteAverage: 7.318,
    releaseDate: "2023-04-21",
    runtime: 152,
    tagline: "Why so serious?",
    genres: ["Action", "Crime", "Drama"],
  },
};

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const movie = DETAIL_FIXTURES[Number(id)];

  if (!movie) {
    return errorResponse(404, "Not Found", "The movie does not exist.");
  }

  return NextResponse.json(movie);
}
