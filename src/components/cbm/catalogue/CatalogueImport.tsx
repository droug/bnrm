import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export function CatalogueImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

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
                <Button className="gap-2">
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
                <Button className="gap-2">
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
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Télécharger modèle CSV
            </Button>
            <Button variant="outline" className="gap-2">
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
            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Export MARC</div>
                <div className="text-xs text-muted-foreground">MARC21/UNIMARC</div>
              </div>
            </Button>

            <Button variant="outline" className="h-24 flex flex-col gap-2">
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Export CSV</div>
                <div className="text-xs text-muted-foreground">Tableur</div>
              </div>
            </Button>

            <Button variant="outline" className="h-24 flex flex-col gap-2">
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
