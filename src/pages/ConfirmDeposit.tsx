import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertTriangle, Loader2, FileText, Building2, Printer } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface TokenInfo {
  id: string;
  request_id: string;
  party_type: string;
  email: string;
  status: string;
  expires_at: string;
  legal_deposit_requests: {
    request_number: string;
    title: string;
    confirmation_status: string;
  };
}

export default function ConfirmDeposit() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    if (token) {
      fetchTokenInfo();
    }
  }, [token]);

  const fetchTokenInfo = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("deposit-confirmation", {
        body: { action: "get_status", token },
      });

      if (error) throw error;

      if (data.success && data.tokens && data.tokens.length > 0) {
        setTokenInfo(data.tokens[0]);
        
        if (data.tokens[0].status === "confirmed") {
          setConfirmed(true);
        } else if (data.tokens[0].status === "rejected") {
          setRejected(true);
        }
      } else {
        setError("Token invalide ou expiré");
      }
    } catch (err: any) {
      console.error("Error fetching token info:", err);
      setError(err.message || "Erreur lors de la récupération des informations");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("deposit-confirmation", {
        body: { action: "confirm", token },
      });

      if (error) throw error;

      if (data.success) {
        setConfirmed(true);
        toast.success("Confirmation enregistrée avec succès !");
      } else {
        throw new Error(data.error || "Erreur lors de la confirmation");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la confirmation");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Veuillez indiquer la raison du refus");
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("deposit-confirmation", {
        body: { 
          action: "reject", 
          token,
          rejection_reason: rejectionReason 
        },
      });

      if (error) throw error;

      if (data.success) {
        setRejected(true);
        toast.success("Refus enregistré. L'initiateur sera notifié.");
      } else {
        throw new Error(data.error || "Erreur lors du refus");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du refus");
    } finally {
      setProcessing(false);
    }
  };

  const isExpired = tokenInfo && new Date(tokenInfo.expires_at) < new Date();
  const partyTypeFr = tokenInfo?.party_type === "editor" ? "Éditeur" : "Imprimeur";
  const PartyIcon = tokenInfo?.party_type === "editor" ? Building2 : Printer;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-16 flex justify-center items-center">
          <Card className="w-full max-w-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Vérification du lien de confirmation...</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !tokenInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-16 flex justify-center items-center">
          <Card className="w-full max-w-lg border-destructive/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Lien invalide</CardTitle>
              <CardDescription>
                {error || "Ce lien de confirmation n'est plus valide ou a expiré."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>
                Retour à l'accueil
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (confirmed || tokenInfo.status === "confirmed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-16 flex justify-center items-center">
          <Card className="w-full max-w-lg border-green-500/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Confirmation enregistrée</CardTitle>
              <CardDescription>
                Votre participation à cette demande de dépôt légal a été confirmée.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">N° de demande:</span>
                  <span className="font-semibold">{tokenInfo.legal_deposit_requests?.request_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Titre:</span>
                  <span className="font-semibold truncate max-w-[200px]">{tokenInfo.legal_deposit_requests?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Votre rôle:</span>
                  <span className="font-semibold">{partyTypeFr}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                La demande sera transmise à la BNRM une fois que toutes les parties auront confirmé.
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={() => navigate("/my-space")}>
                Accéder à mon espace
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (rejected || tokenInfo.status === "rejected") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-16 flex justify-center items-center">
          <Card className="w-full max-w-lg border-orange-500/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-orange-600">Participation refusée</CardTitle>
              <CardDescription>
                Vous avez refusé de participer à cette demande de dépôt légal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                L'initiateur de la demande a été notifié de votre décision.
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>
                Retour à l'accueil
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-16 flex justify-center items-center">
          <Card className="w-full max-w-lg border-amber-500/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-amber-600">Lien expiré</CardTitle>
              <CardDescription>
                Ce lien de confirmation a expiré. Le délai de 15 jours est dépassé.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Veuillez contacter l'initiateur de la demande pour qu'il vous renvoie un nouveau lien.
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="outline" onClick={() => navigate("/")}>
                Retour à l'accueil
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <main className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <PartyIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Confirmation de participation</CardTitle>
            <CardDescription>
              Vous êtes invité à confirmer votre participation en tant que <strong>{partyTypeFr}</strong>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Demande de dépôt légal</p>
                  <p className="font-semibold">{tokenInfo.legal_deposit_requests?.request_number}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Titre de l'ouvrage</p>
                  <p className="font-semibold">{tokenInfo.legal_deposit_requests?.title || "Non spécifié"}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>⏳ Délai:</strong> Vous avez jusqu'au{" "}
                <strong>{new Date(tokenInfo.expires_at).toLocaleDateString("fr-FR", { 
                  day: "numeric", 
                  month: "long", 
                  year: "numeric" 
                })}</strong>{" "}
                pour confirmer ou refuser cette demande.
              </p>
            </div>

            {showRejectForm && (
              <div className="space-y-3 pt-2">
                <Textarea
                  placeholder="Veuillez indiquer la raison de votre refus..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-3">
            {!showRejectForm ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => setShowRejectForm(true)}
                  disabled={processing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Refuser
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleConfirm}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Confirmer
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRejectForm(false)}
                  disabled={processing}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Confirmer le refus
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
