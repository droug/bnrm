import { useState, useRef, useEffect, memo } from 'react';
import { OptimizedPdfPageRenderer } from './OptimizedPdfPageRenderer';
import { PdfTextHighlightOverlay } from './PdfTextHighlightOverlay';

interface PdfPageWithHighlightProps {
  pdfUrl: string;
  pageNumber: number;
  scale?: number;
  rotation?: number;
  className?: string;
  onPageLoad?: (totalPages: number) => void;
  priority?: 'high' | 'low';
  preloadPages?: number[];
  searchHighlight?: string;
}

export const PdfPageWithHighlight = memo(function PdfPageWithHighlight({
  pdfUrl,
  pageNumber,
  scale = 1.5,
  rotation = 0,
  className = '',
  onPageLoad,
  priority = 'high',
  preloadPages,
  searchHighlight,
}: PdfPageWithHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Observer le changement de taille du conteneur
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    // Initial size
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setContainerSize({ width: rect.width, height: rect.height });
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <OptimizedPdfPageRenderer
        pdfUrl={pdfUrl}
        pageNumber={pageNumber}
        scale={scale}
        rotation={rotation}
        onPageLoad={onPageLoad}
        priority={priority}
        preloadPages={preloadPages}
      />
      
      {/* Overlay de surbrillance si une recherche est active */}
      {searchHighlight && containerSize.width > 0 && containerSize.height > 0 && (
        <PdfTextHighlightOverlay
          pdfUrl={pdfUrl}
          pageNumber={pageNumber}
          searchText={searchHighlight}
          scale={scale}
          rotation={rotation}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
        />
      )}
    </div>
  );
});

export default PdfPageWithHighlight;
