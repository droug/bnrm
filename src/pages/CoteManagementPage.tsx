import { AdminHeader } from "@/components/AdminHeader";
import { CoteManager } from "@/components/CoteManager";
import { WatermarkContainer } from "@/components/ui/watermark";
import { PermissionGuard } from "@/hooks/usePermissions";

export default function CoteManagementPage() {
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
            title="Gestion des Côtes"
            subtitle="Collections, villes et nomenclatures de fichiers"
          />
          
          <main className="container py-8">
            <CoteManager />
          </main>
        </div>
      </WatermarkContainer>
    </PermissionGuard>
  );
}
