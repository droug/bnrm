import { AdminHeader } from "@/components/AdminHeader";
import { ProfessionalInvitationsManager } from "@/components/admin/ProfessionalInvitationsManager";
import { ProfessionalRegistrationApprovals } from "@/components/admin/ProfessionalRegistrationApprovals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfessionalManagement() {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Gestion des Professionnels" />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestion des Professionnels</h1>
          <p className="text-muted-foreground">
            Invitez et validez les inscriptions des professionnels (éditeurs, imprimeurs, producteurs, distributeurs)
          </p>
        </div>

        <Tabs defaultValue="invitations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="approvals">Validations</TabsTrigger>
          </TabsList>

          <TabsContent value="invitations">
            <ProfessionalInvitationsManager />
          </TabsContent>

          <TabsContent value="approvals">
            <ProfessionalRegistrationApprovals />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
