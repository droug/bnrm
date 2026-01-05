import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PortalSelect } from "@/components/ui/portal-select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Trash2, Search, Download, FileText, Calendar, Filter, X, Eye, BookOpen, FileDown, Pencil, Wand2, Loader2, FileSearch, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import OcrImportTool from "@/components/digital-library/import/OcrImportTool";
import PdfOcrTool from "@/components/digital-library/import/PdfOcrTool";
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
  title: z.string().min(1, "Le titre est requis"),
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
});

export default function DocumentsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
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
    setBatchOcrRunning(true);
    setBatchOcrResult(null);

    try {
      const baseUrl = window.location.origin;

      const { data, error } = await supabase.functions.invoke('batch-ocr-indexing', {
        body: {
          language: 'ar',
          baseUrl
        }
      });

      if (error) {
        throw error;
      }

      setBatchOcrResult(data);
      toast({
        title: "Indexation OCR terminée",
        description: `${data.totalPagesProcessed} pages traitées`
      });
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
    },
  });

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['digital-library-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('digital_library_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Add document
  const addDocument = useMutation({
    mutationFn: async (values: z.infer<typeof documentSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('content')
        .insert([{
          title: values.title,
          author_id: user?.id,
          content_body: values.description || '',
          content_type: 'page' as const,
          slug: values.title.toLowerCase().replace(/\s+/g, '-'),
          download_enabled: values.download_enabled,
          is_visible: values.is_visible,
          social_share_enabled: values.social_share_enabled,
          email_share_enabled: values.email_share_enabled,
          copyright_expires_at: values.copyright_expires_at || null,
          copyright_derogation: values.copyright_derogation,
          file_url: values.file_url || null,
          file_type: values.file_type || null,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      setShowAddDialog(false);
      form.reset();
      toast({ title: "Document ajouté avec succès" });
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
      const { error } = await supabase
        .from('content')
        .update({
          title: values.title,
          content_body: values.description || '',
          download_enabled: values.download_enabled,
          is_visible: values.is_visible,
          social_share_enabled: values.social_share_enabled,
          email_share_enabled: values.email_share_enabled,
          copyright_expires_at: values.copyright_expires_at || null,
          copyright_derogation: values.copyright_derogation,
          file_url: values.file_url || null,
          file_type: values.file_type || null,
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
      toast({
        title: "Erreur", 
        description: error.message, 
        variant: "destructive" 
      });
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
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Document supprimé" });
    }
  });

  // Ouvrir le dialogue OCR pour un document
  const openOcrDialog = (doc: any) => {
    setOcrDocumentTarget(doc);
    setOcrBaseUrl(doc.base_url || "");
    setOcrLanguage(doc.language || "ar");
    setShowOcrDialog(true);
  };

  // Lancer l'OCR avec les paramètres du dialogue
  const runOcrForDocument = async () => {
    if (!ocrDocumentTarget) return;
    
    if (!ocrBaseUrl.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir l'URL de base des images",
        variant: "destructive"
      });
      return;
    }

    setShowOcrDialog(false);
    setOcrProcessingDocId(ocrDocumentTarget.id);
    
    try {
      // Mettre à jour le base_url du document si différent
      if (ocrBaseUrl !== ocrDocumentTarget.base_url) {
        await supabase
          .from('digital_library_documents')
          .update({ base_url: ocrBaseUrl, language: ocrLanguage })
          .eq('id', ocrDocumentTarget.id);
      }

      const { data, error } = await supabase.functions.invoke('batch-ocr-indexing', {
        body: {
          documentId: ocrDocumentTarget.id,
          language: ocrLanguage,
          baseUrl: ocrBaseUrl
        }
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({
        title: "OCR terminé",
        description: `${data?.processedPages || 0} pages traitées pour "${ocrDocumentTarget.title}"`
      });
    } catch (error: any) {
      toast({
        title: "Erreur OCR",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setOcrProcessingDocId(null);
      setOcrDocumentTarget(null);
    }
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
        <div>
          <h1 className="text-3xl font-bold">Gestion des documents numérisés</h1>
          <p className="text-muted-foreground">
            Ajoutez, modifiez et gérez vos documents de la bibliothèque numérique
          </p>
        </div>
        <Button 
          onClick={handleBatchOcr}
          disabled={batchOcrRunning}
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
              OCR Auto (tous)
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
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center gap-1">
            <FileSearch className="h-4 w-4" />
            OCR
          </TabsTrigger>
          <TabsTrigger value="duplicates">Doublons</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <div className="flex gap-2 justify-end mb-6">
            <Button variant="outline" onClick={downloadTemplate}>
              <FileDown className="h-4 w-4 mr-2" />
              Télécharger le modèle
            </Button>
          <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import en masse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import en masse</DialogTitle>
                <DialogDescription>
                  Importez plusieurs documents via un fichier CSV ou Excel
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Glissez-déposez votre fichier</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Formats acceptés : CSV, Excel
                  </p>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Sélectionner un fichier
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Format Excel attendu :</p>
                  <div className="text-xs space-y-2">
                    <p className="font-medium">Champs principaux :</p>
                    <code className="text-xs block whitespace-pre-wrap break-all">
                      id, titre, slug, type_contenu, statut, description, url_fichier, type_fichier, date_publication, visible, telechargement_actif, partage_social, partage_email, etc.
                    </code>
                    <p className="font-medium mt-2">Métadonnées bibliographiques :</p>
                    <code className="text-xs block whitespace-pre-wrap break-all">
                      isbn, issn, ismn, auteur_principal, co_auteurs, editeur, annee_publication, lieu_publication, edition, classification_dewey, classification_udc, nombre_pages, mots_cles, sujets, etc.
                    </code>
                    <p className="text-muted-foreground mt-2">
                      Téléchargez le modèle Excel ci-dessous pour voir tous les champs disponibles avec des exemples.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Les colonnes booléennes acceptent : true/false, oui/non, 1/0
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Types de contenu acceptés : livre, article, video, audio, manuscrit, periodique, these, rapport, multimedia
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Format des dates : YYYY-MM-DD (ex: 2024-01-15)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Listes multiples (séparées par ;) : tags, mots_cles, sujets, co_auteurs, editeurs, illustrateurs, traducteurs, etc.
                  </p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={downloadTemplate}
                    className="mt-2 h-auto p-0"
                  >
                    <FileDown className="h-3 w-3 mr-1" />
                    Télécharger le modèle Excel complet avec exemples
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un document</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du document à ajouter
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => addDocument.mutate(values))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                            <PortalSelect
                              placeholder="Sélectionner"
                              value={field.value}
                              onChange={field.onChange}
                              options={[
                                { value: "livre", label: "Livre" },
                                { value: "article", label: "Article" },
                                { value: "video", label: "Vidéo" },
                                { value: "audio", label: "Audio" },
                                { value: "manuscrit", label: "Manuscrit" },
                                { value: "periodique", label: "Périodique" },
                              ]}
                            />
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
                            <PortalSelect
                              placeholder="Sélectionner"
                              value={field.value}
                              onChange={field.onChange}
                              options={[
                                { value: "internal", label: "Collections numérisées", description: "Numérisé par la BNRM" },
                                { value: "external", label: "Ressources numériques", description: "Reçu déjà numérisé" },
                              ]}
                            />
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

                  {/* Droits d'auteur */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">Droits d'auteur</h3>
                    
                    <FormField
                      control={form.control}
                      name="copyright_derogation"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Dérogation temporaire</FormLabel>
                            <FormDescription>Document sous droits avec dérogation limitée</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="copyright_expires_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date d'expiration des droits</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormDescription>
                            Une alerte sera générée 3 mois avant l'expiration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={addDocument.isPending}>
                      {addDocument.isPending ? "Ajout..." : "Ajouter le document"}
                    </Button>
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
                            <PortalSelect
                              placeholder="Sélectionner"
                              value={field.value}
                              onChange={field.onChange}
                              options={[
                                { value: "livre", label: "Livre" },
                                { value: "article", label: "Article" },
                                { value: "video", label: "Vidéo" },
                                { value: "audio", label: "Audio" },
                                { value: "manuscrit", label: "Manuscrit" },
                                { value: "periodique", label: "Périodique" },
                              ]}
                            />
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
                            <PortalSelect
                              placeholder="Sélectionner"
                              value={field.value}
                              onChange={field.onChange}
                              options={[
                                { value: "internal", label: "Collections numérisées", description: "Numérisé par la BNRM" },
                                { value: "external", label: "Ressources numériques", description: "Reçu déjà numérisé" },
                              ]}
                            />
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

                  {/* Droits d'auteur */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold">Droits d'auteur</h3>
                    
                    <FormField
                      control={form.control}
                      name="copyright_derogation"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Dérogation temporaire</FormLabel>
                            <FormDescription>Document sous droits avec dérogation limitée</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="copyright_expires_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date d'expiration du copyright</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormDescription>
                            Une alerte sera générée 3 mois avant l'expiration
                          </FormDescription>
                          <FormMessage />
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
        </div>

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
              <CardDescription>Liste complète des documents numérisés</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : filteredDocuments && filteredDocuments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead className="text-center">Téléchargement</TableHead>
                  <TableHead className="text-center">Impression</TableHead>
                  <TableHead>OCR</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.document_type || doc.file_format || 'Non défini'}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{doc.author || '-'}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={doc.download_enabled ?? false}
                        onCheckedChange={() => toggleField.mutate({ id: doc.id, field: 'download_enabled', value: doc.download_enabled ?? false })}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={doc.print_enabled ?? false}
                        onCheckedChange={() => toggleField.mutate({ id: doc.id, field: 'print_enabled', value: doc.print_enabled ?? false })}
                      />
                    </TableCell>
                    <TableCell>
                      {doc.ocr_processed ? (
                        <Badge variant="default" className="bg-green-600">Oui</Badge>
                      ) : (
                        <Badge variant="secondary">Non</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openOcrDialog(doc)}
                          disabled={ocrProcessingDocId === doc.id}
                          title="Lancer l'OCR"
                        >
                          {ocrProcessingDocId === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Wand2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingDocument(doc);
                            form.reset({
                              title: doc.title || '',
                              author: doc.author || '',
                              file_type: doc.file_format || '',
                              publication_date: doc.publication_year?.toString() || '',
                              description: '',
                              file_url: doc.pdf_url || '',
                              download_enabled: doc.download_enabled ?? true,
                              is_visible: doc.publication_status === 'published',
                              social_share_enabled: true,
                              email_share_enabled: true,
                              copyright_expires_at: '',
                              copyright_derogation: false,
                              digitization_source: (doc.digitization_source === 'external' ? 'external' : 'internal') as "internal" | "external",
                            });
                            setShowEditDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
                              deleteDocument.mutate(doc.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
              <PdfOcrTool />
            </TabsContent>
            <TabsContent value="manual" className="mt-4">
              <OcrImportTool />
            </TabsContent>
          </Tabs>
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
            <div className="space-y-2">
              <Label htmlFor="ocr-base-url">URL de base des images *</Label>
              <Input
                id="ocr-base-url"
                placeholder="https://storage.example.com"
                value={ocrBaseUrl}
                onChange={(e) => setOcrBaseUrl(e.target.value)}
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Formats d'URL recherchés :</strong></p>
                <ul className="list-disc list-inside ml-2 space-y-0.5">
                  <li>{ocrBaseUrl || "https://..."}/digital-library-pages/{ocrDocumentTarget?.id?.slice(0, 8)}.../<strong>page_1.jpg</strong></li>
                  <li>{ocrBaseUrl || "https://..."}/digital-library-pages/{ocrDocumentTarget?.id?.slice(0, 8)}.../<strong>img_p1_1.jpg</strong></li>
                </ul>
              </div>
            </div>
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
                  <SelectItem value="mixed">Mixte (Arabe/Français)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {ocrDocumentTarget?.pages_count && (
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="text-sm">
                  <strong>Nombre de pages:</strong> {ocrDocumentTarget.pages_count}
                </p>
                <p className="text-xs text-muted-foreground">
                  Les images doivent être nommées page_1.jpg, page_2.jpg... ou img_p1_1.jpg, img_p2_1.jpg...
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOcrDialog(false)}>
              Annuler
            </Button>
            <Button onClick={runOcrForDocument} disabled={!ocrBaseUrl.trim()}>
              <Wand2 className="h-4 w-4 mr-2" />
              Lancer l'OCR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}