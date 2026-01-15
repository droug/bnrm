import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  RefreshCw, 
  Plus, 
  Settings2, 
  Trash2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  Database,
  History,
  Loader2,
  Key,
  Link,
  Shield
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface SigbConfig {
  id: string;
  name: string;
  sigb_url: string;
  is_active: boolean;
  sync_frequency: string;
  sync_time: string;
  sync_day_of_week: number;
  sync_day_of_month: number;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_records_count: number;
  next_sync_at: string | null;
  created_at: string;
  // API Configuration
  auth_type: string;
  api_key_header: string;
  api_key_value: string | null;
  basic_auth_username: string | null;
  basic_auth_password: string | null;
  bearer_token: string | null;
  custom_headers: Record<string, string>;
  request_timeout_seconds: number;
  api_endpoint_path: string;
  response_format: string;
}

interface SigbSyncHistory {
  id: string;
  config_id: string;
  sync_started_at: string;
  sync_completed_at: string | null;
  status: string;
  records_imported: number;
  records_updated: number;
  records_failed: number;
  error_message: string | null;
  details: any;
}

const frequencyLabels: Record<string, string> = {
  hourly: "Toutes les heures",
  daily: "Quotidienne",
  weekly: "Hebdomadaire",
  monthly: "Mensuelle"
};

const dayOfWeekLabels: Record<number, string> = {
  1: "Lundi",
  2: "Mardi", 
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
  7: "Dimanche"
};

const authTypeLabels: Record<string, string> = {
  none: "Aucune authentification",
  api_key: "Clé API",
  basic_auth: "Authentification basique",
  bearer_token: "Token Bearer (OAuth)"
};

