import { Link } from "react-router-dom";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Clock, BookOpen, Calendar, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import mosaicBanner from "@/assets/kitab-banner-mosaic-purple.jpg";

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

export default function KitabUpcoming() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const handleDetailsClick = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsDetailsOpen(true);
  };

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_deposit_requests')
        .select('*')
        .eq('kitab_status', 'approved')
        .eq('publication_status', 'upcoming')
        .order('publication_date', { ascending: true })
        .limit(50);

      if (error) throw error;
      setPublications(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les publications à paraître",
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
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--kitab-secondary))]/70 to-[hsl(var(--kitab-accent))]/70"></div>
        
        <div className="container mx-auto px-4 relative z-10 h-full flex items-start pt-16">
          <div className="w-full">
            <Link to="/kitab">
              <Button variant="ghost" className="text-white hover:text-white/80 mb-6">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour au Portail Kitab
              </Button>
            </Link>
            
            <div className="max-w-4xl mx-auto text-center">
              <Clock className="w-16 h-16 text-white mx-auto mb-6" />
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                À Paraître
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Découvrez les prochaines sorties de publications
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <p className="text-lg text-muted-foreground">
            {loading ? "Chargement..." : `${publications.length} publication(s) à paraître`}
          </p>
        </div>

        {loading ? (
          <Card className="border-0 shadow-[var(--shadow-kitab-strong)] max-w-3xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--kitab-primary))] mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Chargement des publications...</p>
            </CardContent>
          </Card>
        ) : publications.length === 0 ? (
          <Card className="border-0 shadow-[var(--shadow-kitab-strong)] max-w-3xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="bg-gradient-to-br from-[hsl(var(--kitab-primary))]/10 to-[hsl(var(--kitab-accent))]/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12 text-[hsl(var(--kitab-primary))]" />
              </div>
              
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Aucune Publication à Venir
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Aucune publication à venir n'est actuellement enregistrée.
                Revenez bientôt pour découvrir les prochaines parutions.
              </p>
              
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/kitab/new-publications">
                  <Button size="lg" className="bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary-dark))] text-white">
                    Voir les Nouvelles Parutions
                  </Button>
                </Link>
                <Link to="/kitab">
                  <Button size="lg" variant="outline">
                    Retour à l'Accueil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 max-w-6xl mx-auto">
            {publications.map((pub) => (
              <Card key={pub.id} className="border-0 shadow-[var(--shadow-kitab)] hover:shadow-[var(--shadow-kitab-strong)] transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0 w-32 h-40 bg-gradient-to-br from-[hsl(var(--kitab-secondary))]/10 to-[hsl(var(--kitab-accent))]/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-[hsl(var(--kitab-secondary))]/40" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl font-bold text-foreground">
                          {pub.title}
                        </h3>
                        {pub.publication_date && (
                          <Badge className="bg-[hsl(var(--kitab-accent))] text-white">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(pub.publication_date).toLocaleDateString('fr-FR', {
                              month: 'long',
                              year: 'numeric'
                            })}
                          </Badge>
                        )}
                      </div>
                      
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
                          <Badge variant="outline" className="bg-[hsl(var(--kitab-secondary))]/5">
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
                          <span>Date de parution prévue: {new Date(pub.publication_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}</span>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDetailsClick(pub)}
                          className="rounded-full border-[hsl(var(--kitab-secondary))]/30 hover:bg-[hsl(var(--kitab-secondary))]/10 hover:border-[hsl(var(--kitab-secondary))]"
                        >
                          <Info className="w-4 h-4 mr-2" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[hsl(var(--kitab-secondary))]">
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
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Date de parution prévue</p>
                    <p className="text-foreground">
                      {new Date(selectedPublication.publication_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
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
              
              <div className="flex items-center gap-2 p-4 bg-[hsl(var(--kitab-accent))]/10 rounded-lg">
                <Clock className="w-5 h-5 text-[hsl(var(--kitab-accent))]" />
                <p className="text-sm text-muted-foreground">
                  Cette publication sera disponible prochainement
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
