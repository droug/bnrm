import { useState, useRef } from "react";
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
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Loader2,
  FileDown
} from "lucide-react";
import * as XLSX from 'xlsx';

interface ImportResult {
  row: number;
  title: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
}

interface BulkDocumentImportProps {
  onSuccess?: () => void;
}

export default function BulkDocumentImport({ onSuccess }: BulkDocumentImportProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const downloadTemplate = () => {
    const headers = [
      'titre',
      'titre_ar',
      'auteur',
      'type_document',
      'langue',
      'annee_publication',
      'url_pdf',
      'url_couverture',
      'url_miniature',
      'nombre_pages',
      'taille_fichier_mb',
      'format_fichier',
      'source_numerisation', // internal ou external
      'qualite_numerisation', // high, medium, low
      'date_numerisation',
      'ocr_traite', // true/false
      'themes', // séparés par ;
      'collections', // séparés par ;
      'niveau_acces', // public, registered, restricted
      'authentification_requise', // true/false
      'telechargement_actif', // true/false
      'impression_active', // true/false
      'statut_publication', // draft, published, archived
      'cbn_document_id', // optionnel
    ];

    const exampleRow = [
      'Guide de la recherche scientifique',
      'دليل البحث العلمي',
      'Jean Dupont',
      'livre',
      'fr',
      '2024',
      'https://storage.example.com/documents/guide.pdf',
      'https://storage.example.com/covers/guide.jpg',
      'https://storage.example.com/thumbnails/guide_thumb.jpg',
      '250',
      '5.2',
      'PDF',
      'internal',
      'high',
      '2024-01-15',
      'true',
      'recherche;méthodologie;sciences',
      'patrimoine scientifique',
      'public',
      'false',
      'true',
      'true',
      'draft',
      '',
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Documents');
    
    // Ajuster la largeur des colonnes
    ws['!cols'] = headers.map(() => ({ wch: 25 }));
    
    XLSX.writeFile(wb, 'template_import_bibliotheque_numerique.xlsx');
    
    toast({
      title: "Modèle téléchargé",
      description: "Le fichier Excel modèle a été téléchargé"
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedFile(file);
    setResults([]);
    
    // Prévisualiser les données
    try {
      const data = await readExcelFile(file);
      setPreviewData(data.slice(0, 5)); // Prévisualiser les 5 premières lignes
    } catch (error) {
      console.error('Erreur lecture fichier:', error);
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire le fichier",
        variant: "destructive"
      });
    }
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

  const processImport = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const data = await readExcelFile(selectedFile);
      const totalRows = data.length;
      const importResults: ImportResult[] = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2; // +2 car ligne 1 = headers

        try {
          // Validation minimale
          if (!row.titre) {
            importResults.push({
              row: rowNumber,
              title: row.titre || '(sans titre)',
              status: 'skipped',
              message: 'Titre manquant'
            });
            continue;
          }

          let finalCbnId: string | undefined;

          // If user provided a cbn_document_id (UUID), check if it exists
          if (row.cbn_document_id) {
            const { data: existingCbn } = await supabase
              .from('cbn_documents')
              .select('id')
              .eq('id', row.cbn_document_id)
              .maybeSingle();
            
            if (existingCbn) {
              finalCbnId = existingCbn.id;
            }
          }

          // If no existing cbn_document found, create one (let DB generate UUID)
          if (!finalCbnId) {
            const generatedCote = `DL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const { data: newCbn, error: cbnError } = await supabase
              .from('cbn_documents')
              .insert({
                cote: generatedCote,
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
            finalCbnId = newCbn?.id;

            if (!finalCbnId) {
              throw new Error("Impossible de créer la notice CBN (id manquant)");
            }
          }

          // Insérer dans digital_library_documents
          const { error: docError } = await supabase
            .from('digital_library_documents')
            .insert({
              cbn_document_id: finalCbnId,
              title: row.titre,
              title_ar: row.titre_ar || null,
              author: row.auteur || null,
              document_type: row.type_document || null,
              language: row.langue || null,
              publication_year: row.annee_publication ? parseInt(row.annee_publication) : null,
              pdf_url: row.url_pdf || null,
              cover_image_url: row.url_couverture || null,
              thumbnail_url: row.url_miniature || null,
              pages_count: row.nombre_pages ? parseInt(row.nombre_pages) : 1,
              file_size_mb: row.taille_fichier_mb ? parseFloat(row.taille_fichier_mb) : null,
              file_format: row.format_fichier || null,
              digitization_source: row.source_numerisation || 'internal',
              digitization_quality: row.qualite_numerisation || null,
              digitization_date: row.date_numerisation || null,
              ocr_processed: row.ocr_traite === 'true' || row.ocr_traite === true,
              themes: row.themes ? row.themes.split(';').map((t: string) => t.trim()) : null,
              digital_collections: row.collections ? row.collections.split(';').map((c: string) => c.trim()) : null,
              access_level: row.niveau_acces || 'public',
              requires_authentication: row.authentification_requise === 'true' || row.authentification_requise === true,
              download_enabled: row.telechargement_actif !== 'false' && row.telechargement_actif !== false,
              print_enabled: row.impression_active !== 'false' && row.impression_active !== false,
              publication_status: row.statut_publication || 'draft',
            });

          if (docError) throw docError;

          importResults.push({
            row: rowNumber,
            title: row.titre,
            status: 'success',
            message: 'Document créé'
          });

        } catch (error: any) {
          importResults.push({
            row: rowNumber,
            title: row.titre || '(sans titre)',
            status: 'error',
            message: error.message || 'Erreur inconnue'
          });
        }

        setProgress(Math.round(((i + 1) / totalRows) * 100));
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

    } catch (error: any) {
      toast({
        title: "Erreur d'import",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportResultsReport = () => {
    if (results.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(results.map(r => ({
      'Ligne': r.row,
      'Titre': r.title,
      'Statut': r.status === 'success' ? 'Succès' : r.status === 'error' ? 'Erreur' : 'Ignoré',
      'Message': r.message
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    XLSX.writeFile(wb, `rapport_import_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;

  return (
    <div className="space-y-6">
      {/* Instructions & Template */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">1. Téléchargez le modèle Excel</p>
                  <p className="text-sm text-muted-foreground">
                    Contient toutes les colonnes requises avec un exemple
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">2. Remplissez vos données</p>
                  <p className="text-sm text-muted-foreground">
                    Titre obligatoire, autres champs optionnels
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">3. Importez le fichier</p>
                  <p className="text-sm text-muted-foreground">
                    Formats acceptés : Excel (.xlsx) ou CSV
                  </p>
                </div>
              </div>
            </div>
            
            <Button onClick={downloadTemplate} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le modèle Excel
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Colonnes importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>titre</strong> (obligatoire) : Titre du document</div>
            <div><strong>nombre_pages</strong> : Nombre de pages (défaut: 1)</div>
            <div><strong>source_numerisation</strong> : internal ou external</div>
            <div><strong>ocr_traite</strong> : true ou false</div>
            <div><strong>themes / collections</strong> : séparés par ;</div>
            <div><strong>niveau_acces</strong> : public, registered, restricted</div>
            <div><strong>statut_publication</strong> : draft, published, archived</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Importer le fichier</CardTitle>
          <CardDescription>Sélectionnez votre fichier Excel ou CSV rempli</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Cliquez pour sélectionner ou glissez-déposez votre fichier
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile && (
              <Badge variant="secondary" className="mt-2">
                {selectedFile.name}
              </Badge>
            )}
          </div>
          
          {/* Prévisualisation */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Aperçu (5 premières lignes) :</p>
              <ScrollArea className="h-40 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Auteur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Pages</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{row.titre || '-'}</TableCell>
                        <TableCell>{row.auteur || '-'}</TableCell>
                        <TableCell>{row.type_document || '-'}</TableCell>
                        <TableCell>{row.nombre_pages || 1}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
          
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Import en cours...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
          
          <Button 
            onClick={processImport} 
            disabled={!selectedFile || isProcessing}
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
                Lancer l'import
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {/* Résultats */}
      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Résultats de l'import</CardTitle>
              <CardDescription>
                {successCount} succès, {errorCount} erreurs, {skippedCount} ignorés
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
                    <TableHead className="w-16">Ligne</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead className="w-24">Statut</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{result.row}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {result.title}
                      </TableCell>
                      <TableCell>
                        {result.status === 'success' && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        )}
                        {result.status === 'error' && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Erreur
                          </Badge>
                        )}
                        {result.status === 'skipped' && (
                          <Badge variant="secondary">
                            Ignoré
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
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Limites d'import</AlertTitle>
        <AlertDescription>
          Maximum 500 documents par import. Pour les textes OCR, utilisez l'onglet "Indexation OCR" après l'import.
        </AlertDescription>
      </Alert>
    </div>
  );
}
