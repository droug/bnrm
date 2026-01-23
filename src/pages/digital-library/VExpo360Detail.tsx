import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { VExpo360Viewer } from "@/components/vexpo360/VExpo360Viewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Play, 
  Calendar, 
  MapPin, 
  Clock, 
  Share2, 
  Maximize2,
  Image as ImageIcon,
  Layers
} from "lucide-react";

export default function VExpo360Detail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [language, setLanguage] = useState<'fr' | 'ar'>('fr');

  // Fetch exhibition by slug
  const { data: exhibition, isLoading: exhibitionLoading } = useQuery({
    queryKey: ['vexpo360-public-exhibition', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vexpo_exhibitions')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  // Fetch panoramas for this exhibition
  const { data: panoramas } = useQuery({
    queryKey: ['vexpo360-public-panoramas', exhibition?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vexpo_panoramas')
        .select('*')
        .eq('exhibition_id', exhibition?.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!exhibition?.id
  });

  // Fetch all hotspots for all panoramas
  const { data: allHotspots } = useQuery({
    queryKey: ['vexpo360-public-hotspots', panoramas?.map(p => p.id)],
    queryFn: async () => {
      if (!panoramas || panoramas.length === 0) return {};
      
      const panoramaIds = panoramas.map(p => p.id);
      const { data, error } = await supabase
        .from('vexpo_hotspots')
        .select('*')
        .in('panorama_id', panoramaIds);
      if (error) throw error;
      
      // Group by panorama_id
      const grouped: Record<string, any[]> = {};
      data?.forEach(hotspot => {
        if (!grouped[hotspot.panorama_id]) {
          grouped[hotspot.panorama_id] = [];
        }
        grouped[hotspot.panorama_id].push(hotspot);
      });
      return grouped;
    },
    enabled: !!panoramas && panoramas.length > 0
  });

  // Fetch artworks linked to hotspots
  const { data: artworksMap } = useQuery({
    queryKey: ['vexpo360-public-artworks', allHotspots],
    queryFn: async () => {
      if (!allHotspots) return {};
      
      const artworkIds = Object.values(allHotspots)
        .flat()
        .filter(h => h.artwork_id)
        .map(h => h.artwork_id);
      
      if (artworkIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('vexpo_artworks')
        .select('*')
        .in('id', artworkIds);
      if (error) throw error;
      
      const map: Record<string, any> = {};
      data?.forEach(artwork => {
        map[artwork.id] = artwork;
      });
      return map;
    },
    enabled: !!allHotspots && Object.keys(allHotspots).length > 0
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (exhibitionLoading) {
    return (
      <DigitalLibraryLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DigitalLibraryLayout>
    );
  }

  if (!exhibition) {
    return (
      <DigitalLibraryLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Exposition non trouvée</h1>
          <p className="text-muted-foreground mb-6">
            Cette exposition n'existe pas ou n'est pas encore publiée.
          </p>
          <Button onClick={() => navigate('/digital-library/exposition-virtuelle')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux expositions
          </Button>
        </div>
      </DigitalLibraryLayout>
    );
  }

  // If viewer is open, show fullscreen viewer
  if (isViewerOpen && panoramas && panoramas.length > 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black h-screen w-screen overflow-hidden">
        <VExpo360Viewer
          panoramas={panoramas}
          hotspots={allHotspots || {}}
          artworks={artworksMap || {}}
          onClose={() => setIsViewerOpen(false)}
          language={language}
          externalFullscreen={true}
        />
      </div>
    );
  }

  return (
    <DigitalLibraryLayout>
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {exhibition.cover_image_url ? (
            <img 
              src={exhibition.cover_image_url} 
              alt={exhibition.title_fr}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        </div>

        <div className="container mx-auto px-4 pb-12 relative z-10">
          <Button 
            variant="ghost" 
            className="mb-6 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => navigate('/digital-library/exposition-virtuelle')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux expositions
          </Button>

          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white border-none">
              <Layers className="h-3 w-3 mr-1" />
              Exposition virtuelle 360°
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === 'ar' ? exhibition.title_ar : exhibition.title_fr}
            </h1>
            
            {exhibition.teaser_fr && (
              <p className="text-lg text-white/80 mb-6">
                {language === 'ar' ? exhibition.teaser_ar : exhibition.teaser_fr}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm mb-8">
              {exhibition.start_date && exhibition.end_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(exhibition.start_date)} - {formatDate(exhibition.end_date)}</span>
                </div>
              )}
              {panoramas && (
                <div className="flex items-center gap-1">
                  <ImageIcon className="h-4 w-4" />
                  <span>{panoramas.length} panorama{panoramas.length > 1 ? 's' : ''}</span>
                </div>
              )}
              {exhibition.location_text_fr && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{language === 'ar' ? exhibition.location_text_ar : exhibition.location_text_fr}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                onClick={() => setIsViewerOpen(true)}
                disabled={!panoramas || panoramas.length === 0}
              >
                <Play className="h-5 w-5 mr-2" />
                {language === 'ar' ? exhibition.primary_button_label_ar : exhibition.primary_button_label_fr || 'Commencer la visite'}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/50 text-white hover:bg-white/20 bg-white/10"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Introduction */}
              {exhibition.intro_fr && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">À propos de l'exposition</h2>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p>{language === 'ar' ? exhibition.intro_ar : exhibition.intro_fr}</p>
                  </div>
                </div>
              )}

              {/* Panorama Preview */}
              {panoramas && panoramas.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Aperçu de la visite</h2>
                  <div className="rounded-xl overflow-hidden border">
                    <VExpo360Viewer
                      panoramas={panoramas}
                      hotspots={allHotspots || {}}
                      artworks={artworksMap || {}}
                      language={language}
                    />
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => setIsViewerOpen(true)}>
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Ouvrir en plein écran
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Practical Info Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Informations pratiques</h3>
                  <Separator />
                  
                  {exhibition.opening_hours_fr && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Horaires</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? exhibition.opening_hours_ar : exhibition.opening_hours_fr}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {exhibition.location_text_fr && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Lieu</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? exhibition.location_text_ar : exhibition.location_text_fr}
                        </p>
                        {exhibition.map_link && (
                          <a 
                            href={exhibition.map_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Voir sur la carte
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {exhibition.start_date && exhibition.end_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Dates</p>
                        <p className="text-sm text-muted-foreground">
                          Du {formatDate(exhibition.start_date)}
                          <br />
                          au {formatDate(exhibition.end_date)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Language Toggle */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Langue</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant={language === 'fr' ? 'default' : 'outline'}
                      onClick={() => setLanguage('fr')}
                      className="flex-1"
                    >
                      Français
                    </Button>
                    <Button 
                      variant={language === 'ar' ? 'default' : 'outline'}
                      onClick={() => setLanguage('ar')}
                      className="flex-1"
                    >
                      العربية
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Card */}
              {exhibition.cta_title_fr && (
                <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-lg mb-2">
                      {language === 'ar' ? exhibition.cta_title_ar : exhibition.cta_title_fr}
                    </h3>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => setIsViewerOpen(true)}
                      disabled={!panoramas || panoramas.length === 0}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Lancer la visite
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </DigitalLibraryLayout>
  );
}
