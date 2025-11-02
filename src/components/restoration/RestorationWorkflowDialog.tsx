import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, FileText, ClipboardCheck, DollarSign, Wrench, CheckCheck, Download } from "lucide-react";
import { useState } from "react";
import { 
  generateAuthorizationLetter, 
  generateReceptionDocument, 
  generateDiagnosisReport, 
  generateQuoteDocument, 
  generateCompletionCertificate,
  downloadDocument 
} from "@/lib/restorationDocumentGenerator";
import { useToast } from "@/hooks/use-toast";

interface WorkflowDialogProps {
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
}: WorkflowDialogProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDetails, setQuoteDetails] = useState('');
  const [diagnosisReport, setDiagnosisReport] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [restorationReport, setRestorationReport] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  const handleGenerateDocument = async () => {
    if (!request) return;
    
    setIsGeneratingDoc(true);
    try {
      let blob: Blob;
      let filename: string;
      
      switch (actionType) {
        case 'director_approve':
          blob = await generateAuthorizationLetter(request);
          filename = `autorisation_${request.request_number}.pdf`;
          break;
        case 'receive_artwork':
          blob = await generateReceptionDocument(request);
          filename = `reception_${request.request_number}.pdf`;
          break;
        case 'complete_diagnosis':
          blob = await generateDiagnosisReport({ ...request, diagnosis_report: diagnosisReport });
          filename = `diagnostic_${request.request_number}.pdf`;
          break;
        case 'send_quote':
          blob = await generateQuoteDocument({ 
            ...request, 
            quote_amount: parseFloat(quoteAmount), 
            quote_details: quoteDetails 
          });
          filename = `devis_${request.request_number}.pdf`;
          break;
        case 'complete_restoration':
          blob = await generateCompletionCertificate({ 
            ...request, 
            restoration_report: restorationReport 
          });
          filename = `certificat_${request.request_number}.pdf`;
          break;
        default:
          return;
      }
      
      downloadDocument(blob, filename);
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
        data.estimatedCost = estimatedCost;
        data.estimatedDuration = estimatedDuration;
        break;
      case 'receive_artwork':
        data.notes = notes;
        break;
      case 'complete_diagnosis':
        data.diagnosisReport = diagnosisReport;
        break;
      case 'send_quote':
        data.quoteAmount = quoteAmount;
        data.quoteDetails = quoteDetails;
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
    }

    onAction(actionType, data);
    onClose();
    
    // Reset fields
    setNotes('');
    setEstimatedCost('');
    setEstimatedDuration('');
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
            <>
              <div>
                <Label>Notes de la direction</Label>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Commentaires..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Coût estimé (DH)</Label>
                  <Input 
                    type="number" 
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
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
            </>
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
            <>
              <div>
                <Label>Montant du devis (DH)</Label>
                <Input 
                  type="number"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  placeholder="12000"
                />
              </div>
              <div>
                <Label>Détails du devis</Label>
                <Textarea 
                  value={quoteDetails}
                  onChange={(e) => setQuoteDetails(e.target.value)}
                  placeholder="Détails des travaux et coûts..."
                  rows={5}
                />
              </div>
            </>
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
