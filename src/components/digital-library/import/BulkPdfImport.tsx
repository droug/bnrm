import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Loader2,
  FileDown,
  ScanText,
  Trash2,
  Info
} from "lucide-react";
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

interface ImportResult {
  fileName: string;
  title: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  pagesCount?: number;
}

interface BulkPdfImportProps {
  onSuccess?: () => void;
}

export default function BulkPdfImport({ onSuccess }: BulkPdfImportProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [batchName, setBatchName] = useState<string>("");
  const [pdfFiles, setPdfFiles] = useState<File[]>([]); // PDF + images
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [results, setResults] = useState<ImportResult[]>([]);
  
  // OCR settings
  const [enableOcr, setEnableOcr] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState<string>('fra+ara');
  const [skipAlreadyOcr, setSkipAlreadyOcr] = useState(true);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pickedFiles = Array.from(e.target.files || []);
    if (pickedFiles.length === 0) return;

    // Reset input for future selections
    e.target.value = "";

    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/webp', 'image/gif', 'image/bmp',
      'application/epub+zip',
    ];
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.webp', '.gif', '.bmp', '.epub'];

    const validFiles = pickedFiles.filter(
      (f) => allowedTypes.includes(f.type) || allowedExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
    );

    if (validFiles.length !== pickedFiles.length) {
      toast({
        title: "Attention",
        description: `${pickedFiles.length - validFiles.length} fichier(s) non supporté(s) ont été ignorés. Formats acceptés : PDF, JPG, PNG, TIFF, WebP, GIF, BMP, EPUB`,
        variant: "destructive",
      });
    }

    // Merge with existing selection
    const merged = (() => {
      const byKey = new Map<string, File>();
      [...pdfFiles, ...validFiles].forEach((f) => {
        byKey.set(`${f.name}-${f.size}-${f.lastModified}`, f);
      });
      return Array.from(byKey.values());
    })();

    setPdfFiles(merged);
    setResults([]);

    toast({
      title: "Fichiers ajoutés",
      description: `${merged.length} fichier(s) sélectionné(s)`,
    });
  };

  const removeFile = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setPdfFiles([]);
    setResults([]);
  };

  const processImport = async () => {
    if (pdfFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    const importResults: ImportResult[] = [];

    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      const fileName = file.name;
      const cote = fileName.replace(/\.[^/.]+$/, ''); // Remove any extension
      const isPdf = file.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
      const fileExt = fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      
      setCurrentFile(fileName);
      setProgress(Math.round((i / pdfFiles.length) * 100));

      try {
        let pagesCount = 1;
        let pdfProxy: pdfjsLib.PDFDocumentProxy | null = null;

        if (isPdf) {
          // Read PDF to get page count
          const arrayBuffer = await file.arrayBuffer();
          pdfProxy = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          pagesCount = pdfProxy.numPages;
        }

        // Upload file to storage
        const storagePath = `documents/${Date.now()}-${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('digital-library')
          .upload(storagePath, file, {
            contentType: file.type || 'application/octet-stream',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('digital-library')
          .getPublicUrl(storagePath);

        const fileUrl = urlData?.publicUrl;

        // Create CBN document entry
        const { data: newCbn, error: cbnError } = await supabase
          .from('cbn_documents')
          .insert({
            cote: cote,
            title: cote,
            document_type: 'livre',
            is_digitized: true,
          })
          .select('id')
          .single();

        if (cbnError) throw cbnError;

        // Create digital library document with batch_name
        const insertData: any = {
            cbn_document_id: newCbn.id,
            title: cote,
            pdf_url: fileUrl,
            pages_count: pagesCount,
            file_format: isPdf ? 'PDF' : fileExt,
            digitization_source: 'internal',
            publication_status: 'draft',
            ocr_processed: false,
        };
        
        if (batchName.trim()) {
          insertData.batch_name = batchName.trim();
        }

        const { data: newDoc, error: docError } = await supabase
          .from('digital_library_documents')
          .insert(insertData)
          .select('id')
          .single();

        if (docError) throw docError;

        // Run OCR if enabled (only for PDFs)
        if (enableOcr && newDoc && isPdf && pdfProxy) {
          try {
            setCurrentFile(`${fileName} - OCR en cours...`);
            await processOcrForDocument(newDoc.id, pdfProxy, pagesCount);
            
            // Update ocr_processed flag
            await supabase
              .from('digital_library_documents')
              .update({ ocr_processed: true })
              .eq('id', newDoc.id);
          } catch (ocrError: any) {
            console.error('OCR error:', ocrError);
            // Continue without OCR, don't fail the import
          }
        }

        importResults.push({
          fileName,
          title: cote,
          status: 'success',
          message: `${pagesCount} pages importées${enableOcr ? ' + OCR' : ''}`,
          pagesCount,
        });

      } catch (error: any) {
        console.error(`Error importing ${fileName}:`, error);
        importResults.push({
          fileName,
          title: cote,
          status: 'error',
          message: error.message || 'Erreur inconnue',
        });
      }
    }

    setProgress(100);
    setResults(importResults);
    setIsProcessing(false);
    setCurrentFile("");

    const successCount = importResults.filter(r => r.status === 'success').length;
    const errorCount = importResults.filter(r => r.status === 'error').length;

    queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });

    toast({
      title: "Import terminé",
      description: `${successCount} document(s) importé(s), ${errorCount} erreur(s)`,
      variant: errorCount > 0 ? "destructive" : "default",
    });

    if (successCount > 0) {
      onSuccess?.();
    }
  };

  const processOcrForDocument = async (
    documentId: string,
    pdf: pdfjsLib.PDFDocumentProxy,
    pagesCount: number
  ) => {
    const maxPages = Math.min(pagesCount, 10); // Limit OCR to first 10 pages for performance

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const scale = 2; // Higher scale for better OCR
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) continue;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageData = canvas.toDataURL('image/png');

        // Run Tesseract OCR
        const { data: { text } } = await Tesseract.recognize(
          imageData,
          ocrLanguage,
          {
            logger: () => {}, // Suppress logging
          }
        );

        if (text && text.trim().length > 0) {
          // Save OCR text to digital_library_pages
          await supabase
            .from('digital_library_pages')
            .upsert({
              document_id: documentId,
              page_number: pageNum,
              ocr_text: text.trim(),
              ocr_language: ocrLanguage,
            }, {
              onConflict: 'document_id,page_number',
            });
        }

        canvas.remove();
      } catch (pageError) {
        console.error(`OCR error page ${pageNum}:`, pageError);
      }
    }
  };

  const exportResultsReport = () => {
    if (results.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(results.map(r => ({
      'Fichier': r.fileName,
      'Titre': r.title,
      'Statut': r.status === 'success' ? 'Succès' : 'Erreur',
      'Pages': r.pagesCount || '-',
      'Message': r.message,
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    XLSX.writeFile(wb, `rapport_import_documents_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalPages = results.reduce((sum, r) => sum + (r.pagesCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Batch Name */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5" />
            Titre du lot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="batch-name">Nom du lot (utilisé pour le Multi-OCR et les restrictions par lot)</Label>
            <input
              id="batch-name"
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="Ex: Manuscrits arabes - Collection 2025"
              className="flex h-11 w-full rounded-lg border border-input bg-white px-4 py-2.5 text-[15px] font-normal transition-all duration-200 text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary hover:border-primary/40 shadow-sm"
            />
            <p className="text-xs text-muted-foreground">
              Ce nom sera attribué à tous les documents importés dans ce lot. Il permettra de les retrouver facilement dans les onglets Multi-OCR et Restrictions par lot.
            </p>
          </div>
        </CardContent>
      </Card>
      {/* OCR Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ScanText className="h-5 w-5" />
            Options OCR (Reconnaissance de texte)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-ocr">Activer l'OCR automatique</Label>
              <p className="text-xs text-muted-foreground">
                Extraire le texte des 10 premières pages pour la recherche
              </p>
            </div>
            <Switch
              id="enable-ocr"
              checked={enableOcr}
              onCheckedChange={setEnableOcr}
            />
          </div>

          {enableOcr && (
            <div className="space-y-2">
              <Label>Langues de reconnaissance</Label>
              <Select value={ocrLanguage} onValueChange={setOcrLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fra">Français</SelectItem>
                  <SelectItem value="ara">Arabe</SelectItem>
                  <SelectItem value="eng">Anglais</SelectItem>
                  <SelectItem value="lat">Latin</SelectItem>
                  <SelectItem value="fra+ara">Français + Arabe</SelectItem>
                  <SelectItem value="fra+eng">Français + Anglais</SelectItem>
                  <SelectItem value="ara+eng">Arabe + Anglais</SelectItem>
                  <SelectItem value="fra+ara+eng">Français + Arabe + Anglais</SelectItem>
                </SelectContent>
              </Select>
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700 text-xs">
                  L'OCR ralentit considérablement l'import. Vous pouvez l'exécuter séparément via l'onglet "Indexation OCR".
                </AlertDescription>
              </Alert>
              
              {/* Option to skip already OCR'd documents */}
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="skip-ocr"
                  checked={skipAlreadyOcr}
                  onCheckedChange={setSkipAlreadyOcr}
                />
                <Label htmlFor="skip-ocr" className="text-sm">
                  Ignorer les documents déjà OCRisés
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sélectionner les fichiers (PDF, Images, EPUB)</CardTitle>
          <CardDescription>
            Le nom du fichier (sans extension) sera utilisé comme cote et titre provisoire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Cliquez pour sélectionner vos fichiers (PDF, JPG, PNG, TIFF, EPUB...)
            </p>
            <p className="text-xs text-muted-foreground">Sélection multiple autorisée</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif,.webp,.gif,.bmp,.epub"
              multiple
              onChange={handleFilesChange}
              className="hidden"
            />
            {pdfFiles.length > 0 && (
              <Badge variant="secondary" className="mt-2">
                {pdfFiles.length} fichier(s) sélectionné(s)
              </Badge>
            )}
          </div>

          {/* File List */}
          {pdfFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Fichiers à importer :</p>
                <Button variant="ghost" size="sm" onClick={clearAllFiles}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Tout effacer
                </Button>
              </div>
              <ScrollArea className="h-48 border rounded-md p-2">
                <div className="space-y-1">
                  {pdfFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 text-sm p-2 hover:bg-muted rounded">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-mono truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(idx)}
                        className="shrink-0"
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">{currentFile || "Import en cours..."}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <Button
            onClick={processImport}
            disabled={pdfFiles.length === 0 || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importer {pdfFiles.length} fichier(s)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Résultats de l'import</CardTitle>
              <CardDescription>
                {successCount} succès ({totalPages} pages), {errorCount} erreurs
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportResultsReport}>
              <FileDown className="h-4 w-4 mr-2" />
              Exporter le rapport
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fichier</TableHead>
                    <TableHead className="w-20">Pages</TableHead>
                    <TableHead className="w-24">Statut</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-sm max-w-xs truncate">
                        {result.fileName}
                      </TableCell>
                      <TableCell>{result.pagesCount || '-'}</TableCell>
                      <TableCell>
                        {result.status === 'success' ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Erreur
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {result.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Les fichiers sont uploadés dans le bucket "digital-library". Le nom du fichier (sans extension) est utilisé comme cote et titre. 
          Vous pouvez modifier les métadonnées après l'import via la gestion des documents.
        </AlertDescription>
      </Alert>
    </div>
  );
}
