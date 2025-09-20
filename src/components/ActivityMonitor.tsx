import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Activity, 
  Search, 
  Filter, 
  Calendar,
  User,
  Database,
  AlertTriangle,
  RefreshCw,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: any;
  ip_address: unknown;
  user_agent: unknown;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const ActivityMonitor = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  // Check if user has permission to view logs
  const canViewLogs = profile?.role === 'admin';
  const canViewLimitedLogs = profile?.role === 'librarian';

  useEffect(() => {
    if (user && (canViewLogs || canViewLimitedLogs)) {
      fetchLogs();
    }
  }, [user, profile, canViewLogs, canViewLimitedLogs]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching logs:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les logs d'activité",
          variant: "destructive",
        });
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!canViewLogs) return;

    try {
      setIsCleaningUp(true);
      
      const { data, error } = await supabase.functions.invoke('cleanup-activity-logs');
      
      if (error) throw error;

      toast({
        title: "Nettoyage terminé",
        description: `${data.deleted_count} anciens logs supprimés`,
      });

      // Refresh logs after cleanup
      await fetchLogs();
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Erreur de nettoyage",
        description: "Impossible de nettoyer les anciens logs",
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesResource = resourceFilter === "all" || log.resource_type === resourceFilter;
    const matchesAction = actionFilter === "all" || log.action.includes(actionFilter);

    return matchesSearch && matchesResource && matchesAction;
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('delete') || action.includes('remove')) return 'destructive';
    if (action.includes('create') || action.includes('add')) return 'default';
    if (action.includes('update') || action.includes('edit')) return 'secondary';
    if (action.includes('view') || action.includes('access')) return 'outline';
    return 'outline';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!canViewLogs && !canViewLimitedLogs) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès restreint</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour voir les logs d'activité.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Surveillance des Activités</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLogs}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              {canViewLogs && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCleanup}
                  disabled={isCleaningUp}
                >
                  <Trash2 className={`h-4 w-4 mr-2 ${isCleaningUp ? 'animate-spin' : ''}`} />
                  Nettoyer
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Surveillance et audit des activités utilisateurs avec anonymisation automatique
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de ressource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les ressources</SelectItem>
                <SelectItem value="profile">Profils</SelectItem>
                <SelectItem value="content">Contenu</SelectItem>
                <SelectItem value="manuscripts">Manuscrits</SelectItem>
                <SelectItem value="collections">Collections</SelectItem>
                <SelectItem value="access_request">Demandes d'accès</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="create">Création</SelectItem>
                <SelectItem value="update">Modification</SelectItem>
                <SelectItem value="delete">Suppression</SelectItem>
                <SelectItem value="view">Consultation</SelectItem>
                <SelectItem value="access">Accès</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total</span>
                </div>
                <div className="text-2xl font-bold">{filteredLogs.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Utilisateurs uniques</span>
                </div>
                <div className="text-2xl font-bold">
                  {new Set(filteredLogs.map(log => log.user_id).filter(Boolean)).size}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Ressources</span>
                </div>
                <div className="text-2xl font-bold">
                  {new Set(filteredLogs.map(log => log.resource_type)).size}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Aujourd'hui</span>
                </div>
                <div className="text-2xl font-bold">
                  {filteredLogs.filter(log => 
                    new Date(log.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table des logs */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Ressource</TableHead>
                  <TableHead>IP (Anonymisée)</TableHead>
                  <TableHead>Navigateur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Chargement des logs...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun log d'activité trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        {log.user_id ? (
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3" />
                            <span className="text-sm">
                              {log.profiles?.first_name && log.profiles?.last_name
                                ? `${log.profiles.first_name} ${log.profiles.last_name}`
                                : 'Utilisateur'}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline">Système</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Database className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{log.resource_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {(log.ip_address as string) || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {(log.user_agent as string) || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};