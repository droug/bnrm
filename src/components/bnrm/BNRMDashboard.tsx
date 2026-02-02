import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Archive, 
  TrendingUp,
  Users,
  BookOpen,
  BarChart3,
  AlertCircle,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  validatedRequests: number;
  rejectedRequests: number;
  totalISBN: number;
  totalISSN: number;
  documentsReceived: number;
  processedDocuments: number;
}

interface RecentActivity {
  id: string;
  type: 'request' | 'validation' | 'deposit' | 'attribution';
  title: string;
  status: string;
  date: string;
  user: string;
}

export const BNRMDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    validatedRequests: 0,
    rejectedRequests: 0,
    totalISBN: 0,
    totalISSN: 0,
    documentsReceived: 0,
    processedDocuments: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch legal deposits stats
      const { data: deposits } = await supabase
        .from('legal_deposits')
        .select('status, deposit_type');

      const totalRequests = deposits?.length || 0;
      const pendingRequests = deposits?.filter(d => d.status === 'submitted').length || 0;
      const validatedRequests = deposits?.filter(d => d.status === 'validated').length || 0;
      const rejectedRequests = deposits?.filter(d => d.status === 'rejected').length || 0;

      // Mock data for other stats - in real app, these would come from respective tables
      setStats({
        totalRequests,
        pendingRequests,
        validatedRequests,
        rejectedRequests,
        totalISBN: 1250,
        totalISSN: 85,
        documentsReceived: 890,
        processedDocuments: 756
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'request',
          title: 'Nouvelle demande - "Histoire du Maroc Moderne"',
          status: 'pending',
          date: new Date().toISOString(),
          user: 'Editions Al Manahil'
        },
        {
          id: '2',
          type: 'validation',
          title: 'Validation demande DL-2025-001234',
          status: 'validated',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'Agent DL - M. Benjelloun'
        },
        {
          id: '3',
          type: 'attribution',
          title: 'Attribution ISBN 978-9981-123-45-6',
          status: 'completed',
          date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user: 'Service DLBN'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'request': return FileText;
      case 'validation': return CheckCircle;
      case 'deposit': return Archive;
      case 'attribution': return BookOpen;
      default: return FileText;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "En attente" },
      validated: { variant: "default" as const, label: "Validé" },
      completed: { variant: "default" as const, label: "Terminé" },
      rejected: { variant: "destructive" as const, label: "Rejeté" }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tableau de Bord - Dépôt Légal BNRM</h2>
          <p className="text-muted-foreground">
            Vue d'ensemble des activités de dépôt légal - {format(new Date(), "EEEE dd MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Rapport quotidien
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes totales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une action
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ISBN attribués</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalISBN}</div>
            <p className="text-xs text-muted-foreground">
              Cette année
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents reçus</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documentsReceived}</div>
            <p className="text-xs text-muted-foreground">
              {stats.processedDocuments} traités
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Workflow Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progression des Workflows
            </CardTitle>
            <CardDescription>
              État d'avancement des processus en cours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Validation des demandes</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attribution des numéros</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Réception documents</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Archivage final</span>
                <span>90%</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Activité récente
            </CardTitle>
            <CardDescription>
              Dernières actions effectuées dans le système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const statusBadge = getStatusBadge(activity.status);
                
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={statusBadge.variant} className="text-xs">
                          {statusBadge.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {activity.user}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.date), "HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Alerts */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Alertes et Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-orange-700">
              • 3 demandes dépassent le délai de traitement standard (&gt; 5 jours)
            </p>
            <p className="text-sm text-orange-700">
              • 7 éditeurs n'ont pas encore déposé leurs exemplaires
            </p>
            <p className="text-sm text-orange-700">
              • Rapport mensuel ISBN dû demain à l'Agence Internationale
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};