import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  markerTitle?: string;
  markerDescription?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center = [-6.8395, 33.9808], // BNRM coordinates
  zoom = 15,
  markerTitle = "Bibliothèque Nationale du Royaume du Maroc",
  markerDescription = "Avenue Al Atlas, Hay Ryad, Rabat"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const { toast } = useToast();

  // Check for token in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      setMapboxToken(storedToken);
      setIsTokenSet(true);
    }
  }, []);

  const handleSetToken = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('mapbox_token', tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setIsTokenSet(true);
      toast({
        title: "Token configuré",
        description: "La carte sera chargée dans un instant",
      });
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: zoom,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add full screen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.innerHTML = `
        <div style="
          background: hsl(var(--primary));
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          border: 3px solid white;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 20px;
          ">📍</div>
        </div>
      `;

      // Add marker to map
      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom'
      })
        .setLngLat(center)
        .addTo(map.current);

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px; color: hsl(var(--primary));">${markerTitle}</h3>
          <p style="margin: 0; font-size: 14px; color: hsl(var(--foreground));">${markerDescription}</p>
          <a 
            href="https://www.google.com/maps/dir/?api=1&destination=${center[1]},${center[0]}" 
            target="_blank" 
            rel="noopener noreferrer"
            style="
              display: inline-block;
              margin-top: 8px;
              color: hsl(var(--primary));
              text-decoration: underline;
              font-size: 13px;
            "
          >
            Obtenir l'itinéraire →
          </a>
        </div>
      `);

      marker.setPopup(popup);
      
      // Show popup by default
      popup.addTo(map.current);

      // Cleanup
      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la carte. Vérifiez votre token Mapbox.",
        variant: "destructive"
      });
      setIsTokenSet(false);
      localStorage.removeItem('mapbox_token');
    }
  }, [isTokenSet, mapboxToken, center, zoom, markerTitle, markerDescription, toast]);

  if (!isTokenSet) {
    return (
      <div className="w-full h-full bg-accent/20 rounded-lg p-6 flex flex-col items-center justify-center gap-4">
        <MapPin className="h-12 w-12 text-primary" />
        <div className="text-center max-w-md">
          <h3 className="font-semibold mb-2">Configuration de la carte interactive</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Pour afficher la carte interactive, vous devez fournir un token Mapbox public.
            Obtenez-le gratuitement sur <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Entrez votre token Mapbox public"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSetToken()}
            />
            <Button onClick={handleSetToken}>
              Configurer
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Pour une solution permanente, ajoutez le token dans les secrets Supabase Edge Function
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden shadow-lg" />
    </div>
  );
};

export default InteractiveMap;
