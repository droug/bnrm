import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IntegrationsList from "@/components/integrations/IntegrationsList";
import IntegrationForm from "@/components/integrations/IntegrationForm";
import IntegrationLogs from "@/components/integrations/IntegrationLogs";
import WebhookManager from "@/components/integrations/WebhookManager";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function IntegrationsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<any>(null);

  // Vérifier que l'utilisateur est admin
  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id,
  });

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEdit = (integration: any) => {
    setEditingIntegration(integration);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIntegration(null);
  };

  const handleSaveSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['external-integrations'] });
    handleCloseForm();
    toast({
      title: "Succès",
      description: "L'intégration a été enregistrée avec succès",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Intégrations Externes</h1>
            <p className="text-muted-foreground">
              Gérez les connexions avec le SIGB, les systèmes d'information et les webhooks
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle intégration
            </Button>
          )}
        </div>

        {showForm ? (
          <IntegrationForm
            integration={editingIntegration}
            onSave={handleSaveSuccess}
            onCancel={handleCloseForm}
          />
        ) : (
          <Tabs defaultValue="integrations" className="space-y-4">
            <TabsList>
              <TabsTrigger value="integrations">Intégrations</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="logs">Logs de synchronisation</TabsTrigger>
            </TabsList>

            <TabsContent value="integrations" className="space-y-4">
              <IntegrationsList onEdit={handleEdit} />
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <WebhookManager />
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <IntegrationLogs />
            </TabsContent>
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  );
}
