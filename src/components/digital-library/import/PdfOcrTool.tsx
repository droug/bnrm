import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUp, Loader2, FileText, CheckCircle2, AlertCircle, Download, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Tesseract from 'tesseract.js';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface PageOcrResult {
  pageNumber: number;
  text: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  confidence?: number;
}

interface PdfOcrToolProps {
  /** Si fourni, le document sera pré-sélectionné et le dropdown sera masqué */
  preSelectedDocumentId?: string;
  /** Titre du document pré-sélectionné (pour affichage) */
  preSelectedDocumentTitle?: string;
}

// Map language codes to Tesseract language codes
const TESSERACT_LANG_MAP: Record<string, string> = {
  'ar': 'ara',
  'fr': 'fra',
  'en': 'eng',
  'lat': 'lat',
  'mixed': 'ara+fra+eng'
};

export default function PdfOcrTool({ preSelectedDocumentId, preSelectedDocumentTitle }: PdfOcrToolProps = {}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>("ar");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPageProgress, setCurrentPageProgress] = useState(0);
  const [pageResults, setPageResults] = useState<PageOcrResult[]>([]);
  // Use pre-selected document ID if provided
  const effectiveDocumentId = preSelectedDocumentId || "";

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setPageResults([]);
      setProgress(0);
      setCurrentPageProgress(0);
    } else {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier PDF",
        variant: "destructive"
      });
    }
  };

  // Convert PDF page to image using canvas
  const convertPdfPageToImage = async (pdfDoc: any, pageNum: number): Promise<string> => {
    const page = await pdfDoc.getPage(pageNum);
    const scale = 2.5; // Higher scale for better OCR accuracy
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    return canvas.toDataURL('image/png');
  };

  // Perform OCR using Tesseract.js (local, open-source)
  const performLocalOcr = async (imageData: string, lang: string): Promise<{ text: string; confidence: number }> => {
    const tesseractLang = TESSERACT_LANG_MAP[lang] || 'eng';
    
    const result = await Tesseract.recognize(
      imageData,
      tesseractLang,
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setCurrentPageProgress(Math.round(m.progress * 100));
          }
        }
      }
    );
    
    return {
      text: result.data.text.trim(),
      confidence: result.data.confidence
    };
  };

  // Process PDF with OCR
  const processPdf = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setCurrentPageProgress(0);
    setPageResults([]);

    try {
      // Dynamically import PDF.js
      const pdfjsLib = await import('pdfjs-dist');

      // Configure worker (bundled by Vite) to avoid CDN/CORS issues
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

      // Load PDF
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      // Initialize page results
      const initialResults: PageOcrResult[] = Array.from({ length: numPages }, (_, i) => ({
        pageNumber: i + 1,
        text: '',
        status: 'pending'
      }));
      setPageResults(initialResults);

      toast({
        title: "OCR local en cours",
        description: `Utilisation de Tesseract.js (open-source) - ${numPages} pages à traiter`,
      });

      // Process each page
      for (let i = 1; i <= numPages; i++) {
        setPageResults(prev => prev.map(r => 
          r.pageNumber === i ? { ...r, status: 'processing' } : r
        ));
        setCurrentPageProgress(0);

        try {
          // Convert page to image
          const imageData = await convertPdfPageToImage(pdfDoc, i);

          // Perform local OCR with Tesseract.js
          const { text, confidence } = await performLocalOcr(imageData, language);

          setPageResults(prev => prev.map(r => 
            r.pageNumber === i ? { 
              ...r, 
              text: text || '', 
              status: 'success',
              confidence: Math.round(confidence)
            } : r
          ));

        } catch (pageError: any) {
          console.error(`Error processing page ${i}:`, pageError);
          setPageResults(prev => prev.map(r => 
            r.pageNumber === i ? { ...r, status: 'error', error: pageError.message } : r
          ));
        }

        setProgress(Math.round((i / numPages) * 100));
      }

      toast({
        title: "OCR terminé",
        description: `${numPages} pages traitées avec Tesseract.js (local)`
      });

    } catch (error: any) {
      console.error('PDF processing error:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Save OCR results to database
  const saveToDatabase = async () => {
    if (pageResults.length === 0) {
      toast({
        title: "Erreur",
        description: "Effectuez l'OCR d'abord",
        variant: "destructive"
      });
      return;
    }

    try {
      const successPages = pageResults.filter(r => r.status === 'success' && r.text);
      
      // If no document selected, create a new one based on the filename
      let documentId = effectiveDocumentId;
      
      if (!documentId && selectedFile) {
        // Create new document from filename
        const fileName = selectedFile.name.replace('.pdf', '').replace(/_/g, ' ');
        
        // First create a cbn_documents record (required for digital_library_documents)
        const { data: cbnDoc, error: cbnError } = await supabase
          .from('cbn_documents')
          .insert({
            title: fileName,
            cote: `OCR-${Date.now()}`,
            document_type: 'periodique'
          })
          .select('id')
          .single();
        
        if (cbnError) throw cbnError;
        
        // Then create the digital_library_documents record
        const { data: newDoc, error: createError } = await supabase
          .from('digital_library_documents')
          .insert({
            title: fileName,
            cbn_document_id: cbnDoc.id,
            document_type: 'periodique',
            pages_count: pageResults.length
          })
          .select('id')
          .single();
        
        if (createError) throw createError;
        documentId = newDoc.id;
        
        toast({
          title: "Document créé",
          description: `Nouveau document "${fileName}" créé automatiquement`
        });
      }
      
      if (!documentId) {
        toast({
          title: "Erreur",
          description: "Sélectionnez un document ou chargez un fichier PDF",
          variant: "destructive"
        });
        return;
      }
      
      for (const page of successPages) {
        // Check if page already exists
        const { data: existing } = await supabase
          .from('digital_library_pages')
          .select('id')
          .eq('document_id', documentId)
          .eq('page_number', page.pageNumber)
          .maybeSingle();

        if (existing) {
          // Update existing page
          await supabase
            .from('digital_library_pages')
            .update({ ocr_text: page.text })
            .eq('id', existing.id);
        } else {
          // Insert new page
          await supabase
            .from('digital_library_pages')
            .insert({
              document_id: documentId,
              page_number: page.pageNumber,
              ocr_text: page.text
            });
        }
      }

      // Update document OCR status
      await supabase
        .from('digital_library_documents')
        .update({ ocr_processed: true })
        .eq('id', documentId);

      toast({
        title: "Enregistrement réussi",
        description: `${successPages.length} pages enregistrées dans la base de données`
      });

    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Erreur d'enregistrement",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Export OCR results as text file
  const exportAsText = () => {
    const successPages = pageResults.filter(r => r.status === 'success' && r.text);
    const text = successPages
      .map(p => `=== Page ${p.pageNumber} ===\n\n${p.text}`)
      .join('\n\n\n');
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr_${selectedFile?.name || 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy all text to clipboard
  const copyAllText = async () => {
    const successPages = pageResults.filter(r => r.status === 'success' && r.text);
    const text = successPages.map(p => p.text).join('\n\n');
    
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Texte copié dans le presse-papiers"
    });
  };

  const successCount = pageResults.filter(r => r.status === 'success').length;
  const errorCount = pageResults.filter(r => r.status === 'error').length;
  const avgConfidence = pageResults.filter(r => r.confidence).length > 0
    ? Math.round(pageResults.filter(r => r.confidence).reduce((sum, r) => sum + (r.confidence || 0), 0) / pageResults.filter(r => r.confidence).length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Document pré-sélectionné - Toujours visible en haut */}
      {preSelectedDocumentId && preSelectedDocumentTitle && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Document sélectionné pour l'OCR</p>
                <p className="text-base font-semibold text-primary">{preSelectedDocumentTitle}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            OCR automatique de PDF
            <Badge variant="secondary" className="ml-2">Tesseract.js - Local</Badge>
          </CardTitle>
          <CardDescription>
            {preSelectedDocumentId 
              ? `Uploadez le PDF correspondant au document "${preSelectedDocumentTitle}" pour extraire le texte`
              : "Uploadez un fichier PDF pour extraire automatiquement le texte de chaque page via OCR local"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Fichier PDF</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                disabled={isProcessing}
                className="flex-1"
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Fichier sélectionné: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} Mo)
              </p>
            )}
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label>Langue du document</Label>
            <Select value={language} onValueChange={setLanguage} disabled={isProcessing}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">Arabe</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">Anglais</SelectItem>
                <SelectItem value="lat">Latin</SelectItem>
                <SelectItem value="mixed">Mixte (AR+FR+EN)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Tesseract.js téléchargera les modèles de langue nécessaires automatiquement (~15 Mo par langue)
            </p>
          </div>

          {/* Process Button */}
          <Button 
            onClick={processPdf} 
            disabled={!selectedFile || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours... {progress}%
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Lancer l'OCR (Local)
              </>
            )}
          </Button>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progression globale</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Page en cours</span>
                <span>{currentPageProgress}%</span>
              </div>
              <Progress value={currentPageProgress} className="w-full h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {pageResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Résultats OCR</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle2 className="mr-1 h-3 w-3 text-green-600" />
                  {successCount} réussies
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="outline" className="bg-red-50">
                    <AlertCircle className="mr-1 h-3 w-3 text-red-600" />
                    {errorCount} erreurs
                  </Badge>
                )}
                {avgConfidence > 0 && (
                  <Badge variant="outline">
                    Confiance: {avgConfidence}%
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Actions - Bouton d'enregistrement toujours visible en premier */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/50">
              {/* Bouton d'enregistrement en premier, plus visible */}
              <Button 
                onClick={saveToDatabase} 
                disabled={(!effectiveDocumentId && !selectedFile) || successCount === 0}
                size="lg"
                className={(effectiveDocumentId || selectedFile) && successCount > 0 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : ""}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Enregistrer dans la BDD
              </Button>
              
              <div className="flex-1" />
              
              <Button variant="outline" size="sm" onClick={exportAsText} disabled={successCount === 0}>
                <Download className="mr-2 h-4 w-4" />
                Exporter en TXT
              </Button>
              <Button variant="outline" size="sm" onClick={copyAllText} disabled={successCount === 0}>
                <Copy className="mr-2 h-4 w-4" />
                Copier tout
              </Button>
            </div>

            {/* Page Results - Éditable */}
            <ScrollArea className="h-[400px] border rounded-md p-4">
              <div className="space-y-4">
                {pageResults.map((result, index) => (
                  <div key={result.pageNumber} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        result.status === 'success' ? 'default' :
                        result.status === 'error' ? 'destructive' :
                        result.status === 'processing' ? 'secondary' : 'outline'
                      }>
                        Page {result.pageNumber}
                      </Badge>
                      {result.status === 'processing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {result.status === 'success' && (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          {result.confidence && (
                            <span className="text-xs text-muted-foreground">
                              ({result.confidence}% confiance)
                            </span>
                          )}
                        </>
                      )}
                      {result.status === 'error' && (
                        <span className="text-sm text-red-600">{result.error}</span>
                      )}
                      <span className="flex-1" />
                      <span className="text-xs text-muted-foreground">
                        {result.text?.length || 0} caractères
                      </span>
                    </div>
                    {(result.text || result.status === 'success') && (
                      <Textarea 
                        value={result.text}
                        onChange={(e) => {
                          setPageResults(prev => prev.map((r, i) => 
                            i === index ? { ...r, text: e.target.value } : r
                          ));
                        }}
                        placeholder="Corrigez ou saisissez le texte OCR ici..."
                        className="min-h-[100px] text-sm font-mono"
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                      />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
