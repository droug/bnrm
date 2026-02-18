import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/seo/SEOHead";
import SEOImage from "@/components/seo/SEOImage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Eye, Download, Calendar, User, MapPin, Lock, AlertCircle, Star, Sparkles, Filter, ChevronDown, X, Users, Building2, HelpCircle, SlidersHorizontal } from "lucide-react";
import emblemeMaroc from "@/assets/embleme-maroc.png";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WatermarkContainer } from "@/components/ui/watermark";
import { ProtectedWatermark } from "@/components/ui/protected-watermark";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PartnerCollectionForm } from "@/components/partner/PartnerCollectionForm";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ManuscriptGrid } from "@/components/manuscripts/ManuscriptGrid";
import { useManuscriptSearch, SearchFilters } from "@/hooks/useManuscriptSearch";
import { SearchResultsPanel } from "@/components/manuscripts/SearchResultsPanel";
import { SearchPagination } from "@/components/manuscripts/SearchPagination";
import { ManuscriptSearchBar } from "@/components/manuscripts/ManuscriptSearchBar";

import manuscriptBanner from "@/assets/manuscript-banner.jpg";
import moroccanPatternBg from "@/assets/moroccan-pattern-bg.jpg";
import zelligePattern1 from "@/assets/zellige-pattern-1.jpg";
import zelligePattern2 from "@/assets/zellige-pattern-2.jpg";
import zelligePattern3 from "@/assets/zellige-pattern-3.jpg";
import manuscriptArabic from "@/assets/manuscript-arabic.jpg";
import manuscriptArabic2 from "@/assets/manuscript-arabic-2.jpg";
import manuscriptArabic3 from "@/assets/manuscript-arabic-3.jpg";
import manuscriptBerber from "@/assets/manuscript-berber.jpg";
import manuscriptBerber2 from "@/assets/manuscript-berber-2.jpg";
import manuscriptBerber3 from "@/assets/manuscript-berber-3.jpg";
import manuscriptLatin from "@/assets/manuscript-latin.jpg";
import manuscriptLatin2 from "@/assets/manuscript-latin-2.jpg";
import manuscriptLatin3 from "@/assets/manuscript-latin-3.jpg";
import manuscriptFrench from "@/assets/manuscript-french.jpg";
import manuscriptFrench2 from "@/assets/manuscript-french-2.jpg";
import manuscriptFrench3 from "@/assets/manuscript-french-3.jpg";

interface Manuscript {
  id: string;
  title: string;
  author: string;
  description: string;
  language: string;
  period: string;
  material: string;
  dimensions: string;
  condition_notes: string;
  inventory_number: string;
  digital_copy_url: string;
  thumbnail_url: string;
  access_level: 'public' | 'restricted' | 'confidential';
  status: 'available' | 'digitization' | 'reserved' | 'maintenance';
  institution?: string; // BNRM ou institution partenaire
  created_at: string;
}

