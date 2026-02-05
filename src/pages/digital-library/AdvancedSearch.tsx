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
import { useSecureRoles } from "@/hooks/useSecureRoles";

export default function AdvancedSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { isLibrarian, loading: rolesLoading } = useSecureRoles();
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
    // Attendre que le chargement des rôles soit terminé pour savoir si on peut montrer les brouillons
    if (rolesLoading) return;
    
    const params = Object.fromEntries(searchParams.entries());
    console.log('🔍 performSearch called with params:', params);
    
    // Si aucun paramètre, afficher tous les documents
    const hasFilters = Object.keys(params).length > 0;
    console.log('📊 Has filters:', hasFilters);

    setIsSearching(true);
    try {
      // Utiliser digital_library_documents comme source principale (table utilisée par l'admin)
      // Exclure les documents supprimés
      let baseQuery: any = supabase
        .from('digital_library_documents')
        .select('*', { count: 'exact' })
        .is('deleted_at', null);
      
      // Les bibliothécaires voient aussi les brouillons, le public ne voit que les publiés
      if (!isLibrarian) {
        baseQuery = baseQuery.eq('publication_status', 'published');
        console.log('🗄️ Base query created (digital_library_documents, published only for public user)');
      } else {
        // Les bibliothécaires voient published + draft
        baseQuery = baseQuery.in('publication_status', ['published', 'draft']);
        console.log('🗄️ Base query created (digital_library_documents, published + draft for librarian)');
      }
      
      // Recherche générale (adapté aux colonnes de digital_library_documents)
      if (params.keyword) {
        // Échapper les caractères spéciaux pour éviter les erreurs de syntaxe Supabase
        const term = params.keyword.replace(/['"\\%]/g, '');
        if (term.length > 0) {
          baseQuery = baseQuery.or(`title.ilike.%${term}%,title_ar.ilike.%${term}%,author.ilike.%${term}%`);
        }
      }
      
      // Recherche par auteur
      if (params.author) {
        const author = params.author.replace(/['"\\%]/g, '');
        if (author.length > 0) {
          baseQuery = baseQuery.ilike('author', `%${author}%`);
        }
      }
      
      // Recherche par titre (FR ou AR)
      if (params.title) {
        const title = params.title.replace(/['"\\%]/g, '');
        if (title.length > 0) {
          baseQuery = baseQuery.or(`title.ilike.%${title}%,title_ar.ilike.%${title}%`);
        }
      }
      
      // Recherche par éditeur - cette colonne n'existe pas dans digital_library_documents
      // On ignore ce filtre pour l'instant ou on peut l'ajouter via une jointure future
      
      // Recherche par sujet - recherche dans themes (array)
      if (params.subject) {
        baseQuery = baseQuery.contains('themes', [params.subject]);
      }
      
      // Les colonnes cote, isbn, issn n'existent pas dans digital_library_documents
      // Ces recherches nécessiteraient une jointure avec cbn_documents ou catalog_metadata
      // Pour l'instant, on les désactive pour éviter les erreurs
      
      // Filtrer par langue
      if (params.language) {
        baseQuery = baseQuery.eq('language', params.language);
      }
      
      // Filtrer par type de document (insensible à la casse avec support des variantes)
      if (params.documentType) {
        // Mapping des types avec leurs variantes possibles dans la base (aligné avec le menu Collections)
        const typeVariantsMap: Record<string, string[]> = {
          'manuscript': ['manuscript', 'Manuscrit', 'manuscrit'],
          'lithography': ['lithography', 'Lithographie', 'lithographie'],
          'book': ['book', 'Livre', 'livre', 'rare_book', 'ebook', 'Imprimé'],
          'periodical': ['periodical', 'Périodique', 'periodique', 'Revue', 'revue', 'Journal', 'journal'],
          'specialized': ['image', 'Image', 'Cartes et Plans', 'cartes et plans', 'photo', 'Photo', 'affiche', 'Affiche', 'map', 'Map'],
          'audiovisual': ['audio', 'Audio', 'video', 'Vidéo', 'Video', 'audiovisual', 'Audiovisuel'],
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
  }, [searchParams, currentPage, itemsPerPage, toast, isLibrarian, rolesLoading]);

  // Effectuer la recherche quand les params changent ou au chargement (attendre que les rôles soient chargés)
  useEffect(() => {
    if (rolesLoading) return;
    console.log('🔄 useEffect triggered, searchParams:', searchParams.toString());
    performSearch();
  }, [performSearch, rolesLoading]);

  // Charger tous les documents au premier chargement
  useEffect(() => {
    if (rolesLoading) return;
    console.log('🎬 Component mounted');
    if (searchParams.toString() === '') {
      console.log('📋 No search params, loading all documents');
      performSearch();
    }
  }, [rolesLoading]);

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
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-bn-blue-primary via-bn-blue-deep to-bn-blue-primary overflow-hidden">
          {/* Decorative patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gold-bn-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-bn-primary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <Search className="h-4 w-4 text-gold-bn-primary" />
                <span className="text-sm font-medium text-white/90">Bibliothèque Numérique Ibn Battûta</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Recherche Avancée
              </h1>
              <p className="text-lg text-white/80 leading-relaxed">
                Explorez nos collections avec des critères précis pour trouver exactement ce que vous cherchez
              </p>
            </div>
          </div>
          
          {/* Wave separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 42.5C1200 45 1320 45 1380 45L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" className="fill-background"/>
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl -mt-4 relative z-20">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6 shadow-xl border-0 bg-card/95 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-gold-bn-primary/10 via-transparent to-bn-blue-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-gold-bn-primary to-gold-bn-secondary shadow-lg">
                        <Library className="h-5 w-5 text-white" />
                      </div>
                      Critères de recherche
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Sélectionnez un onglet et remplissez les champs correspondants
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto gap-2 bg-gradient-to-r from-muted/80 via-muted/50 to-muted/80 p-2 rounded-xl">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-bn-blue-primary rounded-lg transition-all duration-200">
                    <Search className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Tous les champs</span>
                    <span className="sm:hidden">Tous</span>
                  </TabsTrigger>
                  <TabsTrigger value="author" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-bn-blue-primary rounded-lg transition-all duration-200">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Auteur</span>
                    <span className="sm:hidden">Auteur</span>
                  </TabsTrigger>
                  <TabsTrigger value="title" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-bn-blue-primary rounded-lg transition-all duration-200">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Titre</span>
                    <span className="sm:hidden">Titre</span>
                  </TabsTrigger>
                  <TabsTrigger value="subject" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-bn-blue-primary rounded-lg transition-all duration-200">
                    <Tag className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Sujet</span>
                    <span className="sm:hidden">Sujet</span>
                  </TabsTrigger>
                  <TabsTrigger value="date" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-bn-blue-primary rounded-lg transition-all duration-200">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Date</span>
                    <span className="sm:hidden">Date</span>
                  </TabsTrigger>
                  <TabsTrigger value="number" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-bn-blue-primary rounded-lg transition-all duration-200">
                    <Hash className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Numéro</span>
                    <span className="sm:hidden">N°</span>
                  </TabsTrigger>
                </TabsList>

                {/* ONGLET: Tous les champs */}
                <TabsContent value="all" className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="keyword" className="text-base font-semibold">Recherche par mot clé</Label>
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
                          <SelectItem value="manuscript">Manuscrits</SelectItem>
                          <SelectItem value="lithography">Lithographies</SelectItem>
                          <SelectItem value="book">Livres (Rares, Imprimés & E-Books)</SelectItem>
                          <SelectItem value="periodical">Périodiques (Revues & Journaux)</SelectItem>
                          <SelectItem value="specialized">Cartes, Plans, Photos & Affiches</SelectItem>
                          <SelectItem value="audiovisual">Documents Audiovisuels</SelectItem>
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
            <Button type="submit" size="lg" className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-bn-blue-primary to-bn-blue-deep hover:from-bn-blue-deep hover:to-bn-blue-primary shadow-lg hover:shadow-xl transition-all duration-300">
              <Search className="h-5 w-5 mr-2" />
              Lancer la recherche
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={handleReset} 
              className="sm:w-auto h-14 text-base font-semibold border-2 hover:bg-muted/50"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Réinitialiser
            </Button>
          </div>

          {/* Search Tips */}
          <Card className="mt-6 bg-gradient-to-br from-gold-bn-primary/5 via-transparent to-bn-blue-primary/5 border-gold-bn-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-gold-bn-primary to-gold-bn-secondary">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                Conseils de recherche
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-gold-bn-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Utilisez les <strong className="text-foreground">guillemets ""</strong> pour une expression exacte
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-gold-bn-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Combinez <strong className="text-foreground">plusieurs onglets</strong> pour affiner
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-gold-bn-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  L'<strong className="text-foreground">autocomplétion</strong> suggère les valeurs existantes
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-gold-bn-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  La recherche est <strong className="text-foreground">insensible à la casse</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Search Results */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-bn-primary to-bn-blue-primary blur-xl opacity-30 animate-pulse" />
              <div className="relative p-6 rounded-full bg-gradient-to-br from-bn-blue-primary/10 to-gold-bn-primary/10">
                <Loader2 className="h-12 w-12 animate-spin text-bn-blue-primary" />
              </div>
            </div>
            <span className="mt-6 text-lg font-medium text-foreground">Recherche en cours...</span>
            <span className="text-sm text-muted-foreground">Exploration des collections</span>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <Card className="mt-8 shadow-xl border-0 bg-card/95 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-bn-blue-primary/5 via-transparent to-gold-bn-primary/5 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-bn-blue-primary to-bn-blue-deep shadow-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Résultats de recherche
                  </CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-bn-primary/10 text-gold-bn-primary font-semibold text-sm">
                      {totalResults}
                    </span>
                    document(s) trouvé(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
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

              <div className="grid gap-4">
                {searchResults.map((doc, index) => (
                  <Card key={doc.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-gold-bn-primary overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Thumbnail/Icon area */}
                        <div className="hidden sm:flex w-24 bg-gradient-to-br from-bn-blue-primary/10 to-gold-bn-primary/10 items-center justify-center flex-shrink-0">
                          <div className="p-3 rounded-xl bg-white/80 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="h-8 w-8 text-bn-blue-primary" />
                          </div>
                        </div>
                        
                        {/* Content area */}
                        <div className="flex-1 p-5">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                  #{index + 1 + (currentPage - 1) * itemsPerPage}
                                </span>
                                {doc.document_type && (
                                  <span className="text-xs px-2.5 py-1 bg-bn-blue-primary/10 text-bn-blue-primary rounded-full font-medium">
                                    {doc.document_type}
                                  </span>
                                )}
                              </div>
                              
                              <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-bn-blue-primary transition-colors">
                                {doc.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                <span className="font-medium">Par</span> {doc.author || 'Auteur inconnu'} 
                                <span className="mx-2">•</span>
                                <span className="font-medium">{doc.publication_year || 'Date inconnue'}</span>
                              </p>
                              
                              {doc.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {doc.description}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap gap-2">
                                {doc.cote && (
                                  <span className="text-xs px-2 py-1 bg-muted rounded-lg font-mono">
                                    {doc.cote}
                                  </span>
                                )}
                                {doc.language && (
                                  <span className="text-xs px-2 py-1 bg-gold-bn-primary/10 text-gold-bn-primary rounded-lg">
                                    {doc.language}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <Link to={`/digital-library/document/${doc.id}`} className="flex-shrink-0">
                              <Button className="bg-gradient-to-r from-bn-blue-primary to-bn-blue-deep hover:from-bn-blue-deep hover:to-bn-blue-primary shadow-md hover:shadow-lg transition-all">
                                Consulter
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

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
      </div>
    </DigitalLibraryLayout>
  );
}
