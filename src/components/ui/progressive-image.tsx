import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  blurAmount?: number;
  aspectRatio?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Progressive Image Component
 * 
 * Implements best practices for image loading:
 * - Shows low-resolution placeholder first (blur-up effect)
 * - Lazy loading with IntersectionObserver
 * - Smooth transition from placeholder to full image
 * - Skeleton loading state
 * - Priority loading option for above-the-fold images
 */
export function ProgressiveImage({
  src,
  alt,
  className = '',
  placeholderSrc,
  blurAmount = 20,
  aspectRatio = '16/9',
  priority = false,
  onLoad,
  onError,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={{ aspectRatio }}
        role="img"
        aria-label={alt}
      >
        <span className="text-sm">Image non disponible</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={{ aspectRatio }}
    >
      {/* Skeleton placeholder while not in view */}
      {!isInView && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Low-res placeholder with blur (progressive loading) */}
      {isInView && placeholderSrc && !isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          style={{ filter: `blur(${blurAmount}px)`, transform: 'scale(1.1)' }}
        />
      )}

      {/* Skeleton while loading (if no placeholder) */}
      {isInView && !placeholderSrc && !isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Full resolution image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

/**
 * Generate a tiny placeholder URL for progressive loading
 * Uses a data URL with a very small blurred version
 */
export function generatePlaceholderUrl(originalUrl: string, width = 20): string {
  // For Supabase storage URLs, we can request a smaller version
  if (originalUrl.includes('supabase.co/storage')) {
    const url = new URL(originalUrl);
    url.searchParams.set('width', width.toString());
    url.searchParams.set('quality', '10');
    return url.toString();
  }
  
  // For other URLs, return original (browser will handle caching)
  return originalUrl;
}
