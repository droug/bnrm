import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MultilingualWysiwygEditor, { MultilingualContent } from "./MultilingualWysiwygEditor";
import { 
  Save, 
  Plus, 
  Trash2, 
  FileText, 
  Clock, 
  CheckCircle, 
  Eye, 
  Edit2,
  Copy,
  Globe,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ContentItem {
  id: string;
  slug: string;
  title_fr: string;
  title_ar: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const defaultContent: MultilingualContent = {
  fr: '',
  ar: '',
  en: '',
  es: '',
  amz: ''
};

const defaultTitles: MultilingualContent = {
  fr: '',
  ar: '',
  en: '',
  es: '',
  amz: ''
};

export default function CmsWysiwygModule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [titles, setTitles] = useState<MultilingualContent>(defaultTitles);
  const [content, setContent] = useState<MultilingualContent>(defaultContent);
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [contentType, setContentType] = useState("page");

  // Fetch content items
  const { data: contentItems, isLoading } = useQuery({
    queryKey: ['cms-wysiwyg-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as ContentItem[];
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (item: Partial<ContentItem>) => {
      if (selectedItem) {
        const { error } = await supabase
          .from('cms_pages')
          .update({
            title_fr: titles.fr,
            title_ar: titles.ar || null,
            slug,
            status,
            updated_at: new Date().toISOString(),
            seo_title_fr: titles.fr,
            seo_title_ar: titles.ar || null,
          })
          .eq('id', selectedItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cms_pages')
          .insert({
            title_fr: titles.fr,
            title_ar: titles.ar || null,
            slug,
            status,
            seo_title_fr: titles.fr,
            seo_title_ar: titles.ar || null,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Contenu sauvegardé",
        description: "Le contenu a été enregistré avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['cms-wysiwyg-content'] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le contenu.",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cms_pages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Contenu supprimé",
        description: "Le contenu a été supprimé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['cms-wysiwyg-content'] });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le contenu.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setSelectedItem(null);
    setIsCreating(false);
    setTitles(defaultTitles);
    setContent(defaultContent);
    setSlug("");
    setStatus('draft');
    setContentType("page");
  };

  const handleSelectItem = (item: ContentItem) => {
    setSelectedItem(item);
    setIsCreating(false);
    setTitles({
      fr: item.title_fr || '',
      ar: item.title_ar || '',
      en: '',
      es: '',
      amz: ''
    });
    setContent({
      fr: '',
      ar: '',
      en: '',
      es: '',
      amz: ''
    });
    setSlug(item.slug);
    setStatus(item.status as 'draft' | 'published' | 'archived');
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsCreating(true);
    setTitles(defaultTitles);
    setContent(defaultContent);
    setSlug("");
    setStatus('draft');
    setContentType("page");
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (newTitles: MultilingualContent) => {
    setTitles(newTitles);
    if (!selectedItem && newTitles.fr && !slug) {
      setSlug(generateSlug(newTitles.fr));
    }
  };

  const filteredItems = contentItems?.filter(item => 
    item.title_fr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Publié</Badge>;
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-muted-foreground">Archivé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none bg-gradient-to-br from-pink-500/10 via-pink-400/5 to-background shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <FileText className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Éditeur WYSIWYG Multilingue</CardTitle>
                <CardDescription>
                  Créez et gérez du contenu enrichi en 4 langues (FR, AR, EN, Amazighe)
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau contenu
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Sidebar - Content List */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Chargement...</p>
                ) : filteredItems?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun contenu trouvé</p>
                ) : (
                  filteredItems?.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedItem?.id === item.id 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.title_fr}</p>
                          <p className="text-xs text-muted-foreground truncate">/{item.slug}</p>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(item.updated_at), 'dd MMM yyyy', { locale: fr })}</span>
                        {item.title_ar && (
                          <>
                            <span>•</span>
                            <Globe className="h-3 w-3" />
                            <span>Bilingue</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Editor Area */}
        <div className="space-y-4">
          {!selectedItem && !isCreating ? (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto">
                  <Edit2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">Aucun contenu sélectionné</h3>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez un contenu existant ou créez-en un nouveau
                  </p>
                </div>
                <Button onClick={handleCreate} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer un nouveau contenu
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Metadata */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {isCreating ? 'Nouveau contenu' : 'Modifier le contenu'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Titre (Français) *</Label>
                      <Input
                        value={titles.fr}
                        onChange={(e) => handleTitleChange({ ...titles, fr: e.target.value })}
                        placeholder="Titre de la page"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Titre (العربية)</Label>
                      <Input
                        value={titles.ar}
                        onChange={(e) => setTitles({ ...titles, ar: e.target.value })}
                        placeholder="عنوان الصفحة"
                        dir="rtl"
                        className="font-arabic text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug (URL)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="mon-contenu"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => navigator.clipboard.writeText(`/page/${slug}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Statut</Label>
                      <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
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
                </CardContent>
              </Card>

              {/* WYSIWYG Editor */}
              <MultilingualWysiwygEditor
                value={content}
                onChange={setContent}
                supportedLanguages={['fr', 'ar', 'en', 'es', 'amz']}
                minHeight="400px"
                placeholder="Rédigez votre contenu ici..."
              />

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {selectedItem && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="gap-2">
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer ce contenu ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Le contenu sera définitivement supprimé.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(selectedItem.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <Button variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setStatus('draft');
                      saveMutation.mutate({});
                    }}
                    disabled={!titles.fr || !slug || saveMutation.isPending}
                  >
                    <Clock className="h-4 w-4" />
                    Enregistrer brouillon
                  </Button>
                  <Button
                    className="gap-2"
                    onClick={() => {
                      setStatus('published');
                      saveMutation.mutate({});
                    }}
                    disabled={!titles.fr || !slug || saveMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                    {saveMutation.isPending ? 'Sauvegarde...' : 'Publier'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
