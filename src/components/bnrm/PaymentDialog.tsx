import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Wallet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  currency: string;
  subscriptionType: "monthly" | "annual";
  serviceName: string;
  serviceId: string;
  tariffId: string;
  onPaymentSuccess: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  amount,
  currency,
  subscriptionType,
  serviceName,
  serviceId,
  tariffId,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletId, setWalletId] = useState<string | null>(null);

  useEffect(() => {
    if (user && open) {
      loadWalletBalance();
    }
  }, [user, open]);

  const loadWalletBalance = async () => {
    if (!user) return;

    try {
      const { data: wallet, error } = await supabase
        .from("bnrm_wallets")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (wallet) {
        setWalletBalance(Number(wallet.balance));
        setWalletId(wallet.id);
      } else {
        // Créer un portefeuille si inexistant
        const { data: newWallet, error: createError } = await supabase
          .from("bnrm_wallets")
          .insert({
            user_id: user.id,
            balance: 0,
            currency: "MAD",
          })
          .select()
          .single();

        if (createError) throw createError;

        setWalletBalance(0);
        setWalletId(newWallet.id);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement du portefeuille:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le solde du portefeuille",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    if (!user || !walletId) return;

    const totalAmount = subscriptionType === "monthly" ? amount : amount * 12;

    if (walletBalance < totalAmount) {
      toast({
        title: "Solde insuffisant",
        description: `Votre solde actuel (${walletBalance} ${currency}) est insuffisant. Veuillez recharger votre portefeuille.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Débiter le portefeuille
      const { error: walletError } = await supabase.rpc("update_wallet_balance", {
        p_wallet_id: walletId,
        p_amount: -totalAmount,
        p_transaction_type: "debit",
        p_description: `Paiement abonnement ${subscriptionType} - ${serviceName}`,
      });

      if (walletError) throw walletError;

      // Mettre à jour le statut de l'abonnement
      const { error: subError } = await supabase
        .from("service_subscriptions")
        .update({
          status: "active",
          payment_status: "paid",
          payment_date: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("service_id", serviceId)
        .eq("tariff_id", tariffId)
        .eq("subscription_type", subscriptionType);

      if (subError) throw subError;

      // Mettre à jour le statut de l'inscription
      const { error: regError } = await supabase
        .from("service_registrations")
        .update({
          status: "active",
          is_paid: true,
        })
        .eq("user_id", user.id)
        .eq("service_id", serviceId);

      if (regError) throw regError;

      toast({
        title: "Paiement réussi",
        description: "Votre abonnement a été activé avec succès",
      });

      onPaymentSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erreur lors du paiement:", error);
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = subscriptionType === "monthly" ? amount : amount * 12;
  const hasInsufficientFunds = walletBalance < totalAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="max-w-md sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Paiement de l'abonnement</DialogTitle>
          <DialogDescription>
            Confirmez le paiement pour activer votre abonnement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations sur le service */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Service:</span>
              <span className="font-medium">{serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Type:</span>
              <span className="font-medium">
                {subscriptionType === "monthly" ? "Mensuel" : "Annuel"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-semibold">Montant total:</span>
              <span className="text-2xl font-bold text-primary">
                {totalAmount.toFixed(2)} {currency}
              </span>
            </div>
          </div>

          {/* Solde du portefeuille */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Solde du portefeuille:</span>
            </div>
            <span className={`text-lg font-bold ${hasInsufficientFunds ? "text-destructive" : "text-green-600"}`}>
              {walletBalance.toFixed(2)} {currency}
            </span>
          </div>

          {/* Alerte solde insuffisant */}
          {hasInsufficientFunds && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Solde insuffisant. Veuillez recharger votre portefeuille pour continuer.
              </AlertDescription>
            </Alert>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isLoading || hasInsufficientFunds}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Confirmer le paiement"
              )}
            </Button>
          </div>

          {hasInsufficientFunds && (
            <Button
              variant="link"
              onClick={() => {
                // TODO: Rediriger vers la page de rechargement du portefeuille
                toast({
                  title: "Rechargement du portefeuille",
                  description: "Fonctionnalité de rechargement à venir",
                });
              }}
              className="w-full"
            >
              Recharger mon portefeuille
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
