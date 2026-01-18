import { useEffect, useMemo, useState } from "react";

interface YoutubeThumbnailProps {
  youtubeId: string;
  alt: string;
  className?: string;
}

const FALLBACK_QUALITIES = ["hqdefault", "sddefault", "mqdefault", "default"] as const;

export function YoutubeThumbnail({ youtubeId, alt, className }: YoutubeThumbnailProps) {
  const safeId = useMemo(() => youtubeId.trim(), [youtubeId]);

  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [useMaxRes, setUseMaxRes] = useState(false);

  // Reset when the video changes
  useEffect(() => {
    setFallbackIndex(0);
    setUseMaxRes(false);
  }, [safeId]);

  // Progressive enhancement: try to upgrade to maxres when it truly exists
  useEffect(() => {
    if (!safeId) return;
    if (fallbackIndex !== 0) return; // don't upgrade if we already had to fallback

    const img = new Image();
    img.src = `https://i.ytimg.com/vi/${safeId}/maxresdefault.jpg`;

    img.onload = () => {
      // Real maxres thumbnails are usually wide (>= 1000px)
      if (img.naturalWidth >= 1000) setUseMaxRes(true);
    };

    // ignore errors silently
  }, [safeId, fallbackIndex]);

  const src = useMemo(() => {
    if (!safeId) return "";

    if (useMaxRes) return `https://i.ytimg.com/vi/${safeId}/maxresdefault.jpg`;

    const q = FALLBACK_QUALITIES[Math.min(fallbackIndex, FALLBACK_QUALITIES.length - 1)];
    return `https://i.ytimg.com/vi/${safeId}/${q}.jpg`;
  }, [fallbackIndex, safeId, useMaxRes]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() =>
        setFallbackIndex((i) => Math.min(i + 1, FALLBACK_QUALITIES.length - 1))
      }
    />
  );
}
