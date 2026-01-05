import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  BookOpen,
  Languages,
  Wand2,
  Image
} from "lucide-react";
import Tesseract from "tesseract.js";

interface OcrPage {
  page_number: number;
  ocr_text: string;
}

const TESSERACT_LANG_MAP: Record<string, string> = {
  ar: "ara",
  fr: "fra",
  en: "eng",
  mixed: "ara+fra+eng",
};

export default function OcrImportTool() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [ocrPages, setOcrPages] = useState<OcrPage[]>([{ page_number: 1, ocr_text: "" }]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bulkOcrText, setBulkOcrText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [ocrLanguage, setOcrLanguage] = useState<string>("ar");
  const [ocrProcessingStatus, setOcrProcessingStatus] = useState<string>("");

  // Récupérer les documents de la bibliothèque numérique
  const { data: documents, isLoading: loadingDocuments } = useQuery({
    queryKey: ['digital-library-documents-for-ocr', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('digital_library_documents')
        .select('id, title, title_ar, pages_count, ocr_processed')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,title_ar.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Récupérer les pages OCR existantes pour le document sélectionné
  const { data: existingPages, refetch: refetchPages } = useQuery({
    queryKey: ['ocr-pages', selectedDocumentId],
    queryFn: async () => {
      if (!selectedDocumentId) return [];
      
      const { data, error } = await supabase
        .from('digital_library_pages')
        .select('id, page_number, ocr_text')
        .eq('document_id', selectedDocumentId)
        .order('page_number', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDocumentId
  });

  const selectedDocument = documents?.find(d => d.id === selectedDocumentId);

  // Insérer les pages OCR
  const insertOcrPages = useMutation({
    mutationFn: async (pages: OcrPage[]) => {
      if (!selectedDocumentId) throw new Error("Aucun document sélectionné");
      
      // Supprimer les pages existantes si nécessaire
      const { error: deleteError } = await supabase
        .from('digital_library_pages')
        .delete()
        .eq('document_id', selectedDocumentId);
      
      if (deleteError) throw deleteError;
      
      // Insérer les nouvelles pages
      const insertData = pages
        .filter(p => p.ocr_text.trim())
        .map(p => ({
          document_id: selectedDocumentId,
          page_number: p.page_number,
          ocr_text: p.ocr_text.trim(),
        }));
      
      if (insertData.length > 0) {
        const { error: insertError } = await supabase
          .from('digital_library_pages')
          .insert(insertData);
        
        if (insertError) throw insertError;
      }
      
      // Mettre à jour le flag ocr_processed
      const { error: updateError } = await supabase
        .from('digital_library_documents')
        .update({ ocr_processed: insertData.length > 0 })
        .eq('id', selectedDocumentId);
      
      if (updateError) throw updateError;
      
      return insertData.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents-for-ocr'] });
      queryClient.invalidateQueries({ queryKey: ['ocr-pages', selectedDocumentId] });
      refetchPages();
      toast({ 
        title: "OCR indexé", 
        description: `${count} pages ont été indexées avec succès`
      });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const handleSelectDocument = (docId: string) => {
    setSelectedDocumentId(docId);
    const doc = documents?.find(d => d.id === docId);
    if (doc) {
      // Initialiser les pages vides basées sur pages_count
      const pages: OcrPage[] = [];
      for (let i = 1; i <= (doc.pages_count || 1); i++) {
        pages.push({ page_number: i, ocr_text: "" });
      }
      setOcrPages(pages);
    }
  };

  const handleAddPage = () => {
    const nextPageNumber = ocrPages.length > 0 
      ? Math.max(...ocrPages.map(p => p.page_number)) + 1 
      : 1;
    setOcrPages([...ocrPages, { page_number: nextPageNumber, ocr_text: "" }]);
  };

  const handleRemovePage = (index: number) => {
    setOcrPages(ocrPages.filter((_, i) => i !== index));
  };

  const handlePageTextChange = (index: number, text: string) => {
    const updated = [...ocrPages];
    updated[index].ocr_text = text;
    setOcrPages(updated);
  };

  const handlePageNumberChange = (index: number, pageNum: number) => {
    const updated = [...ocrPages];
    updated[index].page_number = pageNum;
    setOcrPages(updated);
  };

  const handleBulkOcrImport = () => {
    // Parser le texte en masse : on attend un format 
    // "--- PAGE 1 ---\nTexte page 1\n--- PAGE 2 ---\nTexte page 2..."
    const pageRegex = /---\s*PAGE\s*(\d+)\s*---/gi;
    const parts = bulkOcrText.split(pageRegex);
    
    const pages: OcrPage[] = [];
    for (let i = 1; i < parts.length; i += 2) {
      const pageNum = parseInt(parts[i]);
      const text = parts[i + 1]?.trim() || "";
      if (text) {
        pages.push({ page_number: pageNum, ocr_text: text });
      }
    }
    
    if (pages.length === 0) {
      // Si pas de format détecté, tout considérer comme page 1
      if (bulkOcrText.trim()) {
        pages.push({ page_number: 1, ocr_text: bulkOcrText.trim() });
      }
    }
    
    if (pages.length > 0) {
      setOcrPages(pages);
      toast({
        title: "Texte parsé",
        description: `${pages.length} pages détectées`
      });
    } else {
      toast({
        title: "Aucune page détectée",
        description: "Utilisez le format '--- PAGE X ---' pour séparer les pages",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const pages: OcrPage[] = [];
      const fileArray = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const text = await file.text();
        
        // Extraire le numéro de page du nom de fichier (ex: page_001.txt, 1.txt, etc.)
        const match = file.name.match(/(\d+)/);
        const pageNum = match ? parseInt(match[1]) : i + 1;
        
        pages.push({ page_number: pageNum, ocr_text: text.trim() });
        setProgress(Math.round(((i + 1) / fileArray.length) * 100));
      }
      
      setOcrPages(pages.sort((a, b) => a.page_number - b.page_number));
      toast({
        title: "Fichiers chargés",
        description: `${pages.length} fichiers texte importés`
      });
    } catch (error: any) {
      toast({
        title: "Erreur de lecture",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // OCR automatique local avec Tesseract.js (open-source, sans API)
  const handleAutoOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setOcrProcessingStatus("Initialisation du moteur OCR local...");

    try {
      const pages: OcrPage[] = [];
      const fileArray = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));
      const tesseractLang = TESSERACT_LANG_MAP[ocrLanguage] ?? "eng";

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Extraire le numéro de page du nom de fichier
        const match = file.name.match(/(\d+)/);
        const pageNum = match ? parseInt(match[1]) : i + 1;

        setOcrProcessingStatus(`OCR local (Tesseract) : page ${pageNum}...`);

        // Convertir l'image en base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        try {
          let lastPct = -1;
          const result = await Tesseract.recognize(base64, tesseractLang, {
            logger: (m) => {
              if (m.status === "recognizing text") {
                const pct = Math.round((m.progress ?? 0) * 100);
                if (pct !== lastPct) {
                  lastPct = pct;
                  setOcrProcessingStatus(`OCR local (Tesseract) : page ${pageNum}... ${pct}%`);
                }
              }
            },
          });

          const text = result?.data?.text?.trim?.() ?? "";
          if (text) {
            pages.push({ page_number: pageNum, ocr_text: text });
          }
        } catch (ocrError: any) {
          console.error(`OCR local failed for page ${pageNum}:`, ocrError);
          toast({
            title: `Erreur OCR page ${pageNum}`,
            description: ocrError?.message ?? "Erreur inconnue",
            variant: "destructive",
          });
        }

        setProgress(Math.round(((i + 1) / fileArray.length) * 100));
      }

      if (pages.length > 0) {
        setOcrPages(pages.sort((a, b) => a.page_number - b.page_number));
        toast({
          title: "OCR terminé",
          description: `${pages.length} pages traitées avec succès (OCR local)`
        });
      } else {
        toast({
          title: "Aucun texte extrait",
          description: "L'OCR local n'a pas pu extraire de texte des images",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Auto OCR error:', error);
      toast({
        title: "Erreur OCR",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setOcrProcessingStatus("");
      // Reset file input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleSaveOcr = async () => {
    const validPages = ocrPages.filter(p => p.ocr_text.trim());
    if (validPages.length === 0) {
      toast({
        title: "Aucun texte",
        description: "Veuillez saisir du texte OCR pour au moins une page",
        variant: "destructive"
      });
      return;
    }
    
    await insertOcrPages.mutateAsync(validPages);
  };

  return (
    <div className="space-y-6">
      {/* Sélection du document */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sélectionner un document
          </CardTitle>
          <CardDescription>
            Choisissez le document pour lequel indexer le texte OCR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          {loadingDocuments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ScrollArea className="h-48 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead className="w-20">Pages</TableHead>
                    <TableHead className="w-24">OCR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents?.map((doc) => (
                    <TableRow 
                      key={doc.id}
                      className={`cursor-pointer ${selectedDocumentId === doc.id ? 'bg-muted' : ''}`}
                      onClick={() => handleSelectDocument(doc.id)}
                    >
                      <TableCell>
                        <input
                          type="radio"
                          checked={selectedDocumentId === doc.id}
                          onChange={() => handleSelectDocument(doc.id)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {doc.title}
                        {doc.title_ar && (
                          <span className="block text-sm text-muted-foreground" dir="rtl">
                            {doc.title_ar}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{doc.pages_count || '-'}</TableCell>
                      <TableCell>
                        {doc.ocr_processed ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Oui
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Non</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!documents || documents.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Aucun document trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
          
          {selectedDocument && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>Document sélectionné</AlertTitle>
              <AlertDescription>
                <strong>{selectedDocument.title}</strong> - {selectedDocument.pages_count || 0} pages
                {existingPages && existingPages.length > 0 && (
                  <span className="block text-sm mt-1">
                    ⚠️ {existingPages.length} pages OCR existantes (seront remplacées)
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Import OCR */}
      {selectedDocumentId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Indexation OCR</CardTitle>
            <CardDescription>
              Importez le texte OCR page par page ou en masse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="auto" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="auto">
                  <Wand2 className="h-4 w-4 mr-1" />
                  OCR Auto
                </TabsTrigger>
                <TabsTrigger value="manual">Saisie manuelle</TabsTrigger>
                <TabsTrigger value="bulk">Texte en masse</TabsTrigger>
                <TabsTrigger value="files">Fichiers texte</TabsTrigger>
              </TabsList>
              
              <TabsContent value="auto" className="space-y-4">
                <Alert className="bg-primary/5 border-primary/20">
                  <Wand2 className="h-4 w-4 text-primary" />
                  <AlertTitle>OCR automatique (local) - Tesseract.js</AlertTitle>
                  <AlertDescription>
                    OCR open-source exécuté dans votre navigateur (sans clé API). Plus lent selon votre machine.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Langue principale</Label>
                    <Select value={ocrLanguage} onValueChange={setOcrLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">
                          <span className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            Arabe (العربية)
                          </span>
                        </SelectItem>
                        <SelectItem value="fr">
                          <span className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            Français
                          </span>
                        </SelectItem>
                        <SelectItem value="mixed">
                          <span className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            Mixte (Arabe + Français)
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Image className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Cliquez pour sélectionner des images</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formats supportés : JPG, PNG, WEBP, TIFF
                  </p>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAutoOcrUpload}
                    className="hidden"
                  />
                </div>
                
                {isProcessing && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Traitement OCR en cours...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                    {ocrProcessingStatus && (
                      <p className="text-xs text-muted-foreground">{ocrProcessingStatus}</p>
                    )}
                  </div>
                )}
                
                {ocrPages.some(p => p.ocr_text.trim()) && !isProcessing && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">OCR terminé</AlertTitle>
                    <AlertDescription className="text-green-700">
                      {ocrPages.filter(p => p.ocr_text.trim()).length} pages ont été traitées avec succès.
                      Vérifiez les résultats dans l'onglet "Saisie manuelle" puis cliquez sur "Indexer".
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              <TabsContent value="manual" className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Saisissez le texte OCR pour chaque page
                  </p>
                  <Button size="sm" variant="outline" onClick={handleAddPage}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter une page
                  </Button>
                </div>
                
                <ScrollArea className="h-96 pr-4">
                  <div className="space-y-4">
                    {ocrPages.map((page, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Label>Page</Label>
                            <Input
                              type="number"
                              min={1}
                              value={page.page_number}
                              onChange={(e) => handlePageNumberChange(index, parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                          </div>
                          {ocrPages.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemovePage(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        <Textarea
                          placeholder="Collez ici le texte OCR de cette page..."
                          value={page.ocr_text}
                          onChange={(e) => handlePageTextChange(index, e.target.value)}
                          rows={4}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {page.ocr_text.length} caractères
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="bulk" className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Format attendu</AlertTitle>
                  <AlertDescription>
                    Utilisez <code>--- PAGE X ---</code> pour séparer les pages.
                    <br />
                    Exemple : <code>--- PAGE 1 ---</code> suivi du texte de la page 1
                  </AlertDescription>
                </Alert>
                
                <Textarea
                  placeholder={`--- PAGE 1 ---\nTexte de la première page...\n\n--- PAGE 2 ---\nTexte de la deuxième page...`}
                  value={bulkOcrText}
                  onChange={(e) => setBulkOcrText(e.target.value)}
                  rows={12}
                />
                
                <Button onClick={handleBulkOcrImport} variant="secondary">
                  Parser le texte
                </Button>
              </TabsContent>
              
              <TabsContent value="files" className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Fichiers texte</AlertTitle>
                  <AlertDescription>
                    Uploadez des fichiers .txt numérotés (ex: page_001.txt, page_002.txt).
                    Le numéro de page sera extrait du nom de fichier.
                  </AlertDescription>
                </Alert>
                
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Cliquez pour sélectionner des fichiers .txt
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-center text-muted-foreground">
                      Chargement des fichiers... {progress}%
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Résumé et action */}
            <div className="mt-6 pt-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {ocrPages.filter(p => p.ocr_text.trim()).length} pages avec texte OCR
              </div>
              <Button 
                onClick={handleSaveOcr}
                disabled={insertOcrPages.isPending || !ocrPages.some(p => p.ocr_text.trim())}
              >
                {insertOcrPages.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Indexation...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Indexer le texte OCR
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!selectedDocumentId && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Aucun document sélectionné</AlertTitle>
          <AlertDescription>
            Sélectionnez un document ci-dessus pour commencer l'indexation OCR.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
