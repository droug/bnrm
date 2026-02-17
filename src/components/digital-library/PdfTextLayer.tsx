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
// Cache to remember which documents have OCR pages
const ocrCheckCache = new Map<string, boolean>();

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
  const [useFallback, setUseFallback] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [hasOcrPages, setHasOcrPages] = useState<boolean | null>(null);
  const renderIdRef = useRef(0);

  // Check if this document has OCR pages in the database
  useEffect(() => {
    if (!documentId) {
      setHasOcrPages(false);
      return;
    }

    // Use cache
    if (ocrCheckCache.has(documentId)) {
      setHasOcrPages(ocrCheckCache.get(documentId)!);
      return;
    }

    const checkOcr = async () => {
      const { count } = await supabase
        .from('digital_library_pages')
        .select('id', { count: 'exact', head: true })
        .eq('document_id', documentId)
        .not('ocr_text', 'is', null);
      
      const result = (count ?? 0) > 0;
      ocrCheckCache.set(documentId, result);
      setHasOcrPages(result);
    };

    checkOcr();
  }, [documentId]);

  // If document has OCR pages, skip pdf.js text layer and use OCR directly
  useEffect(() => {
    if (hasOcrPages === true) {
      setUseFallback(true);
    }
  }, [hasOcrPages]);

  // Render native pdf.js text layer (only if no OCR pages available)
  useEffect(() => {
    if (containerWidth <= 10 || containerHeight <= 10) return;
    // Skip pdf.js text layer if we have OCR data
    if (hasOcrPages === true || hasOcrPages === null) return;

    const currentRenderId = ++renderIdRef.current;
    
    const renderTextLayer = async () => {
      if (!textLayerRef.current) return;

      try {
        const pdf = await loadPdfDocument(pdfUrl);
        if (currentRenderId !== renderIdRef.current || !textLayerRef.current) return;

        if (pageNumber < 1 || pageNumber > pdf.numPages) return;

        const page = await pdf.getPage(pageNumber);
        if (currentRenderId !== renderIdRef.current || !textLayerRef.current) return;

        const baseViewport = page.getViewport({ scale: 1, rotation });
        const textContent = await page.getTextContent();
        if (currentRenderId !== renderIdRef.current || !textLayerRef.current) return;

        const hasText = textContent.items.some((item: any) => item.str && item.str.trim().length > 0);
        
        if (!hasText) {
          setUseFallback(true);
          return;
        }

        const textLayerDiv = textLayerRef.current;
        textLayerDiv.innerHTML = '';

        const fitScale = containerWidth / baseViewport.width;
        const fitViewport = page.getViewport({ scale: fitScale, rotation });
        
        textLayerDiv.style.setProperty('--scale-factor', `${fitScale}`);
        textLayerDiv.style.width = `${containerWidth}px`;
        textLayerDiv.style.height = `${containerHeight}px`;

        const textLayer = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport: fitViewport,
        });

        await textLayer.render();
        if (currentRenderId !== renderIdRef.current || !textLayerRef.current) return;

        // Force interactive styles after pdf.js render
        textLayerDiv.style.pointerEvents = 'auto';
        textLayerDiv.style.userSelect = 'text';
        (textLayerDiv.style as any).webkitUserSelect = 'text';
        textLayerDiv.style.cursor = 'text';
        
        const spans = textLayerDiv.querySelectorAll('span');
        spans.forEach((span: Element) => {
          const el = span as HTMLElement;
          el.style.pointerEvents = 'auto';
          el.style.userSelect = 'text';
          (el.style as any).webkitUserSelect = 'text';
          el.style.cursor = 'text';
        });

        // Highlight search terms
        if (searchHighlight && searchHighlight.length >= 2) {
          highlightSearchTerms(textLayerDiv, searchHighlight);
        }

      } catch (error) {
        console.warn('Error rendering text layer:', error);
        if (currentRenderId === renderIdRef.current) {
          setUseFallback(true);
        }
      }
    };

    renderTextLayer();
  }, [pdfUrl, pageNumber, rotation, containerWidth, containerHeight, searchHighlight, hasOcrPages]);

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

  // Render OCR text fallback
  useEffect(() => {
    if (!useFallback || !ocrText || !textLayerRef.current) return;

    const div = textLayerRef.current;
    div.innerHTML = '';
    div.style.width = `${containerWidth}px`;
    div.style.height = `${containerHeight}px`;

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
      className={`absolute top-0 left-0 ${useFallback ? 'pdf-ocr-layer' : 'pdf-text-layer textLayer'}`}
      style={{
        pointerEvents: 'auto',
        userSelect: 'text',
        WebkitUserSelect: 'text',
        zIndex: 50,
        width: containerWidth > 10 ? `${containerWidth}px` : undefined,
        height: containerHeight > 10 ? `${containerHeight}px` : undefined,
        cursor: 'text',
      }}
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
