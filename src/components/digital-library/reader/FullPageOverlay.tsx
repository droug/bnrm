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
      {/* Minimal toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        {/* Navigation controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onPreviousPage}
            disabled={currentPage === 1}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <span className="text-white text-sm font-medium px-3">
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
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onZoomOut}
            className="text-white hover:bg-white/20"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="text-white text-sm font-medium w-14 text-center">{zoom}%</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onZoomIn}
            className="text-white hover:bg-white/20"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRotate}
            className="text-white hover:bg-white/20 ml-2"
            title="Pivoter"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
        </div>

        {/* Close button */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20 h-10 w-10"
          title="Fermer le mode plein écran (Échap)"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Document content */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4 pt-20">
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
