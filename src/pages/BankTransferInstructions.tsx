import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Copy, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function BankTransferInstructions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requestData, setRequestData] = useState<any>(null);
  
  const requestId = searchParams.get("requestId");
  const amount = searchParams.get("amount");
  const requestNumber = searchParams.get("requestNumber");

  useEffect(() => {
    if (requestId && amount && requestNumber) {
      setRequestData({
        requestId,
        amount: parseFloat(amount),
        requestNumber
      });
    }
  }, [requestId, amount, requestNumber]);

  const bankInfo = {
    bankName: "Banque Nationale du Maroc (BNRM)",
    accountName: "Bibliothèque Nationale du Royaume du Maroc",
    iban: "MA64 0110 0000 0000 0000 0000 0001",
    swift: "BNMRMAM1XXX",
    reference: requestNumber || ""
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: `${label} copié dans le presse-papiers`,
    });
  };

  if (!requestData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Chargement des informations...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/my-library-space")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à Mon Espace
        </Button>

        <Card className="border-2 border-primary/20">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Instructions de virement bancaire en ligne</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Demande N° {requestData.requestNumber}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            {/* Montant à payer */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 mb-1">Montant à payer</p>
              <p className="text-3xl font-bold text-green-900">{requestData.amount} DH</p>
            </div>

            {/* Informations bancaires */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Coordonnées bancaires</h3>
              
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Nom de la banque</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{bankInfo.bankName}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankInfo.bankName, "Nom de la banque")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Nom du compte</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{bankInfo.accountName}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankInfo.accountName, "Nom du compte")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">IBAN</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium font-mono text-sm">{bankInfo.iban}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankInfo.iban, "IBAN")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Code SWIFT/BIC</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium font-mono">{bankInfo.swift}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankInfo.swift, "Code SWIFT")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-700 mb-1 font-semibold">Référence obligatoire</p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-amber-900 text-lg">{bankInfo.reference}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankInfo.reference, "Référence")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Veuillez mentionner cette référence dans le motif du virement
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Instructions importantes
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-semibold mt-0.5">1.</span>
                  <span>Effectuez le virement bancaire en ligne en utilisant les coordonnées ci-dessus</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold mt-0.5">2.</span>
                  <span>N'oubliez pas d'indiquer la référence <strong>{bankInfo.reference}</strong> dans le motif du virement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold mt-0.5">3.</span>
                  <span>Une fois le virement effectué, nous recevrons une notification automatique</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold mt-0.5">4.</span>
                  <span>Vous recevrez un email de confirmation dès validation du paiement (délai : 1-2 jours ouvrables)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold mt-0.5">5.</span>
                  <span>Vous pourrez récupérer votre manuscrit restauré après validation du paiement</span>
                </li>
              </ul>
            </div>

            {/* Bouton de retour */}
            <Button 
              className="w-full"
              size="lg"
              onClick={() => navigate("/my-library-space")}
            >
              J'ai effectué le virement
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
