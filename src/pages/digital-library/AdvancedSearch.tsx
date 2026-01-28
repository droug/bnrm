import { useState, useEffect, useCallback } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Search, RotateCcw, BookOpen, User, FileText, Tag, Calendar, Hash, Library, Loader2, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { TitleAutocomplete } from "@/components/ui/title-autocomplete";
import { AuthorAutocomplete } from "@/components/ui/author-autocomplete";
import { LanguageAutocomplete } from "@/components/ui/language-autocomplete";
import { CoteAutocomplete } from "@/components/ui/cote-autocomplete";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SearchPagination } from "@/components/ui/search-pagination";

export default function AdvancedSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalResults, setTotalResults] = useState(0);
  const [formData, setFormData] = useState({
    // Tous les champs
    keyword: "",
    
    // Recherche par auteur
    author: "",
    
    // Recherche par titre
    title: "",
    publisher: "",
    series: "",
    
    // Recherche par sujet
    subject: "",
    genre: "",
    keywords: "",
    classification: "",
    
    // Recherche par date
    dateFrom: "",
    dateTo: "",
    period: "",
    
    // Recherche par numéro
    cote: "",
    isbn: "",
    issn: "",
    
    // Critères additionnels
    language: "",
    documentType: "",
    collection: "",
    edition: "",
    isRareBook: false,
  });

  // État séparé pour le filtre rare book (non inclus dans formData car c'est un boolean)
  const [isRareBookFilter, setIsRareBookFilter] = useState(false);

  // Fonction de recherche
  const performSearch = useCallback(async () => {
    const params = Object.fromEntries(searchParams.entries());
    console.log('🔍 performSearch called with params:', params);
    
    // Si aucun paramètre, afficher tous les documents
    const hasFilters = Object.keys(params).length > 0;
    console.log('📊 Has filters:', hasFilters);

    setIsSearching(true);
    try {
      // Utiliser any pour éviter l'erreur de type profond avec Supabase
      // Exclure les documents supprimés (soft delete)
      let baseQuery: any = supabase.from('cbn_documents').select('*', { count: 'exact' }).is('deleted_at', null);
      console.log('🗄️ Base query created (excluding deleted documents)');
      
      // Recherche générale
      if (params.keyword) {
        const term = params.keyword;
        baseQuery = baseQuery.or(`title.ilike.%${term}%,author.ilike.%${term}%,cote.ilike.%${term}%,notes.ilike.%${term}%`);
      }
      
      // Recherche par auteur
      if (params.author) {
        baseQuery = baseQuery.ilike('author', `%${params.author}%`);
      }
      
      // Recherche par titre
      if (params.title) {
        baseQuery = baseQuery.ilike('title', `%${params.title}%`);
      }
      
      // Recherche par éditeur
      if (params.publisher) {
        baseQuery = baseQuery.ilike('publisher', `%${params.publisher}%`);
      }
      
      // Recherche par sujet
      if (params.subject) {
        baseQuery = baseQuery.ilike('subject', `%${params.subject}%`);
      }
      
      // Recherche par cote (avec ou sans tirets)
      if (params.cote) {
        const normalizedCote = params.cote.replace(/[-\s]/g, '');
        baseQuery = baseQuery.or(`cote.ilike.%${params.cote}%,cote.ilike.%${normalizedCote}%`);
      }
      
      // Recherche par ISBN (avec ou sans tirets)
      if (params.isbn) {
        const normalizedIsbn = params.isbn.replace(/[-\s]/g, '');
        baseQuery = baseQuery.or(`isbn.ilike.%${params.isbn}%,isbn.ilike.%${normalizedIsbn}%`);
      }
      
      // Recherche par ISSN (avec ou sans tirets)
      if (params.issn) {
        const normalizedIssn = params.issn.replace(/[-\s]/g, '');
        baseQuery = baseQuery.or(`issn.ilike.%${params.issn}%,issn.ilike.%${normalizedIssn}%`);
      }
      
      // Filtrer par langue
      if (params.language) {
        baseQuery = baseQuery.eq('language', params.language);
      }
      
      // Filtrer par type de document (insensible à la casse avec support des variantes)
      if (params.documentType) {
        // Mapping des types avec leurs variantes possibles dans la base
        const typeVariantsMap: Record<string, string[]> = {
          'book': ['book', 'Livre', 'livre'],
          'periodical': ['periodical', 'Périodique', 'periodique'],
          'manuscript': ['manuscript', 'Manuscrit', 'manuscrit'],
          'image': ['image', 'Image', 'Cartes et Plans', 'cartes et plans'],
          'audio': ['audio', 'Audio'],
          'video': ['video', 'Vidéo', 'Video'],
        };
        
        const variants = typeVariantsMap[params.documentType];
        if (variants && variants.length > 0) {
          // Créer une condition OR pour toutes les variantes
          const orConditions = variants.map(v => `document_type.eq.${v}`).join(',');
          baseQuery = baseQuery.or(orConditions);
        } else {
          // Fallback: recherche insensible à la casse
          baseQuery = baseQuery.ilike('document_type', params.documentType);
        }
      }
      
      // Filtrer par livre rare
      if (params.isRareBook === 'true') {
        baseQuery = baseQuery.eq('document_type', 'rare_book');
      }
      
      // Filtrer par date
      if (params.dateFrom) {
        baseQuery = baseQuery.gte('publication_year', parseInt(params.dateFrom));
      }
      if (params.dateTo) {
        baseQuery = baseQuery.lte('publication_year', parseInt(params.dateTo));
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
          description: "Aucun document ne correspond à vos critères de recherche.",
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

  // Charger tous les documents au premier chargement
  useEffect(() => {
    console.log('🎬 Component mounted');
    if (searchParams.toString() === '') {
      console.log('📋 No search params, loading all documents');
      performSearch();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value && key !== 'isRareBook') params.append(key, value as string);
    });
    
    // Ajouter le filtre livre rare
    if (isRareBookFilter) {
      params.append('isRareBook', 'true');
    }
    
    // Rester sur la page de recherche avancée avec les paramètres
    navigate(`/digital-library/search?${params.toString()}`);
  };

  const handleReset = () => {
    setFormData({
      keyword: "",
      author: "",
      title: "",
      publisher: "",
      series: "",
      subject: "",
      genre: "",
      keywords: "",
      classification: "",
      dateFrom: "",
      dateTo: "",
      period: "",
      cote: "",
      isbn: "",
      issn: "",
      language: "",
      documentType: "",
      collection: "",
      edition: "",
      isRareBook: false,
    });
    setIsRareBookFilter(false);
    setSearchResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    navigate('/digital-library/search');
  };

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-3">Recherche Avancée</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Recherchez dans nos collections en utilisant plusieurs critères organisés par onglets thématiques
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
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto gap-2 bg-muted/50 p-1">
                  <TabsTrigger value="all" className="data-[state=active]:bg-background">
                    <Search className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Tous les champs</span>
                    <span className="sm:hidden">Tous</span>
                  </TabsTrigger>
                  <TabsTrigger value="author" className="data-[state=active]:bg-background">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Auteur</span>
                    <span className="sm:hidden">Auteur</span>
                  </TabsTrigger>
                  <TabsTrigger value="title" className="data-[state=active]:bg-background">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Titre</span>
                    <span className="sm:hidden">Titre</span>
                  </TabsTrigger>
                  <TabsTrigger value="subject" className="data-[state=active]:bg-background">
                    <Tag className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Sujet</span>
                    <span className="sm:hidden">Sujet</span>
                  </TabsTrigger>
                  <TabsTrigger value="date" className="data-[state=active]:bg-background">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Date</span>
                    <span className="sm:hidden">Date</span>
                  </TabsTrigger>
                  <TabsTrigger value="number" className="data-[state=active]:bg-background">
                    <Hash className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Numéro</span>
                    <span className="sm:hidden">N°</span>
                  </TabsTrigger>
                </TabsList>

                {/* ONGLET: Tous les champs */}
                <TabsContent value="all" className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="keyword" className="text-base font-semibold">Recherche générale</Label>
                    <Input
                      id="keyword"
                      placeholder="Recherchez dans tous les champs (titre, auteur, sujet...)"
                      value={formData.keyword}
                      onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                      className="h-12 text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                      Cette recherche interroge l'ensemble des champs disponibles
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LanguageAutocomplete
                      label="Langue"
                      placeholder="Sélectionner une langue"
                      value={formData.language}
                      onChange={(value) => setFormData({ ...formData, language: value })}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="documentType-all" className="text-base font-semibold">Type de document</Label>
                      <Select
                        value={formData.documentType}
                        onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                      >
                        <SelectTrigger id="documentType-all" className="h-11">
                          <SelectValue placeholder="Tous les types" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="book">Livre</SelectItem>
                          <SelectItem value="periodical">Périodique</SelectItem>
                          <SelectItem value="manuscript">Manuscrit</SelectItem>
                          <SelectItem value="image">Image/Carte</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="video">Vidéo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Filtre Livres rares */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-amber-500/20">
                        <Sparkles className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <Label htmlFor="rareBook-filter" className="text-base font-semibold cursor-pointer">
                          Livres rares uniquement
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Filtrer pour afficher uniquement les livres rares et précieux
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="rareBook-filter"
                      checked={isRareBookFilter}
                      onCheckedChange={setIsRareBookFilter}
                    />
                  </div>
                </TabsContent>

                {/* ONGLET: Recherche par auteur */}
                <TabsContent value="author" className="mt-6 space-y-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Recherche par auteur
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Recherchez des documents par nom d'auteur, qu'il soit auteur principal ou co-auteur
                    </p>
                  </div>

                  <AuthorAutocomplete
                    label="Nom de l'auteur"
                    placeholder="Entrez le nom de l'auteur"
                    value={formData.author}
                    onChange={(value) => setFormData({ ...formData, author: value })}
                  />

                  <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                    <strong>Astuce :</strong> Vous pouvez entrer le nom complet ou partiel. L'autocomplétion vous suggérera des auteurs existants.
                  </div>
                </TabsContent>

                {/* ONGLET: Recherche par titre */}
                <TabsContent value="title" className="mt-6 space-y-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Recherche par titre
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Recherchez des documents par leur titre, éditeur ou série
                    </p>
                  </div>

                  <TitleAutocomplete
                    label="Titre du document"
                    placeholder="Entrez le titre complet ou partiel"
                    value={formData.title}
                    onChange={(value) => setFormData({ ...formData, title: value })}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="publisher" className="text-base font-semibold">Éditeur</Label>
                      <Input
                        id="publisher"
                        placeholder="Nom de l'éditeur"
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="series" className="text-base font-semibold">Titre de série</Label>
                      <Input
                        id="series"
                        placeholder="Nom de la série"
                        value={formData.series}
                        onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edition" className="text-base font-semibold">Édition</Label>
                    <Input
                      id="edition"
                      placeholder="Numéro ou mention d'édition"
                      value={formData.edition}
                      onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </TabsContent>

                {/* ONGLET: Recherche par sujet */}
                <TabsContent value="subject" className="mt-6 space-y-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Recherche par sujet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Recherchez par thématique, genre, mots-clés ou classification
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject-tab" className="text-base font-semibold">Sujet</Label>
                    <Input
                      id="subject-tab"
                      placeholder="Thématique principale (histoire, philosophie, sciences...)"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="genre" className="text-base font-semibold">Genre</Label>
                      <Input
                        id="genre"
                        placeholder="Genre littéraire ou documentaire"
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keywords" className="text-base font-semibold">Mots-clés</Label>
                      <Input
                        id="keywords"
                        placeholder="Mots-clés spécifiques"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classification" className="text-base font-semibold">Classification</Label>
                    <Input
                      id="classification"
                      placeholder="Dewey, CDU, UDC..."
                      value={formData.classification}
                      onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Entrez un code de classification (ex: 900 pour l'histoire)
                    </p>
                  </div>
                </TabsContent>

                {/* ONGLET: Recherche par date */}
                <TabsContent value="date" className="mt-6 space-y-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Recherche par date
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Recherchez par date de publication ou période historique
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dateFrom-tab" className="text-base font-semibold">Année de début</Label>
                      <Input
                        id="dateFrom-tab"
                        type="number"
                        placeholder="Ex: 1900"
                        min="1000"
                        max={new Date().getFullYear()}
                        value={formData.dateFrom}
                        onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateTo-tab" className="text-base font-semibold">Année de fin</Label>
                      <Input
                        id="dateTo-tab"
                        type="number"
                        placeholder={`Ex: ${new Date().getFullYear()}`}
                        min="1000"
                        max={new Date().getFullYear()}
                        value={formData.dateTo}
                        onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period" className="text-base font-semibold">Période historique</Label>
                    <Input
                      id="period"
                      placeholder="Ex: Moyen Âge, Renaissance, Époque contemporaine..."
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                    <strong>Note :</strong> Vous pouvez rechercher par plage d'années ou par période historique, ou combiner les deux critères.
                  </div>
                </TabsContent>

                {/* ONGLET: Recherche par numéro */}
                <TabsContent value="number" className="mt-6 space-y-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      Recherche par numéro
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Recherchez par ISBN, ISSN ou numéro de cote
                    </p>
                  </div>

                  <CoteAutocomplete
                    label="Numéro de cote"
                    placeholder="Numéro de cote de la bibliothèque"
                    value={formData.cote}
                    onChange={(value) => setFormData({ ...formData, cote: value })}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="isbn-tab" className="text-base font-semibold">ISBN</Label>
                      <Input
                        id="isbn-tab"
                        placeholder="978-2-1234-5678-9"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Identifiant international du livre (10 ou 13 chiffres)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issn" className="text-base font-semibold">ISSN</Label>
                      <Input
                        id="issn"
                        placeholder="1234-5678"
                        value={formData.issn}
                        onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Identifiant international des publications en série
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <strong>Recherche exacte :</strong> Ces numéros sont uniques et permettent une identification précise du document.
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

          {/* Search Tips */}
          <Card className="mt-6 bg-gradient-to-br from-muted/30 to-muted/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Conseils de recherche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Utilisez les <strong className="text-foreground">guillemets ""</strong> pour rechercher une expression exacte
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Combinez plusieurs critères dans <strong className="text-foreground">différents onglets</strong> pour affiner vos résultats
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  L'<strong className="text-foreground">autocomplétion</strong> vous suggère automatiquement des valeurs existantes dans la base
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  La recherche est <strong className="text-foreground">insensible à la casse</strong> (majuscules/minuscules)
                </p>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Search Results */}
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Recherche en cours...</span>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Résultats de recherche</CardTitle>
              <CardDescription>{totalResults} document(s) trouvé(s)</CardDescription>
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

              {searchResults.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <BookOpen className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="font-bold text-lg text-foreground mb-1">
                              {doc.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Par {doc.author || 'Auteur inconnu'} • {doc.publication_year || 'Date inconnue'}
                            </p>
                          </div>
                        </div>
                        
                        {doc.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {doc.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {doc.cote && (
                            <span className="text-xs px-2 py-1 bg-muted rounded">
                              Cote: {doc.cote}
                            </span>
                          )}
                          {doc.document_type && (
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                              {doc.document_type}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* IMPORTANT: Utiliser digital_library_document_id pour les liens vers les documents
                          car cbn_documents.id est l'ID de l'index de recherche, pas l'ID du document source.
                          Le document réel est dans digital_library_documents avec un ID différent. */}
                      <Link to={`/digital-library/document/${doc.digital_library_document_id || doc.id}`}>
                        <Button variant="default" size="lg">
                          Voir la notice
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
    </DigitalLibraryLayout>
  );
}
