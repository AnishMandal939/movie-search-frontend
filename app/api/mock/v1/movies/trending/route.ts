import { NextResponse } from "next/server";

import type { Movie } from "~/types/movie";

const TRENDING: Movie[] = [
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
    id: 868759,
    title: "Ghosted",
    overview:
      "Salt-of-the-earth Cole falls head over heels for enigmatic Sadie — but then makes the shocking discovery that she’s a secret agent. Before they can decide on a second date, Cole and Sadie are swept away on an international adventure to save the world.",
    posterPath: "/liLN69YgoovHVgmlHJ876PKi5Yi.jpg",
    backdropPath: "/b9UCfDzwiWw7mIFsIQR9ZJUeh7q.jpg",
    voteAverage: 7.318,
    releaseDate: "2023-04-21",
  },
  {
    id: 502356,
    title: "The Super Mario Bros. Movie",
    overview:
      "While working underground to fix a water main, Brooklyn plumbers—and brothers—Mario and Luigi are transported down a mysterious pipe and wander into a magical new world. But when the brothers are separated, Mario embarks on an epic quest to find Luigi.",
    posterPath: "/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg",
    backdropPath: "/iJQIbOPm81fPEGKt5BPuZmfnA54.jpg",
    voteAverage: 7.51,
    releaseDate: "2023-04-05",
  },
];

export async function GET() {
  return NextResponse.json(TRENDING);
}
