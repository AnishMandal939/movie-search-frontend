import { NextResponse } from "next/server";

import type { Video } from "~/types/movie";

const VIDEOS_FIXTURES: Record<number, Video[]> = {
  268: [
    {
      key: "dgC9Q0uhX70",
      name: "Official Trailer",
      site: "YouTube",
      type: "Trailer",
    },
    {
      key: "abc123def45",
      name: "Teaser Trailer",
      site: "YouTube",
      type: "Teaser",
    },
  ],
  868759: [
    {
      key: "bjqEWgDVPe0",
      name: "Official Trailer",
      site: "YouTube",
      type: "Trailer",
    },
  ],
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const videos = VIDEOS_FIXTURES[Number(id)] ?? [];

  return NextResponse.json(videos);
}
