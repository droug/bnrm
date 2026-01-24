import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  RefreshCw,
  User,
  Activity,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shield,
  Calendar,
  BarChart3,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminHeader } from "@/components/AdminHeader";
import {
  useAuditLogs,
  useAuditLogFilterOptions,
  useAuditStats,
  AuditLogEntry,
  AuditLogFilters,
} from "@/hooks/useAuditLogs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const ACTION_LABELS: Record<string, string> = {
  // Gestion de contenu
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  publish: 'Publication',
  unpublish: 'Dépublication',
  archive: 'Archivage',
  restore: 'Restauration',
  duplicate: 'Duplication',
  move: 'Déplacement',
  reorder: 'Réorganisation',
  
  // Authentification & Sécurité
  login: 'Connexion',
  logout: 'Déconnexion',
  login_failed: 'Échec de connexion',
  password_change: 'Changement mot de passe',
  password_reset: 'Réinitialisation mot de passe',
  email_change: 'Changement d\'email',
  two_factor_enable: 'Activation 2FA',
  two_factor_disable: 'Désactivation 2FA',
  session_revoke: 'Révocation de session',
  account_lock: 'Verrouillage compte',
  account_unlock: 'Déverrouillage compte',
  account_suspend: 'Suspension compte',
  account_activate: 'Activation compte',
  
  // Gestion des utilisateurs
  role_change: 'Changement de rôle',
  role_assign: 'Attribution de rôle',
  role_revoke: 'Révocation de rôle',
  permission_grant: 'Attribution de permission',
  permission_revoke: 'Révocation de permission',
  user_invite: 'Invitation utilisateur',
  user_register: 'Inscription utilisateur',
  profile_update: 'Mise à jour profil',
  
  // Workflow & Validation
  approve: 'Approbation',
  reject: 'Rejet',
  submit: 'Soumission',
  cancel: 'Annulation',
  assign: 'Assignation',
  reassign: 'Réassignation',
  escalate: 'Escalade',
  return: 'Retour',
  complete: 'Complétion',
  validate: 'Validation',
  invalidate: 'Invalidation',
  review: 'Révision',
  sign: 'Signature',
  countersign: 'Contre-signature',
  
  // Documents & Fichiers
  upload: 'Téléversement',
  download: 'Téléchargement',
  view: 'Consultation',
  print: 'Impression',
  share: 'Partage',
  unshare: 'Retrait partage',
  convert: 'Conversion',
  ocr_process: 'Traitement OCR',
  transcribe: 'Transcription',
  digitize: 'Numérisation',
  
  // Import/Export
  export: 'Export',
  import: 'Import',
  bulk_import: 'Import en masse',
  bulk_export: 'Export en masse',
  sync: 'Synchronisation',
  backup: 'Sauvegarde',
  restore_backup: 'Restauration sauvegarde',
  
  // Configuration système
  config_change: 'Modification configuration',
  settings_update: 'Mise à jour paramètres',
  cleanup_old_logs: 'Nettoyage logs',
  maintenance_start: 'Début maintenance',
  maintenance_end: 'Fin maintenance',
  cache_clear: 'Vidage cache',
  index_rebuild: 'Reconstruction index',
  
  // Paiements & Transactions
  payment_create: 'Création paiement',
  payment_complete: 'Paiement effectué',
  payment_cancel: 'Annulation paiement',
  payment_refund: 'Remboursement',
  subscription_start: 'Début abonnement',
  subscription_renew: 'Renouvellement abonnement',
  subscription_cancel: 'Annulation abonnement',
  invoice_generate: 'Génération facture',
  wallet_topup: 'Rechargement portefeuille',
  wallet_debit: 'Débit portefeuille',
  
  // Communications
  email_send: 'Envoi email',
  sms_send: 'Envoi SMS',
  notification_send: 'Envoi notification',
  newsletter_send: 'Envoi newsletter',
  
  // Réservations & Services
  book: 'Réservation',
  check_in: 'Enregistrement',
  check_out: 'Restitution',
  extend: 'Prolongation',
  reserve: 'Réserver',
  
  // Recherche & Analytics
  search: 'Recherche',
  search_advanced: 'Recherche avancée',
  report_generate: 'Génération rapport',
  analytics_view: 'Consultation analytics',
  
  // Traduction
  translate: 'Traduction',
  translate_auto: 'Traduction automatique',
  translate_validate: 'Validation traduction',
  
  // Autres
  comment: 'Commentaire',
  note_add: 'Ajout note',
  tag_add: 'Ajout tag',
  tag_remove: 'Retrait tag',
  link: 'Liaison',
  unlink: 'Déliaison',
  merge: 'Fusion',
  split: 'Séparation',
};

