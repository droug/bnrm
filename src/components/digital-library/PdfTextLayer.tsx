import { useEffect, useRef, useState, memo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { supabase } from '@/integrations/supabase/client';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface PdfTextLayerProps {
  pdfUrl: string;
  pageNumber: number;
  scale?: number;
  rotation?: number;
  containerWidth: number;
  containerHeight: number;
  searchHighlight?: string;
  documentId?: string;
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

export const PdfTextLayer = memo(function PdfTextLayer({
  pdfUrl,
  pageNumber,
  scale = 1.5,
  rotation = 0,
  containerWidth,
  containerHeight,
  searchHighlight,
  documentId,
}: PdfTextLayerProps) {
  const textLayerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const [useFallback, setUseFallback] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);

  // Try pdf.js native text layer first
  useEffect(() => {
    mountedRef.current = true;
    
    const renderTextLayer = async () => {
      if (!textLayerRef.current || containerWidth <= 0 || containerHeight <= 0) return;

      // Clear previous content
      textLayerRef.current.innerHTML = '';

      try {
        const pdf = await loadPdfDocument(pdfUrl);
        if (!mountedRef.current) return;

        if (pageNumber < 1 || pageNumber > pdf.numPages) return;

        const page = await pdf.getPage(pageNumber);
        if (!mountedRef.current) return;

        // Get the page viewport at scale 1 to know the natural dimensions
        const baseViewport = page.getViewport({ scale: 1, rotation });
        const textContent = await page.getTextContent();
        if (!mountedRef.current || !textLayerRef.current) return;

        // Check if PDF has actual text content
        const hasText = textContent.items.some((item: any) => item.str && item.str.trim().length > 0);
        
        if (!hasText) {
          setUseFallback(true);
          return;
        }

        const textLayerDiv = textLayerRef.current;
        
        // Calculate the scale needed to match the container size
        const fitScale = containerWidth / baseViewport.width;
        const fitViewport = page.getViewport({ scale: fitScale, rotation });
        
        textLayerDiv.style.setProperty('--scale-factor', `${fitScale}`);
        textLayerDiv.style.width = `${containerWidth}px`;
        textLayerDiv.style.height = `${containerHeight}px`;
        textLayerDiv.style.transform = '';

        const textLayer = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport: fitViewport,
        });

        await textLayer.render();
        if (!mountedRef.current) return;

        // Highlight search terms
        if (searchHighlight && searchHighlight.length >= 2) {
          highlightSearchTerms(textLayerDiv, searchHighlight);
        }

      } catch (error) {
        console.warn('Error rendering text layer:', error);
        setUseFallback(true);
      }
    };

    renderTextLayer();

    return () => {
      mountedRef.current = false;
    };
  }, [pdfUrl, pageNumber, scale, rotation, containerWidth, containerHeight, searchHighlight]);

  // Fetch OCR text for fallback
  useEffect(() => {
    if (!useFallback || !documentId) return;

    const fetchOcrText = async () => {
      const { data } = await supabase
        .from('digital_library_pages')
        .select('ocr_text')
        .eq('document_id', documentId)
        .eq('page_number', pageNumber)
        .single();
      
      if (data?.ocr_text) {
        setOcrText(data.ocr_text);
      }
    };

    fetchOcrText();
  }, [useFallback, documentId, pageNumber]);

  // Render OCR text fallback with highlights
  useEffect(() => {
    if (!useFallback || !ocrText || !textLayerRef.current) return;

    const div = textLayerRef.current;
    div.innerHTML = '';
    div.style.transform = '';
    div.style.width = `${containerWidth}px`;
    div.style.height = `${containerHeight}px`;

    // Create a selectable text overlay spanning the whole page
    const textOverlay = document.createElement('div');
    textOverlay.className = 'pdf-ocr-text-overlay';
    
    if (searchHighlight && searchHighlight.length >= 2) {
      const escapedSearch = searchHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedSearch})`, 'gi');
      const parts = ocrText.split(regex);
      
      parts.forEach((part) => {
        if (part.toLowerCase() === searchHighlight.toLowerCase()) {
          const mark = document.createElement('mark');
          mark.className = 'pdf-search-highlight';
          mark.textContent = part;
          textOverlay.appendChild(mark);
        } else {
          textOverlay.appendChild(document.createTextNode(part));
        }
      });
    } else {
      textOverlay.textContent = ocrText;
    }

    div.appendChild(textOverlay);
  }, [useFallback, ocrText, searchHighlight, containerWidth, containerHeight]);

  return (
    <div
      ref={textLayerRef}
      className={`absolute top-0 left-0 z-30 ${useFallback ? 'pdf-ocr-layer' : 'pdf-text-layer textLayer'}`}
      style={{ pointerEvents: 'auto', userSelect: 'text', WebkitUserSelect: 'text' }}
    />
  );
});

function highlightSearchTerms(container: HTMLDivElement, searchText: string) {
  const spans = container.querySelectorAll('span');
  const searchLower = searchText.toLowerCase();

  spans.forEach((span) => {
    const text = span.textContent || '';
    const textLower = text.toLowerCase();
    
    if (textLower.includes(searchLower)) {
      const escapedSearch = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedSearch})`, 'gi');
      const parts = text.split(regex);
      
      if (parts.length > 1) {
        span.innerHTML = '';
        parts.forEach((part) => {
          if (part.toLowerCase() === searchLower) {
            const mark = document.createElement('mark');
            mark.className = 'pdf-search-highlight';
            mark.textContent = part;
            span.appendChild(mark);
          } else {
            span.appendChild(document.createTextNode(part));
          }
        });
      }
    }
  });
}

export default PdfTextLayer;
