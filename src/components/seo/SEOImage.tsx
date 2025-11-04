import { useState } from "react";
import { cn } from "@/lib/utils";

interface SEOImageProps {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

/**
 * SEO-optimized image component with:
 * - Mandatory alt text for accessibility
 * - Lazy loading by default
 * - Responsive behavior
 * - Loading state handling
 */
export default function SEOImage({
  src,
  alt,
  title,
  width,
  height,
  className = "",
  loading = "lazy",
  priority = false
}: SEOImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <span className="text-sm">Image non disponible</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      title={title || alt}
      width={width}
      height={height}
      loading={priority ? "eager" : loading}
      className={cn(
        "transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
    />
  );
}
