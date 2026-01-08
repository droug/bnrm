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
  Link2,
  Check,
  Info
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
  
  // Mode: 'metadata' | 'documents' | 'combined'
  const [importMode, setImportMode] = useState<'metadata' | 'documents' | 'combined'>('combined');
  
  // Metadata state
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [metadataRows, setMetadataRows] = useState<MetadataRow[]>([]);
  const [metadataPreview, setMetadataPreview] = useState<MetadataRow[]>([]);
  
  // Documents state
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [fileMatches, setFileMatches] = useState<FileMatch[]>([]);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);

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
      setMetadataRows(data);
      setMetadataPreview(data.slice(0, 5));
      
      // Re-match files if already loaded
      if (documentFiles.length > 0) {
        matchFilesWithMetadata(documentFiles, data);
      }
      
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

  const matchFilesWithMetadata = (files: File[], metadata: MetadataRow[]) => {
    const matches: FileMatch[] = files.map(file => {
      const fileNameWithoutExt = file.name.replace(/\.pdf$/i, '').trim();
      const matchedRow = metadata.find(row => {
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
    return matches;
  };

  const handleDocumentFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const pdfFiles = files.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    
    if (pdfFiles.length !== files.length) {
      toast({
        title: "Attention",
        description: `${files.length - pdfFiles.length} fichier(s) non-PDF ont été ignorés`,
        variant: "destructive"
      });
    }

    setDocumentFiles(pdfFiles);
    
    // Match with metadata if available
    const matches = matchFilesWithMetadata(pdfFiles, metadataRows);
    
    const matchedCount = matches.filter(m => m.matched).length;
    if (metadataRows.length > 0) {
      toast({
        title: "Fichiers analysés",
        description: `${matchedCount}/${pdfFiles.length} fichiers associés aux métadonnées`
      });
    } else {
      toast({
        title: "Fichiers chargés",
        description: `${pdfFiles.length} fichier(s) PDF sélectionné(s)`
      });
    }
  };

  // Import metadata only (without PDF files)
  const processMetadataOnlyImport = async () => {
    if (metadataRows.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setShowResults(true);

    const importResults: ImportResult[] = [];
    const total = metadataRows.length;

    for (let i = 0; i < metadataRows.length; i++) {
      const row = metadataRows[i];
      
      try {
        if (!row.cote || !row.titre) {
          importResults.push({
            cote: row.cote || '(vide)',
            title: row.titre || '(sans titre)',
            status: 'error',
            message: 'Cote ou titre manquant'
          });
          continue;
        }

        const cbnDocId = `CBN-${row.cote.replace(/[^a-zA-Z0-9]/g, '-')}`;

        // Check if already exists
        const { data: existingCbn } = await supabase
          .from('cbn_documents')
          .select('id')
          .eq('cote', row.cote)
          .single();

        let finalCbnId = existingCbn?.id;

        if (!existingCbn) {
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
              is_digitized: false,
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
          message: 'Métadonnées importées (sans PDF)',
          documentId: finalCbnId
        });

      } catch (error: any) {
        importResults.push({
          cote: row.cote || '(vide)',
          title: row.titre || '(sans titre)',
          status: 'error',
          message: error.message || 'Erreur inconnue'
        });
      }

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    finishImport(importResults);
  };

  // Import PDF files only (without metadata Excel)
  const processDocumentsOnlyImport = async () => {
    if (documentFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setShowResults(true);

    const importResults: ImportResult[] = [];
    const total = documentFiles.length;

    for (let i = 0; i < documentFiles.length; i++) {
      const file = documentFiles[i];
      const cote = file.name.replace(/\.pdf$/i, '').trim();
      
      try {
        const cbnDocId = `CBN-${cote.replace(/[^a-zA-Z0-9]/g, '-')}`;

        // Upload PDF to storage
        const filePath = `documents/${cbnDocId}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('digital-library')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          throw new Error(`Erreur upload: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('digital-library')
          .getPublicUrl(filePath);

        // Check if cbn_document exists
        const { data: existingCbn } = await supabase
          .from('cbn_documents')
          .select('id')
          .eq('cote', cote)
          .single();

        let finalCbnId = existingCbn?.id;

        if (!existingCbn) {
          const { data: newCbn, error: cbnError } = await supabase
            .from('cbn_documents')
            .insert({
              id: cbnDocId,
              cote: cote,
              title: cote, // Use cote as title when no metadata
              document_type: 'livre',
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
            title: cote,
            pdf_url: urlData.publicUrl,
            pages_count: 1,
            digitization_source: 'internal',
            publication_status: 'draft',
          });

        if (docError) throw docError;

        importResults.push({
          cote: cote,
          title: file.name,
          status: 'success',
          message: 'PDF importé (métadonnées à compléter)',
          documentId: finalCbnId
        });

      } catch (error: any) {
        importResults.push({
          cote: cote,
          title: file.name,
          status: 'error',
          message: error.message || 'Erreur inconnue'
        });
      }

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    finishImport(importResults);
  };

  // Import both metadata and PDF files
  const processCombinedImport = async () => {
    if (fileMatches.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setShowResults(true);

    const importResults: ImportResult[] = [];
    const total = fileMatches.length;

    for (let i = 0; i < fileMatches.length; i++) {
      const match = fileMatches[i];
      
      try {
        const row = match.metadataRow;
        const cote = row?.cote || match.cote;
        const cbnDocId = `CBN-${cote.replace(/[^a-zA-Z0-9]/g, '-')}`;

        // Upload PDF to storage
        const filePath = `documents/${cbnDocId}/${match.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('digital-library')
          .upload(filePath, match.file, { upsert: true });

        if (uploadError) {
          throw new Error(`Erreur upload: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('digital-library')
          .getPublicUrl(filePath);

        // Check if cbn_document exists
        const { data: existingCbn } = await supabase
          .from('cbn_documents')
          .select('id')
          .eq('cote', cote)
          .single();

        let finalCbnId = existingCbn?.id;

        if (!existingCbn) {
          const { data: newCbn, error: cbnError } = await supabase
            .from('cbn_documents')
            .insert({
              id: cbnDocId,
              cote: cote,
              title: row?.titre || cote,
              title_ar: row?.titre_ar || null,
              author: row?.auteur || null,
              document_type: row?.type_document || 'livre',
              publication_year: row?.annee_publication ? parseInt(row.annee_publication) : null,
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
            title: row?.titre || cote,
            title_ar: row?.titre_ar || null,
            author: row?.auteur || null,
            document_type: row?.type_document || 'livre',
            language: row?.langue || null,
            publication_year: row?.annee_publication ? parseInt(row.annee_publication) : null,
            pdf_url: urlData.publicUrl,
            pages_count: row?.nombre_pages ? parseInt(row.nombre_pages) : 1,
            digitization_source: row?.source_numerisation || 'internal',
            digitization_quality: row?.qualite_numerisation || null,
            themes: row?.themes ? row.themes.split(';').map((t: string) => t.trim()) : null,
            digital_collections: row?.collections ? row.collections.split(';').map((c: string) => c.trim()) : null,
            access_level: row?.niveau_acces || 'public',
            download_enabled: row?.telechargement_actif !== 'false',
            print_enabled: row?.impression_active !== 'false',
            publication_status: 'draft',
          });

        if (docError) throw docError;

        importResults.push({
          cote: cote,
          title: row?.titre || match.file.name,
          status: 'success',
          message: match.matched ? 'Document complet importé' : 'PDF importé (sans métadonnées)',
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

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    finishImport(importResults);
  };

  const finishImport = (importResults: ImportResult[]) => {
    setResults(importResults);
    
    const successCount = importResults.filter(r => r.status === 'success').length;
    const errorCount = importResults.filter(r => r.status === 'error').length;
    
    queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
    
    toast({
      title: "Import terminé",
      description: `${successCount} élément(s) importé(s), ${errorCount} erreur(s)`,
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
    setImportMode('combined');
    setMetadataFile(null);
    setMetadataRows([]);
    setMetadataPreview([]);
    setDocumentFiles([]);
    setFileMatches([]);
    setResults([]);
    setProgress(0);
    setIsProcessing(false);
    setShowResults(false);
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  const matchedCount = fileMatches.filter(m => m.matched).length;
  const unmatchedCount = fileMatches.filter(m => !m.matched).length;
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  const canImportMetadataOnly = metadataRows.length > 0;
  const canImportDocumentsOnly = documentFiles.length > 0;
  const canImportCombined = documentFiles.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import en masse des documents
          </DialogTitle>
          <DialogDescription>
            Importez les métadonnées Excel et/ou les fichiers PDF indépendamment
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {showResults ? (
            // Results view
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
          ) : (
            // Import form view
            <Tabs defaultValue="combined" className="py-4" onValueChange={(v) => setImportMode(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metadata" className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Métadonnées seules
                </TabsTrigger>
                <TabsTrigger value="documents" className="gap-2">
                  <FileText className="h-4 w-4" />
                  PDF seuls
                </TabsTrigger>
                <TabsTrigger value="combined" className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Combiné
                </TabsTrigger>
              </TabsList>

              {/* Metadata Only */}
              <TabsContent value="metadata" className="space-y-4 mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Import des métadonnées uniquement</AlertTitle>
                  <AlertDescription>
                    Importez un fichier Excel pour créer les notices. Les PDF pourront être ajoutés ultérieurement.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Modèle Excel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={downloadTemplate} variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger le modèle
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Colonnes clés</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <div><strong>cote</strong> : Identifiant unique</div>
                      <div><strong>titre</strong> : Titre du document</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div 
                      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => metadataInputRef.current?.click()}
                    >
                      <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Cliquez pour sélectionner votre fichier Excel
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
                  </CardContent>
                </Card>

                {metadataPreview.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Aperçu</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cote</TableHead>
                              <TableHead>Titre</TableHead>
                              <TableHead>Auteur</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {metadataPreview.map((row, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-mono">{row.cote || '-'}</TableCell>
                                <TableCell>{row.titre || '-'}</TableCell>
                                <TableCell>{row.auteur || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Documents Only */}
              <TabsContent value="documents" className="space-y-4 mt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Import des PDF uniquement</AlertTitle>
                  <AlertDescription>
                    Importez des fichiers PDF. Le nom du fichier (sans .pdf) sera utilisé comme cote et titre provisoire.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardContent className="pt-6">
                    <div 
                      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => documentsInputRef.current?.click()}
                    >
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Cliquez pour sélectionner vos fichiers PDF
                      </p>
                      <p className="text-xs text-muted-foreground">Sélection multiple autorisée</p>
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
                  </CardContent>
                </Card>

                {documentFiles.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Fichiers à importer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {documentFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Combined */}
              <TabsContent value="combined" className="space-y-4 mt-4">
                <Alert>
                  <Link2 className="h-4 w-4" />
                  <AlertTitle>Import combiné</AlertTitle>
                  <AlertDescription>
                    Importez les métadonnées Excel et les PDF. L'association se fait par correspondance entre la <strong>cote</strong> et le <strong>nom du fichier</strong>.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Metadata upload */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Métadonnées (optionnel)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div 
                        className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => metadataInputRef.current?.click()}
                      >
                        <p className="text-sm text-muted-foreground">
                          {metadataFile ? metadataFile.name : 'Cliquez pour importer'}
                        </p>
                        {metadataRows.length > 0 && (
                          <Badge variant="secondary" className="mt-1">{metadataRows.length} lignes</Badge>
                        )}
                      </div>
                      <Button onClick={downloadTemplate} variant="outline" size="sm" className="w-full">
                        <Download className="h-3 w-3 mr-2" />
                        Modèle Excel
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Documents upload */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Documents PDF
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => documentsInputRef.current?.click()}
                      >
                        <p className="text-sm text-muted-foreground">
                          {documentFiles.length > 0 ? `${documentFiles.length} fichier(s)` : 'Cliquez pour importer'}
                        </p>
                        {matchedCount > 0 && (
                          <Badge variant="default" className="mt-1 gap-1">
                            <Check className="h-3 w-3" />
                            {matchedCount} associé(s)
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {fileMatches.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span>Correspondances</span>
                        <div className="flex gap-2">
                          <Badge variant="default">{matchedCount} associé(s)</Badge>
                          {unmatchedCount > 0 && (
                            <Badge variant="destructive">{unmatchedCount} non associé(s)</Badge>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-40">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fichier</TableHead>
                              <TableHead>Titre associé</TableHead>
                              <TableHead>Statut</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fileMatches.map((match, idx) => (
                              <TableRow key={idx} className={match.matched ? '' : 'bg-muted/50'}>
                                <TableCell className="font-mono text-sm">{match.file.name}</TableCell>
                                <TableCell>{match.metadataRow?.titre || '(nom fichier utilisé)'}</TableCell>
                                <TableCell>
                                  {match.matched ? (
                                    <Badge variant="default" className="gap-1">
                                      <Check className="h-3 w-3" />
                                      Associé
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">Sans métadonnées</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          {showResults && !isProcessing ? (
            <>
              <Button variant="outline" onClick={resetModal}>
                Nouvel import
              </Button>
              <Button onClick={handleClose}>
                Fermer
              </Button>
            </>
          ) : !showResults && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              
              {importMode === 'metadata' && (
                <Button 
                  onClick={processMetadataOnlyImport} 
                  disabled={!canImportMetadataOnly || isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importer les métadonnées ({metadataRows.length})
                </Button>
              )}
              
              {importMode === 'documents' && (
                <Button 
                  onClick={processDocumentsOnlyImport} 
                  disabled={!canImportDocumentsOnly || isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importer les PDF ({documentFiles.length})
                </Button>
              )}
              
              {importMode === 'combined' && (
                <Button 
                  onClick={processCombinedImport} 
                  disabled={!canImportCombined || isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importer ({documentFiles.length} fichier(s))
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
