import { useState, useRef, useEffect, memo } from 'react';
import { OptimizedPdfPageRenderer } from './OptimizedPdfPageRenderer';
import { PdfTextLayer } from './PdfTextLayer';

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
  documentId?: string;
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
  documentId,
}: PdfPageWithHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Poll for container size after image loads
  useEffect(() => {
    if (!containerRef.current) return;

    const checkSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 10 && rect.height > 10) {
        setContainerSize(prev => {
          if (Math.abs(prev.width - rect.width) > 2 || Math.abs(prev.height - rect.height) > 2) {
            return { width: rect.width, height: rect.height };
          }
          return prev;
        });
      }
    };

    const resizeObserver = new ResizeObserver(checkSize);
    resizeObserver.observe(containerRef.current);
    
    // Poll periodically to catch image load
    checkSize();
    const intervals = [100, 300, 600, 1000, 2000, 3000].map(ms => 
      setTimeout(checkSize, ms)
    );

    return () => {
      resizeObserver.disconnect();
      intervals.forEach(clearTimeout);
    };
  }, [pageNumber, pdfUrl]);

  const hasSize = containerSize.width > 10 && containerSize.height > 10;

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
      
      {/* Text layer for copy-paste and search highlight */}
      {hasSize && (
        <PdfTextLayer
          pdfUrl={pdfUrl}
          pageNumber={pageNumber}
          scale={scale}
          rotation={rotation}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
          searchHighlight={searchHighlight}
          documentId={documentId}
        />
      )}
    </div>
  );
});

export default PdfPageWithHighlight;
