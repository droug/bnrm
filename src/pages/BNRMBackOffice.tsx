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
                className="flex items-center space-x-2"
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
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Rapports
                </Button>
                <Button variant="outline">
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
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden lg:inline">Utilisateurs</span>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Archive className="h-5 w-5" />
                      <span>Suivi des Dépôts de Documents</span>
                    </CardTitle>
                    <CardDescription>
                      Gestion des exemplaires physiques et numériques déposés
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Module en développement</h3>
                      <p>Interface de gestion des dépôts physiques et numériques</p>
                      <p className="text-sm mt-2">
                        • Vérification de conformité des exemplaires<br/>
                        • Génération d'accusés de réception<br/>
                        • Gestion des non-conformités<br/>
                        • Traçabilité complète des documents
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Workflow Management Tab */}
              <TabsContent value="workflow" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Gestion des Workflows</span>
                    </CardTitle>
                    <CardDescription>
                      Configuration et suivi des processus métier
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Configuration des processus</h3>
                      <p>Interface de paramétrage des workflows de validation</p>
                      <p className="text-sm mt-2">
                        • Définition des étapes de validation<br/>
                        • Assignation des responsabilités<br/>
                        • Gestion des délais et alertes<br/>
                        • Reporting et tableaux de bord
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* User Management Tab */}
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Gestion des Accès</span>
                    </CardTitle>
                    <CardDescription>
                      Authentification 2FA, rôles et permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">Système d'authentification</h3>
                      <p>Gestion avancée des utilisateurs et permissions</p>
                      <p className="text-sm mt-2">
                        • Authentification 2FA sécurisée<br/>
                        • Gestion des rôles (admin, agent DL, validateur)<br/>
                        • Audit trail complet<br/>
                        • Profils utilisateurs personnalisés
                      </p>
                    </div>
                  </CardContent>
                </Card>
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