import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PaymentCanceled() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transaction_id');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Icône d'annulation */}
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"></div>
              <XCircle className="h-20 w-20 text-orange-500 relative" />
            </div>

            {/* Titre */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                Paiement Annulé
              </h1>
              <p className="text-muted-foreground">
                Votre transaction a été annulée
              </p>
            </div>

            {/* Message */}
            <div className="w-full space-y-4 bg-accent/50 rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                Aucun montant n'a été débité de votre compte.
                <br />
                Vous pouvez réessayer le paiement à tout moment.
              </p>
              {transactionId && (
                <p className="text-sm text-muted-foreground">
                  Référence de la transaction : <span className="font-mono">{transactionId}</span>
                </p>
              )}
            </div>

            {/* Informations */}
            <Card className="w-full p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
              <div className="flex items-start gap-2 text-sm">
                <XCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-yellow-800 dark:text-yellow-300">
                  <div className="font-medium">Transaction annulée</div>
                  <div className="text-xs mt-1 text-yellow-700 dark:text-yellow-400">
                    Si vous avez rencontré un problème pendant le paiement, n'hésitez pas à contacter notre support.
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
                onClick={() => navigate(-2)} // Retourner à la page avant le paiement
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>

            {/* Aide */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Besoin d'aide ?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/help')}>
                  Contactez le support
                </Button>
              </p>
            </div>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
