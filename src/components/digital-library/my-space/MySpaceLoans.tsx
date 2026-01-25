import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MySpaceLoans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentLoans, setCurrentLoans] = useState<any[]>([]);
  const [loanHistory, setLoanHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadLoansData();
  }, [user]);

  const loadLoansData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mock data - In a real implementation, query a loans table
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

  const handleConsultLoan = (loan: any) => {
    if (loan.id) {
      navigate(`/digital-library/book-reader/${loan.id}`);
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
    if (days <= 7) return <Badge className="bg-amber-100 text-amber-800 border-amber-200">{days} jours restants</Badge>;
    return <Badge variant="default" className="bg-bn-blue-primary">{days} jours restants</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "returned":
        return <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200"><Icon icon="mdi:check-circle" className="h-3 w-3" />Retourné</Badge>;
      case "late_return":
        return <Badge variant="destructive" className="gap-1"><Icon icon="mdi:alert-circle" className="h-3 w-3" />Retour tardif</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border-bn-blue-primary/10">
      <CardHeader className="bg-gradient-to-r from-bn-blue-primary/5 to-gold-bn-primary/5">
        <CardTitle className="flex items-center gap-3 text-bn-blue-primary">
          <div className="p-2 rounded-lg bg-bn-blue-primary/10">
            <Icon icon="mdi:book-open-page-variant" className="h-5 w-5 text-bn-blue-primary" />
          </div>
          Mes Emprunts Numériques
        </CardTitle>
        <CardDescription>Gérez vos emprunts en cours et consultez votre historique</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-bn-blue-primary/5 border border-bn-blue-primary/10">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:book-open" className="h-8 w-8 text-bn-blue-primary" />
              <div>
                <p className="text-2xl font-bold text-bn-blue-primary">{currentLoans.length}</p>
                <p className="text-xs text-muted-foreground">Emprunts actifs</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gold-bn-primary/5 border border-gold-bn-primary/10">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:clock-outline" className="h-8 w-8 text-gold-bn-primary" />
              <div>
                <p className="text-2xl font-bold text-gold-bn-primary">0</p>
                <p className="text-xs text-muted-foreground">À retourner bientôt</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:check-circle" className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-600">{loanHistory.length}</p>
                <p className="text-xs text-muted-foreground">Historique</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="current" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="current" className="gap-2">
              <Icon icon="mdi:book-open" className="h-4 w-4" />
              En cours ({currentLoans.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Icon icon="mdi:history" className="h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bn-blue-primary"></div>
              </div>
            ) : currentLoans.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Icon icon="mdi:book-off-outline" className="h-16 w-16 mx-auto text-muted-foreground/30" />
                <div>
                  <p className="text-muted-foreground">Aucun emprunt en cours</p>
                  <p className="text-sm text-muted-foreground/70">
                    Explorez la bibliothèque pour emprunter des documents
                  </p>
                </div>
                <Button onClick={() => navigate("/digital-library")} className="mt-4 bg-bn-blue-primary hover:bg-bn-blue-dark">
                  <Icon icon="mdi:bookshelf" className="h-4 w-4 mr-2" />
                  Parcourir la bibliothèque
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:border-gold-bn-primary/30 hover:bg-accent/30 transition-all gap-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{loan.title}</h3>
                      <p className="text-sm text-muted-foreground">{loan.author}</p>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Icon icon="mdi:calendar" className="h-3 w-3" />
                          Emprunté le {new Date(loan.loanDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Icon icon="mdi:calendar-clock" className="h-3 w-3" />
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConsultLoan(loan)}
                        className="gap-1"
                      >
                        <Icon icon="mdi:eye" className="h-4 w-4" />
                        Consulter
                      </Button>
                      <Button
                        size="sm"
                        disabled={!loan.canRenew}
                        onClick={() => handleRenew(loan.id)}
                        className="gap-1 bg-gold-bn-primary hover:bg-gold-bn-primary/90"
                      >
                        <Icon icon="mdi:refresh" className="h-4 w-4" />
                        Renouveler
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bn-blue-primary"></div>
              </div>
            ) : loanHistory.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Icon icon="mdi:history" className="h-16 w-16 mx-auto text-muted-foreground/30" />
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
                      <h3 className="font-semibold">{loan.title}</h3>
                      <p className="text-sm text-muted-foreground">{loan.author}</p>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Icon icon="mdi:calendar-range" className="h-3 w-3" />
                          Du {new Date(loan.loanDate).toLocaleDateString('fr-FR')} au {new Date(loan.returnDate).toLocaleDateString('fr-FR')}
                        </span>
                        {getStatusBadge(loan.status)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/digital-library`)}
                      className="gap-1"
                    >
                      <Icon icon="mdi:refresh" className="h-4 w-4" />
                      Emprunter à nouveau
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Help Card */}
        <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Icon icon="mdi:information-outline" className="h-4 w-4 text-bn-blue-primary" />
            Conditions d'emprunt
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Durée d'emprunt : 30 jours par période</li>
            <li>• Nombre de renouvellements : jusqu'à 3 fois selon disponibilité</li>
            <li>• Maximum d'emprunts simultanés : 5 documents</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}