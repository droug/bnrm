import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Skeleton } from '@/components/ui/skeleton';

// Configure PDF.js worker - use the exact version installed (4.4.168)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

interface PdfThumbnailProps {
  pdfUrl: string;
  fallbackImage?: string;
  className?: string;
  alt?: string;
}

// Cache global pour les miniatures générées
const thumbnailCache = new Map<string, string>();

export function PdfThumbnail({ pdfUrl, fallbackImage, className = '', alt = 'Document thumbnail' }: PdfThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isCancelled = false;

    const generateThumbnail = async () => {
      if (!pdfUrl) {
        setError(true);
        setLoading(false);
        return;
      }

      // Vérifier le cache
      if (thumbnailCache.has(pdfUrl)) {
        setThumbnailUrl(thumbnailCache.get(pdfUrl)!);
        setLoading(false);
        return;
      }

      try {
        // Charger le PDF
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/cmaps/',
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        
        if (isCancelled) return;

        // Obtenir la première page
        const page = await pdf.getPage(1);
        
        if (isCancelled) return;

        // Calculer l'échelle pour une miniature de 400px de large
        const viewport = page.getViewport({ scale: 1 });
        const scale = 400 / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        // Créer un canvas pour le rendu
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not get canvas context');
        }

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Rendre la page
        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;

        if (isCancelled) return;

        // Convertir en data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        // Mettre en cache
        thumbnailCache.set(pdfUrl, dataUrl);
        
        setThumbnailUrl(dataUrl);
        setLoading(false);
      } catch (err) {
        console.error('Error generating PDF thumbnail:', err);
        if (!isCancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    generateThumbnail();

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <Skeleton className="w-full h-full absolute inset-0" />
        {fallbackImage && (
          <img 
            src={fallbackImage} 
            alt={alt}
            className="w-full h-full object-cover opacity-50"
          />
        )}
      </div>
    );
  }

  if (error || !thumbnailUrl) {
    return (
      <img 
        src={fallbackImage || '/placeholder.svg'} 
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <img 
      src={thumbnailUrl} 
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}

// Fonction utilitaire pour pré-générer une miniature (pour les cards)
export async function generatePdfThumbnailUrl(pdfUrl: string): Promise<string | null> {
  if (!pdfUrl) return null;
  
  // Vérifier le cache
  if (thumbnailCache.has(pdfUrl)) {
    return thumbnailCache.get(pdfUrl)!;
  }

  try {
    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/cmaps/',
      cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    
    const viewport = page.getViewport({ scale: 1 });
    const scale = 400 / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return null;

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    thumbnailCache.set(pdfUrl, dataUrl);
    
    return dataUrl;
  } catch (err) {
    console.error('Error generating PDF thumbnail:', err);
    return null;
  }
}
