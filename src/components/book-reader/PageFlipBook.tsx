import { useRef, forwardRef, useState, useEffect, useCallback, useImperativeHandle } from "react";
import HTMLFlipBook from "react-pageflip";

interface PageFlipBookProps {
  images: string[];
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom: number;
  rotation: number;
  /**
   * Rotation additionnelle par page (en degrés). Exemple: { 8: 180, 12: 180 }
   */
  pageRotations?: Record<number, number>;
}

export interface PageFlipBookHandle {
  flipNext: () => void;
  flipPrev: () => void;
  turnToPage: (page: number) => void;
}

const Page = forwardRef<
  HTMLDivElement,
  {
    image: string;
    pageNumber: number;
    zoom: number;
    rotation: number;
    pageRotation: number;
  }
>(({ image, pageNumber, zoom, rotation, pageRotation }, ref) => {
  const finalRotation = rotation + pageRotation;

  return (
    <div ref={ref} className="page bg-white shadow-2xl">
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden bg-white"
        style={{
          transform: `scale(${zoom / 100}) rotate(${finalRotation}deg)`,
          transformOrigin: "center",
          transition: "transform 0.3s ease",
        }}
      >
        <img
          src={image}
          alt={`Page ${pageNumber}`}
          className="w-full h-full object-contain"
          draggable={false}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      </div>
    </div>
  );
});

Page.displayName = "Page";

export const PageFlipBook = forwardRef<PageFlipBookHandle, PageFlipBookProps>(({
  images,
  currentPage,
  onPageChange,
  zoom,
  rotation,
  pageRotations,
}, ref) => {
  const bookRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 550, height: 733 });

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
    const maxWidth = containerWidth * 0.9; // 90% of container width
    const maxHeight = containerHeight * 0.9; // 90% of container height

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

    // Recalculate on window resize
    const handleResize = () => {
      calculateDimensions();
    };

    window.addEventListener("resize", handleResize);

    // Also observe container size changes
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [calculateDimensions]);

  return (
    <div ref={containerRef} className="flex items-center justify-center w-full h-full" style={{ minHeight: "400px" }}>
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
        onFlip={(e: any) => onPageChange(e.data + 1)}
        className="book-container"
        style={{}}
        startPage={currentPage - 1}
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
        {images.map((image, index) => (
          <Page
            key={index}
            image={image}
            pageNumber={index + 1}
            zoom={zoom}
            rotation={rotation}
            pageRotation={pageRotations?.[index + 1] ?? 0}
          />
        ))}
      </HTMLFlipBook>
    </div>
  );
});

PageFlipBook.displayName = "PageFlipBook";

