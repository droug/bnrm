import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, FileText, ClipboardCheck, DollarSign, Wrench, CheckCheck, Download, RotateCcw, Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [conservationState, setConservationState] = useState('');
  const [identifiedDamages, setIdentifiedDamages] = useState('');
  const [recommendedWorks, setRecommendedWorks] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [requiredMaterials, setRequiredMaterials] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('');
  const [signedQuoteFile, setSignedQuoteFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [restorationReport, setRestorationReport] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [generatingDocType, setGeneratingDocType] = useState<'diagnosis' | 'quote' | null>(null);

  const handleGenerateDocument = async (docType?: 'diagnosis' | 'quote') => {
    if (!request) return;
    
    setIsGeneratingDoc(true);
    setGeneratingDocType(docType || null);
    try {
      const requestData = {
        ...request,
        diagnosis_report: diagnosisReport || request.diagnosis_report,
        quote_amount: quoteAmount ? parseFloat(quoteAmount) : request.quote_amount,
        restoration_report: restorationReport || request.restoration_report,
        estimated_cost: estimatedCost ? parseFloat(estimatedCost) : request.estimated_cost,
        estimated_duration: estimatedDuration ? parseFloat(estimatedDuration) : request.estimated_duration,
      };
      
      if (docType === 'diagnosis') {
        await generateDiagnosisReport(requestData);
        toast({
          title: "Rapport de diagnostic généré",
          description: "Le rapport a été téléchargé avec succès.",
        });
      } else if (docType === 'quote') {
        await generateQuoteDocument(requestData);
        toast({
          title: "Devis généré",
          description: "Le devis a été téléchargé avec succès.",
        });
      } else {
        // Logique pour les autres types de documents
        switch (actionType) {
          case 'director_approve':
            await generateAuthorizationLetter(requestData);
            break;
          case 'receive_artwork':
            await generateReceptionDocument(requestData);
            break;
          case 'complete_restoration':
            await generateCompletionCertificate(requestData);
            break;
          default:
            return;
        }
        
        toast({
          title: "Document généré",
          description: "Le document a été téléchargé avec succès.",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la génération du document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le document.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDoc(false);
      setGeneratingDocType(null);
    }
  };

  const handleSubmit = async () => {
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
        data.conservationState = conservationState;
        data.identifiedDamages = identifiedDamages;
        data.recommendedWorks = recommendedWorks;
        data.estimatedCost = estimatedCost;
        data.estimatedDuration = estimatedDuration;
        data.requiredMaterials = requiredMaterials;
        data.urgencyLevel = urgencyLevel;
        break;
      case 'send_quote':
        data.quoteAmount = quoteAmount;
        break;
      case 'accept_quote':
        // Upload le fichier du devis signé si présent
        if (signedQuoteFile && request) {
          setIsUploadingFile(true);
          try {
            const fileExt = signedQuoteFile.name.split('.').pop();
            const fileName = `${request.user_id}/${request.id}/signed-quote-${Date.now()}.${fileExt}`;
            
            const { error: uploadError, data: uploadData } = await supabase.storage
              .from('restoration-documents')
              .upload(fileName, signedQuoteFile);
            
            if (uploadError) throw uploadError;
            
            // Obtenir l'URL publique
            const { data: urlData } = supabase.storage
              .from('restoration-documents')
              .getPublicUrl(fileName);
            
            data.signedQuoteUrl = urlData.publicUrl;
          } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            toast({
              title: "Erreur d'upload",
              description: "Impossible de télécharger le fichier.",
              variant: "destructive",
            });
            setIsUploadingFile(false);
            return;
          } finally {
            setIsUploadingFile(false);
          }
        }
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
    setConservationState('');
    setIdentifiedDamages('');
    setRecommendedWorks('');
    setEstimatedCost('');
    setEstimatedDuration('');
    setRequiredMaterials('');
    setUrgencyLevel('');
    setPaymentReference('');
    setRestorationReport('');
    setCompletionNotes('');
    setSignedQuoteFile(null);
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
            <div className="space-y-4">
              <div>
                <Label>État de conservation</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={conservationState}
                  onChange={(e) => setConservationState(e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  <option value="excellent">Excellent</option>
                  <option value="bon">Bon</option>
                  <option value="moyen">Moyen</option>
                  <option value="mauvais">Mauvais</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
              
              <div>
                <Label>Dommages identifiés</Label>
                <Textarea 
                  value={identifiedDamages}
                  onChange={(e) => setIdentifiedDamages(e.target.value)}
                  placeholder="Décrire les dommages constatés (déchirures, taches, moisissures, etc.)..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Rapport de diagnostic détaillé</Label>
                <Textarea 
                  value={diagnosisReport}
                  onChange={(e) => setDiagnosisReport(e.target.value)}
                  placeholder="Analyse complète de l'état du manuscrit..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label>Travaux recommandés</Label>
                <Textarea 
                  value={recommendedWorks}
                  onChange={(e) => setRecommendedWorks(e.target.value)}
                  placeholder="Décrire les interventions nécessaires..."
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
              
              <div>
                <Label>Matériaux nécessaires</Label>
                <Textarea 
                  value={requiredMaterials}
                  onChange={(e) => setRequiredMaterials(e.target.value)}
                  placeholder="Liste des matériaux et fournitures requis..."
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Niveau d'urgence</Label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  <option value="faible">Faible</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
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
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Confirmer l'acceptation du devis. Le statut passera en attente de paiement.
              </p>
              <div>
                <Label htmlFor="signedQuote">Devis signé (optionnel)</Label>
                <div className="mt-2">
                  <Input
                    id="signedQuote"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Vérifier la taille du fichier (max 10MB)
                        if (file.size > 10 * 1024 * 1024) {
                          toast({
                            title: "Erreur",
                            description: "Le fichier est trop volumineux (max 10MB).",
                            variant: "destructive",
                          });
                          e.target.value = '';
                          return;
                        }
                        setSignedQuoteFile(file);
                      }
                    }}
                    className="cursor-pointer"
                  />
                  {signedQuoteFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="w-4 h-4" />
                      <span>{signedQuoteFile.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Formats acceptés: PDF, JPG, PNG (max 10 MB)
                </p>
              </div>
            </div>
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
          {actionType === 'complete_diagnosis' ? (
            <>
              <Button 
                variant="secondary" 
                onClick={() => handleGenerateDocument('diagnosis')}
                disabled={isGeneratingDoc}
              >
                <Download className="w-4 h-4 mr-2" />
                {generatingDocType === 'diagnosis' ? 'Génération...' : 'Générer Rapport Diagnostic'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => handleGenerateDocument('quote')}
                disabled={isGeneratingDoc}
              >
                <Download className="w-4 h-4 mr-2" />
                {generatingDocType === 'quote' ? 'Génération...' : 'Générer Devis'}
              </Button>
            </>
          ) : ['director_approve', 'receive_artwork', 'send_quote', 'complete_restoration'].includes(actionType) ? (
            <Button 
              variant="secondary" 
              onClick={() => handleGenerateDocument()}
              disabled={isGeneratingDoc}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingDoc ? 'Génération...' : 'Générer document'}
            </Button>
          ) : null}
          <Button onClick={handleSubmit} disabled={isUploadingFile}>
            {isUploadingFile ? 'Upload en cours...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
