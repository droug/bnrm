import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, ArrowRight, Archive, FileText, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  generateConfirmationLetter as generateConfirmationPDF,
  generateRejectionLetter as generateRejectionPDF,
  generateContract as generateContractPDF, 
  generateInvoice as generateInvoicePDF, 
  generateInventoryReport as generateInventoryPDF 
} from "@/utils/culturalSpacePdfGenerator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WorkflowStep {
  step_order: number;
  step_name: string;
  step_code: string;
  assigned_role: string;
  description: string;
}

interface WorkflowHistoryEntry {
  step_name: string;
  decision: string;
  comment: string | null;
  processed_by_email: string;
  processed_at: string;
}

interface BookingWorkflowProcessorProps {
  booking: any;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingWorkflowProcessor({ booking, open, onClose, onSuccess }: BookingWorkflowProcessorProps) {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowHistoryEntry[]>([]);
  const [comment, setComment] = useState("");
  const [processing, setProcessing] = useState(false);
  const [generatingDoc, setGeneratingDoc] = useState(false);
  
  // Champs pour les documents
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [damageAmount, setDamageAmount] = useState("");
  const [damageDescription, setDamageDescription] = useState("");
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: string;
    variant?: 'default' | 'destructive';
  }>({
    open: false,
    title: '',
    description: '',
    action: '',
    variant: 'default'
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (open && booking) {
      loadWorkflowData();
    }
  }, [open, booking]);

  const loadWorkflowData = async () => {
    try {
      // Charger les étapes du workflow
      const { data: steps } = await supabase
        .from('booking_workflow_steps')
        .select('*')
        .order('step_order', { ascending: true });
      
      if (steps) setWorkflowSteps(steps);

      // Charger l'historique
      const { data: history } = await supabase
        .rpc('get_booking_workflow_history', {
          p_booking_id: booking.id
        });
      
      if (history) setWorkflowHistory(history);
    } catch (error) {
      console.error('Error loading workflow data:', error);
    }
  };

  const openConfirmDialog = (action: string, title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    setConfirmDialog({
      open: true,
      title,
      description,
      action,
      variant
    });
  };

