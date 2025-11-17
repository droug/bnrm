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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  Calendar, 
  Tag, 
  Image as ImageIcon,
  Upload,
  Clock,
  Globe,
  Lock,
  FileEdit,
  Copy,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  LayoutGrid,
  List
} from "lucide-react";
import { format } from "date-fns";

type ContentType = 'page' | 'news' | 'event' | 'exhibition';
type ContentStatus = 'draft' | 'published' | 'archived';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content_type: ContentType;
  status: ContentStatus;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  author_id?: string;
  excerpt?: string;
  content_body?: string;
  featured_image_url?: string;
  metadata?: any;
}

export default function ContentManagementSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ContentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content_type: 'page' as ContentType,
    status: 'draft' as ContentStatus,
    is_visible: true,
    excerpt: '',
    content_body: '',
    featured_image_url: '',
    metadata: {
      seo_title: '',
      seo_description: '',
      tags: [] as string[],
      category: '',
      custom_fields: {}
    }
  });

  // Fetch all content
  const { data: contents, isLoading } = useQuery({
    queryKey: ['cms-contents', filterType, filterStatus, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('content_type', filterType);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContentItem[];
    }
  });

  // Create or update content
  const saveContent = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const contentData = {
        title: formData.title,
        slug,
        content_type: formData.content_type,
        status: formData.status,
        is_visible: formData.is_visible,
        excerpt: formData.excerpt,
        content_body: formData.content_body,
        featured_image_url: formData.featured_image_url,
        metadata: formData.metadata,
        updated_at: new Date().toISOString(),
        author_id: userData?.user?.id || '',
        ...(formData.status === 'published' && !editingContent?.published_at && {
          published_at: new Date().toISOString()
        })
      };

      if (editingContent) {
        const { error } = await supabase
          .from('content')
          .update(contentData)
          .eq('id', editingContent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('content')
          .insert([{ ...contentData, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-contents'] });
      toast({ title: editingContent ? "Contenu mis à jour" : "Contenu créé avec succès" });
      closeEditor();
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Delete content
  const deleteContent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-contents'] });
      toast({ title: "Contenu supprimé" });
    },
    onError: () => {
      toast({ 
        title: "Erreur", 
        description: "Impossible de supprimer le contenu",
        variant: "destructive" 
      });
    }
  });

  // Duplicate content
  const duplicateContent = useMutation({
    mutationFn: async (content: ContentItem) => {
      const { data: userData } = await supabase.auth.getUser();
      const { id, created_at, updated_at, published_at, ...duplicateData } = content;
      const newSlug = `${duplicateData.slug}-copie-${Date.now()}`;
      
      const { error } = await supabase
        .from('content')
        .insert([{
          title: `${duplicateData.title} (Copie)`,
          slug: newSlug,
          content_type: duplicateData.content_type,
          status: 'draft' as ContentStatus,
          is_visible: duplicateData.is_visible,
          excerpt: duplicateData.excerpt,
          content_body: duplicateData.content_body,
          featured_image_url: duplicateData.featured_image_url,
          metadata: duplicateData.metadata,
          author_id: userData?.user?.id || '',
          created_at: new Date().toISOString()
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-contents'] });
      toast({ title: "Contenu dupliqué avec succès" });
    }
  });

  const openEditor = (content?: ContentItem) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        title: content.title || '',
        slug: content.slug || '',
        content_type: content.content_type,
        status: content.status,
        is_visible: content.is_visible,
        excerpt: content.excerpt || '',
        content_body: content.content_body || '',
        featured_image_url: content.featured_image_url || '',
        metadata: content.metadata || {
          seo_title: '',
          seo_description: '',
          tags: [],
          category: '',
          custom_fields: {}
        }
      });
    } else {
      setEditingContent(null);
      setFormData({
        title: '',
        slug: '',
        content_type: 'page',
        status: 'draft',
        is_visible: true,
        excerpt: '',
        content_body: '',
        featured_image_url: '',
        metadata: {
          seo_title: '',
          seo_description: '',
          tags: [],
          category: '',
          custom_fields: {}
        }
      });
    }
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingContent(null);
  };

  const getStatusBadge = (status: ContentStatus) => {
    const variants: Record<ContentStatus, { variant: any; label: string; icon: any }> = {
      draft: { variant: 'secondary', label: 'Brouillon', icon: FileEdit },
      published: { variant: 'default', label: 'Publié', icon: CheckCircle2 },
      archived: { variant: 'destructive', label: 'Archivé', icon: AlertCircle }
    };
    const config = variants[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getContentTypeLabel = (type: ContentType) => {
    const labels: Record<ContentType, string> = {
      page: 'Page',
      news: 'Actualité',
      event: 'Événement',
      exhibition: 'Exhibition'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Système de Gestion de Contenu
              </CardTitle>
              <CardDescription>
                Créez, modifiez et gérez tout le contenu de votre bibliothèque numérique
              </CardDescription>
            </div>
            <Button onClick={() => openEditor()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau contenu
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un contenu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type de contenu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="page">Pages</SelectItem>
                <SelectItem value="news">Actualités</SelectItem>
                <SelectItem value="event">Événements</SelectItem>
                <SelectItem value="exhibition">Exhibitions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
                <SelectItem value="published">Publiés</SelectItem>
                <SelectItem value="archived">Archivés</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content List/Grid */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Chargement...</div>
          ) : !contents || contents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun contenu trouvé
            </div>
          ) : viewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Visibilité</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contents.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-medium">{content.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getContentTypeLabel(content.content_type)}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(content.status)}</TableCell>
                    <TableCell>
                      {content.is_visible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(content.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditor(content)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicateContent.mutate(content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
                              deleteContent.mutate(content.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contents.map((content) => (
                <Card key={content.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {content.featured_image_url && (
                      <img
                        src={content.featured_image_url}
                        alt={content.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2">{content.title}</CardTitle>
                      {content.is_visible ? (
                        <Eye className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getContentTypeLabel(content.content_type)}
                      </Badge>
                      {getStatusBadge(content.status)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(content.created_at), 'dd/MM/yyyy')}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditor(content)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => duplicateContent.mutate(content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Modifier le contenu' : 'Nouveau contenu'}
            </DialogTitle>
            <DialogDescription>
              Créez ou modifiez le contenu de votre bibliothèque numérique
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="media">Médias</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Entrez le titre du contenu"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content_type">Type de contenu</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value: ContentType) => 
                      setFormData({ ...formData, content_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="news">Actualité</SelectItem>
                      <SelectItem value="event">Événement</SelectItem>
                      <SelectItem value="exhibition">Exhibition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: ContentStatus) => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-du-contenu"
                />
                <p className="text-xs text-muted-foreground">
                  Laissez vide pour générer automatiquement à partir du titre
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Résumé</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Bref résumé du contenu"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, is_visible: checked })
                  }
                />
                <Label htmlFor="is_visible">Visible pour le public</Label>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="content_body">Contenu principal</Label>
                <Textarea
                  id="content_body"
                  value={formData.content_body}
                  onChange={(e) => setFormData({ ...formData, content_body: e.target.value })}
                  placeholder="Contenu détaillé..."
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Vous pouvez utiliser du HTML ou du Markdown
                </p>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="featured_image_url">URL de l'image vedette</Label>
                <Input
                  id="featured_image_url"
                  value={formData.featured_image_url}
                  onChange={(e) => 
                    setFormData({ ...formData, featured_image_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              {formData.featured_image_url && (
                <div className="border rounded-lg p-4">
                  <img
                    src={formData.featured_image_url}
                    alt="Aperçu"
                    className="w-full max-h-64 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <ImageIcon className="inline h-4 w-4 mr-2" />
                  Conseil : Utilisez des images optimisées pour le web (format WebP, taille réduite)
                </p>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">Titre SEO</Label>
                <Input
                  id="seo_title"
                  value={formData.metadata.seo_title}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, seo_title: e.target.value }
                    })
                  }
                  placeholder="Titre optimisé pour les moteurs de recherche"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.metadata.seo_title.length}/60 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">Description SEO</Label>
                <Textarea
                  id="seo_description"
                  value={formData.metadata.seo_description}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, seo_description: e.target.value }
                    })
                  }
                  placeholder="Description pour les moteurs de recherche"
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.metadata.seo_description.length}/160 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={formData.metadata.category}
                  onChange={(e) => 
                    setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, category: e.target.value }
                    })
                  }
                  placeholder="Ex: Culture, Histoire, Événements"
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Globe className="inline h-4 w-4 mr-2" />
                  Les métadonnées SEO améliorent la visibilité de votre contenu sur les moteurs de recherche
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditor}>
              Annuler
            </Button>
            <Button onClick={() => saveContent.mutate()} disabled={!formData.title}>
              <Save className="h-4 w-4 mr-2" />
              {editingContent ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
