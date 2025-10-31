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

  const handleConsultLoan = (loan: any) => {
    // Pour l'instant, utiliser book-reader pour les prêts
    // Dans une vraie implémentation, vous auriez un loan_id qui référence un document/manuscrit
    if (loan.id) {
      navigate(`/digital-library/book-reader/${loan.id}`);
    } else {
      navigate('/digital-library');
    }
  };

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
      // Note: Using mock data as there's no loans table in the schema
      // In a real implementation, you would create and query a loans table
      
      setCurrentLoans([
        {
          id: 1,
          title: "Al-Muqaddima (Les Prolégomènes)",
          author: "Ibn Khaldoun",
          loanDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          daysRemaining: 5,
          renewalsLeft: 2,
          canRenew: true,
        },
        {
          id: 2,
          title: "Rihla (Voyages)",
          author: "Ibn Battuta",
          loanDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          daysRemaining: 10,
          renewalsLeft: 3,
          canRenew: true,
        },
        {
          id: 3,
          title: "Histoire du Maroc moderne",
          author: "Archives BNRM",
          loanDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          daysRemaining: 2,
          renewalsLeft: 0,
          canRenew: false,
        },
      ]);

      setLoanHistory([
        {
          id: 10,
          title: "Kitab al-Shifa",
          author: "Ibn Sina",
          loanDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          returnDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "returned",
        },
        {
          id: 11,
          title: "Es-Saada - Journal",
          author: "Archives nationales",
          loanDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          returnDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "returned",
        },
        {
          id: 12,
          title: "Al-Kulliyat fi al-Tibb",
          author: "Ibn Sina",
          loanDate: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          returnDate: new Date(Date.now() - 98 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "late_return",
        },
      ]);
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

  const handleRenew = (loanId: number) => {
    setCurrentLoans(currentLoans.map(loan => {
      if (loan.id === loanId && loan.canRenew) {
        const newDueDate = new Date(loan.dueDate);
        newDueDate.setDate(newDueDate.getDate() + 30);
        
        toast({
          title: "Emprunt renouvelé",
          description: `Nouvelle date de retour : ${newDueDate.toLocaleDateString('fr-FR')}`,
        });

        return {
          ...loan,
          dueDate: newDueDate.toISOString().split('T')[0],
          daysRemaining: loan.daysRemaining + 30,
          renewalsLeft: loan.renewalsLeft - 1,
          canRenew: loan.renewalsLeft > 1,
        };
      }
      return loan;
    }));
  };

  const getDaysRemainingBadge = (days: number) => {
    if (days <= 3) return <Badge variant="destructive">{days} jours restants</Badge>;
    if (days <= 7) return <Badge className="bg-amber-100 text-amber-800">{days} jours restants</Badge>;
    return <Badge variant="default">{days} jours restants</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "returned":
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Retourné</Badge>;
      case "late_return":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Retour tardif</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
                ) : (
                  <div className="space-y-4">
                    {currentLoans.map((loan) => (
                      <div
                        key={loan.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{loan.title}</h3>
                          <p className="text-sm text-muted-foreground">{loan.author}</p>
                          <div className="flex items-center gap-4 mt-3 flex-wrap">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Emprunté le {new Date(loan.loanDate).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Retour le {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                            </span>
                            {getDaysRemainingBadge(loan.daysRemaining)}
                          </div>
                          {loan.renewalsLeft > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {loan.renewalsLeft} renouvellement(s) disponible(s)
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConsultLoan(loan)}
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Consulter
                          </Button>
                          <Button
                            size="sm"
                            disabled={!loan.canRenew}
                            onClick={() => handleRenew(loan.id)}
                          >
                            <RotateCw className="h-4 w-4 mr-1" />
                            Renouveler
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                ) : (
                  <div className="space-y-4">
                    {loanHistory.map((loan) => (
                      <div
                        key={loan.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{loan.title}</h3>
                          <p className="text-sm text-muted-foreground">{loan.author}</p>
                          <div className="flex items-center gap-4 mt-3 flex-wrap">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Du {new Date(loan.loanDate).toLocaleDateString('fr-FR')} au {new Date(loan.returnDate).toLocaleDateString('fr-FR')}
                            </span>
                            {getStatusBadge(loan.status)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/digital-library`)}
                        >
                          Emprunter à nouveau
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
