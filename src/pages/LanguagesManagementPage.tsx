import { AdminHeader } from "@/components/AdminHeader";
import { LanguagesManager } from "@/components/cultural-activities/LanguagesManager";
import { WatermarkContainer } from "@/components/ui/watermark";
import { PermissionGuard } from "@/hooks/usePermissions";

export default function LanguagesManagementPage() {
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
            title="Gestion des Langues"
            subtitle="Gérez les langues disponibles dans le système avec leurs codes ISO et orientations"
          />
          
          <main className="container py-8">
            <LanguagesManager />
          </main>
        </div>
      </WatermarkContainer>
    </PermissionGuard>
  );
}
