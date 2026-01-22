import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Loader2 } from 'lucide-react';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface PdfPageRendererProps {
  pdfUrl: string;
  pageNumber: number;
  scale?: number;
  rotation?: number;
  className?: string;
  onPageLoad?: (totalPages: number) => void;
}

export function PdfPageRenderer({ 
  pdfUrl, 
  pageNumber, 
  scale = 1.5, 
  rotation = 0,
  className = '',
  onPageLoad 
}: PdfPageRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  // Load PDF document once
  useEffect(() => {
    let cancelled = false;
    
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        if (!cancelled) {
          setPdfDoc(pdf);
          onPageLoad?.(pdf.numPages);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (!cancelled) {
          setError('Impossible de charger le PDF');
        }
      }
    };
    
    loadPdf();
    
    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  // Render specific page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    
    let cancelled = false;
    
    const renderPage = async () => {
      try {
        setLoading(true);
        
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale, rotation });
        
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
        
        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error rendering page:', err);
        if (!cancelled) {
          setError('Erreur lors du rendu de la page');
          setLoading(false);
        }
      }
    };
    
    renderPage();
    
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNumber, scale, rotation]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted/50 aspect-[3/4] ${className}`}>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        className="block max-w-full max-h-full w-auto h-auto"
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  );
}
