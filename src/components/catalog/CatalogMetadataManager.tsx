import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Upload, 
  Download, 
  RefreshCw, 
  Plus, 
  Search,
  FileText,
  Database,
  Settings
} from "lucide-react";

export default function CatalogMetadataManager() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleManualImport = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Import manuel",
        description: "Fonctionnalité d'import manuel en cours de développement",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'import",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('metadata_exports')
        .insert({
          export_format: format,
          export_status: 'pending',
          export_filters: { query: searchQuery }
        });

      if (error) throw error;

      toast({
        title: "Export lancé",
        description: `Export au format ${format.toUpperCase()} en cours`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Métadonnées du Catalogue</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleManualImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import Manuel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metadata" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metadata">
            <FileText className="h-4 w-4 mr-2" />
            Métadonnées
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="h-4 w-4 mr-2" />
            Imports
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-2" />
            Exports
          </TabsTrigger>
          <TabsTrigger value="sigb">
            <Settings className="h-4 w-4 mr-2" />
            Configuration SIGB
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recherche et Consultation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Rechercher par titre, ISBN, ISSN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Aucune métadonnée trouvée. Utilisez l'import pour ajouter des données.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Imports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button onClick={handleManualImport} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel Import Manuel
                </Button>
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Migrer depuis l'ancienne plateforme
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Aucun import récent
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exporter les Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col"
                  onClick={() => handleExport('marc21')}
                  disabled={isLoading}
                >
                  <FileText className="h-8 w-8 mb-2" />
                  <span>MARC21</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col"
                  onClick={() => handleExport('unimarc')}
                  disabled={isLoading}
                >
                  <FileText className="h-8 w-8 mb-2" />
                  <span>UNIMARC</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col"
                  onClick={() => handleExport('dublin_core')}
                  disabled={isLoading}
                >
                  <FileText className="h-8 w-8 mb-2" />
                  <span>Dublin Core</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col"
                  onClick={() => handleExport('csv')}
                  disabled={isLoading}
                >
                  <FileText className="h-8 w-8 mb-2" />
                  <span>CSV</span>
                </Button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Exports Récents</h3>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Aucun export récent
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sigb" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de l'Interconnexion SIGB</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="system_name">Nom du Système</Label>
                  <Input id="system_name" placeholder="Ex: Koha, PMB, Horizon..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_endpoint">Point d'accès API</Label>
                  <Input id="api_endpoint" placeholder="https://..." type="url" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sync_frequency">Fréquence de Synchronisation</Label>
                  <select id="sync_frequency" className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="real_time">Temps réel</option>
                    <option value="hourly">Toutes les heures</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="manual">Manuelle</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="configuration_params">Paramètres de Configuration (JSON)</Label>
                  <Textarea 
                    id="configuration_params" 
                    placeholder='{"api_key": "...", "format": "marc21"}'
                    className="font-mono text-sm"
                    rows={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Enregistrer la Configuration
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tester la Connexion
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Statut de la Synchronisation</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Non configuré</Badge>
                  <span className="text-sm text-muted-foreground">
                    Dernière synchronisation : Jamais
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}