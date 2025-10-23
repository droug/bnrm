import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomSelect } from "@/components/ui/custom-select";
import { Calendar, Users, Handshake, FileText, TrendingUp, MapPin, Activity } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DashboardStats {
  reservations: { total: number; enAttente: number; validees: number; rejetees: number; realisees: number };
  guidedTours: { total: number; enAttente: number; validees: number; rejetees: number; realisees: number };
  partnerships: { total: number; enAttente: number; validees: number; rejetees: number; realisees: number };
  programming: { total: number; enAttente: number; validees: number; rejetees: number; realisees: number };
  validationRate: number;
  averageProcessingTime: number;
  mostReservedSpace: string;
  mostFrequentActivity: string;
}

const COLORS = ['#FBBF24', '#10B981', '#EF4444', '#3B82F6'];

const CulturalActivitiesDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    reservations: { total: 0, enAttente: 0, validees: 0, rejetees: 0, realisees: 0 },
    guidedTours: { total: 0, enAttente: 0, validees: 0, rejetees: 0, realisees: 0 },
    partnerships: { total: 0, enAttente: 0, validees: 0, rejetees: 0, realisees: 0 },
    programming: { total: 0, enAttente: 0, validees: 0, rejetees: 0, realisees: 0 },
    validationRate: 0,
    averageProcessingTime: 0,
    mostReservedSpace: 'Aucune donnée',
    mostFrequentActivity: 'Aucune donnée'
  });
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch partnerships
      const { data: partnershipsData } = await supabase
        .from('partnerships')
        .select('statut')
        .gte('created_at', startDate.toISOString());

      // Fetch program contributions
      const { data: programmingData } = await supabase
        .from('cultural_program_proposals')
        .select('statut, type_activite, date_creation, date_traitement')
        .gte('date_creation', startDate.toISOString());

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('status, created_at, updated_at, cultural_spaces(name)')
        .gte('created_at', startDate.toISOString());

      // Fetch visits
      const { data: visitsData } = await supabase
        .from('visits_bookings')
        .select('statut, created_at, updated_at')
        .gte('created_at', startDate.toISOString());

      // Calculate stats
      const calculateStats = (data: any[] | null) => {
        if (!data) return { total: 0, enAttente: 0, validees: 0, rejetees: 0, realisees: 0 };
        return {
          total: data.length,
          enAttente: data.filter(d => ['en_attente', 'pending'].includes(d.statut || d.status)).length,
          validees: data.filter(d => ['approuve', 'acceptee', 'confirmee', 'validee', 'confirmée'].includes(d.statut || d.status)).length,
          rejetees: data.filter(d => ['rejete', 'rejetee', 'rejetée'].includes(d.statut || d.status)).length,
          realisees: data.filter(d => ['realisee', 'terminee', 'completee', 'réalisée'].includes(d.statut || d.status)).length
        };
      };

      const reservationsStats = calculateStats(bookingsData?.map(b => ({ statut: b.status })));
      const toursStats = calculateStats(visitsData);
      const partnershipsStats = calculateStats(partnershipsData);
      const programmingStats = calculateStats(programmingData);

      // Calculate validation rate
      const allData = [...(bookingsData || []).map(b => ({ status: b.status })), ...(visitsData || []), ...(partnershipsData || []), ...(programmingData || [])];
      const validatedCount = allData.filter((d: any) => 
        ['confirmée', 'confirmee', 'validee', 'approuve', 'acceptee'].includes((d.statut || d.status)?.toLowerCase() || '')
      ).length;
      const validationRate = allData.length > 0 ? Math.round((validatedCount / allData.length) * 100) : 0;

      // Calculate average processing time
      const processedBookings = bookingsData?.filter(b => 
        b.created_at && b.updated_at && b.status !== 'en_attente'
      ) || [];
      const totalProcessingTime = processedBookings.reduce((sum, b) => {
        const created = new Date(b.created_at).getTime();
        const updated = new Date(b.updated_at).getTime();
        return sum + (updated - created);
      }, 0);
      const averageProcessingTime = processedBookings.length > 0
        ? Math.round(totalProcessingTime / processedBookings.length / (1000 * 60 * 60 * 24))
        : 0;

      // Most reserved space
      const spaceCounts = bookingsData?.reduce((acc: Record<string, number>, b) => {
        const spaceName = b.cultural_spaces?.name || 'Inconnu';
        acc[spaceName] = (acc[spaceName] || 0) + 1;
        return acc;
      }, {});
      const mostReservedSpace = spaceCounts && Object.keys(spaceCounts).length > 0
        ? Object.entries(spaceCounts).sort(([, a], [, b]) => b - a)[0][0]
        : 'Aucune donnée';

      // Most frequent activity
      const activityCounts = programmingData?.reduce((acc: Record<string, number>, p: any) => {
        const type = p.type_activite || 'Non spécifié';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      const mostFrequentActivity = activityCounts && Object.keys(activityCounts).length > 0
        ? Object.entries(activityCounts).sort(([, a], [, b]) => b - a)[0][0]
        : 'Aucune donnée';

      setStats({
        reservations: reservationsStats,
        guidedTours: toursStats,
        partnerships: partnershipsStats,
        programming: programmingStats,
        validationRate,
        averageProcessingTime,
        mostReservedSpace,
        mostFrequentActivity
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRequests = 
    stats.reservations.total + 
    stats.guidedTours.total + 
    stats.partnerships.total + 
    stats.programming.total;

  const barData = [
    { name: 'Réservations', value: stats.reservations.total },
    { name: 'Visites', value: stats.guidedTours.total },
    { name: 'Partenariats', value: stats.partnerships.total },
    { name: 'Programmation', value: stats.programming.total }
  ];

  const pieData = [
    { name: 'Réservations d\'espaces', value: stats.reservations.total },
    { name: 'Visites guidées', value: stats.guidedTours.total },
    { name: 'Partenariats', value: stats.partnerships.total },
    { name: 'Programmation', value: stats.programming.total }
  ].filter(item => item.value > 0);

  const statusData = [
    { name: 'En attente', value: stats.partnerships.enAttente + stats.programming.enAttente },
    { name: 'Validées', value: stats.partnerships.validees + stats.programming.validees },
    { name: 'Rejetées', value: stats.partnerships.rejetees + stats.programming.rejetees },
    { name: 'Réalisées', value: stats.partnerships.realisees + stats.programming.realisees }
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light text-foreground">Tableau de bord</h2>
        <CustomSelect
          value={period}
          onValueChange={(v) => setPeriod(v as any)}
          options={[
            { value: "month", label: "Dernier mois" },
            { value: "quarter", label: "Dernier trimestre" },
            { value: "year", label: "Dernière année" },
          ]}
          icon={<Calendar className="h-4 w-4" />}
          className="w-[200px]"
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de validation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.validationRate}%</div>
            <p className="text-xs text-muted-foreground">Demandes validées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Délai moyen</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProcessingTime} jours</div>
            <p className="text-xs text-muted-foreground">Temps de traitement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espace populaire</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{stats.mostReservedSpace}</div>
            <p className="text-xs text-muted-foreground">Espace le plus réservé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activité populaire</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{stats.mostFrequentActivity}</div>
            <p className="text-xs text-muted-foreground">Type le plus fréquent</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations d'espaces</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reservations.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.reservations.enAttente} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visites guidées</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.guidedTours.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.guidedTours.enAttente} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partenariats</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.partnerships.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.partnerships.enAttente} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programmation</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.programming.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.programming.enAttente} en attente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-800">
                {stats.partnerships.enAttente + stats.programming.enAttente}
              </div>
              <p className="text-sm text-yellow-600 mt-2">En attente</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-800">
                {stats.partnerships.validees + stats.programming.validees}
              </div>
              <p className="text-sm text-green-600 mt-2">Validées</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-800">
                {stats.partnerships.rejetees + stats.programming.rejetees}
              </div>
              <p className="text-sm text-red-600 mt-2">Rejetées</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-800">
                {stats.partnerships.realisees + stats.programming.realisees}
              </div>
              <p className="text-sm text-blue-600 mt-2">Réalisées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-light">Demandes par type (mois en cours)</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-light">Répartition par type</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-light">Répartition par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CulturalActivitiesDashboard;
