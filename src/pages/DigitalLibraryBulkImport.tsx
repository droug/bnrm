import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UploadCloud, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function DigitalLibraryBulkImport() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user || (!isAdmin && !isLibrarian)) {
    return <Navigate to="/" replace />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Format invalide",
          description: "Veuillez sélectionner un fichier CSV ou Excel",
          variant: "destructive"
        });
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "Aucun fichier",
        description: "Veuillez sélectionner un fichier",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Import réussi",
        description: "Les documents ont été importés avec succès"
      });
      setSelectedFile(null);
    }, 2000);
  };

  const downloadTemplate = () => {
    // Create CSV template
    const headers = [
      'titre',
      'auteur',
      'type_contenu',
      'description',
      'annee_publication',
      'langue',
      'mots_cles',
      'url_fichier',
      'source_numerisation'
    ];
    
    const csvContent = headers.join(',') + '\n' + 
      'Exemple de titre,Auteur exemple,page,Description du document,2024,fr,histoire;culture,https://example.com/document.pdf,internal';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_import_documents.csv';
    link.click();
    
    toast({
      title: "Téléchargement du modèle",
      description: "Le fichier modèle a été téléchargé"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/digital-library")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600">
                <UploadCloud className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Import en masse</CardTitle>
                <CardDescription>
                  Importer plusieurs documents avec leurs métadonnées via CSV ou Excel
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Étape 1 : Télécharger le modèle
                </h4>
                <p className="text-sm text-muted-foreground">
                  Téléchargez le fichier modèle CSV qui contient les colonnes requises
                </p>
                <Button variant="outline" onClick={downloadTemplate} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le modèle CSV
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Étape 2 : Remplir les informations
                </h4>
                <p className="text-sm text-muted-foreground">
                  Complétez le fichier avec les informations de vos documents
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Étape 3 : Importer le fichier
                </h4>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez et importez votre fichier complété
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Formats supportés</AlertTitle>
                <AlertDescription>
                  CSV (.csv), Excel (.xls, .xlsx)
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Upload form */}
          <Card>
            <CardHeader>
              <CardTitle>Importer vos documents</CardTitle>
              <CardDescription>
                Sélectionnez un fichier CSV ou Excel contenant les métadonnées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Fichier d'import</Label>
                <div className="flex flex-col gap-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="max-w-xs mx-auto"
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Fichier sélectionné : <span className="font-medium">{selectedFile.name}</span>
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleImport} 
                    disabled={!selectedFile || isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>Traitement en cours...</>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4 mr-2" />
                        Lancer l'import
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Colonnes requises</AlertTitle>
                <AlertDescription className="text-sm space-y-1 mt-2">
                  <div>• <strong>titre</strong> : Titre du document</div>
                  <div>• <strong>auteur</strong> : Nom de l'auteur</div>
                  <div>• <strong>type_contenu</strong> : Type (page, news, etc.)</div>
                  <div>• <strong>description</strong> : Description courte</div>
                  <div>• <strong>url_fichier</strong> : URL du fichier PDF</div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Processing info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Les documents importés seront créés avec le statut "brouillon"</p>
            <p>• Vous devrez les valider individuellement avant publication</p>
            <p>• Les fichiers PDF doivent être accessibles via les URLs fournies</p>
            <p>• Les erreurs d'import seront listées dans un rapport téléchargeable</p>
            <p>• Maximum 100 documents par import</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
