import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { OptimizedPdfPageRenderer } from "../OptimizedPdfPageRenderer";

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
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const DRAG_THRESHOLD = 60; // pixels minimum pour déclencher un changement de page

  // Calcul du décalage de glissement
  const dragOffset = isDragging ? dragCurrentX - dragStartX : 0;

  // Déterminer si on peut aller à la page précédente/suivante
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage + 1 < totalPages;

  // Gestion du glissement - Mouse Events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isAnimating) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragCurrentX(e.clientX);
  }, [isAnimating]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || isAnimating) return;
    setDragCurrentX(e.clientX);
  }, [isDragging, isAnimating]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || isAnimating) return;

    const absOffset = Math.abs(dragOffset);

    if (absOffset > DRAG_THRESHOLD) {
      // Déterminer la direction
      // Pour LTR: glisser vers la gauche = page suivante, vers la droite = page précédente
      // Pour RTL: glisser vers la droite = page suivante, vers la gauche = page précédente
      const goingNext = isRtl ? dragOffset > 0 : dragOffset < 0;
      const goingPrev = isRtl ? dragOffset < 0 : dragOffset > 0;

      if (goingNext && canGoNext) {
        setIsAnimating(true);
        setTimeout(() => {
          onPageChange(Math.min(currentPage + 2, totalPages));
          setIsAnimating(false);
        }, 250);
      } else if (goingPrev && canGoPrev) {
        setIsAnimating(true);
        setTimeout(() => {
          onPageChange(Math.max(1, currentPage - 2));
          setIsAnimating(false);
        }, 250);
      }
    }

    setIsDragging(false);
    setDragStartX(0);
    setDragCurrentX(0);
  }, [isDragging, dragOffset, isRtl, currentPage, totalPages, onPageChange, isAnimating, canGoNext, canGoPrev]);

  // Touch events pour mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isAnimating) return;
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragCurrentX(e.touches[0].clientX);
  }, [isAnimating]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || isAnimating) return;
    setDragCurrentX(e.touches[0].clientX);
  }, [isDragging, isAnimating]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  // Global mouse events pour capturer le mouvement même hors du conteneur
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      setDragCurrentX(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, handleMouseUp]);

  // Calcul des numéros de page pour l'affichage
  // En RTL: page de droite = currentPage, page de gauche = currentPage + 1
  // En LTR: page de gauche = currentPage, page de droite = currentPage + 1
  const leftPageNumber = isRtl ? currentPage + 1 : currentPage;
  const rightPageNumber = isRtl ? currentPage : currentPage + 1;

  // Style de transformation pour l'effet de flip
  const getPageContainerStyle = () => {
    if (isAnimating) {
      // Animation de transition
      const direction = isRtl ? 1 : -1;
      return {
        transform: `translateX(${direction * 50}px)`,
        opacity: 0.7,
        transition: "transform 0.25s ease-out, opacity 0.25s ease-out",
      };
    }

    if (isDragging && Math.abs(dragOffset) > 5) {
      // Effet de glissement en temps réel
      const clampedOffset = Math.max(-150, Math.min(150, dragOffset * 0.4));
      const rotateY = (dragOffset / 300) * 8; // Max 8 degrés de rotation
      return {
        transform: `perspective(1200px) rotateY(${rotateY}deg) translateX(${clampedOffset}px)`,
        transition: "none",
      };
    }

    return {
      transform: "perspective(1200px) rotateY(0deg) translateX(0)",
      transition: "transform 0.3s ease-out",
    };
  };

  // Indicateur visuel de direction
  const showLeftIndicator = isDragging && (isRtl ? dragOffset < -DRAG_THRESHOLD : dragOffset > DRAG_THRESHOLD);
  const showRightIndicator = isDragging && (isRtl ? dragOffset > DRAG_THRESHOLD : dragOffset < -DRAG_THRESHOLD);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        cursor: isDragging ? "grabbing" : "grab",
        direction: isRtl ? "rtl" : "ltr"
      }}
    >
      {/* Indicateur de glissement gauche */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-primary/20 to-transparent flex items-center justify-center transition-opacity duration-200 pointer-events-none z-10 ${showLeftIndicator && canGoPrev ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="bg-background/90 rounded-full p-2 shadow-lg">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </div>

      {/* Indicateur de glissement droite */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-primary/20 to-transparent flex items-center justify-center transition-opacity duration-200 pointer-events-none z-10 ${showRightIndicator && canGoNext ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="bg-background/90 rounded-full p-2 shadow-lg">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Conteneur des pages avec effet de flip */}
      <div
        className="flex items-center justify-center gap-1 md:gap-4 p-2 md:p-4"
        style={getPageContainerStyle()}
      >
        {/* Page gauche */}
        {leftPageNumber <= totalPages && leftPageNumber >= 1 && (
          <Card className="shadow-2xl overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
            <CardContent className="p-0 flex items-center justify-center bg-white">
              <OptimizedPdfPageRenderer
                pdfUrl={pdfUrl}
                pageNumber={leftPageNumber}
                scale={0.85}
                rotation={rotation + (pageRotations[leftPageNumber] ?? 0)}
                className="max-h-[75vh] w-auto pointer-events-none"
                onPageLoad={(total) => {
                  if (onTotalPagesChange && total !== totalPages) {
                    onTotalPagesChange(total);
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Séparateur central (reliure du livre) */}
        <div className="hidden md:block w-1 h-[60vh] bg-gradient-to-b from-muted via-muted-foreground/20 to-muted rounded-full shadow-inner" />

        {/* Page droite */}
        {rightPageNumber <= totalPages && rightPageNumber >= 1 && (
          <Card className="shadow-2xl overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
            <CardContent className="p-0 flex items-center justify-center bg-white">
              <OptimizedPdfPageRenderer
                pdfUrl={pdfUrl}
                pageNumber={rightPageNumber}
                scale={0.85}
                rotation={rotation + (pageRotations[rightPageNumber] ?? 0)}
                className="max-h-[75vh] w-auto pointer-events-none"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Instructions de navigation */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground/60 pointer-events-none bg-background/50 px-3 py-1 rounded-full backdrop-blur-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
        <span>{isRtl ? "اسحب لتقليب الصفحات" : "Glissez pour tourner les pages"}</span>
      </div>

      {/* Numéros de page */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-sm text-muted-foreground pointer-events-none">
        <span className="bg-background/80 px-2 py-0.5 rounded">{leftPageNumber}</span>
        <span className="text-muted-foreground/50">|</span>
        <span className="bg-background/80 px-2 py-0.5 rounded">{rightPageNumber <= totalPages ? rightPageNumber : ""}</span>
      </div>
    </div>
  );
};
