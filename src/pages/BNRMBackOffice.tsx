import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Globe
} from "lucide-react";
import { WatermarkContainer } from "@/components/ui/watermark";
import { AdminHeader } from "@/components/AdminHeader";
import { BNRMDashboard } from "@/components/bnrm/BNRMDashboard";
import { BNRMRequestManager } from "@/components/bnrm/BNRMRequestManager";
import { BNRMNumberAttribution } from "@/components/bnrm/BNRMNumberAttribution";
import { BNRMWorkflowManager } from "@/components/bnrm/BNRMWorkflowManager";
import { BNRMPaymentNotificationSettings } from "@/components/bnrm/BNRMPaymentNotificationSettings";
import { BNRMStatistics } from "@/components/bnrm/BNRMStatistics";
import BNRMEditorialMonitoring from "@/components/bnrm/BNRMEditorialMonitoring";
import { DepositValidationWorkflow } from "@/components/legal-deposit/DepositValidationWorkflow";

export default function BNRMBackOffice() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Bloquer l'accès aux comptes professionnels
  const professionalRoles = ['editor', 'printer', 'producer'];
  if (!profile?.is_approved || (profile?.role !== 'admin' && profile?.role !== 'librarian') || professionalRoles.includes(profile?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM - Système de Gestion du Dépôt Légal", 
        variant: "subtle", 
        position: "pattern",
        opacity: 0.02
      }}
    >
      <div className="min-h-screen bg-background">
        {/* Header standardisé */}
        <AdminHeader 
          title="BNRM - Système BNRM"
          badgeText="Système de Gestion du Dépôt Légal"
          subtitle="Interface de gestion complète du dépôt légal BNRM"
        />

        {/* Main Content */}
        <main className="container py-6">
          <div className="space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {t('bnrm.backoffice.subtitle')}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {t('bnrm.backoffice.subtitle')}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('reports')}
                  className="hover:bg-accent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('bnrm.reports.btn')}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('/', '_blank')}
                  className="hover:bg-accent"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  {t('bnrm.publicPortal.btn')}
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full flex flex-wrap justify-start gap-1 h-auto p-2 bg-muted">
                <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <BarChart3 className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Tableau de bord</span>
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Demandes en Attente</span>
                </TabsTrigger>
                <TabsTrigger value="attribution" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <Hash className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Attributions</span>
                </TabsTrigger>
                <TabsTrigger value="deposits" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <Archive className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Dépôts</span>
                </TabsTrigger>
                <TabsTrigger value="workflow" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Workflow</span>
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <BarChart3 className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Statistiques</span>
                </TabsTrigger>
                <TabsTrigger value="editorial-monitoring" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <Search className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Veille</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <Bell className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                  <Database className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:inline">Rapports</span>
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-4">
                <BNRMDashboard />
              </TabsContent>

              {/* Request Management Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex justify-end mb-4">
              <CreateTestDepositButton />
            </div>
            <DepositValidationWorkflow />
          </TabsContent>

              {/* Number Attribution Tab */}
              <TabsContent value="attribution" className="space-y-4">
                <BNRMNumberAttribution />
              </TabsContent>

              {/* Document Deposits Tab */}
              <TabsContent value="deposits" className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Archive className="h-5 w-5" />
                        <span>Dépôts Physiques</span>
                      </CardTitle>
                      <CardDescription>
                        Réception et traitement des exemplaires papier
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="bg-background rounded-lg border p-4">
                            <h4 className="font-semibold text-sm mb-2">En attente de réception</h4>
                            <div className="text-2xl font-bold text-orange-600">15</div>
                            <p className="text-xs text-muted-foreground">Publications attendues</p>
                          </div>
                          <div className="bg-background rounded-lg border p-4">
                            <h4 className="font-semibold text-sm mb-2">Reçus aujourd'hui</h4>
                            <div className="text-2xl font-bold text-green-600">8</div>
                            <p className="text-xs text-muted-foreground">Exemplaires reçus</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => {
                              toast({
                                title: "Registre des entrées",
                                description: "Consultation du registre des dépôts physiques reçus"
                              });
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Registre des entrées
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => {
                              toast({
                                title: "Vérification de conformité",
                                description: "Lancement du contrôle de conformité des dépôts"
                              });
                            }}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Vérifier conformité
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => {
                              toast({
                                title: "Génération d'accusé de réception",
                                description: "Document d'accusé de réception généré avec succès"
                              });
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Générer accusé réception
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Database className="h-5 w-5" />
                        <span>Dépôts Numériques</span>
                      </CardTitle>
                      <CardDescription>
                        Gestion des fichiers et métadonnées numériques
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="bg-background rounded-lg border p-4">
                            <h4 className="font-semibold text-sm mb-2">Fichiers en cours</h4>
                            <div className="text-2xl font-bold text-blue-600">23</div>
                            <p className="text-xs text-muted-foreground">En validation technique</p>
                          </div>
                          <div className="bg-background rounded-lg border p-4">
                            <h4 className="font-semibold text-sm mb-2">Archivés</h4>
                            <div className="text-2xl font-bold text-purple-600">1,247</div>
                            <p className="text-xs text-muted-foreground">Documents numériques</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => {
                              toast({
                                title: "Contrôle des formats et tailles",
                                description: "Vérification en cours des formats de fichiers et tailles"
                              });
                            }}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Contrôle formats/tailles
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => {
                              toast({
                                title: "Vérification d'intégrité",
                                description: "Contrôle de l'intégrité des fichiers numériques en cours"
                              });
                            }}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Vérification intégrité
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => {
                              toast({
                                title: "Archivage pérenne",
                                description: "Processus d'archivage à long terme démarré"
                              });
                            }}
                          >
                            <Database className="h-4 w-4 mr-2" />
                            Archivage pérenne
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Suivi des Conformités et Non-Conformités</CardTitle>
                    <CardDescription>
                      Tableau de bord des contrôles qualité des dépôts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">N° Dépôt</th>
                            <th className="text-left p-2">Publication</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Statut</th>
                            <th className="text-left p-2">Date contrôle</th>
                            <th className="text-left p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-2">DL-2024-001234</td>
                            <td className="p-2">Guide du développeur React</td>
                            <td className="p-2">Livre</td>
                            <td className="p-2">
                              <Badge variant="default" className="bg-green-100 text-green-800">Conforme</Badge>
                            </td>
                            <td className="p-2">15/03/2024</td>
                            <td className="p-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Détails du dépôt",
                                    description: "Affichage des détails du dépôt DL-2024-001234"
                                  });
                                }}
                              >
                                Voir détails
                              </Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">DL-2024-001235</td>
                            <td className="p-2">Magazine Tech Innovation</td>
                            <td className="p-2">Périodique</td>
                            <td className="p-2">
                              <Badge variant="destructive">Non conforme</Badge>
                            </td>
                            <td className="p-2">14/03/2024</td>
                            <td className="p-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Correction nécessaire",
                                    description: "Formulaire de correction pour le dépôt DL-2024-001235"
                                  });
                                }}
                              >
                                Corriger
                              </Button>
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">DL-2024-001236</td>
                            <td className="p-2">Atlas historique du Maroc</td>
                            <td className="p-2">Livre</td>
                            <td className="p-2">
                              <Badge variant="secondary">En cours</Badge>
                            </td>
                            <td className="p-2">13/03/2024</td>
                            <td className="p-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Validation du dépôt",
                                    description: "Dépôt DL-2024-001236 validé avec succès"
                                  });
                                }}
                              >
                                Valider
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Workflow Management Tab */}
              <TabsContent value="workflow" className="space-y-4">
                <BNRMWorkflowManager />
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="statistics" className="space-y-4">
                <BNRMStatistics />
              </TabsContent>

              {/* Editorial Monitoring Tab */}
              <TabsContent value="editorial-monitoring" className="space-y-4">
                <BNRMEditorialMonitoring />
              </TabsContent>

              {/* Payment Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4">
                <BNRMPaymentNotificationSettings />
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Database className="h-5 w-5" />
                        <span>Rapports Statistiques</span>
                      </CardTitle>
                      <CardDescription>
                        Tableaux de bord interactifs et export de données
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Rapport mensuel agence ISBN
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Rapport centre international ISSN
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Archive className="h-4 w-4 mr-2" />
                          Statistiques de dépôt par type
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Users className="h-4 w-4 mr-2" />
                          Rapport activité éditeurs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Search className="h-5 w-5" />
                        <span>Filtres Avancés</span>
                      </CardTitle>
                      <CardDescription>
                        Recherche multicritères et exports personnalisés
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          Filtrer par période
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Filtrer par éditeur
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Filtrer par type de support
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Export Excel personnalisé
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Aperçu des statistiques globales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">2,847</div>
                        <div className="text-sm text-muted-foreground">Demandes traitées</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">1,234</div>
                        <div className="text-sm text-muted-foreground">ISBN attribués</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">87</div>
                        <div className="text-sm text-muted-foreground">ISSN attribués</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">2.3j</div>
                        <div className="text-sm text-muted-foreground">Délai moyen</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </WatermarkContainer>
  );
}