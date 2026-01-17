import { useState, useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2,
  MapPin,
  Image as ImageIcon,
  FileText,
  Video,
  Navigation,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";

interface Hotspot {
  id: string;
  hotspot_type: 'artwork' | 'text' | 'media' | 'navigation';
  yaw: number;
  pitch: number;
  label_fr: string;
  label_ar: string | null;
  rich_text_fr: string | null;
  rich_text_ar: string | null;
  artwork_id: string | null;
  media_url: string | null;
  target_panorama_id: string | null;
}

interface Panorama {
  id: string;
  name_fr: string;
  name_ar: string | null;
  panorama_image_url: string;
  display_order: number;
}

interface Artwork {
  id: string;
  title_fr: string;
  title_ar: string | null;
  description_fr: string | null;
  description_ar: string | null;
  author: string | null;
  date_created: string | null;
  medium: string | null;
  dimensions: string | null;
  image_url: string | null;
}

interface VExpo360ViewerProps {
  panoramas: Panorama[];
  hotspots: Record<string, Hotspot[]>;
  artworks: Record<string, Artwork>;
  onClose?: () => void;
  initialPanoramaId?: string;
  language?: 'fr' | 'ar';
}

// Panorama Sphere Component
function PanoramaSphere({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (loadedTexture) => {
      loadedTexture.mapping = THREE.EquirectangularReflectionMapping;
      loadedTexture.colorSpace = THREE.SRGBColorSpace;
      setTexture(loadedTexture);
    });
  }, [imageUrl]);

  if (!texture) {
    return null;
  }

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// Hotspot Marker Component
function HotspotMarker({ 
  hotspot, 
  onClick, 
  isHovered, 
  onHover 
}: { 
  hotspot: Hotspot; 
  onClick: () => void;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Convert yaw/pitch to 3D position on sphere
  const radius = 100;
  const yawRad = THREE.MathUtils.degToRad(hotspot.yaw);
  const pitchRad = THREE.MathUtils.degToRad(hotspot.pitch);
  
  const x = radius * Math.cos(pitchRad) * Math.sin(yawRad);
  const y = radius * Math.sin(pitchRad);
  const z = radius * Math.cos(pitchRad) * Math.cos(yawRad);

  const getColor = () => {
    switch (hotspot.hotspot_type) {
      case 'artwork': return '#f59e0b'; // amber
      case 'text': return '#8b5cf6'; // purple
      case 'media': return '#ec4899'; // pink
      case 'navigation': return '#3b82f6'; // blue
      default: return '#ffffff';
    }
  };

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(0, 0, 0);
      // Pulse animation when hovered
      const scale = isHovered ? 1.3 + Math.sin(Date.now() * 0.005) * 0.1 : 1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[x, y, z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
    >
      <circleGeometry args={[3, 32]} />
      <meshBasicMaterial 
        color={getColor()} 
        transparent 
        opacity={isHovered ? 1 : 0.8} 
      />
    </mesh>
  );
}

// Camera Controls Component
function CameraController({ fov, setFov }: { fov: number; setFov: (fov: number) => void }) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  }, [camera, fov]);

  return (
    <OrbitControls 
      enableZoom={false}
      enablePan={false}
      rotateSpeed={-0.3}
      minPolarAngle={Math.PI * 0.1}
      maxPolarAngle={Math.PI * 0.9}
    />
  );
}

