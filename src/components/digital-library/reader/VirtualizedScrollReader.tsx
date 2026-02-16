import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { PdfPageWithHighlight } from '../PdfPageWithHighlight';
import { OptimizedPdfPageRenderer, preloadPdfPages } from '../OptimizedPdfPageRenderer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, AlertCircle, FileText } from 'lucide-react';

interface VirtualizedScrollReaderProps {
  pdfUrl: string;
  totalPages: number;
  zoom: number;
  rotation: number;
  pageRotations: Record<number, number>;
  bookmarks: number[];
  onToggleBookmark: (page: number) => void;
  onCurrentPageChange: (page: number) => void;
  isPageAccessible: (page: number) => boolean;
  restrictedPageDisplay: 'blur' | 'empty' | 'hidden';
  getAccessDeniedMessage: () => string;
  searchHighlight?: string;
  documentId?: string;
}

const BUFFER_PAGES = 3; // Pages à rendre au-dessus/en-dessous de la zone visible
const ESTIMATED_PAGE_HEIGHT = 800; // Hauteur estimée d'une page en pixels

export const VirtualizedScrollReader = memo(function VirtualizedScrollReader({
  pdfUrl,
  totalPages,
  zoom,
  rotation,
  pageRotations,
  bookmarks,
  onToggleBookmark,
  onCurrentPageChange,
  isPageAccessible,
  restrictedPageDisplay,
  getAccessDeniedMessage,
  searchHighlight,
  documentId,
}: VirtualizedScrollReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 1, end: 5 });
  const [scrollTop, setScrollTop] = useState(0);
  const observersRef = useRef<Map<number, IntersectionObserver>>(new Map());
  const pageHeightsRef = useRef<Map<number, number>>(new Map());

  // Calculer les pages visibles basé sur le scroll
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollPosition = container.scrollTop;
    const viewportHeight = container.clientHeight;

    // Estimation de la page courante
    const estimatedPage = Math.floor(scrollPosition / (ESTIMATED_PAGE_HEIGHT * (zoom / 100))) + 1;
    const pagesInView = Math.ceil(viewportHeight / (ESTIMATED_PAGE_HEIGHT * (zoom / 100))) + 1;

    const start = Math.max(1, estimatedPage - BUFFER_PAGES);
    const end = Math.min(totalPages, estimatedPage + pagesInView + BUFFER_PAGES);

    setVisibleRange({ start, end });
    onCurrentPageChange(Math.max(1, Math.min(totalPages, estimatedPage)));
  }, [totalPages, zoom, onCurrentPageChange]);

  // Gestion du scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          calculateVisibleRange();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    calculateVisibleRange();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [calculateVisibleRange]);

  // Précharger les pages à venir
  useEffect(() => {
    if (!pdfUrl) return;

    const pagesToPreload = [];
    for (let i = visibleRange.end + 1; i <= Math.min(totalPages, visibleRange.end + 3); i++) {
      pagesToPreload.push(i);
    }

    if (pagesToPreload.length > 0) {
      // Préchargement avec délai pour ne pas impacter les performances
      const timeout = setTimeout(() => {
        preloadPdfPages(pdfUrl, pagesToPreload, 1.2 * (zoom / 100), rotation);
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [pdfUrl, visibleRange.end, totalPages, zoom, rotation]);

  // Générer les pages à rendre
  const pagesToRender = [];
  for (let i = visibleRange.start; i <= visibleRange.end; i++) {
    pagesToRender.push(i);
  }

  // Calculer l'espace avant les pages visibles (pour maintenir la position de scroll)
  const spacerBefore = (visibleRange.start - 1) * ESTIMATED_PAGE_HEIGHT * (zoom / 100);
  const spacerAfter = Math.max(0, (totalPages - visibleRange.end) * ESTIMATED_PAGE_HEIGHT * (zoom / 100));

  return (
    <div 
      ref={containerRef}
      id="virtualized-scroll-container"
      className="h-full overflow-y-auto overscroll-contain scroll-smooth"
    >
      <div className="flex flex-col items-center gap-6 pb-8 pt-4 px-4">
        {/* Spacer avant */}
        {spacerBefore > 0 && (
          <div style={{ height: spacerBefore, width: '100%' }} aria-hidden="true" />
        )}

        {pagesToRender.map((pageNum) => {
          const isAccessible = isPageAccessible(pageNum);
          
          // Mode hidden - ne pas afficher
          if (!isAccessible && restrictedPageDisplay === 'hidden') {
            return null;
          }

          return (
            <div
              key={pageNum}
              className="relative"
              id={`page-${pageNum}`}
              data-page={pageNum}
            >
              {/* Badge numéro de page */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <Badge variant="secondary" className="text-xs">
                  Page {pageNum}
                </Badge>
              </div>

              <Card 
                className="shadow-xl"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation + (pageRotations[pageNum] ?? 0)}deg)`,
                  transformOrigin: 'center',
                  transition: 'transform 0.3s ease',
                }}
              >
                <CardContent className="p-0">
                  <div className="w-full max-w-[600px] bg-gradient-to-br from-background to-muted flex items-center justify-center relative overflow-hidden">
                    {isAccessible ? (
                      <PdfPageWithHighlight
                        pdfUrl={pdfUrl}
                        pageNumber={pageNum}
                        scale={1.2}
                        rotation={rotation + (pageRotations[pageNum] ?? 0)}
                        priority={pageNum === visibleRange.start || pageNum === visibleRange.start + 1 ? 'high' : 'low'}
                        searchHighlight={searchHighlight}
                        documentId={documentId}
                      />
                    ) : restrictedPageDisplay === 'blur' ? (
                      <div className="relative w-full">
                        <div className="filter blur-lg opacity-50">
                          <OptimizedPdfPageRenderer
                            pdfUrl={pdfUrl}
                            pageNumber={pageNum}
                            scale={1.2}
                            rotation={rotation + (pageRotations[pageNum] ?? 0)}
                            priority="low"
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="text-center p-4 bg-background/90 rounded-lg shadow-lg">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                            <p className="text-sm font-medium">Page restreinte</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getAccessDeniedMessage()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-[3/4] flex items-center justify-center bg-muted/50 min-h-[400px]">
                        <div className="text-center p-8">
                          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                          <p className="text-muted-foreground text-sm">
                            {getAccessDeniedMessage()}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Badge marque-page */}
                    {bookmarks.includes(pageNum) && (
                      <Badge className="absolute top-4 right-4 bg-primary/90">
                        <Bookmark className="h-3 w-3 mr-1 fill-current" />
                        Marqué
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bouton marque-page */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => onToggleBookmark(pageNum)}
              >
                <Bookmark
                  className={`h-4 w-4 ${bookmarks.includes(pageNum) ? 'fill-current text-primary' : ''}`}
                />
              </Button>
            </div>
          );
        })}

        {/* Spacer après */}
        {spacerAfter > 0 && (
          <div style={{ height: spacerAfter, width: '100%' }} aria-hidden="true" />
        )}
      </div>
    </div>
  );
});

export default VirtualizedScrollReader;