const RESOURCE_LABELS: Record<string, string> = {
  // Utilisateurs & Accès
  user: 'Utilisateur',
  profile: 'Profil',
  role: 'Rôle',
  permission: 'Permission',
  session: 'Session',
  access_request: 'Demande d\'accès',
  professional: 'Professionnel',
  subscription: 'Abonnement',
  
  // Contenu éditorial
  content: 'Contenu',
  news: 'Actualité',
  event: 'Événement',
  exhibition: 'Exposition',
  virtual_exhibition: 'Exposition virtuelle',
  banner: 'Bannière',
  footer: 'Pied de page',
  page: 'Page',
  menu: 'Menu',
  slider: 'Slider',
  gallery: 'Galerie',
  
  // Documents & Catalogue
  document: 'Document',
  manuscript: 'Manuscrit',
  book: 'Livre',
  periodical: 'Périodique',
  map: 'Carte',
  photo: 'Photo',
  audio: 'Audio',
  video: 'Vidéo',
  catalog_record: 'Notice catalogue',
  metadata: 'Métadonnées',
  
  // Dépôt légal
  deposit: 'Dépôt légal',
  deposit_book: 'Dépôt livre',
  deposit_periodical: 'Dépôt périodique',
  deposit_multimedia: 'Dépôt multimédia',
  deposit_electronic: 'Dépôt électronique',
  depositor: 'Déposant',
  
  // Services
  booking: 'Réservation espace',
  reservation: 'Réservation ouvrage',
  reproduction: 'Reproduction',
  restoration: 'Restauration',
  loan: 'Prêt',
  consultation: 'Consultation',
  
  // CBM - Catalogue collectif
  cbm_record: 'Notice CBM',
  cbm_library: 'Bibliothèque CBM',
  cbm_adhesion: 'Adhésion CBM',
  cbm_formation: 'Formation CBM',
  
  // Workflows
  workflow: 'Workflow',
  workflow_step: 'Étape workflow',
  workflow_instance: 'Instance workflow',
  task: 'Tâche',
  
  // Traductions
  translation: 'Traduction',
  translation_batch: 'Lot de traductions',
  
  // Paiements
  payment: 'Paiement',
  invoice: 'Facture',
  wallet: 'Portefeuille',
  tariff: 'Tarif',
  service_tariff: 'Tarif service',
  
  // Communications
  email: 'Email',
  email_template: 'Modèle email',
  notification: 'Notification',
  newsletter: 'Newsletter',
  sms: 'SMS',
  
  // Système
  system: 'Système',
  config: 'Configuration',
  settings: 'Paramètres',
  backup: 'Sauvegarde',
  log: 'Journal',
  cache: 'Cache',
  index: 'Index',
  
  // Activités culturelles
  cultural_activity: 'Activité culturelle',
  program: 'Programme',
  activity_type: 'Type d\'activité',
  
  // Espaces
  cultural_space: 'Espace culturel',
  equipment: 'Équipement',
  space_service: 'Service espace',
  
  // Listes & Références
  autocomplete_list: 'Liste autocomplete',
  list_value: 'Valeur liste',
  category: 'Catégorie',
  tag: 'Tag',
  
  // Chatbot & IA
  chatbot: 'Chatbot',
  chatbot_interaction: 'Interaction chatbot',
  knowledge_base: 'Base de connaissances',
  
  // Analytics
  analytics: 'Analytics',
  report: 'Rapport',
  dashboard: 'Tableau de bord',
  
  // Interconnexions
  external_system: 'Système externe',
  api_key: 'Clé API',
  webhook: 'Webhook',
  sync_job: 'Job de synchronisation',
  
  // Formulaires
  form: 'Formulaire',
  form_field: 'Champ formulaire',
  form_submission: 'Soumission formulaire',
  
  // Cotes & Classifications
  cote: 'Cote',
  collection: 'Collection',
  classification: 'Classification',
};

function getActionBadgeVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  if (action.includes('delete') || action.includes('reject')) return 'destructive';
  if (action.includes('create') || action.includes('approve') || action.includes('publish')) return 'default';
  if (action.includes('update') || action.includes('config')) return 'secondary';
  return 'outline';
}

