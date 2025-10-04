import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, Download, Users, TrendingUp, AlertCircle, Calendar, Archive } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export function ManuscriptsDashboard() {
  // Fetch manuscripts statistics
  const { data: manuscripts } = useQuery({
    queryKey: ['manuscripts-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manuscripts')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch access requests
  const { data: accessRequests } = useQuery({
    queryKey: ['access-requests-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate statistics
  const totalManuscripts = manuscripts?.length || 0;
  const publicManuscripts = manuscripts?.filter(m => m.access_level === 'public').length || 0;
  const restrictedManuscripts = manuscripts?.filter(m => m.access_level === 'restricted').length || 0;
  const pendingRequests = accessRequests?.filter(r => r.status === 'pending').length || 0;

  // Prepare chart data
  const languageData = manuscripts?.reduce((acc: any[], manuscript) => {
    const existing = acc.find(item => item.language === manuscript.language);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ language: manuscript.language || 'Non spécifié', count: 1 });
    }
    return acc;
  }, []) || [];

  const periodData = manuscripts?.reduce((acc: any[], manuscript) => {
    const period = manuscript.period || 'Non spécifié';
    const existing = acc.find(item => item.period === period);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ period, count: 1 });
    }
    return acc;
  }, []) || [];

  const stats = [
    {
      title: "Total Manuscrits",
      value: totalManuscripts,
      icon: BookOpen,
      description: "Documents numérisés",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Accès Public",
      value: publicManuscripts,
      icon: Eye,
      description: "Accessibles à tous",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "Accès Restreint",
      value: restrictedManuscripts,
      icon: Archive,
      description: "Accès contrôlé",
      gradient: "from-orange-500 to-amber-600"
    },
    {
      title: "Demandes en attente",
      value: pendingRequests,
      icon: AlertCircle,
      description: "À traiter",
      gradient: "from-red-500 to-red-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Langue</CardTitle>
            <CardDescription>Distribution des manuscrits selon la langue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={languageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="language" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Période</CardTitle>
            <CardDescription>Distribution des manuscrits selon la période historique</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={periodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--gold))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Access Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Demandes d'Accès Récentes
          </CardTitle>
          <CardDescription>Les 10 dernières demandes d'accès aux manuscrits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accessRequests?.slice(0, 10).map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-sm">{request.purpose}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Type: {request.request_type}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={
                    request.status === 'approved' ? 'default' : 
                    request.status === 'rejected' ? 'destructive' : 
                    'secondary'
                  }>
                    {request.status === 'pending' ? 'En attente' : 
                     request.status === 'approved' ? 'Approuvé' : 
                     'Rejeté'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
