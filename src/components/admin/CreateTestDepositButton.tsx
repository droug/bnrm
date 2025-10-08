import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TestTube, Copy, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CreateTestDepositButton() {
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const { toast } = useToast();

  const createTestDeposit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-test-deposit', {
        body: {}
      });

      if (error) throw error;

      setTestData(data.data);
      toast({
        title: "✅ Demande de test créée",
        description: `Numéro de demande: ${data.data.requestNumber}`,
      });
    } catch (error: any) {
      console.error('Error creating test deposit:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: `${label} copié dans le presse-papier`,
    });
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={createTestDeposit}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Création en cours...
          </>
        ) : (
          <>
            <TestTube className="mr-2 h-4 w-4" />
            Créer une demande de test
          </>
        )}
      </Button>

      {testData && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Demande de test créée avec succès
            </CardTitle>
            <CardDescription>
              Utilisez ces identifiants pour tester le système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="text-sm font-medium">Numéro de demande</p>
                  <p className="text-lg font-mono">{testData.requestNumber}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(testData.requestNumber, "Numéro de demande")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Comptes de test créés :</h4>
              
              <div className="space-y-2">
                <Badge variant="outline" className="mb-2">Éditeur (Initiateur)</Badge>
                <div className="p-3 bg-white rounded-lg border space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-mono text-sm">{testData.credentials.editor.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(testData.credentials.editor.email, "Email éditeur")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Mot de passe</p>
                      <p className="font-mono text-sm">{testData.credentials.editor.password}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(testData.credentials.editor.password, "Mot de passe éditeur")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="mb-2">Imprimeur (Collaborateur)</Badge>
                <div className="p-3 bg-white rounded-lg border space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-mono text-sm">{testData.credentials.printer.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(testData.credentials.printer.email, "Email imprimeur")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Mot de passe</p>
                      <p className="font-mono text-sm">{testData.credentials.printer.password}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(testData.credentials.printer.password, "Mot de passe imprimeur")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="font-medium mb-1">💡 Pour tester le système :</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Connectez-vous en tant qu'éditeur pour voir la demande créée</li>
                <li>Allez dans le backoffice pour gérer la demande</li>
                <li>Connectez-vous en tant qu'imprimeur pour approuver/rejeter</li>
                <li>Testez l'ajout de nouvelles parties impliquées</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
