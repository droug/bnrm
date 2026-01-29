import { useState, useEffect, useRef, memo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

interface HighlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface PdfTextHighlightOverlayProps {
  pdfUrl: string;
  pageNumber: number;
  searchText: string;
  scale?: number;
  rotation?: number;
  containerWidth: number;
  containerHeight: number;
}

// Cache for PDF documents
const documentCache = new Map<string, pdfjsLib.PDFDocumentProxy>();

const loadPdfDocument = async (pdfUrl: string): Promise<pdfjsLib.PDFDocumentProxy> => {
  if (documentCache.has(pdfUrl)) {
    return documentCache.get(pdfUrl)!;
  }
  
  const loadingTask = pdfjsLib.getDocument({
    url: pdfUrl,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/cmaps/',
    cMapPacked: true,
  });
  
  const pdf = await loadingTask.promise;
  documentCache.set(pdfUrl, pdf);
  return pdf;
};

export const PdfTextHighlightOverlay = memo(function PdfTextHighlightOverlay({
  pdfUrl,
  pageNumber,
  searchText,
  scale = 1.5,
  rotation = 0,
  containerWidth,
  containerHeight,
}: PdfTextHighlightOverlayProps) {
  const [highlights, setHighlights] = useState<HighlightRect[]>([]);
  const [pageViewport, setPageViewport] = useState<{ width: number; height: number } | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    if (!searchText || searchText.length < 2 || !pdfUrl) {
      setHighlights([]);
      return;
    }

    const findTextPositions = async () => {
      try {
        const pdf = await loadPdfDocument(pdfUrl);
        
        if (!mountedRef.current) return;
        
        if (pageNumber < 1 || pageNumber > pdf.numPages) {
          setHighlights([]);
          return;
        }

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale, rotation });
        
        setPageViewport({ width: viewport.width, height: viewport.height });
        
        const textContent = await page.getTextContent();
        
        if (!mountedRef.current) return;

        const searchLower = searchText.toLowerCase();
        const foundHighlights: HighlightRect[] = [];

        // Process each text item
        for (const item of textContent.items) {
          const textItem = item as TextItem;
          if (!textItem.str) continue;

          const itemTextLower = textItem.str.toLowerCase();
          let searchIndex = 0;
          
          while ((searchIndex = itemTextLower.indexOf(searchLower, searchIndex)) !== -1) {
            // Calculate the position of the match within this text item
            const transform = textItem.transform;
            
            // Get base position from transform matrix
            // transform[4] = x position, transform[5] = y position
            const baseX = transform[4];
            const baseY = transform[5];
            
            // Estimate character width
            const charWidth = textItem.str.length > 0 
              ? (textItem.width / textItem.str.length) 
              : 10;
            
            // Calculate highlight position
            const offsetX = searchIndex * charWidth;
            const highlightWidth = searchText.length * charWidth;
            
            // Apply scale and rotation transforms
            const scaledX = (baseX + offsetX) * (scale / 1.5);
            const scaledY = baseY * (scale / 1.5);
            const scaledWidth = highlightWidth * (scale / 1.5);
            const scaledHeight = (textItem.height || 12) * (scale / 1.5);

            // PDF coordinates have origin at bottom-left, we need top-left
            // Viewport height minus y position gives us top-left origin
            const topY = viewport.height - scaledY - scaledHeight;

            foundHighlights.push({
              left: scaledX,
              top: topY,
              width: Math.max(scaledWidth, 20),
              height: Math.max(scaledHeight, 14),
            });

            searchIndex += searchText.length;
          }
        }

        if (mountedRef.current) {
          setHighlights(foundHighlights);
        }
      } catch (error) {
        console.warn('Error finding text positions:', error);
        setHighlights([]);
      }
    };

    findTextPositions();

    return () => {
      mountedRef.current = false;
    };
  }, [pdfUrl, pageNumber, searchText, scale, rotation]);

  if (highlights.length === 0 || !pageViewport) {
    return null;
  }

  // Calculate scale factors between PDF viewport and actual container
  const scaleX = containerWidth / pageViewport.width;
  const scaleY = containerHeight / pageViewport.height;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
      style={{ overflow: 'hidden' }}
    >
      {highlights.map((highlight, index) => (
        <div
          key={`highlight-${index}`}
          className="absolute animate-pulse"
          style={{
            left: `${highlight.left * scaleX}px`,
            top: `${highlight.top * scaleY}px`,
            width: `${highlight.width * scaleX}px`,
            height: `${highlight.height * scaleY}px`,
            backgroundColor: 'rgba(255, 235, 59, 0.5)',
            borderRadius: '2px',
            boxShadow: '0 0 4px rgba(255, 193, 7, 0.6)',
            border: '1px solid rgba(255, 193, 7, 0.8)',
          }}
        />
      ))}
    </div>
  );
});

export default PdfTextHighlightOverlay;
