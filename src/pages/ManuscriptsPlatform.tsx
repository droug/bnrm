import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Eye, Download, Calendar, User, MapPin, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { WatermarkContainer } from "@/components/ui/watermark";
import { ProtectedWatermark } from "@/components/ui/protected-watermark";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";

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
      <div className="min-h-screen bg-gradient-subtle relative">
        <ProtectedWatermark 
          userRole={profile?.role || "visitor"}
          isProtected={true}
        />
        <Header />
        
        <main className="container py-8">
          {/* En-tête de la plateforme */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3 mb-3">
              <BookOpen className="h-10 w-10 text-primary" />
              Plateforme des Manuscrits Numérisés
            </h1>
            <p className="text-muted-foreground text-lg mb-4">
              Consultez les manuscrits de la BNRM et des institutions partenaires marocaines
            </p>
            
            {/* Indicateur de niveau d'accès */}
            <Alert className="mb-6 border-primary/30 bg-primary/5">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Votre niveau d'accès</AlertTitle>
              <AlertDescription>
                {getUserAccessLevel()}
                {!user && (
                  <span className="ml-2">
                    - <Link to="/auth" className="underline text-primary">Connectez-vous</Link> pour accéder à plus de contenu
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </div>

          {/* Filtres et recherche */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher par titre, auteur ou description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterInstitution} onValueChange={setFilterInstitution}>
                <SelectTrigger className="w-full md:w-56">
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
                <SelectTrigger className="w-full md:w-48">
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
                <SelectTrigger className="w-full md:w-48">
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
                <SelectTrigger className="w-full md:w-48">
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
          </div>

          {/* Résultats */}
          <div className="mb-4">
            <p className="text-muted-foreground">
              {filteredManuscripts.length} manuscrit(s) accessible(s) trouvé(s)
            </p>
          </div>

          {/* Grille des manuscrits */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredManuscripts.map((manuscript) => (
              <Card 
                key={manuscript.id} 
                className={`overflow-hidden hover:shadow-moroccan transition-all duration-300 bg-card/50 backdrop-blur ${
                  !canAccessManuscript(manuscript) ? 'opacity-60' : ''
                }`}
              >
                {manuscript.thumbnail_url && (
                  <div className="aspect-video overflow-hidden relative">
                    <img
                      src={manuscript.thumbnail_url}
                      alt={manuscript.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {!canAccessManuscript(manuscript) && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Lock className="h-12 w-12 text-white" />
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
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun manuscrit accessible trouvé</h3>
              <p className="text-muted-foreground">
                {!user 
                  ? "Connectez-vous pour accéder à plus de manuscrits"
                  : "Essayez de modifier vos critères de recherche ou de filtrage."
                }
              </p>
              {!user && (
                <Link to="/auth">
                  <Button className="mt-4">Se connecter</Button>
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </WatermarkContainer>
  );
}
