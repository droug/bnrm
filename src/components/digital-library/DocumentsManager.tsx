import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalWhisperTranscription } from "@/hooks/useLocalWhisperTranscription";
import { useBackgroundOcr } from "@/hooks/useBackgroundOcr";
import { registerDocumentInGed, deleteGedDocument, updateGedWorkflowStatus } from "@/hooks/useGedIntegration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PortalSelect } from "@/components/ui/portal-select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload, Trash2, Search, Download, FileText, Calendar, Filter, X, Eye, BookOpen, FileDown, Pencil, Wand2, Loader2, FileSearch, CheckCircle2, AlertCircle, Database, Mic, FileImage } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import OcrImportTool from "@/components/digital-library/import/OcrImportTool";
import PdfOcrTool from "@/components/digital-library/import/PdfOcrTool";
import SigbSyncManager from "@/components/digital-library/SigbSyncManager";
import { DraggableDocumentsList } from "@/components/digital-library/DraggableDocumentsList";
import BulkPdfImport from "@/components/digital-library/import/BulkPdfImport";
import BulkDocumentImport from "@/components/digital-library/import/BulkDocumentImport";
import BulkAudiovisualImport from "@/components/digital-library/import/BulkAudiovisualImport";
import AudiovisualTranscriptionTool from "@/components/digital-library/import/AudiovisualTranscriptionTool";
import { MultiEngineOcrTool } from "@/components/digital-library/ocr-multiengine";
import { FileUpload } from "@/components/ui/file-upload";
import Tesseract from 'tesseract.js';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { detectPdfEmbeddedText } from '@/utils/pdfTextDetection';
import { extractTextFromPdf, extractTextFromPdfFile, type ExtractionProgress } from '@/utils/pdfTextExtractor';
import { uploadToSupabaseStorage } from "@/utils/supabaseStorageUpload";

// Map language codes to Tesseract language codes
const TESSERACT_LANG_MAP: Record<string, string> = {
  'ar': 'ara',
  'fr': 'fra',
  'en': 'eng',
  'es': 'spa',
  'amz': 'ara+fra+eng',
  'lat': 'lat'
};

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as XLSX from 'xlsx';
import documentPreview1 from "@/assets/document-preview-1.jpg";
import documentPreview2 from "@/assets/document-preview-2.jpg";
import documentPreview3 from "@/assets/document-preview-3.jpg";
import documentPreview1Page2 from "@/assets/document-preview-1-page2.jpg";
import documentPreview2Page2 from "@/assets/document-preview-2-page2.jpg";
import documentPreview3Page2 from "@/assets/document-preview-3-page2.jpg";

const documentSchema = z.object({
  cote: z.string().optional(), // Optionnel pour l'édition, requis pour l'ajout via validation manuelle
  title: z.string().optional(),
  author: z.string().optional(),
  file_type: z.string().optional(),
  publication_date: z.string().optional(),
  description: z.string().optional(),
  file_url: z.string().url("URL invalide").optional().or(z.literal("")),
  download_enabled: z.boolean().default(true),
  is_visible: z.boolean().default(true),
  social_share_enabled: z.boolean().default(true),
  email_share_enabled: z.boolean().default(true),
  copyright_expires_at: z.string().optional(),
  copyright_derogation: z.boolean().default(false),
  digitization_source: z.enum(["internal", "external"]).default("internal"),
  is_rare_book: z.boolean().default(false),
});

