import { AdminHeader } from "@/components/AdminHeader";
import { WatermarkContainer } from "@/components/ui/watermark";
import { BNRMPaymentNotificationSettings } from "@/components/bnrm/BNRMPaymentNotificationSettings";

export default function NotificationsSettings() {
  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM Administration", 
        variant: "subtle", 
        position: "pattern",
        opacity: 0.02
      }}
    >
      <div className="min-h-screen bg-background">
        <AdminHeader 
          title="Paramètres de Notifications"
          subtitle="Configurez les notifications par canal (Email, Système, SMS) pour toutes les actions du système"
        />

        <main className="container py-8">
          <BNRMPaymentNotificationSettings />
        </main>
      </div>
    </WatermarkContainer>
  );
}
