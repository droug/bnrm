import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface PanoramaPositionPickerProps {
  panoramaUrl: string;
  yaw: number;
  pitch: number;
  onPositionChange: (yaw: number, pitch: number) => void;
}

export function PanoramaPositionPicker({
  panoramaUrl,
  yaw,
  pitch,
  onPositionChange,
}: PanoramaPositionPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getContainedImageRect = useCallback(() => {
    // Fallback: treat image as filling container
    const cw = containerSize.w || 1;
    const ch = containerSize.h || 1;
    const iw = imageNaturalSize.w;
    const ih = imageNaturalSize.h;

    if (!iw || !ih) {
      return { x: 0, y: 0, w: cw, h: ch };
    }

    const scale = Math.min(cw / iw, ch / ih);
    const w = iw * scale;
    const h = ih * scale;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;
    return { x, y, w, h };
  }, [containerSize.h, containerSize.w, imageNaturalSize.h, imageNaturalSize.w]);

  // Convert yaw (-180 to 180) and pitch (-90 to 90) to percentage position
  const yawToPercent = (yaw: number) => ((yaw + 180) / 360) * 100;
  const pitchToPercent = (pitch: number) => ((90 - pitch) / 180) * 100;

  // Convert click position to yaw/pitch
  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) return;
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Account for zoom and pan
    const adjustedX = (x - panOffset.x) / zoom;
    const adjustedY = (y - panOffset.y) / zoom;

    // IMPORTANT: The preview must not crop the panorama.
    // We render the image with object-contain (letterboxing) and map clicks ONLY within the actual image area.
    const imgRect = getContainedImageRect();
    const localX = adjustedX - imgRect.x;
    const localY = adjustedY - imgRect.y;

    if (localX < 0 || localY < 0 || localX > imgRect.w || localY > imgRect.h) {
      // Click happened in the letterbox area: ignore.
      return;
    }

    // Calculate percentage within the actual image area
    const percentX = (localX / imgRect.w) * 100;
    const percentY = (localY / imgRect.h) * 100;

    // Convert to yaw/pitch
    const newYaw = Math.round(((percentX / 100) * 360 - 180) * 10) / 10;
    const newPitch = Math.round((90 - (percentY / 100) * 180) * 10) / 10;

    // Clamp values
    const clampedYaw = Math.max(-180, Math.min(180, newYaw));
    const clampedPitch = Math.max(-90, Math.min(90, newPitch));

    onPositionChange(clampedYaw, clampedPitch);
  }, [getContainedImageRect, isPanning, onPositionChange, panOffset.x, panOffset.y, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.ctrlKey) { // Middle click or Ctrl+click for panning
      e.preventDefault();
      setIsPanning(true);
      setLastPanPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPosition.x;
      const deltaY = e.clientY - lastPanPosition.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPanPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1));
  };

  const handleReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const markerX = yawToPercent(yaw);
  const markerY = pitchToPercent(pitch);
  const contained = getContainedImageRect();
  const markerLeftPx = contained.x + (markerX / 100) * contained.w;
  const markerTopPx = contained.y + (markerY / 100) * contained.h;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Cliquez sur l'image pour positionner le hotspot
        </p>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleZoomIn}>
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleZoomOut}>
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleReset}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full h-48 rounded-lg border overflow-hidden bg-muted cursor-crosshair select-none"
        onClick={handleImageClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transformOrigin: 'top left',
            width: '100%',
            height: '100%',
          }}
        >
          <img
            ref={imgRef}
            src={panoramaUrl}
            alt="Panorama"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
            onLoad={() => {
              const el = imgRef.current;
              if (!el) return;
              setImageNaturalSize({ w: el.naturalWidth || 0, h: el.naturalHeight || 0 });
            }}
          />
          
          {/* Position marker */}
          <div
            className="absolute w-6 h-6 -ml-3 -mt-3 pointer-events-none"
            style={{
              left: `${markerLeftPx}px`,
              top: `${markerTopPx}px`,
            }}
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white shadow-lg animate-pulse" />
            {/* Inner dot */}
            <div className="absolute inset-1 rounded-full bg-primary border-2 border-white shadow-md" />
            {/* Crosshair lines */}
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-white/70 -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/70 -translate-y-1/2" />
          </div>
        </div>
        
        {/* Coordinates overlay */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
          Yaw: {yaw}° | Pitch: {pitch}°
        </div>
        
        {/* Zoom indicator */}
        {zoom > 1 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {Math.round(zoom * 100)}%
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        💡 Astuce: Utilisez Ctrl+clic pour déplacer l'image zoomée. Le centre de l'image (0°, 0°) correspond au point de vue initial du visiteur.
      </p>
    </div>
  );
}
