import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Play, 
  Calendar, 
  Image as ImageIcon,
  Layers,
  ArrowRight
} from "lucide-react";

interface VExpoExhibition {
  id: string;
  title_fr: string;
  title_ar: string | null;
  teaser_fr: string | null;
  teaser_ar: string | null;
  cover_image_url: string | null;
  slug: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export function VExpoPublicList() {
  // Fetch published exhibitions
  const { data: exhibitions, isLoading } = useQuery({
    queryKey: ['vexpo360-public-exhibitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vexpo_exhibitions')
        .select('id, title_fr, title_ar, teaser_fr, teaser_ar, cover_image_url, slug, start_date, end_date, status')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as VExpoExhibition[];
    },
    staleTime: 0,
    refetchOnMount: 'always'
  });

  // Fetch panorama counts for each exhibition
  const { data: panoramaCounts } = useQuery({
    queryKey: ['vexpo360-panorama-counts', exhibitions?.map(e => e.id)],
    queryFn: async () => {
      if (!exhibitions || exhibitions.length === 0) return {};
      
      const counts: Record<string, number> = {};
      
      for (const exhibition of exhibitions) {
        const { count, error } = await supabase
          .from('vexpo_panoramas')
          .select('*', { count: 'exact', head: true })
          .eq('exhibition_id', exhibition.id)
          .eq('is_active', true);
        
        if (!error) {
          counts[exhibition.id] = count || 0;
        }
      }
      
      return counts;
    },
    enabled: !!exhibitions && exhibitions.length > 0,
    staleTime: 0,
    refetchOnMount: 'always'
  });

  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    const isOngoing = start <= now && end >= now;
    const isPast = end < now;
    const isFuture = start > now;
    
    const formatDate = (date: Date) => 
      date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    
    return {
      text: `${formatDate(start)} - ${formatDate(end)}`,
      status: isOngoing ? 'ongoing' : isPast ? 'past' : 'future'
    };
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-[16/10] w-full" />
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!exhibitions || exhibitions.length === 0) {
    return (
      <div className="text-center py-12">
        <Layers className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Aucune exposition disponible</h3>
        <p className="text-muted-foreground">
          De nouvelles expositions virtuelles 360° seront bientôt disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-indigo-500">
          <Layers className="h-3 w-3 mr-1" />
          Expositions 360°
        </Badge>
        <h2 className="text-3xl font-bold mb-2">Expositions Virtuelles</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explorez nos expositions virtuelles immersives en 360° avec des points d'intérêt interactifs
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exhibitions.map((exhibition) => {
          const dateInfo = formatDateRange(exhibition.start_date, exhibition.end_date);
          const panoramaCount = panoramaCounts?.[exhibition.id] || 0;
          
          return (
            <Link 
              key={exhibition.id} 
              to={`/digital-library/exposition-virtuelle/${exhibition.slug}`}
              className="group"
            >
              <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 border-2 border-transparent hover:border-purple-500/20">
                {/* Cover Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900">
                  {exhibition.cover_image_url ? (
                    <img 
                      src={exhibition.cover_image_url} 
                      alt={exhibition.title_fr}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Layers className="h-16 w-16 text-white/30" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  {dateInfo && (
                    <Badge 
                      className={`absolute top-3 right-3 ${
                        dateInfo.status === 'ongoing' 
                          ? 'bg-green-500' 
                          : dateInfo.status === 'past'
                            ? 'bg-gray-500'
                            : 'bg-amber-500'
                      }`}
                    >
                      {dateInfo.status === 'ongoing' ? 'En cours' : dateInfo.status === 'past' ? 'Terminée' : 'À venir'}
                    </Badge>
                  )}
                  
                  {/* Panorama Count */}
                  {panoramaCount > 0 && (
                    <Badge className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      {panoramaCount} panorama{panoramaCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                {/* Content */}
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {exhibition.title_fr}
                  </h3>
                  
                  {exhibition.teaser_fr && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {exhibition.teaser_fr}
                    </p>
                  )}
                  
                  {dateInfo && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <Calendar className="h-3 w-3" />
                      <span>{dateInfo.text}</span>
                    </div>
                  )}
                  
                  <Button variant="ghost" size="sm" className="w-full group-hover:bg-purple-500/10 group-hover:text-purple-600">
                    Visiter l'exposition
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
