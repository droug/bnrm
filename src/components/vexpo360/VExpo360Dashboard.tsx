import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Image, Palette, Users, Clock, CheckCircle, AlertCircle, Archive } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ExhibitionStats {
  total: number;
  draft: number;
  in_review: number;
  published: number;
  archived: number;
  total_visitors: number;
}

export default function VExpo360Dashboard() {
  // Fetch exhibitions stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['vexpo360-stats'],
    queryFn: async (): Promise<ExhibitionStats> => {
      const { data, error } = await supabase
        .from('vexpo_exhibitions')
        .select('status, visitor_count');
      
      if (error) throw error;
      
      const exhibitions = data || [];
      return {
        total: exhibitions.length,
        draft: exhibitions.filter(e => e.status === 'draft').length,
        in_review: exhibitions.filter(e => e.status === 'in_review').length,
        published: exhibitions.filter(e => e.status === 'published').length,
        archived: exhibitions.filter(e => e.status === 'archived').length,
        total_visitors: exhibitions.reduce((sum, e) => sum + (e.visitor_count || 0), 0)
      };
    }
  });

  // Fetch recent exhibitions
  const { data: recentExhibitions } = useQuery({
    queryKey: ['vexpo360-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vexpo_exhibitions')
        .select('id, title_fr, status, created_at, visitor_count')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch artworks count
  const { data: artworksCount } = useQuery({
    queryKey: ['vexpo360-artworks-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('vexpo_artworks')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch panoramas count
  const { data: panoramasCount } = useQuery({
    queryKey: ['vexpo360-panoramas-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('vexpo_panoramas')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      case 'in_review':
        return <Badge variant="default" className="bg-amber-500">En révision</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-green-500">Publié</Badge>;
      case 'archived':
        return <Badge variant="outline">Archivé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expositions</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.published || 0} publiées, {stats?.draft || 0} brouillons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visiteurs Totaux</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_visitors?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sur toutes les expositions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Œuvres/Notices</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{artworksCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles pour les hotspots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panoramas 360°</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{panoramasCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Images équirectangulaires
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold">{stats?.draft || 0}</p>
              <p className="text-sm text-muted-foreground">Brouillons</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{stats?.in_review || 0}</p>
              <p className="text-sm text-muted-foreground">En révision</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats?.published || 0}</p>
              <p className="text-sm text-muted-foreground">Publiées</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-300">
          <CardContent className="p-4 flex items-center gap-3">
            <Archive className="h-8 w-8 text-slate-400" />
            <div>
              <p className="text-2xl font-bold">{stats?.archived || 0}</p>
              <p className="text-sm text-muted-foreground">Archivées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Exhibitions */}
      <Card>
        <CardHeader>
          <CardTitle>Expositions Récentes</CardTitle>
          <CardDescription>Les 5 dernières expositions créées</CardDescription>
        </CardHeader>
        <CardContent>
          {recentExhibitions && recentExhibitions.length > 0 ? (
            <div className="space-y-4">
              {recentExhibitions.map((exhibition) => (
                <div key={exhibition.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {exhibition.title_fr?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{exhibition.title_fr}</p>
                      <p className="text-sm text-muted-foreground">
                        Créée le {format(new Date(exhibition.created_at), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{exhibition.visitor_count || 0}</p>
                      <p className="text-xs text-muted-foreground">visiteurs</p>
                    </div>
                    {getStatusBadge(exhibition.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune exposition créée</p>
              <p className="text-sm">Créez votre première exposition 360° !</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
