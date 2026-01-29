import { memo } from 'react';
import { OptimizedPdfPageRenderer } from './OptimizedPdfPageRenderer';
import { PdfSearchHighlightBanner } from './PdfSearchHighlightBanner';

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
  onClearHighlight?: () => void;
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
  onClearHighlight,
}: PdfPageWithHighlightProps) {
  return (
    <div className={`relative ${className}`}>
      <OptimizedPdfPageRenderer
        pdfUrl={pdfUrl}
        pageNumber={pageNumber}
        scale={scale}
        rotation={rotation}
        onPageLoad={onPageLoad}
        priority={priority}
        preloadPages={preloadPages}
      />
      
      {/* Bandeau de surbrillance si une recherche est active et le documentId est fourni */}
      {searchHighlight && documentId && (
        <PdfSearchHighlightBanner
          documentId={documentId}
          pageNumber={pageNumber}
          searchText={searchHighlight}
          onClear={onClearHighlight}
        />
      )}
    </div>
  );
});

export default PdfPageWithHighlight;
