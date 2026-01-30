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
  creator_author: string | null;
  creation_date: string | null;
  artwork_type: string | null;
  inventory_id: string | null;
  images: Array<{ url: string; alt: string }> | null;
  external_catalog_url: string | null;
}

interface VExpo360ViewerProps {
  panoramas: Panorama[];
  hotspots: Record<string, Hotspot[]>;
  artworks: Record<string, Artwork>;
  onClose?: () => void;
  initialPanoramaId?: string;
  language?: 'fr' | 'ar';
  externalFullscreen?: boolean;
}

// Panorama Sphere Component
function PanoramaSphere({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (loadedTexture) => {
      // NOTE: Keep default UV mapping.
      // Using EquirectangularReflectionMapping here can desync the visual panorama
      // from the admin equirectangular picker coordinates.
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
      {/*
        We flip the sphere on X to render the panorama from inside.
        Don't also render BackSide here, otherwise we effectively double-flip/mirror,
        which causes a persistent hotspot offset vs the admin picker.
      */}
      <meshBasicMaterial map={texture} side={THREE.FrontSide} />
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
  // Yaw: horizontal angle (-180 to 180), 0 = center of equirectangular image
  // Pitch: vertical angle (-90 to 90), positive = up
  // 
  // The equirectangular image in the admin picker:
  // - Center of image (50%) = yaw 0°
  // - Left edge (0%) = yaw -180°
  // - Right edge (100%) = yaw +180°
  // 
  // The sphere uses scale={[-1, 1, 1]} which flips X, and camera starts at z=0.1 looking at origin.
  // So the viewer looks "into" the sphere toward -Z initially.
  // 
  // For yaw=0° (center of image) to appear in front of the initial camera view:
  // We need to map it to -Z direction (since camera looks toward -Z from z=0.1)
  const radius = 100;
  const yawRad = THREE.MathUtils.degToRad(hotspot.yaw);
  const pitchRad = THREE.MathUtils.degToRad(hotspot.pitch);
  
  // Corrected conversion: yaw=0 should map to negative Z (in front of camera)
  // NOTE: Do NOT negate X here: negating X mirrors left/right and breaks alignment with admin yaw.
  const x = radius * Math.cos(pitchRad) * Math.sin(yawRad);
  const y = radius * Math.sin(pitchRad);
  const z = -radius * Math.cos(pitchRad) * Math.cos(yawRad);

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
      onPointerOver={() => {
        onHover(true);
      }}
      onPointerOut={() => {
        onHover(false);
      }}
    >
      <circleGeometry args={[3, 32]} />
      <meshBasicMaterial 
        color={getColor()} 
        side={THREE.DoubleSide}
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
  language = 'fr',
  externalFullscreen = false
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

  const effectiveFullscreen = isFullscreen || externalFullscreen;
  
  return (
    <div 
      ref={containerRef}
      className={`relative bg-black overflow-hidden ${hoveredHotspotId ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'} ${effectiveFullscreen ? 'h-full w-full' : 'h-[600px] rounded-lg'} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
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
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-20">
        <div className="pointer-events-auto flex items-center gap-3">
          {onClose && (
            <Button 
              variant="destructive" 
              size="default" 
              onClick={onClose} 
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
            >
              <X className="h-5 w-5 mr-2" />
              Fermer
            </Button>
          )}
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
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
            className="bg-black/70 hover:bg-black/90 text-white shadow-lg"
            title="Afficher/Masquer les informations"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            onClick={toggleFullscreen}
            className="bg-black/70 hover:bg-black/90 text-white shadow-lg"
            title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto z-10">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={() => handleZoom('in')}
          className="bg-black/70 hover:bg-black/90 text-white shadow-lg"
          disabled={fov <= 30}
          title="Zoomer"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={() => handleZoom('out')}
          className="bg-black/70 hover:bg-black/90 text-white shadow-lg"
          disabled={fov >= 100}
          title="Dézoomer"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={resetView}
          className="bg-black/70 hover:bg-black/90 text-white shadow-lg"
          title="Réinitialiser la vue"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Arrows */}
      {panoramas.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="lg"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white pointer-events-auto shadow-lg z-10 h-14 w-14"
            onClick={() => navigatePanorama('prev')}
            disabled={panoramas.findIndex(p => p.id === currentPanoramaId) === 0}
            title="Panorama précédent"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="absolute right-20 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white pointer-events-auto shadow-lg z-10 h-14 w-14"
            onClick={() => navigatePanorama('next')}
            disabled={panoramas.findIndex(p => p.id === currentPanoramaId) === panoramas.length - 1}
            title="Panorama suivant"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Bottom Hotspot Legend */}
      {showInfo && currentHotspots.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 pointer-events-auto z-10">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 shadow-xl">
            <p className="text-white/80 text-sm font-medium mb-3">Points d'intérêt ({currentHotspots.length})</p>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {currentHotspots.map((hotspot) => (
                <Badge
                  key={hotspot.id}
                  variant="secondary"
                  className={`cursor-pointer transition-all bg-white/20 hover:bg-white/30 text-white border-white/30 ${
                    hoveredHotspotId === hotspot.id ? 'ring-2 ring-amber-400 bg-amber-500/30' : ''
                  }`}
                  onClick={() => handleHotspotClick(hotspot)}
                  onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                  onMouseLeave={() => setHoveredHotspotId(null)}
                >
                  {getHotspotIcon(hotspot.hotspot_type)}
                  <span className="ml-1.5">{language === 'ar' ? hotspot.label_ar : hotspot.label_fr}</span>
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
                          {artwork.images && artwork.images.length > 0 && (
                            <img 
                              src={artwork.images[0].url} 
                              alt={artwork.images[0].alt || artwork.title_fr}
                              className="w-full max-h-80 object-contain rounded-lg bg-muted"
                            />
                          )}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {artwork.creator_author && (
                              <div>
                                <span className="text-muted-foreground">Auteur:</span>
                                <p className="font-medium">{artwork.creator_author}</p>
                              </div>
                            )}
                            {artwork.creation_date && (
                              <div>
                                <span className="text-muted-foreground">Date:</span>
                                <p className="font-medium">{artwork.creation_date}</p>
                              </div>
                            )}
                            {artwork.artwork_type && (
                              <div>
                                <span className="text-muted-foreground">Type:</span>
                                <p className="font-medium capitalize">{artwork.artwork_type}</p>
                              </div>
                            )}
                            {artwork.inventory_id && (
                              <div>
                                <span className="text-muted-foreground">Cote:</span>
                                <p className="font-medium">{artwork.inventory_id}</p>
                              </div>
                            )}
                          </div>
                          {artwork.description_fr && (
                            <p className="text-muted-foreground">
                              {language === 'ar' ? artwork.description_ar : artwork.description_fr}
                            </p>
                          )}
                          {artwork.external_catalog_url && (
                            <a 
                              href={artwork.external_catalog_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary hover:underline text-sm"
                            >
                            </a>
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
