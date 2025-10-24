import { AdminHeader } from "@/components/AdminHeader";
import SpaceGalleryManagement from "@/components/cultural-activities/SpaceGalleryManagement";
import { WatermarkContainer } from "@/components/ui/watermark";
import { PermissionGuard } from "@/hooks/usePermissions";

export default function SpaceGalleryPage() {
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
            title="Gestion de galeries photos"
            subtitle="Gérez les galeries d'images des espaces culturels"
          />
          
          <main className="container py-8">
            <SpaceGalleryManagement />
          </main>
        </div>
      </WatermarkContainer>
    </PermissionGuard>
  );
}
