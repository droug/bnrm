import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailCampaignsManager } from "@/components/email/EmailCampaignsManager";
import { EmailTemplatesManager } from "@/components/email/EmailTemplatesManager";
import { Mail, FileText } from "lucide-react";
import { useAccessControl } from "@/hooks/useAccessControl";

export default function EmailManagement() {
  const { user } = useAuth();
  const { isLibrarian } = useAccessControl();

  if (!user || !isLibrarian) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestion des Emails</h1>
          <p className="text-muted-foreground">
            Gérez vos campagnes de mailing de masse et vos modèles d'emails
          </p>
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="campaigns">
              <Mail className="h-4 w-4 mr-2" />
              Campagnes
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              Modèles
            </TabsTrigger>
          </TabsList>
          <TabsContent value="campaigns" className="mt-6">
            <EmailCampaignsManager />
          </TabsContent>
          <TabsContent value="templates" className="mt-6">
            <EmailTemplatesManager />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
