import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageAccessRestrictionsManager } from "@/components/digital-library/PageAccessRestrictionsManager";
import { BatchRestrictionsManager } from "@/components/digital-library/BatchRestrictionsManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Layers } from "lucide-react";

export default function PageAccessRestrictionsBackoffice() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("individual");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isLibrarian) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/digital-library")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'administration
        </Button>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="individual" className="gap-2">
              <FileText className="h-4 w-4" />
              Restrictions par œuvre
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2">
              <Layers className="h-4 w-4" />
              Restrictions par lot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <PageAccessRestrictionsManager />
          </TabsContent>

          <TabsContent value="batch">
            <BatchRestrictionsManager />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}