export default function SigbSyncManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SigbConfig | null>(null);
  const [syncingConfigId, setSyncingConfigId] = useState<string | null>(null);
  const [dialogTab, setDialogTab] = useState("general");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sigb_url: "",
    is_active: true,
    sync_frequency: "daily",
    sync_time: "02:00",
    sync_day_of_week: 1,
    sync_day_of_month: 1,
    // API Configuration
    auth_type: "none",
    api_key_header: "X-API-Key",
    api_key_value: "",
    basic_auth_username: "",
    basic_auth_password: "",
    bearer_token: "",
    custom_headers: "{}",
    request_timeout_seconds: 30,
    api_endpoint_path: "/api/export",
    response_format: "json"
  });

  // Fetch configurations
  const { data: configs, isLoading: configsLoading } = useQuery({
    queryKey: ['sigb-sync-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sigb_sync_config')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SigbConfig[];
    }
  });

  // Fetch sync history
  const { data: syncHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['sigb-sync-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sigb_sync_history')
        .select('*')
        .order('sync_started_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as SigbSyncHistory[];
    }
  });

  // Create/Update config
  const saveConfig = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      // Calculate next_sync_at based on frequency
      const now = new Date();
      let nextSync = new Date();
      const [hours, minutes] = data.sync_time.split(':').map(Number);
      nextSync.setHours(hours, minutes, 0, 0);

      if (nextSync <= now) {
        nextSync.setDate(nextSync.getDate() + 1);
      }

      // Parse custom headers
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(data.custom_headers || "{}");
      } catch (e) {
        console.warn("Invalid JSON for custom headers, using empty object");
      }

      const record = {
        name: data.name,
        sigb_url: data.sigb_url,
        is_active: data.is_active,
        sync_frequency: data.sync_frequency,
        sync_time: data.sync_time + ':00',
        sync_day_of_week: data.sync_day_of_week,
        sync_day_of_month: data.sync_day_of_month,
        next_sync_at: data.is_active ? nextSync.toISOString() : null,
        // API Configuration
        auth_type: data.auth_type,
        api_key_header: data.api_key_header,
        api_key_value: data.api_key_value || null,
        basic_auth_username: data.basic_auth_username || null,
        basic_auth_password: data.basic_auth_password || null,
        bearer_token: data.bearer_token || null,
        custom_headers: parsedHeaders,
        request_timeout_seconds: data.request_timeout_seconds,
        api_endpoint_path: data.api_endpoint_path,
        response_format: data.response_format
      };

      if (data.id) {
        const { error } = await supabase
          .from('sigb_sync_config')
          .update(record)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sigb_sync_config')
          .insert([record]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sigb-sync-configs'] });
      setShowConfigDialog(false);
      setEditingConfig(null);
      resetForm();
      toast({ title: editingConfig ? "Configuration mise à jour" : "Configuration créée" });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Delete config
  const deleteConfig = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sigb_sync_config')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sigb-sync-configs'] });
      toast({ title: "Configuration supprimée" });
    }
  });

  // Manual sync trigger
  const triggerSync = useMutation({
    mutationFn: async (config: SigbConfig) => {
      setSyncingConfigId(config.id);
      
      // Create history record
      const { data: historyRecord, error: historyError } = await supabase
        .from('sigb_sync_history')
        .insert([{
          config_id: config.id,
          status: 'running'
        }])
        .select()
        .single();
      
      if (historyError) throw historyError;

      try {
        // Build headers for the request
        const headers: Record<string, string> = {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(config.custom_headers || {})
        };

        // Add authentication headers
        if (config.auth_type === 'api_key' && config.api_key_value) {
          headers[config.api_key_header || 'X-API-Key'] = config.api_key_value;
        } else if (config.auth_type === 'bearer_token' && config.bearer_token) {
          headers['Authorization'] = `Bearer ${config.bearer_token}`;
        } else if (config.auth_type === 'basic_auth' && config.basic_auth_username) {
          const credentials = btoa(`${config.basic_auth_username}:${config.basic_auth_password || ''}`);
          headers['Authorization'] = `Basic ${credentials}`;
        }

        // Call edge function
        const { data, error } = await supabase.functions.invoke('sigb-metadata-sync', {
          body: {
            sigbUrl: config.sigb_url + (config.api_endpoint_path || ''),
            mode: 'manual',
            configId: config.id,
            historyId: historyRecord.id,
            authHeaders: headers,
            timeout: config.request_timeout_seconds || 30,
            responseFormat: config.response_format || 'json'
          }
        });

        if (error) throw error;

        // Update history record
        await supabase
          .from('sigb_sync_history')
          .update({
            status: 'success',
            sync_completed_at: new Date().toISOString(),
            records_imported: data?.imported || 0,
            details: data
          })
          .eq('id', historyRecord.id);

        // Update config
        await supabase
          .from('sigb_sync_config')
          .update({
            last_sync_at: new Date().toISOString(),
            last_sync_status: 'success',
            last_sync_records_count: data?.imported || 0
          })
          .eq('id', config.id);

        return data;
      } catch (error: any) {
        // Update history with error
        await supabase
          .from('sigb_sync_history')
          .update({
            status: 'error',
            sync_completed_at: new Date().toISOString(),
            error_message: error.message
          })
          .eq('id', historyRecord.id);

        // Update config
        await supabase
          .from('sigb_sync_config')
          .update({
            last_sync_at: new Date().toISOString(),
            last_sync_status: 'error'
          })
          .eq('id', config.id);

        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sigb-sync-configs'] });
      queryClient.invalidateQueries({ queryKey: ['sigb-sync-history'] });
      toast({ 
        title: "Synchronisation terminée",
        description: `${data?.imported || 0} enregistrements importés`
      });
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ['sigb-sync-configs'] });
      queryClient.invalidateQueries({ queryKey: ['sigb-sync-history'] });
      toast({ 
        title: "Erreur de synchronisation", 
        description: error.message, 
        variant: "destructive" 
      });
    },
    onSettled: () => {
      setSyncingConfigId(null);
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      sigb_url: "",
      is_active: true,
      sync_frequency: "daily",
      sync_time: "02:00",
      sync_day_of_week: 1,
      sync_day_of_month: 1,
      auth_type: "none",
      api_key_header: "X-API-Key",
      api_key_value: "",
      basic_auth_username: "",
      basic_auth_password: "",
      bearer_token: "",
      custom_headers: "{}",
      request_timeout_seconds: 30,
      api_endpoint_path: "/api/export",
      response_format: "json"
    });
    setDialogTab("general");
  };

  const openEditDialog = (config: SigbConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      sigb_url: config.sigb_url,
      is_active: config.is_active,
      sync_frequency: config.sync_frequency,
      sync_time: config.sync_time?.substring(0, 5) || "02:00",
      sync_day_of_week: config.sync_day_of_week,
      sync_day_of_month: config.sync_day_of_month,
      auth_type: config.auth_type || "none",
      api_key_header: config.api_key_header || "X-API-Key",
      api_key_value: config.api_key_value || "",
      basic_auth_username: config.basic_auth_username || "",
      basic_auth_password: config.basic_auth_password || "",
      bearer_token: config.bearer_token || "",
      custom_headers: JSON.stringify(config.custom_headers || {}, null, 2),
      request_timeout_seconds: config.request_timeout_seconds || 30,
      api_endpoint_path: config.api_endpoint_path || "/api/export",
      response_format: config.response_format || "json"
    });
    setDialogTab("general");
    setShowConfigDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.sigb_url.trim()) {
      toast({ 
        title: "Erreur", 
        description: "Veuillez remplir tous les champs obligatoires", 
        variant: "destructive" 
      });
      return;
    }
    saveConfig.mutate({ ...formData, id: editingConfig?.id });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" /> Succès</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Erreur</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> En cours</Badge>;
      default:
        return <Badge variant="secondary">Jamais exécuté</Badge>;
    }
  };

  const getAuthBadge = (authType: string) => {
    switch (authType) {
      case 'api_key':
        return <Badge variant="outline" className="text-blue-600"><Key className="h-3 w-3 mr-1" /> Clé API</Badge>;
      case 'basic_auth':
        return <Badge variant="outline" className="text-orange-600"><Shield className="h-3 w-3 mr-1" /> Basic Auth</Badge>;
      case 'bearer_token':
        return <Badge variant="outline" className="text-purple-600"><Shield className="h-3 w-3 mr-1" /> Bearer</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-400">Sans auth</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Synchronisation SIGB
            </CardTitle>
            <CardDescription>
              Configurez l'importation automatique des métadonnées depuis votre SIGB
            </CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setEditingConfig(null); setShowConfigDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle configuration
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="configs">
          <TabsList className="mb-4">
            <TabsTrigger value="configs" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Configurations
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configs">
            {configsLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !configs?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune configuration SIGB</p>
                <p className="text-sm">Créez une configuration pour commencer à synchroniser</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>URL / Endpoint</TableHead>
                    <TableHead>Auth</TableHead>
                    <TableHead>Fréquence</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {config.name}
                          {config.is_active ? (
                            <Badge variant="outline" className="text-green-600">Actif</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400">Inactif</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <div className="truncate text-sm" title={config.sigb_url}>
                            {config.sigb_url}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {config.api_endpoint_path}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getAuthBadge(config.auth_type)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {frequencyLabels[config.sync_frequency]}
                          <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Clock className="h-3 w-3" />
                            {config.sync_time?.substring(0, 5)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(config.last_sync_status)}</TableCell>
                      <TableCell>
                        {config.last_sync_at ? (
                          <div className="text-sm">
                            <div>{format(new Date(config.last_sync_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</div>
                            <div className="text-muted-foreground text-xs">
                              {config.last_sync_records_count} enregistrements
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerSync.mutate(config)}
                            disabled={syncingConfigId === config.id}
                          >
                            {syncingConfigId === config.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(config)}
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Supprimer cette configuration ?")) {
                                deleteConfig.mutate(config.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="history">
            {historyLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !syncHistory?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun historique de synchronisation</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Importés</TableHead>
                    <TableHead>Mis à jour</TableHead>
                    <TableHead>Échecs</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Erreur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncHistory.map((history) => {
                    const duration = history.sync_completed_at 
                      ? Math.round((new Date(history.sync_completed_at).getTime() - new Date(history.sync_started_at).getTime()) / 1000)
                      : null;
                    
                    return (
                      <TableRow key={history.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(history.sync_started_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</div>
                            <div className="text-muted-foreground text-xs">
                              {formatDistanceToNow(new Date(history.sync_started_at), { addSuffix: true, locale: fr })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(history.status)}</TableCell>
                        <TableCell>{history.records_imported}</TableCell>
                        <TableCell>{history.records_updated}</TableCell>
                        <TableCell>
                          {history.records_failed > 0 && (
                            <Badge variant="destructive">{history.records_failed}</Badge>
                          )}
                          {history.records_failed === 0 && "-"}
                        </TableCell>
                        <TableCell>
                          {duration !== null ? `${duration}s` : "-"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={history.error_message || ""}>
                          {history.error_message || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>

        {/* Configuration Dialog */}
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? "Modifier la configuration" : "Nouvelle configuration SIGB"}
              </DialogTitle>
              <DialogDescription>
                Configurez la connexion et la synchronisation automatique des métadonnées
              </DialogDescription>
            </DialogHeader>

            <Tabs value={dialogTab} onValueChange={setDialogTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general" className="flex items-center gap-1">
                  <Settings2 className="h-4 w-4" />
                  Général
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center gap-1">
                  <Link className="h-4 w-4" />
                  API
                </TabsTrigger>
                <TabsTrigger value="auth" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Authentification
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la configuration *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: SIGB Production"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sigb_url">URL de base du SIGB *</Label>
                  <Input
                    id="sigb_url"
                    value={formData.sigb_url}
                    onChange={(e) => setFormData({ ...formData, sigb_url: e.target.value })}
                    placeholder="https://votre-sigb.com"
                  />
                  <p className="text-xs text-muted-foreground">URL de base sans le chemin de l'API</p>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Synchronisation active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fréquence de synchronisation</Label>
                  <Select
                    value={formData.sync_frequency}
                    onValueChange={(value) => setFormData({ ...formData, sync_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sync_time">Heure de synchronisation</Label>
                  <Input
                    id="sync_time"
                    type="time"
                    value={formData.sync_time}
                    onChange={(e) => setFormData({ ...formData, sync_time: e.target.value })}
                  />
                </div>

                {formData.sync_frequency === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Jour de la semaine</Label>
                    <Select
                      value={formData.sync_day_of_week.toString()}
                      onValueChange={(value) => setFormData({ ...formData, sync_day_of_week: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(dayOfWeekLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.sync_frequency === 'monthly' && (
                  <div className="space-y-2">
                    <Label>Jour du mois</Label>
                    <Select
                      value={formData.sync_day_of_month.toString()}
                      onValueChange={(value) => setFormData({ ...formData, sync_day_of_month: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="api" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="api_endpoint_path">Chemin de l'endpoint API</Label>
                  <Input
                    id="api_endpoint_path"
                    value={formData.api_endpoint_path}
                    onChange={(e) => setFormData({ ...formData, api_endpoint_path: e.target.value })}
                    placeholder="/api/export"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL complète: {formData.sigb_url}{formData.api_endpoint_path}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Format de réponse attendu</Label>
                  <Select
                    value={formData.response_format}
                    onValueChange={(value) => setFormData({ ...formData, response_format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="marc">MARC / UNIMARC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request_timeout_seconds">Timeout de la requête (secondes)</Label>
                  <Input
                    id="request_timeout_seconds"
                    type="number"
                    min={5}
                    max={120}
                    value={formData.request_timeout_seconds}
                    onChange={(e) => setFormData({ ...formData, request_timeout_seconds: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_headers">Headers personnalisés (JSON)</Label>
                  <Textarea
                    id="custom_headers"
                    value={formData.custom_headers}
                    onChange={(e) => setFormData({ ...formData, custom_headers: e.target.value })}
                    placeholder='{"X-Custom-Header": "valeur"}'
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Headers additionnels à envoyer avec chaque requête
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="auth" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Type d'authentification</Label>
                  <Select
                    value={formData.auth_type}
                    onValueChange={(value) => setFormData({ ...formData, auth_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(authTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.auth_type === 'api_key' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="api_key_header">Nom du header</Label>
                      <Input
                        id="api_key_header"
                        value={formData.api_key_header}
                        onChange={(e) => setFormData({ ...formData, api_key_header: e.target.value })}
                        placeholder="X-API-Key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api_key_value">Clé API</Label>
                      <Input
                        id="api_key_value"
                        type="password"
                        value={formData.api_key_value}
                        onChange={(e) => setFormData({ ...formData, api_key_value: e.target.value })}
                        placeholder="Votre clé API"
                      />
                    </div>
                  </>
                )}

                {formData.auth_type === 'basic_auth' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="basic_auth_username">Nom d'utilisateur</Label>
                      <Input
                        id="basic_auth_username"
                        value={formData.basic_auth_username}
                        onChange={(e) => setFormData({ ...formData, basic_auth_username: e.target.value })}
                        placeholder="Utilisateur"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="basic_auth_password">Mot de passe</Label>
                      <Input
                        id="basic_auth_password"
                        type="password"
                        value={formData.basic_auth_password}
                        onChange={(e) => setFormData({ ...formData, basic_auth_password: e.target.value })}
                        placeholder="Mot de passe"
                      />
                    </div>
                  </>
                )}

                {formData.auth_type === 'bearer_token' && (
                  <div className="space-y-2">
                    <Label htmlFor="bearer_token">Token Bearer / OAuth</Label>
                    <Textarea
                      id="bearer_token"
                      value={formData.bearer_token}
                      onChange={(e) => setFormData({ ...formData, bearer_token: e.target.value })}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      rows={3}
                      className="font-mono text-sm"
                    />
                  </div>
                )}

                {formData.auth_type === 'none' && (
                  <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune authentification requise</p>
                    <p className="text-xs mt-1">L'API sera appelée sans credentials</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={saveConfig.isPending}>
                {saveConfig.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingConfig ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
