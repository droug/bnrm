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
      setProgressText("Extraction de la première page...");
      
      // Render first page as cover image
      const firstPage = await pdfDoc.getPage(1);
      const coverImage = await renderPageToImage(firstPage, 2.0);
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
