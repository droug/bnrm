import { useState, useRef, useCallback, memo } from 'react';
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

  const handleImageRendered = useCallback((width: number, height: number) => {
    if (width > 10 && height > 10) {
      setImageSize(prev => {
        if (Math.abs(prev.width - width) > 2 || Math.abs(prev.height - height) > 2) {
          return { width, height };
        }
        return prev;
      });
    }
  }, []);

  const hasSize = imageSize.width > 10 && imageSize.height > 10;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <OptimizedPdfPageRenderer
        pdfUrl={pdfUrl}
        pageNumber={pageNumber}
        scale={scale}
        rotation={rotation}
        onPageLoad={onPageLoad}
        onImageRendered={handleImageRendered}
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
