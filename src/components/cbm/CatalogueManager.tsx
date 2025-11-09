import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, BookOpen, Users, BarChart3, Settings, Upload, Download } from "lucide-react";
import { CatalogueStatistics } from "./catalogue/CatalogueStatistics";
import { CatalogueRecords } from "./catalogue/CatalogueRecords";
import { CatalogueSettings } from "./catalogue/CatalogueSettings";
import { CatalogueImport } from "./catalogue/CatalogueImport";

export function CatalogueManager() {
  const [activeTab, setActiveTab] = useState("statistics");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cbm-primary to-cbm-secondary flex items-center justify-center shadow-cbm">
          <Database className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent bg-clip-text text-transparent">
            Gestion du Catalogue Collectif National
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Administration centralisée du catalogue bibliographique CBM
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="statistics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="records" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Notices
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="h-4 w-4" />
            Import/Export
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-6">
          <CatalogueStatistics />
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <CatalogueRecords />
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <CatalogueImport />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <CatalogueSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
