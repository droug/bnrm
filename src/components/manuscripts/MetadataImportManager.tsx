import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, RefreshCw, FileText, Database, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function MetadataImportManager() {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sigbUrl, setSigbUrl] = useState("");
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState("hourly");

  const handleManualImport = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validation basique
      if (!Array.isArray(data)) {
        throw new Error("Le fichier doit contenir un tableau de métadonnées");
      }

      // Import vers Supabase
      const { error } = await supabase
        .from('catalog_metadata')
        .insert(data);

      if (error) throw error;

      toast({
        title: "Import réussi",
        description: `${data.length} notices importées avec succès`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'import",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleSigbSync = async () => {
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('sigb-metadata-sync', {
        body: { sigbUrl, mode: 'manual' }
      });

      if (error) throw error;

      toast({
        title: "Synchronisation réussie",
        description: `${data.imported} notices synchronisées depuis le SIGB`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'xml') => {
    setExporting(true);
    try {
      const { data: metadata, error } = await supabase
        .from('catalog_metadata')
        .select('*');

      if (error) throw error;

      let exportData: string;
      let mimeType: string;
      let filename: string;

      switch (format) {
        case 'json':
          exportData = JSON.stringify(metadata, null, 2);
          mimeType = 'application/json';
          filename = 'metadata-export.json';
          break;
        case 'csv':
          const headers = Object.keys(metadata[0] || {}).join(',');
          const rows = metadata.map(row => Object.values(row).join(','));
          exportData = [headers, ...rows].join('\n');
          mimeType = 'text/csv';
          filename = 'metadata-export.csv';
          break;
        case 'xml':
          exportData = `<?xml version="1.0" encoding="UTF-8"?>
<metadata>
${metadata.map(item => `  <record>
${Object.entries(item).map(([key, value]) => `    <${key}>${value}</${key}>`).join('\n')}
  </record>`).join('\n')}
</metadata>`;
          mimeType = 'application/xml';
          filename = 'metadata-export.xml';
          break;
      }

      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: `${metadata.length} notices exportées en ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'export",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Métadonnées</h2>
          <p className="text-muted-foreground">
            Import, export et synchronisation avec le SIGB
          </p>
        </div>
      </div>

      <Tabs defaultValue="sigb" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sigb">
            <Database className="h-4 w-4 mr-2" />
            SIGB
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Upload className="h-4 w-4 mr-2" />
            Import Manuel
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        {/* Synchronisation SIGB */}
        <TabsContent value="sigb">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Synchronisation avec le SIGB
              </CardTitle>
              <CardDescription>
                Importez automatiquement les métadonnées depuis votre système de gestion de bibliothèque
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sigb-url">URL du SIGB</Label>
                <Input
                  id="sigb-url"
                  placeholder="https://sigb.exemple.ma/api/metadata"
                  value={sigbUrl}
                  onChange={(e) => setSigbUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Synchronisation automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Synchroniser automatiquement les nouvelles notices
                  </p>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>

              {autoSync && (
                <div className="space-y-2">
                  <Label htmlFor="sync-interval">Fréquence de synchronisation</Label>
                  <Select value={syncInterval} onValueChange={setSyncInterval}>
                    <SelectTrigger id="sync-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <Button 
                onClick={handleSigbSync} 
                disabled={importing || !sigbUrl}
                className="w-full"
              >
                {importing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Synchronisation en cours...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Synchroniser maintenant
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import Manuel */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Manuel
              </CardTitle>
              <CardDescription>
                Importez des métadonnées depuis un fichier JSON
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-sm text-muted-foreground mb-2">
                    Glissez-déposez un fichier JSON ou cliquez pour parcourir
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleManualImport(file);
                    }}
                    className="hidden"
                  />
                  <Badge variant="outline">JSON uniquement</Badge>
                </Label>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Format attendu</h4>
                <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`[
  {
    "main_author": "Nom de l'auteur",
    "title": "Titre du manuscrit",
    "publication_year": 1850,
    "language": "Arabe",
    "subjects": ["Histoire", "Littérature"],
    ...
  }
]`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export */}
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export des Métadonnées
              </CardTitle>
              <CardDescription>
                Exportez les métadonnées dans différents formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button
                  onClick={() => handleExport('json')}
                  disabled={exporting}
                  variant="outline"
                  className="justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exporter en JSON
                </Button>
                <Button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  variant="outline"
                  className="justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exporter en CSV
                </Button>
                <Button
                  onClick={() => handleExport('xml')}
                  disabled={exporting}
                  variant="outline"
                  className="justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exporter en XML
                </Button>
              </div>

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Formats disponibles</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• JSON - Format structuré pour réimport</li>
                  <li>• CSV - Compatible tableur Excel/LibreOffice</li>
                  <li>• XML - Format standard d'échange de données</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres de Synchronisation
              </CardTitle>
              <CardDescription>
                Configurez les options d'import et d'export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Validation automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Vérifier la validité des métadonnées importées
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications d'import</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications lors des imports
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Historique des imports</Label>
                    <p className="text-sm text-muted-foreground">
                      Conserver un historique détaillé des imports
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Champs personnalisés</Label>
                  <Textarea
                    placeholder="Ajoutez des champs supplémentaires (un par ligne)"
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Exemple: missing_pages_reason, conservation_priority
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}