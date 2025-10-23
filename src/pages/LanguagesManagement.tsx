import { AdminHeader } from "@/components/AdminHeader";
import { LanguagesManager } from "@/components/cultural-activities/LanguagesManager";
import { WatermarkContainer } from "@/components/ui/watermark";
import { PermissionGuard } from "@/hooks/usePermissions";

export default function LanguagesManagement() {
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
            subtitle="Configuration des langues disponibles dans le système"
          />
          
          <main className="container py-8">
            <LanguagesManager />
          </main>
        </div>
      </WatermarkContainer>
    </PermissionGuard>
  );
}
