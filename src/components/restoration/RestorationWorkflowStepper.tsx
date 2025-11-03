import { Check, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming' | 'rejected';
}

interface RestorationWorkflowStepperProps {
  currentStatus: string;
  className?: string;
}

const statusToStepMapping: Record<string, number> = {
  'soumise': 0,
  'en_attente_autorisation': 1,
  'autorisee': 2,
  'refusee_direction': -1,
  'oeuvre_recue': 3,
  'diagnostic_en_cours': 4,
  'devis_en_attente': 5,
  'devis_accepte': 6,
  'devis_refuse': -2,
  'restauration_en_cours': 7,
  'paiement_en_attente': 8,
  'paiement_valide': 9,
  'cloturee': 10,
};

const workflowSteps: Step[] = [
  { id: 'soumise', label: 'Demande soumise', status: 'upcoming' },
  { id: 'en_attente_autorisation', label: 'En attente autorisation', status: 'upcoming' },
  { id: 'autorisee', label: 'Autorisée', status: 'upcoming' },
  { id: 'oeuvre_recue', label: 'Œuvre reçue', status: 'upcoming' },
  { id: 'diagnostic_en_cours', label: 'Diagnostic', status: 'upcoming' },
  { id: 'devis_en_attente', label: 'Devis en attente', status: 'upcoming' },
  { id: 'devis_accepte', label: 'Devis accepté', status: 'upcoming' },
  { id: 'restauration_en_cours', label: 'Restauration', status: 'upcoming' },
  { id: 'paiement_en_attente', label: 'Paiement en attente', status: 'upcoming' },
  { id: 'paiement_valide', label: 'Paiement validé', status: 'upcoming' },
  { id: 'cloturee', label: 'Clôturée', status: 'upcoming' },
];

export function RestorationWorkflowStepper({ currentStatus, className }: RestorationWorkflowStepperProps) {
  const currentStepIndex = statusToStepMapping[currentStatus] ?? 0;
  const isRejected = currentStepIndex < 0;

  const steps = workflowSteps.map((step, index) => {
    let status: Step['status'] = 'upcoming';
    
    if (isRejected) {
      if (index < Math.abs(currentStepIndex) + 1) {
        status = 'completed';
      } else if (index === Math.abs(currentStepIndex) + 1) {
        status = 'rejected';
      }
    } else {
      if (index < currentStepIndex) {
        status = 'completed';
      } else if (index === currentStepIndex) {
        status = 'current';
      }
    }
    
    return { ...step, status };
  });

  return (
    <div className={cn("w-full py-4 overflow-x-auto", className)}>
      {/* Conteneur pour les cercles alignés */}
      <div className="flex items-center min-w-max px-4 gap-1 mb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center relative" style={{ width: '80px' }}>
            {/* Ligne de connexion */}
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "absolute top-1/2 left-[50%] h-0.5 -z-10 -translate-y-1/2",
                  step.status === 'completed' ? "bg-primary" : "bg-muted"
                )}
                style={{ width: '80px' }}
              />
            )}
            
            {/* Cercle de l'étape */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all shrink-0 mx-auto",
                step.status === 'completed' && "bg-primary border-primary text-primary-foreground",
                step.status === 'current' && "bg-background border-primary text-primary animate-pulse",
                step.status === 'rejected' && "bg-destructive border-destructive text-destructive-foreground",
                step.status === 'upcoming' && "bg-muted border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {step.status === 'completed' && <Check className="w-4 h-4" />}
              {step.status === 'current' && <Clock className="w-4 h-4" />}
              {step.status === 'rejected' && <XCircle className="w-4 h-4" />}
              {step.status === 'upcoming' && <span className="text-[10px] font-medium">{index + 1}</span>}
            </div>
          </div>
        ))}
      </div>
      
      {/* Conteneur pour les labels */}
      <div className="flex min-w-max px-4 gap-1">
        {steps.map((step, index) => (
          <div key={`label-${step.id}`} className="flex justify-center" style={{ width: '80px' }}>
            <span
              className={cn(
                "text-[10px] text-center font-medium leading-tight",
                step.status === 'completed' && "text-primary",
                step.status === 'current' && "text-primary font-semibold",
                step.status === 'rejected' && "text-destructive",
                step.status === 'upcoming' && "text-muted-foreground"
              )}
              style={{ maxWidth: '75px', wordWrap: 'break-word' }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      
      {/* Message de rejet */}
      {isRejected && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
          <p className="text-sm text-destructive font-medium text-center">
            {currentStatus === 'refusee_direction' && "Demande refusée par la direction"}
            {currentStatus === 'devis_refuse' && "Devis refusé"}
          </p>
        </div>
      )}
    </div>
  );
}
