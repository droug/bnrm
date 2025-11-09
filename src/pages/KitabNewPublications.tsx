import { Link } from "react-router-dom";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Search, Sparkles, Filter, BookOpen, Calendar, Info, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import mosaicBanner from "@/assets/kitab-banner-mosaic-coral.jpeg";

interface Publication {
  id: string;
  title: string;
  subtitle?: string;
  author_name?: string;
  isbn?: string;
  publication_date?: string;
  support_type?: string;
  metadata?: any;
  language?: string;
  page_count?: number;
}

export default function KitabNewPublications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isVisualizeOpen, setIsVisualizeOpen] = useState(false);
  const [filterDiscipline, setFilterDiscipline] = useState("");
  const [filterEditor, setFilterEditor] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const { toast } = useToast();

  const handleDetailsClick = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsDetailsOpen(true);
  };

  const handleVisualizeClick = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsVisualizeOpen(true);
  };

  useEffect(() => {
    loadPublications();
  }, []);

  useEffect(() => {
    let filtered = publications;

    // Filtre par recherche
    if (searchQuery.trim()) {
      filtered = filtered.filter(pub =>
        pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par discipline
    if (filterDiscipline) {
      filtered = filtered.filter(pub =>
        pub.metadata?.discipline?.toLowerCase().includes(filterDiscipline.toLowerCase())
      );
    }

    // Filtre par éditeur
    if (filterEditor) {
      filtered = filtered.filter(pub =>
        pub.metadata?.publisher?.toLowerCase().includes(filterEditor.toLowerCase())
      );
    }

    // Filtre par langue
    if (filterLanguage) {
      filtered = filtered.filter(pub =>
        pub.language?.toLowerCase() === filterLanguage.toLowerCase()
      );
    }

    setFilteredPublications(filtered);
  }, [searchQuery, publications, filterDiscipline, filterEditor, filterLanguage]);

  const loadPublications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_deposit_requests')
        .select('*')
        .eq('kitab_status', 'approved')
        .eq('publication_status', 'published')
        .order('publication_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPublications(data || []);
      setFilteredPublications(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les publications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <KitabHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden h-[400px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={mosaicBanner} 
            alt="Mosaïque Marocaine" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--kitab-accent))]/70 to-[hsl(var(--kitab-primary))]/70"></div>
        
        <div className="container mx-auto px-4 relative z-10 h-full flex items-start pt-16">
          <div className="w-full">
            <Link to="/kitab">
              <Button variant="ghost" className="text-white hover:text-white/80 mb-6">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour au Portail Kitab
              </Button>
            </Link>
            
            <div className="max-w-4xl mx-auto text-center">
              <Sparkles className="w-16 h-16 text-white mx-auto mb-6" />
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Nouvelles Parutions
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Découvrez les références des dernières publications nationales
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Search Section */}
        <section className="mb-12">
          <Card className="border-0 shadow-[var(--shadow-kitab-strong)] max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Rechercher dans les Nouvelles Parutions
              </h2>
              
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Titre, auteur, éditeur, ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 text-lg pl-6 pr-14 rounded-full border-2 border-[hsl(var(--kitab-primary))]/30 focus:border-[hsl(var(--kitab-primary))]"
                />
                
                <div className="absolute right-2 top-2 h-10 w-10 flex items-center justify-center">
                  <Search className="h-5 w-5 text-[hsl(var(--kitab-primary))]" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Discipline
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Sciences, Littérature..."
                    value={filterDiscipline}
                    onChange={(e) => setFilterDiscipline(e.target.value)}
                    className="rounded-full border-[hsl(var(--kitab-primary))]/30 focus:border-[hsl(var(--kitab-primary))]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Éditeur
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Dar Al Kitab..."
                    value={filterEditor}
                    onChange={(e) => setFilterEditor(e.target.value)}
                    className="rounded-full border-[hsl(var(--kitab-primary))]/30 focus:border-[hsl(var(--kitab-primary))]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Langue
                  </label>
                  <Input
                    type="text"
                    placeholder="Ex: Français, Arabe..."
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="rounded-full border-[hsl(var(--kitab-primary))]/30 focus:border-[hsl(var(--kitab-primary))]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Results Section */}
        <section>
          <div className="mb-6 text-center">
            <p className="text-lg text-muted-foreground">
              {loading ? "Chargement..." : `${filteredPublications.length} publication(s) trouvée(s)`}
            </p>
          </div>

          {loading ? (
            <Card className="border-0 shadow-[var(--shadow-kitab)] max-w-4xl mx-auto">
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--kitab-primary))] mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Chargement des publications...</p>
              </CardContent>
            </Card>
          ) : filteredPublications.length === 0 ? (
            <Card className="border-0 shadow-[var(--shadow-kitab)] max-w-4xl mx-auto">
              <CardContent className="p-12 text-center">
                <div className="bg-gradient-to-br from-[hsl(var(--kitab-accent))]/10 to-[hsl(var(--kitab-primary))]/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-12 h-12 text-[hsl(var(--kitab-accent))]" />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Aucune publication trouvée
                </h3>
                
                <p className="text-lg text-muted-foreground mb-8">
                  {searchQuery ? "Essayez avec d'autres termes de recherche" : "Les nouvelles parutions seront bientôt disponibles"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 max-w-6xl mx-auto">
              {filteredPublications.map((pub) => (
                <Card key={pub.id} className="border-0 shadow-[var(--shadow-kitab)] hover:shadow-[var(--shadow-kitab-strong)] transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-32 h-40 bg-gradient-to-br from-[hsl(var(--kitab-primary))]/10 to-[hsl(var(--kitab-accent))]/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-[hsl(var(--kitab-primary))]/40" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                          {pub.title}
                        </h3>
                        {pub.subtitle && (
                          <p className="text-lg text-muted-foreground italic mb-3">
                            {pub.subtitle}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-3 mb-4">
                          {pub.author_name && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-muted-foreground">Auteur:</span>
                              <span className="text-sm text-foreground">{pub.author_name}</span>
                            </div>
                          )}
                          {pub.metadata?.publisher && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-muted-foreground">Éditeur:</span>
                              <span className="text-sm text-foreground">{pub.metadata.publisher}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {pub.isbn && (
                            <Badge variant="outline" className="bg-[hsl(var(--kitab-primary))]/5">
                              ISBN: {pub.isbn}
                            </Badge>
                          )}
                          {pub.support_type && (
                            <Badge variant="outline">{pub.support_type}</Badge>
                          )}
                          {pub.language && (
                            <Badge variant="outline">{pub.language}</Badge>
                          )}
                          {pub.page_count && (
                            <Badge variant="outline">{pub.page_count} pages</Badge>
                          )}
                        </div>
                        
                        {pub.publication_date && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Publié le {new Date(pub.publication_date).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                        
                        <div className="flex gap-3 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDetailsClick(pub)}
                            className="rounded-full border-[hsl(var(--kitab-primary))]/30 hover:bg-[hsl(var(--kitab-primary))]/10 hover:border-[hsl(var(--kitab-primary))]"
                          >
                            <Info className="w-4 h-4 mr-2" />
                            Détails
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVisualizeClick(pub)}
                            className="rounded-full border-[hsl(var(--kitab-accent))]/30 hover:bg-[hsl(var(--kitab-accent))]/10 hover:border-[hsl(var(--kitab-accent))]"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Visualiser
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      
      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[hsl(var(--kitab-primary))]">
              Détails de la Publication
            </DialogTitle>
          </DialogHeader>
          {selectedPublication && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {selectedPublication.title}
                </h3>
                {selectedPublication.subtitle && (
                  <p className="text-lg text-muted-foreground italic">
                    {selectedPublication.subtitle}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {selectedPublication.author_name && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Auteur</p>
                    <p className="text-foreground">{selectedPublication.author_name}</p>
                  </div>
                )}
                {selectedPublication.metadata?.publisher && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Éditeur</p>
                    <p className="text-foreground">{selectedPublication.metadata.publisher}</p>
                  </div>
                )}
                {selectedPublication.isbn && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">ISBN</p>
                    <p className="text-foreground">{selectedPublication.isbn}</p>
                  </div>
                )}
                {selectedPublication.support_type && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Type de support</p>
                    <p className="text-foreground">{selectedPublication.support_type}</p>
                  </div>
                )}
                {selectedPublication.language && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Langue</p>
                    <p className="text-foreground">{selectedPublication.language}</p>
                  </div>
                )}
                {selectedPublication.page_count && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Nombre de pages</p>
                    <p className="text-foreground">{selectedPublication.page_count}</p>
                  </div>
                )}
                {selectedPublication.publication_date && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Date de publication</p>
                    <p className="text-foreground">
                      {new Date(selectedPublication.publication_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedPublication.metadata && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Informations complémentaires</p>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    {selectedPublication.metadata.description && (
                      <p className="text-sm text-foreground">{selectedPublication.metadata.description}</p>
                    )}
                    {selectedPublication.metadata.subject && (
                      <p className="text-sm"><span className="font-semibold">Sujet:</span> {selectedPublication.metadata.subject}</p>
                    )}
                    {selectedPublication.metadata.collection && (
                      <p className="text-sm"><span className="font-semibold">Collection:</span> {selectedPublication.metadata.collection}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Visualize Dialog */}
      <Dialog open={isVisualizeOpen} onOpenChange={setIsVisualizeOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[hsl(var(--kitab-accent))]">
              Visualisation de la Publication
            </DialogTitle>
          </DialogHeader>
          {selectedPublication && (
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-48 h-64 bg-gradient-to-br from-[hsl(var(--kitab-primary))]/10 to-[hsl(var(--kitab-accent))]/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-[hsl(var(--kitab-primary))]/40" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {selectedPublication.title}
                  </h3>
                  {selectedPublication.subtitle && (
                    <p className="text-lg text-muted-foreground italic mb-3">
                      {selectedPublication.subtitle}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    {selectedPublication.author_name && (
                      <p className="text-sm"><span className="font-semibold">Auteur:</span> {selectedPublication.author_name}</p>
                    )}
                    {selectedPublication.metadata?.publisher && (
                      <p className="text-sm"><span className="font-semibold">Éditeur:</span> {selectedPublication.metadata.publisher}</p>
                    )}
                    {selectedPublication.isbn && (
                      <p className="text-sm"><span className="font-semibold">ISBN:</span> {selectedPublication.isbn}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedPublication.support_type && (
                      <Badge variant="outline">{selectedPublication.support_type}</Badge>
                    )}
                    {selectedPublication.language && (
                      <Badge variant="outline">{selectedPublication.language}</Badge>
                    )}
                    {selectedPublication.page_count && (
                      <Badge variant="outline">{selectedPublication.page_count} pages</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <p className="text-muted-foreground">
                  La prévisualisation complète de cette publication sera bientôt disponible
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
