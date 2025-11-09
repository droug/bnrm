import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export function CatalogueImport() {
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const marcFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const handleMarcImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    // Simuler l'import avec progression
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImporting(false);
          toast({
            title: "Import réussi",
            description: `Le fichier MARC "${file.name}" a été importé avec succès.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleCsvImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImporting(false);
          toast({
            title: "Import réussi",
            description: `Le fichier CSV "${file.name}" a été importé avec succès.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDownloadTemplate = () => {
    // Créer un template CSV
    const csvContent = "Titre,Auteur,Type,ISBN/ISSN,Bibliothèque\n" +
      "Exemple de titre,Nom de l'auteur,Livre,978-X-XXX-XXXXX-X,BN Rabat\n";
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_import_catalogue.csv";
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Téléchargement réussi",
      description: "Le modèle CSV a été téléchargé.",
    });
  };

  const handleDownloadGuide = () => {
    toast({
      title: "Guide d'import",
      description: "Le guide d'import sera bientôt disponible en PDF.",
    });
  };

  const handleExportMarc = () => {
    toast({
      title: "Export MARC",
      description: "Export du catalogue au format MARC21 en cours...",
    });
    
    setTimeout(() => {
      toast({
        title: "Export terminé",
        description: "Le fichier MARC a été généré avec succès.",
      });
    }, 1500);
  };

  const handleExportCsv = () => {
    const csvContent = "Titre,Auteur,Type,ISBN/ISSN,Bibliothèque\n" +
      "تاريخ المغرب الحديث والمعاصر,محمد العربي المساري,Livre,978-9954-123-456-7,BN Rabat\n" +
      "Histoire du Maroc,Pierre Vermeren,Livre,978-2-7071-9876-5,BU Hassan II\n";
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `export_catalogue_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "Le catalogue a été exporté au format CSV.",
    });
  };

  const handleExportXml = () => {
    toast({
      title: "Export XML",
      description: "Export du catalogue au format Dublin Core en cours...",
    });
    
    setTimeout(() => {
      toast({
        title: "Export terminé",
        description: "Le fichier XML Dublin Core a été généré avec succès.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Import de notices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importer des Notices
          </CardTitle>
          <CardDescription>
            Importez des notices bibliographiques en masse depuis différents formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Formats supportés: MARC21, UNIMARC, Dublin Core, BibTeX, CSV
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold mb-2">Import MARC</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Importez des fichiers MARC21 ou UNIMARC
                </p>
                <Input
                  ref={marcFileInputRef}
                  type="file"
                  accept=".mrc,.marc"
                  onChange={handleMarcImport}
                  className="hidden"
                />
                <Button 
                  className="gap-2"
                  onClick={() => marcFileInputRef.current?.click()}
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4" />
                  Sélectionner fichier MARC
                </Button>
              </div>
            </div>

            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold mb-2">Import CSV</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Importez un fichier CSV avec modèle
                </p>
                <Input
                  ref={csvFileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCsvImport}
                  className="hidden"
                />
                <Button 
                  className="gap-2"
                  onClick={() => csvFileInputRef.current?.click()}
                  disabled={isImporting}
                >
                  <Upload className="h-4 w-4" />
                  Sélectionner fichier CSV
                </Button>
              </div>
            </div>
          </div>

          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Import en cours...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleDownloadTemplate}
            >
              <Download className="h-4 w-4" />
              Télécharger modèle CSV
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleDownloadGuide}
            >
              <FileText className="h-4 w-4" />
              Guide d'import
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export de notices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter des Notices
          </CardTitle>
          <CardDescription>
            Exportez le catalogue ou une sélection de notices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2"
              onClick={handleExportMarc}
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Export MARC</div>
                <div className="text-xs text-muted-foreground">MARC21/UNIMARC</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2"
              onClick={handleExportCsv}
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Export CSV</div>
                <div className="text-xs text-muted-foreground">Tableur</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2"
              onClick={handleExportXml}
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Export XML</div>
                <div className="text-xs text-muted-foreground">Dublin Core</div>
              </div>
            </Button>
          </div>

          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Les exports sont conformes aux normes internationales de catalogage
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Historique des imports */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Imports</CardTitle>
          <CardDescription>Dernières opérations d'import</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "2025-01-15 10:30", format: "MARC21", notices: 1250, status: "success" },
              { date: "2025-01-14 15:45", format: "CSV", notices: 340, status: "success" },
              { date: "2025-01-13 09:20", format: "UNIMARC", notices: 890, status: "error" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{item.format}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm">{item.notices} notices</span>
                  {item.status === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
