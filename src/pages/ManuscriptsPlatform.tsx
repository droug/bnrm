import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Eye, Download, Calendar, User, MapPin, Lock, AlertCircle, Star, Sparkles, Filter, ChevronDown, X, Users, Building2, HelpCircle } from "lucide-react";
import emblemeMaroc from "@/assets/embleme-maroc.png";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WatermarkContainer } from "@/components/ui/watermark";
import { ProtectedWatermark } from "@/components/ui/protected-watermark";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PartnerCollectionForm } from "@/components/partner/PartnerCollectionForm";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ManuscriptGrid } from "@/components/manuscripts/ManuscriptGrid";
import { useManuscriptSearch, SearchFilters } from "@/hooks/useManuscriptSearch";
import { AdvancedSearchPanel } from "@/components/manuscripts/AdvancedSearchPanel";
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
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
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
    navigate(`/lecteur-manuscrit/${result.id}`);
  };

  const canAccessManuscript = (manuscript: Manuscript) => {
    if (manuscript.access_level === 'public') return true;
    
    if (manuscript.access_level === 'restricted') {
      return user && (
        profile?.role === 'subscriber' || 
        profile?.role === 'researcher' || 
        profile?.role === 'partner' ||
        profile?.role === 'librarian' ||
        profile?.role === 'admin'
      );
    }
    
    if (manuscript.access_level === 'confidential') {
      return profile?.role === 'admin' || profile?.role === 'librarian';
    }
    
    return false;
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
      <div className="min-h-screen bg-background relative">
        <ProtectedWatermark 
          userRole={profile?.role || "visitor"}
          isProtected={true}
        />
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="relative mb-12 py-20 px-8 rounded-3xl border-4 border-gold/40 overflow-hidden shadow-2xl">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${manuscriptBanner})` }}
            ></div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-royal/80"></div>
            <div className="absolute inset-0 bg-pattern-zellige-complex opacity-20"></div>
            <div className="absolute inset-0 bg-pattern-moroccan-stars opacity-15"></div>
            
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <img src={emblemeMaroc} alt="Emblème du Maroc" className="h-10 w-10 object-contain drop-shadow-lg" />
                <h1 className="text-5xl font-moroccan font-bold text-white drop-shadow-2xl">
                  Plateforme des Manuscrits Numérisés
                </h1>
                <img src={emblemeMaroc} alt="Emblème du Maroc" className="h-10 w-10 object-contain drop-shadow-lg" />
              </div>
              <p className="text-xl text-white/95 mb-6 max-w-3xl mx-auto drop-shadow-md font-elegant">
                Découvrez les trésors manuscrits de la BNRM et des institutions partenaires marocaines
              </p>
              
              {/* Boutons d'action */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/30 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Link to="/manuscripts/help">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Centre d'Aide
                  </Link>
                </Button>
                
                {user && (
                  <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/30 text-white shadow-lg hover:shadow-xl transition-all">
                        <Users className="h-5 w-5 mr-2" />
                        Devenir Partenaire
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Demande de Partenariat BNRM</DialogTitle>
                      </DialogHeader>
                      <PartnerCollectionForm onSuccess={() => setPartnerDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                )}
                {profile?.role === 'partner' && (
                  <Button size="lg" asChild className="bg-gold hover:bg-gold/90 text-white shadow-lg">
                    <Link to="/partner-dashboard">
                      <Building2 className="h-5 w-5 mr-2" />
                      Espace Partenaire
                    </Link>
                  </Button>
                )}
              </div>
              
              <div className="flex justify-center space-x-2 mb-6">
                {[...Array(7)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gold fill-gold animate-pulse drop-shadow-lg" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>

              {/* Barre de recherche */}
              <ManuscriptSearchBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              
              <div className="w-48 h-2 bg-gradient-berber mx-auto rounded-full shadow-gold mt-6"></div>
            </div>
          </section>

          {/* Filtres avancés - Version compacte */}
          <section className="mb-6">
            <div className="flex gap-3 items-center justify-between">
              <AdvancedSearchPanel
                filters={filters}
                setFilters={setFilters}
                onSearch={handleSearch}
                facets={facets}
              />
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


          {results.length === 0 && !searchLoading && searchQuery && (
            <div className="text-center py-16 relative">
              <div className="absolute inset-0 bg-pattern-zellige-complex opacity-10 rounded-3xl"></div>
              <div className="relative z-10">
                <BookOpen className="h-16 w-16 text-gold mx-auto mb-6 animate-pulse" />
                <h3 className="text-2xl font-moroccan font-bold text-foreground mb-3">Aucun manuscrit trouvé</h3>
                <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                  Essayez de modifier vos critères de recherche ou de filtrage.
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
