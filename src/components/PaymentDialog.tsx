import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { CreditCard, Wallet, Building2, Shield, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  transactionType: 'reproduction' | 'subscription' | 'legal_deposit' | 'service_bnrm' | 'recharge_wallet';
  resourceId?: string;
  description?: string;
  onSuccess?: () => void;
}

export default function PaymentDialog({
  open,
  onOpenChange,
  amount,
  transactionType,
  resourceId,
  description,
  onSuccess,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("carte_bancaire");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Créer la session de paiement
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount,
          transactionType,
          resourceId,
          metadata: {
            description,
            payment_method: paymentMethod,
          },
        },
      });

      if (error) throw error;

      if (data.url) {
        // Ouvrir Stripe Checkout dans un nouvel onglet
        window.open(data.url, '_blank');
        
        toast.success("Redirection vers le paiement", {
          description: "Une nouvelle fenêtre s'est ouverte pour effectuer le paiement sécurisé.",
        });

        if (onSuccess) onSuccess();
        onOpenChange(false);
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error("Erreur de paiement", {
        description: error.message || "Une erreur est survenue lors de la création du paiement.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Paiement Sécurisé
          </DialogTitle>
          <DialogDescription>
            Effectuez votre paiement de manière sécurisée conforme aux normes marocaines (CMI) et internationales (PCI DSS, 3D Secure)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Montant */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Montant à payer</span>
              <span className="text-2xl font-bold text-primary">{amount.toFixed(2)} DH</span>
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-2">{description}</p>
            )}
          </Card>

          {/* Méthodes de paiement */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Mode de paiement</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <Card className={`p-4 cursor-pointer transition-all ${
                paymentMethod === 'carte_bancaire' ? 'border-primary bg-primary/5' : 'hover:bg-accent'
              }`}>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="carte_bancaire" id="carte" />
                  <Label htmlFor="carte" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">Carte bancaire</div>
                      <div className="text-xs text-muted-foreground">VISA, Mastercard - 3D Secure</div>
                    </div>
                  </Label>
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer transition-all ${
                paymentMethod === 'ewallet_bnrm' ? 'border-primary bg-primary/5' : 'hover:bg-accent'
              }`}>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="ewallet_bnrm" id="wallet" />
                  <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Wallet className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">e-Wallet BNRM</div>
                      <div className="text-xs text-muted-foreground">Portefeuille électronique BNRM</div>
                    </div>
                  </Label>
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer transition-all ${
                paymentMethod === 'virement' ? 'border-primary bg-primary/5' : 'hover:bg-accent'
              }`}>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="virement" id="virement" />
                  <Label htmlFor="virement" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Building2 className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">Virement bancaire</div>
                      <div className="text-xs text-muted-foreground">Transfert bancaire</div>
                    </div>
                  </Label>
                </div>
              </Card>
            </RadioGroup>
          </div>

          {/* Sécurité */}
          <Card className="p-3 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="flex items-start gap-2 text-sm">
              <Lock className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="text-green-800 dark:text-green-300">
                <div className="font-medium">Paiement 100% sécurisé</div>
                <div className="text-xs mt-1 text-green-700 dark:text-green-400">
                  Conforme CMI Maroc • PCI DSS • 3D Secure • SSL/TLS
                </div>
              </div>
            </div>
          </Card>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Traitement...
                </>
              ) : (
                `Payer ${amount.toFixed(2)} DH`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