export function VExpo360Viewer({
  panoramas,
  hotspots,
  artworks,
  onClose,
  initialPanoramaId,
  language = 'fr'
}: VExpo360ViewerProps) {
  const [currentPanoramaId, setCurrentPanoramaId] = useState(initialPanoramaId || panoramas[0]?.id);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fov, setFov] = useState(75);
  const [showInfo, setShowInfo] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPanorama = panoramas.find(p => p.id === currentPanoramaId);
  const currentHotspots = hotspots[currentPanoramaId] || [];

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (hotspot.hotspot_type === 'navigation' && hotspot.target_panorama_id) {
      setCurrentPanoramaId(hotspot.target_panorama_id);
    } else {
      setSelectedHotspot(hotspot);
    }
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleZoom = (direction: 'in' | 'out') => {
    setFov(prev => {
      const newFov = direction === 'in' ? prev - 10 : prev + 10;
      return Math.max(30, Math.min(100, newFov));
    });
  };

  const resetView = () => {
    setFov(75);
  };

  const navigatePanorama = (direction: 'prev' | 'next') => {
    const currentIndex = panoramas.findIndex(p => p.id === currentPanoramaId);
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentPanoramaId(panoramas[currentIndex - 1].id);
    } else if (direction === 'next' && currentIndex < panoramas.length - 1) {
      setCurrentPanoramaId(panoramas[currentIndex + 1].id);
    }
  };

  const getHotspotIcon = (type: string) => {
    switch (type) {
      case 'artwork': return <ImageIcon className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'media': return <Video className="h-4 w-4" />;
      case 'navigation': return <Navigation className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getArtworkForHotspot = (hotspot: Hotspot): Artwork | null => {
    if (hotspot.artwork_id && artworks[hotspot.artwork_id]) {
      return artworks[hotspot.artwork_id];
    }
    return null;
  };

  if (!currentPanorama) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg">
        <p className="text-muted-foreground">Aucun panorama disponible</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[600px]'}`}
    >
      {/* 3D Canvas */}
      <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
        <PanoramaSphere imageUrl={currentPanorama.panorama_image_url} />
        
        {currentHotspots.map((hotspot) => (
          <HotspotMarker
            key={hotspot.id}
            hotspot={hotspot}
            onClick={() => handleHotspotClick(hotspot)}
            isHovered={hoveredHotspotId === hotspot.id}
            onHover={(hovered) => setHoveredHotspotId(hovered ? hotspot.id : null)}
          />
        ))}
        
        <CameraController fov={fov} setFov={setFov} />
      </Canvas>

      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          {onClose && (
            <Button variant="secondary" size="icon" onClick={onClose} className="bg-black/50 hover:bg-black/70">
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white text-sm font-medium">
              {language === 'ar' ? currentPanorama.name_ar : currentPanorama.name_fr}
            </p>
            <p className="text-white/60 text-xs">
              {panoramas.findIndex(p => p.id === currentPanoramaId) + 1} / {panoramas.length}
            </p>
          </div>
        </div>

        <div className="pointer-events-auto flex gap-2">
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={() => setShowInfo(!showInfo)}
            className="bg-black/50 hover:bg-black/70"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={toggleFullscreen}
            className="bg-black/50 hover:bg-black/70"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={() => handleZoom('in')}
          className="bg-black/50 hover:bg-black/70"
          disabled={fov <= 30}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={() => handleZoom('out')}
          className="bg-black/50 hover:bg-black/70"
          disabled={fov >= 100}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={resetView}
          className="bg-black/50 hover:bg-black/70"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Arrows */}
      {panoramas.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 pointer-events-auto"
            onClick={() => navigatePanorama('prev')}
            disabled={panoramas.findIndex(p => p.id === currentPanoramaId) === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-16 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 pointer-events-auto"
            onClick={() => navigatePanorama('next')}
            disabled={panoramas.findIndex(p => p.id === currentPanoramaId) === panoramas.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Bottom Hotspot Legend */}
      {showInfo && currentHotspots.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white/60 text-xs mb-2">Points d'intérêt ({currentHotspots.length})</p>
            <div className="flex flex-wrap gap-2">
              {currentHotspots.map((hotspot) => (
                <Badge
                  key={hotspot.id}
                  variant="secondary"
                  className={`cursor-pointer transition-all ${
                    hoveredHotspotId === hotspot.id ? 'ring-2 ring-white' : ''
                  }`}
                  onClick={() => handleHotspotClick(hotspot)}
                  onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                  onMouseLeave={() => setHoveredHotspotId(null)}
                >
                  {getHotspotIcon(hotspot.hotspot_type)}
                  <span className="ml-1">{language === 'ar' ? hotspot.label_ar : hotspot.label_fr}</span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Panorama Thumbnails */}
      {showInfo && panoramas.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="flex gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
            {panoramas.map((panorama, index) => (
              <button
                key={panorama.id}
                onClick={() => setCurrentPanoramaId(panorama.id)}
                className={`w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                  currentPanoramaId === panorama.id 
                    ? 'border-white' 
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img 
                  src={panorama.panorama_image_url} 
                  alt={panorama.name_fr}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hotspot Detail Dialog */}
      <Dialog open={!!selectedHotspot} onOpenChange={() => setSelectedHotspot(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedHotspot && getHotspotIcon(selectedHotspot.hotspot_type)}
              {selectedHotspot && (language === 'ar' ? selectedHotspot.label_ar : selectedHotspot.label_fr)}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedHotspot && (
              <div className="space-y-4">
                {/* Artwork details */}
                {selectedHotspot.hotspot_type === 'artwork' && selectedHotspot.artwork_id && (
                  <>
                    {(() => {
                      const artwork = getArtworkForHotspot(selectedHotspot);
                      if (!artwork) return null;
                      return (
                        <div className="space-y-4">
                          {artwork.image_url && (
                            <img 
                              src={artwork.image_url} 
                              alt={artwork.title_fr}
                              className="w-full max-h-80 object-contain rounded-lg bg-muted"
                            />
                          )}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {artwork.author && (
                              <div>
                                <span className="text-muted-foreground">Auteur:</span>
                                <p className="font-medium">{artwork.author}</p>
                              </div>
                            )}
                            {artwork.date_created && (
                              <div>
                                <span className="text-muted-foreground">Date:</span>
                                <p className="font-medium">{artwork.date_created}</p>
                              </div>
                            )}
                            {artwork.medium && (
                              <div>
                                <span className="text-muted-foreground">Technique:</span>
                                <p className="font-medium">{artwork.medium}</p>
                              </div>
                            )}
                            {artwork.dimensions && (
                              <div>
                                <span className="text-muted-foreground">Dimensions:</span>
                                <p className="font-medium">{artwork.dimensions}</p>
                              </div>
                            )}
                          </div>
                          {artwork.description_fr && (
                            <p className="text-muted-foreground">
                              {language === 'ar' ? artwork.description_ar : artwork.description_fr}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* Text content */}
                {selectedHotspot.hotspot_type === 'text' && (
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: (language === 'ar' ? selectedHotspot.rich_text_ar : selectedHotspot.rich_text_fr) || '' 
                    }}
                  />
                )}

                {/* Media content */}
                {selectedHotspot.hotspot_type === 'media' && selectedHotspot.media_url && (
                  <div className="aspect-video">
                    {selectedHotspot.media_url.includes('youtube') || selectedHotspot.media_url.includes('vimeo') ? (
                      <iframe
                        src={selectedHotspot.media_url}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    ) : (
                      <video 
                        src={selectedHotspot.media_url} 
                        controls 
                        className="w-full h-full rounded-lg"
                      />
                    )}
                  </div>
                )}

                {/* Generic rich text for any type */}
                {selectedHotspot.hotspot_type !== 'text' && selectedHotspot.rich_text_fr && (
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none mt-4 pt-4 border-t"
                    dangerouslySetInnerHTML={{ 
                      __html: (language === 'ar' ? selectedHotspot.rich_text_ar : selectedHotspot.rich_text_fr) || '' 
                    }}
                  />
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
