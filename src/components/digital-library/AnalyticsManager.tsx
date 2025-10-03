import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Download, TrendingUp, Users, FileText, Calendar, BarChart3 } from "lucide-react";

interface DownloadLog {
  id: string;
  content_id: string;
  user_id: string | null;
  downloaded_at: string;
  content: {
    title: string;
    file_type: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
}

interface ContentStats {
  id: string;
  title: string;
  view_count: number;
  download_count: number;
  file_type: string;
}

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
        .select(`
          *,
          content:content_id (title, file_type)
        `)
        .gte('downloaded_at', daysAgo.toISOString())
        .order('downloaded_at', { ascending: false });
      
      if (error) throw error;

      // Fetch user profiles separately for each log
      const logsWithProfiles = await Promise.all(
        (data || []).map(async (log) => {
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

      return logsWithProfiles as DownloadLog[];
    }
  });

  // Fetch content with statistics
  const { data: contentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['content-stats'],
    queryFn: async () => {
      const { data: contents, error } = await supabase
        .from('content')
        .select('id, title, view_count, file_type')
        .in('content_type', ['page', 'news'])
        .order('view_count', { ascending: false });
      
      if (error) throw error;

      // Get download counts for each content
      const contentWithDownloads = await Promise.all(
        contents.map(async (content) => {
          const { count } = await supabase
            .from('download_logs')
            .select('*', { count: 'exact', head: true })
            .eq('content_id', content.id);
          
          return {
            ...content,
            download_count: count || 0
          };
        })
      );

      return contentWithDownloads as ContentStats[];
    }
  });

  // Calculate user download stats
  const userDownloadStats = downloadLogs?.reduce((acc, log) => {
    if (!log.user_id) return acc;
    
    const key = log.user_id;
    if (!acc[key]) {
      acc[key] = {
        user_id: log.user_id,
        name: log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : 'Utilisateur inconnu',
        count: 0
      };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { user_id: string; name: string; count: number }>);

  const topUsers = Object.values(userDownloadStats || {})
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Most downloaded documents
  const mostDownloaded = contentStats
    ?.sort((a, b) => b.download_count - a.download_count)
    .slice(0, 10);

  // Most viewed documents
  const mostViewed = contentStats
    ?.sort((a, b) => b.view_count - a.view_count)
    .slice(0, 10);

  const totalDownloads = downloadLogs?.length || 0;
  const totalViews = contentStats?.reduce((sum, c) => sum + c.view_count, 0) || 0;
  const uniqueUsers = new Set(downloadLogs?.map(log => log.user_id).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Suivi des Consultations / Téléchargements</h2>
          <p className="text-muted-foreground">Statistiques et tendances d'utilisation</p>
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Consultations</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Téléchargements</p>
                <p className="text-2xl font-bold">{totalDownloads.toLocaleString()}</p>
              </div>
              <Download className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs Actifs</p>
                <p className="text-2xl font-bold">{uniqueUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{contentStats?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="downloads">Téléchargements</TabsTrigger>
          <TabsTrigger value="views">Consultations</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top 5 Documents Consultés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mostViewed?.slice(0, 5).map((doc, index) => (
                    <div key={doc.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.file_type || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{doc.view_count}</p>
                        <p className="text-xs text-muted-foreground">vues</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Top 5 Documents Téléchargés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mostDownloaded?.slice(0, 5).map((doc, index) => (
                    <div key={doc.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.file_type || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{doc.download_count}</p>
                        <p className="text-xs text-muted-foreground">téléchargements</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Downloads Tab */}
        <TabsContent value="downloads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents les Plus Téléchargés</CardTitle>
              <CardDescription>Classement par nombre de téléchargements</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <p>Chargement...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rang</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Téléchargements</TableHead>
                      <TableHead className="text-right">Consultations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mostDownloaded?.map((doc, index) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{doc.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.file_type || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {doc.download_count}
                        </TableCell>
                        <TableCell className="text-right">
                          {doc.view_count}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historique des Téléchargements</CardTitle>
              <CardDescription>Derniers téléchargements effectués</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <p>Chargement...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {downloadLogs?.slice(0, 20).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.content?.title || 'Document supprimé'}
                        </TableCell>
                        <TableCell>
                          {log.profiles 
                            ? `${log.profiles.first_name} ${log.profiles.last_name}`
                            : 'Utilisateur anonyme'
                          }
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.downloaded_at).toLocaleString('fr-FR')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Views Tab */}
        <TabsContent value="views" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents les Plus Consultés</CardTitle>
              <CardDescription>Classement par nombre de consultations</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <p>Chargement...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rang</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Consultations</TableHead>
                      <TableHead className="text-right">Téléchargements</TableHead>
                      <TableHead className="text-right">Taux Conversion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mostViewed?.map((doc, index) => {
                      const conversionRate = doc.view_count > 0 
                        ? ((doc.download_count / doc.view_count) * 100).toFixed(1)
                        : '0';
                      
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <Badge variant={index < 3 ? "default" : "secondary"}>
                              #{index + 1}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.file_type || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {doc.view_count}
                          </TableCell>
                          <TableCell className="text-right">
                            {doc.download_count}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={parseFloat(conversionRate) > 50 ? "default" : "secondary"}>
                              {conversionRate}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs les Plus Actifs</CardTitle>
              <CardDescription>Classement par nombre de téléchargements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rang</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead className="text-right">Téléchargements</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topUsers.map((user, index) => (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-right font-bold">{user.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
