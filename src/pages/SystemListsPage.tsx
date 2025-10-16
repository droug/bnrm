import { AdminHeader } from "@/components/AdminHeader";
import { SystemListsManager } from "@/components/SystemListsManager";
import { WatermarkContainer } from "@/components/ui/watermark";
import { PermissionGuard } from "@/hooks/usePermissions";

export default function SystemListsPage() {
  return (
    <PermissionGuard permission="content.manage">
      <WatermarkContainer 
        watermarkProps={{ 
          text: "BNRM Administration - Accès Protégé", 
          variant: "subtle", 
          position: "pattern",
          opacity: 0.02
        }}
      >
        <div className="min-h-screen bg-background">
          <AdminHeader 
            title="Gestion des Systèmes de listes"
            subtitle="Configurez les listes déroulantes paramétrables du système"
          />
          
          <main className="container py-8">
            <SystemListsManager />
          </main>
        </div>
      </WatermarkContainer>
    </PermissionGuard>
  );
}
