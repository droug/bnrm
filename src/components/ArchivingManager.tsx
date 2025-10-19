import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Archive, 
  Settings, 
  Clock, 
  Save, 
  Play, 
  History,
  FileText,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Eye,
  Star,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ArchivingSettings {
  id: string;
  content_type: 'news' | 'event' | 'exhibition' | 'page';
  auto_archive_enabled: boolean;
  archive_after_days: number;
  archive_condition: string;
  exclude_featured: boolean;
  min_view_count?: number;
  updated_at: string;
}

interface ArchivingLog {
  id: string;
  content_id: string;
  content_title: string;
  content_type: string;
  action: string;
  reason: string;
  old_status: string;
  new_status: string;
  executed_by?: string;
  executed_at: string;
}

const CONTENT_TYPES = {
  news: { name: 'Actualités', icon: FileText, color: 'bg-blue-500' },
  event: { name: 'Événements', icon: Calendar, color: 'bg-green-500' },
  exhibition: { name: 'Expositions', icon: ImageIcon, color: 'bg-purple-500' },
  page: { name: 'Pages', icon: BookOpen, color: 'bg-orange-500' }
};

export default function ArchivingManager() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<ArchivingSettings[]>([]);
  const [logs, setLogs] = useState<ArchivingLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isRunningArchiving, setIsRunningArchiving] = useState(false);

  useEffect(() => {
    if (!rolesLoading && user && (isAdmin || isLibrarian)) {
      fetchSettings();
      fetchLogs();
    }
  }, [user, rolesLoading, isAdmin, isLibrarian]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('archiving_settings')
        .select('*')
        .order('content_type');

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres d'archivage",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('archiving_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching logs:', error);
    }
  };

  const updateSettings = async (contentType: 'news' | 'event' | 'exhibition' | 'page', updates: Partial<ArchivingSettings>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('archiving_settings')
        .update(updates)
        .eq('content_type', contentType);

      if (error) throw error;

      setSettings(prev => 
        prev.map(setting => 
          setting.content_type === contentType 
            ? { ...setting, ...updates }
            : setting
        )
      );

      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres d'archivage ont été sauvegardés",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const runManualArchiving = async () => {
    setIsRunningArchiving(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-archive-content');

      if (error) throw error;

      toast({
        title: "Archivage terminé",
        description: `${data.archived_count} contenu(s) archivé(s), ${data.skipped_count} ignoré(s)`,
      });

      // Refresh logs
      await fetchLogs();
    } catch (error: any) {
      toast({
        title: "Erreur d'archivage",
        description: error.message || "Échec de l'archivage automatique",
        variant: "destructive",
      });
    } finally {
      setIsRunningArchiving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'archived':
        return <Badge variant="default">Archivé</Badge>;
      case 'restored':
        return <Badge variant="secondary">Restauré</Badge>;
      case 'skipped':
        return <Badge variant="outline">Ignoré</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Archive className="h-6 w-6" />
            Archivage Automatique
          </h2>
          <p className="text-muted-foreground">
            Configurez l'archivage automatique des contenus anciens
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              disabled={isRunningArchiving}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunningArchiving ? 'Archivage en cours...' : 'Lancer l\'archivage'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Lancer l'archivage manuel</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action va archiver tous les contenus qui correspondent aux critères définis. 
                Cette opération est irréversible et peut affecter plusieurs contenus.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={runManualArchiving}>
                Confirmer l'archivage
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('tabs.settings')}
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t('tabs.logs')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6">
            {settings.map((setting) => {
              const ContentIcon = CONTENT_TYPES[setting.content_type].icon;
              
              return (
                <Card key={setting.content_type}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ContentIcon className="h-5 w-5" />
                      {CONTENT_TYPES[setting.content_type].name}
                    </CardTitle>
                    <CardDescription>
                      Configuration de l'archivage automatique pour {CONTENT_TYPES[setting.content_type].name.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor={`enabled-${setting.content_type}`}>
                          Archivage automatique activé
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Activer l'archivage automatique pour ce type de contenu
                        </p>
                      </div>
                      <Switch
                        id={`enabled-${setting.content_type}`}
                        checked={setting.auto_archive_enabled}
                        onCheckedChange={(checked) => 
                          updateSettings(setting.content_type, { auto_archive_enabled: checked })
                        }
                      />
                    </div>

                    {setting.auto_archive_enabled && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`days-${setting.content_type}`}>
                            Archiver après (jours)
                          </Label>
                          <Input
                            id={`days-${setting.content_type}`}
                            type="number"
                            min="1"
                            value={setting.archive_after_days}
                            onChange={(e) => 
                              updateSettings(setting.content_type, { 
                                archive_after_days: parseInt(e.target.value) || 365 
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`condition-${setting.content_type}`}>
                            Date de référence
                          </Label>
                          <Select
                            value={setting.archive_condition}
                            onValueChange={(value) => 
                              updateSettings(setting.content_type, { archive_condition: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="published_at">Date de publication</SelectItem>
                              <SelectItem value="created_at">Date de création</SelectItem>
                              <SelectItem value="updated_at">Date de modification</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`min-views-${setting.content_type}`}>
                            Nombre minimum de vues (optionnel)
                          </Label>
                          <Input
                            id={`min-views-${setting.content_type}`}
                            type="number"
                            min="0"
                            placeholder="Laisser vide pour ignorer"
                            value={setting.min_view_count || ''}
                            onChange={(e) => 
                              updateSettings(setting.content_type, { 
                                min_view_count: e.target.value ? parseInt(e.target.value) : null 
                              })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Les contenus avec plus de vues que cette limite ne seront pas archivés
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`exclude-featured-${setting.content_type}`}
                            checked={setting.exclude_featured}
                            onCheckedChange={(checked) => 
                              updateSettings(setting.content_type, { exclude_featured: checked })
                            }
                          />
                          <Label 
                            htmlFor={`exclude-featured-${setting.content_type}`}
                            className="flex items-center gap-2"
                          >
                            <Star className="h-4 w-4" />
                            Exclure les contenus en vedette
                          </Label>
                        </div>
                      </div>
                    )}

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div className="space-y-1">
                    <p className="text-sm">
                      {setting.auto_archive_enabled 
                        ? `Les contenus publiés depuis plus de ${setting.archive_after_days} jours seront automatiquement archivés`
                        : 'L\'archivage automatique est désactivé pour ce type de contenu'
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Note: L'archivage automatique doit être exécuté manuellement ou via un cron job externe.
                    </p>
                  </div>
                </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique d'archivage
              </CardTitle>
              <CardDescription>
                Historique des opérations d'archivage automatique et manuel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contenu</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Raison</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => {
                        const ContentIcon = CONTENT_TYPES[log.content_type as keyof typeof CONTENT_TYPES]?.icon || FileText;
                        
                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <ContentIcon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{log.content_title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {log.old_status} → {log.new_status}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={CONTENT_TYPES[log.content_type as keyof typeof CONTENT_TYPES]?.color}>
                                {CONTENT_TYPES[log.content_type as keyof typeof CONTENT_TYPES]?.name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getActionBadge(log.action)}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{log.reason}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {formatDate(log.executed_at)}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Aucun historique</h3>
                  <p className="text-muted-foreground">
                    Aucune opération d'archivage n'a encore été effectuée
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}