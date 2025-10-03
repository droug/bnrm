import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Eye, Download, Calendar, User, MapPin, Lock, AlertCircle, Star, Sparkles, Crown, Filter, ChevronDown, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WatermarkContainer } from "@/components/ui/watermark";
import { ProtectedWatermark } from "@/components/ui/protected-watermark";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import manuscriptHero from "@/assets/manuscript-page-1.jpg";
import moroccanPatternBg from "@/assets/moroccan-pattern-bg.jpg";
import zelligePattern1 from "@/assets/zellige-pattern-1.jpg";
import zelligePattern2 from "@/assets/zellige-pattern-2.jpg";
import zelligePattern3 from "@/assets/zellige-pattern-3.jpg";

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
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [filteredManuscripts, setFilteredManuscripts] = useState<Manuscript[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterInstitution, setFilterInstitution] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchManuscripts();
  }, []);

  useEffect(() => {
    filterManuscripts();
  }, [manuscripts, searchQuery, filterLanguage, filterPeriod, filterStatus, filterInstitution]);

  const fetchManuscripts = async () => {
    try {
      const { data, error } = await supabase
        .from('manuscripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setManuscripts(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les manuscrits",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterManuscripts = () => {
    let filtered = manuscripts;

    // Filtre basé sur le niveau d'accès et le rôle de l'utilisateur
    filtered = filtered.filter(manuscript => {
      // Public: accessible à tous
      if (manuscript.access_level === 'public') return true;
      
      // Restreint: seulement pour les utilisateurs authentifiés avec rôle approprié
      if (manuscript.access_level === 'restricted') {
        return user && (
          profile?.role === 'subscriber' || 
          profile?.role === 'researcher' || 
          profile?.role === 'partner' ||
          profile?.role === 'librarian' ||
          profile?.role === 'admin'
        );
      }
      
      // Confidentiel: seulement pour admin et librarian
      if (manuscript.access_level === 'confidential') {
        return profile?.role === 'admin' || profile?.role === 'librarian';
      }
      
      return false;
    });

    if (searchQuery) {
      filtered = filtered.filter(manuscript =>
        manuscript.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manuscript.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        manuscript.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterLanguage !== "all") {
      filtered = filtered.filter(manuscript => manuscript.language === filterLanguage);
    }

    if (filterPeriod !== "all") {
      filtered = filtered.filter(manuscript => manuscript.period === filterPeriod);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(manuscript => manuscript.status === filterStatus);
    }

    if (filterInstitution !== "all") {
      filtered = filtered.filter(manuscript => manuscript.institution === filterInstitution);
    }

    setFilteredManuscripts(filtered);
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

  if (loading || isLoading) {
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
              style={{ backgroundImage: `url(${manuscriptHero})` }}
            ></div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-royal/90 via-primary/85 to-accent/90"></div>
            <div className="absolute inset-0 bg-pattern-zellige-complex opacity-20"></div>
            <div className="absolute inset-0 bg-pattern-moroccan-stars opacity-15"></div>
            
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Crown className="h-10 w-10 text-gold animate-pulse drop-shadow-lg" />
                <h1 className="text-5xl font-moroccan font-bold text-white drop-shadow-2xl">
                  Plateforme des Manuscrits Numérisés
                </h1>
                <Crown className="h-10 w-10 text-gold animate-pulse drop-shadow-lg" />
              </div>
              <p className="text-xl text-white/95 mb-6 max-w-3xl mx-auto drop-shadow-md font-elegant">
                Découvrez les trésors manuscrits de la BNRM et des institutions partenaires marocaines
              </p>
              
              <div className="flex justify-center space-x-2 mb-6">
                {[...Array(7)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gold fill-gold animate-pulse drop-shadow-lg" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              
              {/* Indicateur de niveau d'accès */}
              <div className="max-w-2xl mx-auto mb-8">
                <Alert className="border-white/30 bg-white/10 backdrop-blur-md">
                  <AlertCircle className="h-4 w-4 text-white" />
                  <AlertTitle className="text-white font-semibold">Votre niveau d'accès</AlertTitle>
                  <AlertDescription className="text-white/95">
                    {getUserAccessLevel()}
                    {!user && (
                      <span className="ml-2">
                        - <Link to="/auth" className="underline text-gold hover:text-gold/80">Connectez-vous</Link> pour accéder à plus de contenu
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              </div>

              {/* Barre de recherche */}
              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Rechercher par titre, auteur ou description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-16 text-lg bg-white/98 shadow-lg border-3 border-gold/30 focus:border-white pl-6 pr-28 rounded-full"
                  />
                  
                  {searchQuery && (
                    <Button
                      onClick={() => setSearchQuery("")}
                      variant="ghost"
                      size="sm"
                      className="absolute right-16 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-destructive/10 rounded-full"
                    >
                      <X className="h-5 w-5 text-destructive" />
                    </Button>
                  )}
                  
                  <Button 
                    size="lg" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-md bg-gradient-neutral"
                  >
                    <Search className="h-6 w-6" />
                  </Button>
                </div>
                <p className="text-white/90 text-sm text-center font-medium mt-4">
                  💡 Utilisez les filtres ci-dessous pour affiner votre recherche
                </p>
              </div>
              
              <div className="w-48 h-2 bg-gradient-berber mx-auto rounded-full shadow-gold mt-6"></div>
            </div>
          </section>

          {/* Filtres */}
          <section className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 flex-wrap">
              <Select value={filterInstitution} onValueChange={setFilterInstitution}>
                <SelectTrigger className="w-full md:w-56 h-12 border-2 border-gold/20">
                  <SelectValue placeholder="Institution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les institutions</SelectItem>
                  <SelectItem value="BNRM">BNRM</SelectItem>
                  <SelectItem value="Bibliothèque Al Quaraouiyine">Al Quaraouiyine</SelectItem>
                  <SelectItem value="Archives Royales">Archives Royales</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger className="w-full md:w-48 h-12 border-2 border-gold/20">
                  <SelectValue placeholder="Langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les langues</SelectItem>
                  <SelectItem value="arabe">Arabe</SelectItem>
                  <SelectItem value="français">Français</SelectItem>
                  <SelectItem value="berbère">Berbère</SelectItem>
                  <SelectItem value="latin">Latin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-full md:w-48 h-12 border-2 border-gold/20">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  <SelectItem value="médiéval">Médiéval</SelectItem>
                  <SelectItem value="moderne">Moderne</SelectItem>
                  <SelectItem value="contemporain">Contemporain</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48 h-12 border-2 border-gold/20">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="digitization">Numérisation</SelectItem>
                  <SelectItem value="reserved">Réservé</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Résultats */}
          <section className="mb-6">
            <h2 className="text-3xl font-moroccan font-bold text-foreground mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-gold" />
              Manuscrits Disponibles
            </h2>
            <p className="text-muted-foreground text-lg mb-4">
              {filteredManuscripts.length} manuscrit(s) accessible(s) trouvé(s)
            </p>
          </section>

          {/* Grille des manuscrits */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {filteredManuscripts.map((manuscript) => (
              <Card 
                key={manuscript.id} 
                className={`overflow-hidden hover:shadow-moroccan transition-all duration-500 bg-card/50 backdrop-blur border-2 border-gold/20 hover:border-gold/40 group relative ${
                  !canAccessManuscript(manuscript) ? 'opacity-60' : ''
                }`}
              >
                {/* Zellige pattern background for the card */}
                <div 
                  className="absolute inset-0 opacity-8 group-hover:opacity-12 transition-opacity bg-cover bg-center pointer-events-none"
                  style={{ 
                    backgroundImage: `url(${
                      manuscript.language === 'Arabe' ? zelligePattern1 :
                      manuscript.language === 'Berbère' ? zelligePattern3 :
                      zelligePattern2
                    })` 
                  }}
                ></div>
                {manuscript.thumbnail_url && (
                  <div className="aspect-video overflow-hidden relative bg-gradient-mosaique">
                    <img
                      src={manuscript.thumbnail_url}
                      alt={manuscript.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {!canAccessManuscript(manuscript) && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <Lock className="h-12 w-12 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg leading-tight">{manuscript.title}</CardTitle>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant={getStatusColor(manuscript.status)} className="text-xs">
                        {getStatusLabel(manuscript.status)}
                      </Badge>
                      <Badge variant={getAccessLevelColor(manuscript.access_level)} className="text-xs">
                        {getAccessLabel(manuscript.access_level)}
                      </Badge>
                    </div>
                  </div>
                  
                  {manuscript.author && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      {manuscript.author}
                    </div>
                  )}

                  {manuscript.institution && (
                    <div className="flex items-center gap-2 text-xs text-primary font-medium">
                      <MapPin className="h-3 w-3" />
                      {manuscript.institution}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {manuscript.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {manuscript.description}
                    </p>
                  )}

                  <div className="space-y-2 text-xs text-muted-foreground">
                    {manuscript.language && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        Langue: {manuscript.language}
                      </div>
                    )}
                    
                    {manuscript.period && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Période: {manuscript.period}
                      </div>
                    )}
                    
                    {manuscript.inventory_number && (
                      <div>N° inventaire: {manuscript.inventory_number}</div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {canAccessManuscript(manuscript) ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          Consulter
                        </Button>
                        
                        {manuscript.digital_copy_url && (
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1" disabled>
                        <Lock className="h-3 w-3 mr-1" />
                        Accès restreint
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredManuscripts.length === 0 && !isLoading && (
            <div className="text-center py-16 relative">
              <div className="absolute inset-0 bg-pattern-zellige-complex opacity-10 rounded-3xl"></div>
              <div className="relative z-10">
                <BookOpen className="h-16 w-16 text-gold mx-auto mb-6 animate-pulse" />
                <h3 className="text-2xl font-moroccan font-bold text-foreground mb-3">Aucun manuscrit accessible trouvé</h3>
                <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                  {!user 
                    ? "Connectez-vous pour accéder à plus de manuscrits précieux"
                    : "Essayez de modifier vos critères de recherche ou de filtrage."
                  }
                </p>
                {!user && (
                  <Link to="/auth">
                    <Button className="bg-gradient-neutral shadow-gold hover:shadow-moroccan transition-all duration-300">
                      <Lock className="h-4 w-4 mr-2" />
                      Se connecter
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </WatermarkContainer>
  );
}
