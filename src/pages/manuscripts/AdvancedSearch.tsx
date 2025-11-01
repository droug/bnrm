import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Search, RotateCcw, BookOpen, User, FileText, Tag, Calendar, Hash, Library, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SearchPagination } from "@/components/ui/search-pagination";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ManuscriptAdvancedSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalResults, setTotalResults] = useState(0);
  const [formData, setFormData] = useState({
    keyword: "",
    author: "",
    title: "",
    language: "",
    period: "",
    genre: "",
    cote: "",
    source: "",
    historicalPeriod: "",
    material: "",
    status: "",
  });

  // Fonction de recherche
  const performSearch = useCallback(async () => {
    const params = Object.fromEntries(searchParams.entries());
    console.log('🔍 Manuscript search with params:', params);
    
    const hasFilters = Object.keys(params).length > 0;
    console.log('📊 Has filters:', hasFilters);

    setIsSearching(true);
    try {
      let baseQuery: any = supabase.from('manuscripts').select('*', { count: 'exact' }).eq('is_visible', true);
      console.log('🗄️ Base query created');
      
      // Recherche générale
      if (params.keyword) {
        const term = params.keyword;
        baseQuery = baseQuery.or(`title.ilike.%${term}%,author.ilike.%${term}%,description.ilike.%${term}%,full_text_content.ilike.%${term}%`);
      }
      
      // Recherche par auteur
      if (params.author) {
        baseQuery = baseQuery.ilike('author', `%${params.author}%`);
      }
      
      // Recherche par titre
      if (params.title) {
        baseQuery = baseQuery.ilike('title', `%${params.title}%`);
      }
      
      // Filtrer par langue
      if (params.language) {
        baseQuery = baseQuery.eq('language', params.language);
      }
      
      // Filtrer par période
      if (params.period) {
        baseQuery = baseQuery.eq('period', params.period);
      }
      
      // Filtrer par genre
      if (params.genre) {
        baseQuery = baseQuery.eq('genre', params.genre);
      }
      
      // Recherche par cote
      if (params.cote) {
        baseQuery = baseQuery.ilike('cote', `%${params.cote}%`);
      }
      
      // Filtrer par source
      if (params.source) {
        baseQuery = baseQuery.eq('source', params.source);
      }
      
      // Filtrer par période historique
      if (params.historicalPeriod) {
        baseQuery = baseQuery.eq('historical_period', params.historicalPeriod);
      }
      
      // Filtrer par matériau
      if (params.material) {
        baseQuery = baseQuery.ilike('material', `%${params.material}%`);
      }
      
      // Filtrer par statut
      if (params.status) {
        baseQuery = baseQuery.eq('status', params.status);
      }
      
      console.log('🚀 Executing query...');
      const { data, error, count } = await baseQuery.range(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage - 1
      );
      
      console.log('✅ Query result:', { data: data?.length, error, count });
      
      if (error) {
        console.error('❌ Query error:', error);
        throw error;
      }
      
      setTotalResults(count || 0);
      setSearchResults(data || []);
      
      console.log('📝 Results set:', { total: count, results: data?.length });
      
      if ((data || []).length === 0 && hasFilters) {
        toast({
          title: "Aucun résultat",
          description: "Aucun manuscrit ne correspond à vos critères de recherche.",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchParams, currentPage, itemsPerPage, toast]);

  // Effectuer la recherche quand les params changent ou au chargement
  useEffect(() => {
    console.log('🔄 useEffect triggered, searchParams:', searchParams.toString());
    performSearch();
  }, [performSearch]);

  // Charger tous les manuscrits au premier chargement
  useEffect(() => {
    console.log('🎬 Component mounted');
    if (searchParams.toString() === '') {
      console.log('📋 No search params, loading all manuscripts');
      performSearch();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    navigate(`/manuscripts/search?${params.toString()}`);
  };

  const handleReset = () => {
    setFormData({
      keyword: "",
      author: "",
      title: "",
      language: "",
      period: "",
      genre: "",
      cote: "",
      source: "",
      historicalPeriod: "",
      material: "",
      status: "",
    });
    setSearchResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    navigate('/manuscripts/search');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-3">Recherche Avancée de Manuscrits</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Recherchez dans notre collection de manuscrits en utilisant plusieurs critères
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Library className="h-6 w-6" />
                    Critères de recherche
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Sélectionnez un onglet et remplissez les champs correspondants
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-muted/50 p-1">
                  <TabsTrigger value="all" className="data-[state=active]:bg-background">
                    <Search className="h-4 w-4 mr-2" />
                    Tous
                  </TabsTrigger>
                  <TabsTrigger value="author" className="data-[state=active]:bg-background">
                    <User className="h-4 w-4 mr-2" />
                    Auteur
                  </TabsTrigger>
                  <TabsTrigger value="title" className="data-[state=active]:bg-background">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Titre
                  </TabsTrigger>
                  <TabsTrigger value="classification" className="data-[state=active]:bg-background">
                    <Tag className="h-4 w-4 mr-2" />
                    Classification
                  </TabsTrigger>
                  <TabsTrigger value="physical" className="data-[state=active]:bg-background">
                    <FileText className="h-4 w-4 mr-2" />
                    Physique
                  </TabsTrigger>
                </TabsList>

                {/* ONGLET: Tous les champs */}
                <TabsContent value="all" className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="keyword" className="text-base font-semibold">Recherche générale</Label>
                    <Input
                      id="keyword"
                      placeholder="Recherchez dans tous les champs (titre, auteur, description...)"
                      value={formData.keyword}
                      onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                      className="h-12 text-base"
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="language-all" className="text-base font-semibold">Langue</Label>
                      <Select
                        value={formData.language}
                        onValueChange={(value) => setFormData({ ...formData, language: value })}
                      >
                        <SelectTrigger id="language-all" className="h-11">
                          <SelectValue placeholder="Toutes les langues" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="arabe">Arabe</SelectItem>
                          <SelectItem value="berbère">Berbère</SelectItem>
                          <SelectItem value="français">Français</SelectItem>
                          <SelectItem value="latin">Latin</SelectItem>
                          <SelectItem value="espagnol">Espagnol</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status-all" className="text-base font-semibold">Statut</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger id="status-all" className="h-11">
                          <SelectValue placeholder="Tous les statuts" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="available">Disponible</SelectItem>
                          <SelectItem value="digitization">En numérisation</SelectItem>
                          <SelectItem value="reserved">Réservé</SelectItem>
                          <SelectItem value="maintenance">En maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* ONGLET: Auteur */}
                <TabsContent value="author" className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="author" className="text-base font-semibold">Nom de l'auteur</Label>
                    <Input
                      id="author"
                      placeholder="Entrez le nom de l'auteur"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </TabsContent>

                {/* ONGLET: Titre */}
                <TabsContent value="title" className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-semibold">Titre du manuscrit</Label>
                    <Input
                      id="title"
                      placeholder="Entrez le titre complet ou partiel"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </TabsContent>

                {/* ONGLET: Classification */}
                <TabsContent value="classification" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="genre" className="text-base font-semibold">Genre</Label>
                      <Input
                        id="genre"
                        placeholder="Ex: histoire, philosophie, littérature..."
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="period" className="text-base font-semibold">Période</Label>
                      <Input
                        id="period"
                        placeholder="Ex: XIVe siècle, Époque médiévale..."
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cote" className="text-base font-semibold">Cote</Label>
                      <Input
                        id="cote"
                        placeholder="Numéro de cote"
                        value={formData.cote}
                        onChange={(e) => setFormData({ ...formData, cote: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="source" className="text-base font-semibold">Source</Label>
                      <Input
                        id="source"
                        placeholder="Source du manuscrit"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* ONGLET: Caractéristiques physiques */}
                <TabsContent value="physical" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="material" className="text-base font-semibold">Matériau</Label>
                      <Input
                        id="material"
                        placeholder="Ex: papier, parchemin..."
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="historicalPeriod" className="text-base font-semibold">Période historique</Label>
                      <Input
                        id="historicalPeriod"
                        placeholder="Période historique"
                        value={formData.historicalPeriod}
                        onChange={(e) => setFormData({ ...formData, historicalPeriod: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="submit" size="lg" className="flex-1 h-14 text-base font-semibold shadow-md hover:shadow-lg transition-shadow">
              <Search className="h-5 w-5 mr-2" />
              Lancer la recherche
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={handleReset} 
              className="sm:w-auto h-14 text-base font-semibold"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </form>

        {/* Search Results */}
        {isSearching && (
          <div className="flex items-center justify-center py-12 mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Recherche en cours...</span>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Résultats de recherche</CardTitle>
              <CardDescription>{totalResults} manuscrit(s) trouvé(s)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SearchPagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalResults / itemsPerPage)}
                totalItems={totalResults}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => {
                  setCurrentPage(page);
                }}
                onItemsPerPageChange={(items) => {
                  setItemsPerPage(items);
                  setCurrentPage(1);
                }}
              />

              {searchResults.map((manuscript) => (
                <Card key={manuscript.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="font-bold text-lg text-foreground mb-1">
                              {manuscript.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Par {manuscript.author || 'Auteur inconnu'} • {manuscript.period || 'Période inconnue'}
                            </p>
                          </div>
                        </div>
                        
                        {manuscript.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {manuscript.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {manuscript.language && (
                            <span className="text-xs px-2 py-1 bg-muted rounded">
                              📖 {manuscript.language}
                            </span>
                          )}
                          {manuscript.genre && (
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                              {manuscript.genre}
                            </span>
                          )}
                          {manuscript.cote && (
                            <span className="text-xs px-2 py-1 bg-muted rounded">
                              Cote: {manuscript.cote}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Link to={`/manuscrit/${manuscript.permalink || manuscript.id}`}>
                        <Button variant="default" size="lg">
                          Voir le manuscrit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <SearchPagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalResults / itemsPerPage)}
                totalItems={totalResults}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => {
                  setCurrentPage(page);
                }}
                onItemsPerPageChange={(items) => {
                  setItemsPerPage(items);
                  setCurrentPage(1);
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
