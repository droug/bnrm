import { useRef, forwardRef, useState, useEffect, useCallback, useImperativeHandle } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Loader2 } from 'lucide-react';
import { PdfTextHighlightOverlay } from '@/components/digital-library/PdfTextHighlightOverlay';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface PdfPageFlipBookProps {
  pdfUrl: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom: number;
  rotation: number;
  pageRotations?: Record<number, number>;
  isRtl?: boolean;
  onTotalPagesChange?: (total: number) => void;
  searchHighlight?: string;
}

export interface PdfPageFlipBookHandle {
  flipNext: () => void;
  flipPrev: () => void;
  turnToPage: (page: number) => void;
}

// Page component qui rend une page PDF
const PdfPage = forwardRef<
  HTMLDivElement,
  {
    pdfDoc: pdfjsLib.PDFDocumentProxy | null;
    pdfUrl: string;
    pageNumber: number;
    zoom: number;
    rotation: number;
    pageRotation: number;
    searchHighlight?: string;
  }
>(({ pdfDoc, pdfUrl, pageNumber, zoom, rotation, pageRotation, searchHighlight }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const finalRotation = rotation + pageRotation;

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    
    let cancelled = false;
    
    const renderPage = async () => {
      try {
        setLoading(true);
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.2, rotation: 0 });
        
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        
        if (!cancelled) {
          setCanvasSize({ width: viewport.width, height: viewport.height });
          setLoading(false);
        }
      } catch (err) {
        console.error('Error rendering page:', err);
        if (!cancelled) setLoading(false);
      }
    };
    
    renderPage();
    
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNumber]);

  return (
    <div ref={ref} className="page bg-[#f5f0e8] relative overflow-hidden" style={{ boxShadow: 'none', margin: 0, padding: 0 }}>
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden bg-[#f5f0e8] relative"
        style={{
          transform: `scale(${zoom / 100}) rotate(${finalRotation}deg)`,
          transformOrigin: "center",
          transition: "transform 0.3s ease",
        }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
          style={{ 
            maxWidth: "100%", 
            maxHeight: "100%",
            display: loading ? 'none' : 'block' 
          }}
        />
        
        {/* Overlay de surbrillance si une recherche est active */}
        {searchHighlight && !loading && canvasSize.width > 0 && canvasSize.height > 0 && (
          <PdfTextHighlightOverlay
            pdfUrl={pdfUrl}
            pageNumber={pageNumber}
            searchText={searchHighlight}
            scale={1.2}
            rotation={finalRotation}
            containerWidth={canvasSize.width}
            containerHeight={canvasSize.height}
          />
        )}
      </div>
    </div>
  );
});

PdfPage.displayName = "PdfPage";

export const PdfPageFlipBook = forwardRef<PdfPageFlipBookHandle, PdfPageFlipBookProps>(({
  pdfUrl,
  currentPage,
  onPageChange,
  zoom,
  rotation,
  pageRotations,
  isRtl = false,
  onTotalPagesChange,
  searchHighlight,
}, ref) => {
  const bookRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 550, height: 733 });
  const [pdfAspectRatio, setPdfAspectRatio] = useState<number>(3 / 4);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;
    
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        // Get actual page aspect ratio from first page
        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1 });
        const actualRatio = viewport.width / viewport.height;
        
        if (!cancelled) {
          setPdfAspectRatio(actualRatio);
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          onTotalPagesChange?.(pdf.numPages);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (!cancelled) {
          setError('Impossible de charger le PDF');
          setLoading(false);
        }
      }
    };
    
    loadPdf();
    
    return () => {
      cancelled = true;
    };
  }, [pdfUrl, onTotalPagesChange]);

  // Expose navigation methods
  useImperativeHandle(ref, () => ({
    flipNext: () => {
      if (bookRef.current?.pageFlip()) {
        bookRef.current.pageFlip().flipNext();
      }
    },
    flipPrev: () => {
      if (bookRef.current?.pageFlip()) {
        bookRef.current.pageFlip().flipPrev();
      }
    },
    turnToPage: (page: number) => {
      if (bookRef.current?.pageFlip()) {
        bookRef.current.pageFlip().turnToPage(page - 1);
      }
    },
  }), []);

  // Calculate optimal dimensions based on container size for double-page spread
  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const aspectRatio = pdfAspectRatio;

    // Each page gets half the width - ALWAYS fill full width
    // The library with size="stretch" will scale down if height exceeds container
    // So we use size="fixed" and calculate dimensions that fill full width
    const pageWidth = containerWidth / 2;
    const pageHeight = pageWidth / aspectRatio;

    

    setDimensions({ width: Math.round(Math.max(280, pageWidth)), height: Math.round(Math.max(373, pageHeight)) });
  }, [pdfAspectRatio]);

  useEffect(() => {
    calculateDimensions();

    const handleResize = () => {
      calculateDimensions();
    };

    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [calculateDimensions]);

  // Generate page numbers array
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Pour RTL, inverser l'ordre des pages pour que la lecture soit de droite à gauche
  const displayPages = isRtl ? [...pageNumbers].reverse() : pageNumbers;

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du document...</p>
        </div>
      </div>
    );
  }

  if (error || !pdfDoc) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[400px]">
        <p className="text-destructive">{error || 'Erreur de chargement'}</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="flex items-start justify-center w-full h-full min-h-0 overflow-auto" 
      style={{ minHeight: "400px", width: "100%" }} 
      dir={isRtl ? "rtl" : "ltr"}
    >
      <HTMLFlipBook
        width={dimensions.width}
        height={dimensions.height}
        size="fixed"
        minWidth={280}
        maxWidth={2400}
        minHeight={373}
        maxHeight={2400}
        maxShadowOpacity={0.4}
        showCover={true}
        mobileScrollSupport={true}
        onFlip={(e: any) => {
          const flipPage = e.data + 1;
          const realPage = isRtl ? totalPages - flipPage + 1 : flipPage;
          onPageChange(realPage);
        }}
        className="book-container"
        style={{ margin: 0, padding: 0, gap: 0 }}
        startPage={isRtl ? totalPages - currentPage : currentPage - 1}
        drawShadow={true}
        flippingTime={800}
        usePortrait={false}
        startZIndex={0}
        autoSize={false}
        clickEventForward={true}
        useMouseEvents={true}
        swipeDistance={30}
        showPageCorners={true}
        disableFlipByClick={false}
        ref={bookRef}
      >
        {displayPages.map((pageNum, index) => {
          const realPageNumber = isRtl ? totalPages - index : index + 1;
          return (
            <PdfPage
              key={index}
              pdfDoc={pdfDoc}
              pdfUrl={pdfUrl}
              pageNumber={isRtl ? totalPages - index : pageNum}
              zoom={zoom}
              rotation={rotation}
              pageRotation={pageRotations?.[realPageNumber] ?? 0}
              searchHighlight={searchHighlight}
            />
          );
        })}
      </HTMLFlipBook>
    </div>
  );
});

PdfPageFlipBook.displayName = "PdfPageFlipBook";
