import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Thumb = { pageNum: number; dataUrl: string };

interface PdfCoverPickerProps {
  pdfDoc: any;
  maxPages?: number;
  disabled?: boolean;
  onPick: (pageNum: number) => void;
}

export function PdfCoverPicker({ pdfDoc, maxPages = 15, disabled, onPick }: PdfCoverPickerProps) {
  const [thumbs, setThumbs] = useState<Thumb[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const jobRef = useRef(0);

  useEffect(() => {
    if (!pdfDoc) return;

    const jobId = ++jobRef.current;
    setThumbs([]);
    setIsLoading(true);

    const run = async () => {
      const total = Math.min(maxPages, pdfDoc.numPages || maxPages);
      const next: Thumb[] = [];

      for (let i = 1; i <= total; i++) {
        try {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 0.22 });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          canvas.width = Math.max(1, Math.floor(viewport.width));
          canvas.height = Math.max(1, Math.floor(viewport.height));

          await page.render({ canvasContext: ctx, viewport }).promise;

          next.push({ pageNum: i, dataUrl: canvas.toDataURL("image/jpeg", 0.72) });
          if (jobRef.current !== jobId) return;
          setThumbs([...next]);
        } catch {
          // ignore page render errors
        }
      }
    };

    run().finally(() => {
      if (jobRef.current === jobId) setIsLoading(false);
    });
  }, [pdfDoc, maxPages]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Sélectionnez la page contenant l’illustration à utiliser comme couverture.
        </p>
        {isLoading && (
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Génération…
          </span>
        )}
      </div>

      {thumbs.length === 0 && !isLoading ? (
        <p className="text-xs text-muted-foreground">Aucun aperçu généré.</p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {thumbs.map((t) => (
            <Button
              key={t.pageNum}
              type="button"
              variant="outline"
              size="sm"
              className="h-auto p-0 overflow-hidden aspect-[3/4] relative"
              disabled={disabled}
              onClick={() => onPick(t.pageNum)}
              title={`Utiliser la page ${t.pageNum} comme couverture`}
            >
              <img
                src={t.dataUrl}
                alt={`Miniature page ${t.pageNum}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 text-[10px] px-1 py-0.5 bg-background/70 text-foreground">
                p.{t.pageNum}
              </span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
