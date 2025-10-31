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
import { Plus, Upload, Trash2, Search, Download, FileText, Calendar, Filter, X, Eye, BookOpen } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
                  <p className="text-sm font-semibold mb-2">Format CSV attendu :</p>
                  <code className="text-xs block">
                    titre,auteur,type,date_publication,url_fichier,description,telechargement_actif,visible,partage_social,partage_email
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Les colonnes booléennes acceptent : true/false, oui/non, 1/0
                  </p>
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