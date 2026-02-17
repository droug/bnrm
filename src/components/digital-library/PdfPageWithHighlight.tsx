import { useState, useRef, useCallback, useEffect, memo } from 'react';
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
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Detect image size via multiple strategies
  useEffect(() => {
    if (!containerRef.current) return;

    const detect = () => {
      if (!containerRef.current) return;
      const img = containerRef.current.querySelector('img');
      if (!img) return;
      // Use getBoundingClientRect for reliable dimensions
      const rect = img.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w > 10 && h > 10) {
        setImageSize(prev => {
          if (Math.abs(prev.width - w) > 2 || Math.abs(prev.height - h) > 2) {
            return { width: w, height: h };
          }
          return prev;
        });
      }
    };

    const ro = new ResizeObserver(detect);
    ro.observe(containerRef.current);
    const mo = new MutationObserver(detect);
    mo.observe(containerRef.current, { childList: true, subtree: true, attributes: true });
    // More aggressive polling to catch layout completion
    const timers = [50, 100, 200, 400, 700, 1200, 2000, 3500, 5000].map(ms => setTimeout(detect, ms));

    return () => { ro.disconnect(); mo.disconnect(); timers.forEach(clearTimeout); };
  }, [pageNumber, pdfUrl]);

  const hasSize = imageSize.width > 10 && imageSize.height > 10;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <OptimizedPdfPageRenderer
        pdfUrl={pdfUrl}
        pageNumber={pageNumber}
        scale={scale}
        rotation={rotation}
        onPageLoad={onPageLoad}
        onImageRendered={(w, h) => {
          if (w > 10 && h > 10) setImageSize({ width: w, height: h });
        }}
        priority={priority}
        preloadPages={preloadPages}
      />
      
      {hasSize && (
        <PdfTextLayer
          pdfUrl={pdfUrl}
          pageNumber={pageNumber}
          scale={scale}
          rotation={rotation}
          containerWidth={imageSize.width}
          containerHeight={imageSize.height}
          searchHighlight={searchHighlight}
          documentId={documentId}
        />
      )}
    </div>
  );
});

export default PdfPageWithHighlight;
