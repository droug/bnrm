import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Search, Book, BookOpen, FileText, Video, Music, Image as ImageIcon, Globe, ArrowRight, TrendingUp, Clock, Eye, Download, Filter, ChevronDown, X, Calendar, HelpCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import digitalLibraryHero from "@/assets/digital-library-hero.jpg";
import manuscript1 from "@/assets/manuscript-1.jpg";
import manuscript2 from "@/assets/manuscript-2.jpg";
import manuscript3 from "@/assets/manuscript-3.jpg";
import moroccanPatternBg from "@/assets/moroccan-pattern-bg.jpg";
import zelligePattern1 from "@/assets/zellige-pattern-1.jpg";
import zelligePattern2 from "@/assets/zellige-pattern-2.jpg";
import zelligePattern3 from "@/assets/zellige-pattern-3.jpg";
import zelligePattern5 from "@/assets/zellige-pattern-5.jpg";
import zelligePattern6 from "@/assets/zellige-pattern-6.jpg";

// Fallback images for featured works
const fallbackImages = [manuscript1, manuscript2, manuscript3];

const DigitalLibrary = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<{type: string, value: string}[]>([]);

  // Fetch hero settings from CMS for BN (Bibliothèque Numérique) platform
  const { data: heroSettings } = useQuery({
    queryKey: ["cms-hero-settings-bn"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_hero_settings")
        .select("*")
        .eq("platform", "bn")
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching hero settings:", error);
        return null;
      }

      return data ?? null;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  // Fetch featured works from database
  const { data: featuredWorks = [], isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-works-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('digital_library_featured_works')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      // Fetch document details for each work with document_id
      const worksWithDocs = await Promise.all(
        (data || []).map(async (work: any, index: number) => {
          let docData = null;
          if (work.document_id) {
            const { data: doc } = await supabase
              .from('digital_library_documents')
              .select('id, title, title_ar, author, cover_image_url, document_type, publication_year, views_count')
              .eq('id', work.document_id)
              .single();
            docData = doc;
          }
          
          // Build the featured work object with fallbacks
          return {
            id: work.id,
            documentId: work.document_id || null,
            title: docData?.title || work.custom_title || "Sans titre",
            titleAr: docData?.title_ar || work.custom_title_ar || null,
            author: docData?.author || work.custom_author || "Auteur inconnu",
            image: docData?.cover_image_url || work.custom_image_url || fallbackImages[index % fallbackImages.length],
            category: work.custom_category || docData?.document_type || "Document",
            date: work.custom_date || (docData?.publication_year ? String(docData.publication_year) : ""),
            description: work.custom_description || "",
            views: docData?.views_count ? String(docData.views_count) : "0",
            link: work.custom_link || (work.document_id ? `/digital-library/document/${work.document_id}` : null)
          };
        })
      );
      
      return worksWithDocs;
    }
  });

  // Get hero image URL with fallback
  const heroImageUrl = heroSettings?.hero_image_url || digitalLibraryHero;
  const heroTitle = language === 'ar' 
    ? (heroSettings?.hero_title_ar || 'المكتبة الرقمية للمغرب')
    : (heroSettings?.hero_title_fr || 'Bibliothèque Numérique du Maroc');
  const heroSubtitle = language === 'ar'
    ? (heroSettings?.hero_subtitle_ar || 'اكتشف التراث المكتوب المغربي')
    : (heroSettings?.hero_subtitle_fr || 'Découvrez le patrimoine écrit marocain : manuscrits andalous, périodiques historiques, ouvrages rares et collections d\'exception');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchParams = new URLSearchParams();
    
    if (searchQuery.trim()) {
      searchParams.append('q', searchQuery.trim());
    } else if (activeFilters.length > 0) {
      searchParams.append('q', '*');
    } else {
      return;
    }
    
    activeFilters.forEach(filter => {
      searchParams.append(filter.type, filter.value);
    });
    
    navigate(`/search?${searchParams.toString()}`);
  };

  const addFilter = (type: string, value: string) => {
    const newFilters = activeFilters.filter(f => f.type !== type);
    setActiveFilters([...newFilters, { type, value }]);
  };

  const removeFilter = (type: string) => {
    setActiveFilters(activeFilters.filter(f => f.type !== type));
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveFilters([]);
  };

  const getFilterLabel = (type: string) => {
    const labels: Record<string, string> = {
      'author': 'Auteur',
      'publisher': 'Éditeur',
      'genre': 'Genre',
      'publication_year': 'Année',
      'publication_month': 'Mois',
      'language': 'Langue',
      'content_type': 'Type'
    };
    return labels[type] || type;
  };

  // Generate years for dropdown (from 1900 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);
  
  const months = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  const collections = [
    {
      id: "manuscripts",
      title: "Manuscrits",
      icon: BookOpen,
      count: "12,450",
      description: "Manuscrits arabes, berbères et hébraïques",
      color: "text-bn-blue-primary",
      bgColor: "bg-bn-blue-primary/10",
      gradient: "from-bn-blue-primary/20 to-gold-bn-primary/20"
    },
    {
      id: "periodicals",
      title: "Périodiques",
      icon: FileText,
      count: "8,320",
      description: "Journaux marocains historiques et revues",
      color: "text-gold-bn-primary",
      bgColor: "bg-gold-bn-primary/10",
      gradient: "from-gold-bn-primary/20 to-bn-blue-deep/20"
    },
    {
      id: "monographs",
      title: "Monographies",
      icon: Book,
      count: "45,670",
      description: "Ouvrages sur le patrimoine marocain",
      color: "text-bn-blue-deep",
      bgColor: "bg-bn-blue-deep/10",
      gradient: "from-bn-blue-deep/20 to-gold-bn-primary-dark/20"
    },
    {
      id: "special",
      title: "Collections Spécialisées",
      icon: ImageIcon,
      count: "3,240",
      description: "Cartes anciennes, lithographies marocaines",
      color: "text-gold-bn-primary-dark",
      bgColor: "bg-gold-bn-primary-dark/10",
      gradient: "from-gold-bn-primary-dark/20 to-bn-blue-primary/20"
    },
    {
      id: "audiovisual",
      title: "Documents Audiovisuels",
      icon: Video,
      count: "2,890",
      description: "Archives sonores et vidéos du Maroc",
      color: "text-gold-bn-deep",
      bgColor: "bg-gold-bn-deep/10",
      gradient: "from-gold-bn-deep/20 to-bn-blue-primary/20"
    }
  ];

  // Static fallback data for when no featured works are configured
  const staticFeaturedWorks = [
    {
      id: 'static-1',
      documentId: null,
      title: "Al-Kulliyat fi al-Tibb (Le Canon de la Médecine)",
      titleAr: null,
      author: "Ibn Sina (Avicenne) - Copie marocaine",
      views: "5,234",
      category: "Manuscrits",
      image: manuscript1,
      date: "XVe siècle",
      description: "Manuscrit médical en arabe classique, calligraphie maghrébie",
      link: null
    },
    {
      id: 'static-2',
      documentId: null,
      title: "Es-Saada (Le Bonheur) - Journal historique",
      titleAr: null,
      author: "Archives nationales marocaines",
      views: "3,890",
      category: "Périodiques",
      image: manuscript2,
      date: "1904-1920",
      description: "Premier journal marocain en langue arabe",
      link: null
    },
    {
      id: 'static-3',
      documentId: null,
      title: "Al-Muqaddima (Les Prolégomènes)",
      titleAr: null,
      author: "Ibn Khaldoun",
      views: "7,120",
      category: "Manuscrits",
      image: manuscript3,
      date: "XIVe siècle",
      description: "Œuvre fondatrice de sociologie et d'histoire",
      link: null
    }
  ];

  // Use database featured works if available, otherwise fall back to static data
  const displayedFeaturedWorks = featuredWorks.length > 0 ? featuredWorks : staticFeaturedWorks;

  const internationalRepositories = [
    { name: "Bibliothèque Nationale de France", code: "BNF", url: "#" },
    { name: "World Digital Library", code: "WDL", url: "#" },
    { name: "Europeana", code: "EUROPEANA", url: "#" },
    { name: "Internet Archive", code: "IA", url: "#" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative mb-12 py-24 md:py-32 px-8 rounded-3xl border-4 border-gold-bn-primary/40 overflow-hidden shadow-2xl">
          {/* Background Image - Dynamic from CMS */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{ backgroundImage: `url(${heroImageUrl})` }}
          ></div>
          {/* Overlay - BN Blue tones */}
          <div className="absolute inset-0 bg-gradient-to-r from-bn-blue-primary/70 via-bn-blue-primary/60 to-bn-blue-deep/70"></div>
          <div className="absolute inset-0 bg-pattern-zellige-complex opacity-10"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-moroccan font-bold text-white mb-6 drop-shadow-2xl">
              {heroTitle}
            </h1>
            <p className="text-2xl md:text-3xl text-white mb-10 max-w-4xl mx-auto drop-shadow-2xl font-elegant">
              {heroSubtitle}
            </p>
            
            {/* Advanced Search Bar with Filters */}
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Filter badges */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {activeFilters.map((filter) => (
                    <Badge 
                      key={filter.type} 
                      variant="secondary" 
                      className="gap-1.5 bg-white/20 text-white border border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors px-3 py-1.5"
                    >
                      <span className="text-sm font-medium">
                        {getFilterLabel(filter.type)}: {filter.value}
                      </span>
                      <button
                        onClick={() => removeFilter(filter.type)}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="h-7 px-2 text-white/90 hover:text-white hover:bg-white/20"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Tout effacer
                  </Button>
                </div>
              )}

              <form onSubmit={handleSearch} className="flex items-center gap-2">
                {/* Filters Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      className="h-16 px-4 gap-2 bg-white/95 hover:bg-white border-3 border-gold-bn-primary/30 shadow-lg shrink-0"
                    >
                      <Filter className="h-5 w-5" />
                      <span className="hidden sm:inline">Filtres</span>
                      <ChevronDown className="h-4 w-4" />
                      {activeFilters.length > 0 && (
                        <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {activeFilters.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 bg-white/10 backdrop-blur-md border-white/30 z-50 shadow-xl text-white">
                    <DropdownMenuLabel className="text-base">Filtrer par critère</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => {
                      const value = prompt("Nom de l'auteur:");
                      if (value?.trim()) addFilter('author', value.trim());
                    }} className="cursor-pointer">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>Auteur</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => {
                      const value = prompt("Nom de l'éditeur:");
                      if (value?.trim()) addFilter('publisher', value.trim());
                    }} className="cursor-pointer">
                      <Book className="h-4 w-4 mr-2" />
                      <span>Éditeur</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => {
                      const value = prompt("Genre (ex: Roman, Poésie, Histoire...):");
                      if (value?.trim()) addFilter('genre', value.trim());
                    }} className="cursor-pointer">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Genre</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuLabel className="text-sm">Période de publication</DropdownMenuLabel>
                    
                    <div className="px-2 py-2 space-y-2">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Année</label>
                        <Select onValueChange={(value) => addFilter('publication_year', value)}>
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="Sélectionner une année" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Mois</label>
                        <Select 
                          onValueChange={(value) => addFilter('publication_month', value)}
                          disabled={!activeFilters.some(f => f.type === 'publication_year')}
                        >
                          <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="Sélectionner un mois" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => {
                      const value = prompt("Code langue (ar/fr/en/ber):");
                      if (value?.trim()) addFilter('language', value.trim().toLowerCase());
                    }} className="cursor-pointer">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>Langue</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => {
                      const options = ['manuscript', 'book', 'periodical', 'article'];
                      const value = prompt(`Type de contenu (${options.join(', ')}):`);
                      if (value?.trim() && options.includes(value.trim().toLowerCase())) {
                        addFilter('content_type', value.trim().toLowerCase());
                      }
                    }} className="cursor-pointer">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      <span>Type de contenu</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Search Input */}
                <div className="relative flex-1">
                  <Input
                    type="search"
                    placeholder="Rechercher dans les collections (titre, auteur, mots-clés...)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-16 text-lg bg-white/98 shadow-lg border-3 border-gold-bn-primary/30 focus:border-bn-blue-primary pl-6 pr-28 rounded-full"
                  />
                  
                  {/* Clear button */}
                  {searchQuery && (
                    <Button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      variant="ghost"
                      size="sm"
                      className="absolute right-16 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-destructive/10 rounded-full"
                      title="Effacer"
                    >
                      <X className="h-5 w-5 text-destructive" />
                    </Button>
                  )}
                  
                  {/* Search button */}
                  <Button 
                    type="submit"
                    size="lg" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-md bg-gold-bn-primary hover:bg-gold-bn-primary-dark text-white"
                    disabled={!searchQuery.trim() && activeFilters.length === 0}
                  >
                    <Search className="h-6 w-6" />
                  </Button>
                </div>
              </form>
              
              <p className="text-white/90 text-sm text-center font-medium">
                💡 Utilisez les filtres pour affiner votre recherche par auteur, éditeur, année, genre ou langue
              </p>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="mb-12">
          <h2 className="text-3xl font-moroccan font-bold text-foreground mb-6">
            Nos Collections Numériques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => {
              const Icon = collection.icon;
              return (
                <Link key={collection.id} to={`/digital-library/${collection.id}`}>
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 border-3 border-gold-bn-primary/30 hover:border-gold-bn-primary cursor-pointer relative overflow-hidden group">
                    {/* Zellige Pattern Background */}
                    <div 
                      className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${
                          collection.id === 'manuscripts' ? zelligePattern1 :
                          collection.id === 'periodicals' ? zelligePattern3 :
                          collection.id === 'monographs' ? zelligePattern2 :
                          collection.id === 'special' ? zelligePattern5 :
                          zelligePattern6
                        })` 
                      }}
                    ></div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-70`}></div>
                    
                    <CardHeader className="relative z-10">
                      <div className={`w-16 h-16 ${collection.bgColor} rounded-xl flex items-center justify-center mb-4 shadow-lg border-2 border-gold/20`}>
                        <Icon className={`h-8 w-8 ${collection.color}`} />
                      </div>
                      <CardTitle className="text-xl font-moroccan font-bold">{collection.title}</CardTitle>
                      <CardDescription className="font-elegant">{collection.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-base px-4 py-1 bg-white/80 backdrop-blur-sm">
                          {collection.count} documents
                        </Badge>
                        <ArrowRight className="h-5 w-5 text-gold-bn-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Works */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-moroccan font-bold text-foreground">
              Œuvres à la Une
            </h2>
            <Button variant="outline" className="flex items-center gap-2 border-gold-bn-primary text-bn-blue-primary hover:bg-gold-bn-surface">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFeaturedWorks.slice(0, 3).map((work, index) => (
              <Link key={work.id} to={work.link || `/digital-library/document/${work.documentId || index}`}>
                <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-3 border-gold-bn-primary/30 hover:border-gold-bn-primary group overflow-hidden">
                  {/* Image */}
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img 
                      src={work.image} 
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <Badge variant="secondary" className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm">
                      {work.category}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg font-moroccan leading-tight">{work.title}</CardTitle>
                    <CardDescription className="font-elegant">{work.author}</CardDescription>
                    <div className="text-xs text-muted-foreground mt-2">{work.date}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{work.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{work.views} consultations</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Tabs Section */}
        <section className="mb-12">
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Récemment ajoutés
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Les plus consultés
              </TabsTrigger>
              <TabsTrigger value="recommended" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Recommandations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent">
              <Card className="border-2 border-gold-bn-primary/20">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-2 font-elegant">
                    Découvrez les derniers documents numérisés et ajoutés à notre bibliothèque numérique.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {displayedFeaturedWorks.slice(0, 4).map((work) => (
                      <Link key={work.id} to={work.link || `/digital-library/document/${work.documentId || work.id}`}>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-md hover:shadow-xl relative group">
                          <img 
                            src={work.image} 
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="text-white text-xs font-semibold line-clamp-2">{work.title}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="popular">
              <Card className="border-2 border-gold-bn-primary/20">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-2 font-elegant">
                    Les documents les plus consultés par notre communauté.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[...displayedFeaturedWorks].sort((a, b) => parseInt(b.views.replace(',', '')) - parseInt(a.views.replace(',', ''))).slice(0, 4).map((work) => (
                      <Link key={work.id} to={work.link || `/digital-library/document/${work.documentId || work.id}`}>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-md hover:shadow-xl relative group">
                          <img 
                            src={work.image} 
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="text-white text-xs font-semibold line-clamp-2">{work.title}</p>
                          </div>
                          <Badge className="absolute top-2 right-2 bg-gold-bn-primary/90 backdrop-blur-sm text-white">
                            <Eye className="h-3 w-3 mr-1" />
                            {work.views}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommended">
              <Card className="border-2 border-gold-bn-primary/20">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-2 font-elegant">
                    Sélection personnalisée basée sur les manuscrits andalous et maghrébins.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {displayedFeaturedWorks.slice(0, 4).map((work) => (
                      <Link key={work.id} to={work.link || `/digital-library/document/${work.documentId || work.id}`}>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-md hover:shadow-xl relative group">
                          <img 
                            src={work.image} 
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="text-white text-xs font-semibold line-clamp-2">{work.title}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* International Repositories */}
        <section className="mb-12">
          <h2 className="text-3xl font-moroccan font-bold text-foreground mb-6">
            Réservoirs Internationaux
          </h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-6">
                Accédez aux collections des grandes bibliothèques numériques mondiales
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {internationalRepositories.map((repo) => (
                  <a 
                    key={repo.code}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border-2 border-muted rounded-lg hover:border-gold-bn-primary hover:bg-gold-bn-surface transition-all duration-300"
                  >
                    <Globe className="h-6 w-6 text-bn-blue-primary" />
                    <div>
                      <div className="font-semibold">{repo.code}</div>
                      <div className="text-xs text-muted-foreground">{repo.name}</div>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Help & Support Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-bn-blue-primary/10 via-gold-bn-primary/10 to-bn-blue-deep/10 rounded-2xl p-8 border-2 border-gold-bn-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-bn-blue-primary/30 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-bn-blue-primary/10 rounded-lg">
                      <HelpCircle className="h-6 w-6 text-bn-blue-primary" />
                    </div>
                    <CardTitle className="text-xl">Besoin d'aide ?</CardTitle>
                  </div>
                  <CardDescription>
                    Accédez à nos guides, tutoriels et FAQ pour utiliser efficacement la bibliothèque numérique
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/help">
                    <Button className="w-full gap-2 bg-gold-bn-primary hover:bg-gold-bn-primary-dark text-white">
                      <Lightbulb className="h-4 w-4" />
                      Consulter le centre d'aide
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-gold-bn-primary/30 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-gold-bn-primary/10 rounded-lg">
                      <BookOpen className="h-6 w-6 text-gold-bn-primary" />
                    </div>
                    <CardTitle className="text-xl">Guides rapides</CardTitle>
                  </div>
                  <CardDescription>
                    Des tutoriels étape par étape pour les fonctionnalités principales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <Link to="/help" className="flex items-center gap-2 text-muted-foreground hover:text-bn-blue-primary transition-colors">
                      <ArrowRight className="h-4 w-4" />
                      Comment rechercher dans les collections
                    </Link>
                    <Link to="/help" className="flex items-center gap-2 text-muted-foreground hover:text-bn-blue-primary transition-colors">
                      <ArrowRight className="h-4 w-4" />
                      Consulter et télécharger des documents
                    </Link>
                    <Link to="/help" className="flex items-center gap-2 text-muted-foreground hover:text-bn-blue-primary transition-colors">
                      <ArrowRight className="h-4 w-4" />
                      Utiliser les filtres avancés
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DigitalLibrary;
