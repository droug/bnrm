import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CmsPagesManager from "@/components/cms/CmsPagesManager";
import CmsWebhooksManager from "@/components/cms/CmsWebhooksManager";
import CmsMediaManager from "@/components/cms/CmsMediaManager";
import CmsActualitesManager from "@/components/cms/CmsActualitesManager";
import CmsEvenementsManager from "@/components/cms/CmsEvenementsManager";
import CmsMenusManager from "@/components/cms/CmsMenusManager";

export default function ContentManagementSystem() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Système de Gestion de Contenu (CMS)
        </h1>
        <p className="text-lg text-muted-foreground">
          Créez et gérez tout le contenu de la plateforme avec sections drag & drop, webhooks et médias bilingues
        </p>
      </div>

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="media">Médias</TabsTrigger>
          <TabsTrigger value="actualites">Actualités</TabsTrigger>
          <TabsTrigger value="evenements">Événements</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <CmsPagesManager />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <CmsWebhooksManager />
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <CmsMediaManager />
        </TabsContent>

        <TabsContent value="actualites" className="space-y-4">
          <CmsActualitesManager />
        </TabsContent>

        <TabsContent value="evenements" className="space-y-4">
          <CmsEvenementsManager />
        </TabsContent>

        <TabsContent value="menus" className="space-y-4">
          <CmsMenusManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
