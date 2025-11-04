import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { importFormFields, legalDepositMonographFields } from "@/utils/importFormFields";
import { toast } from "sonner";

export default function ImportFormFields() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'librarian')) {
    return <Navigate to="/auth" replace />;
  }

  const availableForms = [
    { key: "legal_deposit_monograph", name: "Dépôt légal - Monographies" }
  ];

  const handleImport = async () => {
    if (!selectedForm) {
      toast.error("Veuillez sélectionner un formulaire");
      return;
    }

    try {
      setImporting(true);
      setResult(null);

      const importResult = await importFormFields(selectedForm);
      
      setResult({
        success: true,
        message: importResult.message
      });
      
      toast.success("Import réussi !");
      
      // Rediriger vers le form builder après quelques secondes
      setTimeout(() => {
        navigate(`/admin/form-builder?formKey=${selectedForm}`);
      }, 2000);

    } catch (error: any) {
      console.error("Erreur lors de l'import:", error);
      setResult({
        success: false,
        message: error.message || "Erreur lors de l'import"
      });
      toast.error("Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Importer les champs de formulaire
            </h1>
            <p className="text-muted-foreground">
              Importez les champs des formulaires existants vers la base de données
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sélectionner un formulaire</CardTitle>
              <CardDescription>
                Les champs définis dans le code seront importés dans la base de données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="form-select">Formulaire à importer</Label>
                <Select value={selectedForm} onValueChange={setSelectedForm}>
                  <SelectTrigger id="form-select">
                    <SelectValue placeholder="Sélectionner un formulaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableForms.map((form) => (
                      <SelectItem key={form.key} value={form.key}>
                        {form.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {result && (
                <Alert variant={result.success ? "default" : "destructive"}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Attention :</strong> Cette opération va supprimer tous les champs 
                    existants pour ce formulaire et les remplacer par ceux définis dans le code.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-4">
                  <Button
                    onClick={handleImport}
                    disabled={!selectedForm || importing}
                    className="flex-1"
                  >
                    {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Importer les champs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/admin/form-builder")}
                    disabled={importing}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedForm === "legal_deposit_monograph" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Qu'est-ce qui sera importé ?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Pour le formulaire <strong>Dépôt légal - Monographies</strong> :</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {legalDepositMonographFields.map((section) => {
                      const sectionLabels: Record<string, string> = {
                        author_identification: "Identification de l'auteur",
                        publication_identification: "Identification de la publication",
                        publisher_info: "Éditeur",
                        printer_info: "Imprimeur"
                      };
                      return (
                        <li key={section.section_key}>
                          Section "{sectionLabels[section.section_key]}" ({section.fields.length} champs)
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-4">
                    <strong>Total : {legalDepositMonographFields.reduce((acc, section) => acc + section.fields.length, 0)} champs</strong> avec leurs labels français/arabes, 
                    validations et configurations.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
