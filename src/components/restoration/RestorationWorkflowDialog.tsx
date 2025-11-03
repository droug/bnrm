import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, FileText, ClipboardCheck, DollarSign, Wrench, CheckCheck, Download, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  generateAuthorizationLetter,
  generateReceptionDocument,
  generateDiagnosisReport,
  generateQuoteDocument,
  generateCompletionCertificate,
} from "@/lib/restorationPdfGenerator";

interface RestorationWorkflowDialogProps {
  open: boolean;
  onClose: () => void;
  request: any | null;
  onAction: (actionType: string, data: any) => void;
  actionType: string;
}

export function RestorationWorkflowDialog({ 
  open, 
  onClose, 
  request, 
  onAction, 
  actionType 
}: RestorationWorkflowDialogProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDetails, setQuoteDetails] = useState('');
  const [diagnosisReport, setDiagnosisReport] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [restorationReport, setRestorationReport] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  const handleGenerateDocument = () => {
    if (!request) return;
    
    setIsGeneratingDoc(true);
    try {
      const requestData = {
        ...request,
        diagnosis_report: diagnosisReport || request.diagnosis_report,
        quote_amount: quoteAmount ? parseFloat(quoteAmount) : request.quote_amount,
        restoration_report: restorationReport || request.restoration_report,
      };
      
      switch (actionType) {
        case 'director_approve':
          generateAuthorizationLetter(requestData);
          break;
        case 'receive_artwork':
          generateReceptionDocument(requestData);
          break;
        case 'complete_diagnosis':
          generateDiagnosisReport(requestData);
          break;
        case 'send_quote':
          generateQuoteDocument(requestData);
          break;
        case 'complete_restoration':
          generateCompletionCertificate(requestData);
          break;
        default:
          return;
      }
      
      toast({
        title: "Document généré",
        description: "Le document a été téléchargé avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de la génération du document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le document.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const handleSubmit = () => {
    const data: any = {};

    switch (actionType) {
      case 'director_approve':
      case 'director_reject':
        data.notes = notes;
        break;
      case 'receive_artwork':
        data.notes = notes;
        break;
      case 'complete_diagnosis':
        data.diagnosisReport = diagnosisReport;
        break;
      case 'send_quote':
        data.quoteAmount = quoteAmount;
        break;
      case 'accept_quote':
        // Pas de données supplémentaires nécessaires
        break;
      case 'reject_quote':
        data.notes = notes;
        break;
      case 'validate_payment':
        data.paymentReference = paymentReference;
        break;
      case 'complete_restoration':
        data.restorationReport = restorationReport;
        break;
      case 'return_artwork':
        data.completionNotes = completionNotes;
        break;
      case 'reset_request':
        // Pas de données nécessaires pour la réinitialisation
        break;
    }

    onAction(actionType, data);
    onClose();
    
    // Reset fields
    setNotes('');
    setQuoteAmount('');
    setQuoteDetails('');
    setDiagnosisReport('');
    setPaymentReference('');
    setRestorationReport('');
    setCompletionNotes('');
  };

  const getDialogContent = () => {
    switch (actionType) {
      case 'director_approve':
        return {
          title: 'Approuver la demande',
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          fields: (
            <div>
              <Label>Notes de la direction</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Commentaires..."
                rows={3}
              />
            </div>
          )
        };
      case 'director_reject':
        return {
          title: 'Refuser la demande',
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          fields: (
            <div>
              <Label>Motif du refus</Label>
              <Textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Raison du refus..."
                rows={4}
              />
            </div>
          )
        };
      case 'receive_artwork':
        return {
          title: 'Réceptionner l\'œuvre',
          icon: <FileText className="w-6 h-6 text-blue-500" />,
          fields: (
            <div>
              <Label>Notes de réception</Label>
              <Textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="État de l'œuvre à la réception..."
                rows={4}
              />
            </div>
          )
        };
      case 'complete_diagnosis':
        return {
          title: 'Compléter le diagnostic',
          icon: <ClipboardCheck className="w-6 h-6 text-purple-500" />,
          fields: (
            <div>
              <Label>Rapport de diagnostic</Label>
              <Textarea 
                value={diagnosisReport}
                onChange={(e) => setDiagnosisReport(e.target.value)}
                placeholder="Détails du diagnostic..."
                rows={6}
              />
            </div>
          )
        };
      case 'send_quote':
        return {
          title: 'Envoyer le devis',
          icon: <DollarSign className="w-6 h-6 text-green-500" />,
          fields: (
            <div>
              <Label>Montant du devis (DH)</Label>
              <Input 
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                placeholder="12000"
              />
            </div>
          )
        };
      case 'accept_quote':
        return {
          title: 'Accepter le devis',
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          fields: (
            <p className="text-sm text-muted-foreground">
              Confirmer l'acceptation du devis. Le statut passera en attente de paiement.
            </p>
          )
        };
      case 'reject_quote':
        return {
          title: 'Refuser le devis',
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          fields: (
            <div>
              <Label>Motif du refus</Label>
              <Textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Raison du refus du devis..."
                rows={4}
              />
            </div>
          )
        };
      case 'validate_payment':
        return {
          title: 'Valider le paiement',
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          fields: (
            <div>
              <Label>Référence de paiement</Label>
              <Input 
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="REF-PAY-2024-001"
              />
            </div>
          )
        };
      case 'start_restoration':
        return {
          title: 'Démarrer la restauration',
          icon: <Wrench className="w-6 h-6 text-orange-500" />,
          fields: (
            <p className="text-sm text-muted-foreground">
              Confirmer le démarrage des travaux de restauration
            </p>
          )
        };
      case 'complete_restoration':
        return {
          title: 'Terminer la restauration',
          icon: <CheckCheck className="w-6 h-6 text-green-500" />,
          fields: (
            <div>
              <Label>Rapport final de restauration</Label>
              <Textarea 
                value={restorationReport}
                onChange={(e) => setRestorationReport(e.target.value)}
                placeholder="Travaux effectués, résultats..."
                rows={6}
              />
            </div>
          )
        };
      case 'return_artwork':
        return {
          title: 'Retourner l\'œuvre',
          icon: <FileText className="w-6 h-6 text-blue-500" />,
          fields: (
            <div>
              <Label>Notes de clôture</Label>
              <Textarea 
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Notes finales..."
                rows={3}
              />
            </div>
          )
        };
      case 'reset_request':
        return {
          title: 'Réinitialiser la demande (Test)',
          icon: <RotateCcw className="w-6 h-6 text-gray-500" />,
          fields: (
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Cette action va réinitialiser la demande au statut initial "Soumise" et effacer toutes les données du workflow.</p>
              <p className="font-semibold text-destructive">⚠️ Cette fonction est destinée aux tests uniquement.</p>
            </div>
          )
        };
      default:
        return { title: '', icon: null, fields: null };
    }
  };

  const content = getDialogContent();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {content.icon}
            <DialogTitle>{content.title}</DialogTitle>
          </div>
          <DialogDescription>
            Demande: {request?.request_number} - {request?.manuscript_title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {content.fields}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          {['director_approve', 'receive_artwork', 'complete_diagnosis', 'send_quote', 'complete_restoration'].includes(actionType) && (
            <Button 
              variant="secondary" 
              onClick={handleGenerateDocument}
              disabled={isGeneratingDoc}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingDoc ? 'Génération...' : 'Générer document'}
            </Button>
          )}
          <Button onClick={handleSubmit}>
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