export default function DocumentsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState<string>("all");
  const [filterDownload, setFilterDownload] = useState<string>("all");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("documents");
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [compareDocs, setCompareDocs] = useState<{ existing: any; imported: any; previewImage?: string; pages?: string[] } | null>(null);
  const [keepSelection, setKeepSelection] = useState<"existing" | "imported" | "both">("both");
  const [currentPageExisting, setCurrentPageExisting] = useState(0);
  const [currentPageImported, setCurrentPageImported] = useState(0);
  const [batchOcrRunning, setBatchOcrRunning] = useState(false);
  const [batchOcrResult, setBatchOcrResult] = useState<any>(null);
  const [ocrProcessingDocId, setOcrProcessingDocId] = useState<string | null>(null);
  const [showOcrDialog, setShowOcrDialog] = useState(false);
  const [ocrDocumentTarget, setOcrDocumentTarget] = useState<any>(null);
  const [ocrBaseUrl, setOcrBaseUrl] = useState("");
  const [ocrLanguage, setOcrLanguage] = useState("ar");
  const [ocrExistingPagesCount, setOcrExistingPagesCount] = useState(0); // Pages with image_url
  const [ocrPdfFile, setOcrPdfFile] = useState<File | null>(null); // PDF file for OCR upload
  const [ocrMode, setOcrMode] = useState<"ocr" | "extract">("extract"); // OCR mode: extract embedded text or run Tesseract
  const [pdfHasEmbeddedText, setPdfHasEmbeddedText] = useState(false); // Whether PDF has embedded text
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [bulkOcrRunning, setBulkOcrRunning] = useState(false);
  const [clientOcrProgress, setClientOcrProgress] = useState(0);
  const [clientOcrCurrentPage, setClientOcrCurrentPage] = useState(0);
  const [clientOcrTotalPages, setClientOcrTotalPages] = useState(0);
  
  // File upload state for add document dialog
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentAddedSuccess, setDocumentAddedSuccess] = useState(false);
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  
  // Transcription state (for audio/video documents)
  const [transcriptionProcessingDocId, setTranscriptionProcessingDocId] = useState<string | null>(null);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [showTranscriptionDialog, setShowTranscriptionDialog] = useState(false);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState<string>("ar");
  const [transcriptionMethod, setTranscriptionMethod] = useState<"local" | "lovable-ai" | "openai">("local");
  const [documentToTranscribe, setDocumentToTranscribe] = useState<any>(null);
  
  // Background OCR with cache invalidation on complete
  const handleOcrJobComplete = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
  }, [queryClient]);
  
  const { startOcrJob, jobs: backgroundOcrJobs, activeJobsCount: activeBackgroundOcrCount } = useBackgroundOcr({
    onJobComplete: handleOcrJobComplete
  });
  const [runOcrInBackground, setRunOcrInBackground] = useState(true); // Default to background mode

  // Exemple de doublons détectés
  const sampleDuplicates = [
    {
      id: 1,
      previewImage: documentPreview1,
      pages: [documentPreview1, documentPreview1Page2],
      existing: {
        id: "DOC-001",
        title: "Introduction à la philosophie",
        author: "Jean Dupont",
        isbn: "978-2-1234-5678-9",
        issn: "",
        ismn: "",
        cote: "PHI-001",
        publication_date: "2020-05-15",
        editeur: "Éditions Savoir",
        nombre_pages: "350"
      },
      imported: {
        id: "DOC-156",
        title: "Introduction à la philosophie",
        author: "Jean Dupont",
        isbn: "978-2-1234-5678-9",
        issn: "",
        ismn: "",
        cote: "PHI-001",
        publication_date: "2020-05-15",
        editeur: "Éditions Savoir",
        nombre_pages: "352"
      }
    },
    {
      id: 2,
      previewImage: documentPreview2,
      pages: [documentPreview2, documentPreview2Page2],
      existing: {
        id: "DOC-042",
        title: "Revue scientifique - Vol. 12",
        author: "Collectif",
        isbn: "",
        issn: "1234-5678",
        ismn: "",
        cote: "REV-SCI-012",
        publication_date: "2023-01-10",
        editeur: "Publications Scientifiques",
        nombre_pages: "120"
      },
      imported: {
        id: "DOC-198",
        title: "Revue scientifique - Volume 12",
        author: "Collectif",
        isbn: "",
        issn: "1234-5678",
        ismn: "",
        cote: "REV-SCI-012",
        publication_date: "2023-01-10",
        editeur: "Publications Scientifiques SA",
        nombre_pages: "120"
      }
    },
    {
      id: 3,
      previewImage: documentPreview3,
      pages: [documentPreview3, documentPreview3Page2],
      existing: {
        id: "DOC-089",
        title: "Partition musicale - Symphonie n°5",
        author: "Mozart",
        isbn: "",
        issn: "",
        ismn: "M-2306-7118-7",
        cote: "MUS-MOZ-005",
        publication_date: "2019-03-22",
        editeur: "Éditions Musicales",
        nombre_pages: "48"
      },
      imported: {
        id: "DOC-223",
        title: "Partition musicale - Symphonie n°5",
        author: "W. A. Mozart",
        isbn: "",
        issn: "",
        ismn: "M-2306-7118-7",
        cote: "MUS-MOZ-005",
        publication_date: "2019-03-22",
        editeur: "Éditions Musicales",
        nombre_pages: "48"
      }
    }
  ];

  const handleCompare = (duplicate: any) => {
    setCompareDocs(duplicate);
    setKeepSelection("both");
    setCurrentPageExisting(0);
    setCurrentPageImported(0);
    setShowCompareDialog(true);
  };

  const handleKeepDocument = () => {
    toast({
      title: "Action enregistrée",
      description: `Choix: ${keepSelection === "existing" ? "Conserver l'existant" : keepSelection === "imported" ? "Conserver l'importé" : "Conserver les deux"}`,
    });
    setShowCompareDialog(false);
  };

  const handleBatchOcr = async () => {
    if (selectedDocIds.length === 0) {
      toast({
        title: "Aucun document sélectionné",
        description: "Veuillez sélectionner au moins un document pour lancer l'OCR en masse",
        variant: "destructive"
      });
      return;
    }

    setBatchOcrRunning(true);
    setBatchOcrResult(null);

    try {
      const baseUrl = window.location.origin;

      const { data, error } = await supabase.functions.invoke('batch-ocr-indexing', {
        body: {
          language: 'ar',
          baseUrl,
          documentIds: selectedDocIds
        }
      });

      if (error) {
        throw error;
      }

      setBatchOcrResult(data);
      toast({
        title: "Indexation OCR terminée",
        description: `${data.totalPagesProcessed} pages traitées sur ${selectedDocIds.length} document(s)`
      });
      setSelectedDocIds([]);
    } catch (error: any) {
      console.error('Batch OCR error:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
      setBatchOcrResult({ error: error.message });
    } finally {
      setBatchOcrRunning(false);
    }
  };

  const getFieldComparison = (field: string, existingValue: any, importedValue: any) => {
    const isIdentical = existingValue === importedValue;
    const isEmpty = !existingValue && !importedValue;
    return { isIdentical, isEmpty };
  };

  const form = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      download_enabled: true,
      is_visible: true,
      social_share_enabled: true,
      email_share_enabled: true,
      copyright_derogation: false,
      digitization_source: "internal",
      is_rare_book: false,
    },
  });

  // Fetch documents - ordered by sort_order for drag-and-drop consistency
  const { data: documents, isLoading } = useQuery({
    queryKey: ['digital-library-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('digital_library_documents')
        .select('*, cbn_documents!fk_digital_library_cbn_document(cote)')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Add document
  const addDocument = useMutation({
    mutationFn: async (values: z.infer<typeof documentSchema>) => {
      console.log("[ADD DOC] mutationFn appelée avec:", { 
        values, 
        uploadFileName: uploadFile?.name,
        uploadFileSize: uploadFile?.size,
        uploadFileType: uploadFile?.type
      });
      
      // Validate that either a file is uploaded or a cote is provided
      if (!values.cote || values.cote.trim() === '') {
        console.error("[ADD DOC] Validation échouée: cote vide");
        throw new Error("Veuillez téléverser un fichier PDF pour générer automatiquement le numéro de cote.");
      }
      
      if (!uploadFile && (!values.file_url || values.file_url.trim() === '')) {
        console.error("[ADD DOC] Validation échouée: pas de fichier ni URL");
        throw new Error("Veuillez téléverser un fichier PDF ou fournir une URL de fichier.");
      }
      
      console.log("[ADD DOC] Validation OK, début du processus...");
      setIsUploading(true);
      setUploadProgress(5); // Show some initial progress
      
      try {
        // First, check if a cbn_document with this cote already exists
        const { data: existingCbn } = await supabase
          .from('cbn_documents')
          .select('id, title, author, publication_year, document_type')
          .eq('cote', values.cote)
          .maybeSingle();

        let cbnDocumentId: string;

        if (existingCbn) {
          // Use existing cbn_document
          cbnDocumentId = existingCbn.id;
        } else {
          // Create new cbn_document entry
          const { data: newCbn, error: cbnError } = await supabase
            .from('cbn_documents')
            .insert({
              cote: values.cote,
              title: values.title || `Document ${values.cote}`,
              author: values.author || null,
              document_type: values.file_type || 'book',
              publication_year: values.publication_date ? parseInt(values.publication_date.split('-')[0]) : null,
            })
            .select('id')
            .single();

          if (cbnError) throw cbnError;
          cbnDocumentId = newCbn.id;
        }

        // Check if digital_library_document already exists for this cbn_document
        const { data: existingDl } = await supabase
          .from('digital_library_documents')
          .select('id')
          .eq('cbn_document_id', cbnDocumentId)
          .maybeSingle();

        // NOTE: Au lieu d'échouer sur doublon, on met à jour le document existant.
        // Cela rend le bouton "Ajouter" idempotent et évite les erreurs quand l'utilisateur
        // ré-essaie après une première création (ou veut remplacer le PDF).
        const mode: 'create' | 'update' = existingDl ? 'update' : 'create';
        const targetDocId = existingDl?.id;

        // Handle file upload if a file is provided
        let uploadedPdfUrl = values.file_url || null;
        let detectedOcrProcessed = false;
        
        console.log('[ADD DOC] Préparation upload, fichier:', uploadFile?.name);
        setUploadProgress(10);
        
        if (uploadFile) {
          // Detect if PDF already has embedded text (already OCR'd or born-digital)
          if (uploadFile.type === 'application/pdf') {
            try {
              console.log('[ADD DOC] Détection de texte embarqué dans le PDF...');
              setUploadProgress(15);
              const detection = await detectPdfEmbeddedText(uploadFile, 3);
              if (detection.hasEmbeddedText && detection.confidence !== 'low') {
                detectedOcrProcessed = true;
                console.log('[ADD DOC] PDF déjà OCRisé détecté:', detection);
              }
            } catch (detectionError) {
              console.warn('[ADD DOC] Erreur détection OCR:', detectionError);
            }
          }
          
          setUploadProgress(20);
          
          // Sanitize filename: remove special chars, accents, spaces
          const sanitizedCote = values.cote
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^a-zA-Z0-9-_]/g, "_") // Replace special chars with underscore
            .toLowerCase();
          
          const fileExtension = uploadFile.name.split('.').pop()?.toLowerCase() || 'pdf';
          const fileName = `${sanitizedCote}_${Date.now()}.${fileExtension}`;
          const filePath = `documents/${fileName}`;
          
          console.log('[ADD DOC] Récupération de la session...');
          let { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('[ADD DOC] Erreur session:', sessionError);
            throw new Error("Erreur de session. Veuillez vous reconnecter.");
          }

          if (!session) {
            console.error('[ADD DOC] Pas de session');
            throw new Error("Session expirée. Veuillez vous reconnecter puis réessayer le téléversement.");
          }

          // IMPORTANT: l'upload via XHR ne bénéficie pas de l'auto-refresh de supabase-js.
          // Sur des fichiers lourds, un token proche de l'expiration peut échouer côté Storage.
          const nowSec = Math.floor(Date.now() / 1000);
          const expiresAt = session.expires_at ?? 0;
          const secondsLeft = expiresAt - nowSec;

          if (secondsLeft > 0 && secondsLeft < 120) {
            console.log('[ADD DOC] Token proche de l\'expiration (', secondsLeft, 's). Refresh session...');
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('[ADD DOC] Erreur refreshSession:', refreshError);
              throw new Error("Session expirée. Veuillez rafraîchir la page ou vous reconnecter, puis réessayer.");
            }
            session = refreshData.session ?? session;
          }

          const accessToken = session.access_token;

          if (!accessToken) {
            console.error('[ADD DOC] Pas de token d\'accès');
            throw new Error("Session expirée. Veuillez vous reconnecter puis réessayer le téléversement.");
          }
          
          console.log('[ADD DOC] Session OK, début upload vers Storage...');
          setUploadProgress(25);

          // NOTE: l'upload direct Storage est souvent limité (~50MB) ;
          // on bascule automatiquement vers un upload resumable (TUS) pour les gros PDF.
          const supabaseBaseUrl =
            ((supabase as any)?.supabaseUrl as string | undefined) ||
            "https://safeppmznupzqkqmzjzt.supabase.co";
          const supabaseAnonKey = (supabase as any)?.supabaseKey as string | undefined;

          await uploadToSupabaseStorage({
            baseUrl: supabaseBaseUrl,
            apikey: supabaseAnonKey,
            bucket: "digital-library",
            filePath,
            file: uploadFile,
            accessToken,
            upsert: true,
            cacheControl: "3600",
            onProgress: (bytesUploaded, bytesTotal) => {
              const rawProgress = Math.round((bytesUploaded / bytesTotal) * 100);
              const mappedProgress = 25 + Math.round(rawProgress * 0.65);
              console.log('[ADD DOC] Upload progress:', rawProgress, '% -> UI:', mappedProgress, '%');
              setUploadProgress(mappedProgress);
            },
          });

          setUploadProgress(92);

          console.log('[ADD DOC] Upload terminé, récupération URL publique...');
          setUploadProgress(95);
          
          // Get the public URL
          const { data: publicUrlData } = supabase.storage
            .from('digital-library')
            .getPublicUrl(filePath);

          uploadedPdfUrl = publicUrlData.publicUrl;
          console.log('[ADD DOC] URL publique:', uploadedPdfUrl);
        }
        
        setUploadProgress(96);

        const resolvedTitle = values.title || existingCbn?.title || `Document ${values.cote}`;
        const resolvedAuthor = values.author || existingCbn?.author || null;
        const resolvedType = values.file_type || existingCbn?.document_type || 'book';
        const resolvedYear = values.publication_date
          ? parseInt(values.publication_date.split('-')[0])
          : existingCbn?.publication_year || null;

        let docId: string;

        console.log('[ADD DOC] Mode:', mode, '- Création/mise à jour du document...');
        setUploadProgress(97);

        if (mode === 'update' && targetDocId) {
          console.log('[ADD DOC] Mise à jour document existant:', targetDocId);
          const { error: updateError } = await supabase
            .from('digital_library_documents')
            .update({
              cbn_document_id: cbnDocumentId,
              title: resolvedTitle,
              author: resolvedAuthor,
              document_type: resolvedType,
              publication_year: resolvedYear,
              pdf_url: uploadedPdfUrl,
              download_enabled: values.download_enabled,
              publication_status: values.is_visible ? 'published' : 'draft',
              digitization_source: values.digitization_source,
              pages_count: 0,
              ocr_processed: detectedOcrProcessed || undefined, // Mark as OCR'd if detected
            })
            .eq('id', targetDocId);

          if (updateError) {
            console.error('[ADD DOC] Erreur mise à jour:', updateError);
            throw updateError;
          }
          docId = targetDocId;
          console.log('[ADD DOC] Document mis à jour avec succès');
        } else {
          console.log('[ADD DOC] Création nouveau document avec cbn_document_id:', cbnDocumentId);
          // Create the digital_library_document
          const { data: newDoc, error: dlError } = await supabase
            .from('digital_library_documents')
            .insert([
              {
                cbn_document_id: cbnDocumentId,
                title: resolvedTitle,
                author: resolvedAuthor,
                document_type: resolvedType,
                publication_year: resolvedYear,
                pdf_url: uploadedPdfUrl,
                download_enabled: values.download_enabled,
                publication_status: values.is_visible ? 'published' : 'draft',
                digitization_source: values.digitization_source,
                pages_count: 0,
                ocr_processed: detectedOcrProcessed, // Mark as OCR'd if detected
              },
            ])
            .select('id')
            .single();

          if (dlError) {
            console.error('[ADD DOC] Erreur création:', dlError);
            throw dlError;
          }
          docId = newDoc.id;
          console.log('[ADD DOC] Document créé avec succès, id:', docId);
        }
        
        setUploadProgress(98);

        // Si le PDF est détecté comme déjà OCRisé, extraire et indexer le texte
        if (detectedOcrProcessed && uploadFile) {
          try {
            console.log('[Auto-indexing] Extracting text from already OCR\'d PDF...');
            const extractedPages = await extractTextFromPdfFile(uploadFile);
            const pagesWithText = extractedPages.filter(p => p.text.length > 10);
            
            if (pagesWithText.length > 0) {
              // Insert extracted pages
              const pagesToInsert = pagesWithText.map(page => ({
                document_id: docId,
                page_number: page.pageNumber,
                ocr_text: page.text,
              }));

              await supabase
                .from('digital_library_pages')
                .insert(pagesToInsert);

              // Update pages count
              await supabase
                .from('digital_library_documents')
                .update({ pages_count: extractedPages.length })
                .eq('id', docId);

              console.log(`[Auto-indexing] Indexed ${pagesWithText.length} pages`);
            }
          } catch (extractError) {
            console.warn('[Auto-indexing] Text extraction failed:', extractError);
            // Don't fail the whole upload, just log the warning
          }
        }

        // Enregistrer dans la GED (non bloquant pour l'ajout UI)
        const gedResult = await registerDocumentInGed({
          documentId: docId,
          documentTitle: resolvedTitle,
          documentType: resolvedType,
          description: values.description,
          fileUrl: uploadedPdfUrl,
          fileName: uploadFile?.name,
          fileMimeType: uploadFile?.type || 'application/pdf',
          fileSizeBytes: uploadFile?.size,
          workflowStatus: values.is_visible ? 'approved' : 'draft',
        });
        if (!gedResult.success) {
          console.warn('GED registration warning:', gedResult.error);
        } else {
          console.log('Document enregistré dans la GED:', gedResult.gedDocumentId);
        }

        setUploadProgress(100);
        console.log('[ADD DOC] Processus terminé avec succès, docId:', docId);
        return { id: docId, mode, autoIndexed: detectedOcrProcessed };
      } catch (error: any) {
        console.error('[ADD DOC] Erreur dans mutationFn:', error);
        throw error;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      // Ne pas fermer la modale - afficher le succès à l'intérieur
      setDocumentAddedSuccess(true);
      toast({
        title: result?.mode === 'update' ? "Document mis à jour" : "Document ajouté avec succès",
        description: result?.autoIndexed ? "Texte détecté et indexé automatiquement. Recherche disponible." : undefined,
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

  // Update document
  const updateDocument = useMutation({
    mutationFn: async (values: z.infer<typeof documentSchema> & { id: string }) => {
      // Update digital_library_documents table
      const { error } = await supabase
        .from('digital_library_documents')
        .update({
          title: values.title || null,
          author: values.author || null,
          document_type: values.file_type || null,
          // Save full date in publication_date, and extract year for publication_year
          publication_date: values.publication_date || null,
          publication_year: values.publication_date ? parseInt(values.publication_date.split('-')[0]) : null,
          pdf_url: values.file_url || null,
          download_enabled: values.download_enabled,
          publication_status: values.is_visible ? 'published' : 'draft',
          digitization_source: values.digitization_source || 'internal',
        })
        .eq('id', values.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      setShowEditDialog(false);
      setEditingDocument(null);
      form.reset();
      toast({ title: "Document modifié avec succès" });
    },
    onError: (error) => {
      console.error("Erreur mise à jour document:", error);
      toast({
        title: "Erreur", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // State for text extraction progress
  const [extractionProgress, setExtractionProgress] = useState<{ docId: string; progress: number } | null>(null);

  // Mark document as OCR processed AND extract/index text for search
  const markAsOcrProcessed = useMutation({
    mutationFn: async (docId: string) => {
      // First, get the document's PDF URL
      const { data: docData, error: fetchError } = await supabase
        .from('digital_library_documents')
        .select('pdf_url, title')
        .eq('id', docId)
        .single();
      
      if (fetchError) throw fetchError;
      if (!docData?.pdf_url) {
        throw new Error("Ce document n'a pas de fichier PDF associé");
      }

      setExtractionProgress({ docId, progress: 0 });

      // Extract text from the PDF
      const extractedPages = await extractTextFromPdf(docData.pdf_url, (progress) => {
        setExtractionProgress({ docId, progress: progress.percentage });
      });

      // Filter pages with actual text content
      const pagesWithText = extractedPages.filter(p => p.text.length > 10);
      
      if (pagesWithText.length === 0) {
        throw new Error("Aucun texte trouvé dans ce PDF. Le fichier ne contient peut-être pas de texte embarqué.");
      }

      // Delete existing pages for this document (if any)
      await supabase
        .from('digital_library_pages')
        .delete()
        .eq('document_id', docId);

      // Insert extracted pages
      const pagesToInsert = pagesWithText.map(page => ({
        document_id: docId,
        page_number: page.pageNumber,
        ocr_text: page.text,
      }));

      const { error: insertError } = await supabase
        .from('digital_library_pages')
        .insert(pagesToInsert);

      if (insertError) throw insertError;

      // Mark document as OCR processed
      const { error: updateError } = await supabase
        .from('digital_library_documents')
        .update({ 
          ocr_processed: true,
          pages_count: extractedPages.length
        })
        .eq('id', docId);
      
      if (updateError) throw updateError;

      return { pagesIndexed: pagesWithText.length, totalPages: extractedPages.length };
    },
    onSuccess: (result) => {
      setExtractionProgress(null);
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ 
        title: "Texte extrait et indexé", 
        description: `${result.pagesIndexed} pages indexées sur ${result.totalPages}. La recherche est maintenant disponible.` 
      });
    },
    onError: (error) => {
      setExtractionProgress(null);
      toast({ title: "Erreur d'extraction", description: error.message, variant: "destructive" });
    }
  });

  // Toggle functions
  const toggleField = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: boolean }) => {
      const { error } = await supabase
        .from('content')
        .update({ [field]: !value })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Paramètre mis à jour" });
    }
  });

  // Delete document
  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      // First, get the document to check for cbn_document_id
      const { data: docData } = await supabase
        .from('digital_library_documents')
        .select('pdf_url, cover_image_url, cbn_document_id')
        .eq('id', id)
        .single();

      // Supprimer le document GED associé (soft delete)
      await deleteGedDocument(id);

      // Delete associated pages if any
      await supabase
        .from('digital_library_pages')
        .delete()
        .eq('document_id', id);

      // Delete the document from digital_library_documents
      const { error } = await supabase
        .from('digital_library_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      // Also mark the corresponding cbn_document as deleted (soft delete)
      if (docData?.cbn_document_id) {
        await supabase
          .from('cbn_documents')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', docData.cbn_document_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Document supprimé avec succès" });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur lors de la suppression", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Bulk delete documents
  const [bulkDeleteRunning, setBulkDeleteRunning] = useState(false);
  
  const runBulkDelete = async () => {
    if (selectedDocIds.length === 0) {
      toast({
        title: "Aucun document sélectionné",
        description: "Veuillez sélectionner au moins un document à supprimer",
        variant: "destructive"
      });
      return;
    }

    // Show confirmation dialog instead of native confirm
    setShowBulkDeleteConfirm(true);
  };

  const executeBulkDelete = async () => {
    setShowBulkDeleteConfirm(false);
    setBulkDeleteRunning(true);
    let successCount = 0;
    let errorCount = 0;

    for (const docId of selectedDocIds) {
      try {
        // Delete associated pages
        await supabase
          .from('digital_library_pages')
          .delete()
          .eq('document_id', docId);

        // Delete the document
        const { error } = await supabase
          .from('digital_library_documents')
          .delete()
          .eq('id', docId);

        if (error) throw error;
        successCount++;
      } catch (error) {
        console.error(`Error deleting document ${docId}:`, error);
        errorCount++;
      }
    }

    setBulkDeleteRunning(false);
    queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
    setSelectedDocIds([]);

    if (errorCount === 0) {
      toast({
        title: "Suppression réussie",
        description: `${successCount} document(s) supprimé(s) avec succès`
      });
    } else {
      toast({
        title: "Suppression partielle",
        description: `${successCount} supprimé(s), ${errorCount} erreur(s)`,
        variant: "destructive"
      });
    }
  };

  // Single document delete with confirmation
  const handleDeleteClick = (doc: any) => {
    setDocumentToDelete(doc);
    setShowDeleteConfirm(true);
  };

  const executeDeleteDocument = () => {
    if (documentToDelete) {
      deleteDocument.mutate(documentToDelete.id);
    }
    setShowDeleteConfirm(false);
    setDocumentToDelete(null);
  };

  // Ouvrir le dialogue OCR pour un document - ouvre le dialogue de configuration OCR
  const openOcrDialog = async (doc: any) => {
    setOcrDocumentTarget(doc);
    setOcrBaseUrl(doc.base_url || "");
    setOcrLanguage(doc.language || "ar");
    setOcrPdfFile(null);
    setPdfHasEmbeddedText(false);
    setOcrMode("extract"); // Default to extract mode (faster)
    
    // Check if document has existing pages with images
    const { count } = await supabase
      .from('digital_library_pages')
      .select('id', { count: 'exact', head: true })
      .eq('document_id', doc.id)
      .not('image_url', 'is', null);
    
    setOcrExistingPagesCount(count || 0);
    
    // Check if PDF has embedded text (for Adobe Acrobat Pro OCR'd PDFs)
    if (doc.pdf_url) {
      try {
        const response = await fetch(doc.pdf_url);
        if (response.ok) {
          const pdfBuffer = await response.arrayBuffer();
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
          const pdfDoc = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
          
          // Check first page for embedded text
          if (pdfDoc.numPages > 0) {
            const page = await pdfDoc.getPage(1);
            const textContent = await page.getTextContent();
            const hasText = textContent.items.length > 10; // Threshold to detect real text
            setPdfHasEmbeddedText(hasText);
            if (hasText) {
              setOcrMode("extract"); // Default to extract if text found
            } else {
              setOcrMode("ocr"); // Default to OCR if no text
            }
          }
        }
      } catch (e) {
        console.error("Error checking PDF for embedded text:", e);
      }
    }
    
    setShowOcrDialog(true);
  };

  // Convert PDF page to image using canvas
  const convertPdfPageToImage = async (pdfDoc: any, pageNum: number): Promise<string> => {
    const page = await pdfDoc.getPage(pageNum);
    const scale = 2.0; // Good balance between quality and performance
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

  // Extract embedded text from PDF page (for already OCR'd PDFs from Adobe Acrobat Pro)
  const extractTextFromPdfPage = async (pdfDoc: any, pageNum: number): Promise<string> => {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const textItems = textContent.items.map((item: any) => item.str || '');
    return textItems.join(' ').trim();
  };

  // Perform OCR on a single page using Tesseract.js
  const performOcrOnPage = async (imageData: string, lang: string): Promise<string> => {
    const tesseractLang = TESSERACT_LANG_MAP[lang] || 'ara';
    
    const result = await Tesseract.recognize(imageData, tesseractLang);
    return result.data.text.trim();
  };

  // Lancer l'OCR avec les paramètres du dialogue
  const runOcrForDocument = async () => {
    if (!ocrDocumentTarget) return;
    
    // Check if document has a PDF URL, uploaded file, or existing pages with images
    const hasPdfUrl = !!ocrDocumentTarget.pdf_url;
    const hasPdfFile = !!ocrPdfFile;
    const hasExistingPages = ocrExistingPagesCount > 0;
    
    if (!hasPdfUrl && !hasPdfFile && !hasExistingPages) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier PDF ou importer des images de pages.",
        variant: "destructive"
      });
      return;
    }

    // If background mode is enabled and we have a PDF URL (OCR mode only, not extract)
    if (runOcrInBackground && ocrMode === 'ocr' && (hasPdfUrl || hasPdfFile)) {
      setShowOcrDialog(false);
      
      // If user uploaded a new PDF, we need to upload it first before background processing
      let pdfUrlToUse = ocrDocumentTarget.pdf_url;
      
      if (hasPdfFile && ocrPdfFile) {
        // Upload the PDF first
        try {
          const safeFileName = ocrPdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
          const ext = safeFileName.split('.').pop()?.toLowerCase() || 'pdf';
          const fileName = `${ocrDocumentTarget.id}_${Date.now()}.${ext}`;
          const filePath = `documents/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('digital-library')
            .upload(filePath, ocrPdfFile, {
              upsert: true,
              contentType: 'application/pdf',
            });
          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('digital-library')
            .getPublicUrl(filePath);

          pdfUrlToUse = urlData?.publicUrl || '';
          
          // Update document with PDF URL
          await supabase
            .from('digital_library_documents')
            .update({ 
              pdf_url: pdfUrlToUse,
              language: ocrLanguage,
              file_size_mb: parseFloat((ocrPdfFile.size / 1024 / 1024).toFixed(2)),
              file_format: 'pdf'
            })
            .eq('id', ocrDocumentTarget.id);
        } catch (uploadError: any) {
          toast({
            title: "Erreur upload",
            description: uploadError.message,
            variant: "destructive"
          });
          return;
        }
      } else {
        // Just update the language
        await supabase
          .from('digital_library_documents')
          .update({ language: ocrLanguage })
          .eq('id', ocrDocumentTarget.id);
      }
      
      // Start background OCR job
      startOcrJob({
        documentId: ocrDocumentTarget.id,
        documentTitle: ocrDocumentTarget.title || 'Document sans titre',
        pdfUrl: pdfUrlToUse,
        language: ocrLanguage,
      });
      
      // Clean up dialog state
      setOcrDocumentTarget(null);
      setOcrPdfFile(null);
      return;
    }

    // Otherwise, run in foreground (existing behavior)
    setShowOcrDialog(false);
    setOcrProcessingDocId(ocrDocumentTarget.id);
    setClientOcrProgress(0);
    setClientOcrCurrentPage(0);
    setClientOcrTotalPages(0);
    
    try {
      // Update document language
      await supabase
        .from('digital_library_documents')
        .update({ language: ocrLanguage })
        .eq('id', ocrDocumentTarget.id);

      // Helper function to upload PDF to storage
      const uploadPdfToStorage = async (file: File, documentId: string): Promise<string> => {
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const ext = safeFileName.split('.').pop()?.toLowerCase() || 'pdf';
        const fileName = `${documentId}_${Date.now()}.${ext}`;
        const filePath = `documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('digital-library')
          .upload(filePath, file, {
            upsert: true,
            contentType: 'application/pdf',
          });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('digital-library')
          .getPublicUrl(filePath);

        return urlData?.publicUrl || '';
      };

      // If user uploaded a PDF file, upload it first
      let pdfUrlToUse = ocrDocumentTarget.pdf_url;
      if (hasPdfFile && ocrPdfFile) {
        toast({
          title: "Upload du PDF...",
          description: "Envoi du fichier vers le stockage"
        });
        
        pdfUrlToUse = await uploadPdfToStorage(ocrPdfFile, ocrDocumentTarget.id);
        
        // Update document with PDF URL
        await supabase
          .from('digital_library_documents')
          .update({ 
            pdf_url: pdfUrlToUse,
            file_size_mb: parseFloat((ocrPdfFile.size / 1024 / 1024).toFixed(2)),
            file_format: 'pdf'
          })
          .eq('id', ocrDocumentTarget.id);
        
        toast({
          title: "PDF uploadé",
          description: "Démarrage de l'OCR..."
        });
      }

      // If document has PDF (existing or just uploaded), process it client-side
      if (pdfUrlToUse && !hasExistingPages) {
        const isExtractMode = ocrMode === "extract";
        
        toast({
          title: "Téléchargement du PDF...",
          description: isExtractMode 
            ? "Extraction du texte embarqué (PDF déjà océrisé)" 
            : "Préparation du traitement OCR côté client"
        });

        // Fetch PDF
        const pdfResponse = await fetch(pdfUrlToUse);
        if (!pdfResponse.ok) {
          throw new Error(`Impossible de télécharger le PDF: ${pdfResponse.status}`);
        }

        const pdfBuffer = await pdfResponse.arrayBuffer();

        // Load PDF.js
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

        const pdfDoc = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
        const numPages = pdfDoc.numPages;

        setClientOcrTotalPages(numPages);

        toast({
          title: isExtractMode ? "Extraction en cours" : "OCR en cours",
          description: isExtractMode 
            ? `Extraction du texte de ${numPages} pages (instantané)`
            : `Traitement de ${numPages} pages avec Tesseract.js (local)`
        });

        let successCount = 0;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          setClientOcrCurrentPage(pageNum);
          setClientOcrProgress(Math.round((pageNum / numPages) * 100));

          try {
            let extractedText = "";
            
            if (isExtractMode) {
              // Extract embedded text (fast - for Adobe Acrobat Pro OCR'd PDFs)
              extractedText = await extractTextFromPdfPage(pdfDoc, pageNum);
            } else {
              // Convert page to image and run Tesseract OCR
              const imageData = await convertPdfPageToImage(pdfDoc, pageNum);
              extractedText = await performOcrOnPage(imageData, ocrLanguage);
            }

            if (extractedText) {
              // Check if page already exists
              const { data: existing } = await supabase
                .from('digital_library_pages')
                .select('id')
                .eq('document_id', ocrDocumentTarget.id)
                .eq('page_number', pageNum)
                .maybeSingle();

              if (existing) {
                await supabase
                  .from('digital_library_pages')
                  .update({ ocr_text: extractedText })
                  .eq('id', existing.id);
              } else {
                await supabase
                  .from('digital_library_pages')
                  .insert({
                    document_id: ocrDocumentTarget.id,
                    page_number: pageNum,
                    ocr_text: extractedText
                  });
              }
              successCount++;
            }
          } catch (pageError) {
            console.error(`Error processing page ${pageNum}:`, pageError);
          }
        }

        // Update document
        await supabase
          .from('digital_library_documents')
          .update({ 
            ocr_processed: true,
            pages_count: numPages
          })
          .eq('id', ocrDocumentTarget.id);

        queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
        
        toast({
          title: isExtractMode ? "Extraction terminée" : "OCR terminé",
          description: `${successCount}/${numPages} page(s) traitée(s) pour "${ocrDocumentTarget.title}"`
        });
      } else if (hasExistingPages) {
        // Process existing pages with images (client-side Tesseract)
        toast({
          title: "OCR des pages existantes...",
          description: `Traitement de ${ocrExistingPagesCount} pages avec Tesseract.js (local)`
        });

        // Fetch all pages with images
        const { data: pages, error: pagesError } = await supabase
          .from('digital_library_pages')
          .select('id, page_number, image_url')
          .eq('document_id', ocrDocumentTarget.id)
          .not('image_url', 'is', null)
          .order('page_number');

        if (pagesError) throw pagesError;
        if (!pages || pages.length === 0) {
          throw new Error("Aucune page avec image trouvée");
        }

        setClientOcrTotalPages(pages.length);
        let successCount = 0;

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          setClientOcrCurrentPage(i + 1);
          setClientOcrProgress(Math.round(((i + 1) / pages.length) * 100));

          try {
            // Perform OCR directly on the image URL
            const ocrText = await performOcrOnPage(page.image_url, ocrLanguage);

            if (ocrText) {
              await supabase
                .from('digital_library_pages')
                .update({ ocr_text: ocrText })
                .eq('id', page.id);
              successCount++;
            }
          } catch (pageError) {
            console.error(`Error processing page ${page.page_number}:`, pageError);
          }
        }

        // Update document
        await supabase
          .from('digital_library_documents')
          .update({ 
            ocr_processed: true,
            pages_count: pages.length
          })
          .eq('id', ocrDocumentTarget.id);

        queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
        
        toast({
          title: "OCR terminé",
          description: `${successCount}/${pages.length} page(s) traitée(s) pour "${ocrDocumentTarget.title}"`
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur OCR",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setOcrProcessingDocId(null);
      setOcrDocumentTarget(null);
      setOcrPdfFile(null);
      setClientOcrProgress(0);
      setClientOcrCurrentPage(0);
      setClientOcrTotalPages(0);
    }
  };

  // Helper function to check if document is audio/video
  const isAudioVideoDocument = (doc: any): boolean => {
    const docType = (doc.document_type || doc.file_format || '').toLowerCase();
    return ['audio', 'video', 'audiovisuel', 'audiovisual'].includes(docType);
  };

  // Local Whisper transcription hook (100% free, runs in browser)
  const { 
    transcribe: localTranscribe, 
    progress: localTranscriptionProgress, 
    isTranscribing: isLocalTranscribing 
  } = useLocalWhisperTranscription();

  // Sync transcription progress to component state
  useEffect(() => {
    if (localTranscriptionProgress.status !== 'idle') {
      setTranscriptionProgress(localTranscriptionProgress.progress);
    }
  }, [localTranscriptionProgress]);

  // Language options for transcription
  const transcriptionLanguageOptions = [
    { value: "ar", label: "العربية (Arabe)" },
    { value: "fr", label: "Français" },
    { value: "en", label: "English (Anglais)" },
    { value: "es", label: "Español (Espagnol)" },
    { value: "amz", label: "ⵜⴰⵎⴰⵣⵉⵖⵜ (Amazigh)" },
    { value: "auto", label: "Détection automatique" },
  ];

  // Open transcription dialog to select language
  const openTranscriptionDialog = (doc: any) => {
    setDocumentToTranscribe(doc);
    setShowTranscriptionDialog(true);
  };

  // Run transcription for audio/video documents
  const runTranscriptionForDocument = async (language: string) => {
    const doc = documentToTranscribe;
    if (!doc?.pdf_url) {
      toast({
        title: "Erreur",
        description: "Ce document n'a pas de fichier média associé.",
        variant: "destructive"
      });
      return;
    }

    setShowTranscriptionDialog(false);
    setTranscriptionProcessingDocId(doc.id);
    setTranscriptionProgress(5);

    try {
      let transcriptionText = "";
      let segments: string[] = [];
      // Track what we actually used (can fallback to Local if cloud fails)
      let usedMethod: "local" | "lovable-ai" | "openai" = transcriptionMethod;

      if (transcriptionMethod === "lovable-ai") {
        // Use Lovable AI (Gemini) - included in Lovable platform
        // Note: Gemini has limits on audio file size via base64 encoding
        
        // Check file size first (limit to ~10MB to avoid memory issues)
        const response = await fetch(doc.pdf_url, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        const fileSizeMB = contentLength ? parseInt(contentLength) / (1024 * 1024) : 0;
        
        if (fileSizeMB > 10) {
          // File too large for Gemini, fallback to Local
          usedMethod = "local";
          toast({
            title: "Fichier trop volumineux pour Gemini",
            description: `Le fichier fait ${fileSizeMB.toFixed(1)} Mo. Bascule vers transcription locale.`,
          });

          const localResult = await localTranscribe(doc.pdf_url, language);
          if (!localResult || !localResult.text) {
            throw new Error("Aucun texte transcrit (local)");
          }
          transcriptionText = localResult.text;

          if (localResult.chunks && localResult.chunks.length > 0) {
            segments = localResult.chunks.map(c => c.text.trim()).filter(s => s);
          } else {
            segments = transcriptionText.split(/[.!?]+/).filter((s: string) => s.trim());
          }
        } else {
          toast({
            title: "Transcription Gemini",
            description: `Envoi au serveur... Langue: ${transcriptionLanguageOptions.find(l => l.value === language)?.label || language}`
          });

          setTranscriptionProgress(20);

          // Fetch the audio file
          const audioResponse = await fetch(doc.pdf_url);
          const blob = await audioResponse.blob();
          
          const urlParts = doc.pdf_url.split('.');
          const extension = urlParts[urlParts.length - 1].split('?')[0] || 'mp4';
          
          const formData = new FormData();
          formData.append('audio', blob, `audio.${extension}`);
          formData.append('language', language);

          setTranscriptionProgress(40);

          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;

          const result = await fetch(
            `https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/lovable-ai-transcribe`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: formData
            }
          );

          setTranscriptionProgress(70);

          if (!result.ok) {
            let errorData: any = null;
            let errorMessage = "Erreur lors de la transcription Gemini";
            try {
              errorData = await result.json();
              errorMessage = errorData?.error || errorMessage;
            } catch {
              try {
                const t = await result.text();
                if (t) errorMessage = t;
              } catch {
                // ignore
              }
            }

            const code = errorData?.code;
            
            if (code === "UNSUPPORTED" || code === "RATE_LIMIT" || code === "PAYMENT_REQUIRED" || errorMessage.includes("Memory")) {
              // Fallback to Local
              usedMethod = "local";
              toast({
                title: "Gemini indisponible",
                description: `${errorMessage}. Bascule vers transcription locale.`,
                variant: "destructive",
              });

              const localResult = await localTranscribe(doc.pdf_url, language);
              if (!localResult || !localResult.text) {
                throw new Error("Aucun texte transcrit (local)");
              }
              transcriptionText = localResult.text;

              if (localResult.chunks && localResult.chunks.length > 0) {
                segments = localResult.chunks.map(c => c.text.trim()).filter(s => s);
              } else {
                segments = transcriptionText.split(/[.!?]+/).filter((s: string) => s.trim());
              }
            } else {
              throw new Error(errorMessage);
            }
          }

          if (usedMethod === "lovable-ai") {
            const data = await result.json();
            transcriptionText = data.text || "";
            
            if (data.segments && data.segments.length > 0) {
              segments = data.segments.map((s: any) => s.text.trim()).filter((s: string) => s);
            } else {
              segments = transcriptionText.split(/[.!?]+/).filter((s: string) => s.trim());
            }
          }
        }

      } else if (transcriptionMethod === "openai") {
        // Use OpenAI Whisper API (paid, more accurate)
        toast({
          title: "Transcription OpenAI Whisper",
          description: `Envoi au serveur... Langue: ${transcriptionLanguageOptions.find(l => l.value === language)?.label || language}`
        });

        setTranscriptionProgress(20);

        // Fetch the audio file
        const response = await fetch(doc.pdf_url);
        const blob = await response.blob();
        
        // Get file extension from URL
        const urlParts = doc.pdf_url.split('.');
        const extension = urlParts[urlParts.length - 1].split('?')[0] || 'mp4';
        
        const formData = new FormData();
        formData.append('audio', blob, `audio.${extension}`);
        formData.append('language', language);

        setTranscriptionProgress(40);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        const result = await fetch(
          `https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/openai-whisper-transcribe`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData
          }
        );

        setTranscriptionProgress(70);

        if (!result.ok) {
          // Be defensive: the edge function should return JSON, but don't assume it.
          let errorData: any = null;
          let errorMessage = "Erreur lors de la transcription OpenAI";
          try {
            errorData = await result.json();
            errorMessage = errorData?.error || errorMessage;
          } catch {
            try {
              const t = await result.text();
              if (t) errorMessage = t;
            } catch {
              // ignore
            }
          }

          const status = errorData?.status ?? result.status;
          const isOpenAiKeyProblem = status === 401 || /api key|clé api/i.test(errorMessage);

          if (isOpenAiKeyProblem) {
            // If user has no OpenAI key (or it is invalid), automatically fallback to Local.
            usedMethod = "local";
            toast({
              title: "OpenAI indisponible",
              description: "Aucune clé OpenAI valide n'est configurée. Bascule automatique vers la transcription locale (gratuite).",
              variant: "destructive",
            });

            const localResult = await localTranscribe(doc.pdf_url, language);
            if (!localResult || !localResult.text) {
              throw new Error("Aucun texte transcrit (local)");
            }
            transcriptionText = localResult.text;

            if (localResult.chunks && localResult.chunks.length > 0) {
              segments = localResult.chunks.map(c => c.text.trim()).filter(s => s);
            } else {
              segments = transcriptionText.split(/[.!?]+/).filter((s: string) => s.trim());
            }
          } else {
            throw new Error(errorMessage);
          }
        }

        // If OpenAI succeeded, parse and use it.
        if (usedMethod === "openai") {
          const data = await result.json();
          transcriptionText = data.text || "";
          
          // Use segments from OpenAI if available
          if (data.segments && data.segments.length > 0) {
            segments = data.segments.map((s: any) => s.text.trim()).filter((s: string) => s);
          } else {
            segments = transcriptionText.split(/[.!?]+/).filter((s: string) => s.trim());
          }
        }

      } else {
        // Use local Whisper (free, browser-based)
        toast({
          title: "Transcription locale (Whisper)",
          description: `Chargement du modèle... Langue: ${transcriptionLanguageOptions.find(l => l.value === language)?.label || language}`
        });

        const result = await localTranscribe(doc.pdf_url, language);
        
        if (!result || !result.text) {
          throw new Error("Aucun texte transcrit");
        }

        transcriptionText = result.text;
        
        if (result.chunks && result.chunks.length > 0) {
          segments = result.chunks.map(c => c.text.trim()).filter(s => s);
        } else {
          segments = transcriptionText.split(/[.!?]+/).filter((s: string) => s.trim());
        }
      }

      toast({
        title: "Sauvegarde en cours...",
        description: "Enregistrement de la transcription"
      });

      setTranscriptionProgress(85);

      // Save transcription as OCR text in digital_library_pages
      for (let idx = 0; idx < segments.length; idx++) {
        const { data: existingPage } = await supabase
          .from('digital_library_pages')
          .select('id')
          .eq('document_id', doc.id)
          .eq('page_number', idx + 1)
          .maybeSingle();

        if (existingPage) {
          await supabase
            .from('digital_library_pages')
            .update({ ocr_text: segments[idx].trim() })
            .eq('id', existingPage.id);
        } else {
          await supabase
            .from('digital_library_pages')
            .insert({
              document_id: doc.id,
              page_number: idx + 1,
              ocr_text: segments[idx].trim()
            });
        }
      }

      // Mark document as OCR processed
      await supabase
        .from('digital_library_documents')
        .update({ 
          ocr_processed: true,
          pages_count: segments.length
        })
        .eq('id', doc.id);

      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });

      const methodLabels: Record<string, string> = {
        "local": "Local",
        "lovable-ai": "Gemini",
        "openai": "OpenAI Whisper"
      };

      toast({
        title: "Transcription terminée",
        description: `${segments.length} segment(s) transcrits pour "${doc.title}" (${methodLabels[usedMethod] || usedMethod})`
      });

      setTranscriptionProgress(100);

    } catch (error: any) {
      console.error('Transcription error:', error);
      toast({
        title: "Erreur de transcription",
        description: error.message || "Erreur lors de la transcription",
        variant: "destructive"
      });
    } finally {
      setTranscriptionProcessingDocId(null);
      setTranscriptionProgress(0);
    }
  };

  // Toggle document selection
  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocIds(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  // Select/deselect all filtered documents
  const toggleSelectAll = () => {
    if (!filteredDocuments) return;
    
    const allFilteredIds = filteredDocuments.map(doc => doc.id);
    const allSelected = allFilteredIds.every(id => selectedDocIds.includes(id));
    
    if (allSelected) {
      setSelectedDocIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedDocIds(prev => [...new Set([...prev, ...allFilteredIds])]);
    }
  };

  // Run OCR on selected documents
  const runBulkOcrOnSelected = async () => {
    if (selectedDocIds.length === 0) {
      toast({
        title: "Aucun document sélectionné",
        description: "Veuillez sélectionner au moins un document pour lancer l'OCR",
        variant: "destructive"
      });
      return;
    }

    setBulkOcrRunning(true);
    const results: { docId: string; title: string; success: boolean; pages?: number; error?: string }[] = [];

    for (const docId of selectedDocIds) {
      const doc = documents?.find(d => d.id === docId);
      if (!doc) continue;

      try {
        const { data, error } = await supabase.functions.invoke('batch-ocr-indexing', {
          body: {
            documentId: docId,
            language: (doc as any).language || 'ar',
            baseUrl: (doc as any).base_url || ''
          }
        });

        if (error) throw error;

        results.push({
          docId,
          title: doc.title || 'Sans titre',
          success: true,
          pages: data?.processedPages || 0
        });
      } catch (error: any) {
        results.push({
          docId,
          title: doc?.title || 'Sans titre',
          success: false,
          error: error.message
        });
      }
    }

    setBulkOcrRunning(false);
    queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });

    const successCount = results.filter(r => r.success).length;
    const totalPages = results.filter(r => r.success).reduce((sum, r) => sum + (r.pages || 0), 0);

    toast({
      title: "OCR en masse terminé",
      description: `${successCount}/${results.length} documents traités, ${totalPages} pages indexées`,
    });

    // Clear selection after bulk OCR
    setSelectedDocIds([]);
  };

  // Filter documents
  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisible = filterVisible === "all" || 
                          (filterVisible === "visible" && doc.publication_status === 'published') ||
                          (filterVisible === "hidden" && doc.publication_status !== 'published');
    const matchesDownload = filterDownload === "all" ||
                           (filterDownload === "enabled" && doc.download_enabled) ||
                           (filterDownload === "disabled" && !doc.download_enabled);
    
    return matchesSearch && matchesVisible && matchesDownload;
  });

  // Download XLSX template
  const downloadTemplate = () => {
    const headers = [
      // Informations de base (content)
      'id',
      'titre',
      'slug',
      'type_contenu',
      'statut',
      'description',
      'url_fichier',
      'type_fichier',
      'taille_fichier_mb',
      'date_publication',
      'date_debut',
      'date_fin',
      'visible',
      'en_vedette',
      'telechargement_actif',
      'partage_social',
      'partage_email',
      'derogation_copyright',
      'date_expiration_copyright',
      'source_numerisation', // internal = numérisé BNRM, external = reçu numérisé
      'localisation',
      'tags',
      'mots_cles_seo',
      'meta_titre',
      'meta_description',
      'url_image_mise_en_avant',
      
      // Métadonnées du catalogue (catalog_metadata)
      'isbn',
      'issn',
      'ismn',
      'auteur_principal',
      'co_auteurs',
      'editeur',
      'annee_publication',
      'lieu_publication',
      'edition',
      'titre_original',
      'sous_titre',
      'titre_traduit',
      'titre_serie',
      'numero_volume',
      'mots_cles',
      'sujets',
      'classification_dewey',
      'classification_udc',
      'classification_cdu',
      'nombre_pages',
      'description_physique',
      'format_taille',
      'format_numerique',
      'mode_couleur',
      'resolution_dpi',
      'type_illustrations',
      'illustrateurs',
      'editeurs',
      'traducteurs',
      'couverture_geographique',
      'periode_temporelle',
      'statut_copyright',
      'droits_acces',
      'restrictions_usage',
      'notes_contenu',
      'notes_conservation',
      'notes_generales',
    ];

    const exampleRows = [
      [
        '', // id (auto-généré)
        'Guide pratique de la recherche scientifique', // titre
        'guide-recherche-scientifique', // slug
        'livre', // type_contenu (livre, article, these, rapport, periodique, multimedia)
        'publié', // statut (brouillon, publié, archivé)
        'Un guide complet pour les chercheurs', // description
        'https://storage.supabase.co/documents/guide.pdf', // url_fichier
        'PDF', // type_fichier
        '5.2', // taille_fichier_mb
        '2024-01-15', // date_publication
        '', // date_debut
        '', // date_fin
        'true', // visible
        'false', // en_vedette
        'true', // telechargement_actif
        'true', // partage_social
        'true', // partage_email
        'false', // derogation_copyright
        '2074-01-15', // date_expiration_copyright
        '', // localisation
        'recherche;méthodologie;sciences', // tags (séparés par ;)
        'recherche scientifique;méthodologie;guide', // mots_cles_seo (séparés par ;)
        'Guide de recherche scientifique', // meta_titre
        'Découvrez les meilleures pratiques de recherche', // meta_description
        'https://storage.supabase.co/images/cover.jpg', // url_image_mise_en_avant
        
        // Métadonnées du catalogue
        '978-3-16-148410-0', // isbn
        '', // issn
        '', // ismn
        'Dupont, Jean', // auteur_principal
        'Martin, Marie;Durand, Pierre', // co_auteurs (séparés par ;)
        'Éditions Scientifiques', // editeur
        '2024', // annee_publication
        'Paris', // lieu_publication
        '3e édition', // edition
        '', // titre_original
        'Méthodologie et pratiques', // sous_titre
        '', // titre_traduit
        'Collection Recherche', // titre_serie
        'Vol. 12', // numero_volume
        'recherche;méthodologie;sciences;académique', // mots_cles (séparés par ;)
        'Méthodologie;Recherche scientifique;Épistémologie', // sujets (séparés par ;)
        '001.42', // classification_dewey
        '001.8', // classification_udc
        '', // classification_cdu
        '350', // nombre_pages
        '24 cm, illustrations', // description_physique
        'A4', // format_taille
        'PDF/A', // format_numerique
        'couleur', // mode_couleur
        '300', // resolution_dpi
        'photographies, schémas', // type_illustrations
        'Leclerc, Sophie', // illustrateurs (séparés par ;)
        'Moreau, Luc;Bernard, Anne', // editeurs (séparés par ;)
        '', // traducteurs (séparés par ;)
        'France;Europe', // couverture_geographique (séparés par ;)
        '2020-2024', // periode_temporelle
        'Protégé par copyright', // statut_copyright
        'Libre accès avec inscription', // droits_acces
        'Usage académique uniquement', // restrictions_usage
        'Inclut bibliographie et index', // notes_contenu
        'Bon état', // notes_conservation
        'Ouvrage de référence', // notes_generales
      ],
      [
        '', // id (auto-généré)
        'Revue Marocaine de Recherche', // titre
        'revue-marocaine-recherche', // slug
        'periodique', // type_contenu
        'publié', // statut
        'Revue scientifique trimestrielle', // description
        'https://storage.supabase.co/documents/revue-2024-01.pdf', // url_fichier
        'PDF', // type_fichier
        '3.8', // taille_fichier_mb
        '2024-03-01', // date_publication
        '', // date_debut
        '', // date_fin
        'true', // visible
        'true', // en_vedette
        'true', // telechargement_actif
        'true', // partage_social
        'true', // partage_email
        'false', // derogation_copyright
        '2074-03-01', // date_expiration_copyright
        '', // localisation
        'revue;recherche;périodique', // tags (séparés par ;)
        'revue scientifique;recherche;Maroc', // mots_cles_seo (séparés par ;)
        'Revue Marocaine de Recherche - Mars 2024', // meta_titre
        'Découvrez les dernières recherches scientifiques', // meta_description
        '', // url_image_mise_en_avant
        
        // Métadonnées du catalogue
        '', // isbn
        '2345-6789', // issn
        'M-2306-7118-7', // ismn (exemple pour partition musicale)
        'Comité de rédaction', // auteur_principal
        '', // co_auteurs
        'BNRM Éditions', // editeur
        '2024', // annee_publication
        'Rabat', // lieu_publication
        'Vol. 15, No. 1', // edition
        '', // titre_original
        'Numéro spécial: Intelligence Artificielle', // sous_titre
        '', // titre_traduit
        '', // titre_serie
        '', // numero_volume
        'IA;recherche;innovation;Maroc', // mots_cles (séparés par ;)
        'Intelligence Artificielle;Innovation;Technologie', // sujets (séparés par ;)
        '004', // classification_dewey
        '004.8', // classification_udc
        '', // classification_cdu
        '120', // nombre_pages
        '21 cm', // description_physique
        'A4', // format_taille
        'PDF', // format_numerique
        'couleur', // mode_couleur
        '300', // resolution_dpi
        'graphiques, tableaux', // type_illustrations
        '', // illustrateurs
        'Hassan, Ahmed;Alami, Fatima', // editeurs (séparés par ;)
        '', // traducteurs
        'Maroc', // couverture_geographique
        '2024', // periode_temporelle
        'Accès libre', // statut_copyright
        'Libre accès', // droits_acces
        'Attribution CC BY 4.0', // restrictions_usage
        'Articles peer-reviewed', // notes_contenu
        '', // notes_conservation
        'Publication trimestrielle', // notes_generales
      ]
    ];

    // Create worksheet data
    const wsData = [headers, ...exampleRows];
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, // id
      { wch: 40 }, // titre
      { wch: 30 }, // slug
      { wch: 15 }, // type_contenu
      { wch: 12 }, // statut
      { wch: 50 }, // description
      { wch: 50 }, // url_fichier
      { wch: 12 }, // type_fichier
      { wch: 12 }, // taille_fichier_mb
      { wch: 15 }, // date_publication
      { wch: 15 }, // date_debut
      { wch: 15 }, // date_fin
      { wch: 10 }, // visible
      { wch: 12 }, // en_vedette
      { wch: 18 }, // telechargement_actif
      { wch: 15 }, // partage_social
      { wch: 15 }, // partage_email
      { wch: 20 }, // derogation_copyright
      { wch: 25 }, // date_expiration_copyright
      { wch: 20 }, // localisation
      { wch: 30 }, // tags
      { wch: 30 }, // mots_cles_seo
      { wch: 30 }, // meta_titre
      { wch: 40 }, // meta_description
      { wch: 40 }, // url_image_mise_en_avant
      { wch: 20 }, // isbn
      { wch: 15 }, // issn
      { wch: 18 }, // ismn
      { wch: 25 }, // auteur_principal
      { wch: 30 }, // co_auteurs
      { wch: 25 }, // editeur
      { wch: 15 }, // annee_publication
      { wch: 20 }, // lieu_publication
      { wch: 15 }, // edition
      { wch: 30 }, // titre_original
      { wch: 30 }, // sous_titre
      { wch: 30 }, // titre_traduit
      { wch: 25 }, // titre_serie
      { wch: 12 }, // numero_volume
      { wch: 40 }, // mots_cles
      { wch: 40 }, // sujets
      { wch: 18 }, // classification_dewey
      { wch: 18 }, // classification_udc
      { wch: 18 }, // classification_cdu
      { wch: 12 }, // nombre_pages
      { wch: 30 }, // description_physique
      { wch: 15 }, // format_taille
      { wch: 15 }, // format_numerique
      { wch: 12 }, // mode_couleur
      { wch: 12 }, // resolution_dpi
      { wch: 25 }, // type_illustrations
      { wch: 25 }, // illustrateurs
      { wch: 30 }, // editeurs
      { wch: 25 }, // traducteurs
      { wch: 25 }, // couverture_geographique
      { wch: 20 }, // periode_temporelle
      { wch: 25 }, // statut_copyright
      { wch: 30 }, // droits_acces
      { wch: 30 }, // restrictions_usage
      { wch: 40 }, // notes_contenu
      { wch: 25 }, // notes_conservation
      { wch: 30 }, // notes_generales
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Documents');
    
    // Generate and download file
    XLSX.writeFile(wb, 'modele_import_documents.xlsx');
    
    toast({ title: "Modèle téléchargé avec succès" });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestion des documents numérisés</h1>
            <p className="text-muted-foreground">
              Ajoutez, modifiez et gérez vos documents de la bibliothèque numérique
            </p>
          </div>
          {activeBackgroundOcrCount > 0 && (
            <Badge variant="secondary" className="animate-pulse bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              {activeBackgroundOcrCount} OCR en cours
            </Badge>
          )}
        </div>
        <Button 
          onClick={handleBatchOcr}
          disabled={batchOcrRunning || selectedDocIds.length === 0}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {batchOcrRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              OCR en cours...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              OCR en masse {selectedDocIds.length > 0 && `(${selectedDocIds.length})`}
            </>
          )}
        </Button>
      </div>

      {batchOcrResult && (
        <div>
          {batchOcrResult.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{batchOcrResult.error}</AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Indexation terminée</AlertTitle>
              <AlertDescription className="text-green-700">
                <p>{batchOcrResult.totalPagesProcessed} pages traitées sur {batchOcrResult.maxPagesPerRun} max par exécution.</p>
                {batchOcrResult.documents?.map((doc: any, i: number) => (
                  <div key={i} className="mt-1 text-xs">
                    • <strong>{doc.title}</strong>: {doc.pagesProcessed} pages indexées
                    {doc.errors?.length > 0 && ` (${doc.errors.length} erreurs)`}
                  </div>
                ))}
                {batchOcrResult.totalPagesProcessed >= batchOcrResult.maxPagesPerRun && (
                  <p className="mt-2 font-medium">Relancez pour continuer l'indexation des pages restantes.</p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto" dir="ltr">
          <TabsList className="inline-flex w-auto min-w-full flex-row">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="bulk-pdf" className="flex items-center gap-1">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Documents en masse</span>
              <span className="sm:hidden">Import</span>
            </TabsTrigger>
            <TabsTrigger value="bulk-av" className="flex items-center gap-1">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Audio/Vidéo</span>
              <span className="sm:hidden">AV</span>
            </TabsTrigger>
            <TabsTrigger value="bulk-excel" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Excel
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex items-center gap-1">
              <FileSearch className="h-4 w-4" />
              OCR
            </TabsTrigger>
            <TabsTrigger value="ocr-multi" className="flex items-center gap-1">
              <Wand2 className="h-4 w-4" />
              Multi-OCR
            </TabsTrigger>
            <TabsTrigger value="sigb" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              SIGB
            </TabsTrigger>
            <TabsTrigger value="duplicates">Doublons</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="bulk-pdf">
          <BulkPdfImport onSuccess={() => queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] })} />
        </TabsContent>

        <TabsContent value="bulk-av">
          <BulkAudiovisualImport onSuccess={() => queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] })} />
        </TabsContent>

        <TabsContent value="bulk-excel">
          <BulkDocumentImport onSuccess={() => queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] })} />
        </TabsContent>

        <TabsContent value="ocr-multi">
          <MultiEngineOcrTool onSuccess={() => queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] })} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex gap-2 justify-end mb-6">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un document
            </Button>
          </div>

          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) {
              setDocumentAddedSuccess(false);
              setUploadFile(null);
              setUploadProgress(0);
            }
          }}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un document</DialogTitle>
                <DialogDescription>
                  Saisissez le N° de cote. Les métadonnées seront récupérées automatiquement depuis le catalogue.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(
                  (values) => {
                    console.log("[FORM] Validation réussie, appel mutation:", values);
                    addDocument.mutate(values);
                  },
                  (errors) => {
                    console.error("[FORM] Erreurs de validation:", errors);
                    toast({
                      title: "Erreur de validation",
                      description: Object.entries(errors).map(([key, err]) => `${key}: ${err?.message}`).join(", ") || "Vérifiez les champs du formulaire",
                      variant: "destructive"
                    });
                  }
                )} className="space-y-4">
                  {/* Cote - Auto-filled from uploaded filename, read-only */}
                  <FormField
                    control={form.control}
                    name="cote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>N° Cote *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Téléversez un fichier pour remplir automatiquement" 
                            className="font-mono bg-muted/50" 
                            readOnly
                          />
                        </FormControl>
                        <FormDescription>
                          Généré automatiquement à partir du nom du fichier PDF téléversé.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Titre</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Titre du document (optionnel)" />
                          </FormControl>
                          <FormDescription className="text-xs">Sera récupéré via la cote si non renseigné</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Auteur</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nom de l'auteur" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="file_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de document</FormLabel>
                          <FormControl>
                            <select
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="">Sélectionner</option>
                              <option value="manuscrit">Manuscrits</option>
                              <option value="livre">Livres</option>
                              <option value="lithographie">Lithographie</option>
                              <option value="periodique">Périodiques</option>
                              <option value="collection_specialisee">Collections Spécialisées</option>
                              <option value="audiovisuel">Audiovisuel</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="publication_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de publication</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="digitization_source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source de numérisation</FormLabel>
                          <FormControl>
                            <select
                              value={field.value || "internal"}
                              onChange={(e) => field.onChange(e.target.value as "internal" | "external")}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="internal">Collections numérisées (BNRM)</option>
                              <option value="external">Ressources numériques (externe)</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* File Upload Section */}
                    <div className="col-span-2 space-y-2">
                      <Label>Fichier PDF</Label>
                      <FileUpload
                        accept=".pdf"
                        maxSize={100}
                        value={uploadFile}
                        onChange={(file) => {
                          setUploadFile(file);
                          // Auto-fill cote from filename (without extension)
                          if (file) {
                            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                            form.setValue('cote', fileNameWithoutExt);
                          }
                        }}
                      />
                      {isUploading && uploadProgress > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Téléversement en cours...</span>
                            <span className="font-medium">{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Téléversez le fichier PDF du document. Formats acceptés: PDF (max. 100 MB)
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="file_url"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Ou URL du fichier</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="https://..." 
                              disabled={!!uploadFile}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Laissez vide si vous avez téléversé un fichier ci-dessus
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} placeholder="Description du document" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Checkbox Livre rare */}
                    <FormField
                      control={form.control}
                      name="is_rare_book"
                      render={({ field }) => (
                        <FormItem className="col-span-2 flex items-center gap-3 p-3 border rounded-lg bg-amber-50/50">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div>
                            <FormLabel className="text-sm font-medium cursor-pointer">
                              📚 Livre rare
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Marquer ce document comme édition rare ou précieuse
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Permissions */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">Permissions et accès</h3>
                    
                    <FormField
                      control={form.control}
                      name="is_visible"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Visible sur le site</FormLabel>
                            <FormDescription>Le document apparaît dans la bibliothèque</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="download_enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Téléchargement activé</FormLabel>
                            <FormDescription>Autoriser le téléchargement du document</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="social_share_enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Partage sur réseaux sociaux</FormLabel>
                            <FormDescription>Activer le partage social</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email_share_enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Partage par email</FormLabel>
                            <FormDescription>Activer l'envoi par email</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Success message after document upload */}
                  {documentAddedSuccess && (
                    <Alert className="border-green-500 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-700">Document ajouté avec succès</AlertTitle>
                      <AlertDescription className="text-green-600">
                        Le document a été téléversé, enregistré dans la base de données et indexé dans la GED.
                      </AlertDescription>
                    </Alert>
                  )}

                  <DialogFooter>
                    {documentAddedSuccess ? (
                      <Button 
                        type="button" 
                        onClick={() => {
                          setShowAddDialog(false);
                          setUploadFile(null);
                          setUploadProgress(0);
                          setDocumentAddedSuccess(false);
                          form.reset();
                        }}
                      >
                        Fermer
                      </Button>
                    ) : (
                      <>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setShowAddDialog(false);
                            setUploadFile(null);
                            setDocumentAddedSuccess(false);
                          }}
                        >
                          Annuler
                        </Button>
                        <Button type="submit" disabled={addDocument.isPending || isUploading}>
                          {(addDocument.isPending || isUploading) ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {isUploading ? `Téléversement... ${uploadProgress}%` : "Ajout..."}
                            </>
                          ) : (
                            "Ajouter le document"
                          )}
                        </Button>
                      </>
                    )}
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Edit Document Dialog */}
          <Dialog open={showEditDialog} onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) {
              setEditingDocument(null);
              form.reset();
            }
          }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Modifier le document</DialogTitle>
                <DialogDescription>
                  Modifiez les informations du document
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => {
                  if (editingDocument) {
                    updateDocument.mutate({ ...values, id: editingDocument.id });
                  }
                })} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Champ Cote - Numéro de cote = nom du fichier */}
                    <FormField
                      control={form.control}
                      name="cote"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>N° de Cote</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Numéro de cote (nom du fichier)" readOnly className="bg-muted" />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Le numéro de cote correspond au nom du fichier téléchargé
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Titre *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Titre du document" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Auteur</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nom de l'auteur" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="file_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de document</FormLabel>
                          <FormControl>
                            <select
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="">Sélectionner</option>
                              <option value="manuscrit">Manuscrits</option>
                              <option value="livre">Livres</option>
                              <option value="lithographie">Lithographie</option>
                              <option value="periodique">Périodiques</option>
                              <option value="collection_specialisee">Collections Spécialisées</option>
                              <option value="audiovisuel">Audiovisuel</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="publication_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de publication</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="digitization_source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source de numérisation</FormLabel>
                          <FormControl>
                            <select
                              value={field.value || "internal"}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                              <option value="internal">Collections numérisées (BNRM)</option>
                              <option value="external">Ressources numériques (externe)</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="file_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL du fichier</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} placeholder="Description du document" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Note: Livre rare est géré via la table cbn_documents, pas digital_library_documents */}
                  </div>

                  {/* Permissions */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">Permissions et accès</h3>
                    
                    <FormField
                      control={form.control}
                      name="is_visible"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Visible sur le site</FormLabel>
                            <FormDescription>Le document apparaît dans la bibliothèque</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="download_enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Téléchargement activé</FormLabel>
                            <FormDescription>Autoriser le téléchargement du document</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="social_share_enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Partage sur réseaux sociaux</FormLabel>
                            <FormDescription>Activer le partage social</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email_share_enabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Partage par email</FormLabel>
                            <FormDescription>Activer l'envoi par email</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowEditDialog(false);
                      setEditingDocument(null);
                      form.reset();
                    }}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={updateDocument.isPending}>
                      {updateDocument.isPending ? "Modification..." : "Enregistrer les modifications"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par titre ou description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label>Visibilité</Label>
              <Select value={filterVisible} onValueChange={setFilterVisible}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="visible">Visibles uniquement</SelectItem>
                  <SelectItem value="hidden">Masqués uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Téléchargement</Label>
              <Select value={filterDownload} onValueChange={setFilterDownload}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="enabled">Activés uniquement</SelectItem>
                  <SelectItem value="disabled">Désactivés uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Documents ({filteredDocuments?.length || 0})</CardTitle>
              <CardDescription>
                Liste complète des documents numérisés
                {selectedDocIds.length > 0 && (
                  <span className="ml-2 text-primary font-medium">
                    • {selectedDocIds.length} sélectionné(s)
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedDocIds.length > 0 && (
                <>
                  <Button 
                    onClick={runBulkDelete}
                    disabled={bulkDeleteRunning || bulkOcrRunning}
                    variant="destructive"
                  >
                    {bulkDeleteRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer ({selectedDocIds.length})
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={runBulkOcrOnSelected}
                    disabled={bulkOcrRunning || bulkDeleteRunning}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {bulkOcrRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        OCR en cours...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        OCR ({selectedDocIds.length})
                      </>
                    )}
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : filteredDocuments && filteredDocuments.length > 0 ? (
            <DraggableDocumentsList
              documents={filteredDocuments as any}
              selectedDocIds={selectedDocIds}
              onToggleSelection={toggleDocumentSelection}
              onToggleSelectAll={toggleSelectAll}
              onViewDetails={(doc) => {
                setSelectedDocument(doc);
                setShowDetailsDialog(true);
              }}
              onEdit={(doc) => {
                setEditingDocument(doc);
                // Extraire le numéro de cote du nom de fichier PDF
                const extractCote = () => {
                  if ((doc as any).cbn_documents?.cote) return (doc as any).cbn_documents.cote;
                  if ((doc as any).pdf_url) {
                    try {
                      const fileName = (doc as any).pdf_url.split('/').pop() || '';
                      const decodedName = decodeURIComponent(fileName);
                      return decodedName.replace(/\.pdf$/i, '');
                    } catch {
                      return (doc as any).pdf_url.split('/').pop()?.replace(/\.pdf$/i, '') || '';
                    }
                  }
                  return '';
                };
                
                form.reset({
                  cote: extractCote(),
                  title: doc.title || "",
                  author: doc.author || "",
                  file_type: (doc as any).document_type || "",
                  publication_date: (doc as any).publication_year ? String((doc as any).publication_year) : "",
                  description: (doc as any).content_body || "",
                  file_url: (doc as any).pdf_url || "",
                  download_enabled: (doc as any).download_enabled ?? true,
                  is_visible: (doc as any).publication_status === 'published',
                  social_share_enabled: (doc as any).social_share_enabled ?? true,
                  email_share_enabled: (doc as any).email_share_enabled ?? true,
                  copyright_expires_at: (doc as any).copyright_expires_at || "",
                  copyright_derogation: false,
                  digitization_source: ((doc as any).digitization_source === 'external' ? 'external' : 'internal') as "internal" | "external",
                  is_rare_book: false,
                });
                setShowEditDialog(true);
              }}
              onDelete={(doc) => handleDeleteClick(doc)}
              onOcr={(doc) => openOcrDialog(doc)}
              onTranscription={(doc) => openTranscriptionDialog(doc)}
              onMarkAsOcrProcessed={(docId) => markAsOcrProcessed.mutate(docId)}
              ocrProcessingDocId={ocrProcessingDocId}
              transcriptionProcessingDocId={transcriptionProcessingDocId}
              clientOcrProgress={clientOcrProgress}
              clientOcrCurrentPage={clientOcrCurrentPage}
              clientOcrTotalPages={clientOcrTotalPages}
              transcriptionProgress={transcriptionProgress}
              extractionProgress={extractionProgress}
              isAudioVideo={isAudioVideoDocument}
              markAsOcrProcessedPending={markAsOcrProcessed.isPending}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucun document trouvé</p>
              <p className="text-sm mt-2">Ajoutez votre premier document pour commencer</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du document</DialogTitle>
            <DialogDescription>
              Informations complètes du document
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations principales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Titre</Label>
                    <p className="font-medium">{selectedDocument.title}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <p><Badge variant="outline">{selectedDocument.file_type || 'Non défini'}</Badge></p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Slug</Label>
                    <p className="font-mono text-sm">{selectedDocument.slug}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date de création</Label>
                    <p>{new Date(selectedDocument.created_at).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>
                {selectedDocument.content_body && (
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="mt-1 text-sm">{selectedDocument.content_body}</p>
                  </div>
                )}
                {selectedDocument.file_url && (
                  <div>
                    <Label className="text-muted-foreground">URL du fichier</Label>
                    <a 
                      href={selectedDocument.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block mt-1"
                    >
                      {selectedDocument.file_url}
                    </a>
                  </div>
                )}
              </div>

              {/* Permissions et accès */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Permissions et accès</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label>Visible sur le site</Label>
                    <Badge variant={selectedDocument.is_visible ? "default" : "secondary"}>
                      {selectedDocument.is_visible ? "Oui" : "Non"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label>Téléchargement</Label>
                    <Badge variant={selectedDocument.download_enabled ? "default" : "secondary"}>
                      {selectedDocument.download_enabled ? "Activé" : "Désactivé"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label>Partage social</Label>
                    <Badge variant={selectedDocument.social_share_enabled ? "default" : "secondary"}>
                      {selectedDocument.social_share_enabled ? "Activé" : "Désactivé"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label>Partage email</Label>
                    <Badge variant={selectedDocument.email_share_enabled ? "default" : "secondary"}>
                      {selectedDocument.email_share_enabled ? "Activé" : "Désactivé"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Droits d'auteur */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Droits d'auteur</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label>Dérogation temporaire</Label>
                    <Badge variant={selectedDocument.copyright_derogation ? "default" : "secondary"}>
                      {selectedDocument.copyright_derogation ? "Oui" : "Non"}
                    </Badge>
                  </div>
                  {selectedDocument.copyright_expires_at && (
                    <div className="p-3 border rounded-lg">
                      <Label className="text-muted-foreground">Date d'expiration</Label>
                      <p className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedDocument.copyright_expires_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Identifiant */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">ID du document</Label>
                <p className="font-mono text-xs bg-muted p-2 rounded">{selectedDocument.id}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="default" 
              onClick={() => {
                navigate(`/digital-library/book-reader/${selectedDocument.id}`);
                setShowDetailsDialog(false);
              }}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Consulter
            </Button>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="ocr" className="space-y-6">
          <Tabs defaultValue="pdf" className="w-full">
            <TabsList>
              <TabsTrigger value="pdf">OCR de PDF</TabsTrigger>
              <TabsTrigger value="manual">Import manuel</TabsTrigger>
            </TabsList>
            <TabsContent value="pdf" className="mt-4">
              <PdfOcrTool 
                preSelectedDocumentId={selectedDocument?.id}
                preSelectedDocumentTitle={selectedDocument?.title}
              />
            </TabsContent>
            <TabsContent value="manual" className="mt-4">
              <OcrImportTool />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="sigb" className="space-y-6">
          <SigbSyncManager />
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des doublons</CardTitle>
              <CardDescription>
                Identifiez et gérez les documents en double dans la bibliothèque numérique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="text-sm">
                    {sampleDuplicates.length} doublons détectés
                  </Badge>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Existant</TableHead>
                      <TableHead>ID Importé</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead>Identifiant commun</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleDuplicates.map((duplicate) => (
                      <TableRow key={duplicate.id}>
                        <TableCell className="font-mono text-sm">{duplicate.existing.id}</TableCell>
                        <TableCell className="font-mono text-sm">{duplicate.imported.id}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{duplicate.existing.title}</p>
                            <p className="text-sm text-muted-foreground">{duplicate.existing.author}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {duplicate.existing.isbn && (
                              <Badge variant="outline" className="w-fit text-xs">ISBN: {duplicate.existing.isbn}</Badge>
                            )}
                            {duplicate.existing.issn && (
                              <Badge variant="outline" className="w-fit text-xs">ISSN: {duplicate.existing.issn}</Badge>
                            )}
                            {duplicate.existing.ismn && (
                              <Badge variant="outline" className="w-fit text-xs">ISMN: {duplicate.existing.ismn}</Badge>
                            )}
                            {duplicate.existing.cote && (
                              <Badge variant="outline" className="w-fit text-xs">Cote: {duplicate.existing.cote}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleCompare(duplicate)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Comparer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Modale de comparaison */}
          <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Comparaison des documents</DialogTitle>
                <DialogDescription>
                  Comparez les détails des deux documents et choisissez lequel conserver
                </DialogDescription>
              </DialogHeader>

              {compareDocs && (
                <div className="space-y-6">
                  {/* Sélection de l'action */}
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-base">Action à effectuer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="keep-existing"
                          name="keep-selection"
                          checked={keepSelection === "existing"}
                          onChange={() => setKeepSelection("existing")}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="keep-existing" className="cursor-pointer font-normal">
                          Conserver uniquement le document existant
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="keep-imported"
                          name="keep-selection"
                          checked={keepSelection === "imported"}
                          onChange={() => setKeepSelection("imported")}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="keep-imported" className="cursor-pointer font-normal">
                          Conserver uniquement le document importé
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="keep-both"
                          name="keep-selection"
                          checked={keepSelection === "both"}
                          onChange={() => setKeepSelection("both")}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="keep-both" className="cursor-pointer font-normal">
                          Conserver les deux documents
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comparaison détaillée */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Document existant */}
                    <Card className={keepSelection === "existing" ? "border-primary border-2" : ""}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          Document Existant
                          <Badge variant="secondary">Actuel</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Bouton de visualisation */}
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            toast({
                              title: "Aperçu du document",
                              description: `Ouverture de ${compareDocs.existing.title}...`,
                            });
                            // Navigation vers la page de visualisation
                            // navigate(`/digital-library/document/${compareDocs.existing.id}`);
                          }}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Visualiser le document
                        </Button>
                        
                        {/* Aperçu visuel du document avec pagination */}
                        <div className="border rounded-lg overflow-hidden bg-muted/30">
                          <img 
                            src={compareDocs.pages?.[currentPageExisting] || compareDocs.previewImage} 
                            alt={`Aperçu - ${compareDocs.existing.title}`}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-2">
                            <div className="flex items-center justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPageExisting(Math.max(0, currentPageExisting - 1))}
                                disabled={currentPageExisting === 0}
                              >
                                ← Précédent
                              </Button>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Page {currentPageExisting + 1} / {compareDocs.pages?.length || 1}</p>
                                <p className="text-xs font-mono mt-1">{compareDocs.existing.id}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPageExisting(Math.min((compareDocs.pages?.length || 1) - 1, currentPageExisting + 1))}
                                disabled={currentPageExisting >= (compareDocs.pages?.length || 1) - 1}
                              >
                                Suivant →
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                        {[
                          { label: "ID", value: compareDocs.existing.id, key: "id", highlight: true },
                          { label: "Cote", value: compareDocs.existing.cote, key: "cote", highlight: true },
                          { label: "ISBN", value: compareDocs.existing.isbn || "-", key: "isbn", highlight: true },
                          { label: "ISSN", value: compareDocs.existing.issn || "-", key: "issn", highlight: true },
                          { label: "ISMN", value: compareDocs.existing.ismn || "-", key: "ismn", highlight: true },
                          { label: "Titre", value: compareDocs.existing.title, key: "title" },
                          { label: "Auteur", value: compareDocs.existing.author, key: "author" },
                          { label: "Éditeur", value: compareDocs.existing.editeur, key: "editeur" },
                          { label: "Date publication", value: compareDocs.existing.publication_date, key: "publication_date" },
                          { label: "Nombre pages", value: compareDocs.existing.nombre_pages, key: "nombre_pages" },
                        ].map((field) => {
                          const comparison = getFieldComparison(
                            field.key,
                            compareDocs.existing[field.key],
                            compareDocs.imported[field.key]
                          );
                          return (
                            <div
                              key={field.key}
                              className={`p-2 rounded ${
                                field.highlight && comparison.isIdentical && !comparison.isEmpty
                                  ? "bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700"
                                  : !comparison.isIdentical && !comparison.isEmpty
                                  ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                                  : ""
                              }`}
                            >
                              <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                              <p className="text-sm font-medium">{field.value}</p>
                            </div>
                          );
                        })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Document importé */}
                    <Card className={keepSelection === "imported" ? "border-primary border-2" : ""}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          Document Importé
                          <Badge variant="outline">Nouveau</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Bouton de visualisation */}
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            toast({
                              title: "Aperçu du document",
                              description: `Ouverture de ${compareDocs.imported.title}...`,
                            });
                            // Navigation vers la page de visualisation
                            // navigate(`/digital-library/document/${compareDocs.imported.id}`);
                          }}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Visualiser le document
                        </Button>
                        
                        {/* Aperçu visuel du document avec pagination */}
                        <div className="border rounded-lg overflow-hidden bg-muted/30">
                          <img 
                            src={compareDocs.pages?.[currentPageImported] || compareDocs.previewImage} 
                            alt={`Aperçu - ${compareDocs.imported.title}`}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-2">
                            <div className="flex items-center justify-between">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPageImported(Math.max(0, currentPageImported - 1))}
                                disabled={currentPageImported === 0}
                              >
                                ← Précédent
                              </Button>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Page {currentPageImported + 1} / {compareDocs.pages?.length || 1}</p>
                                <p className="text-xs font-mono mt-1">{compareDocs.imported.id}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPageImported(Math.min((compareDocs.pages?.length || 1) - 1, currentPageImported + 1))}
                                disabled={currentPageImported >= (compareDocs.pages?.length || 1) - 1}
                              >
                                Suivant →
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                        {[
                          { label: "ID", value: compareDocs.imported.id, key: "id", highlight: true },
                          { label: "Cote", value: compareDocs.imported.cote, key: "cote", highlight: true },
                          { label: "ISBN", value: compareDocs.imported.isbn || "-", key: "isbn", highlight: true },
                          { label: "ISSN", value: compareDocs.imported.issn || "-", key: "issn", highlight: true },
                          { label: "ISMN", value: compareDocs.imported.ismn || "-", key: "ismn", highlight: true },
                          { label: "Titre", value: compareDocs.imported.title, key: "title" },
                          { label: "Auteur", value: compareDocs.imported.author, key: "author" },
                          { label: "Éditeur", value: compareDocs.imported.editeur, key: "editeur" },
                          { label: "Date publication", value: compareDocs.imported.publication_date, key: "publication_date" },
                          { label: "Nombre pages", value: compareDocs.imported.nombre_pages, key: "nombre_pages" },
                        ].map((field) => {
                          const comparison = getFieldComparison(
                            field.key,
                            compareDocs.existing[field.key],
                            compareDocs.imported[field.key]
                          );
                          return (
                            <div
                              key={field.key}
                              className={`p-2 rounded ${
                                field.highlight && comparison.isIdentical && !comparison.isEmpty
                                  ? "bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700"
                                  : !comparison.isIdentical && !comparison.isEmpty
                                  ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                                  : ""
                              }`}
                            >
                              <p className="text-xs text-muted-foreground mb-1">{field.label}</p>
                              <p className="text-sm font-medium">{field.value}</p>
                            </div>
                          );
                        })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Légende */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded"></div>
                      <span>Identiques</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded"></div>
                      <span>Différents</span>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleKeepDocument}>
                  Confirmer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* OCR Dialog */}
      <Dialog open={showOcrDialog} onOpenChange={setShowOcrDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configuration OCR</DialogTitle>
            <DialogDescription>
              Configurez les paramètres pour l'OCR du document "{ocrDocumentTarget?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Warning if document is already OCR'd */}
            {ocrDocumentTarget?.ocr_processed && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Document déjà OCRisé</span>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  Ce document a déjà été traité par OCR. Relancer l'OCR écrasera les données existantes.
                </p>
              </div>
            )}
            
            {/* Show PDF info and mode selection if available */}
            {(ocrDocumentTarget?.pdf_url || ocrPdfFile) && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Fichier PDF disponible</span>
                  </div>
                </div>
                
                {/* OCR Mode Selection */}
                <div className="space-y-2">
                  <Label>Mode de traitement</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <label 
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        ocrMode === "extract" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="ocrMode" 
                        value="extract" 
                        checked={ocrMode === "extract"} 
                        onChange={() => setOcrMode("extract")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">Extraire le texte embarqué</span>
                          {pdfHasEmbeddedText && (
                            <Badge variant="secondary" className="text-xs">Recommandé</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pour les PDF déjà océrisés (Adobe Acrobat Pro, ABBYY, etc.). 
                          <span className="text-green-600 dark:text-green-400 font-medium"> Instantané et sans perte de qualité.</span>
                        </p>
                        {pdfHasEmbeddedText && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Texte embarqué détecté dans ce PDF
                          </p>
                        )}
                      </div>
                    </label>
                    
                    <label 
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        ocrMode === "ocr" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="ocrMode" 
                        value="ocr" 
                        checked={ocrMode === "ocr"} 
                        onChange={() => setOcrMode("ocr")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">Lancer l'OCR (Tesseract)</span>
                          {!pdfHasEmbeddedText && (
                            <Badge variant="secondary" className="text-xs">Pour PDF scannés</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pour les PDF scannés sans texte. Reconnaissance optique des caractères.
                          <span className="text-amber-600 dark:text-amber-400"> Plus lent mais nécessaire si pas de texte.</span>
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show existing pages info if available (no PDF) */}
            {!ocrDocumentTarget?.pdf_url && !ocrPdfFile && ocrExistingPagesCount > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <FileImage className="h-4 w-4" />
                  <span className="text-sm font-medium">{ocrExistingPagesCount} page(s) avec images disponibles</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                  L'OCR sera effectué sur les images de pages déjà importées.
                </p>
              </div>
            )}
            
            {/* PDF upload option when no PDF exists AND no pages with images */}
            {!ocrDocumentTarget?.pdf_url && ocrExistingPagesCount === 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Aucun fichier PDF associé</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ce document n'a pas de fichier PDF enregistré. Veuillez d'abord modifier le document pour téléverser un fichier PDF.
                </p>
              </div>
            )}
            
            {/* Language selection - only show for OCR mode */}
            {ocrMode === "ocr" && (
              <div className="space-y-2">
                <Label htmlFor="ocr-language">Langue du document</Label>
                <Select value={ocrLanguage} onValueChange={setOcrLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la langue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">Arabe</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">Anglais</SelectItem>
                    <SelectItem value="es">Espagnol</SelectItem>
                    <SelectItem value="lat">Latin</SelectItem>
                    <SelectItem value="amz">Amazighe (Tifinagh)</SelectItem>
                    <SelectItem value="mixed">Mixte (Arabe/Français)</SelectItem>
                  </SelectContent>
              </Select>
              </div>
            )}
            
            {/* Background execution option - only for OCR mode */}
            {ocrMode === "ocr" && (ocrDocumentTarget?.pdf_url || ocrPdfFile) && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="space-y-0.5">
                  <Label htmlFor="run-background" className="text-sm font-medium cursor-pointer">
                    Exécuter en arrière-plan
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Continuez à travailler pendant le traitement OCR
                  </p>
                </div>
                <Switch 
                  id="run-background" 
                  checked={runOcrInBackground} 
                  onCheckedChange={setRunOcrInBackground}
                />
              </div>
            )}
            
            {ocrDocumentTarget?.pages_count && (
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="text-sm">
                  <strong>Nombre de pages:</strong> {ocrDocumentTarget.pages_count}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowOcrDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={runOcrForDocument} 
              disabled={!ocrDocumentTarget?.pdf_url && !ocrPdfFile && ocrExistingPagesCount === 0}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {ocrPdfFile 
                ? "Uploader et traiter" 
                : ocrMode === "extract" 
                  ? "Extraire le texte" 
                  : runOcrInBackground
                    ? "Lancer en arrière-plan"
                    : "Lancer l'OCR"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transcription Language Selection Dialog */}
      <Dialog open={showTranscriptionDialog} onOpenChange={setShowTranscriptionDialog}>
        <DialogContent className="z-[10001]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Transcription audio/vidéo
            </DialogTitle>
            <DialogDescription>
              Sélectionnez la langue du contenu audio pour une meilleure transcription.
              {documentToTranscribe && (
                <span className="block mt-2 font-medium text-foreground">
                  Document : {documentToTranscribe.title}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Transcription Method Selection */}
            <div className="space-y-2">
              <Label>Méthode de transcription</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTranscriptionMethod("local")}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    transcriptionMethod === "local" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="font-medium text-sm">🖥️ Local</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    100% gratuit, dans le navigateur.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTranscriptionMethod("lovable-ai")}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    transcriptionMethod === "lovable-ai" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="font-medium text-sm">✨ Gemini</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cloud rapide. ~$0.001/min.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setTranscriptionMethod("openai")}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    transcriptionMethod === "openai" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="font-medium text-sm">☁️ OpenAI</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Whisper API. ~$0.006/min.
                  </p>
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label htmlFor="transcription-language">Langue de l'audio</Label>
              <Select 
                value={transcriptionLanguage} 
                onValueChange={setTranscriptionLanguage}
              >
                <SelectTrigger id="transcription-language" className="bg-background">
                  <SelectValue placeholder="Sélectionner une langue" />
                </SelectTrigger>
                <SelectContent className="bg-background z-[10002]">
                  {transcriptionLanguageOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Pour de meilleurs résultats, sélectionnez la langue exacte du contenu audio.
              </p>
            </div>

            {/* Method Info */}
            {transcriptionMethod === "lovable-ai" && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  <strong>Gemini :</strong> Transcription cloud via Google Gemini. Coût estimé : ~$0.001/min.
                </p>
              </div>
            )}
            {transcriptionMethod === "openai" && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Note :</strong> L'API OpenAI Whisper nécessite une clé API valide. Coût : ~$0.006 par minute d'audio.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTranscriptionDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => runTranscriptionForDocument(transcriptionLanguage)}>
              <Mic className="h-4 w-4 mr-2" />
              {transcriptionMethod === "lovable-ai" 
                ? "Transcrire (Gemini)" 
                : transcriptionMethod === "openai" 
                  ? "Transcrire (OpenAI)" 
                  : "Transcrire (Local)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Document Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="z-[10001]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le document "{documentToDelete?.title}" ? 
              Cette action est irréversible et supprimera également toutes les pages associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent className="z-[10001]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression en masse</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedDocIds.length} document(s) ? 
              Cette action est irréversible et supprimera également toutes les pages associées à ces documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer {selectedDocIds.length} document(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}