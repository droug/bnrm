import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { BNRMDashboard } from "@/components/bnrm/BNRMDashboard";
import { BNRMRequestManager } from "@/components/bnrm/BNRMRequestManager";
import { BNRMNumberAttribution } from "@/components/bnrm/BNRMNumberAttribution";
import { BNRMWorkflowManager } from "@/components/bnrm/BNRMWorkflowManager";

export default function BNRMBackOffice() {
  const { user, profile, loading } = useAuth();
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

  if (!profile?.is_approved || (profile?.role !== 'admin' && profile?.role !== 'librarian')) {
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
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour</span>
              </Button>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">BNRM - Système BNRM</span>
                <Badge variant="outline" className="ml-2">
                  Système de Gestion du Dépôt Légal
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {profile?.first_name} {profile?.last_name}
                </span>
                <Badge variant="default">
                  {profile?.role === 'admin' ? 'Administrateur' : 'Agent DL'}
                </Badge>
              </div>
              
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Notifications</span>
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Paramètres</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-6">
          <div className="space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  BNRM - Dépôt Légal
                </h1>
                <p className="text-muted-foreground mt-2">
                  Interface de gestion complète pour le processus de dépôt légal conforme aux exigences CPS
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab('reports')}
                  className="hover:bg-accent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Rapports
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('/', '_blank')}
                  className="hover:bg-accent"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Portail Public
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden lg:inline">Tableau de bord</span>
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden lg:inline">Demandes</span>
                </TabsTrigger>
                <TabsTrigger value="attribution" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  <span className="hidden lg:inline">Attribution</span>
                </TabsTrigger>
                <TabsTrigger value="deposits" className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  <span className="hidden lg:inline">Dépôts</span>
                </TabsTrigger>
                <TabsTrigger value="workflow" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden lg:inline">Workflow</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="hidden lg:inline">Rapports</span>
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-4">
                <BNRMDashboard />
              </TabsContent>

              {/* Request Management Tab */}
              <TabsContent value="requests" className="space-y-4">
                <BNRMRequestManager />
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
                          <Button variant="outline" className="w-full justify-start">
                            <FileText className="h-4 w-4 mr-2" />
                            Registre des entrées
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Search className="h-4 w-4 mr-2" />
                            Vérifier conformité
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
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
                          <Button variant="outline" className="w-full justify-start">
                            <Archive className="h-4 w-4 mr-2" />
                            Contrôle formats/tailles
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Shield className="h-4 w-4 mr-2" />
                            Vérification intégrité
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
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
                              <Button variant="ghost" size="sm">Voir détails</Button>
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
                              <Button variant="ghost" size="sm">Corriger</Button>
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
                              <Button variant="ghost" size="sm">Valider</Button>
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