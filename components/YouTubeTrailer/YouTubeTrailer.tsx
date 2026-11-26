"use client";

import type { Video } from "~/types/movie";

interface YouTubeTrailerProps {
  videos: Video[];
}

/**
 * YouTubeTrailer embeds the first YouTube trailer from a list of videos.
 *
 * - Only renders when at least one video exists
 * - Picks the first video with type === "Trailer", falls back to the first video
 * - Filters are applied by the caller (site === "YouTube"); this component just embeds
 * - Uses youtube-nocookie-compatible embed URL pattern
 */
export function YouTubeTrailer({ videos }: YouTubeTrailerProps) {
  const trailer = videos.find((video) => video.type === "Trailer") ?? videos[0];

  if (!trailer) {
    return null;
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-surface">
      <iframe
        title="YouTube trailer"
        src={`https://www.youtube.com/embed/${trailer.key}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="h-full w-full border-0"
      />
    </div>
  );
}
