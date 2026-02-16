import { useState, useEffect, useRef, useCallback, memo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Loader2 } from 'lucide-react';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

// Cache global pour les documents PDF
const documentCache = new Map<string, pdfjsLib.PDFDocumentProxy>();
const pageImageCache = new Map<string, string>(); // base64 data URLs
const renderingPages = new Set<string>();

const MAX_CACHE_SIZE = 30;
const PRELOAD_ADJACENT_PAGES = 2;

interface OptimizedPdfPageRendererProps {
  pdfUrl: string;
  pageNumber: number;
  scale?: number;
  rotation?: number;
  className?: string;
  onPageLoad?: (totalPages: number) => void;
  onImageRendered?: (width: number, height: number) => void;
  priority?: 'high' | 'low';
  preloadPages?: number[];
}

const getCacheKey = (pdfUrl: string, pageNumber: number, scale: number, rotation: number) =>
  `${pdfUrl}:${pageNumber}:${scale}:${rotation}`;

// Nettoyer le cache si trop grand
const cleanupCache = () => {
  if (pageImageCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(pageImageCache.keys());
    const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 3));
    toRemove.forEach(key => pageImageCache.delete(key));
  }
};

// Fonction pour charger un document PDF avec cache
const loadPdfDocument = async (pdfUrl: string): Promise<pdfjsLib.PDFDocumentProxy> => {
  if (documentCache.has(pdfUrl)) {
    return documentCache.get(pdfUrl)!;
  }
  
  const loadingTask = pdfjsLib.getDocument({
    url: pdfUrl,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/cmaps/',
    cMapPacked: true,
  });
  
  const pdf = await loadingTask.promise;
  documentCache.set(pdfUrl, pdf);
  return pdf;
};

// Fonction pour rendre une page en image
const renderPageToImage = async (
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  rotation: number
): Promise<string> => {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale, rotation });
  
  // Créer un canvas offscreen pour le rendu
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;
  
  // Convertir en data URL avec compression
  const dataUrl = canvas.toDataURL('image/webp', 0.85);
  
  // Nettoyage
  canvas.width = 0;
  canvas.height = 0;
  
  return dataUrl;
};

// Préchargement en arrière-plan
const preloadPage = async (
  pdfUrl: string,
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  rotation: number
) => {
  const cacheKey = getCacheKey(pdfUrl, pageNumber, scale, rotation);
  
  if (pageImageCache.has(cacheKey) || renderingPages.has(cacheKey)) {
    return;
  }
  
  if (pageNumber < 1 || pageNumber > pdf.numPages) {
    return;
  }
  
  renderingPages.add(cacheKey);
  
  try {
    const dataUrl = await renderPageToImage(pdf, pageNumber, scale, rotation);
    pageImageCache.set(cacheKey, dataUrl);
    cleanupCache();
  } catch (err) {
    console.warn(`Preload failed for page ${pageNumber}:`, err);
  } finally {
    renderingPages.delete(cacheKey);
  }
};

export const OptimizedPdfPageRenderer = memo(function OptimizedPdfPageRenderer({
  pdfUrl,
  pageNumber,
  scale = 1.5,
  rotation = 0,
  className = '',
  onPageLoad,
  onImageRendered,
  priority = 'high',
  preloadPages,
}: OptimizedPdfPageRendererProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const cacheKey = getCacheKey(pdfUrl, pageNumber, scale, rotation);

  // Vérifier le cache immédiatement
  useEffect(() => {
    const cached = pageImageCache.get(cacheKey);
    if (cached) {
      setImageUrl(cached);
      setLoading(false);
    }
  }, [cacheKey]);

  // Charger et rendre la page
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    const loadAndRender = async () => {
      // Vérifier le cache d'abord
      const cached = pageImageCache.get(cacheKey);
      if (cached) {
        if (!cancelled && mountedRef.current) {
          setImageUrl(cached);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Charger le document
        const pdf = await loadPdfDocument(pdfUrl);
        pdfRef.current = pdf;
        
        if (cancelled || !mountedRef.current) return;

        onPageLoad?.(pdf.numPages);

        // Rendre la page courante
        const dataUrl = await renderPageToImage(pdf, pageNumber, scale, rotation);
        
        if (cancelled || !mountedRef.current) return;

        pageImageCache.set(cacheKey, dataUrl);
        cleanupCache();
        
        setImageUrl(dataUrl);
        setLoading(false);

        // Précharger les pages adjacentes
        const pagesToPreload = preloadPages || [
          pageNumber - 1,
          pageNumber + 1,
          pageNumber - 2,
          pageNumber + 2,
        ].filter(p => p >= 1 && p <= pdf.numPages && p !== pageNumber);

        // Préchargement asynchrone avec délai pour ne pas bloquer
        setTimeout(() => {
          pagesToPreload.forEach((p, index) => {
            setTimeout(() => {
              if (mountedRef.current) {
                preloadPage(pdfUrl, pdf, p, scale, rotation);
              }
            }, index * 100); // Échelonner les préchargements
          });
        }, 50);

      } catch (err) {
        console.error('Error loading PDF:', err);
        if (!cancelled && mountedRef.current) {
          setError('Impossible de charger le PDF');
          setLoading(false);
        }
      }
    };

    loadAndRender();

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [pdfUrl, pageNumber, scale, rotation, cacheKey, onPageLoad, preloadPages]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted/50 aspect-[3/4] ${className}`}>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {loading && !imageUrl && (
        <div className="flex items-center justify-center bg-muted/30 aspect-[3/4] min-h-[200px]">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Chargement de la page {pageNumber}...</p>
          </div>
        </div>
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`Page ${pageNumber}`}
          className="block w-auto h-auto object-contain"
          style={{ 
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.2s ease-in-out',
            maxHeight: 'calc(100vh - 12rem)',
          }}
          loading={priority === 'high' ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={(e) => {
            const img = e.currentTarget;
            onImageRendered?.(img.clientWidth, img.clientHeight);
          }}
        />
      )}
    </div>
  );
});

// Export pour précharger manuellement des pages
export const preloadPdfPages = async (
  pdfUrl: string,
  pageNumbers: number[],
  scale: number = 1.5,
  rotation: number = 0
) => {
  try {
    const pdf = await loadPdfDocument(pdfUrl);
    for (const pageNumber of pageNumbers) {
      await preloadPage(pdfUrl, pdf, pageNumber, scale, rotation);
    }
  } catch (err) {
    console.warn('Preload batch failed:', err);
  }
};

// Vider le cache (utile pour libérer de la mémoire)
export const clearPdfCache = (pdfUrl?: string) => {
  if (pdfUrl) {
    // Supprimer les entrées pour cette URL
    const keysToDelete = Array.from(pageImageCache.keys()).filter(k => k.startsWith(pdfUrl));
    keysToDelete.forEach(k => pageImageCache.delete(k));
    documentCache.delete(pdfUrl);
  } else {
    pageImageCache.clear();
    documentCache.clear();
  }
};

export default OptimizedPdfPageRenderer;
