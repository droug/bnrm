import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface FullPageOverlayProps {
  children: ReactNode;
  onClose: () => void;
  currentPage: number;
  totalPages: number;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onRotate: () => void;
}

export const FullPageOverlay = ({
  children,
  onClose,
  currentPage,
  totalPages,
  zoom,
  onZoomIn,
  onZoomOut,
  onPreviousPage,
  onNextPage,
  onRotate,
}: FullPageOverlayProps) => {
  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const content = (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Close button - prominent and always visible */}
      <Button 
        variant="default"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 bg-white text-black hover:bg-gray-200 h-12 w-12 rounded-full shadow-lg"
        title="Fermer le mode plein écran (Échap)"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Bottom toolbar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-4 p-4 bg-gradient-to-t from-black/80 to-transparent">
        {/* Navigation controls */}
        <div className="flex items-center gap-2 bg-black/50 rounded-full px-4 py-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onPreviousPage}
            disabled={currentPage === 1}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <span className="text-white text-sm font-medium px-3 min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </span>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2 bg-black/50 rounded-full px-4 py-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onZoomOut}
            disabled={zoom <= 50}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="text-white text-sm font-medium w-14 text-center">{zoom}%</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onZoomIn}
            disabled={zoom >= 300}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          
          <div className="w-px h-6 bg-white/30 mx-1" />
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRotate}
            className="text-white hover:bg-white/20"
            title="Pivoter"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Document content with zoom applied */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        <div 
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
