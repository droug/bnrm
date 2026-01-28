import { useRef, forwardRef, useState, useEffect, useCallback, useImperativeHandle } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Loader2 } from 'lucide-react';

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
    pageNumber: number;
    zoom: number;
    rotation: number;
    pageRotation: number;
  }
>(({ pdfDoc, pageNumber, zoom, rotation, pageRotation }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
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
    <div ref={ref} className="page bg-white shadow-2xl relative overflow-hidden">
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden bg-white"
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
      </div>
      {/* Coins décoratifs de page */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <svg viewBox="0 0 32 32" className="w-full h-full text-muted-foreground/20">
          <path d="M0 0 L32 0 L32 32 Z" fill="currentColor" />
        </svg>
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
}, ref) => {
  const bookRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 550, height: 733 });
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
        
        if (!cancelled) {
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

  // Calculate optimal dimensions based on container size
  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Target aspect ratio (3:4 for document pages)
    const aspectRatio = 3 / 4;

    // Calculate max dimensions with padding
    const maxWidth = containerWidth * 0.9;
    const maxHeight = containerHeight * 0.9;

    let pageWidth: number;
    let pageHeight: number;

    // Calculate based on height first
    pageHeight = maxHeight;
    pageWidth = pageHeight * aspectRatio;

    // If too wide, scale down by width
    if (pageWidth * 2 > maxWidth) {
      pageWidth = maxWidth / 2;
      pageHeight = pageWidth / aspectRatio;
    }

    // Ensure minimum dimensions
    pageWidth = Math.max(280, Math.min(600, pageWidth));
    pageHeight = Math.max(373, Math.min(800, pageHeight));

    setDimensions({ width: Math.round(pageWidth), height: Math.round(pageHeight) });
  }, []);

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
      className="flex items-center justify-center w-full h-full" 
      style={{ minHeight: "400px" }} 
      dir={isRtl ? "rtl" : "ltr"}
    >
      <HTMLFlipBook
        width={dimensions.width}
        height={dimensions.height}
        size="stretch"
        minWidth={280}
        maxWidth={600}
        minHeight={373}
        maxHeight={800}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        onFlip={(e: any) => {
          const flipPage = e.data + 1;
          const realPage = isRtl ? totalPages - flipPage + 1 : flipPage;
          onPageChange(realPage);
        }}
        className="book-container"
        style={{}}
        startPage={isRtl ? totalPages - currentPage : currentPage - 1}
        drawShadow={true}
        flippingTime={800}
        usePortrait={true}
        startZIndex={0}
        autoSize={true}
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
              pageNumber={isRtl ? totalPages - index : pageNum}
              zoom={zoom}
              rotation={rotation}
              pageRotation={pageRotations?.[realPageNumber] ?? 0}
            />
          );
        })}
      </HTMLFlipBook>
    </div>
  );
});

PdfPageFlipBook.displayName = "PdfPageFlipBook";
