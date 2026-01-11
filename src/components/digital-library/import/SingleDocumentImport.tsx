import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Plus } from "lucide-react";

const documentSchema = z.object({
  // Informations principales
  title: z.string().min(1, "Le titre est requis"),
  title_ar: z.string().optional(),
  author: z.string().optional(),
  document_type: z.string().optional(),
  language: z.string().optional(),
  publication_year: z.coerce.number().optional(),
  
  // Fichiers
  pdf_url: z.string().url("URL invalide").optional().or(z.literal("")),
  cover_image_url: z.string().url("URL invalide").optional().or(z.literal("")),
  thumbnail_url: z.string().url("URL invalide").optional().or(z.literal("")),
  pages_count: z.coerce.number().min(1, "Au moins 1 page"),
  file_size_mb: z.coerce.number().optional(),
  file_format: z.string().optional(),
  
  // Numérisation
  digitization_source: z.enum(["internal", "external"]).default("internal"),
  digitization_quality: z.string().optional(),
  digitization_date: z.string().optional(),
  ocr_processed: z.boolean().default(false),
  
  // Collections & thèmes
  themes: z.string().optional(), // séparés par ;
  digital_collections: z.string().optional(), // séparés par ;
  
  // Accès & droits
  access_level: z.enum(["public", "registered", "restricted"]).default("public"),
  requires_authentication: z.boolean().default(false),
  download_enabled: z.boolean().default(true),
  print_enabled: z.boolean().default(true),
  publication_status: z.enum(["draft", "published", "archived"]).default("draft"),
  
  // Métadonnées catalogue (optionnelles)
  cbn_document_id: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

interface SingleDocumentImportProps {
  onSuccess?: () => void;
}

export default function SingleDocumentImport({ onSuccess }: SingleDocumentImportProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      pages_count: 1,
      digitization_source: "internal",
      access_level: "public",
      requires_authentication: false,
      download_enabled: true,
      print_enabled: true,
      publication_status: "draft",
      ocr_processed: false,
    },
  });

  const createDocument = useMutation({
    mutationFn: async (values: DocumentFormValues) => {
      let finalCbnId: string | undefined;

      // If user provided a cbn_document_id (UUID), check if it exists
      if (values.cbn_document_id) {
        const { data: existingCbn } = await supabase
          .from('cbn_documents')
          .select('id')
          .eq('id', values.cbn_document_id)
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
            title: values.title,
            title_ar: values.title_ar || null,
            author: values.author || null,
            document_type: values.document_type || 'livre',
            publication_year: values.publication_year || null,
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
      
      // Créer le document dans digital_library_documents
      const { error } = await supabase
        .from('digital_library_documents')
        .insert({
          cbn_document_id: finalCbnId,
          title: values.title,
          title_ar: values.title_ar || null,
          author: values.author || null,
          document_type: values.document_type || null,
          language: values.language || null,
          publication_year: values.publication_year || null,
          pdf_url: values.pdf_url || null,
          cover_image_url: values.cover_image_url || null,
          thumbnail_url: values.thumbnail_url || null,
          pages_count: values.pages_count,
          file_size_mb: values.file_size_mb || null,
          file_format: values.file_format || null,
          digitization_source: values.digitization_source,
          digitization_quality: values.digitization_quality || null,
          digitization_date: values.digitization_date || null,
          ocr_processed: values.ocr_processed,
          themes: values.themes ? values.themes.split(';').map(t => t.trim()) : null,
          digital_collections: values.digital_collections ? values.digital_collections.split(';').map(c => c.trim()) : null,
          access_level: values.access_level,
          requires_authentication: values.requires_authentication,
          download_enabled: values.download_enabled,
          print_enabled: values.print_enabled,
          publication_status: values.publication_status,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents'] });
      toast({ title: "Document créé avec succès" });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({ 
        title: "Erreur lors de la création", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = async (values: DocumentFormValues) => {
    setIsSubmitting(true);
    try {
      await createDocument.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations principales</CardTitle>
            <CardDescription>Données essentielles du document</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Titre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre du document" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title_ar"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Titre (Arabe)</FormLabel>
                  <FormControl>
                    <Input placeholder="العنوان بالعربية" dir="rtl" {...field} />
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
                    <Input placeholder="Nom de l'auteur" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="document_type"
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
                      <SelectItem value="these">Thèse</SelectItem>
                      <SelectItem value="rapport">Rapport</SelectItem>
                      <SelectItem value="periodique">Périodique</SelectItem>
                      <SelectItem value="manuscrit">Manuscrit</SelectItem>
                      <SelectItem value="carte">Carte</SelectItem>
                      <SelectItem value="multimedia">Multimédia</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Langue</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">Arabe</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="es">Espagnol</SelectItem>
                      <SelectItem value="multi">Multilingue</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="publication_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Année de publication</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Fichiers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fichiers numériques</CardTitle>
            <CardDescription>URLs des fichiers PDF et images</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="pdf_url"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>URL du fichier PDF</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL image de couverture</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL miniature</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pages_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de pages *</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="file_size_mb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taille du fichier (Mo)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="Ex: 5.2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="file_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format de fichier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="PDF/A">PDF/A</SelectItem>
                      <SelectItem value="JPEG">JPEG</SelectItem>
                      <SelectItem value="TIFF">TIFF</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Numérisation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Numérisation</CardTitle>
            <CardDescription>Informations sur la numérisation</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="digitization_source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source de numérisation</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="internal">Numérisé par la BNRM</SelectItem>
                      <SelectItem value="external">Reçu numérisé (externe)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="digitization_quality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualité de numérisation</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">Haute (300+ DPI)</SelectItem>
                      <SelectItem value="medium">Moyenne (150-300 DPI)</SelectItem>
                      <SelectItem value="low">Basse (&lt;150 DPI)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="digitization_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de numérisation</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ocr_processed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>OCR traité</FormLabel>
                    <FormDescription>
                      Le document a-t-il été traité par OCR ?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Thèmes & Collections */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Classification</CardTitle>
            <CardDescription>Thèmes et collections numériques</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <FormField
              control={form.control}
              name="themes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thèmes</FormLabel>
                  <FormControl>
                    <Input placeholder="histoire;culture;patrimoine (séparés par ;)" {...field} />
                  </FormControl>
                  <FormDescription>Séparez les thèmes par des points-virgules</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="digital_collections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collections numériques</FormLabel>
                  <FormControl>
                    <Input placeholder="patrimoine marocain;manuscrits anciens" {...field} />
                  </FormControl>
                  <FormDescription>Séparez les collections par des points-virgules</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Accès & Droits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accès et droits</CardTitle>
            <CardDescription>Paramètres de visibilité et de téléchargement</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="access_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau d'accès</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="registered">Utilisateurs inscrits</SelectItem>
                      <SelectItem value="restricted">Accès restreint</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="publication_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut de publication</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requires_authentication"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Authentification requise</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="download_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Téléchargement autorisé</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="print_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Impression autorisée</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Lien catalogue (optionnel) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lien au catalogue (optionnel)</CardTitle>
            <CardDescription>Associer à une notice existante du CBN</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="cbn_document_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Notice CBN</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: b1121115 (laisser vide pour auto-générer)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Si vide, un identifiant unique sera généré automatiquement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Réinitialiser
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Créer le document
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