export default function AuditLogsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [activeTab, setActiveTab] = useState('logs');

  const { data: logsData, isLoading, refetch, isFetching } = useAuditLogs(filters, page);
  const { data: filterOptions } = useAuditLogFilterOptions();
  const { data: stats } = useAuditStats(30);

  const handleFilterChange = (key: keyof AuditLogFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value }));
    setPage(1);
  };

  const handleExport = () => {
    if (!logsData?.logs) return;
    
    const csvContent = [
      ['Date', 'Action', 'Type de ressource', 'ID Ressource', 'Utilisateur', 'IP', 'Détails'].join(','),
      ...logsData.logs.map(log => [
        format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss'),
        log.action,
        log.resource_type,
        log.resource_id || '',
        log.user_email || log.user_id || 'Système',
        log.ip_address || '',
        log.details ? JSON.stringify(log.details).replace(/,/g, ';') : '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        title="Journalisation & Traçabilité"
        subtitle="Historique complet des actions réalisées dans le back-office"
      />

      <main className="container py-8">
        <div className="space-y-6">
          {/* Back button and actions */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/admin/settings")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux paramètres
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Journal des actions
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Statistiques
              </TabsTrigger>
            </TabsList>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select
                      value={filters.action || 'all'}
                      onValueChange={(v) => handleFilterChange('action', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les actions</SelectItem>
                        {filterOptions?.actions.map(action => (
                          <SelectItem key={action} value={action}>
                            {ACTION_LABELS[action] || action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.resource_type || 'all'}
                      onValueChange={(v) => handleFilterChange('resource_type', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type de ressource" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        {filterOptions?.resourceTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {RESOURCE_LABELS[type] || type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="date"
                      placeholder="Date début"
                      value={filters.startDate?.split('T')[0] || ''}
                      onChange={(e) => handleFilterChange('startDate', e.target.value ? `${e.target.value}T00:00:00` : undefined)}
                    />

                    <Input
                      type="date"
                      placeholder="Date fin"
                      value={filters.endDate?.split('T')[0] || ''}
                      onChange={(e) => handleFilterChange('endDate', e.target.value ? `${e.target.value}T23:59:59` : undefined)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Logs Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Historique des actions
                      </CardTitle>
                      <CardDescription>
                        {logsData?.total || 0} entrées trouvées
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : logsData?.logs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune entrée de journal trouvée</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[180px]">Date & Heure</TableHead>
                              <TableHead>Action</TableHead>
                              <TableHead>Ressource</TableHead>
                              <TableHead>Utilisateur</TableHead>
                              <TableHead className="w-[100px]">Détails</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {logsData?.logs.map((log) => (
                              <TableRow key={log.id} className="hover:bg-muted/50">
                                <TableCell className="font-mono text-sm">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getActionBadgeVariant(log.action)}>
                                    {ACTION_LABELS[log.action] || log.action}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {RESOURCE_LABELS[log.resource_type] || log.resource_type}
                                    </span>
                                    {log.resource_id && (
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {log.resource_id.substring(0, 8)}...
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex flex-col">
                                      <span className="text-sm">
                                        {log.user_name || log.user_email || 'Système'}
                                      </span>
                                      {log.ip_address && (
                                        <span className="text-xs text-muted-foreground font-mono">
                                          {log.ip_address}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedLog(log)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {logsData && logsData.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-muted-foreground">
                            Page {page} sur {logsData.totalPages}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(p => Math.max(1, p - 1))}
                              disabled={page === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Précédent
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPage(p => Math.min(logsData.totalPages, p + 1))}
                              disabled={page === logsData.totalPages}
                            >
                              Suivant
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total actions (30 jours)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.total || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Types d'actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.byAction.length || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Types de ressources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.byResourceType.length || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Actions by Day */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Activité journalière
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats?.byDay || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(v) => format(new Date(v), 'dd/MM')}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(v) => format(new Date(v), 'dd MMMM yyyy', { locale: fr })}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions by Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Répartition par action
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats?.byAction.slice(0, 8) || []}
                            dataKey="count"
                            nameKey="action"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ action, percent }) => 
                              `${ACTION_LABELS[action] || action} (${(percent * 100).toFixed(0)}%)`
                            }
                          >
                            {(stats?.byAction || []).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [value, ACTION_LABELS[name as string] || name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Resources by Type */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Actions par type de ressource
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.byResourceType || []} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis 
                            dataKey="type" 
                            type="category" 
                            width={120}
                            tickFormatter={(v) => RESOURCE_LABELS[v] || v}
                          />
                          <Tooltip 
                            formatter={(value, name) => [value, 'Actions']}
                            labelFormatter={(v) => RESOURCE_LABELS[v] || v}
                          />
                          <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Détails de l'action
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur cette entrée du journal
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date & Heure</p>
                  <p className="font-mono">
                    {format(new Date(selectedLog.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Action</p>
                  <Badge variant={getActionBadgeVariant(selectedLog.action)}>
                    {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type de ressource</p>
                  <p>{RESOURCE_LABELS[selectedLog.resource_type] || selectedLog.resource_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID Ressource</p>
                  <p className="font-mono text-sm">{selectedLog.resource_id || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilisateur</p>
                  <p>{selectedLog.user_name || selectedLog.user_email || 'Système'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Adresse IP</p>
                  <p className="font-mono">{selectedLog.ip_address || '-'}</p>
                </div>
              </div>

              {selectedLog.user_agent && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">User Agent</p>
                  <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Détails</p>
                  <ScrollArea className="h-[200px]">
                    <pre className="text-xs font-mono bg-muted p-3 rounded overflow-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
