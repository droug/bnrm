import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Upload, Trash2, Search, Edit, Eye, FileText } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const manuscriptSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(500),
  author: z.string().max(200).optional(),
  language: z.string().optional(),
  period: z.string().max(100).optional(),
  material: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  inventory_number: z.string().max(100).optional(),
  cote: z.string().max(100).optional(),
  genre: z.string().max(100).optional(),
  historical_period: z.string().max(100).optional(),
  source: z.string().max(200).optional(),
  access_level: z.enum(['public', 'restricted', 'confidential']).default('public'),
  is_digitized: z.boolean().default(true),
  digitization_date: z.string().optional(),
});

export default function DocumentsManagerManuscripts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingManuscript, setEditingManuscript] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [filterAccess, setFilterAccess] = useState<string>("all");

  const form = useForm<z.infer<typeof manuscriptSchema>>({
    resolver: zodResolver(manuscriptSchema),
    defaultValues: {
      access_level: 'public',
    },
  });

  // Fetch manuscripts
  const { data: manuscripts, isLoading } = useQuery({
    queryKey: ['manuscripts-backoffice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manuscripts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Add manuscript
  const addManuscript = useMutation({
    mutationFn: async (values: z.infer<typeof manuscriptSchema>) => {
      const { error } = await supabase
        .from('manuscripts')
        .insert([{
          title: values.title,
          author: values.author || null,
          language: values.language || null,
          period: values.period || null,
          material: values.material || null,
          description: values.description || null,
          inventory_number: values.inventory_number || null,
          cote: values.cote || null,
          genre: values.genre || null,
          historical_period: values.historical_period || null,
          source: values.source || null,
          access_level: values.access_level,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manuscripts-backoffice'] });
      setShowAddDialog(false);
      form.reset();
      toast({ title: "Manuscrit ajouté avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Update manuscript
  const updateManuscript = useMutation({
    mutationFn: async (values: z.infer<typeof manuscriptSchema> & { id: string }) => {
      const { error } = await supabase
        .from('manuscripts')
        .update({
          title: values.title,
          author: values.author || null,
          language: values.language || null,
          period: values.period || null,
          material: values.material || null,
          description: values.description || null,
          inventory_number: values.inventory_number || null,
          cote: values.cote || null,
          genre: values.genre || null,
          historical_period: values.historical_period || null,
          source: values.source || null,
          access_level: values.access_level,
        })
        .eq('id', values.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manuscripts-backoffice'] });
      setEditingManuscript(null);
      form.reset();
      toast({ title: "Manuscrit mis à jour" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Delete manuscript
  const deleteManuscript = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('manuscripts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manuscripts-backoffice'] });
      toast({ title: "Manuscrit supprimé" });
    }
  });

  // Filter manuscripts
  const filteredManuscripts = manuscripts?.filter(ms => {
    const matchesSearch = ms.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ms.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ms.cote?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = filterLanguage === "all" || ms.language === filterLanguage;
    const matchesAccess = filterAccess === "all" || ms.access_level === filterAccess;
    
    return matchesSearch && matchesLanguage && matchesAccess;
  });

  const handleEdit = (manuscript: any) => {
    setEditingManuscript(manuscript);
    form.reset({
      title: manuscript.title,
      author: manuscript.author || '',
      language: manuscript.language || '',
      period: manuscript.period || '',
      material: manuscript.material || '',
      description: manuscript.description || '',
      inventory_number: manuscript.inventory_number || '',
      cote: manuscript.cote || '',
      genre: manuscript.genre || '',
      historical_period: manuscript.historical_period || '',
      source: manuscript.source || '',
      access_level: manuscript.access_level,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Manuscrits Numérisés</h2>
          <p className="text-muted-foreground">
            Ajoutez, modifiez et gérez les manuscrits de la collection
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un manuscrit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un manuscrit</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du manuscrit à numériser
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => addManuscript.mutate(values))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Titre *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Titre du manuscrit" />
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
                      name="cote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cote</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Cote du manuscrit" />
                          </FormControl>
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="arabic">Arabe</SelectItem>
                              <SelectItem value="french">Français</SelectItem>
                              <SelectItem value="berber">Amazighe</SelectItem>
                              <SelectItem value="latin">Latin</SelectItem>
                              <SelectItem value="hebrew">Hébreu</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="period"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Période</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: XVe siècle" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="material"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Matériau</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="paper">Papier</SelectItem>
                              <SelectItem value="parchment">Parchemin</SelectItem>
                              <SelectItem value="vellum">Vélin</SelectItem>
                              <SelectItem value="papyrus">Papyrus</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="genre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Religieux, Scientifique" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="inventory_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro d'inventaire</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="N° inventaire" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source/Provenance</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Origine du manuscrit" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="historical_period"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Période Historique</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Médiévale" />
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
                            <Textarea {...field} rows={3} placeholder="Description détaillée du manuscrit" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>


                  {/* Niveau d'accès */}
                  <div className="border rounded-lg p-4">
                    <FormField
                      control={form.control}
                      name="access_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Niveau d'accès</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="restricted">Restreint</SelectItem>
                              <SelectItem value="confidential">Confidentiel</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Détermine qui peut consulter ce manuscrit
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
                    <Button type="submit" disabled={addManuscript.isPending}>
                      {addManuscript.isPending ? "Ajout..." : "Ajouter le manuscrit"}
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
          <CardTitle>Filtres de recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, auteur, cote..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterLanguage} onValueChange={setFilterLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les langues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les langues</SelectItem>
                <SelectItem value="arabic">Arabe</SelectItem>
                <SelectItem value="french">Français</SelectItem>
                <SelectItem value="berber">Amazighe</SelectItem>
                <SelectItem value="latin">Latin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAccess} onValueChange={setFilterAccess}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les niveaux d'accès" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="restricted">Restreint</SelectItem>
                <SelectItem value="confidential">Confidentiel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Manuscrits</div>
            <div className="text-2xl font-bold">{manuscripts?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Avec Images</div>
            <div className="text-2xl font-bold text-green-600">
              {manuscripts?.filter(m => m.thumbnail_url).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Accès Public</div>
            <div className="text-2xl font-bold text-blue-600">
              {manuscripts?.filter(m => m.access_level === 'public').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Langues</div>
            <div className="text-2xl font-bold">
              {new Set(manuscripts?.map(m => m.language).filter(Boolean)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des manuscrits</CardTitle>
          <CardDescription>
            {filteredManuscripts?.length || 0} manuscrit(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Cote</TableHead>
                  <TableHead>Langue</TableHead>
                  <TableHead>Accès</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredManuscripts?.map((manuscript) => (
                  <TableRow key={manuscript.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {manuscript.title}
                    </TableCell>
                    <TableCell>{manuscript.author || '-'}</TableCell>
                    <TableCell>{manuscript.cote || '-'}</TableCell>
                    <TableCell>
                      {manuscript.language ? (
                        <Badge variant="outline">{manuscript.language}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          manuscript.access_level === 'public' ? 'default' :
                          manuscript.access_level === 'restricted' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {manuscript.access_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {manuscript.thumbnail_url ? (
                        <Badge variant="default" className="bg-green-600">Avec images</Badge>
                      ) : (
                        <Badge variant="outline">Sans images</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(manuscript)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteManuscript.mutate(manuscript.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingManuscript && (
        <Dialog open={!!editingManuscript} onOpenChange={() => setEditingManuscript(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le manuscrit</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => updateManuscript.mutate({ ...values, id: editingManuscript.id }))} className="space-y-4">
                {/* Same form fields as add dialog */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Titre *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Add all other fields similar to add dialog */}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingManuscript(null)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={updateManuscript.isPending}>
                    {updateManuscript.isPending ? "Modification..." : "Modifier"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}