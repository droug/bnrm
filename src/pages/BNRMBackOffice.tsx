import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateTestDepositButton } from "@/components/admin/CreateTestDepositButton";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Settings,
  BarChart3,
  FileText,
  Hash,
  Archive,
  Users,
  Bell,
  Shield,
  BookOpen,
  Database,
  Download,
  Search,
  Globe,
  FileBarChart,
  TrendingUp,
  Clock
} from "lucide-react";
import { 
  generateISBNMonthlyReport,
  generateISSNReport,
  generateDepositTypeStats,
  generatePublishersActivityReport
} from "@/components/bnrm/BNRMReportsGenerator";
import { WatermarkContainer } from "@/components/ui/watermark";
import { AdminHeader } from "@/components/AdminHeader";
import { BNRMDashboard } from "@/components/bnrm/BNRMDashboard";
import { BNRMRequestManager } from "@/components/bnrm/BNRMRequestManager";
import { BNRMNumberAttribution } from "@/components/bnrm/BNRMNumberAttribution";
import { BNRMPaymentNotificationSettings } from "@/components/bnrm/BNRMPaymentNotificationSettings";
import { BNRMStatistics } from "@/components/bnrm/BNRMStatistics";
import BNRMEditorialMonitoring from "@/components/bnrm/BNRMEditorialMonitoring";
import { HistoryRangesView } from "@/components/legal-deposit/HistoryRangesView";
import { DepositValidationWorkflow } from "@/components/legal-deposit/DepositValidationWorkflow";
import { AdminBackOfficeHeader } from "@/components/admin/AdminBackOfficeHeader";
import { AdminBackOfficeNavigation } from "@/components/admin/AdminBackOfficeNavigation";
import { AdminBackOfficeStats } from "@/components/admin/AdminBackOfficeStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function BNRMBackOffice() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const { isAdmin, isLibrarian, isProfessional, loading: rolesLoading } = useSecureRoles();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDepositModal, setSelectedDepositModal] = useState<string | null>(null);
  const [selectedDepositData, setSelectedDepositData] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{type: string, data?: any} | null>(null);
  const [documentForm, setDocumentForm] = useState<{type: string, data?: any} | null>(null);

  // Fetch stats for the header
  const { data: statsData } = useQuery({
    queryKey: ['admin-depot-legal-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_deposit_requests')
        .select('status, arbitration_status, validated_by_department', { count: 'exact' });
      
      if (error) throw error;
      
      const requests = (data || []) as { status: string | null; arbitration_status: string | null; validated_by_department: string | null }[];
      
      // Demandes en attente: status en cours de traitement ET pas encore validées par ABN
      // OU demandes approuvées par arbitrage sans validation ABN
      const pending = requests.filter(r => {
        const hasNoPendingStatus = ['soumis', 'en_cours', 'en_attente_validation_b', 'en_attente_comite_validation'].includes(r.status || '');
        const isArbitrationPending = r.arbitration_status === 'approved' && !r.validated_by_department;
        return (hasNoPendingStatus && !r.validated_by_department) || isArbitrationPending;
      }).length;
      
      // Demandes validées: status attribue OU validated_by_department non null
      const validated = requests.filter(r => r.status === 'attribue' || r.validated_by_department).length;
      const rejected = requests.filter(r => ['rejete', 'rejete_par_b', 'rejete_par_comite'].includes(r.status || '')).length;
      const attributed = requests.filter(r => r.status === 'attribue').length;
      
      return {
        totalRequests: requests.length,
        pendingRequests: pending,
        validatedRequests: validated,
        rejectedRequests: rejected,
        attributedNumbers: attributed,
        monthlyGrowth: 12 // placeholder
      };
    }
  });

  // Fetch counts for navigation badges
  const { data: navCounts } = useQuery({
    queryKey: ['admin-depot-legal-nav-counts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('legal_deposit_requests')
        .select('status, arbitration_status, validated_by_department');
      
      const requests = (data || []) as { status: string | null; arbitration_status: string | null; validated_by_department: string | null }[];
      return {
        // Demandes en attente: pas encore validées par ABN
        pending: requests.filter(r => {
          const isPendingStatus = ['soumis', 'en_cours', 'en_attente_validation_b'].includes(r.status || '');
          const isArbitrationPending = r.arbitration_status === 'approved' && !r.validated_by_department;
          return (isPendingStatus && !r.validated_by_department) || isArbitrationPending;
        }).length,
        // Demandes validées
        validated: requests.filter(r => r.status === 'attribue' || r.validated_by_department).length,
        // À attribuer: validées mais pas encore attribuées
        toAttribute: requests.filter(r => 
          (r.validated_by_department && r.status !== 'attribue') ||
          (r.arbitration_status === 'approved' && !r.validated_by_department)
        ).length,
      };
    }
  });

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Utiliser useSecureRoles() pour vérifier les accès (sécurisé via user_roles table)
  // Les administrateurs ont accès même sans profil approuvé
  // Les bibliothécaires doivent avoir un profil approuvé
  // Les validateurs utilisent /my-space pour l'arbitrage
  // Bloquer l'accès aux comptes professionnels
  const hasAccess = isAdmin || (isLibrarian && profile?.is_approved);
  
  if (!hasAccess || isProfessional) {
    return <Navigate to="/dashboard" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <BNRMDashboard />;
      case 'requests':
        return (
          <>
            <div className="flex justify-end mb-6">
              <CreateTestDepositButton />
            </div>
            <DepositValidationWorkflow />
          </>
        );
      case 'attribution':
        return <BNRMNumberAttribution />;
      case 'editorial-monitoring':
        return <BNRMEditorialMonitoring />;
      case 'notifications':
        return <BNRMPaymentNotificationSettings />;
      case 'statistics':
        return <BNRMStatistics />;
      case 'history':
        return <HistoryRangesView />;
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <span>Rapports Statistiques</span>
                  </CardTitle>
                  <CardDescription>
                    Tableaux de bord interactifs et export de données
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                      onClick={generateISBNMonthlyReport}
                    >
                      <BarChart3 className="h-4 w-4 mr-3 text-primary" />
                      Rapport mensuel agence ISBN
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                      onClick={generateISSNReport}
                    >
                      <FileText className="h-4 w-4 mr-3 text-primary" />
                      Rapport centre international ISSN
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                      onClick={generateDepositTypeStats}
                    >
                      <FileBarChart className="h-4 w-4 mr-3 text-primary" />
                      Statistiques de dépôt par type
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-12 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                      onClick={generatePublishersActivityReport}
                    >
                      <TrendingUp className="h-4 w-4 mr-3 text-primary" />
                      Rapport activité éditeurs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Search className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Filtres Avancés</span>
                  </CardTitle>
                  <CardDescription>
                    Recherche multicritères et exports personnalisés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start h-12 hover:bg-blue-500/5 hover:border-blue-500/30 transition-colors">
                      <Clock className="h-4 w-4 mr-3 text-blue-600" />
                      Filtrer par période
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 hover:bg-blue-500/5 hover:border-blue-500/30 transition-colors">
                      <Users className="h-4 w-4 mr-3 text-blue-600" />
                      Filtrer par éditeur
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 hover:bg-blue-500/5 hover:border-blue-500/30 transition-colors">
                      <Archive className="h-4 w-4 mr-3 text-blue-600" />
                      Filtrer par type de support
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 hover:bg-blue-500/5 hover:border-blue-500/30 transition-colors">
                      <Download className="h-4 w-4 mr-3 text-blue-600" />
                      Export Excel personnalisé
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span>Aperçu des statistiques globales</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="text-center p-4 rounded-xl bg-card shadow-sm border">
                    <div className="text-3xl font-bold text-primary">{statsData?.totalRequests || 0}</div>
                    <div className="text-sm text-muted-foreground mt-1">Demandes traitées</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card shadow-sm border">
                    <div className="text-3xl font-bold text-emerald-600">{statsData?.validatedRequests || 0}</div>
                    <div className="text-sm text-muted-foreground mt-1">Validées</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card shadow-sm border">
                    <div className="text-3xl font-bold text-blue-600">{statsData?.attributedNumbers || 0}</div>
                    <div className="text-sm text-muted-foreground mt-1">N° attribués</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card shadow-sm border">
                    <div className="text-3xl font-bold text-purple-600">2.3j</div>
                    <div className="text-sm text-muted-foreground mt-1">Délai moyen</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <BNRMDashboard />;
    }
  };

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM - Système de Gestion du Dépôt Légal", 
        variant: "subtle", 
        position: "pattern",
        opacity: 0.02
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-blue-50/30">
        {/* Header standardisé */}
        <AdminHeader 
          title="BNRM - Système BNRM"
          badgeText="Système de Gestion du Dépôt Légal"
          subtitle="Interface de gestion complète du dépôt légal BNRM"
          backPath="/admin/settings"
        />

        {/* Main Content */}
        <main className="container py-8">
          <div className="space-y-6">
            {/* Header inspiré de MySpace */}
            <AdminBackOfficeHeader 
              title="Gestion du Dépôt Légal"
              subtitle="Interface de gestion complète du dépôt légal BNRM"
              badgeText="Administration"
            />

            {/* Stats Cards inspirées de MySpace */}
            <AdminBackOfficeStats 
              stats={statsData || {
                totalRequests: 0,
                pendingRequests: 0,
                validatedRequests: 0,
                rejectedRequests: 0,
                attributedNumbers: 0,
                monthlyGrowth: 0
              }}
              loading={!statsData}
            />

            {/* Layout en grille: Navigation sidebar + Contenu */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <AdminBackOfficeNavigation 
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  counts={navCounts || { pending: 0, validated: 0, toAttribute: 0 }}
                />
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    {renderContent()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {/* Modales pour les différentes actions */}
        <Dialog open={selectedDepositModal === "registre"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registre des Entrées - Dépôts Physiques</DialogTitle>
              <DialogDescription>
                Consultation et gestion des dépôts physiques reçus
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Date de début</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Date de fin</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Entrées récentes</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>DL-2024-001234 - Guide du développeur React</span>
                    <Badge>Reçu</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>DL-2024-001235 - Magazine Tech Innovation</span>
                    <Badge variant="secondary">En attente</Badge>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Fermer</Button>
                <Button>Exporter le registre</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={selectedDepositModal === "conformite"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vérification de Conformité</DialogTitle>
              <DialogDescription>
                Contrôle de conformité des dépôts physiques
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Numéro de dépôt</Label>
                <Input placeholder="DL-YYYY-NNNNNN" />
              </div>
              <div className="space-y-2">
                <Label>Éléments à vérifier</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="check1" />
                    <label htmlFor="check1">Exemplaires complets (nombre requis)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="check2" />
                    <label htmlFor="check2">Page de garde conforme</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="check3" />
                    <label htmlFor="check3">ISBN/ISSN présent</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="check4" />
                    <label htmlFor="check4">Mentions légales complètes</label>
                  </div>
                </div>
              </div>
              <div>
                <Label>Observations</Label>
                <Textarea placeholder="Notes sur la conformité..." rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Annuler</Button>
                <Button variant="destructive">Non conforme</Button>
                <Button>Conforme</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={selectedDepositModal === "accuse"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Générer Accusé de Réception</DialogTitle>
              <DialogDescription>
                Génération du document d'accusé de réception
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Numéro de dépôt</Label>
                <Input placeholder="DL-YYYY-NNNNNN" />
              </div>
              <div>
                <Label>Date de réception</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Nombre d'exemplaires reçus</Label>
                <Input type="number" defaultValue="2" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Annuler</Button>
                <Button><Download className="h-4 w-4 mr-2" />Générer PDF</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={selectedDepositModal === "formats"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Contrôle des Formats et Tailles</DialogTitle>
              <DialogDescription>
                Vérification technique des fichiers numériques
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Fichiers en attente de validation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium">document_1.pdf</p>
                      <p className="text-sm text-muted-foreground">2.3 MB - PDF/A-1b</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Conforme</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium">couverture.jpg</p>
                      <p className="text-sm text-muted-foreground">1.8 MB - JPEG</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Conforme</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <p className="font-medium">metadata.xml</p>
                      <p className="text-sm text-muted-foreground">45 KB - XML</p>
                    </div>
                    <Badge variant="destructive">Format non supporté</Badge>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Fermer</Button>
                <Button>Valider les fichiers conformes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={selectedDepositModal === "integrite"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vérification d'Intégrité</DialogTitle>
              <DialogDescription>
                Contrôle de l'intégrité des fichiers numériques
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Numéro de dépôt</Label>
                <Input placeholder="DL-YYYY-NNNNNN" />
              </div>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span>Calcul checksum MD5</span>
                  <Badge className="bg-green-100 text-green-800">OK</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Vérification signature numérique</span>
                  <Badge className="bg-green-100 text-green-800">OK</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Scan antivirus</span>
                  <Badge className="bg-green-100 text-green-800">Propre</Badge>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Fermer</Button>
                <Button>Générer rapport d'intégrité</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={selectedDepositModal === "archivage"} onOpenChange={() => setSelectedDepositModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archivage Pérenne</DialogTitle>
              <DialogDescription>
                Configuration de l'archivage à long terme
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Numéro de dépôt</Label>
                <Input placeholder="DL-YYYY-NNNNNN" />
              </div>
              <div>
                <Label>Format de préservation</Label>
                <select className="w-full border rounded-md p-2">
                  <option>PDF/A-2b</option>
                  <option>TIFF (non compressé)</option>
                  <option>JPEG2000</option>
                </select>
              </div>
              <div>
                <Label>Niveau de redondance</Label>
                <select className="w-full border rounded-md p-2">
                  <option>Triple (recommandé)</option>
                  <option>Double</option>
                  <option>Simple</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Annuler</Button>
                <Button>Lancer l'archivage</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Sheet open={selectedDepositModal === "details"} onOpenChange={() => setSelectedDepositModal(null)}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Détails du Dépôt</SheetTitle>
              <SheetDescription>
                Informations complètes sur le dépôt {selectedDepositData?.number}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Numéro de dépôt</Label>
                  <p className="font-medium">{selectedDepositData?.number}</p>
                </div>
                <div>
                  <Label>Titre</Label>
                  <p className="font-medium">{selectedDepositData?.title}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="font-medium">{selectedDepositData?.type}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge className="bg-green-100 text-green-800">{selectedDepositData?.status}</Badge>
                </div>
              </div>
              <div>
                <Label>Historique</Label>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Dépôt enregistré</span>
                    <span className="text-sm text-muted-foreground">15/03/2024 10:30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Contrôle de conformité</span>
                    <span className="text-sm text-muted-foreground">15/03/2024 14:20</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Validation finale</span>
                    <span className="text-sm text-muted-foreground">15/03/2024 16:45</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedDepositModal(null)}>Fermer</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* AlertDialog pour confirmations */}
        <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction?.type === 'archivage_perenne' && 'Confirmer l\'archivage pérenne'}
                {confirmAction?.type === 'valider_conformite' && 'Valider la conformité'}
                {confirmAction?.type === 'rejeter_depot' && 'Rejeter le dépôt'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction?.type === 'archivage_perenne' && 
                  'Êtes-vous sûr de vouloir procéder à l\'archivage pérenne de ce dépôt numérique ? Cette action est irréversible.'
                }
                {confirmAction?.type === 'valider_conformite' && 
                  `Confirmer la validation de conformité pour le dépôt "${confirmAction.data?.numero}" ?`
                }
                {confirmAction?.type === 'rejeter_depot' && 
                  `Confirmer le rejet du dépôt "${confirmAction.data?.numero}" ? Le déposant sera notifié.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                toast({
                  title: "Action confirmée",
                  description: "L'opération a été effectuée avec succès."
                });
                setConfirmAction(null);
              }}>
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog pour formulaires de documents */}
        <Dialog open={!!documentForm} onOpenChange={() => setDocumentForm(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {documentForm?.type === 'registre_entrees' && 'Registre des entrées'}
                {documentForm?.type === 'accuse_reception' && 'Accusé de réception'}
                {documentForm?.type === 'correction_demande' && 'Demande de correction'}
                {documentForm?.type === 'rapport_conformite' && 'Rapport de conformité'}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations nécessaires pour générer le document
              </DialogDescription>
            </DialogHeader>

            {/* Formulaire Registre des entrées */}
            {documentForm?.type === 'registre_entrees' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date d'entrée</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="space-y-2">
                    <Label>Numéro d'enregistrement</Label>
                    <Input placeholder="AUTO-GÉNÉRÉ" disabled />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Déposant</Label>
                  <Input placeholder="Nom du déposant" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type de document</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="livre">Livre</SelectItem>
                        <SelectItem value="periodique">Périodique</SelectItem>
                        <SelectItem value="these">Thèse</SelectItem>
                        <SelectItem value="audiovisuel">Audiovisuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre d'exemplaires</Label>
                    <Input type="number" min="1" defaultValue="2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Titre de l'œuvre</Label>
                  <Input placeholder="Titre complet" />
                </div>

                <div className="space-y-2">
                  <Label>ISBN/ISSN</Label>
                  <Input placeholder="Ex: 978-3-16-148410-0" />
                </div>

                <div className="space-y-2">
                  <Label>Observations</Label>
                  <Textarea placeholder="Remarques particulières..." rows={3} />
                </div>
              </div>
            )}

            {/* Formulaire Accusé de réception */}
            {documentForm?.type === 'accuse_reception' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Destinataire</Label>
                  <Input placeholder="Nom du déposant" />
                </div>
                
                <div className="space-y-2">
                  <Label>Adresse email</Label>
                  <Input type="email" placeholder="email@example.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de réception</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="space-y-2">
                    <Label>Numéro de dépôt</Label>
                    <Input placeholder="Ex: DL-2025-001" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Documents reçus</Label>
                  <Textarea 
                    placeholder="Liste des documents reçus..."
                    rows={4}
                    defaultValue="- 2 exemplaires du livre&#10;- Formulaire de dépôt légal complété&#10;- Pièce d'identité du déposant"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Format de génération</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="both">PDF + Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message personnalisé (optionnel)</Label>
                  <Textarea placeholder="Message additionnel..." rows={3} />
                </div>
              </div>
            )}

            {/* Formulaire Demande de correction */}
            {documentForm?.type === 'correction_demande' && (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm"><strong>Dépôt :</strong> {documentForm.data?.numero}</p>
                  <p className="text-sm"><strong>Type :</strong> {documentForm.data?.type}</p>
                </div>

                <div className="space-y-2">
                  <Label>Type de non-conformité</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exemplaires_manquants">Exemplaires manquants</SelectItem>
                      <SelectItem value="documents_incomplets">Documents incomplets</SelectItem>
                      <SelectItem value="qualite_insuffisante">Qualité insuffisante</SelectItem>
                      <SelectItem value="metadata_incorrectes">Métadonnées incorrectes</SelectItem>
                      <SelectItem value="format_invalide">Format invalide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description détaillée</Label>
                  <Textarea 
                    placeholder="Décrivez précisément les éléments à corriger..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Actions requises</Label>
                  <Textarea 
                    placeholder="Listez les actions à effectuer par le déposant..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Délai de correction (jours)</Label>
                  <Input type="number" min="1" defaultValue="15" />
                </div>

                <div className="space-y-2">
                  <Label>Mode de notification</Label>
                  <Select defaultValue="email">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="courrier">Courrier postal</SelectItem>
                      <SelectItem value="both">Email + Courrier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Formulaire Rapport de conformité */}
            {documentForm?.type === 'rapport_conformite' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Numéro de dépôt</Label>
                  <Input defaultValue={documentForm.data?.numero} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Statut de conformité</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conforme">Conforme</SelectItem>
                      <SelectItem value="conforme_reserve">Conforme avec réserves</SelectItem>
                      <SelectItem value="non_conforme">Non conforme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Points vérifiés</Label>
                  <Textarea 
                    rows={6}
                    defaultValue="✓ Nombre d'exemplaires règlementaire&#10;✓ Qualité de l'impression&#10;✓ Complétude des métadonnées&#10;✓ Respect des formats&#10;✓ Documentation accompagnatrice"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observations</Label>
                  <Textarea placeholder="Remarques générales..." rows={4} />
                </div>

                <div className="space-y-2">
                  <Label>Validé par</Label>
                  <Input placeholder="Nom du validateur" />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDocumentForm(null)}>
                Annuler
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Document généré",
                  description: "Le document a été créé avec succès."
                });
                setDocumentForm(null);
              }}>
                <FileText className="h-4 w-4 mr-2" />
                Générer le document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WatermarkContainer>
  );
}