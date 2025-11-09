import { Link } from "react-router-dom";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Sparkles, Filter, BookOpen, Calendar } from "lucide-react";
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
  const { toast } = useToast();

  useEffect(() => {
    loadPublications();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = publications.filter(pub =>
        pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPublications(filtered);
    } else {
      setFilteredPublications(publications);
    }
  }, [searchQuery, publications]);

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

              <div className="mt-6 flex gap-3 flex-wrap justify-center">
                <Button variant="outline" size="sm" className="rounded-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer par Genre
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer par Éditeur
                </Button>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer par Langue
                </Button>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
