import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, GitBranch, ArrowRight, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
          'contractualisee': 'Contrat signé',
          'facturee': 'Facture émise',
          'mise_a_disposition': 'Mise à disposition effectuée',
          'facture_complementaire': 'Facture complémentaire émise',
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
      validee: { label: "Validée → Confirmée", className: "bg-green-100 text-green-800" },
      refusee: { label: "Refusée → Rejetée", className: "bg-red-100 text-red-800" },
      verification_en_cours: { label: "Vérification en cours", className: "bg-orange-100 text-orange-800" },
      confirmee: { label: "Confirmée", className: "bg-teal-100 text-teal-800" },
      contractualisee: { label: "Contractualisée", className: "bg-purple-100 text-purple-800" },
      facturee: { label: "Facturée", className: "bg-indigo-100 text-indigo-800" },
      mise_a_disposition: { label: "Mise à disposition", className: "bg-cyan-100 text-cyan-800" },
      facture_complementaire: { label: "Facture complémentaire", className: "bg-yellow-100 text-yellow-800" },
      cloturee: { label: "Clôturée", className: "bg-gray-100 text-gray-800" },
      archivee_sans_suite: { label: "Archivée sans suite", className: "bg-gray-200 text-gray-600" },
    };
    const c = config[decision as keyof typeof config] || { label: decision, className: "bg-gray-100 text-gray-800" };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getActionsForCurrentStep = () => {
    if (!booking?.current_step_code) {
      return (
        <Button onClick={() => handleWorkflowAction('demarrage')} disabled={processing}>
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
          <Button variant="outline" onClick={() => handleWorkflowAction('verification_en_cours')} disabled={processing}>
            <Clock className="h-4 w-4 mr-2" />
            Mettre en vérification
          </Button>
          <Button variant="destructive" onClick={() => handleWorkflowAction('refusee')} disabled={processing}>
            <XCircle className="h-4 w-4 mr-2" />
            Refuser
          </Button>
          <Button onClick={() => handleWorkflowAction('validee')} disabled={processing}>
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
          <Button variant="outline" className="bg-orange-50" onClick={() => handleWorkflowAction('verification_en_cours')} disabled={processing}>
            <Clock className="h-4 w-4 mr-2" />
            Cas sensible - Vérification
          </Button>
          <Button variant="destructive" onClick={() => handleWorkflowAction('refusee')} disabled={processing}>
            <XCircle className="h-4 w-4 mr-2" />
            Refuser
          </Button>
          <Button onClick={() => handleWorkflowAction('validee')} disabled={processing}>
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
          <Button variant="outline" onClick={() => handleWorkflowAction('refusee')} disabled={processing}>
            <XCircle className="h-4 w-4 mr-2" />
            Refuser (indisponibilité)
          </Button>
          <Button onClick={() => handleWorkflowAction('confirmee')} disabled={processing}>
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
          <Button onClick={() => handleWorkflowAction('contractualisee')} disabled={processing}>
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
          <Button onClick={() => handleWorkflowAction('facturee')} disabled={processing}>
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
          <Button variant="outline" className="bg-yellow-50" onClick={() => handleWorkflowAction('facture_complementaire')} disabled={processing}>
            Dégâts constatés - Facture complémentaire
          </Button>
          <Button onClick={() => handleWorkflowAction('mise_a_disposition')} disabled={processing}>
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
          <Button onClick={() => handleWorkflowAction('facture_complementaire')} disabled={processing}>
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
          <Button variant="outline" onClick={() => handleWorkflowAction('archivee_sans_suite')} disabled={processing}>
            <Archive className="h-4 w-4 mr-2" />
            Archiver sans suite
          </Button>
          <Button onClick={() => handleWorkflowAction('cloturee')} disabled={processing}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Clôturer le dossier
          </Button>
        </>
      );
    }

    // Par défaut
    return (
      <Button onClick={() => handleWorkflowAction('validee')} disabled={processing}>
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Valider l'étape
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <GitBranch className="h-6 w-6 text-primary" />
            Traitement de la demande - Workflow
          </DialogTitle>
          <DialogDescription>
            {booking && (
              <div className="space-y-2 mt-2">
                <p className="text-base">
                  <span className="font-semibold">Organisation:</span> {booking.organization_name}
                </p>
                <p className="text-base">
                  <span className="font-semibold">Espace:</span> {booking.cultural_spaces?.name}
                </p>
                <p className="text-base">
                  <span className="font-semibold">Dates:</span>{' '}
                  {format(new Date(booking.start_date), 'dd/MM/yyyy', { locale: fr })} -{' '}
                  {format(new Date(booking.end_date), 'dd/MM/yyyy', { locale: fr })}
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Étape actuelle */}
          <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
            {!booking?.current_step_code ? (
              <div>
                <p className="text-lg font-semibold text-primary">
                  Workflow non démarré
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Cliquez sur "Démarrer le workflow" pour commencer le traitement de cette demande
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold text-primary">
                  Étape actuelle: {booking?.current_step_order || 1}. {
                    workflowSteps.find(s => s.step_code === booking?.current_step_code)?.step_name || 'Chargement...'
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Responsable: {workflowSteps.find(s => s.step_code === booking?.current_step_code)?.assigned_role}
                </p>
              </div>
            )}
          </div>

          {/* Visualisation du workflow */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Progression du workflow</h3>
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
            <div>
              <Label htmlFor="workflow-comment">
                Commentaire 
                {(booking?.current_step_code === 'e04_contractualisation' || 
                  booking?.current_step_code === 'e05_facturation' || 
                  booking?.current_step_code === 'e07_facturation_complementaire') && ' (optionnel)'}
                {(!booking?.current_step_code || 
                  booking?.current_step_code === 'e02_decision_direction' || 
                  booking?.current_step_code === 'e01_reception') && ' (requis pour refus/vérification)'}
              </Label>
              <Textarea
                id="workflow-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ajouter un commentaire sur cette étape..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2 justify-end flex-wrap">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={processing}
              >
                Annuler
              </Button>
              {getActionsForCurrentStep()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
