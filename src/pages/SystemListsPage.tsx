import { useState } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { SystemListsManager } from "@/components/SystemListsManager";
import { AutocompleteListsManager } from "@/components/AutocompleteListsManager";
import { WatermarkContainer } from "@/components/ui/watermark";
import { PermissionGuard } from "@/hooks/usePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Network } from "lucide-react";

export default function SystemListsPage() {
  const [activeTab, setActiveTab] = useState("dropdowns");

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
            title="Gestion des listes système"
            subtitle="Configurez les listes déroulantes paramétrables du système"
          />
          
          <main className="container py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="dropdowns" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Listes déroulantes
                </TabsTrigger>
                <TabsTrigger value="autocomplete" className="flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Listes auto-complètes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dropdowns" className="space-y-4">
                <SystemListsManager />
              </TabsContent>

              <TabsContent value="autocomplete" className="space-y-4">
                <AutocompleteListsManager />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </WatermarkContainer>
    </PermissionGuard>
  );
}
