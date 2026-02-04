import { Check, Clock, CreditCard, FileCheck, UserCheck, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface WorkflowStep {
  key: string;
  labelFr: string;
  labelAr: string;
  icon: React.ComponentType<{ className?: string }>;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { key: "soumise", labelFr: "Soumise", labelAr: "مقدمة", icon: FileCheck },
  { key: "en_validation_service", labelFr: "Validation Service", labelAr: "تحقق الخدمة", icon: Clock },
  { key: "en_validation_responsable", labelFr: "Approbation Responsable", labelAr: "موافقة المسؤول", icon: UserCheck },
  { key: "en_attente_paiement", labelFr: "Paiement", labelAr: "الدفع", icon: CreditCard },
  { key: "en_validation_comptabilite", labelFr: "Validation Comptabilité", labelAr: "التحقق المحاسبي", icon: Calculator },
  { key: "terminee", labelFr: "Terminée", labelAr: "منتهية", icon: Check },
];

// Map status to step index
const STATUS_TO_STEP: Record<string, number> = {
  soumise: 0,
  en_validation_service: 1,
  en_validation_responsable: 2,
  en_attente_paiement: 3,
  payee: 4,
  en_validation_comptabilite: 4,
  terminee: 5,
  refusee: -1,
};

interface WorkflowStepsProps {
  currentStatus: string;
  className?: string;
}

export function WorkflowSteps({ currentStatus, className }: WorkflowStepsProps) {
  const { language } = useLanguage();
  const currentStepIndex = STATUS_TO_STEP[currentStatus] ?? 0;
  const isRejected = currentStatus === "refusee";

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
        <div 
          className={cn(
            "absolute top-5 left-0 h-0.5 transition-all duration-500",
            isRejected ? "bg-destructive" : "bg-primary"
          )}
          style={{ 
            width: isRejected 
              ? "0%" 
              : `${Math.min((currentStepIndex / (WORKFLOW_STEPS.length - 1)) * 100, 100)}%` 
          }}
        />

        {WORKFLOW_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = !isRejected && index < currentStepIndex;
          const isCurrent = !isRejected && index === currentStepIndex;
          const isPending = isRejected || index > currentStepIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "bg-background border-primary text-primary ring-4 ring-primary/20",
                  isPending && "bg-muted border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs text-center max-w-[80px] font-medium",
                  isCompleted && "text-primary",
                  isCurrent && "text-primary",
                  isPending && "text-muted-foreground"
                )}
              >
                {language === "ar" ? step.labelAr : step.labelFr}
              </span>
            </div>
          );
        })}
      </div>

      {isRejected && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
            {language === "ar" ? "الطلب مرفوض" : "Demande refusée"}
          </span>
        </div>
      )}
    </div>
  );
}

export function getStatusLabel(status: string, language: string): string {
  const labels: Record<string, { fr: string; ar: string }> = {
    soumise: { fr: "Soumise", ar: "مقدمة" },
    en_validation_service: { fr: "En validation service", ar: "قيد التحقق" },
    en_validation_responsable: { fr: "En attente approbation", ar: "في انتظار الموافقة" },
    en_attente_paiement: { fr: "En attente de paiement", ar: "في انتظار الدفع" },
    payee: { fr: "Payée", ar: "مدفوعة" },
    en_validation_comptabilite: { fr: "En validation comptabilité", ar: "قيد التحقق المحاسبي" },
    terminee: { fr: "Terminée", ar: "منتهية" },
    refusee: { fr: "Refusée", ar: "مرفوضة" },
  };
  return labels[status]?.[language === "ar" ? "ar" : "fr"] || status;
}
