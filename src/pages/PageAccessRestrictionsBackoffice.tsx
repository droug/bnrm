import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import { AdminPageWrapper, AdminSectionCard } from "@/components/digital-library/admin/AdminPageWrapper";
import { PageAccessRestrictionsManager } from "@/components/digital-library/PageAccessRestrictionsManager";
import { BatchRestrictionsManager } from "@/components/digital-library/BatchRestrictionsManager";
import { RestrictionTemplatesManager } from "@/components/digital-library/RestrictionTemplatesManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@iconify/react";

export default function PageAccessRestrictionsBackoffice() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();
  const [activeTab, setActiveTab] = useState("individual");

  if (loading) {
    return (
      <AdminPageWrapper
        title="Restriction d'accès aux pages"
        description="Gestion des restrictions par page"
        icon="mdi:lock-outline"
        iconColor="text-rose-600"
        iconBgColor="bg-rose-500/10"
        loading={true}
      >
        <div />
      </AdminPageWrapper>
    );
  }

  if (!user || !isLibrarian) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminPageWrapper
      title="Restriction d'accès aux pages"
      description="Gérez les restrictions d'accès par œuvre, par lot ou via des modèles réutilisables"
      icon="mdi:lock-outline"
      iconColor="text-rose-600"
      iconBgColor="bg-rose-500/10"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3 bg-muted/50">
          <TabsTrigger value="individual" className="gap-2">
            <Icon icon="mdi:file-document-outline" className="h-4 w-4" />
            Par document
          </TabsTrigger>
          <TabsTrigger value="batch" className="gap-2">
            <Icon icon="mdi:layers-outline" className="h-4 w-4" />
            Par lot
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Icon icon="mdi:file-document-check-outline" className="h-4 w-4" />
            Modèles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <PageAccessRestrictionsManager />
        </TabsContent>

        <TabsContent value="batch">
          <BatchRestrictionsManager />
        </TabsContent>

        <TabsContent value="templates">
          <RestrictionTemplatesManager />
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  );
}
