import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Loader2,
  FileDown,
  FileText,
  ArrowRight,
  Link2,
  File,
  Check
} from "lucide-react";
import * as XLSX from 'xlsx';

interface MetadataRow {
  cote: string;
  titre: string;
  titre_ar?: string;
  auteur?: string;
  type_document?: string;
  langue?: string;
  annee_publication?: string;
  nombre_pages?: string;
  source_numerisation?: string;
  niveau_acces?: string;
  [key: string]: any;
}

interface ImportResult {
  cote: string;
  title: string;
  status: 'success' | 'error' | 'pending' | 'matched';
  message: string;
  documentId?: string;
}

interface FileMatch {
  file: File;
  cote: string;
  matched: boolean;
  metadataRow?: MetadataRow;
}

interface BulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function BulkImportModal({ open, onOpenChange, onSuccess }: BulkImportModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const metadataInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);
  
  // Step management
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // Step 1: Metadata
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [metadataRows, setMetadataRows] = useState<MetadataRow[]>([]);
  const [metadataPreview, setMetadataPreview] = useState<MetadataRow[]>([]);
  
  // Step 2: Documents
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [fileMatches, setFileMatches] = useState<FileMatch[]>([]);
  
  // Step 3: Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);

  const downloadTemplate = () => {
    const headers = [
      'cote',
      'titre',
      'titre_ar',
      'auteur',
      'type_document',
      'langue',
      'annee_publication',
      'nombre_pages',
      'source_numerisation',
      'qualite_numerisation',
      'themes',
      'collections',
      'niveau_acces',
      'telechargement_actif',
      'impression_active',
    ];

    const exampleRow = [
      'PHI-2024-001',
      'Introduction à la philosophie',
      'مقدمة في الفلسفة',
      'Jean Dupont',
      'livre',
      'fr',
      '2024',
      '250',
      'internal',
      'high',
      'philosophie;méthodologie',
      'patrimoine',
      'public',
      'true',
      'true',
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Métadonnées');
    
    ws['!cols'] = headers.map(() => ({ wch: 22 }));
    
    XLSX.writeFile(wb, 'template_import_masse_metadonnees.xlsx');
    
    toast({
      title: "Modèle téléchargé",
      description: "Le fichier Excel modèle a été téléchargé"
    });
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleMetadataFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier CSV ou Excel (.xlsx)",
        variant: "destructive"
      });
      return;
    }

    setMetadataFile(file);
    
    try {
      const data = await readExcelFile(file) as MetadataRow[];
      
      // Validate that 'cote' column exists
      const hasCote = data.length > 0 && data[0].cote !== undefined;
      if (!hasCote) {
        toast({
          title: "Colonne manquante",
          description: "La colonne 'cote' est obligatoire pour l'association des fichiers",
          variant: "destructive"
        });
        return;
      }
      
      setMetadataRows(data);
      setMetadataPreview(data.slice(0, 5));
      
      toast({
        title: "Fichier chargé",
        description: `${data.length} lignes de métadonnées détectées`
      });
    } catch (error) {
      console.error('Erreur lecture fichier:', error);
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire le fichier",
        variant: "destructive"
      });
    }
  };

  const handleDocumentFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter only PDF files
    const pdfFiles = files.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    
    if (pdfFiles.length !== files.length) {
      toast({
        title: "Attention",
        description: `${files.length - pdfFiles.length} fichier(s) non-PDF ont été ignorés`,
        variant: "destructive"
      });
    }

    setDocumentFiles(pdfFiles);
    
    // Match files with metadata based on cote (filename without extension)
    const matches: FileMatch[] = pdfFiles.map(file => {
      const fileNameWithoutExt = file.name.replace(/\.pdf$/i, '').trim();
      const matchedRow = metadataRows.find(row => {
        const cote = row.cote?.toString().trim();
        return cote === fileNameWithoutExt || 
               cote?.replace(/[-\s]/g, '') === fileNameWithoutExt.replace(/[-\s]/g, '');
      });
      
      return {
        file,
        cote: fileNameWithoutExt,
        matched: !!matchedRow,
        metadataRow: matchedRow
      };
    });

    setFileMatches(matches);
    
    const matchedCount = matches.filter(m => m.matched).length;
    toast({
      title: "Fichiers analysés",
      description: `${matchedCount}/${pdfFiles.length} fichiers associés aux métadonnées`
    });
  };

  const processImport = async () => {
    if (fileMatches.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setCurrentStep(3);

    const importResults: ImportResult[] = [];
    const totalFiles = fileMatches.length;

    for (let i = 0; i < fileMatches.length; i++) {
      const match = fileMatches[i];
      
      try {
        if (!match.matched || !match.metadataRow) {
          importResults.push({
            cote: match.cote,
            title: match.file.name,
            status: 'error',
            message: 'Aucune métadonnée correspondante trouvée'
          });
          continue;
        }

        const row = match.metadataRow;
        const cbnDocId = `CBN-${row.cote.replace(/[^a-zA-Z0-9]/g, '-')}`;

        // Upload PDF to storage
        const filePath = `documents/${cbnDocId}/${match.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('digital-library')
          .upload(filePath, match.file, { upsert: true });

        if (uploadError) {
          throw new Error(`Erreur upload: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('digital-library')
          .getPublicUrl(filePath);

        // Check if cbn_document exists
        const { data: existingCbn } = await supabase
          .from('cbn_documents')
          .select('id')
          .eq('cote', row.cote)
          .single();

        let finalCbnId = existingCbn?.id;

        if (!existingCbn) {
          // Create cbn_documents entry
          const { data: newCbn, error: cbnError } = await supabase
            .from('cbn_documents')
            .insert({
              id: cbnDocId,
              cote: row.cote,
              title: row.titre,
              title_ar: row.titre_ar || null,
              author: row.auteur || null,
              document_type: row.type_document || 'livre',
              publication_year: row.annee_publication ? parseInt(row.annee_publication) : null,
              is_digitized: true,
            })
            .select('id')
            .single();

          if (cbnError) throw cbnError;
          finalCbnId = newCbn?.id || cbnDocId;
        }

        // Insert into digital_library_documents
        const { error: docError } = await supabase
          .from('digital_library_documents')
          .insert({
            cbn_document_id: finalCbnId,
            title: row.titre,
            title_ar: row.titre_ar || null,
            author: row.auteur || null,
            document_type: row.type_document || 'livre',
            language: row.langue || null,
            publication_year: row.annee_publication ? parseInt(row.annee_publication) : null,
            pdf_url: urlData.publicUrl,
            pages_count: row.nombre_pages ? parseInt(row.nombre_pages) : 1,
            digitization_source: row.source_numerisation || 'internal',
            digitization_quality: row.qualite_numerisation || null,
            themes: row.themes ? row.themes.split(';').map((t: string) => t.trim()) : null,
            digital_collections: row.collections ? row.collections.split(';').map((c: string) => c.trim()) : null,
            access_level: row.niveau_acces || 'public',
            download_enabled: row.telechargement_actif !== 'false',
            print_enabled: row.impression_active !== 'false',
            publication_status: 'draft',
          });

        if (docError) throw docError;

        importResults.push({
          cote: row.cote,
          title: row.titre,
          status: 'success',
          message: 'Document importé avec succès',
          documentId: finalCbnId
        });

      } catch (error: any) {
        importResults.push({
          cote: match.cote,
          title: match.metadataRow?.titre || match.file.name,
          status: 'error',
          message: error.message || 'Erreur inconnue'
        });
      }

      setProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    setResults(importResults);
    
    const successCount = importResults.filter(r => r.status === 'success').length;
    const errorCount = importResults.filter(r => r.status === 'error').length;
    
    queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
    
    toast({
      title: "Import terminé",
      description: `${successCount} documents importés, ${errorCount} erreurs`,
      variant: errorCount > 0 ? "destructive" : "default"
    });

    if (successCount > 0) {
      onSuccess?.();
    }
    
    setIsProcessing(false);
  };

  const exportResultsReport = () => {
    if (results.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(results.map(r => ({
      'Cote': r.cote,
      'Titre': r.title,
      'Statut': r.status === 'success' ? 'Succès' : 'Erreur',
      'Message': r.message
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    XLSX.writeFile(wb, `rapport_import_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const resetModal = () => {
    setCurrentStep(1);
    setMetadataFile(null);
    setMetadataRows([]);
    setMetadataPreview([]);
    setDocumentFiles([]);
    setFileMatches([]);
    setResults([]);
    setProgress(0);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  const matchedCount = fileMatches.filter(m => m.matched).length;
  const unmatchedCount = fileMatches.filter(m => !m.matched).length;
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import en masse des documents
          </DialogTitle>
          <DialogDescription>
            Importez vos métadonnées Excel puis associez les fichiers PDF par numéro de cote
          </DialogDescription>
        </DialogHeader>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-2 py-4 border-b">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <FileSpreadsheet className="h-4 w-4" />
            <span className="text-sm font-medium">1. Métadonnées</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">2. Documents PDF</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">3. Résultats</span>
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          {/* Step 1: Metadata Excel */}
          {currentStep === 1 && (
            <div className="space-y-6 py-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  La colonne <strong>"cote"</strong> est obligatoire et doit correspondre exactement au nom des fichiers PDF (sans l'extension).
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Télécharger le modèle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={downloadTemplate} variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Modèle Excel
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Colonnes clés</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <div><strong>cote</strong> : Identifiant unique (= nom fichier)</div>
                    <div><strong>titre</strong> : Titre du document</div>
                    <div><strong>auteur</strong> : Auteur principal</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Importer le fichier Excel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => metadataInputRef.current?.click()}
                  >
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Cliquez pour sélectionner votre fichier Excel de métadonnées
                    </p>
                    <input
                      ref={metadataInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleMetadataFileChange}
                      className="hidden"
                    />
                    {metadataFile && (
                      <Badge variant="secondary" className="mt-2">
                        {metadataFile.name} - {metadataRows.length} lignes
                      </Badge>
                    )}
                  </div>

                  {metadataPreview.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Aperçu (5 premières lignes) :</p>
                      <ScrollArea className="h-40 border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cote</TableHead>
                              <TableHead>Titre</TableHead>
                              <TableHead>Auteur</TableHead>
                              <TableHead>Type</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {metadataPreview.map((row, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-mono text-sm">{row.cote || '-'}</TableCell>
                                <TableCell className="font-medium">{row.titre || '-'}</TableCell>
                                <TableCell>{row.auteur || '-'}</TableCell>
                                <TableCell>{row.type_document || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Documents Upload */}
          {currentStep === 2 && (
            <div className="space-y-6 py-4">
              <Alert>
                <Link2 className="h-4 w-4" />
                <AlertTitle>Association automatique</AlertTitle>
                <AlertDescription>
                  Les fichiers PDF seront associés aux métadonnées si leur nom correspond à la colonne "cote".
                  <br />Exemple : fichier <strong>PHI-2024-001.pdf</strong> → cote <strong>PHI-2024-001</strong>
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sélectionner les fichiers PDF</CardTitle>
                  <CardDescription>
                    Métadonnées chargées : {metadataRows.length} lignes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => documentsInputRef.current?.click()}
                  >
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Cliquez pour sélectionner vos fichiers PDF
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vous pouvez sélectionner plusieurs fichiers
                    </p>
                    <input
                      ref={documentsInputRef}
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleDocumentFilesChange}
                      className="hidden"
                    />
                    {documentFiles.length > 0 && (
                      <Badge variant="secondary" className="mt-2">
                        {documentFiles.length} fichier(s) sélectionné(s)
                      </Badge>
                    )}
                  </div>

                  {fileMatches.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {matchedCount} associé(s)
                        </Badge>
                        {unmatchedCount > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            {unmatchedCount} non associé(s)
                          </Badge>
                        )}
                      </div>

                      <ScrollArea className="h-60 border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fichier</TableHead>
                              <TableHead>Cote extraite</TableHead>
                              <TableHead>Titre associé</TableHead>
                              <TableHead>Statut</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fileMatches.map((match, idx) => (
                              <TableRow key={idx} className={match.matched ? '' : 'bg-destructive/5'}>
                                <TableCell className="font-mono text-sm">{match.file.name}</TableCell>
                                <TableCell className="font-mono">{match.cote}</TableCell>
                                <TableCell>{match.metadataRow?.titre || '-'}</TableCell>
                                <TableCell>
                                  {match.matched ? (
                                    <Badge variant="default" className="gap-1">
                                      <Check className="h-3 w-3" />
                                      Associé
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive">Non trouvé</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Results */}
          {currentStep === 3 && (
            <div className="space-y-6 py-4">
              {isProcessing ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                      <div>
                        <p className="font-medium">Import en cours...</p>
                        <p className="text-sm text-muted-foreground">
                          Traitement des fichiers et métadonnées
                        </p>
                      </div>
                      <Progress value={progress} className="w-full max-w-md mx-auto" />
                      <p className="text-sm">{progress}%</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                      <CardContent className="pt-6 text-center">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-2xl font-bold text-green-600">{successCount}</p>
                        <p className="text-sm text-muted-foreground">Succès</p>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                      <CardContent className="pt-6 text-center">
                        <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                        <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                        <p className="text-sm text-muted-foreground">Erreurs</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <FileDown className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Button variant="outline" size="sm" onClick={exportResultsReport}>
                          Exporter le rapport
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {results.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Détail des résultats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-60">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Cote</TableHead>
                                <TableHead>Titre</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Message</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {results.map((result, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-mono">{result.cote}</TableCell>
                                  <TableCell>{result.title}</TableCell>
                                  <TableCell>
                                    {result.status === 'success' ? (
                                      <Badge variant="default" className="bg-green-600">Succès</Badge>
                                    ) : (
                                      <Badge variant="destructive">Erreur</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm">{result.message}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          {currentStep === 1 && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button 
                onClick={() => setCurrentStep(2)} 
                disabled={metadataRows.length === 0}
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}
          
          {currentStep === 2 && (
            <>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Retour
              </Button>
              <Button 
                onClick={processImport} 
                disabled={matchedCount === 0}
              >
                <Upload className="h-4 w-4 mr-2" />
                Lancer l'import ({matchedCount} fichier(s))
              </Button>
            </>
          )}
          
          {currentStep === 3 && !isProcessing && (
            <>
              <Button variant="outline" onClick={resetModal}>
                Nouvel import
              </Button>
              <Button onClick={handleClose}>
                Fermer
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
