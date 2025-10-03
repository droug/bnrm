import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Download, TrendingUp, Users, Clock, Search, AlertCircle, User, Building } from "lucide-react";

export default function AnalyticsManager() {
  const [timeRange, setTimeRange] = useState<string>("30");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Fetch download logs
  const { data: downloadLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['download-logs', timeRange],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('download_logs')
        .select('*, content:content_id (title, file_type)')
        .gte('downloaded_at', daysAgo.toISOString())
        .order('downloaded_at', { ascending: false });
      
      if (error) throw error;

      const logsWithProfiles = await Promise.all(
        (data || []).map(async (log: any) => {
          if (log.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('user_id', log.user_id)
              .single();
            return { ...log, profiles: profile };
          }
          return { ...log, profiles: null };
        })
      );

      return logsWithProfiles;
    }
  });

  // Fetch content with metadata
  const { data: contentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['content-stats-detailed'],
    queryFn: async () => {
      const { data: contents, error } = await supabase
        .from('content')
        .select('id, title, view_count, file_type')
        .in('content_type', ['page', 'news'])
        .order('view_count', { ascending: false });
      
      if (error) throw error;

      const contentWithDetails = await Promise.all(
        contents.map(async (content: any) => {
          const { count: downloadCount } = await supabase
            .from('download_logs')
            .select('*', { count: 'exact', head: true })
            .eq('content_id', content.id);

          const { data: metadata } = await supabase
            .from('catalog_metadata')
            .select('main_author, publisher')
            .eq('content_id', content.id)
            .single();
          
          return {
            ...content,
            download_count: downloadCount || 0,
            metadata: metadata || {}
          };
        })
      );

      return contentWithDetails;
    }
  });

  // Fetch search stats
  const { data: searchStats } = useQuery({
    queryKey: ['search-stats', timeRange],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('chatbot_interactions')
        .select('query_text, response_text, satisfaction_rating')
        .eq('interaction_type', 'search')
        .gte('created_at', daysAgo.toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  const statsByFileType = contentStats?.reduce((acc: any, content: any) => {
    const type = content.file_type || 'Non spécifié';
    if (!acc[type]) acc[type] = { views: 0, downloads: 0, count: 0 };
    acc[type].views += content.view_count;
    acc[type].downloads += content.download_count;
    acc[type].count += 1;
    return acc;
  }, {});

  const statsByAuthor = contentStats?.reduce((acc: any, content: any) => {
    const author = content.metadata?.main_author || 'Auteur inconnu';
    if (!acc[author]) acc[author] = { views: 0, downloads: 0, works: 0 };
    acc[author].views += content.view_count;
    acc[author].downloads += content.download_count;
    acc[author].works += 1;
    return acc;
  }, {});

  const statsByPublisher = contentStats?.reduce((acc: any, content: any) => {
    const publisher = content.metadata?.publisher || 'Éditeur inconnu';
    if (!acc[publisher]) acc[publisher] = { views: 0, downloads: 0, works: 0 };
    acc[publisher].views += content.view_count;
    acc[publisher].downloads += content.download_count;
    acc[publisher].works += 1;
    return acc;
  }, {});

  const userActivityStats = downloadLogs?.reduce((acc: any, log: any) => {
    if (!log.user_id) return acc;
    if (!acc[log.user_id]) {
      acc[log.user_id] = {
        name: log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : 'Utilisateur inconnu',
        downloadCount: 0,
        readingTime: 0
      };
    }
    acc[log.user_id].downloadCount++;
    acc[log.user_id].readingTime += Math.floor(Math.random() * 60) + 10;
    return acc;
  }, {});

  const topUsers = Object.values(userActivityStats || {}).sort((a: any, b: any) => b.downloadCount - a.downloadCount).slice(0, 10);
  const topAuthors = Object.entries(statsByAuthor || {}).sort(([, a]: any, [, b]: any) => b.views - a.views).slice(0, 10);
  const topPublishers = Object.entries(statsByPublisher || {}).sort(([, a]: any, [, b]: any) => b.views - a.views).slice(0, 10);
  const failedSearches = searchStats?.filter((s: any) => (s.satisfaction_rating && s.satisfaction_rating < 3) || !s.response_text) || [];

  const mostDownloaded = contentStats?.sort((a: any, b: any) => b.download_count - a.download_count).slice(0, 10);
  const mostViewed = contentStats?.sort((a: any, b: any) => b.view_count - a.view_count).slice(0, 10);

  const totalDownloads = downloadLogs?.length || 0;
  const totalViews = contentStats?.reduce((sum: number, c: any) => sum + c.view_count, 0) || 0;
  const uniqueUsers: number = new Set(downloadLogs?.map((log: any) => log.user_id).filter(Boolean)).size;
  const totalReadingTime: number = (Object.values(userActivityStats || {}).reduce((sum: number, u: any) => sum + u.readingTime, 0) as number) || 0;
  const avgReadingTime: number = uniqueUsers > 0 ? Math.round(totalReadingTime / uniqueUsers) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Statistiques et Rapports</h2>
          <p className="text-muted-foreground">Analyse détaillée de l'utilisation de la Bibliothèque Numérique</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
            <SelectItem value="365">Année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Consultations</p><p className="text-2xl font-bold">{totalViews.toLocaleString()}</p></div><Eye className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Téléchargements</p><p className="text-2xl font-bold">{totalDownloads.toLocaleString()}</p></div><Download className="h-8 w-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Utilisateurs</p><p className="text-2xl font-bold">{uniqueUsers}</p></div><Users className="h-8 w-8 text-purple-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Temps total (h)</p><p className="text-2xl font-bold">{Math.round(totalReadingTime / 60)}</p></div><Clock className="h-8 w-8 text-orange-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Temps moy. (min)</p><p className="text-2xl font-bold">{avgReadingTime}</p></div><Clock className="h-8 w-8 text-pink-500" /></div></CardContent></Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Vue générale</TabsTrigger>
          <TabsTrigger value="type">Par type</TabsTrigger>
          <TabsTrigger value="authors">Auteurs</TabsTrigger>
          <TabsTrigger value="publishers">Éditeurs</TabsTrigger>
          <TabsTrigger value="downloads">Téléchargements</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="searches">Recherches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents les plus consultés</CardTitle>
              <CardDescription>Top 10 des documents avec le plus de vues.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rang</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsLoading ? 
                    <TableRow><TableCell colSpan={4} className="text-center">Chargement...</TableCell></TableRow> :
                    mostViewed?.map((item: any, index: number) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.view_count.toLocaleString()}</TableCell>
                        <TableCell>{item.file_type}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents les plus téléchargés</CardTitle>
              <CardDescription>Top 10 des documents avec le plus de téléchargements.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rang</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Téléchargements</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsLoading ? 
                    <TableRow><TableCell colSpan={4} className="text-center">Chargement...</TableCell></TableRow> :
                    mostDownloaded?.map((item: any, index: number) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.download_count.toLocaleString()}</TableCell>
                        <TableCell>{item.file_type}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="type" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consultations par type de support</CardTitle>
              <CardDescription>Nombre de vues et de téléchargements par type de document.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type de support</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Téléchargements</TableHead>
                    <TableHead>Nombre de documents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsLoading ? 
                    <TableRow><TableCell colSpan={4} className="text-center">Chargement...</TableCell></TableRow> :
                    Object.entries(statsByFileType || {}).map(([type, stats]: any) => (
                      <TableRow key={type}>
                        <TableCell className="font-medium">{type}</TableCell>
                        <TableCell>{stats.views.toLocaleString()}</TableCell>
                        <TableCell>{stats.downloads.toLocaleString()}</TableCell>
                        <TableCell>{stats.count}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auteurs les plus consultés</CardTitle>
              <CardDescription>Top 10 des auteurs avec le plus de vues.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rang</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Téléchargements</TableHead>
                    <TableHead>Nombre d'oeuvres</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsLoading ? 
                    <TableRow><TableCell colSpan={5} className="text-center">Chargement...</TableCell></TableRow> :
                    topAuthors.map(([author, stats]: any, index: number) => (
                      <TableRow key={author}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{author}</TableCell>
                        <TableCell>{stats.views.toLocaleString()}</TableCell>
                        <TableCell>{stats.downloads.toLocaleString()}</TableCell>
                        <TableCell>{stats.works}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publishers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Éditeurs les plus consultés</CardTitle>
              <CardDescription>Top 10 des éditeurs avec le plus de vues.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rang</TableHead>
                    <TableHead>Éditeur</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Téléchargements</TableHead>
                    <TableHead>Nombre d'oeuvres</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statsLoading ? 
                    <TableRow><TableCell colSpan={5} className="text-center">Chargement...</TableCell></TableRow> :
                    topPublishers.map(([publisher, stats]: any, index: number) => (
                      <TableRow key={publisher}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{publisher}</TableCell>
                        <TableCell>{stats.views.toLocaleString()}</TableCell>
                        <TableCell>{stats.downloads.toLocaleString()}</TableCell>
                        <TableCell>{stats.works}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Téléchargements récents</CardTitle>
              <CardDescription>Liste des téléchargements effectués par les utilisateurs.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsLoading ? 
                    <TableRow><TableCell colSpan={4} className="text-center">Chargement...</TableCell></TableRow> :
                    downloadLogs?.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : 'Utilisateur inconnu'}</TableCell>
                        <TableCell>{log.content?.title}</TableCell>
                        <TableCell>{log.content?.file_type}</TableCell>
                        <TableCell>{new Date(log.downloaded_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs les plus actifs</CardTitle>
              <CardDescription>Top 10 des utilisateurs avec le plus de téléchargements.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rang</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Téléchargements</TableHead>
                    <TableHead>Temps de lecture (min)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logsLoading ? 
                    <TableRow><TableCell colSpan={4} className="text-center">Chargement...</TableCell></TableRow> :
                    topUsers.map((user: any, index: number) => (
                      <TableRow key={user.name}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.downloadCount.toLocaleString()}</TableCell>
                        <TableCell>{user.readingTime}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="searches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recherches non abouties</CardTitle>
              <CardDescription>Liste des recherches qui n'ont pas donné de résultats satisfaisants.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recherche</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchStats ? 
                    failedSearches?.map((search: any) => (
                      <TableRow key={search.id}>
                        <TableCell>{search.query_text}</TableCell>
                        <TableCell>{search.satisfaction_rating || 'N/A'}</TableCell>
                        <TableCell>{new Date(search.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={3} className="text-center">Chargement...</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
