import { useState, useEffect } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, AlertCircle, RotateCw, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function MyLoans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentLoans, setCurrentLoans] = useState<any[]>([]);
  const [loanHistory, setLoanHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadLoansData();
  }, [user, navigate]);

  const loadLoansData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Note: Since there's no loans table in the schema, we'll show a message
      // In a real implementation, you would create and query a loans table
      setCurrentLoans([]);
      setLoanHistory([]);
    } catch (error: any) {
      console.error("Error loading loans:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos emprunts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mes Emprunts Numériques</h1>
          <p className="text-lg text-muted-foreground">
            Gérez vos emprunts en cours et consultez votre historique
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Emprunts actifs</p>
                  <p className="text-3xl font-bold mt-1">{currentLoans.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Retours à venir</p>
                  <p className="text-3xl font-bold mt-1">0</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Historique</p>
                  <p className="text-3xl font-bold mt-1">{loanHistory.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList>
            <TabsTrigger value="current">Emprunts en cours</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          {/* Current Loans */}
          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle>Emprunts en cours</CardTitle>
                <CardDescription>
                  Documents actuellement empruntés - Durée maximale : 30 jours par période
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Chargement...</p>
                ) : currentLoans.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun emprunt en cours</p>
                    <Button className="mt-4" onClick={() => navigate("/digital-library")}>
                      Parcourir la bibliothèque
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loan History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des emprunts</CardTitle>
                <CardDescription>Liste de tous vos emprunts passés</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Chargement...</p>
                ) : loanHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun historique d'emprunt</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm">Conditions d'emprunt</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Durée d'emprunt : 30 jours par période</p>
            <p>• Nombre de renouvellements : jusqu'à 3 fois selon disponibilité</p>
            <p>• Maximum d'emprunts simultanés : 5 documents</p>
            <p>• Notification automatique 3 jours avant l'échéance</p>
            <p>• Les retours tardifs peuvent entraîner une suspension temporaire</p>
          </CardContent>
        </Card>
      </div>
    </DigitalLibraryLayout>
  );
}
