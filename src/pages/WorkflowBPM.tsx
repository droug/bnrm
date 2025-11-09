import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowDefinitions } from "@/components/workflow/WorkflowDefinitions";
import { WorkflowInstances } from "@/components/workflow/WorkflowInstances";
import { WorkflowMetrics } from "@/components/workflow/WorkflowMetrics";
import { WorkflowIntegrations } from "@/components/workflow/WorkflowIntegrations";
import { WorkflowRolesManager } from "@/components/workflow/WorkflowRolesManager";
import { WorkflowModelsManager } from "@/components/workflow/WorkflowModelsManager";
import { WorkflowDynamicSelects } from "@/components/workflow/WorkflowDynamicSelects";
import { PredefinedWorkflowsImporter } from "@/components/workflow/PredefinedWorkflowsImporter";
import { WorkflowSyncManager } from "@/components/workflow/WorkflowSyncManager";
import { Activity, GitBranch, Settings, TrendingUp, Users, ArrowLeft, FolderKanban, ListFilter, Package, CalendarRange, Building2 } from "lucide-react";
import { BookingWorkflowStepsManager } from "@/components/workflow/BookingWorkflowStepsManager";
import { CBMWorkflowsManager } from "@/components/workflow/CBMWorkflowsManager";

export default function WorkflowBPM() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("predefined");

  // Gérer l'onglet actif depuis l'URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Vérifier si l'utilisateur est admin ou librarian
  const isAuthorized = profile?.role === 'admin' || profile?.role === 'librarian';

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/admin/settings')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour
            </button>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Moteur de Workflows et Circuits de Validation – BNRM
          </h1>
          <p className="text-muted-foreground">
            Gestion centralisée des processus métiers et circuits de validation
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-10 mb-6">
            <TabsTrigger value="predefined">
              <Package className="w-4 h-4 mr-2" />
              Modèles Prédéfinis
            </TabsTrigger>
            <TabsTrigger value="configurator">
              <ListFilter className="w-4 h-4 mr-2" />
              Configurateur
            </TabsTrigger>
            <TabsTrigger value="models">
              <FolderKanban className="w-4 h-4 mr-2" />
              Modèles
            </TabsTrigger>
            <TabsTrigger value="definitions">
              <GitBranch className="w-4 h-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="instances">
              <Activity className="w-4 h-4 mr-2" />
              Instances
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Métriques
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Users className="w-4 h-4 mr-2" />
              Rôles
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Settings className="w-4 h-4 mr-2" />
              Intégrations
            </TabsTrigger>
            <TabsTrigger value="cultural-activities">
              <CalendarRange className="w-4 h-4 mr-2" />
              Activités Culturelles
            </TabsTrigger>
            <TabsTrigger value="cbm">
              <Building2 className="w-4 h-4 mr-2" />
              CBM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predefined" className="mt-6">
            <div className="space-y-6">
              <WorkflowSyncManager />
              <PredefinedWorkflowsImporter />
            </div>
          </TabsContent>

          <TabsContent value="configurator" className="mt-6">
            <WorkflowDynamicSelects />
          </TabsContent>

          <TabsContent value="models" className="mt-6">
            <WorkflowModelsManager />
          </TabsContent>

          <TabsContent value="definitions" className="mt-6">
            <WorkflowDefinitions />
          </TabsContent>

          <TabsContent value="instances" className="mt-6">
            <WorkflowInstances />
          </TabsContent>

          <TabsContent value="metrics" className="mt-6">
            <WorkflowMetrics />
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <WorkflowRolesManager />
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <WorkflowIntegrations />
          </TabsContent>

          <TabsContent value="cultural-activities" className="mt-6">
            <BookingWorkflowStepsManager />
          </TabsContent>

          <TabsContent value="cbm" className="mt-6">
            <CBMWorkflowsManager />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