export default function ManuscriptsPlatform() {
  const { user, loading, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  
  const { 
    results, 
    loading: searchLoading, 
    totalResults, 
    page, 
    perPage, 
    facets,
    search, 
    setPage, 
    setPerPage,
    highlightText 
  } = useManuscriptSearch();

  // Fonction pour sélectionner une image variée selon la langue
  const getManuscriptImage = (language: string, id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    if (language === 'arabe') {
      const images = [manuscriptArabic, manuscriptArabic2, manuscriptArabic3];
      return images[hash % images.length];
    } else if (language === 'berbère') {
      const images = [manuscriptBerber, manuscriptBerber2, manuscriptBerber3];
      return images[hash % images.length];
    } else if (language === 'latin') {
      const images = [manuscriptLatin, manuscriptLatin2, manuscriptLatin3];
      return images[hash % images.length];
    } else if (language === 'français') {
      const images = [manuscriptFrench, manuscriptFrench2, manuscriptFrench3];
      return images[hash % images.length];
    }
    
    return manuscriptArabic;
  };

  useEffect(() => {
    // Effectuer la recherche initiale avec debounce
    const timer = setTimeout(() => {
      search(searchQuery, filters);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  // Charger tous les manuscrits au premier chargement
  useEffect(() => {
    search("", {}, 1);
  }, []);

  const handleSearch = () => {
    search(searchQuery, filters, 1);
  };

  const handleResultClick = (result: any) => {
    // Vérifier si le manuscrit est numérisé
    if (!result.digital_copy_url && !result.file_url) {
      toast({
        title: "Ouvrage non numérisé",
        description: "Ce manuscrit est catalogué mais n'est pas encore numérisé. Vous pouvez faire une demande de numérisation.",
        variant: "default",
      });
      return;
    }
    navigate(`/manuscrit/${result.id}`);
  };

  const canAccessManuscript = (manuscript: Manuscript) => {
    // Tous les manuscrits sont maintenant accessibles
    return true;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'digitization': return 'secondary';
      case 'reserved': return 'destructive';
      case 'maintenance': return 'outline';
      default: return 'default';
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'default';
      case 'restricted': return 'secondary';
      case 'confidential': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'digitization': return 'Numérisation';
      case 'reserved': return 'Réservé';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const getAccessLabel = (level: string) => {
    switch (level) {
      case 'public': return 'Public';
      case 'restricted': return 'Adhérents';
      case 'confidential': return 'Confidentiel';
      default: return level;
    }
  };

  const getUserAccessLevel = () => {
    if (!user) return 'Visiteur (accès public uniquement)';
    if (profile?.role === 'admin' || profile?.role === 'librarian') return 'Accès complet';
    if (profile?.role === 'partner' || profile?.role === 'researcher') return 'Accès étendu';
    if (profile?.role === 'subscriber') return 'Accès adhérent';
    return 'Accès public';
  };

  if (loading || searchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "Plateforme des Manuscrits - BNRM & Partenaires", 
        variant: "subtle", 
        position: "pattern",
        opacity: 0.03
      }}
    >
      <SEOHead
        title="Plateforme des Manuscrits Numérisés"
        description="Découvrez les trésors manuscrits de la BNRM et des institutions partenaires marocaines. Collections de manuscrits arabes, berbères, latins et français numérisés."
        keywords={["manuscrits marocains", "manuscrits arabes", "manuscrits berbères", "patrimoine manuscrit", "numérisation manuscrits", "BNRM manuscrits"]}
      />
      
      <div className="min-h-screen bg-background relative">
        <ProtectedWatermark 
          userRole={profile?.role || "visitor"}
          isProtected={true}
        />
        <Header />
        
        <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {/* Hero Section - Mobile First */}
          <section className="relative mb-6 sm:mb-8 md:mb-12 py-8 sm:py-12 md:py-20 px-4 sm:px-6 md:px-8 rounded-xl sm:rounded-2xl md:rounded-3xl border-2 sm:border-4 border-gold/40 overflow-hidden shadow-lg sm:shadow-xl md:shadow-2xl">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${manuscriptBanner})` }}
            ></div>
            {/* Overlay - stronger on mobile for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-royal/90 sm:from-black/70 sm:via-black/60 sm:to-royal/80"></div>
            <div className="absolute inset-0 bg-pattern-zellige-complex opacity-10 sm:opacity-20"></div>
            <div className="absolute inset-0 bg-pattern-moroccan-stars opacity-10 sm:opacity-15"></div>
            
            <div className="relative z-10 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <img src={emblemeMaroc} alt="Emblème du Maroc" className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow-lg hidden sm:block" />
                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-moroccan font-bold text-white drop-shadow-2xl leading-tight px-2">
                  Plateforme des Manuscrits Numérisés
                </h1>
                <img src={emblemeMaroc} alt="Emblème du Maroc" className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow-lg hidden sm:block" />
              </div>
              <p className="text-sm sm:text-lg md:text-xl text-white/95 mb-4 sm:mb-6 max-w-full sm:max-w-2xl md:max-w-3xl mx-auto drop-shadow-md font-elegant px-2">
                Découvrez les trésors manuscrits de la BNRM et des institutions partenaires marocaines
              </p>
              
              {/* Boutons d'action - Stack on mobile */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-2">
                <Button 
                  size="default" 
                  asChild 
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/30 text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto text-sm sm:text-base"
                >
                  <Link to="/manuscripts/help">
                    <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Centre d'Aide
                  </Link>
                </Button>
                
                {user && (
                <Sheet open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
                    <SheetTrigger asChild>
                      <Button size="default" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/30 text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto text-sm sm:text-base">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Devenir Partenaire
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:w-[560px] sm:max-w-[560px] overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Demande de Partenariat BNRM</SheetTitle>
                      </SheetHeader>
                      <div className="mt-4">
                        <PartnerCollectionForm onSuccess={() => setPartnerDialogOpen(false)} />
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
                {profile?.role === 'partner' && (
                  <Button size="default" asChild className="bg-gold hover:bg-gold/90 text-white shadow-lg w-full sm:w-auto text-sm sm:text-base">
                    <Link to="/partner-dashboard">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Espace Partenaire
                    </Link>
                  </Button>
                )}
              </div>
              
              <div className="flex justify-center space-x-1 sm:space-x-2 mb-4 sm:mb-6">
                {[...Array(7)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gold fill-gold animate-pulse drop-shadow-lg" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>

              {/* Barre de recherche */}
              <div className="px-2 sm:px-0">
                <ManuscriptSearchBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
              
              {/* Bouton Recherche Avancée */}
              <div className="mt-3 sm:mt-4 px-2 sm:px-0">
                <Button 
                  size="default" 
                  variant="secondary"
                  onClick={() => navigate('/manuscripts/search')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/30 text-white shadow-lg hover:shadow-xl transition-all w-full sm:w-auto text-sm sm:text-base"
                >
                  <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Recherche Avancée
                </Button>
              </div>
              
              <div className="w-32 sm:w-40 md:w-48 h-1 sm:h-2 bg-gradient-berber mx-auto rounded-full shadow-gold mt-4 sm:mt-6"></div>
            </div>
          </section>


          {/* Résultats */}
          <section className="mb-6">
            <h2 className="text-3xl font-moroccan font-bold text-foreground mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-gold" />
              Manuscrits Disponibles
            </h2>
            <p className="text-muted-foreground text-lg mb-4">
              {totalResults} manuscrit(s) trouvé(s)
            </p>
          </section>

          {/* Grille des manuscrits */}
          <ManuscriptGrid
            manuscripts={results as any}
            canAccessManuscript={canAccessManuscript}
            getManuscriptImage={getManuscriptImage}
            getStatusColor={getStatusColor as any}
            getAccessLevelColor={getAccessLevelColor as any}
            getStatusLabel={getStatusLabel}
            getAccessLabel={getAccessLabel}
          />

          {/* Pagination */}
          {totalResults > 0 && (
            <SearchPagination
              currentPage={page}
              totalResults={totalResults}
              perPage={perPage}
              onPageChange={(newPage) => {
                setPage(newPage);
                search(searchQuery, filters, newPage);
              }}
              onPerPageChange={(newPerPage) => {
                setPerPage(newPerPage);
                search(searchQuery, filters, 1);
              }}
            />
          )}


          {results.length === 0 && !searchLoading && (
            <div className="text-center py-16 relative">
              <div className="absolute inset-0 bg-pattern-zellige-complex opacity-10 rounded-3xl"></div>
              <div className="relative z-10">
                <BookOpen className="h-16 w-16 text-gold mx-auto mb-6 animate-pulse" />
                <h3 className="text-2xl font-moroccan font-bold text-foreground mb-3">
                  {searchQuery ? "Aucun manuscrit trouvé" : "Chargement des manuscrits..."}
                </h3>
                <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? "Essayez de modifier vos critères de recherche ou de filtrage."
                    : "Les manuscrits seront affichés dans un instant."
                  }
                </p>
              </div>
            </div>
          )}
        </main>
        
        <Footer />
        
        {/* Outils globaux (Accessibilité + Chatbot) */}
        <GlobalAccessibilityTools />
      </div>
    </WatermarkContainer>
  );
}
