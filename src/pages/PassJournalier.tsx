import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, BookOpen, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function PassJournalier() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleActivatePass = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour activer votre pass journalier",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("record_daily_pass_usage", {
        p_user_id: user.id,
        p_service_id: "SRV-PASS-JOUR",
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      if (result?.success) {
        toast({
          title: "Pass activé",
          description: "Votre pass journalier gratuit a été activé avec succès!",
        });
      } else {
        toast({
          title: "Erreur",
          description: result?.error || "Une erreur est survenue",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">Pass Journalier Gratuit</h1>
            <p className="text-lg text-muted-foreground">
              Profitez d'un accès gratuit à nos services pour une journée par an
            </p>
          </div>

          {/* Main Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Conditions d'utilisation
              </CardTitle>
              <CardDescription>
                Le pass journalier vous permet d'accéder gratuitement à certains services de la bibliothèque
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Benefits */}
              <div className="grid gap-4">
                <h3 className="font-semibold text-lg">Avantages inclus :</h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Accès aux salles de lecture</p>
                      <p className="text-sm text-muted-foreground">
                        Consultation libre de nos collections sur place
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Ressources numériques</p>
                      <p className="text-sm text-muted-foreground">
                        Accès à notre bibliothèque numérique
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Services de base</p>
                      <p className="text-sm text-muted-foreground">
                        Utilisation des postes informatiques et connexion WiFi
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Info */}
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Informations importantes
                    </p>
                    <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                      <li>Valable une seule fois par an et par utilisateur</li>
                      <li>Accès limité à la journée d'activation</li>
                      <li>Connexion requise pour activer le pass</li>
                      <li>Non cumulable avec d'autres abonnements</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col items-center gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={handleActivatePass}
                  disabled={loading}
                  className="w-full max-w-md"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  {loading ? "Activation en cours..." : "Activer mon pass journalier gratuit"}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  En activant ce pass, vous confirmez avoir pris connaissance des conditions d'utilisation
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Besoin d'un accès régulier ?</CardTitle>
              <CardDescription>
                Pour une utilisation fréquente de nos services, découvrez nos formules d'abonnement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => navigate("/abonnements")}
                className="w-full"
              >
                Voir les formules d'abonnement
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
