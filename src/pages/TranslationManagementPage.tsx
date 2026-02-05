import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader } from "@/components/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Languages, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Loader2,
  FileText,
  Globe,
  Layout,
  Newspaper,
  Calendar,
  Flag
} from "lucide-react";
import ContentTranslationManager from "@/components/ContentTranslationManager";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'amz', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: 'ⵣ' },
];

export default function TranslationManagementPage() {
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [selectedContentTitle, setSelectedContentTitle] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('content');
  const [searchKey, setSearchKey] = useState('');
  const queryClient = useQueryClient();

  const { data: contents, isLoading } = useQuery({
    queryKey: ['contents-for-translation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select(`
          id,
          title,
          content_type,
          status,
          created_at,
          content_translations (
            id,
            language_code,
            is_approved
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['translation-stats'],
    queryFn: async () => {
      const { data: allTranslations } = await supabase
        .from('content_translations')
        .select('id, language_code, is_approved');
      
      const { data: publishedContents } = await supabase
        .from('content')
        .select('id')
        .eq('status', 'published');

      const totalContents = publishedContents?.length || 0;
      const totalPossibleTranslations = totalContents * 4; // 4 langues
      const existingTranslations = allTranslations?.length || 0;
      const approvedTranslations = allTranslations?.filter(t => t.is_approved).length || 0;

      const byLanguage = LANGUAGES.map(lang => {
        const count = allTranslations?.filter(t => t.language_code === lang.code).length || 0;
        const approved = allTranslations?.filter(t => t.language_code === lang.code && t.is_approved).length || 0;
        return {
          ...lang,
          count,
          approved,
          total: totalContents,
          percentage: totalContents > 0 ? (count / totalContents) * 100 : 0
        };
      });

      return {
        totalContents,
        totalPossibleTranslations,
        existingTranslations,
        approvedTranslations,
        pendingTranslations: existingTranslations - approvedTranslations,
        missingTranslations: totalPossibleTranslations - existingTranslations,
        byLanguage
      };
    },
  });

  const batchTranslateMutation = useMutation({
    mutationFn: async (onlyMissing: boolean) => {
      const { data, error } = await supabase.functions.invoke('batch-translate-all-content', {
        body: { onlyMissing }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contents-for-translation'] });
      queryClient.invalidateQueries({ queryKey: ['translation-stats'] });
      toast.success(data.message);
    },
    onError: (error) => {
      console.error('Batch translation error:', error);
      toast.error('Erreur lors de la traduction en masse');
    },
  });

  const getContentStats = (content: any) => {
    const translations = content.content_translations || [];
    const approved = translations.filter((t: any) => t.is_approved).length;
    const pending = translations.length - approved;
    const missing = 4 - translations.length;
    
    return { translations: translations.length, approved, pending, missing };
  };

  // Query pour les actualités
  const { data: actualites } = useQuery({
    queryKey: ['cms-actualites-translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_actualites')
        .select('id, title_fr, title_ar, chapo_fr, chapo_ar, status')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Query pour les événements
  const { data: evenements } = useQuery({
    queryKey: ['cms-evenements-translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_evenements')
        .select('id, title_fr, title_ar, description_fr, description_ar, status')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Query pour les bannières
  const { data: bannieres } = useQuery({
    queryKey: ['cms-bannieres-translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_bannieres')
        .select('id, title_fr, title_ar, text_fr, text_ar, status')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const getTranslationStatus = (item: any, type: 'actualite' | 'evenement' | 'banniere') => {
    let completed = 0;
    let total = 2; // FR et AR minimum

    if (type === 'actualite') {
      if (item.title_fr && item.title_ar) completed++;
      if (item.chapo_fr && item.chapo_ar) completed++;
      total = 2;
    } else if (type === 'evenement') {
      if (item.title_fr && item.title_ar) completed++;
      if (item.description_fr && item.description_ar) completed++;
      total = 2;
    } else if (type === 'banniere') {
      if (item.title_fr && item.title_ar) completed++;
      if (item.text_fr && item.text_ar) completed++;
      total = 2;
    }

    return { completed, total, percentage: (completed / total) * 100 };
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        title="Gestion des Traductions"
        badgeText="Multilingue"
        subtitle="Gérez toutes les traductions du système : contenu, interface et CMS"
      />

      <main className="container py-8">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contenus publiés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalContents || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Traductions existantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats?.existingTranslations || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                sur {stats?.totalPossibleTranslations || 0} possibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Traductions validées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats?.approvedTranslations || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Traductions manquantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats?.missingTranslations || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques par langue */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Statistiques par langue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.byLanguage.map((lang) => (
                <div key={lang.code} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {lang.count} / {lang.total} ({Math.round(lang.percentage)}%)
                    </div>
                  </div>
                  <Progress value={lang.percentage} className="h-2" />
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="text-green-600">✓ {lang.approved} validées</span>
                    <span>• {lang.count - lang.approved} en attente</span>
                    <span>• {lang.total - lang.count} manquantes</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions globales */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Actions globales</CardTitle>
            <CardDescription>
              Traduire automatiquement tout le contenu du portail
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              onClick={() => batchTranslateMutation.mutate(true)}
              disabled={batchTranslateMutation.isPending}
              size="lg"
            >
              {batchTranslateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traduction en cours...
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4 mr-2" />
                  Traduire les contenus manquants
                </>
              )}
            </Button>
            
            <Button
              onClick={() => batchTranslateMutation.mutate(false)}
              disabled={batchTranslateMutation.isPending}
              variant="outline"
              size="lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Régénérer toutes les traductions
            </Button>
          </CardContent>
        </Card>

        {/* Onglets pour différents types de traductions */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contenu
            </TabsTrigger>
            <TabsTrigger value="ui" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Interface UI
            </TabsTrigger>
            <TabsTrigger value="actualites" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Actualités
            </TabsTrigger>
            <TabsTrigger value="evenements" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Événements
            </TabsTrigger>
          </TabsList>

          {/* Onglet Contenu */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contenus du catalogue
                </CardTitle>
                <CardDescription>
                  Cliquez sur un contenu pour gérer ses traductions dans les 4 langues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contents?.map((content) => {
                      const stats = getContentStats(content);
                      
                      return (
                        <div
                          key={content.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedContentId(content.id);
                            setSelectedContentTitle(content.title);
                          }}
                        >
                          <div className="flex-1">
                            <h3 className="font-medium">{content.title}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{content.content_type}</Badge>
                              <Badge variant={stats.approved === 4 ? "default" : "secondary"}>
                                {stats.approved} / 4 validées
                              </Badge>
                              {stats.missing > 0 && (
                                <Badge variant="destructive">
                                  {stats.missing} manquantes
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Interface UI */}
          <TabsContent value="ui" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Traductions de l'interface
                </CardTitle>
                <CardDescription>
                  Gérez les labels, boutons et messages de l'interface utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Rechercher une clé de traduction..."
                        value={searchKey}
                        onChange={(e) => setSearchKey(e.target.value)}
                      />
                    </div>
                    <Button>
                      <Languages className="h-4 w-4 mr-2" />
                      Ajouter une clé
                    </Button>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-6 text-center">
                    <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Traductions d'interface</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Les traductions de l'interface (labels, boutons, messages) sont actuellement gérées dans le fichier 
                      <code className="mx-1 px-2 py-1 bg-background rounded">src/hooks/useLanguage.tsx</code>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pour modifier ces traductions, veuillez éditer directement le fichier ou créer un système de gestion dynamique.
                    </p>
                    <div className="mt-4 p-4 bg-background rounded-lg text-left">
                      <p className="text-xs font-medium mb-2">Exemple de structure :</p>
                      <pre className="text-xs text-muted-foreground">
{`translations = {
  fr: { 'header.title': '...' },
  ar: { 'header.title': '...' },
  ber: { 'header.title': '...' },
  en: { 'header.title': '...' }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Actualités */}
          <TabsContent value="actualites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5" />
                  Actualités CMS
                </CardTitle>
                <CardDescription>
                  État des traductions des articles d'actualités (FR ↔ AR)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {actualites?.map((article) => {
                    const status = getTranslationStatus(article, 'actualite');
                    return (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{article.title_fr || article.title_ar}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{article.status}</Badge>
                            <Badge variant={status.completed === status.total ? "default" : "secondary"}>
                              {status.completed} / {status.total} champs
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {article.title_fr && article.title_ar ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              FR+AR
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Incomplet
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Événements */}
          <TabsContent value="evenements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Événements CMS
                </CardTitle>
                <CardDescription>
                  État des traductions des événements culturels (FR ↔ AR)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {evenements?.map((event) => {
                    const status = getTranslationStatus(event, 'evenement');
                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{event.title_fr || event.title_ar}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{event.status}</Badge>
                            <Badge variant={status.completed === status.total ? "default" : "secondary"}>
                              {status.completed} / {status.total} champs
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.title_fr && event.title_ar ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              FR+AR
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Incomplet
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog pour gérer les traductions d'un contenu */}
        <Dialog 
          open={!!selectedContentId} 
          onOpenChange={() => {
            setSelectedContentId(null);
            setSelectedContentTitle('');
          }}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gestion des traductions</DialogTitle>
              <DialogDescription>
                {selectedContentTitle}
              </DialogDescription>
            </DialogHeader>
            {selectedContentId && (
              <ContentTranslationManager
                contentId={selectedContentId}
                contentTitle={selectedContentTitle}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
