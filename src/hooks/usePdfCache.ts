import { useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface CachedPage {
  imageData: ImageData;
  width: number;
  height: number;
  timestamp: number;
}

interface PdfCache {
  document: pdfjsLib.PDFDocumentProxy | null;
  pages: Map<string, CachedPage>;
  preloadQueue: Set<number>;
}

const MAX_CACHED_PAGES = 20;
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function usePdfCache() {
  const cacheRef = useRef<Map<string, PdfCache>>(new Map());

  const getCacheKey = (pageNumber: number, scale: number, rotation: number) => 
    `${pageNumber}-${scale}-${rotation}`;

  const getOrCreatePdfCache = useCallback((pdfUrl: string): PdfCache => {
    if (!cacheRef.current.has(pdfUrl)) {
      cacheRef.current.set(pdfUrl, {
        document: null,
        pages: new Map(),
        preloadQueue: new Set(),
      });
    }
    return cacheRef.current.get(pdfUrl)!;
  }, []);

  const setDocument = useCallback((pdfUrl: string, doc: pdfjsLib.PDFDocumentProxy) => {
    const cache = getOrCreatePdfCache(pdfUrl);
    cache.document = doc;
  }, [getOrCreatePdfCache]);

  const getDocument = useCallback((pdfUrl: string): pdfjsLib.PDFDocumentProxy | null => {
    return cacheRef.current.get(pdfUrl)?.document || null;
  }, []);

  const cachePage = useCallback((
    pdfUrl: string, 
    pageNumber: number, 
    scale: number, 
    rotation: number,
    imageData: ImageData,
    width: number,
    height: number
  ) => {
    const cache = getOrCreatePdfCache(pdfUrl);
    const key = getCacheKey(pageNumber, scale, rotation);
    
    // Éviter de dépasser le cache max
    if (cache.pages.size >= MAX_CACHED_PAGES) {
      // Supprimer les entrées les plus anciennes
      const entries = Array.from(cache.pages.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, 5);
      toRemove.forEach(([k]) => cache.pages.delete(k));
    }
    
    cache.pages.set(key, {
      imageData,
      width,
      height,
      timestamp: Date.now(),
    });
  }, [getOrCreatePdfCache]);

  const getCachedPage = useCallback((
    pdfUrl: string,
    pageNumber: number,
    scale: number,
    rotation: number
  ): CachedPage | null => {
    const cache = cacheRef.current.get(pdfUrl);
    if (!cache) return null;
    
    const key = getCacheKey(pageNumber, scale, rotation);
    const cached = cache.pages.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
      return cached;
    }
    
    return null;
  }, []);

  const addToPreloadQueue = useCallback((pdfUrl: string, pageNumbers: number[]) => {
    const cache = getOrCreatePdfCache(pdfUrl);
    pageNumbers.forEach(p => cache.preloadQueue.add(p));
  }, [getOrCreatePdfCache]);

  const isInPreloadQueue = useCallback((pdfUrl: string, pageNumber: number): boolean => {
    const cache = cacheRef.current.get(pdfUrl);
    return cache?.preloadQueue.has(pageNumber) || false;
  }, []);

  const removeFromPreloadQueue = useCallback((pdfUrl: string, pageNumber: number) => {
    const cache = cacheRef.current.get(pdfUrl);
    cache?.preloadQueue.delete(pageNumber);
  }, []);

  const clearCache = useCallback((pdfUrl?: string) => {
    if (pdfUrl) {
      cacheRef.current.delete(pdfUrl);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  return {
    getOrCreatePdfCache,
    setDocument,
    getDocument,
    cachePage,
    getCachedPage,
    addToPreloadQueue,
    isInPreloadQueue,
    removeFromPreloadQueue,
    clearCache,
  };
}
