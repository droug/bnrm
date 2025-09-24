import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { WatermarkContainer } from "@/components/ui/watermark";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  Eye, 
  Edit, 
  Trash2, 
  Filter,
  Star,
  Clock,
  BookOpen,
  Image as ImageIcon,
  Tag,
  Archive,
  Workflow,
  Shield,
  ArrowLeft,
  Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Navigate, Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import Header from "@/components/Header";
import ContentEditor from "@/components/ContentEditor";
import ArchivingManager from "@/components/ArchivingManager";
import WorkflowManager from "@/components/WorkflowManager";
import LegalDepositManager from "@/components/LegalDepositManager";
import { ActivityMonitor } from "@/components/ActivityMonitor";

interface Content {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_body: string;
  content_type: 'news' | 'event' | 'exhibition' | 'page';
  status: 'draft' | 'published' | 'archived';
  featured_image_url?: string;
  author_id: string;
  published_at?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  tags?: string[];
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

const CONTENT_TYPES = {
  news: { name: 'Actualités', icon: FileText, color: 'bg-blue-500' },
  event: { name: 'Événements', icon: Calendar, color: 'bg-green-500' },
  exhibition: { name: 'Expositions', icon: ImageIcon, color: 'bg-purple-500' },
  page: { name: 'Pages', icon: BookOpen, color: 'bg-orange-500' }
};

const STATUS_CONFIG = {
  draft: { name: 'Brouillon', variant: 'secondary' as const, icon: Clock },
  published: { name: 'Publié', variant: 'default' as const, icon: Eye },
  archived: { name: 'Archivé', variant: 'outline' as const, icon: FileText }
};

export default function ContentManagement() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);

  useEffect(() => {
    if (user && (profile?.role === 'admin' || profile?.role === 'librarian')) {
      fetchContents();
    }
  }, [user, profile]);

  const fetchContents = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          profiles:author_id (first_name, last_name)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setContents((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les contenus",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Contenu supprimé",
        description: "Le contenu a été supprimé avec succès",
      });

      fetchContents();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le contenu",
        variant: "destructive",
      });
    }
  };

  const handleToggleFeature = async (contentId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('content')
        .update({ is_featured: !isFeatured })
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: isFeatured ? "Contenu non mis en avant" : "Contenu mis en avant",
        description: `Le contenu a été ${isFeatured ? 'retiré des' : 'ajouté aux'} contenus en vedette`,
      });

      fetchContents();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut vedette",
        variant: "destructive",
      });
    }
  };

  const handleChangeStatus = async (contentId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'published') {
        updates.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('content')
        .update(updates)
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Le contenu est maintenant ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG].name.toLowerCase()}`,
      });

      fetchContents();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut",
        variant: "destructive",
      });
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || content.status === statusFilter;
    const matchesType = typeFilter === "all" || content.content_type === typeFilter;
    const matchesTab = selectedTab === "all" || content.content_type === selectedTab;

    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContentStats = () => {
    return {
      total: contents.length,
      published: contents.filter(c => c.status === 'published').length,
      draft: contents.filter(c => c.status === 'draft').length,
      featured: contents.filter(c => c.is_featured).length,
      byType: {
        news: contents.filter(c => c.content_type === 'news').length,
        event: contents.filter(c => c.content_type === 'event').length,
        exhibition: contents.filter(c => c.content_type === 'exhibition').length,
        page: contents.filter(c => c.content_type === 'page').length,
      }
    };
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (profile?.role !== 'admin' && profile?.role !== 'librarian')) {
    return <Navigate to="/dashboard" replace />;
  }

  const stats = getContentStats();

  if (showEditor) {
    return (
      <ContentEditor
        content={editingContent}
        onSave={async () => {
          setShowEditor(false);
          setEditingContent(null);
          await fetchContents();
        }}
        onCancel={() => {
          setShowEditor(false);
          setEditingContent(null);
        }}
      />
    );
  }

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM Admin - Gestion de Contenu", 
        variant: "subtle", 
        position: "pattern",
        opacity: 0.02
      }}
    >
      <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Tableau de bord
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Gestion de contenu</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                Gestion de Contenu (CMS)
              </h1>
              <p className="text-muted-foreground mt-2">
                Créez et gérez actualités, événements, expositions et pages informatives
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Link>
              </Button>
              <Button 
                onClick={() => {
                  setEditingContent(null);
                  setShowEditor(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouveau Contenu
              </Button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Publiés</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Brouillons</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.draft}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">En vedette</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans les contenus..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                  <SelectItem value="published">Publiés</SelectItem>
                  <SelectItem value="archived">Archivés</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="news">Actualités</SelectItem>
                  <SelectItem value="event">Événements</SelectItem>
                  <SelectItem value="exhibition">Expositions</SelectItem>
                  <SelectItem value="page">Pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Onglets par type */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Tous ({stats.total})</TabsTrigger>
            <TabsTrigger value="news">Actualités ({stats.byType.news})</TabsTrigger>
            <TabsTrigger value="event">Événements ({stats.byType.event})</TabsTrigger>
            <TabsTrigger value="exhibition">Expositions ({stats.byType.exhibition})</TabsTrigger>
            <TabsTrigger value="page">Pages ({stats.byType.page})</TabsTrigger>
          </TabsList>

          {/* Onglets de contenu */}
          <TabsContent value={selectedTab} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedTab === "all" ? "Tous les contenus" : CONTENT_TYPES[selectedTab as keyof typeof CONTENT_TYPES]?.name}
                  </CardTitle>
                  <CardDescription>
                    {filteredContents.length} contenu(s) trouvé(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Auteur</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Vues</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContents.map((content) => {
                          const ContentIcon = CONTENT_TYPES[content.content_type].icon;
                          
                          return (
                            <TableRow key={content.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <ContentIcon className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <div className="font-medium">{content.title}</div>
                                      {content.is_featured && (
                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                      )}
                                    </div>
                                    {content.excerpt && (
                                      <div className="text-sm text-muted-foreground line-clamp-1">
                                        {content.excerpt}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={CONTENT_TYPES[content.content_type].color}>
                                  {CONTENT_TYPES[content.content_type].name}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={content.status}
                                  onValueChange={(value) => handleChangeStatus(content.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="draft">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        Brouillon
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="published">
                                      <div className="flex items-center gap-2">
                                        <Eye className="h-3 w-3" />
                                        Publié
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="archived">
                                      <div className="flex items-center gap-2">
                                        <Archive className="h-3 w-3" />
                                        Archivé
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                {content.profiles && (
                                  <div className="text-sm">
                                    {content.profiles.first_name} {content.profiles.last_name}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {content.published_at ? (
                                    <div>Publié: {formatDate(content.published_at)}</div>
                                  ) : (
                                    <div>Créé: {formatDate(content.created_at)}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3 text-muted-foreground" />
                                  {content.view_count}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleFeature(content.id, content.is_featured)}
                                  >
                                    <Star className={`h-3 w-3 ${content.is_featured ? 'fill-current text-yellow-500' : ''}`} />
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingContent(content);
                                      setShowEditor(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Êtes-vous sûr de vouloir supprimer "{content.title}" ? Cette action est irréversible.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteContent(content.id)}>
                                          Supprimer
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {filteredContents.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Aucun contenu trouvé
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {selectedTab === "all" ? "Aucun contenu n'a été créé" : `Aucun contenu de type "${CONTENT_TYPES[selectedTab as keyof typeof CONTENT_TYPES]?.name}" trouvé`}
                      </p>
                      {selectedTab === "all" && (
                        <Button
                          className="mt-4"
                          onClick={() => {
                            setEditingContent(null);
                            setShowEditor(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Créer un contenu
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
        </Tabs>
      </main>
      </div>
    </WatermarkContainer>
  );
}