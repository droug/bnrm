import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);

  const sessionId = searchParams.get('session_id');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    if (sessionId && transactionId) {
      verifyPayment();
    }
  }, [sessionId, transactionId]);

  const verifyPayment = async () => {
    try {
      setIsVerifying(true);

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          sessionId,
          transactionId,
        },
      });

      if (error) throw error;

      if (data.success) {
        setTransaction(data.transaction);
        toast.success("Paiement confirmé", {
          description: "Votre paiement a été traité avec succès.",
        });
      } else {
        toast.error("Échec du paiement", {
          description: "Le paiement n'a pas pu être confirmé.",
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast.error("Erreur de vérification", {
        description: error.message || "Une erreur est survenue lors de la vérification du paiement.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-xl font-semibold">Vérification du paiement...</h2>
              <p className="text-sm text-muted-foreground text-center">
                Veuillez patienter pendant que nous confirmons votre transaction.
              </p>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Icône de succès */}
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
              <CheckCircle2 className="h-20 w-20 text-green-500 relative" />
            </div>

            {/* Titre */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
                Paiement Réussi !
              </h1>
              <p className="text-muted-foreground">
                Votre transaction a été traitée avec succès
              </p>
            </div>

            {/* Détails de la transaction */}
            {transaction && (
              <div className="w-full space-y-4 bg-accent/50 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Numéro de transaction</p>
                    <p className="font-mono font-semibold">{transaction.transaction_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Montant</p>
                    <p className="text-xl font-bold text-primary">
                      {transaction.amount.toFixed(2)} {transaction.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-semibold capitalize">
                      {transaction.transaction_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      Complété
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Informations de sécurité */}
            <Card className="w-full p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-blue-800 dark:text-blue-300">
                  <div className="font-medium">Transaction sécurisée</div>
                  <div className="text-xs mt-1 text-blue-700 dark:text-blue-400">
                    Cette transaction a été traitée de manière sécurisée selon les normes CMI Maroc, PCI DSS et 3D Secure.
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 w-full pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
              <Button
                className="flex-1"
                onClick={() => window.print()}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le reçu
              </Button>
            </div>

            {/* Note */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              Un email de confirmation a été envoyé à votre adresse email.
              <br />
              Conservez ce reçu pour vos archives.
            </p>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
