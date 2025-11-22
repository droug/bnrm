import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Search, BookOpen, FileText, Video, Image as ImageIcon, Globe, Filter, ChevronDown, X, TrendingUp, Eye, Download, Users, BookMarked, Library, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import modernLibraryHero from "@/assets/digital-library/modern-library-hero.jpg";
import manuscript1 from "@/assets/manuscript-1.jpg";
import manuscript2 from "@/assets/manuscript-2.jpg";
import manuscript3 from "@/assets/manuscript-3.jpg";

const DigitalLibraryModern = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<{type: string, value: string}[]>([]);

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
      title: "Manuscrits Rares",
      icon: BookOpen,
      count: "12.4K+",
      description: "Manuscrits arabes, berbères et hébraïques numérisés",
    },
    {
      id: "periodicals",
      title: "Périodiques",
      icon: FileText,
      count: "8.3K+",
      description: "Journaux et revues historiques du Maroc",
    },
    {
      id: "audiovisual",
      title: "Audiovisuels",
      icon: Video,
      count: "2.9K+",
      description: "Archives sonores et vidéos du patrimoine marocain",
    },
    {
      id: "special",
      title: "Collections Spécialisées",
      icon: ImageIcon,
      count: "3.2K+",
      description: "Cartes anciennes et lithographies du Maroc",
    }
  ];

  const stats = [
    {
      icon: Library,
      value: "2M+",
      label: "Ressources",
      description: "Documents numérisés"
    },
    {
      icon: Users,
      value: "150K+",
      label: "Utilisateurs",
      description: "Chercheurs actifs"
    },
    {
      icon: BookMarked,
      value: "68K+",
      label: "Collections",
      description: "Fonds patrimoniaux"
    }
  ];

  const featuredWorks = [
    {
      title: "Al-Kulliyat fi al-Tibb (Le Canon de la Médecine)",
      author: "Ibn Sina (Avicenne)",
      views: "5,234",
      image: manuscript1,
      date: "XVe siècle",
    },
    {
      title: "Es-Saada - Journal historique",
      author: "Archives nationales",
      views: "3,890",
      image: manuscript2,
      date: "1904-1920",
    },
    {
      title: "Al-Muqaddima (Les Prolégomènes)",
      author: "Ibn Khaldoun",
      views: "7,120",
      image: manuscript3,
      date: "XIVe siècle",
    }
  ];

  const repositories = [
    { name: "BNF", label: "Bibliothèque Nationale de France" },
    { name: "WDL", label: "World Digital Library" },
    { name: "EUROPEANA", label: "Europeana Collections" },
    { name: "IA", label: "Internet Archive" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section - Modern & Clean */}
        <section 
          className="relative bg-gradient-to-br from-[#1a4d5c] via-[#2c5d6b] to-[#1a4d5c] text-white overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(26, 77, 92, 0.92), rgba(44, 93, 107, 0.95)), url(${modernLibraryHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`
            }} />
          </div>

          <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
            {/* Header Text */}
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 tracking-tight">
                Bibliothèque Numérique<br />des Bibliothèques Marocaines
              </h1>
              <p className="text-xl md:text-2xl text-white/90 font-body font-light leading-relaxed">
                Découvrez des milliers de ressources, explorez les institutions et faites progresser votre recherche grâce à notre plateforme unifiée
              </p>
            </div>

            {/* Search Box - Clean & Modern */}
            <div className="max-w-4xl mx-auto">
              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-4">
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

              <form onSubmit={handleSearch} className="flex items-center gap-3">
                {/* Filters Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="lg"
                      className="h-14 px-5 gap-2 bg-white text-[#1a4d5c] hover:bg-white/95 border-0 shadow-lg shrink-0 font-semibold"
                    >
                      <Filter className="h-5 w-5" />
                      <span className="hidden sm:inline">Filtres</span>
                      {activeFilters.length > 0 && (
                        <Badge className="ml-1 h-5 min-w-5 px-1.5 bg-[#1a4d5c] text-white text-xs">
                          {activeFilters.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 bg-white border-gray-200 z-50 shadow-xl">
                    <DropdownMenuLabel className="text-base font-semibold">Filtrer par critère</DropdownMenuLabel>
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
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Éditeur</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuLabel className="text-sm">Période</DropdownMenuLabel>
                    
                    <div className="px-2 py-2 space-y-2">
                      <Select onValueChange={(value) => addFilter('publication_year', value)}>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue placeholder="Année" />
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
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={() => {
                      const value = prompt("Code langue (ar/fr/en/ber):");
                      if (value?.trim()) addFilter('language', value.trim().toLowerCase());
                    }} className="cursor-pointer">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>Langue</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Search Input */}
                <div className="relative flex-1">
                  <Input
                    type="search"
                    placeholder="Rechercher par titre, auteur, mots-clés..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 text-base bg-white shadow-lg border-0 focus:ring-2 focus:ring-white/50 pl-5 pr-24 font-body"
                  />
                  
                  {searchQuery && (
                    <Button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      variant="ghost"
                      size="sm"
                      className="absolute right-14 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button 
                    type="submit"
                    size="lg" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-[#1a4d5c] hover:bg-[#2c5d6b] text-white font-semibold"
                    disabled={!searchQuery.trim() && activeFilters.length === 0}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4">
          {/* Stats Section */}
          <section className="py-12 md:py-16 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1a4d5c]/10 text-[#1a4d5c] mb-4">
                    <stat.icon className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                  <div className="text-4xl font-display font-bold text-[#1a4d5c] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Collections Section */}
          <section className="py-12 md:py-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Parcourir les Collections
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-body">
                Explorez les profils des bibliothèques et parcourez des millions de ressources pour découvrir ce qui enrichira votre recherche
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {collections.map((collection) => (
                <Link 
                  key={collection.id}
                  to={`/collection/${collection.id}`}
                  className="group"
                >
                  <Card className="h-full border-2 hover:border-[#1a4d5c] transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1a4d5c]/10 flex items-center justify-center group-hover:bg-[#1a4d5c] transition-colors">
                        <collection.icon className="h-6 w-6 text-[#1a4d5c] group-hover:text-white transition-colors" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2 mb-2">
                          <CardTitle className="text-xl font-display font-semibold">
                            {collection.title}
                          </CardTitle>
                          <span className="text-sm font-bold text-[#1a4d5c]">
                            {collection.count}
                          </span>
                        </div>
                        <CardDescription className="text-sm font-body">
                          {collection.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Works Section */}
          <section className="py-12 md:py-16 bg-muted/30 -mx-4 px-4 md:mx-0 md:px-0 md:rounded-3xl">
            <div className="container">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                    Derniers Ajouts
                  </h2>
                  <p className="text-muted-foreground font-body">
                    Découvrez les ressources récemment ajoutées
                  </p>
                </div>
                <Button variant="outline" className="gap-2 font-semibold border-2">
                  Voir tout
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredWorks.map((work, index) => (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-[#1a4d5c]">
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img 
                        src={work.image} 
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardHeader className="space-y-3">
                      <Badge variant="secondary" className="w-fit text-xs font-semibold">
                        {work.date}
                      </Badge>
                      <CardTitle className="text-lg font-display leading-snug line-clamp-2 group-hover:text-[#1a4d5c] transition-colors">
                        {work.title}
                      </CardTitle>
                      <CardDescription className="font-body">
                        {work.author}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{work.views}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
                          <Download className="h-3.5 w-3.5" />
                          Télécharger
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Repositories Section */}
          <section className="py-12 md:py-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Dépôts Internationaux
              </h2>
              <p className="text-muted-foreground font-body">
                Accédez aux catalogues des bibliothèques partenaires
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {repositories.map((repo, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  className="gap-2 border-2 hover:border-[#1a4d5c] hover:bg-[#1a4d5c]/5 font-semibold"
                >
                  <Globe className="h-5 w-5" />
                  {repo.name}
                </Button>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 md:py-20">
            <div className="bg-gradient-to-br from-[#1a4d5c] to-[#2c5d6b] rounded-3xl p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Rejoignez le Réseau des Bibliothèques Marocaines
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto font-body">
                Améliorez la portée de vos collections et contribuez à l'infrastructure de connaissances de la nation
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-[#1a4d5c] hover:bg-white/90 font-semibold text-lg px-8">
                  Demander l'Adhésion
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-8">
                  Rechercher le Réseau
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DigitalLibraryModern;
