import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Globe,
  FileText,
  Link2,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  ExternalLink,
  TrendingUp,
  Settings,
  MapPin,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface SEOAuditResult {
  category: string;
  item: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  recommendation?: string;
}

interface PageSEOData {
  id: string;
  slug: string;
  title_fr: string;
  title_ar?: string;
  seo_title_fr?: string;
  seo_title_ar?: string;
  seo_description_fr?: string;
  seo_description_ar?: string;
  seo_keywords_fr?: string[];
  seo_keywords_ar?: string[];
  status: string;
  updated_at: string;
}

export default function CmsSeoManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState<PageSEOData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pages");

  // Fetch pages for SEO management
  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ['cms-seo-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('id, slug, title_fr, title_ar, seo_title_fr, seo_title_ar, seo_description_fr, seo_description_ar, seo_keywords_fr, seo_keywords_ar, status, updated_at')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as PageSEOData[];
    }
  });

  // Fetch 404 errors
  const { data: errors404, isLoading: errors404Loading } = useQuery({
    queryKey: ['seo-404-errors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('action', '404_error')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Group by path
      const grouped = data.reduce((acc: Record<string, any>, log: any) => {
        const path = log.resource_id;
        if (!acc[path]) {
          acc[path] = {
            path,
            count: 0,
            referrers: new Set<string>(),
            lastOccurrence: log.created_at,
          };
        }
        acc[path].count++;
        if (log.details?.referrer) {
          acc[path].referrers.add(log.details.referrer);
        }
        return acc;
      }, {});

      return Object.values(grouped).map((stat: any) => ({
        ...stat,
        referrers: Array.from(stat.referrers),
      }));
    }
  });

  // Save SEO mutation
  const saveSeoMutation = useMutation({
    mutationFn: async (data: Partial<PageSEOData>) => {
      if (!selectedPage) return;
      
      const { error } = await supabase
        .from('cms_pages')
        .update({
          seo_title_fr: data.seo_title_fr,
          seo_title_ar: data.seo_title_ar,
          seo_description_fr: data.seo_description_fr,
          seo_description_ar: data.seo_description_ar,
          seo_keywords_fr: data.seo_keywords_fr,
          seo_keywords_ar: data.seo_keywords_ar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedPage.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "SEO mis à jour",
        description: "Les métadonnées SEO ont été sauvegardées.",
      });
      queryClient.invalidateQueries({ queryKey: ['cms-seo-pages'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les métadonnées.",
        variant: "destructive",
      });
    }
  });

  // Generate sitemap
  const generateSitemap = async () => {
    try {
      const allPages = pages || [];
      const baseUrl = "https://bnrm.lovable.app";
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/?lang=ar" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/?lang=en" />
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Main Platforms -->
  <url>
    <loc>${baseUrl}/bibliotheque-numerique</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/manuscrits</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/kitab</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/activites-culturelles</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/cbm</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      
      // Add CMS pages
      allPages.filter(p => p.status === 'published').forEach(page => {
        sitemap += `  <url>
    <loc>${baseUrl}/page/${page.slug}</loc>
    <lastmod>${new Date(page.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      });
      
      sitemap += `</urlset>`;
      
      // Download sitemap
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Sitemap généré",
        description: "Le fichier sitemap.xml a été téléchargé.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le sitemap.",
        variant: "destructive",
      });
    }
  };

  // SEO audit for a page
  const auditPage = (page: PageSEOData): SEOAuditResult[] => {
    const results: SEOAuditResult[] = [];
    
    // Title checks
    const titleFr = page.seo_title_fr || page.title_fr;
    if (!titleFr) {
      results.push({
        category: 'Titre',
        item: 'Meta Title (FR)',
        status: 'fail',
        message: 'Titre manquant',
        recommendation: 'Ajoutez un titre de 50-60 caractères'
      });
    } else if (titleFr.length < 30) {
      results.push({
        category: 'Titre',
        item: 'Meta Title (FR)',
        status: 'warning',
        message: `Titre trop court (${titleFr.length} caractères)`,
        recommendation: 'Visez 50-60 caractères pour un titre optimal'
      });
    } else if (titleFr.length > 60) {
      results.push({
        category: 'Titre',
        item: 'Meta Title (FR)',
        status: 'warning',
        message: `Titre trop long (${titleFr.length} caractères)`,
        recommendation: 'Réduisez à moins de 60 caractères'
      });
    } else {
      results.push({
        category: 'Titre',
        item: 'Meta Title (FR)',
        status: 'pass',
        message: `Longueur optimale (${titleFr.length} caractères)`
      });
    }
    
    // Description checks
    const descFr = page.seo_description_fr;
    if (!descFr) {
      results.push({
        category: 'Description',
        item: 'Meta Description (FR)',
        status: 'fail',
        message: 'Description manquante',
        recommendation: 'Ajoutez une description de 150-160 caractères'
      });
    } else if (descFr.length < 120) {
      results.push({
        category: 'Description',
        item: 'Meta Description (FR)',
        status: 'warning',
        message: `Description trop courte (${descFr.length} caractères)`,
        recommendation: 'Visez 150-160 caractères'
      });
    } else if (descFr.length > 160) {
      results.push({
        category: 'Description',
        item: 'Meta Description (FR)',
        status: 'warning',
        message: `Description trop longue (${descFr.length} caractères)`,
        recommendation: 'Réduisez à moins de 160 caractères'
      });
    } else {
      results.push({
        category: 'Description',
        item: 'Meta Description (FR)',
        status: 'pass',
        message: `Longueur optimale (${descFr.length} caractères)`
      });
    }
    
    // Keywords checks
    const keywordsFr = page.seo_keywords_fr || [];
    if (keywordsFr.length === 0) {
      results.push({
        category: 'Mots-clés',
        item: 'Keywords (FR)',
        status: 'warning',
        message: 'Aucun mot-clé défini',
        recommendation: 'Ajoutez 5-10 mots-clés pertinents'
      });
    } else if (keywordsFr.length < 3) {
      results.push({
        category: 'Mots-clés',
        item: 'Keywords (FR)',
        status: 'warning',
        message: `Peu de mots-clés (${keywordsFr.length})`,
        recommendation: 'Ajoutez plus de mots-clés pertinents'
      });
    } else {
      results.push({
        category: 'Mots-clés',
        item: 'Keywords (FR)',
        status: 'pass',
        message: `${keywordsFr.length} mots-clés définis`
      });
    }
    
    // Arabic content checks
    if (!page.seo_title_ar && !page.title_ar) {
      results.push({
        category: 'Multilingue',
        item: 'Titre Arabe',
        status: 'warning',
        message: 'Titre arabe manquant',
        recommendation: 'Ajoutez la version arabe pour le SEO international'
      });
    } else {
      results.push({
        category: 'Multilingue',
        item: 'Titre Arabe',
        status: 'pass',
        message: 'Titre arabe présent'
      });
    }
    
    // URL check
    if (page.slug) {
      const hasSpecialChars = /[^a-z0-9-]/.test(page.slug);
      if (hasSpecialChars) {
        results.push({
          category: 'URL',
          item: 'Slug',
          status: 'warning',
          message: 'URL contient des caractères spéciaux',
          recommendation: 'Utilisez uniquement des lettres minuscules, chiffres et tirets'
        });
      } else {
        results.push({
          category: 'URL',
          item: 'Slug',
          status: 'pass',
          message: 'URL optimisée'
        });
      }
    }
    
    return results;
  };

  const filteredPages = pages?.filter(p => 
    p.title_fr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreFromAudit = (results: SEOAuditResult[]): number => {
    if (results.length === 0) return 0;
    const passCount = results.filter(r => r.status === 'pass').length;
    return Math.round((passCount / results.length) * 100);
  };

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-background shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Gestionnaire SEO</CardTitle>
                <CardDescription>
                  Optimisez le référencement de vos pages pour les moteurs de recherche
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={generateSitemap} className="gap-2">
                <Download className="h-4 w-4" />
                Générer Sitemap
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pages" className="gap-2">
            <FileText className="h-4 w-4" />
            Pages SEO
          </TabsTrigger>
          <TabsTrigger value="errors" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Erreurs 404
          </TabsTrigger>
          <TabsTrigger value="tools" className="gap-2">
            <Settings className="h-4 w-4" />
            Outils
          </TabsTrigger>
        </TabsList>

        {/* Pages SEO Tab */}
        <TabsContent value="pages" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
            {/* Pages List */}
            <Card>
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
                    {pagesLoading ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Chargement...</p>
                    ) : filteredPages?.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucune page</p>
                    ) : (
                      filteredPages?.map((page) => {
                        const auditResults = auditPage(page);
                        const score = getScoreFromAudit(auditResults);
                        
                        return (
                          <button
                            key={page.id}
                            onClick={() => setSelectedPage(page)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              selectedPage?.id === page.id 
                                ? 'bg-primary/10 border border-primary/20' 
                                : 'hover:bg-muted'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{page.title_fr}</p>
                                <p className="text-xs text-muted-foreground truncate">/{page.slug}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={score >= 80 ? "default" : score >= 50 ? "secondary" : "destructive"}
                                  className="text-xs"
                                >
                                  {score}%
                                </Badge>
                              </div>
                            </div>
                            <Progress value={score} className="h-1 mt-2" />
                          </button>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* SEO Editor */}
            <div className="space-y-4">
              {!selectedPage ? (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="font-medium">Sélectionnez une page</h3>
                      <p className="text-sm text-muted-foreground">
                        Choisissez une page pour modifier ses métadonnées SEO
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <>
                  {/* Audit Results */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Audit SEO - {selectedPage.title_fr}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        {auditPage(selectedPage).map((result, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-3 p-2 rounded-lg bg-muted/30"
                          >
                            {getStatusIcon(result.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{result.item}</span>
                                <Badge variant="outline" className="text-xs">{result.category}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{result.message}</p>
                              {result.recommendation && (
                                <p className="text-xs text-primary mt-1">{result.recommendation}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* SEO Fields Editor */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Métadonnées SEO</CardTitle>
                      <CardDescription>
                        Optimisez les balises méta pour le référencement
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Tabs defaultValue="fr">
                        <TabsList>
                          <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                          <TabsTrigger value="ar">🇲🇦 العربية</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="fr" className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Meta Title (FR)</Label>
                            <Input
                              value={selectedPage.seo_title_fr || selectedPage.title_fr || ''}
                              onChange={(e) => setSelectedPage({
                                ...selectedPage,
                                seo_title_fr: e.target.value
                              })}
                              placeholder="Titre optimisé pour les moteurs de recherche"
                              maxLength={60}
                            />
                            <p className="text-xs text-muted-foreground">
                              {(selectedPage.seo_title_fr || selectedPage.title_fr || '').length}/60 caractères
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Meta Description (FR)</Label>
                            <Textarea
                              value={selectedPage.seo_description_fr || ''}
                              onChange={(e) => setSelectedPage({
                                ...selectedPage,
                                seo_description_fr: e.target.value
                              })}
                              placeholder="Description concise et attractive pour les résultats de recherche"
                              maxLength={160}
                              rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                              {(selectedPage.seo_description_fr || '').length}/160 caractères
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Mots-clés (FR)</Label>
                            <Input
                              value={(selectedPage.seo_keywords_fr || []).join(', ')}
                              onChange={(e) => setSelectedPage({
                                ...selectedPage,
                                seo_keywords_fr: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                              })}
                              placeholder="mot-clé1, mot-clé2, mot-clé3"
                            />
                            <p className="text-xs text-muted-foreground">
                              Séparez les mots-clés par des virgules
                            </p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="ar" className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Meta Title (AR)</Label>
                            <Input
                              value={selectedPage.seo_title_ar || selectedPage.title_ar || ''}
                              onChange={(e) => setSelectedPage({
                                ...selectedPage,
                                seo_title_ar: e.target.value
                              })}
                              placeholder="عنوان محسن لمحركات البحث"
                              dir="rtl"
                              className="font-arabic text-right"
                              maxLength={60}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Meta Description (AR)</Label>
                            <Textarea
                              value={selectedPage.seo_description_ar || ''}
                              onChange={(e) => setSelectedPage({
                                ...selectedPage,
                                seo_description_ar: e.target.value
                              })}
                              placeholder="وصف موجز وجذاب لنتائج البحث"
                              dir="rtl"
                              className="font-arabic text-right"
                              maxLength={160}
                              rows={3}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Mots-clés (AR)</Label>
                            <Input
                              value={(selectedPage.seo_keywords_ar || []).join('، ')}
                              onChange={(e) => setSelectedPage({
                                ...selectedPage,
                                seo_keywords_ar: e.target.value.split(/[،,]/).map(k => k.trim()).filter(Boolean)
                              })}
                              placeholder="كلمة مفتاحية1، كلمة مفتاحية2"
                              dir="rtl"
                              className="font-arabic text-right"
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={() => saveSeoMutation.mutate(selectedPage)}
                          disabled={saveSeoMutation.isPending}
                        >
                          {saveSeoMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder SEO'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* 404 Errors Tab */}
        <TabsContent value="errors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Suivi des erreurs 404
              </CardTitle>
              <CardDescription>
                Identifiez les liens brisés et leurs sources pour améliorer l'expérience utilisateur et le SEO
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errors404Loading ? (
                <p className="text-center text-muted-foreground py-8">Chargement...</p>
              ) : !errors404 || errors404.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-medium">Aucune erreur 404 détectée</h3>
                  <p className="text-sm text-muted-foreground">
                    Vos liens fonctionnent correctement
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {errors404.map((error: any, idx: number) => (
                      <div 
                        key={idx}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-mono text-sm font-medium text-red-600">
                              {error.path}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(error.lastOccurrence), 'dd MMM yyyy HH:mm', { locale: fr })}
                              </span>
                              <Badge variant="secondary">{error.count} occurrences</Badge>
                            </div>
                          </div>
                        </div>
                        {error.referrers.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Sources (referrers):
                            </p>
                            <div className="space-y-1">
                              {error.referrers.slice(0, 5).map((ref: string, ridx: number) => (
                                <p key={ridx} className="text-xs font-mono truncate">
                                  {ref}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Sitemap XML
                </CardTitle>
                <CardDescription>
                  Générez un sitemap pour faciliter l'indexation par les moteurs de recherche
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Le sitemap inclut automatiquement toutes les pages publiées avec leurs URL canoniques et les dates de modification.
                </p>
                <Button onClick={generateSitemap} className="gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger sitemap.xml
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-primary" />
                  Google PageSpeed
                </CardTitle>
                <CardDescription>
                  Analysez les performances de vos pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Objectif : Score minimal de 95% sur Google PageSpeed Insights pour les versions desktop et mobile.
                </p>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open('https://pagespeed.web.dev/analysis?url=https://bnrm.lovable.app', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Analyser avec PageSpeed
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Robots.txt
                </CardTitle>
                <CardDescription>
                  Configuration des instructions pour les robots d'indexation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://bnrm.lovable.app/sitemap.xml`}
                </pre>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Optimisation Images
                </CardTitle>
                <CardDescription>
                  Bonnes pratiques pour les images
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    Alt text obligatoire sur toutes les images
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    Lazy loading activé par défaut
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    Formats optimisés (WebP, AVIF)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    Dimensions explicites pour éviter le CLS
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}