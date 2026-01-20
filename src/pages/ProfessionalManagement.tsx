// Professional Management Page
import { AdminHeader } from "@/components/AdminHeader";
import { ProfessionalInvitationsManager } from "@/components/admin/ProfessionalInvitationsManager";
import { ProfessionalRequestsManager } from "@/components/admin/ProfessionalRequestsManager";
import { ProfessionalsList } from "@/components/admin/ProfessionalsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfessionalManagement() {
  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Gestion des Professionnels" />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestion des Professionnels</h1>
          <p className="text-muted-foreground">
            Invitez et validez les inscriptions des professionnels (éditeurs, imprimeurs, producteurs)
          </p>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Liste des Professionnels</TabsTrigger>
            <TabsTrigger value="approvals">Gestion des Demandes</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <ProfessionalsList />
          </TabsContent>

          <TabsContent value="approvals">
            <ProfessionalRequestsManager />
          </TabsContent>

          <TabsContent value="invitations">
            <ProfessionalInvitationsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
