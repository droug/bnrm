import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface LibraryMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  libraryName: string;
  city: string;
}

// Coordonnées des bibliothèques (à compléter selon vos besoins)
const libraryCoordinates: { [key: string]: { lat: number; lng: number } } = {
  "Bibliothèque de l'école des sciences de l'information": { lat: 33.9716, lng: -6.8498 },
  "Bibliothèque de l'Université Mohammed 1": { lat: 34.6867, lng: -1.9114 },
  "Bibliothèque de la Faculté de Médecine et de Pharmacie de Rabat": { lat: 33.9716, lng: -6.8498 },
  "Bibliothèque de la Faculté des Sciences Juridiques Economiques et Sociales - Souissi": { lat: 33.9716, lng: -6.8498 },
  "Bibliothèque de la Faculté des Sciences Juridiques, Economiques et Sociales": { lat: 33.5731, lng: -7.5898 },
  "Bibliothèque Nationale du Royaume du Maroc": { lat: 33.9808, lng: -6.8499 },
  "Bibliothèque universitaire Mohammed Sekkat": { lat: 33.5731, lng: -7.5898 },
  "Catalogue du Ministère de la Culture": { lat: 33.9716, lng: -6.8498 },
  "Catalogue de la Mosquée Hassan II": { lat: 33.6084, lng: -7.6326 },
  "Fondation du Roi Abdul-Aziz Al Saoud pour les Etudes Islamiques et les Sciences Humaines": { lat: 35.7595, lng: -5.8337 },
  "Fondation Mohamed VI": { lat: 33.9716, lng: -6.8498 },
  "Université Al Akhawayn": { lat: 33.5228, lng: -5.1104 },
  "Université Hassan II de Casablanca": { lat: 33.5731, lng: -7.5898 },
};

export const LibraryMapModal = ({ isOpen, onClose, libraryName, city }: LibraryMapModalProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    // Remplacez 'YOUR_GOOGLE_MAPS_API_KEY' par votre clé API Google Maps
    const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

    // Charger l'API Google Maps
    const loadGoogleMaps = () => {
      if ((window as any).google && (window as any).google.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current) return;

      const coordinates = libraryCoordinates[libraryName] || { lat: 33.9716, lng: -6.8498 };
      const google = (window as any).google;

      googleMapRef.current = new google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      // Ajouter une info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="font-weight: bold; margin-bottom: 5px;">${libraryName}</h3>
            <p style="color: #666;">${city}</p>
          </div>
        `,
      });

      const marker = new google.maps.Marker({
        position: coordinates,
        map: googleMapRef.current,
        title: libraryName,
        animation: google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current!, marker);
      });

      // Ouvrir l'info window par défaut
      infoWindow.open(googleMapRef.current!, marker);
    };

    loadGoogleMaps();
  }, [isOpen, libraryName, city]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Localisation : {libraryName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 relative">
          <div 
            ref={mapRef} 
            className="w-full h-[500px] rounded-lg border border-border"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
