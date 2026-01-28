import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { OptimizedPdfPageRenderer } from "../OptimizedPdfPageRenderer";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DraggableDoublePageProps {
  pdfUrl: string;
  currentPage: number;
  totalPages: number;
  isRtl: boolean;
  rotation: number;
  pageRotations: Record<number, number>;
  onPageChange: (page: number) => void;
  onTotalPagesChange?: (total: number) => void;
}

export const DraggableDoublePage = ({
  pdfUrl,
  currentPage,
  totalPages,
  isRtl,
  rotation,
  pageRotations,
  onPageChange,
  onTotalPagesChange,
}: DraggableDoublePageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"left" | "right" | null>(null);

  const DRAG_THRESHOLD = 80; // pixels minimum pour déclencher un changement de page

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isFlipping) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
  }, [isFlipping]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || isFlipping) return;
    const offset = e.clientX - dragStartX;
    setDragOffset(offset);
  }, [isDragging, dragStartX, isFlipping]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || isFlipping) return;
    
    const absOffset = Math.abs(dragOffset);
    
    if (absOffset > DRAG_THRESHOLD) {
      // Déterminer la direction du flip
      const goingNext = isRtl ? dragOffset > 0 : dragOffset < 0;
      const goingPrev = isRtl ? dragOffset < 0 : dragOffset > 0;
      
      if (goingNext && currentPage + 2 <= totalPages) {
        // Aller aux pages suivantes
        setFlipDirection("left");
        setIsFlipping(true);
        setTimeout(() => {
          onPageChange(currentPage + 2);
          setIsFlipping(false);
          setFlipDirection(null);
        }, 300);
      } else if (goingPrev && currentPage > 1) {
        // Aller aux pages précédentes
        setFlipDirection("right");
        setIsFlipping(true);
        setTimeout(() => {
          onPageChange(Math.max(1, currentPage - 2));
          setIsFlipping(false);
          setFlipDirection(null);
        }, 300);
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  }, [isDragging, dragOffset, isRtl, currentPage, totalPages, onPageChange, isFlipping]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      handleMouseUp();
    }
  }, [isDragging, handleMouseUp]);

  // Touch events pour mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isFlipping) return;
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragOffset(0);
  }, [isFlipping]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || isFlipping) return;
    const offset = e.touches[0].clientX - dragStartX;
    setDragOffset(offset);
  }, [isDragging, dragStartX, isFlipping]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  // Calcul des numéros de page pour l'affichage
  const leftPageNumber = isRtl 
    ? (currentPage + 1 <= totalPages ? currentPage + 1 : currentPage) 
    : currentPage;
  const rightPageNumber = isRtl 
    ? currentPage 
    : currentPage + 1;

  // Animation de flip
  const getFlipStyle = () => {
    if (isFlipping) {
      const translateX = flipDirection === "left" ? "-100%" : "100%";
      return {
        transform: `translateX(${translateX})`,
        opacity: 0,
        transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
      };
    }
    
    if (isDragging && Math.abs(dragOffset) > 10) {
      const clampedOffset = Math.max(-200, Math.min(200, dragOffset));
      const rotateY = (clampedOffset / 200) * 15; // Max 15 degrés de rotation
      return {
        transform: `perspective(1000px) rotateY(${rotateY}deg) translateX(${clampedOffset * 0.1}px)`,
        transition: "none",
      };
    }
    
    return {
      transform: "perspective(1000px) rotateY(0deg)",
      transition: "transform 0.3s ease-out",
    };
  };

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage + 1 < totalPages;

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Indicateur de navigation gauche */}
      {canGoPrev && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none opacity-30">
          <ChevronLeft className="h-12 w-12 text-muted-foreground" />
        </div>
      )}

      {/* Conteneur des pages avec effet de flip */}
      <div 
        className="flex items-center justify-center gap-4 p-4"
        style={getFlipStyle()}
      >
        {/* Page gauche */}
        <Card className="shadow-xl flex-1 max-w-[45%] overflow-hidden">
          <CardContent className="p-0 flex items-center justify-center">
            <OptimizedPdfPageRenderer
              pdfUrl={pdfUrl}
              pageNumber={leftPageNumber}
              scale={0.8}
              rotation={rotation + (pageRotations[leftPageNumber] ?? 0)}
              className="max-h-[70vh] w-auto pointer-events-none"
              onPageLoad={(total) => {
                if (onTotalPagesChange && total !== totalPages) {
                  onTotalPagesChange(total);
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Page droite (si disponible) */}
        {rightPageNumber <= totalPages && (
          <Card className="shadow-xl flex-1 max-w-[45%] overflow-hidden">
            <CardContent className="p-0 flex items-center justify-center">
              <OptimizedPdfPageRenderer
                pdfUrl={pdfUrl}
                pageNumber={rightPageNumber}
                scale={0.8}
                rotation={rotation + (pageRotations[rightPageNumber] ?? 0)}
                className="max-h-[70vh] w-auto pointer-events-none"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Indicateur de navigation droite */}
      {canGoNext && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none opacity-30">
          <ChevronRight className="h-12 w-12 text-muted-foreground" />
        </div>
      )}

      {/* Indicateur visuel de drag */}
      {isDragging && Math.abs(dragOffset) > DRAG_THRESHOLD && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-primary/20 backdrop-blur-sm rounded-full p-4">
            {(isRtl ? dragOffset > 0 : dragOffset < 0) ? (
              <ChevronRight className="h-8 w-8 text-primary" />
            ) : (
              <ChevronLeft className="h-8 w-8 text-primary" />
            )}
          </div>
        </div>
      )}

      {/* Instructions subtiles */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50 pointer-events-none">
        Glissez pour tourner les pages
      </div>
    </div>
  );
};
