import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Loader2,
  ScanText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import Tesseract from "tesseract.js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PdfCoverPicker } from "@/components/admin/PdfCoverPicker";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface ExtractedData {
  title: string;
  title_ar: string;
  author: string;
  cover_image_url: string;
  description: string;
  date: string;
  pages_count: number;
  extracted_text: string;
}

interface PdfMetadataExtractorProps {
  onDataExtracted: (data: Partial<ExtractedData>) => void;
}

const TESSERACT_LANG_MAP: Record<string, string> = {
  'ar': 'ara',
  'fr': 'fra',
  'en': 'eng',
  'es': 'spa',
  'amz': 'ber_proc',
  'fr+ar': 'fra+ara',
  'ar+fr': 'ara+fra',
  'lat': 'lat',
};

export default function PdfMetadataExtractor({ onDataExtracted }: PdfMetadataExtractorProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [ocrLanguage, setOcrLanguage] = useState("fr+ar");
  const [extractedData, setExtractedData] = useState<Partial<ExtractedData> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Manual cover tool
  const [pdfDocForPicker, setPdfDocForPicker] = useState<any | null>(null);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [isApplyingCover, setIsApplyingCover] = useState(false);

  // Render a PDF page to a high-quality image
  const renderPageToImage = async (page: any, scale: number = 2.0): Promise<string> => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const renderPageToCanvas = async (page: any, scale: number = 1.2): Promise<HTMLCanvasElement> => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));

    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas;
  };

  const cropCanvasToDataUrl = (
    source: HTMLCanvasElement,
    crop: { x: number; y: number; w: number; h: number },
    quality: number = 0.92
  ): string => {
    const out = document.createElement("canvas");
    out.width = Math.max(1, Math.floor(crop.w));
    out.height = Math.max(1, Math.floor(crop.h));
    const outCtx = out.getContext("2d");
    if (!outCtx) return source.toDataURL("image/jpeg", quality);

    outCtx.drawImage(
      source,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
      0,
      0,
      out.width,
      out.height
    );

    return out.toDataURL("image/jpeg", quality);
  };

  // Try to find the most "photo-like" region on a rendered page and crop to it.
  // This helps when the cover is not an extractable embedded image, but a scanned page.
  const detectPhotoCropFromCanvas = (
    canvas: HTMLCanvasElement
  ):
    | {
        dataUrl: string;
        score: number;
        entropy: number;
        colorfulness: number;
        nonWhiteRatio: number;
        areaRatio: number;
      }
    | null => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const w = canvas.width;
    const h = canvas.height;
    if (w < 64 || h < 64) return null;

    const img = ctx.getImageData(0, 0, w, h);
    const data = img.data;

    const idx = (x: number, y: number) => (y * w + x) * 4;

    const computeRegionStats = (x0: number, y0: number, rw: number, rh: number) => {
      const bins = new Array(64).fill(0);
      let total = 0;
      let nonWhite = 0;
      let colorSum = 0;

      const step = Math.max(1, Math.floor(Math.min(rw, rh) / 260)); // adaptive sampling

      for (let y = y0; y < y0 + rh; y += step) {
        for (let x = x0; x < x0 + rw; x += step) {
          const p = idx(x, y);
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];

          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          bins[Math.min(63, Math.max(0, Math.floor(lum / 4)))]++;
          total++;

          if (!(r > 245 && g > 245 && b > 245)) nonWhite++;

          // simple colorfulness proxy (0..255-ish)
          colorSum += (Math.abs(r - g) + Math.abs(r - b) + Math.abs(g - b)) / 3;
        }
      }

      const nonWhiteRatio = total > 0 ? nonWhite / total : 0;
      const colorfulness = total > 0 ? colorSum / total : 0;

      let entropy = 0;
      if (total > 0) {
        for (const c of bins) {
          if (c <= 0) continue;
          const p = c / total;
          entropy -= p * Math.log2(p);
        }
      }

      return { entropy, colorfulness, nonWhiteRatio };
    };

    const tile = 24; // coarse grid for performance
    const cols = Math.max(1, Math.floor(w / tile));
    const rows = Math.max(1, Math.floor(h / tile));

    const scores: number[] = new Array(cols * rows).fill(0);
    let maxScore = 0;

    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const x0 = tx * tile;
        const y0 = ty * tile;
        const x1 = Math.min(w, x0 + tile);
        const y1 = Math.min(h, y0 + tile);

        let n = 0;
        let sum = 0;
        let sumSq = 0;
        let nonWhite = 0;

        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const p = idx(x, y);
            const r = data[p];
            const g = data[p + 1];
            const b = data[p + 2];

            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            sum += lum;
            sumSq += lum * lum;
            n++;

            if (!(r > 245 && g > 245 && b > 245)) nonWhite++;
          }
        }

        const mean = sum / n;
        const variance = Math.max(0, sumSq / n - mean * mean);
        const nonWhiteRatio = nonWhite / n;

        // Score favors textured (variance) and dense regions.
        const score = variance * Math.pow(nonWhiteRatio, 1.4);
        const sIdx = ty * cols + tx;
        scores[sIdx] = score;
        if (score > maxScore) maxScore = score;
      }
    }

    if (maxScore <= 0) return null;

    // Select tiles close to the best tile.
    const threshold = maxScore * 0.55;
    let minTx = Infinity,
      minTy = Infinity,
      maxTx = -Infinity,
      maxTy = -Infinity;
    let selected = 0;

    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const s = scores[ty * cols + tx];
        if (s >= threshold) {
          selected++;
          minTx = Math.min(minTx, tx);
          minTy = Math.min(minTy, ty);
          maxTx = Math.max(maxTx, tx);
          maxTy = Math.max(maxTy, ty);
        }
      }
    }

    if (selected === 0) return null;

    // Expand a bit to avoid cutting edges.
    const pad = 1;
    minTx = Math.max(0, minTx - pad);
    minTy = Math.max(0, minTy - pad);
    maxTx = Math.min(cols - 1, maxTx + pad);
    maxTy = Math.min(rows - 1, maxTy + pad);

    const cropX = minTx * tile;
    const cropY = minTy * tile;
    const cropW = Math.min(w - cropX, (maxTx - minTx + 1) * tile);
    const cropH = Math.min(h - cropY, (maxTy - minTy + 1) * tile);

    const areaRatio = (cropW * cropH) / (w * h);

    // Reject crops that are too small (often just a text block)
    if (areaRatio < 0.18) return null;

    const stats = computeRegionStats(cropX, cropY, cropW, cropH);

    // Reject regions that look like pure text (low entropy + low colorfulness)
    // but keep grayscale photos (entropy high even if colorfulness low).
    const looksLikeText = stats.entropy < 3.3 && stats.colorfulness < 6;
    if (looksLikeText) return null;

    // Reject nearly-empty regions.
    if (stats.nonWhiteRatio < 0.14) return null;

    const dataUrl = cropCanvasToDataUrl(canvas, { x: cropX, y: cropY, w: cropW, h: cropH }, 0.92);
    return {
      dataUrl,
      score: maxScore,
      entropy: stats.entropy,
      colorfulness: stats.colorfulness,
      nonWhiteRatio: stats.nonWhiteRatio,
      areaRatio,
    };
  };

  // Check if an image is likely a real photo/cover (not just decoration/icon)
  const isSignificantImage = (width: number, height: number, pageWidth: number, pageHeight: number): boolean => {
    const area = width * height;
    const pageArea = pageWidth * pageHeight;
    const areaRatio = area / pageArea;

    // Heuristics:
    // - Ignore tiny icons/logos
    // - Prefer images that cover a meaningful portion of the page
    // (covers in scanned PDFs are often full-page images)
    return width >= 100 && height >= 100 && areaRatio >= 0.03 && area > 20000;
  };

  const loadImageFromSrc = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  // Convert various PDF.js image object shapes into a base64 data URL
  const pdfImageObjectToDataUrl = async (imgObj: any): Promise<string | null> => {
    if (!imgObj?.width || !imgObj?.height) return null;

    const canvas = document.createElement("canvas");
    canvas.width = imgObj.width;
    canvas.height = imgObj.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1) Raw pixel buffer (common for paintImageXObject)
    if (imgObj.data && typeof imgObj.data.length === "number") {
      const imageData = ctx.createImageData(imgObj.width, imgObj.height);
      const dataLen = imgObj.width * imgObj.height * 4;
      const srcData = imgObj.data as Uint8ClampedArray;

      if (srcData.length >= dataLen) {
        // RGBA
        imageData.data.set(srcData.subarray(0, dataLen));
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.92);
      }

      // RGB (no alpha)
      const rgbLen = imgObj.width * imgObj.height * 3;
      if (srcData.length >= rgbLen) {
        for (let j = 0, k = 0; j < rgbLen && k < dataLen; j += 3, k += 4) {
          imageData.data[k] = srcData[j];
          imageData.data[k + 1] = srcData[j + 1];
          imageData.data[k + 2] = srcData[j + 2];
          imageData.data[k + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.92);
      }
    }

    // 2) ImageBitmap / bitmap payloads (common for JPEG XObjects)
    if (typeof ImageBitmap !== "undefined" && imgObj.bitmap instanceof ImageBitmap) {
      ctx.drawImage(imgObj.bitmap, 0, 0, imgObj.width, imgObj.height);
      return canvas.toDataURL("image/jpeg", 0.92);
    }

    // 3) HTMLImageElement provided by PDF.js
    if (typeof HTMLImageElement !== "undefined" && imgObj instanceof HTMLImageElement) {
      ctx.drawImage(imgObj, 0, 0, imgObj.width, imgObj.height);
      return canvas.toDataURL("image/jpeg", 0.92);
    }

    // 4) Object with a `src` (data URL / blob URL)
    if (typeof imgObj.src === "string" && imgObj.src.length > 0) {
      const img = await loadImageFromSrc(imgObj.src);
      ctx.drawImage(img, 0, 0, imgObj.width, imgObj.height);
      return canvas.toDataURL("image/jpeg", 0.92);
    }

    return null;
  };

  // Extract embedded images from a specific page
  const extractImagesFromPage = async (page: any): Promise<{ data: string; area: number; width: number; height: number }[]> => {
    const images: { data: string; area: number; width: number; height: number }[] = [];
    const viewport = page.getViewport({ scale: 1.0 });

    // Support multiple image paint operations; values vary slightly by pdfjs version
    const OPS: any = (pdfjsLib as any).OPS || {};
    const imageOps = new Set<number>([
      OPS.paintJpegXObject ?? 82,
      OPS.paintImageXObject ?? 85,
      OPS.paintInlineImageXObject ?? 86,
      OPS.paintInlineImageXObjectGroup ?? 87,
      OPS.paintImageMaskXObject ?? 83,
      OPS.paintImageMaskXObjectGroup ?? 84,
    ]);

    try {
      const ops = await page.getOperatorList();

      for (let i = 0; i < ops.fnArray.length; i++) {
        const op = ops.fnArray[i];
        if (!imageOps.has(op)) continue;

        const arg0 = ops.argsArray?.[i]?.[0];
        let imgObj: any | null = null;

        try {
          // Some ops reference an object id, others carry the image payload directly.
          if (typeof arg0 === "string") {
            imgObj = await new Promise<any>((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error("Timeout")), 3000);
              page.objs.get(arg0, (img: any) => {
                clearTimeout(timeout);
                if (img) resolve(img);
                else reject(new Error("Image not found"));
              });
            });
          } else if (arg0 && typeof arg0 === "object") {
            imgObj = arg0;
          }

          if (!imgObj?.width || !imgObj?.height) continue;
          if (!isSignificantImage(imgObj.width, imgObj.height, viewport.width, viewport.height)) continue;

          const dataUrl = await pdfImageObjectToDataUrl(imgObj);
          if (!dataUrl) continue;

          images.push({
            data: dataUrl,
            area: imgObj.width * imgObj.height,
            width: imgObj.width,
            height: imgObj.height,
          });
        } catch {
          // skip
        }
      }
    } catch (err) {
      console.log("Error extracting images from page:", err);
    }

    return images;
  };

  // Compute colorfulness and entropy directly from a canvas
  const computeCanvasStats = (canvas: HTMLCanvasElement): { entropy: number; colorfulness: number; nonWhiteRatio: number } => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return { entropy: 0, colorfulness: 0, nonWhiteRatio: 0 };

    const w = canvas.width;
    const h = canvas.height;
    const data = ctx.getImageData(0, 0, w, h).data;

    const bins = new Array(64).fill(0);
    let total = 0;
    let nonWhite = 0;
    let colorSum = 0;

    const step = Math.max(1, Math.floor(Math.sqrt(w * h) / 300));
    for (let i = 0; i < data.length; i += 4 * step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      bins[Math.min(63, Math.max(0, Math.floor(lum / 4)))]++;
      total++;

      if (!(r > 245 && g > 245 && b > 245)) nonWhite++;
      colorSum += (Math.abs(r - g) + Math.abs(r - b) + Math.abs(g - b)) / 3;
    }

    const nonWhiteRatio = total > 0 ? nonWhite / total : 0;
    const colorfulness = total > 0 ? colorSum / total : 0;

    let entropy = 0;
    if (total > 0) {
      for (const c of bins) {
        if (c <= 0) continue;
        const p = c / total;
        entropy -= p * Math.log2(p);
      }
    }

    return { entropy, colorfulness, nonWhiteRatio };
  };

  // Intelligent cover extraction: scan pages, score them visually, pick the best, then render HQ.
  const extractCoverIntelligently = async (pdfDoc: any): Promise<string> => {
    const maxPagesToScan = Math.min(15, pdfDoc.numPages);

    setProgressText("Recherche intelligente de l'image de couverture...");

    type Candidate =
      | { pageNum: number; score: number; source: "embedded"; dataUrl: string }
      | { pageNum: number; score: number; source: "rendered" };

    const candidates: Candidate[] = [];

    for (let pageNum = 1; pageNum <= maxPagesToScan; pageNum++) {
      setProgressText(`Analyse de la page ${pageNum}/${maxPagesToScan}...`);

      const page = await pdfDoc.getPage(pageNum);

      // 1) Embedded images (rare for scanned PDFs, but best signal if present)
      const images = await extractImagesFromPage(page);
      for (const img of images) {
        candidates.push({
          pageNum,
          source: "embedded",
          dataUrl: img.data,
          // strong bias to embedded cover art
          score: img.area / 1000 + 2000,
        });
      }

      // 2) Always score the rendered page (even if it contains text)
      try {
        const canvas = await renderPageToCanvas(page, 0.85);
        const stats = computeCanvasStats(canvas);

        // Score favors: entropy (texture) + colorfulness + pixel density
        // This reliably ranks illustrated pages above plain text pages.
        const visualScore = (stats.entropy * 1.2 + stats.colorfulness * 0.35) * Math.max(0.01, stats.nonWhiteRatio);

        candidates.push({ pageNum, source: "rendered", score: visualScore });
      } catch {
        // ignore
      }
    }

    if (candidates.length === 0) {
      setProgressText("Rendu de la première page comme couverture...");
      const firstPage = await pdfDoc.getPage(1);
      return await renderPageToImage(firstPage, 2.5);
    }

    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];

    // If we found a true embedded image, use it directly.
    if (best.source === "embedded") {
      setProgressText(`✓ Couverture sélectionnée depuis la page ${best.pageNum} (image extraite)`);
      return best.dataUrl;
    }

    // Otherwise, render the best page in HQ and try to crop to the most photo-like region.
    setProgressText(`✓ Couverture sélectionnée depuis la page ${best.pageNum}`);
    const bestPage = await pdfDoc.getPage(best.pageNum);
    const hqCanvas = await renderPageToCanvas(bestPage, 2.0);

    const crop = detectPhotoCropFromCanvas(hqCanvas);
    if (crop) return crop.dataUrl;

    return hqCanvas.toDataURL("image/jpeg", 0.92);
  };

  const extractTextFromFirstPages = async (pdfDoc: any, numPages: number = 3): Promise<string> => {
    let fullText = "";
    const pagesToExtract = Math.min(numPages, pdfDoc.numPages);
    
    for (let i = 1; i <= pagesToExtract; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    
    return fullText;
  };

  const runOcrOnImage = async (imageData: string, language: string): Promise<string> => {
    const tesseractLang = TESSERACT_LANG_MAP[language] || 'fra+ara';
    
    const result = await Tesseract.recognize(imageData, tesseractLang, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const pct = Math.round(m.progress * 100);
          setProgressText(`OCR en cours... ${pct}%`);
        }
      }
    });
    
    return result.data.text.trim();
  };

  const extractMetadataFromText = (text: string, pdfInfo: any): Partial<ExtractedData> => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const data: Partial<ExtractedData> = {};
    
    // Try to extract title from PDF metadata first
    if (pdfInfo?.Title) {
      data.title = pdfInfo.Title;
    } else if (lines.length > 0) {
      // First substantial line is often the title
      const potentialTitle = lines.find(l => l.length > 5 && l.length < 150);
      if (potentialTitle) {
        data.title = potentialTitle.trim();
      }
    }
    
    // Try to extract author from PDF metadata
    if (pdfInfo?.Author) {
      data.author = pdfInfo.Author;
    }
    
    // Check for Arabic text in content
    const arabicPattern = /[\u0600-\u06FF]/;
    const hasArabic = arabicPattern.test(text);
    
    if (hasArabic) {
      // Extract Arabic title (first Arabic line)
      const arabicLine = lines.find(l => arabicPattern.test(l) && l.length > 5 && l.length < 150);
      if (arabicLine) {
        data.title_ar = arabicLine.trim();
      }
    }
    
    // Extract description from first paragraphs
    if (lines.length > 3) {
      data.description = lines.slice(1, 4).join(' ').substring(0, 300);
    }
    
    // Try to detect year in text
    const yearMatch = text.match(/(?:19|20)\d{2}/);
    if (yearMatch) {
      data.date = yearMatch[0];
    } else if (pdfInfo?.CreationDate) {
      const dateStr = pdfInfo.CreationDate;
      const yearFromMeta = dateStr.match(/(\d{4})/);
      if (yearFromMeta) {
        data.date = yearFromMeta[1];
      }
    }
    
    return data;
  };

  const uploadCoverImage = async (imageData: string): Promise<string> => {
    // Convert base64 to blob
    const base64Data = imageData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    const fileName = `featured-works/pdf-cover-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('digital-library')
      .upload(fileName, blob);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('digital-library')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const applyCoverFromPage = async (pageNum: number) => {
    if (!pdfDocForPicker) return;

    setIsApplyingCover(true);
    try {
      setProgressText(`Application de la couverture (page ${pageNum})...`);

      const page = await pdfDocForPicker.getPage(pageNum);
      const hqCanvas = await renderPageToCanvas(page, 2.0);
      const crop = detectPhotoCropFromCanvas(hqCanvas);
      const coverImage = crop?.dataUrl ?? hqCanvas.toDataURL("image/jpeg", 0.92);

      setCoverPreview(coverImage);

      const coverImageUrl = await uploadCoverImage(coverImage);

      const updated: Partial<ExtractedData> = {
        ...(extractedData ?? {}),
        cover_image_url: coverImageUrl,
      };

      setExtractedData(updated);
      onDataExtracted(updated);
      setIsCoverPickerOpen(false);

      toast({
        title: "Couverture mise à jour",
        description: `La page ${pageNum} a été définie comme couverture.`,
      });
    } catch (err: any) {
      console.error("applyCoverFromPage error:", err);
      toast({
        title: "Erreur",
        description: err?.message || "Impossible d'appliquer la couverture",
        variant: "destructive",
      });
    } finally {
      setIsApplyingCover(false);
    }
  };


  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un fichier PDF", variant: "destructive" });
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "Erreur", description: "Le fichier ne doit pas dépasser 100 Mo", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    setProgressText("Chargement du PDF...");
    setError(null);
    setExtractedData(null);
    setCoverPreview(null);
    setPdfDocForPicker(null);
    setIsCoverPickerOpen(false);

    try {
      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      setProgress(10);

      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDocForPicker(pdfDoc);
      const pdfInfo = await pdfDoc.getMetadata();
      setProgress(20);

      // Intelligent cover extraction: scan pages to find real image
      setProgressText("Extraction intelligente de l'image de couverture...");
      const coverImage = await extractCoverIntelligently(pdfDoc);
      setCoverPreview(coverImage); // Show preview immediately
      setProgress(40);
      
      // Upload cover image to storage
      setProgressText("Téléchargement de l'image...");
      const coverImageUrl = await uploadCoverImage(coverImage);
      setProgress(50);
      
      // Try to extract text directly first
      setProgressText("Extraction du texte...");
      let extractedText = await extractTextFromFirstPages(pdfDoc, 3);
      setProgress(60);
      
      // If no text extracted (scanned PDF), use OCR
      if (extractedText.trim().length < 50) {
        setProgressText("PDF numérisé détecté - OCR en cours...");
        
        // OCR on first 2 pages
        const pagesToOcr = Math.min(2, pdfDoc.numPages);
        let ocrText = "";
        
        for (let i = 1; i <= pagesToOcr; i++) {
          setProgressText(`OCR page ${i}/${pagesToOcr}...`);
          const page = await pdfDoc.getPage(i);
          const pageImage = await renderPageToImage(page, 1.5);
          const pageText = await runOcrOnImage(pageImage, ocrLanguage);
          ocrText += pageText + "\n";
          setProgress(60 + (i / pagesToOcr) * 30);
        }
        
        extractedText = ocrText;
      }
      
      setProgress(90);
      setProgressText("Analyse des métadonnées...");
      
      // Extract metadata from text
      const metadata = extractMetadataFromText(extractedText, pdfInfo?.info);
      
      const finalData: Partial<ExtractedData> = {
        ...metadata,
        cover_image_url: coverImageUrl,
        pages_count: pdfDoc.numPages,
        extracted_text: extractedText.substring(0, 1000),
      };
      
      setExtractedData(finalData);
      setProgress(100);
      setProgressText("Extraction terminée !");
      
      // Auto-fill form
      onDataExtracted(finalData);
      
      toast({ 
        title: "PDF traité avec succès", 
        description: `${pdfDoc.numPages} pages analysées, image de couverture extraite` 
      });
      
    } catch (err: any) {
      console.error("PDF processing error:", err);
      setError(err.message || "Erreur lors du traitement du PDF");
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearData = () => {
    setExtractedData(null);
    setCoverPreview(null);
    setPdfDocForPicker(null);
    setIsCoverPickerOpen(false);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-accent/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          <span className="font-medium">Importer depuis un PDF</span>
        </div>
        {extractedData && (
          <Button variant="ghost" size="sm" onClick={clearData}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Téléchargez un PDF pour extraire automatiquement la couverture, le titre, l'auteur et autres métadonnées via OCR.
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Langue OCR</Label>
          <Select value={ocrLanguage} onValueChange={setOcrLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr+ar">Français + Arabe</SelectItem>
              <SelectItem value="ar+fr">Arabe + Français</SelectItem>
              <SelectItem value="fr">Français uniquement</SelectItem>
              <SelectItem value="ar">Arabe uniquement</SelectItem>
              <SelectItem value="en">Anglais</SelectItem>
              <SelectItem value="lat">Latin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>&nbsp;</Label>
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isProcessing}
              onChange={handlePdfUpload}
            />
            <Button 
              type="button" 
              variant="outline" 
              disabled={isProcessing}
              className="w-full gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isProcessing ? "Traitement..." : "Sélectionner un PDF"}
            </Button>
          </div>
        </div>
      </div>
      
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <ScanText className="h-4 w-4 animate-pulse text-primary" />
            <span>{progressText}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      {/* Cover image preview */}
      {coverPreview && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Aperçu de la couverture
            </Label>

            {pdfDocForPicker && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isProcessing || isApplyingCover}
                onClick={() => setIsCoverPickerOpen((v) => !v)}
              >
                {isCoverPickerOpen ? "Fermer" : "Changer"}
              </Button>
            )}
          </div>

          <div className="relative w-32 h-44 rounded-lg overflow-hidden border-2 border-primary/30 bg-muted">
            <img
              src={coverPreview}
              alt="Couverture extraite"
              className="w-full h-full object-cover"
            />
            {(isProcessing || isApplyingCover) && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>

          {isCoverPickerOpen && pdfDocForPicker && (
            <PdfCoverPicker
              pdfDoc={pdfDocForPicker}
              maxPages={15}
              disabled={isProcessing || isApplyingCover}
              onPick={applyCoverFromPage}
            />
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {extractedData && !isProcessing && (
        <div className="space-y-3 p-4 border rounded-lg bg-green-500/10 border-green-500/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-700">Métadonnées extraites avec succès</span>
          </div>
          
          {/* Extracted metadata display */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            {extractedData.title && (
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">Titre FR</Badge>
                <span className="text-foreground">{extractedData.title}</span>
              </div>
            )}
            
            {extractedData.title_ar && (
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0 bg-amber-50 border-amber-200">العنوان AR</Badge>
                <span className="text-foreground" dir="rtl">{extractedData.title_ar}</span>
              </div>
            )}
            
            {extractedData.author && (
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">Auteur</Badge>
                <span className="text-foreground">{extractedData.author}</span>
              </div>
            )}
            
            {extractedData.date && (
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">Date</Badge>
                <span className="text-foreground">{extractedData.date}</span>
              </div>
            )}
            
            {extractedData.description && (
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">Description</Badge>
                <span className="text-foreground line-clamp-2">{extractedData.description}</span>
              </div>
            )}
          </div>
          
          {/* Summary badges */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-green-500/20">
            {extractedData.pages_count && (
              <Badge variant="secondary">{extractedData.pages_count} pages</Badge>
            )}
            {extractedData.cover_image_url && (
              <Badge variant="secondary" className="bg-green-600/20 text-green-700">
                <ImageIcon className="h-3 w-3 mr-1" />
                Couverture ✓
              </Badge>
            )}
            {extractedData.title_ar && (
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-700">
                Arabe détecté ✓
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}