  const handleWorkflowAction = async (decision: string) => {
    // Validation des commentaires requis
    if ((decision === 'refusee' || decision === 'verification_en_cours') && !comment.trim()) {
      toast({
        title: "Attention",
        description: "Un commentaire est requis pour cette action",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setConfirmDialog({ ...confirmDialog, open: false });
    
    try {
      const { data, error } = await supabase.rpc('advance_booking_workflow', {
        p_booking_id: booking.id,
        p_decision: decision,
        p_comment: comment.trim() || null
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        const actionMessages: Record<string, string> = {
          'validee': 'Demande validée avec succès',
          'refusee': 'Demande refusée',
          'verification_en_cours': 'Mise en vérification',
          'confirmee': 'Demande confirmée',
          'en_contrat': 'Contrat signé',
          'facturee': 'Facture émise',
          'degats_constates': 'Dégâts constatés',
          'cloturee': 'Dossier clôturé',
          'archivee_sans_suite': 'Dossier archivé sans suite'
        };

        if (result.workflow_completed) {
          toast({
            title: "Workflow terminé",
            description: actionMessages[decision] || 'Workflow complété',
          });
        } else {
          toast({
            title: "Étape suivante",
            description: `${actionMessages[decision] || 'Action effectuée'}. Prochaine étape: ${result.next_step}`,
          });
        }
        onSuccess();
        onClose();
        setComment("");
      } else {
        toast({
          title: "Erreur",
          description: result?.error || "Erreur lors du traitement",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing workflow:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement du workflow",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStepStatus = (stepOrder: number) => {
    const currentStepOrder = booking?.current_step_order || 1;
    if (stepOrder < currentStepOrder) return 'completed';
    if (stepOrder === currentStepOrder) return 'current';
    return 'pending';
  };

  const getDecisionBadge = (decision: string) => {
    const config = {
      demarrage: { label: "Démarrage", className: "bg-blue-100 text-blue-800" },
      validee: { label: "Validée", className: "bg-green-100 text-green-800" },
      refusee: { label: "Refusée", className: "bg-red-100 text-red-800" },
      verification_en_cours: { label: "Vérification en cours", className: "bg-orange-100 text-orange-800" },
      confirmee: { label: "Confirmée", className: "bg-teal-100 text-teal-800" },
      en_contrat: { label: "En contrat", className: "bg-purple-100 text-purple-800" },
      facturee: { label: "Facturée", className: "bg-indigo-100 text-indigo-800" },
      degats_constates: { label: "Dégâts constatés", className: "bg-yellow-100 text-yellow-800" },
      cloturee: { label: "Clôturée", className: "bg-gray-100 text-gray-800" },
      archivee_sans_suite: { label: "Archivée sans suite", className: "bg-gray-200 text-gray-600" },
    };
    const c = config[decision as keyof typeof config] || { label: decision, className: "bg-gray-100 text-gray-800" };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const generateDocument = async (docType: string) => {
    if (!booking) return;
    
    setGeneratingDoc(true);
    try {
      const space = {
        name: booking.cultural_spaces?.name || "Espace non spécifié",
        capacity: booking.participants_count,
        description: booking.event_description,
        location: ""
      };

      const bookingData = {
        id: booking.id,
        booking_number: booking.booking_number || booking.id.substring(0, 8).toUpperCase(),
        organization_name: booking.organization_name,
        organization_type: booking.organization_type,
        contact_person: booking.contact_person,
        phone: booking.contact_phone,
        email: booking.contact_email,
        activity_type: booking.event_title,
        activity_description: booking.event_description,
        start_date: booking.start_date,
        end_date: booking.end_date,
        duration_type: booking.duration_type,
        expected_attendees: booking.participants_count,
        special_requirements: booking.admin_notes || "",
        total_amount: booking.total_amount,
        status: booking.status,
        space_id: booking.space_id
      };

      switch (docType) {
        case 'confirmation':
          await generateConfirmationPDF(bookingData, space);
          toast({ title: "✓ Lettre de confirmation générée" });
          break;
        case 'rejection':
          await generateRejectionPDF(bookingData, space, comment);
          toast({ title: "✓ Lettre de refus générée" });
          break;
        case 'contract':
          await generateContractPDF(bookingData, space, contractNumber);
          toast({ title: "✓ Contrat généré" });
          break;
        case 'invoice':
          await generateInvoicePDF(bookingData, space, invoiceNumber);
          toast({ title: "✓ Facture générée" });
          break;
        case 'inventory_entry':
          await generateInventoryPDF(bookingData, space);
          toast({ title: "✓ État des lieux d'entrée généré" });
          break;
        case 'inventory_exit':
          await generateInventoryPDF(bookingData, space);
          toast({ title: "✓ État des lieux de sortie généré" });
          break;
        case 'damage_invoice':
          const damageBookingData = {
            ...bookingData,
            total_amount: parseFloat(damageAmount) || 0,
            special_requirements: `${bookingData.special_requirements}\n\nDégâts constatés:\n${damageDescription}`
          };
          await generateInvoicePDF(damageBookingData, space, invoiceNumber);
          toast({ title: "✓ Facture complémentaire pour dégâts générée" });
          break;
      }
    } catch (error) {
      console.error('Error generating document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le document",
        variant: "destructive",
      });
    } finally {
      setGeneratingDoc(false);
    }
  };

  const getDocumentsForCurrentStep = () => {
    if (!booking?.current_step_code) return null;

    const stepCode = booking.current_step_code;
    
    // E02 - Décision de la Direction
    if (stepCode === 'e02_decision_direction') {
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Documents disponibles:</h4>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateDocument('confirmation')}
              disabled={generatingDoc}
            >
              <FileText className="h-4 w-4 mr-2" />
              Lettre de confirmation
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateDocument('rejection')}
              disabled={generatingDoc}
            >
              <FileText className="h-4 w-4 mr-2" />
              Lettre de rejet
            </Button>
          </div>
        </div>
      );
    }

    // E03 - Traitement par le DAC
    if (stepCode === 'e03_traitement_dac') {
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Documents disponibles:</h4>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateDocument('confirmation')}
              disabled={generatingDoc}
            >
              <FileText className="h-4 w-4 mr-2" />
              Lettre de confirmation
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateDocument('rejection')}
              disabled={generatingDoc}
            >
              <FileText className="h-4 w-4 mr-2" />
              Lettre de refus
            </Button>
          </div>
        </div>
      );
    }

    // E04 - Contractualisation
    if (stepCode === 'e04_contractualisation') {
      return (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Documents disponibles:</h4>
          <div className="space-y-2">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="contract-number" className="text-xs">N° Contrat (optionnel)</Label>
                <Input
                  id="contract-number"
                  placeholder="CT/2025/001"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateDocument('contract')}
                disabled={generatingDoc}
              >
                <Download className="h-4 w-4 mr-2" />
                Générer contrat
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // E05 - Facturation
    if (stepCode === 'e05_facturation') {
      return (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Documents disponibles:</h4>
          <div className="space-y-2">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="invoice-number" className="text-xs">N° Facture (optionnel)</Label>
                <Input
                  id="invoice-number"
                  placeholder="FC/2025/001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateDocument('invoice')}
                disabled={generatingDoc}
              >
                <Download className="h-4 w-4 mr-2" />
                Générer facture
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // E06 - Mise à disposition
    if (stepCode === 'e06_mise_a_disposition') {
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">Documents disponibles:</h4>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateDocument('inventory_entry')}
              disabled={generatingDoc}
            >
              <FileText className="h-4 w-4 mr-2" />
              État des lieux
            </Button>
          </div>
        </div>
      );
    }

    // E07 - Facturation complémentaire
    if (stepCode === 'e07_facturation_complementaire') {
      return (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Documents disponibles:</h4>
          <div className="space-y-3 p-3 border rounded-lg bg-yellow-50/50">
            <div>
              <Label htmlFor="damage-amount" className="text-xs">Montant des dégâts (MAD)</Label>
              <Input
                id="damage-amount"
                type="number"
                placeholder="0.00"
                value={damageAmount}
                onChange={(e) => setDamageAmount(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="damage-description" className="text-xs">Description des dégâts</Label>
              <Textarea
                id="damage-description"
                placeholder="Décrire les dégâts constatés..."
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateDocument('damage_invoice')}
              disabled={generatingDoc || !damageAmount || !damageDescription}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Générer facture complémentaire
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const getActionsForCurrentStep = () => {
    if (!booking?.current_step_code) {
      return (
        <Button onClick={() => openConfirmDialog('demarrage', 'Démarrer le workflow', 'Voulez-vous démarrer le traitement de cette réservation ?')} disabled={processing}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Démarrer le workflow
        </Button>
      );
    }

    const stepCode = booking.current_step_code;
    
    // E01 - Réception et validation initiale
    if (stepCode === 'e01_reception') {
      return (
        <>
          <Button variant="outline" onClick={() => openConfirmDialog('verification_en_cours', 'Mettre en vérification', 'Cette demande nécessite une vérification approfondie. Voulez-vous la mettre en vérification ?')} disabled={processing}>
            <Clock className="h-4 w-4 mr-2" />
            Mettre en vérification
          </Button>
          <Button variant="destructive" onClick={() => openConfirmDialog('refusee', 'Refuser la demande', 'Êtes-vous sûr de vouloir refuser cette demande de réservation ?', 'destructive')} disabled={processing}>
            <XCircle className="h-4 w-4 mr-2" />
            Refuser
          </Button>
          <Button onClick={() => openConfirmDialog('validee', 'Transmettre au Directeur', 'Voulez-vous transmettre cette demande au Directeur pour décision ?')} disabled={processing}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Transmettre au Directeur
          </Button>
        </>
      );
    }

    // E02 - Décision de la Direction
    if (stepCode === 'e02_decision_direction') {
      return (
        <>
          <Button variant="outline" className="bg-orange-50" onClick={() => openConfirmDialog('verification_en_cours', 'Cas sensible', 'Marquer cette demande comme cas sensible nécessitant une vérification en cours ?')} disabled={processing}>
            <Clock className="h-4 w-4 mr-2" />
            Cas sensible - Vérification
          </Button>
          <Button variant="destructive" onClick={() => openConfirmDialog('refusee', 'Refuser la demande', 'Confirmez-vous le refus de cette demande par la Direction ?', 'destructive')} disabled={processing}>
            <XCircle className="h-4 w-4 mr-2" />
            Refuser
          </Button>
          <Button onClick={() => openConfirmDialog('validee', 'Approuver', 'Confirmez-vous l\'approbation de cette demande par la Direction ?')} disabled={processing}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approuver
          </Button>
        </>
      );
    }

    // E03 - Traitement par le DAC
    if (stepCode === 'e03_traitement_dac') {
      return (
        <>
          <Button variant="outline" onClick={() => openConfirmDialog('verification_en_cours', 'Mettre en vérification', 'Cette demande nécessite une vérification approfondie. Voulez-vous la mettre en vérification ?')} disabled={processing}>
            <Clock className="h-4 w-4 mr-2" />
            Vérification en cours
          </Button>
          <Button variant="outline" onClick={() => openConfirmDialog('refusee', 'Refuser (indisponibilité)', 'Confirmez-vous que l\'espace n\'est pas disponible aux dates demandées ?', 'destructive')} disabled={processing}>
            <XCircle className="h-4 w-4 mr-2" />
            Refuser (indisponibilité)
          </Button>
          <Button onClick={() => openConfirmDialog('confirmee', 'Confirmer disponibilité', 'Confirmez-vous la disponibilité de l\'espace pour cette réservation ?')} disabled={processing}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirmer disponibilité
          </Button>
        </>
      );
    }

    // E04 - Contractualisation
    if (stepCode === 'e04_contractualisation') {
      return (
        <>
          <Button onClick={() => openConfirmDialog('en_contrat', 'Contrat signé', 'Confirmez-vous que le contrat a été signé par toutes les parties ?')} disabled={processing}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Contrat signé
          </Button>
        </>
      );
    }

    // E05 - Facturation
    if (stepCode === 'e05_facturation') {
      return (
        <>
          <Button onClick={() => openConfirmDialog('facturee', 'Facture émise', 'Confirmez-vous l\'émission de la facture ?')} disabled={processing}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Facture émise
          </Button>
        </>
      );
    }

    // E06 - Mise à disposition
    if (stepCode === 'e06_mise_a_disposition') {
      return (
        <>
          <Button variant="outline" className="bg-yellow-50" onClick={() => openConfirmDialog('degats_constates', 'Dégâts constatés', 'Des dégâts ont-ils été constatés nécessitant une facturation complémentaire ?')} disabled={processing}>
            <AlertCircle className="h-4 w-4 mr-2" />
            Dégâts constatés
          </Button>
          <Button onClick={() => openConfirmDialog('validee', 'États des lieux OK', 'Confirmez-vous que les états des lieux d\'entrée et de sortie sont signés et conformes ?')} disabled={processing}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            États des lieux signés
          </Button>
        </>
      );
    }

    // E07 - Facturation complémentaire
    if (stepCode === 'e07_facturation_complementaire') {
      return (
        <>
          <Button onClick={() => openConfirmDialog('validee', 'Facture complémentaire', 'Confirmez-vous l\'émission de la facture complémentaire pour les dégâts ?')} disabled={processing}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Facture complémentaire émise
          </Button>
        </>
      );
    }

    // E08 - Clôture
    if (stepCode === 'e08_cloture') {
      return (
        <>
          <Button variant="outline" onClick={() => openConfirmDialog('archivee_sans_suite', 'Archiver sans suite', 'Archiver ce dossier sans suite (ex: après 60j de vérification) ?')} disabled={processing}>
            <Archive className="h-4 w-4 mr-2" />
            Archiver sans suite
          </Button>
          <Button onClick={() => openConfirmDialog('cloturee', 'Clôturer', 'Confirmez-vous la clôture définitive de ce dossier ?')} disabled={processing}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Clôturer le dossier
          </Button>
        </>
      );
    }

    // Par défaut
    return (
      <Button onClick={() => openConfirmDialog('validee', 'Valider l\'étape', 'Voulez-vous valider cette étape du workflow ?')} disabled={processing}>
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Valider l'étape
      </Button>
    );
  };

  if (!booking) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Traitement du workflow - Réservation #{booking.id.substring(0, 8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Statut actuel: <Badge>{booking.status}</Badge>
              {booking.current_step_order && (
                <span className="ml-2">
                  Étape {booking.current_step_order} / {workflowSteps.length}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Progression du workflow */}
          <div className="space-y-3">
            {workflowSteps.map((step, index) => {
              const status = getStepStatus(step.step_order);
              const historyEntry = workflowHistory.find(h => h.step_name === step.step_name);

              return (
                <div key={step.step_code}>
                  <div className={`flex items-start gap-4 p-4 border rounded-lg ${
                    status === 'completed' ? 'bg-green-50 border-green-200' :
                    status === 'current' ? 'bg-blue-50 border-blue-300 border-2' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        status === 'completed' ? 'bg-green-600 text-white' :
                        status === 'current' ? 'bg-blue-600 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {status === 'completed' ? '✓' : step.step_order}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{step.step_name}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Responsable: {step.assigned_role}
                      </p>
                      {historyEntry && (
                        <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <span>Décision:</span>
                            {getDecisionBadge(historyEntry.decision)}
                          </div>
                          {historyEntry.comment && (
                            <p className="text-xs mt-1">Commentaire: {historyEntry.comment}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Par {historyEntry.processed_by_email} le{' '}
                            {format(new Date(historyEntry.processed_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="space-y-4 border-t pt-4">
            {/* Documents disponibles */}
            {getDocumentsForCurrentStep() && (
              <div className="pb-4 mb-4 border-b">
                {getDocumentsForCurrentStep()}
              </div>
            )}

            {/* Commentaire */}
            <div>
              <Label htmlFor="comment">Commentaire {(booking?.current_step_code === 'e01_reception' || booking?.current_step_code === 'e02_decision_direction') && '*'}</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ajoutez un commentaire..."
                rows={3}
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2 justify-end">
              {getActionsForCurrentStep()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleWorkflowAction(confirmDialog.action)}
              className={confirmDialog.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
