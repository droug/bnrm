import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, XCircle, Upload, FileText, 
  Wrench, Package, CreditCard, Clock 
} from "lucide-react";

interface WorkflowDialogProps {
  open: boolean;
  onClose: () => void;
  request: any;
  onAction: (action: string, data: any) => void;
  actionType: string;
}

export function RestorationWorkflowDialog({ 
  open, 
  onClose, 
  request, 
  onAction,
  actionType 
}: WorkflowDialogProps) {
  const [notes, setNotes] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
  const [diagnosisReport, setDiagnosisReport] = useState("");
  const [artworkCondition, setArtworkCondition] = useState("");
  const [restorationReport, setRestorationReport] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const getDialogContent = () => {
    switch (actionType) {
      case "director_approve":
        return {
          title: "Autoriser la restauration",
          description: "Autorisation de la Directrice pour la restauration",
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          fields: (
            <div>
              <Label>Notes d'autorisation</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes de la direction..."
                rows={4}
              />
            </div>
          )
        };
      
      case "director_reject":
        return {
          title: "Refuser la demande",
          description: "Refus de la demande par la Direction",
          icon: <XCircle className="h-6 w-6 text-red-500" />,
          fields: (
            <div>
              <Label>Motif du refus (obligatoire)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Raison du refus..."
                rows={4}
                required
              />
            </div>
          )
        };

      case "receive_artwork":
        return {
          title: "Réception de l'œuvre",
          description: "Confirmer la réception physique de l'œuvre",
          icon: <Package className="h-6 w-6 text-blue-500" />,
          fields: (
            <div className="space-y-4">
              <div>
                <Label>État à la réception</Label>
                <Textarea
                  value={artworkCondition}
                  onChange={(e) => setArtworkCondition(e.target.value)}
                  placeholder="Description de l'état de l'œuvre à la réception..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes additionnelles..."
                  rows={3}
                />
              </div>
            </div>
          )
        };

      case "complete_diagnosis":
        return {
          title: "Établir le diagnostic",
          description: "Diagnostic technique et devis de restauration",
          icon: <FileText className="h-6 w-6 text-purple-500" />,
          fields: (
            <div className="space-y-4">
              <div>
                <Label>Rapport de diagnostic</Label>
                <Textarea
                  value={diagnosisReport}
                  onChange={(e) => setDiagnosisReport(e.target.value)}
                  placeholder="Diagnostic technique détaillé..."
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Montant du devis (DH)</Label>
                  <Input
                    type="number"
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label>Durée estimée (jours)</Label>
                  <Input
                    type="number"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
          )
        };

      case "validate_payment":
        return {
          title: "Valider le paiement",
          description: "Confirmation du paiement par la Régie",
          icon: <CreditCard className="h-6 w-6 text-green-500" />,
          fields: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Référence de paiement</Label>
                  <Input
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="REF-2024-001"
                  />
                </div>
                <div>
                  <Label>Montant payé (DH)</Label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="5000"
                  />
                </div>
              </div>
              <div>
                <Label>Numéro de facture</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="FAC-2024-001"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes additionnelles..."
                  rows={3}
                />
              </div>
            </div>
          )
        };

      case "start_restoration":
        return {
          title: "Démarrer la restauration",
          description: "Commencer les travaux de restauration",
          icon: <Wrench className="h-6 w-6 text-amber-500" />,
          fields: (
            <div>
              <Label>Notes de démarrage</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes sur le début de la restauration..."
                rows={4}
              />
            </div>
          )
        };

      case "complete_restoration":
        return {
          title: "Terminer la restauration",
          description: "Finaliser les travaux de restauration",
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          fields: (
            <div className="space-y-4">
              <div>
                <Label>Rapport de restauration</Label>
                <Textarea
                  value={restorationReport}
                  onChange={(e) => setRestorationReport(e.target.value)}
                  placeholder="Rapport détaillé des travaux réalisés..."
                  rows={5}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes additionnelles..."
                  rows={3}
                />
              </div>
            </div>
          )
        };

      case "return_artwork":
        return {
          title: "Restituer l'œuvre",
          description: "Confirmation de la restitution au demandeur",
          icon: <Package className="h-6 w-6 text-blue-500" />,
          fields: (
            <div>
              <Label>Notes de restitution</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes sur la restitution..."
                rows={4}
              />
            </div>
          )
        };

      default:
        return {
          title: "Action",
          description: "",
          icon: null,
          fields: null
        };
    }
  };

  const handleSubmit = () => {
    const data: any = { notes };
    
    switch (actionType) {
      case "complete_diagnosis":
        data.diagnosisReport = diagnosisReport;
        data.quoteAmount = quoteAmount ? parseFloat(quoteAmount) : undefined;
        data.estimatedDuration = estimatedDuration ? parseInt(estimatedDuration) : undefined;
        break;
      case "receive_artwork":
        data.artworkCondition = artworkCondition;
        break;
      case "complete_restoration":
        data.restorationReport = restorationReport;
        break;
      case "validate_payment":
        data.paymentReference = paymentReference;
        data.paymentAmount = paymentAmount ? parseFloat(paymentAmount) : undefined;
        data.invoiceNumber = invoiceNumber;
        break;
    }

    onAction(actionType, data);
  };

  const content = getDialogContent();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {content.icon}
            <div>
              <DialogTitle>{content.title}</DialogTitle>
              <DialogDescription>{content.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {content.fields}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={actionType.includes("reject") && !notes}
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
