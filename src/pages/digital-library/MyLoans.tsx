import { useState } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, AlertCircle, RotateCw, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function MyLoans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    navigate("/auth");
    return null;
  }

  const [currentLoans, setCurrentLoans] = useState([
    {
      id: 1,
      title: "Al-Muqaddima (Les Prolégomènes)",
      author: "Ibn Khaldoun",
      loanDate: "2025-01-05",
      dueDate: "2025-02-05",
      daysRemaining: 18,
      renewalsLeft: 2,
      canRenew: true,
    },
    {
      id: 2,
      title: "Rihla (Voyages)",
      author: "Ibn Battuta",
      loanDate: "2025-01-10",
      dueDate: "2025-02-10",
      daysRemaining: 23,
      renewalsLeft: 3,
      canRenew: true,
    },
    {
      id: 3,
      title: "Histoire du Maroc moderne",
      author: "Archives BNRM",
      loanDate: "2024-12-20",
      dueDate: "2025-01-20",
      daysRemaining: 2,
      renewalsLeft: 0,
      canRenew: false,
    },
  ]);

  const loanHistory = [
    {
      id: 10,
      title: "Kitab al-Shifa",
      author: "Ibn Sina",
      loanDate: "2024-11-15",
      returnDate: "2024-12-15",
      status: "returned",
    },
    {
      id: 11,
      title: "Es-Saada - Journal",
      author: "Archives nationales",
      loanDate: "2024-10-20",
      returnDate: "2024-11-20",
      status: "returned",
    },
    {
      id: 12,
      title: "Al-Kulliyat fi al-Tibb",
      author: "Ibn Sina",
      loanDate: "2024-09-10",
      returnDate: "2024-10-12",
      status: "late_return",
    },
  ];

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
    if (days <= 7) return <Badge variant="secondary">{days} jours restants</Badge>;
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
                  <p className="text-3xl font-bold mt-1">
                    {currentLoans.filter(l => l.daysRemaining <= 7).length}
                  </p>
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

        {/* Notifications */}
        {currentLoans.some(loan => loan.daysRemaining <= 3) && (
          <Card className="mb-8 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Attention : Retours imminents</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous avez {currentLoans.filter(l => l.daysRemaining <= 3).length} emprunt(s) à retourner dans les 3 prochains jours.
                    Pensez à les renouveler si nécessaire.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                <div className="space-y-4">
                  {currentLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{loan.title}</h3>
                        <p className="text-sm text-muted-foreground">{loan.author}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Emprunté le {new Date(loan.loanDate).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
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
                          onClick={() => navigate(`/book-reader/${loan.id}`)}
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

                {currentLoans.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun emprunt en cours</p>
                    <Button className="mt-4" onClick={() => navigate("/digital-library")}>
                      Parcourir la bibliothèque
                    </Button>
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
                <div className="space-y-4">
                  {loanHistory.map((loan) => (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{loan.title}</h3>
                        <p className="text-sm text-muted-foreground">{loan.author}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
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
