import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, BarChart3, Settings, Shield, Eye, Image } from "lucide-react";
import DocumentsManagerManuscripts from "@/components/manuscripts/DocumentsManagerManuscripts";
import { ManuscriptsSettings } from "@/components/manuscripts/ManuscriptsSettings";
import { ManuscriptsAccessControl } from "@/components/manuscripts/ManuscriptsAccessControl";
import { ManuscriptsAnalytics } from "@/components/manuscripts/ManuscriptsAnalytics";
import { ManuscriptsReports } from "@/components/manuscripts/ManuscriptsReports";
import { ManuscriptsDashboard } from "@/components/manuscripts/ManuscriptsDashboard";
import ExhibitionsManager from "@/components/digital-library/ExhibitionsManager";
import UsersManager from "@/components/digital-library/UsersManager";

export default function ManuscriptsBackoffice() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!user || !profile || !['admin', 'librarian'].includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gestion Manuscrits Numérisés</h1>
          <p className="text-muted-foreground">
            Gestion complète des manuscrits numérisés avec suivi et analyses
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Statistiques</span>
            </TabsTrigger>
            <TabsTrigger value="exhibitions" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Expositions</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Rapports</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Accès</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ManuscriptsDashboard />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsManagerManuscripts />
          </TabsContent>

          <TabsContent value="users">
            <UsersManager />
          </TabsContent>

          <TabsContent value="analytics">
            <ManuscriptsAnalytics />
          </TabsContent>

          <TabsContent value="exhibitions">
            <ExhibitionsManager />
          </TabsContent>

          <TabsContent value="reports">
            <ManuscriptsReports />
          </TabsContent>

          <TabsContent value="access">
            <ManuscriptsAccessControl />
          </TabsContent>

          <TabsContent value="settings">
            <ManuscriptsSettings />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}