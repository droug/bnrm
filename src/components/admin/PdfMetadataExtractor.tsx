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
  Upload
} from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import Tesseract from 'tesseract.js';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  'ber': 'ber_proc',
  'fr+ar': 'fra+ara',
  'ar+fr': 'ara+fra',
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
    
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  // Extract embedded images from PDF page
  const extractImagesFromPage = async (page: any): Promise<string[]> => {
    const images: string[] = [];
    
    try {
      const operatorList = await page.getOperatorList();
      const resources = await page.objs;
      
      // Look for image operators
      for (let i = 0; i < operatorList.fnArray.length; i++) {
        const op = operatorList.fnArray[i];
        // OPS.paintImageXObject = 85, OPS.paintJpegXObject = 82
        if (op === 85 || op === 82) {
          const imageName = operatorList.argsArray[i][0];
          try {
            const imgData = await page.objs.get(imageName);
            if (imgData && imgData.data) {
              // Convert image data to canvas
              const canvas = document.createElement('canvas');
              canvas.width = imgData.width;
              canvas.height = imgData.height;
              const ctx = canvas.getContext('2d')!;
              
              // Create ImageData from the raw data
              const imageData = ctx.createImageData(imgData.width, imgData.height);
              
              // Handle different color formats
              if (imgData.data.length === imgData.width * imgData.height * 4) {
                // RGBA format
                imageData.data.set(imgData.data);
              } else if (imgData.data.length === imgData.width * imgData.height * 3) {
                // RGB format - convert to RGBA
                for (let j = 0, k = 0; j < imgData.data.length; j += 3, k += 4) {
                  imageData.data[k] = imgData.data[j];
                  imageData.data[k + 1] = imgData.data[j + 1];
                  imageData.data[k + 2] = imgData.data[j + 2];
                  imageData.data[k + 3] = 255;
                }
              } else {
                continue; // Skip unsupported format
              }
              
              ctx.putImageData(imageData, 0, 0);
              
              // Only consider images of reasonable size (likely cover images)
              const minSize = 100;
              const minArea = 10000;
              if (imgData.width >= minSize && imgData.height >= minSize && 
                  (imgData.width * imgData.height) >= minArea) {
                images.push(canvas.toDataURL('image/jpeg', 0.9));
              }
            }
          } catch (imgErr) {
            // Skip this image if extraction fails
            console.log("Could not extract image:", imageName);
          }
        }
      }
    } catch (err) {
      console.log("Image extraction from page failed:", err);
    }
    
    return images;
  };

  // Get the best cover image (prefer embedded image, fallback to page render)
  const extractCoverImage = async (pdfDoc: any): Promise<string> => {
    const firstPage = await pdfDoc.getPage(1);
    
    // First try to extract embedded images from first page
    setProgressText("Recherche d'images intégrées...");
    const embeddedImages = await extractImagesFromPage(firstPage);
    
    if (embeddedImages.length > 0) {
      // Find the largest image (likely the cover)
      let largestImage = embeddedImages[0];
      let maxArea = 0;
      
      for (const imgData of embeddedImages) {
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => {
            const area = img.width * img.height;
            if (area > maxArea) {
              maxArea = area;
              largestImage = imgData;
            }
            resolve();
          };
          img.onerror = () => resolve();
          img.src = imgData;
        });
      }
      
      setProgressText("Image de couverture détectée !");
      return largestImage;
    }
    
    // Fallback: render the first page as cover
    setProgressText("Rendu de la première page comme couverture...");
    return await renderPageToImage(firstPage, 2.0);
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
    
    try {
      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      setProgress(10);
      
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pdfInfo = await pdfDoc.getMetadata();
      setProgress(20);
      setProgressText("Extraction de l'image de couverture...");
      
      // Extract the best cover image (embedded or rendered)
      const coverImage = await extractCoverImage(pdfDoc);
      setProgress(40);
      setProgressText("Téléchargement de l'image de couverture...");
      
      // Upload cover image
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
        description: `${pdfDoc.numPages} pages analysées, métadonnées extraites` 
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

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-accent/20">
      <div className="flex items-center gap-2 text-primary">
        <FileText className="h-5 w-5" />
        <span className="font-medium">Importer depuis un PDF</span>
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
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {extractedData && !isProcessing && (
        <Alert className="bg-green-500/10 border-green-500/30">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Données extraites</AlertTitle>
          <AlertDescription>
            <div className="mt-2 flex flex-wrap gap-2">
              {extractedData.title && <Badge variant="outline">Titre: {extractedData.title.substring(0, 30)}...</Badge>}
              {extractedData.author && <Badge variant="outline">Auteur: {extractedData.author}</Badge>}
              {extractedData.pages_count && <Badge variant="outline">{extractedData.pages_count} pages</Badge>}
              {extractedData.cover_image_url && (
                <div className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  <span className="text-xs">Image de couverture extraite</span>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
