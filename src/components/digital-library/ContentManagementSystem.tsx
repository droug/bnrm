import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CmsPagesManager from "@/components/cms/CmsPagesManager";
import CmsWebhooksManager from "@/components/cms/CmsWebhooksManager";
import CmsMediaManager from "@/components/cms/CmsMediaManager";
import CmsActualitesManager from "@/components/cms/CmsActualitesManager";
import CmsEvenementsManager from "@/components/cms/CmsEvenementsManager";
import CmsMenusManager from "@/components/cms/CmsMenusManager";

export default function ContentManagementSystem() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Système de Gestion de Contenu (CMS)
        </h1>
        <p className="text-lg text-muted-foreground">
          Créez et gérez tout le contenu de la plateforme avec sections drag & drop, webhooks et médias bilingues
        </p>
      </div>

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="media">Médias</TabsTrigger>
          <TabsTrigger value="actualites">Actualités</TabsTrigger>
          <TabsTrigger value="evenements">Événements</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <CmsPagesManager />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <CmsWebhooksManager />
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <CmsMediaManager />
        </TabsContent>

        <TabsContent value="actualites" className="space-y-4">
          <CmsActualitesManager />
        </TabsContent>

        <TabsContent value="evenements" className="space-y-4">
          <CmsEvenementsManager />
        </TabsContent>

        <TabsContent value="menus" className="space-y-4">
          <CmsMenusManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
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

      {/* Editor Dialog - WordPress Style */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 gap-0">
          <div className="flex flex-col h-[95vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 bg-muted/30">
              <DialogTitle className="flex items-center gap-2">
                <FileEdit className="h-5 w-5" />
                {editingContent ? 'Modifier le contenu' : 'Nouveau contenu'}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={closeEditor}>
                  Annuler
                </Button>
                <Button onClick={() => saveContent.mutate()} disabled={!formData.title}>
                  <Send className="h-4 w-4 mr-2" />
                  {editingContent ? 'Mettre à jour' : 'Publier'}
                </Button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Main Editor Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="space-y-2">
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Saisissez le titre ici"
                      className="text-3xl font-bold border-0 focus-visible:ring-0 px-0 h-auto"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="slug-de-lurl"
                      className="text-sm text-muted-foreground border-0 focus-visible:ring-0 px-0"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <WysiwygEditor
                      value={formData.content_body}
                      onChange={(value) => setFormData({ ...formData, content_body: value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Extrait</Label>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Résumé optionnel du contenu..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Les extraits sont des résumés courts de votre contenu qui s'affichent dans les listes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-80 border-l bg-muted/20 overflow-y-auto">
                <div className="p-4 space-y-6">
                  {/* Publication */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Publication
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Statut</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: ContentStatus) => 
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Brouillon</SelectItem>
                            <SelectItem value="published">Publié</SelectItem>
                            <SelectItem value="archived">Archivé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="sidebar-visible"
                          checked={formData.is_visible}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, is_visible: checked })
                          }
                        />
                        <Label htmlFor="sidebar-visible" className="text-sm">
                          Visible pour le public
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Type de contenu */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Type de contenu
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={formData.content_type}
                        onValueChange={(value: ContentType) => 
                          setFormData({ ...formData, content_type: value })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="page">Page</SelectItem>
                          <SelectItem value="news">Actualité</SelectItem>
                          <SelectItem value="event">Événement</SelectItem>
                          <SelectItem value="exhibition">Exhibition</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Image vedette */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Image vedette
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        value={formData.featured_image_url}
                        onChange={(e) => 
                          setFormData({ ...formData, featured_image_url: e.target.value })
                        }
                        placeholder="URL de l'image"
                        className="h-8"
                      />
                      {formData.featured_image_url && (
                        <div className="relative group">
                          <img
                            src={formData.featured_image_url}
                            alt="Aperçu"
                            className="w-full h-32 object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setFormData({ ...formData, featured_image_url: '' })}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* SEO */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Référencement (SEO)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Titre SEO</Label>
                        <Input
                          value={formData.metadata.seo_title}
                          onChange={(e) => 
                            setFormData({
                              ...formData,
                              metadata: { ...formData.metadata, seo_title: e.target.value }
                            })
                          }
                          placeholder="Titre optimisé"
                          className="h-8"
                          maxLength={60}
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.metadata.seo_title.length}/60
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Description SEO</Label>
                        <Textarea
                          value={formData.metadata.seo_description}
                          onChange={(e) => 
                            setFormData({
                              ...formData,
                              metadata: { ...formData.metadata, seo_description: e.target.value }
                            })
                          }
                          placeholder="Description"
                          rows={3}
                          maxLength={160}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          {formData.metadata.seo_description.length}/160
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Catégorie</Label>
                        <Input
                          value={formData.metadata.category}
                          onChange={(e) => 
                            setFormData({
                              ...formData,
                              metadata: { ...formData.metadata, category: e.target.value }
                            })
                          }
                          placeholder="Culture, Histoire..."
                          className="h-8"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
