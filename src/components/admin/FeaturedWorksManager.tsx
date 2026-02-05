import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff,
  Star,
  Image as ImageIcon,
  FileText,
  BookOpen,
  Link as LinkIcon,
  Search,
  GripVertical,
  Upload,
  Loader2,
  X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PdfMetadataExtractor from "./PdfMetadataExtractor";

interface FeaturedWork {
  id: string;
  document_id: string | null;
  custom_title: string | null;
  custom_title_ar: string | null;
  custom_author: string | null;
  custom_image_url: string | null;
  custom_category: string | null;
  custom_date: string | null;
  custom_description: string | null;
  custom_link: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  // Joined document data
  document?: {
    id: string;
    title: string;
    author: string | null;
    cover_image_url: string | null;
    document_type: string | null;
    publication_year: number | null;
    views_count: number | null;
  };
}

interface DigitalLibraryDocument {
  id: string;
  title: string;
  author: string | null;
  cover_image_url: string | null;
  document_type: string | null;
  publication_year: number | null;
}

export default function FeaturedWorksManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<FeaturedWork | null>(null);
  const [formMode, setFormMode] = useState<'document' | 'custom'>('document');
  const [searchQuery, setSearchQuery] = useState("");
  const [coteSearch, setCoteSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    document_id: "",
    custom_title: "",
    custom_title_ar: "",
    custom_author: "",
    custom_image_url: "",
    custom_category: "",
    custom_type: "",
    custom_type_other: "",
    custom_date: "",
    custom_description: "",
    custom_link: "",
    is_active: true
  });

  // Fetch featured works
  const { data: featuredWorks = [], isLoading } = useQuery({
    queryKey: ['featured-works'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('digital_library_featured_works')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      // Fetch document details for each work with document_id
      const worksWithDocs = await Promise.all(
        (data || []).map(async (work: any) => {
          if (work.document_id) {
            const { data: docData } = await supabase
              .from('digital_library_documents')
              .select('id, title, author, cover_image_url, document_type, publication_year, views_count')
              .eq('id', work.document_id)
              .single();
            return { ...work, document: docData };
          }
          return work;
        })
      );
      
      return worksWithDocs as FeaturedWork[];
    }
  });

  // Search documents by cote
  const { data: coteResults = [] } = useQuery({
    queryKey: ['search-documents-cote', coteSearch],
    queryFn: async () => {
      if (!coteSearch || coteSearch.length < 1) return [];
      
      const { data, error } = await supabase
        .from('digital_library_documents')
        .select('id, title, author, cover_image_url, document_type, publication_year, cbn_documents!fk_digital_library_cbn_document(cote)')
        .not('cbn_document_id', 'is', null)
        .limit(20);
      
      if (error) throw error;
      
      // Filter by cote on client side since it's a joined field
      return (data || []).filter((doc: any) => 
        doc.cbn_documents?.cote?.toLowerCase().includes(coteSearch.toLowerCase())
      ).map((doc: any) => ({
        ...doc,
        cote: doc.cbn_documents?.cote
      }));
    },
    enabled: coteSearch.length >= 1
  });

  // Search documents by title/author
  const { data: searchResults = [] } = useQuery({
    queryKey: ['search-documents', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('digital_library_documents')
        .select('id, title, author, cover_image_url, document_type, publication_year, cbn_documents!fk_digital_library_cbn_document(cote)')
        .or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`)
        .limit(10);
      
      if (error) throw error;
      return (data || []).map((doc: any) => ({
        ...doc,
        cote: doc.cbn_documents?.cote
      }));
    },
    enabled: searchQuery.length >= 2
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        document_id: formMode === 'document' && data.document_id ? data.document_id : null,
        custom_title: formMode === 'custom' ? data.custom_title || null : null,
        custom_title_ar: formMode === 'custom' ? data.custom_title_ar || null : null,
        custom_author: formMode === 'custom' ? data.custom_author || null : null,
        custom_image_url: formMode === 'custom' ? data.custom_image_url || null : null,
        custom_category: data.custom_category || null,
        custom_date: data.custom_date || null,
        custom_description: data.custom_description || null,
        custom_link: data.custom_link || null,
        is_active: data.is_active
      };

      if (data.id) {
        const { error } = await supabase
          .from('digital_library_featured_works')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        // Get max order
        const maxOrder = Math.max(0, ...featuredWorks.map(w => w.display_order));
        const { error } = await supabase
          .from('digital_library_featured_works')
          .insert({ ...payload, display_order: maxOrder + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-works'] });
      toast({ title: editingWork ? "Œuvre mise à jour" : "Œuvre ajoutée" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('digital_library_featured_works')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-works'] });
      toast({ title: "Œuvre supprimée" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  // Move order mutation
  const moveOrderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string, direction: 'up' | 'down' }) => {
      const currentIndex = featuredWorks.findIndex(w => w.id === id);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (targetIndex < 0 || targetIndex >= featuredWorks.length) return;
      
      const currentWork = featuredWorks[currentIndex];
      const targetWork = featuredWorks[targetIndex];
      
      await supabase
        .from('digital_library_featured_works')
        .update({ display_order: targetWork.display_order })
        .eq('id', currentWork.id);
        
      await supabase
        .from('digital_library_featured_works')
        .update({ display_order: currentWork.display_order })
        .eq('id', targetWork.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-works'] });
    }
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await supabase
        .from('digital_library_featured_works')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-works'] });
      toast({ title: "Statut mis à jour" });
    }
  });

  const resetForm = () => {
    setFormData({
      document_id: "",
      custom_title: "",
      custom_title_ar: "",
      custom_author: "",
      custom_image_url: "",
      custom_category: "",
      custom_type: "",
      custom_type_other: "",
      custom_date: "",
      custom_description: "",
      custom_link: "",
      is_active: true
    });
    setEditingWork(null);
    setFormMode('document');
    setSearchQuery("");
    setCoteSearch("");
    setIsDialogOpen(false);
  };

  const handleEdit = (work: FeaturedWork) => {
    setEditingWork(work);
    setFormMode(work.document_id ? 'document' : 'custom');
    setFormData({
      document_id: work.document_id || "",
      custom_title: work.custom_title || "",
      custom_title_ar: work.custom_title_ar || "",
      custom_author: work.custom_author || "",
      custom_image_url: work.custom_image_url || "",
      custom_category: work.custom_category || "",
      custom_type: (work as any).custom_type || "",
      custom_type_other: (work as any).custom_type_other || "",
      custom_date: work.custom_date || "",
      custom_description: work.custom_description || "",
      custom_link: work.custom_link || "",
      is_active: work.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingWork?.id });
  };

  const getWorkTitle = (work: FeaturedWork) => {
    if (work.document?.title) return work.document.title;
    if (work.custom_title) return work.custom_title;
    return "Sans titre";
  };

  const getWorkImage = (work: FeaturedWork) => {
    if (work.document?.cover_image_url) return work.document.cover_image_url;
    if (work.custom_image_url) return work.custom_image_url;
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Œuvres Vedettes du Carousel
          </CardTitle>
          <CardDescription>
            Gérez les documents affichés dans le carousel de la bibliothèque numérique
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une œuvre
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWork ? "Modifier l'œuvre vedette" : "Ajouter une œuvre vedette"}
              </DialogTitle>
              <DialogDescription>
                Sélectionnez un document existant ou créez une entrée personnalisée
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs value={formMode} onValueChange={(v) => setFormMode(v as 'document' | 'custom')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="document" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Document existant
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Entrée personnalisée
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="document" className="space-y-4 mt-4">
                  {/* Cote search field - FIRST */}
                  <div className="space-y-2">
                    <Label className="font-semibold">Recherche par Cote</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Entrez la cote du document..."
                        value={coteSearch}
                        onChange={(e) => { setCoteSearch(e.target.value); setSearchQuery(""); }}
                        className="pl-10"
                      />
                    </div>
                    
                    {coteResults.length > 0 && (
                      <div className="border rounded-md max-h-48 overflow-y-auto">
                        {coteResults.map((doc: any) => (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, document_id: doc.id }));
                              setCoteSearch("");
                            }}
                            className={`p-3 cursor-pointer hover:bg-accent flex items-center gap-3 border-b last:border-b-0 ${
                              formData.document_id === doc.id ? 'bg-accent' : ''
                            }`}
                          >
                            {doc.cover_image_url ? (
                              <img src={doc.cover_image_url} alt="" className="w-10 h-14 object-cover rounded" />
                            ) : (
                              <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <Badge variant="outline" className="mb-1">{doc.cote}</Badge>
                              <div className="font-medium line-clamp-1">{doc.title}</div>
                              <div className="text-sm text-muted-foreground">{doc.author || "Auteur inconnu"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  {/* Title/Author search field */}
                  <div className="space-y-2">
                    <Label>Recherche par titre ou auteur</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Titre ou auteur..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCoteSearch(""); }}
                        className="pl-10"
                      />
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="border rounded-md max-h-48 overflow-y-auto">
                        {searchResults.map((doc: any) => (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, document_id: doc.id }));
                              setSearchQuery("");
                            }}
                            className={`p-3 cursor-pointer hover:bg-accent flex items-center gap-3 border-b last:border-b-0 ${
                              formData.document_id === doc.id ? 'bg-accent' : ''
                            }`}
                          >
                            {doc.cover_image_url ? (
                              <img src={doc.cover_image_url} alt="" className="w-10 h-14 object-cover rounded" />
                            ) : (
                              <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              {doc.cote && <Badge variant="outline" className="mb-1">{doc.cote}</Badge>}
                              <div className="font-medium line-clamp-1">{doc.title}</div>
                              <div className="text-sm text-muted-foreground">{doc.author || "Auteur inconnu"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                    
                  {formData.document_id && (
                    <div className="p-3 bg-accent/50 rounded-md flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="font-medium">Document sélectionné</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, document_id: "" }))}
                      >
                        Changer
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="custom" className="space-y-4 mt-4">
                  {/* PDF Metadata Extractor */}
                  <PdfMetadataExtractor 
                    onDataExtracted={(data) => {
                      setFormData(prev => ({
                        ...prev,
                        custom_title: data.title || prev.custom_title,
                        custom_title_ar: data.title_ar || prev.custom_title_ar,
                        custom_author: data.author || prev.custom_author,
                        custom_image_url: data.cover_image_url || prev.custom_image_url,
                        custom_description: data.description || prev.custom_description,
                        custom_date: data.date || prev.custom_date,
                      }));
                    }}
                  />
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">ou saisir manuellement</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Titre (FR)</Label>
                      <Input
                        value={formData.custom_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, custom_title: e.target.value }))}
                        placeholder="Titre de l'œuvre"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Titre (AR)</Label>
                      <Input
                        dir="rtl"
                        value={formData.custom_title_ar}
                        onChange={(e) => setFormData(prev => ({ ...prev, custom_title_ar: e.target.value }))}
                        placeholder="العنوان بالعربية"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Auteur</Label>
                    <Input
                      value={formData.custom_author}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_author: e.target.value }))}
                      placeholder="Nom de l'auteur"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Image de l'œuvre</Label>
                    <div className="space-y-3">
                      {/* Image preview */}
                      {formData.custom_image_url && (
                        <div className="relative inline-block">
                          <img 
                            src={formData.custom_image_url} 
                            alt="Aperçu" 
                            className="w-24 h-32 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => setFormData(prev => ({ ...prev, custom_image_url: "" }))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Upload button */}
                      <div className="flex gap-2">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={isUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              if (file.size > 5 * 1024 * 1024) {
                                toast({ title: "Erreur", description: "L'image ne doit pas dépasser 5 Mo", variant: "destructive" });
                                return;
                              }
                              
                              setIsUploading(true);
                              try {
                                const fileExt = file.name.split('.').pop();
                                const fileName = `featured-works/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                                
                                const { error: uploadError } = await supabase.storage
                                  .from('digital-library')
                                  .upload(fileName, file);
                                
                                if (uploadError) throw uploadError;
                                
                                const { data: { publicUrl } } = supabase.storage
                                  .from('digital-library')
                                  .getPublicUrl(fileName);
                                
                                setFormData(prev => ({ ...prev, custom_image_url: publicUrl }));
                                toast({ title: "Image téléchargée avec succès" });
                              } catch (error: any) {
                                toast({ title: "Erreur", description: error.message, variant: "destructive" });
                              } finally {
                                setIsUploading(false);
                              }
                            }}
                          />
                          <Button type="button" variant="outline" disabled={isUploading} className="gap-2">
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            {isUploading ? "Téléchargement..." : "Télécharger une image"}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">ou saisir une URL</span>
                        </div>
                      </div>
                      
                      <Input
                        type="url"
                        value={formData.custom_image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, custom_image_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Common fields */}
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={formData.custom_category}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, custom_category: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manuscrits">Manuscrits</SelectItem>
                        <SelectItem value="Périodiques">Périodiques</SelectItem>
                        <SelectItem value="Monographies">Monographies</SelectItem>
                        <SelectItem value="Collections Spécialisées">Collections Spécialisées</SelectItem>
                        <SelectItem value="Audiovisuels">Audiovisuels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.custom_type}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, custom_type: v, custom_type_other: v !== "Autre" ? "" : prev.custom_type_other }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Livre">Livre</SelectItem>
                        <SelectItem value="Manuscrit">Manuscrit</SelectItem>
                        <SelectItem value="Carte">Carte</SelectItem>
                        <SelectItem value="Estampe">Estampe</SelectItem>
                        <SelectItem value="Journal">Journal</SelectItem>
                        <SelectItem value="Revue">Revue</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {formData.custom_type === "Autre" && (
                  <div className="space-y-2">
                    <Label>Précisez le type</Label>
                    <Input
                      value={formData.custom_type_other}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_type_other: e.target.value }))}
                      placeholder="Saisissez le type de document..."
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Période/Date</Label>
                    <Input
                      value={formData.custom_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_date: e.target.value }))}
                      placeholder="Ex: XVe siècle, 1920-1930..."
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.custom_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_description: e.target.value }))}
                    placeholder="Description courte de l'œuvre"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Lien personnalisé (optionnel)</Label>
                  <Input
                    type="url"
                    value={formData.custom_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_link: e.target.value }))}
                    placeholder="/digital-library/document/..."
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_active: v }))}
                  />
                  <Label>Afficher dans le carousel</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Enregistrement..." : editingWork ? "Mettre à jour" : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : featuredWorks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune œuvre vedette configurée</p>
            <p className="text-sm mt-1">Cliquez sur "Ajouter une œuvre" pour commencer</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Ordre</TableHead>
                  <TableHead>Œuvre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featuredWorks.map((work, index) => (
                  <TableRow key={work.id} className={!work.is_active ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === 0}
                          onClick={() => moveOrderMutation.mutate({ id: work.id, direction: 'up' })}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <span className="text-center text-sm font-medium">{work.display_order}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === featuredWorks.length - 1}
                          onClick={() => moveOrderMutation.mutate({ id: work.id, direction: 'down' })}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getWorkImage(work) ? (
                          <img src={getWorkImage(work)!} alt="" className="w-10 h-14 object-cover rounded shadow" />
                        ) : (
                          <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium line-clamp-1">{getWorkTitle(work)}</div>
                          <div className="text-sm text-muted-foreground">
                            {work.document?.author || work.custom_author || "Auteur inconnu"}
                          </div>
                          {work.custom_date && (
                            <div className="text-xs text-muted-foreground">{work.custom_date}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {work.custom_category && (
                        <Badge variant="secondary">{work.custom_category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={work.document_id ? "default" : "outline"}>
                        {work.document_id ? "Document lié" : "Personnalisé"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActiveMutation.mutate({ id: work.id, is_active: !work.is_active })}
                      >
                        {work.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(work)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cette œuvre vedette ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. L'œuvre sera retirée du carousel.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(work.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
