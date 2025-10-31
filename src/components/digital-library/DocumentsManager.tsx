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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, Trash2, Search, Download, FileText, Calendar, Filter, X, Eye, BookOpen, FileDown } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as XLSX from 'xlsx';

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
});

export default function DocumentsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState<string>("all");
  const [filterDownload, setFilterDownload] = useState<string>("all");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const form = useForm<z.infer<typeof documentSchema>>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      download_enabled: true,
      is_visible: true,
      social_share_enabled: true,
      email_share_enabled: true,
      copyright_derogation: false,
    },
  });

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['digital-library-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .in('content_type', ['page', 'news'])
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

  // Filter documents
  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content_body?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisible = filterVisible === "all" || 
                          (filterVisible === "visible" && doc.is_visible) ||
                          (filterVisible === "hidden" && !doc.is_visible);
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
      'localisation',
      'tags',
      'mots_cles_seo',
      'meta_titre',
      'meta_description',
      'url_image_mise_en_avant',
      
      // Métadonnées du catalogue (catalog_metadata)
      'isbn',
      'issn',
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
        <div className="flex gap-2">
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
                      isbn, issn, auteur_principal, co_auteurs, editeur, annee_publication, lieu_publication, edition, classification_dewey, classification_udc, nombre_pages, mots_cles, sujets, etc.
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="livre">Livre</SelectItem>
                              <SelectItem value="article">Article</SelectItem>
                              <SelectItem value="video">Vidéo</SelectItem>
                              <SelectItem value="audio">Audio</SelectItem>
                              <SelectItem value="manuscrit">Manuscrit</SelectItem>
                              <SelectItem value="periodique">Périodique</SelectItem>
                            </SelectContent>
                          </Select>
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
        </div>
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
                  <TableHead className="text-center">Visible</TableHead>
                  <TableHead className="text-center">Téléchargement</TableHead>
                  <TableHead className="text-center">Partage Social</TableHead>
                  <TableHead className="text-center">Email</TableHead>
                  <TableHead>Droits</TableHead>
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
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.file_type || 'Non défini'}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={doc.is_visible}
                        onCheckedChange={() => toggleField.mutate({ id: doc.id, field: 'is_visible', value: doc.is_visible })}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={doc.download_enabled}
                        onCheckedChange={() => toggleField.mutate({ id: doc.id, field: 'download_enabled', value: doc.download_enabled })}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={doc.social_share_enabled}
                        onCheckedChange={() => toggleField.mutate({ id: doc.id, field: 'social_share_enabled', value: doc.social_share_enabled })}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={doc.email_share_enabled}
                        onCheckedChange={() => toggleField.mutate({ id: doc.id, field: 'email_share_enabled', value: doc.email_share_enabled })}
                      />
                    </TableCell>
                    <TableCell>
                      {doc.copyright_expires_at ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">
                            {new Date(doc.copyright_expires_at).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Aucun</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
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
    </div>
  );
}