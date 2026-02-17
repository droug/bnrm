import { useState, useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface PanZoomContainerProps {
  children: ReactNode;
  zoom: number;
  rotation?: number;
  className?: string;
  disabled?: boolean;
}

export function PanZoomContainer({ 
  children, 
  zoom, 
  rotation = 0,
  className,
  disabled = false
}: PanZoomContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Reset position when zoom changes to 100% or below
  useEffect(() => {
    if (zoom <= 100) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoom]);

  const canPan = zoom > 100 && !disabled;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canPan) return;
    // Don't prevent default on text layer elements to allow text selection
    const target = e.target as HTMLElement;
    const isTextLayer = target.closest('.pdf-text-layer, .textLayer, .pdf-ocr-layer, .pdf-ocr-text-overlay');
    if (isTextLayer) return;
    
    e.preventDefault();
    setIsPanning(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartPan({ x: position.x, y: position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !canPan) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    setPosition({
      x: startPan.x + deltaX,
      y: startPan.y + deltaY
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canPan || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    setIsPanning(true);
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setStartPan({ x: position.x, y: position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning || !canPan || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;

    setPosition({
      x: startPan.x + deltaX,
      y: startPan.y + deltaY
    });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Double-click to reset position
  const handleDoubleClick = () => {
    if (canPan) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const containerStyle: CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
    transformOrigin: 'center center',
    transition: isPanning ? 'none' : 'transform 0.3s ease',
    cursor: canPan ? (isPanning ? 'grabbing' : 'grab') : 'default',
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full flex items-stretch justify-center",
        canPan && "select-none",
        canPan ? "overflow-hidden" : "overflow-visible",
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="w-full h-full min-w-0 min-h-0 flex items-center justify-center"
        style={containerStyle}
      >
        {children}
      </div>
    </div>
  );
}
