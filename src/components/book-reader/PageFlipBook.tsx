import { useRef, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { Card } from "@/components/ui/card";

interface PageFlipBookProps {
  images: string[];
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom: number;
  rotation: number;
}

const Page = forwardRef<HTMLDivElement, { image: string; pageNumber: number; zoom: number; rotation: number }>(
  ({ image, pageNumber, zoom, rotation }, ref) => {
    return (
      <div ref={ref} className="page bg-white shadow-2xl">
        <div 
          className="w-full h-full flex items-center justify-center overflow-hidden"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center',
            transition: 'transform 0.3s ease'
          }}
        >
          <img 
            src={image} 
            alt={`Page ${pageNumber}`}
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";

export const PageFlipBook = ({ images, currentPage, onPageChange, zoom, rotation }: PageFlipBookProps) => {
  const bookRef = useRef<any>();

  return (
    <div className="flex items-center justify-center w-full h-full">
      <HTMLFlipBook
        width={550}
        height={733}
        size="stretch"
        minWidth={315}
        maxWidth={1000}
        minHeight={420}
        maxHeight={1350}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        onFlip={(e: any) => onPageChange(e.data + 1)}
        className="book-container"
        style={{}}
        startPage={currentPage - 1}
        drawShadow={true}
        flippingTime={1000}
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
          />
        ))}
      </HTMLFlipBook>
    </div>
  );
};
