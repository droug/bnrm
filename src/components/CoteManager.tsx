import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, MapPin, FileText } from "lucide-react";
import { CoteCollectionsTab } from "./cote/CoteCollectionsTab";
import { CoteVillesTab } from "./cote/CoteVillesTab";
import { CoteNomenclaturesTab } from "./cote/CoteNomenclaturesTab";

export const CoteManager = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="collections" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="villes" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Villes
            </TabsTrigger>
            <TabsTrigger value="nomenclatures" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Modèles de fichiers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collections" className="mt-6">
            <CoteCollectionsTab />
          </TabsContent>

          <TabsContent value="villes" className="mt-6">
            <CoteVillesTab />
          </TabsContent>

          <TabsContent value="nomenclatures" className="mt-6">
            <CoteNomenclaturesTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
