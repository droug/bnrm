import { AdminHeader } from "@/components/AdminHeader";
import { ActivityTypesManager } from "@/components/cultural-activities/ActivityTypesManager";
import { WatermarkContainer } from "@/components/ui/watermark";
import { PermissionGuard } from "@/hooks/usePermissions";

export default function ActivityTypesManagementPage() {
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
            title="Types d'activités et équipements"
            subtitle="Gérez les types d'activités culturelles et les équipements standards disponibles"
          />
          
          <main className="container py-8">
            <ActivityTypesManager />
          </main>
        </div>
      </WatermarkContainer>
    </PermissionGuard>
  );
}
