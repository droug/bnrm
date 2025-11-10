import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import WelcomePopup from "@/components/WelcomePopup";
import { useLanguage } from "@/hooks/useLanguage";
import SEOHead from "@/components/seo/SEOHead";
import SEOImage from "@/components/seo/SEOImage";
import { Search, Book, BookOpen, Users, FileText, Download, Calendar, Globe, Accessibility, Share2, MousePointer, Star, Sparkles, Gem, Filter, ChevronDown, X, Network } from "lucide-react";
import emblemeMaroc from "@/assets/embleme-maroc.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import bnrmBuildingNight from "@/assets/bnrm-building-night.jpg";
import moroccanPatternBg from "@/assets/moroccan-pattern-bg.jpg";
import zelligePattern1 from "@/assets/zellige-pattern-1.jpg";
import zelligePattern2 from "@/assets/zellige-pattern-2.jpg";
import zelligePattern3 from "@/assets/zellige-pattern-3.jpg";
import zelligePattern5 from "@/assets/zellige-pattern-5.jpg";
import zelligePattern6 from "@/assets/zellige-pattern-6.jpg";
import LegalDepositDeclaration from "@/components/LegalDepositDeclaration";

const Index = () => {
  const { t } = useLanguage(); // Utiliser le hook au lieu de créer un nouveau provider
  const navigate = useNavigate();
  const [showLegalDeposit, setShowLegalDeposit] = useState(false);
  const [selectedDepositType, setSelectedDepositType] = useState<"monographie" | "periodique" | "bd_logiciels" | "collections_specialisees" | null>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Array<{ type: string; value: string }>>([]);

  // Vérifier si le popup d'accueil doit être affiché
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('bnrm-welcome-popup-dismissed');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcomePopup(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLegalDepositClick = (type: "monographie" | "periodique" | "bd_logiciels" | "collections_specialisees") => {
    setSelectedDepositType(type);
    setShowLegalDeposit(true);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    activeFilters.forEach(filter => {
      params.set(filter.type, filter.value);
    });
    navigate(`/search?${params.toString()}`);
  };

  const addFilter = (type: string) => {
    const value = prompt(`Entrez la valeur pour ${getFilterLabel(type)}:`);
    if (value && value.trim()) {
      setActiveFilters(prev => [...prev, { type, value: value.trim() }]);
    }
  };

  const removeFilter = (index: number) => {
    setActiveFilters(prev => prev.filter((_, i) => i !== index));
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveFilters([]);
  };

  const getFilterLabel = (type: string) => {
    const labels: Record<string, string> = {
      author: "Auteur",
      publisher: "Éditeur",
      genre: "Genre",
      publication_year: "Année de publication",
      language: "Langue",
      content_type: "Type de contenu"
    };
    return labels[type] || type;
  };

  if (showLegalDeposit && selectedDepositType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <LegalDepositDeclaration 
          depositType={selectedDepositType}
          onClose={() => {
            setShowLegalDeposit(false);
            setSelectedDepositType(null);
          }}
        />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Accueil"
        description="Bibliothèque Nationale du Royaume du Maroc - Gardienne du patrimoine écrit marocain et porte d'accès au savoir universel. Collections de manuscrits, livres rares et ressources numériques."
        keywords={["bibliothèque maroc", "BNRM", "manuscrits marocains", "patrimoine culturel", "bibliothèque numérique", "dépôt légal", "recherche documentaire"]}
      />
      
      {/* Popup d'accueil */}
      <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)} 
      />
      
      {/* Popup d'accueil */}
      {/* <WelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)} 
      /> */}
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Arrière-plan de la page avec mosaïques zellige raffinées */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-pattern-zellige-complex opacity-25"></div>
          <div className="absolute inset-0 bg-pattern-mosaique-geometric opacity-20"></div>
          <div className="absolute inset-0 bg-pattern-moroccan-stars opacity-15"></div>
          <div className="absolute inset-0 bg-pattern-filigrane opacity-10"></div>
        </div>
        
        <div className="relative z-10">
          <Header />
          
          {/* Bannière moderne avec header intégré */}
          <section className="relative h-screen overflow-hidden -mt-[140px]">
            {/* Image de fond - Bâtiment BNRM de nuit - claire à 100% */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${bnrmBuildingNight})`,
                filter: 'brightness(1.2) contrast(1.1)'
              }}
            ></div>
            
            {/* Gradient overlay subtil pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
            
            {/* Contenu en haut */}
            <div className="relative z-10 h-full flex flex-col pt-[180px] px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <img src={emblemeMaroc} alt="Emblème du Maroc" className="h-14 w-14 md:h-16 md:w-16 object-contain drop-shadow-2xl" />
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-2xl">
                    {t('header.title')}
                  </h1>
                  <img src={emblemeMaroc} alt="Emblème du Maroc" className="h-14 w-14 md:h-16 md:w-16 object-contain drop-shadow-2xl" />
                </div>
                
                <p className="text-2xl md:text-3xl text-white/95 font-light mb-8 drop-shadow-lg">
                  Gardienne du patrimoine millénaire marocain
                </p>
                
                <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg mb-8">
                  La Bibliothèque Nationale du Royaume du Maroc forme les futurs citoyens du Maroc et du monde entier 
                  en préservant et en partageant le patrimoine culturel et intellectuel marocain
                </p>
              </div>
            </div>

            {/* Boutons d'action en bas de la bannière avec couleurs douces */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-wrap gap-4 justify-center px-4">
              <Link to="/digital-library">
                <Button className="py-6 px-8 bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 shadow-lg backdrop-blur-sm">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Explorer
                </Button>
              </Link>
              <Link to="/manuscripts-platform">
                <Button className="py-6 px-8 bg-blue-50/90 hover:bg-blue-100/90 text-blue-700 shadow-lg backdrop-blur-sm">
                  <Book className="h-5 w-5 mr-2" />
                  Manuscrits
                </Button>
              </Link>
              <Link to="/access-request">
                <Button className="py-6 px-8 bg-amber-50/90 hover:bg-amber-100/90 text-amber-700 shadow-lg backdrop-blur-sm">
                  <Download className="h-5 w-5 mr-2" />
                  Accès
                </Button>
              </Link>
              <Link to="/help">
                <Button className="py-6 px-8 bg-purple-50/90 hover:bg-purple-100/90 text-purple-700 shadow-lg backdrop-blur-sm">
                  <Users className="h-5 w-5 mr-2" />
                  Aide
                </Button>
              </Link>
            </div>
          </section>
          
          {/* Main Layout avec arrière-plans enrichis */}
          <main className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              
              {/* Zone principale avec arrière-plans zellige */}
              <div className="xl:col-span-3 space-y-8">
                
                {/* Zone de recherche avec mosaïques raffinées */}
                <div className="text-center mb-10 relative">
                  <div className="absolute inset-0 bg-pattern-zellige-complex opacity-35 rounded-3xl blur-sm"></div>
                  <div className="absolute inset-0 bg-pattern-moroccan-stars opacity-25 rounded-3xl"></div>
                  <div className="max-w-2xl mx-auto relative bg-gradient-mosaique backdrop-blur-md p-8 rounded-3xl shadow-mosaique border-3 border-gold/25">
                    <h2 className="text-2xl font-moroccan font-bold text-foreground mb-4">
                      {t('header.search')}
                    </h2>
                    
                    {/* Filtres actifs */}
                    {activeFilters.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        {activeFilters.map((filter, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="pl-3 pr-2 py-1 text-sm bg-primary/10 text-primary border border-primary/20"
                          >
                            <span className="font-semibold">{getFilterLabel(filter.type)}:</span>
                            <span className="ml-1">{filter.value}</span>
                            <button
                              onClick={() => removeFilter(index)}
                              className="ml-2 hover:text-destructive transition-colors"
                              aria-label="Supprimer le filtre"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="relative">
                      {/* Menu des filtres */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="transparent"
                            size="sm"
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-11 px-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border-2 border-white/30 text-white shadow-lg hover:shadow-xl transition-all"
                          >
                            <Filter className="h-4 w-4 mr-2 text-white" />
                            <ChevronDown className="h-4 w-4 text-white" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-popover">
                          <DropdownMenuItem onClick={() => addFilter('author')} className="text-base font-medium">
                            Auteur
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addFilter('publisher')} className="text-base font-medium">
                            Éditeur
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addFilter('genre')} className="text-base font-medium">
                            Genre
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addFilter('publication_year')} className="text-base font-medium">
                            Année de publication
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addFilter('language')} className="text-base font-medium">
                            Langue
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addFilter('content_type')} className="text-base font-medium">
                            Type de contenu
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Input
                        type="search"
                        placeholder="Explorez les trésors de la connaissance marocaine..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full h-16 text-lg bg-white/98 shadow-zellige border-3 border-gold/30 focus:border-primary pl-32 pr-32 rounded-full font-serif"
                      />
                      
                      {/* Bouton de suppression */}
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSearch}
                          className="absolute right-20 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full hover:bg-destructive/10 text-destructive"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}

                      <Button 
                        size="lg"
                        onClick={handleSearch}
                        className="absolute right-2 top-2 h-12 w-12 rounded-full bg-gradient-neutral shadow-gold hover:shadow-berber transition-all duration-300 transform hover:scale-105"
                      >
                        <Search className="h-6 w-6" />
                      </Button>
                    </div>
                    <p className="text-muted-foreground mt-4 italic font-elegant">
                      "Découvrez des siècles de savoir et de patrimoine culturel - Utilisez les filtres pour affiner votre recherche"
                    </p>
                  </div>
                </div>

                {/* Grille de contenu avec mosaïques et tons neutres */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Carte Actualités avec mosaïques subtiles */}
                  <Link to="/news">
                    <Card className="relative overflow-hidden group border-3 border-primary/30 shadow-zellige hover:shadow-mosaique transition-all duration-700 cursor-pointer">
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-15 group-hover:opacity-25 transition-opacity duration-700"
                        style={{ backgroundImage: `url(${zelligePattern3})` }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-primary opacity-75"></div>
                      <CardContent className="p-8 h-[280px] flex flex-col justify-center items-center text-center space-y-4 relative z-10">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-mosaique rounded-3xl flex items-center justify-center mb-4 shadow-zellige transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 border-2 border-white/20">
                            <Calendar className="h-10 w-10 text-white" />
                          </div>
                          <Gem className="absolute -top-2 -right-2 h-6 w-6 text-gold animate-bounce" />
                        </div>
                        <h3 className="text-xl font-moroccan font-bold text-white">
                          Actualités & Publications
                        </h3>
                        <p className="text-white/95 font-elegant text-sm">
                          Découvrez les dernières nouvelles, événements et publications de la BNRM
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                   {/* Carte Patrimoine avec motifs zellige */}
                  <Link to="/digital-library">
                    <Card className="relative overflow-hidden group border-3 border-accent/30 shadow-elegant hover:shadow-zellige transition-all duration-700 cursor-pointer">
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-700"
                        style={{ backgroundImage: `url(${zelligePattern5})` }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-accent opacity-80"></div>
                      <CardContent className="p-8 h-[280px] flex flex-col justify-center items-center text-center space-y-4 relative z-10">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-neutral rounded-3xl flex items-center justify-center mb-4 shadow-mosaique transform group-hover:scale-110 transition-all duration-500 border-2 border-white/20">
                            <Book className="h-10 w-10 text-white" />
                          </div>
                          <Star className="absolute -top-2 -right-2 h-6 w-6 text-gold fill-gold/70 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-moroccan font-bold text-white">
                          Bibliothèque Numérique
                        </h3>
                        <p className="text-white/95 font-elegant text-sm">
                          Collections manuscrites, fonds documentaires et trésors numériques
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Carte Plateforme Manuscrits */}
                  <Link to="/plateforme-manuscrits">
                    <Card className="relative overflow-hidden group border-3 border-gold/40 shadow-moroccan hover:shadow-zellige transition-all duration-700 cursor-pointer">
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-35 transition-opacity duration-700"
                        style={{ backgroundImage: `url(${zelligePattern2})` }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-primary opacity-85"></div>
                      <CardContent className="p-8 h-[280px] flex flex-col justify-center items-center text-center space-y-4 relative z-10">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-mosaique rounded-3xl flex items-center justify-center mb-4 shadow-zellige transform group-hover:scale-110 transition-all duration-500 border-2 border-gold/30">
                            <BookOpen className="h-10 w-10 text-white" />
                          </div>
                          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-gold animate-bounce" />
                        </div>
                        <h3 className="text-xl font-moroccan font-bold text-white">
                          Plateforme Manuscrits
                        </h3>
                        <p className="text-white/95 font-elegant text-sm">
                          Manuscrits BNRM & institutions partenaires marocaines
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Carte Portail CBM */}
                  <Link to="/cbm">
                    <Card className="relative overflow-hidden group border-3 border-cbm-primary/40 shadow-cbm hover:shadow-cbm-strong transition-all duration-700 cursor-pointer">
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-15 group-hover:opacity-25 transition-opacity duration-700"
                        style={{ backgroundImage: `url(${zelligePattern6})` }}
                      ></div>
                      <div 
                        className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity"
                        style={{ backgroundImage: 'var(--pattern-cbm-network)' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-cbm-primary/20 via-cbm-secondary/15 to-cbm-accent/20"></div>
                      <CardContent className="p-8 h-[280px] flex flex-col justify-center items-center text-center space-y-4 relative z-10">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-br from-cbm-primary to-cbm-secondary rounded-3xl flex items-center justify-center mb-4 shadow-cbm transform group-hover:scale-110 transition-all duration-500 border-2 border-cbm-primary/30">
                            <Network className="h-10 w-10 text-foreground" />
                          </div>
                          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-cbm-primary animate-pulse" />
                        </div>
                        <h3 className="text-xl font-moroccan font-bold text-foreground">
                          Portail CBM
                        </h3>
                        <p className="text-foreground/80 font-elegant text-sm">
                          Catalogue des Bibliothèques Marocaines - Réseau National
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Carte Kitab - Plateforme Éditoriale */}
                  <Link to="/kitab">
                    <Card className="relative overflow-hidden group border-3 border-coral/30 shadow-zellige hover:shadow-moroccan transition-all duration-700 cursor-pointer">
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-15 group-hover:opacity-25 transition-opacity duration-700"
                        style={{ backgroundImage: `url(${zelligePattern2})` }}
                      ></div>
                      <div 
                        className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity"
                        style={{ backgroundImage: 'var(--pattern-kitab-books)' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-coral/40 to-royal/30 opacity-80"></div>
                      <CardContent className="p-8 h-[280px] flex flex-col justify-center items-center text-center space-y-4 relative z-10">
                        <div className="relative">
                          <div className="w-20 h-20 bg-coral/70 rounded-3xl flex items-center justify-center mb-4 shadow-mosaique transform group-hover:scale-110 transition-all duration-500 border-2 border-coral/30">
                            <Book className="h-10 w-10 text-white" />
                          </div>
                          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-gold animate-pulse" />
                        </div>
                        <h3 className="text-xl font-moroccan font-bold text-foreground">
                          Plateforme Kitab
                        </h3>
                        <p className="text-muted-foreground font-elegant text-sm">
                          Bibliothèque Numérique de l'Édition Marocaine
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Carte Réservation des services des activités culturelles */}
                  <Link to="/cultural-activities">
                    <Card className="relative overflow-hidden group border-3 border-highlight/30 shadow-berber hover:shadow-mosaique transition-all duration-700 cursor-pointer">
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-700"
                        style={{ backgroundImage: `url(${zelligePattern6})` }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-neutral opacity-85"></div>
                      <CardContent className="p-8 h-[280px] flex flex-col justify-center items-center text-center space-y-4 relative z-10">
                        <div className="relative">
                          <div className="w-20 h-20 bg-highlight/70 rounded-3xl flex items-center justify-center mb-4 shadow-zellige transform group-hover:scale-110 transition-all duration-500 border-2 border-highlight/30">
                            <Calendar className="h-10 w-10 text-white" />
                          </div>
                          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-gold animate-pulse" />
                        </div>
                        <h3 className="text-xl font-moroccan font-bold text-foreground">
                          Services des Activités Culturelles
                        </h3>
                        <p className="text-muted-foreground font-elegant text-sm">
                          Réservez vos places pour les événements, conférences et activités culturelles
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                {/* Services rapides avec mosaïques zellige raffinées */}
                <Card className="relative overflow-hidden border-3 border-gold/25 shadow-mosaique">
                  <div className="absolute inset-0 bg-pattern-zellige-complex opacity-30"></div>
                  <div className="absolute inset-0 bg-pattern-filigrane opacity-20"></div>
                  <div className="absolute inset-0 bg-gradient-mosaique opacity-95"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-moroccan font-bold text-foreground mb-3">Dépôt Légal</h3>
                      <div className="w-32 h-2 bg-gradient-neutral mx-auto rounded-full shadow-gold"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105"
                        onClick={() => handleLegalDepositClick("monographie")}
                      >
                        Monographies
                      </Button>
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105"
                        onClick={() => handleLegalDepositClick("periodique")}
                      >
                        Publications Périodiques
                      </Button>
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105"
                        onClick={() => handleLegalDepositClick("bd_logiciels")}
                      >
                        BD & Logiciels
                      </Button>
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105"
                        onClick={() => handleLegalDepositClick("collections_specialisees")}
                      >
                        Collections Spécialisées
                      </Button>
                      <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 md:col-span-2"
                        onClick={() => navigate("/signup")}
                      >
                        Inscription
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Services rapides avec mosaïques zellige raffinées */}
                <Card className="relative overflow-hidden border-3 border-gold/25 shadow-mosaique">
                  <div className="absolute inset-0 bg-pattern-zellige-complex opacity-30"></div>
                  <div className="absolute inset-0 bg-pattern-filigrane opacity-20"></div>
                  <div className="absolute inset-0 bg-gradient-mosaique opacity-95"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-moroccan font-bold text-foreground mb-3">Services Rapides</h3>
                      <div className="w-32 h-2 bg-gradient-neutral mx-auto rounded-full shadow-gold"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { icon: FileText, label: "Dépôt légal", color: "text-primary", bg: "bg-primary/10", border: "border-primary/25", href: "/legal-deposit" },
                        { icon: BookOpen, label: "Réserver un document", color: "text-accent", bg: "bg-accent/10", border: "border-accent/25", href: "/cbn/reserver-ouvrage" },
                        { icon: Download, label: "Reproduction", color: "text-highlight", bg: "bg-highlight/10", border: "border-highlight/25", href: "/cbm/demande-reproduction" },
                         { icon: Calendar, label: "Événements", color: "text-gold", bg: "bg-gold/10", border: "border-gold/25", href: "/news" }
                        ].map((service, index) => (
                          <div 
                            key={index} 
                            className={`text-center p-5 rounded-2xl ${service.bg} hover:shadow-zellige transition-all duration-300 transform hover:scale-105 border-2 ${service.border} relative overflow-hidden group cursor-pointer`}
                            onClick={() => service.href && navigate(service.href)}
                          >
                           <div className="absolute inset-0 bg-pattern-filigrane opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                           <service.icon className={`h-10 w-10 ${service.color} mx-auto mb-3 relative z-10`} />
                           <p className="text-sm font-semibold text-foreground font-serif relative z-10">{service.label}</p>
                         </div>
                       ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar avec mosaïques et tons neutres */}
              <div className="xl:col-span-1 space-y-6">
                
                {/* Mon espace avec mosaïques raffinées */}
                <Link to="/auth">
                  <Card className="relative overflow-hidden group border-3 border-primary/25 shadow-mosaique hover:shadow-zellige transition-all duration-500 cursor-pointer">
                    <div className="absolute inset-0 bg-pattern-filigrane opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-pattern-zellige-tiles opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-mosaique opacity-90"></div>
                    <CardContent className="p-5 text-center relative z-10">
                      <div className="w-16 h-16 bg-gradient-neutral rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-mosaique transform group-hover:scale-110 transition-transform duration-300 border-2 border-primary/20">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-moroccan font-bold text-foreground mb-3">Mon Espace</h4>
                      <Button size="sm" className="w-full bg-gradient-primary shadow-gold hover:shadow-mosaique font-serif">
                        Connexion
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                {/* Cartes sidebar avec différentes mosaïques */}
                {[
                  { title: "Aide & Support", subtitle: "FAQ, règlements, contacts", icon: MousePointer, gradient: "bg-gradient-mosaique", pattern: "bg-pattern-moroccan-stars", border: "border-accent/25", shadow: "shadow-elegant hover:shadow-zellige", href: "/help" },
                  { title: "Services numériques", subtitle: "Catalogue, reproduction", icon: Download, gradient: "bg-gradient-neutral", pattern: "bg-pattern-filigrane", border: "border-gold/25", shadow: "shadow-gold hover:shadow-mosaique", href: "/services-bnrm" },
                  { title: "Langues", subtitle: "", icon: Globe, gradient: "bg-gradient-mosaique", pattern: "bg-pattern-zellige-tiles", border: "border-highlight/25", shadow: "shadow-berber hover:shadow-gold", href: "#" },
                  { title: "Accessibilité", subtitle: "Options d'accessibilité", icon: Accessibility, gradient: "bg-gradient-neutral", pattern: "bg-pattern-moroccan-stars", border: "border-royal/25", shadow: "shadow-royal hover:shadow-mosaique", href: "#" },
                  { title: "Partager", subtitle: "", icon: Share2, gradient: "bg-gradient-mosaique", pattern: "bg-pattern-filigrane", border: "border-primary/25", shadow: "shadow-mosaique hover:shadow-zellige", href: "#" }
                ].map((item, index) => (
                  <Link key={index} to={item.href}>
                    <Card className={`relative overflow-hidden group border-3 ${item.border} ${item.shadow} transition-all duration-500 cursor-pointer`}>
                      <div className={`absolute inset-0 ${item.pattern} opacity-15 group-hover:opacity-25 transition-opacity duration-500`}></div>
                      <div className={`absolute inset-0 ${item.gradient} opacity-85`}></div>
                      <CardContent className="p-4 text-center relative z-10">
                        <item.icon className="h-6 w-6 text-foreground mx-auto mb-2" />
                        <h4 className="font-moroccan text-sm font-bold text-foreground">{item.title}</h4>
                        {item.subtitle && <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </main>
          
          <Footer />
          
          {/* Outils globaux (Accessibilité + Chatbot) */}
          <GlobalAccessibilityTools />
        </div>
      </div>
    </>
  );
};

export default Index;