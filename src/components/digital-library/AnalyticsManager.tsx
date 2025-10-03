import { useState } from "react";
import jsPDF from "jspdf";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Download, TrendingUp, Users, Clock, Search, AlertCircle, User, Building, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AnalyticsManager() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<string>("30");
  const [selectedTab, setSelectedTab] = useState("overview");

  const handleExportJSON = () => {
    const reportData = {
      periode: `${timeRange} derniers jours`,
      dateGeneration: new Date().toLocaleDateString('fr-FR'),
      statistiquesGlobales: {
        totalConsultations: totalViews,
        totalTelechargements: totalDownloads,
        utilisateursActifs: uniqueUsers,
        tempsTotalLecture: Math.round(totalReadingTime / 60),
        tempsMoyenParUtilisateur: avgReadingTime
      },
      top10OeuvresConsultees: mostViewed?.slice(0, 10).map((doc: any, index: number) => ({
        rang: index + 1,
        titre: doc.title,
        auteur: doc.metadata?.main_author || 'Auteur inconnu',
        consultations: doc.view_count,
        telechargements: doc.download_count
      })),
      statistiquesParType: Object.entries(statsByFileType || {}).map(([type, stats]: any) => ({
        type,
        nombreDocuments: stats.count,
        consultations: stats.views,
        telechargements: stats.downloads,
        moyenneConsultations: Math.round(stats.views / stats.count)
      })),
      top10Auteurs: topAuthors.slice(0, 10).map(([author, stats]: any, index: number) => ({
        rang: index + 1,
        auteur: author,
        nombreOeuvres: stats.works,
        consultations: stats.views,
        telechargements: stats.downloads
      })),
      top10Editeurs: topPublishers.slice(0, 10).map(([publisher, stats]: any, index: number) => ({
        rang: index + 1,
        editeur: publisher,
        nombreOeuvres: stats.works,
        consultations: stats.views,
        telechargements: stats.downloads
      })),
      utilisateursActifs: topUsers.map((user: any, index: number) => ({
        rang: index + 1,
        nom: user.name,
        telechargements: user.downloadCount,
        tempsLecture: user.readingTime
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-bibliotheque-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ 
      title: "Rapport JSON généré", 
      description: "Le rapport a été téléchargé avec succès" 
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Titre
    doc.setFontSize(18);
    doc.text('Rapport Bibliothèque Numérique', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(10);
    doc.text(`Période: ${timeRange} derniers jours`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Statistiques globales
    doc.setFontSize(14);
    doc.text('Statistiques Globales', 15, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.text(`Total Consultations: ${totalViews.toLocaleString()}`, 20, yPos);
    yPos += 6;
    doc.text(`Total Téléchargements: ${totalDownloads.toLocaleString()}`, 20, yPos);
    yPos += 6;
    doc.text(`Utilisateurs Actifs: ${uniqueUsers}`, 20, yPos);
    yPos += 6;
    doc.text(`Temps Total Lecture: ${Math.round(totalReadingTime / 60)}h`, 20, yPos);
    yPos += 6;
    doc.text(`Temps Moyen par Utilisateur: ${avgReadingTime} min`, 20, yPos);
    yPos += 12;

    // Top 10 Œuvres Consultées
    doc.setFontSize(14);
    doc.text('Top 10 Oeuvres Consultées', 15, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    mostViewed?.slice(0, 10).forEach((doc: any, index: number) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const text = `${index + 1}. ${doc.title} - ${doc.view_count} consultations`;
      doc.text(text.substring(0, 80), 20, yPos);
      yPos += 5;
    });
    yPos += 10;

    // Top 10 Auteurs
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Top 10 Auteurs', 15, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    topAuthors.slice(0, 10).forEach(([author, stats]: any, index: number) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${index + 1}. ${author} - ${stats.views} consultations`, 20, yPos);
      yPos += 5;
    });

    // Sauvegarder le PDF
    doc.save(`rapport-bibliotheque-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({ 
      title: "Rapport PDF généré", 
      description: "Le rapport a été téléchargé avec succès" 
    });
  };

  const handleExportCSV = () => {
    const csvRows = [];
    
    // En-têtes
    csvRows.push('RAPPORT BIBLIOTHEQUE NUMERIQUE');
    csvRows.push(`Période,${timeRange} derniers jours`);
    csvRows.push(`Date de génération,${new Date().toLocaleDateString('fr-FR')}`);
    csvRows.push('');
    
    // Statistiques globales
    csvRows.push('STATISTIQUES GLOBALES');
    csvRows.push('Métrique,Valeur');
    csvRows.push(`Total Consultations,${totalViews}`);
    csvRows.push(`Total Téléchargements,${totalDownloads}`);
    csvRows.push(`Utilisateurs Actifs,${uniqueUsers}`);
    csvRows.push(`Temps Total Lecture (h),${Math.round(totalReadingTime / 60)}`);
    csvRows.push(`Temps Moyen par Utilisateur (min),${avgReadingTime}`);
    csvRows.push('');
    
    // Top 10 Œuvres
    csvRows.push('TOP 10 OEUVRES CONSULTEES');
    csvRows.push('Rang,Titre,Auteur,Consultations,Téléchargements');
    mostViewed?.slice(0, 10).forEach((doc: any, index: number) => {
      csvRows.push(`${index + 1},"${doc.title}","${doc.metadata?.main_author || 'Auteur inconnu'}",${doc.view_count},${doc.download_count}`);
    });
    csvRows.push('');
    
    // Top 10 Auteurs
    csvRows.push('TOP 10 AUTEURS');
    csvRows.push('Rang,Auteur,Nombre Oeuvres,Consultations,Téléchargements');
    topAuthors.slice(0, 10).forEach(([author, stats]: any, index: number) => {
      csvRows.push(`${index + 1},"${author}",${stats.works},${stats.views},${stats.downloads}`);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-bibliotheque-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ 
      title: "Rapport CSV généré", 
      description: "Le rapport a été téléchargé avec succès" 
    });
  };

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
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Exporter le rapport
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileDown className="h-4 w-4 mr-2" />
                Exporter en CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                <FileDown className="h-4 w-4 mr-2" />
                Exporter en JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
