import { Check, Clock, CreditCard, FileCheck, UserCheck, Calculator, Send, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface WorkflowStep {
  key: string;
  labelFr: string;
  labelAr: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { 
    key: "soumise", 
    labelFr: "Soumise", 
    labelAr: "مقدمة", 
    icon: Send,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-100 dark:bg-blue-900/40",
    borderClass: "border-blue-500"
  },
  { 
    key: "en_validation_service", 
    labelFr: "Service", 
    labelAr: "الخدمة", 
    icon: Clock,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100 dark:bg-amber-900/40",
    borderClass: "border-amber-500"
  },
  { 
    key: "en_validation_responsable", 
    labelFr: "Responsable", 
    labelAr: "المسؤول", 
    icon: UserCheck,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-100 dark:bg-purple-900/40",
    borderClass: "border-purple-500"
  },
  { 
    key: "en_attente_paiement", 
    labelFr: "Paiement", 
    labelAr: "الدفع", 
    icon: CreditCard,
    colorClass: "text-orange-600 dark:text-orange-400",
    bgClass: "bg-orange-100 dark:bg-orange-900/40",
    borderClass: "border-orange-500"
  },
  { 
    key: "paiement_recu", 
    labelFr: "Comptabilité", 
    labelAr: "المحاسبة", 
    icon: Calculator,
    colorClass: "text-teal-600 dark:text-teal-400",
    bgClass: "bg-teal-100 dark:bg-teal-900/40",
    borderClass: "border-teal-500"
  },
  { 
    key: "en_cours_reproduction", 
    labelFr: "Reproduction", 
    labelAr: "الاستنساخ", 
    icon: FileCheck,
    colorClass: "text-indigo-600 dark:text-indigo-400",
    bgClass: "bg-indigo-100 dark:bg-indigo-900/40",
    borderClass: "border-indigo-500"
  },
  { 
    key: "terminee", 
    labelFr: "Terminée", 
    labelAr: "منتهية", 
    icon: Check,
    colorClass: "text-green-600 dark:text-green-400",
    bgClass: "bg-green-100 dark:bg-green-900/40",
    borderClass: "border-green-500"
  },
];

// Map status to step index
const STATUS_TO_STEP: Record<string, number> = {
  soumise: 0,
  en_validation_service: 1,
  en_validation_responsable: 2,
  en_attente_paiement: 3,
  paiement_recu: 4,
  en_cours_reproduction: 5,
  terminee: 6,
  refusee: -1,
};

// Step colors for progress bar
const STEP_COLORS = [
  "from-blue-500 to-blue-600",
  "from-amber-500 to-amber-600",
  "from-purple-500 to-purple-600",
  "from-orange-500 to-orange-600",
  "from-teal-500 to-teal-600",
  "from-indigo-500 to-indigo-600",
  "from-green-500 to-green-600",
];

interface WorkflowStepsProps {
  currentStatus: string;
  className?: string;
  compact?: boolean;
}

export function WorkflowSteps({ currentStatus, className, compact = false }: WorkflowStepsProps) {
  const { language } = useLanguage();
  const currentStepIndex = STATUS_TO_STEP[currentStatus] ?? 0;
  const isRejected = currentStatus === "refusee";

  if (compact) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center gap-1">
          {WORKFLOW_STEPS.map((step, index) => {
            const isCompleted = !isRejected && index < currentStepIndex;
            const isCurrent = !isRejected && index === currentStepIndex;
            const isPending = isRejected || index > currentStepIndex;

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div
                  className={cn(
                    "h-2 flex-1 rounded-full transition-all duration-300",
                    isCompleted && `bg-gradient-to-r ${STEP_COLORS[index]}`,
                    isCurrent && `bg-gradient-to-r ${STEP_COLORS[index]} animate-pulse`,
                    isPending && "bg-muted"
                  )}
                  title={language === "ar" ? step.labelAr : step.labelFr}
                />
              </div>
            );
          })}
        </div>
        {isRejected && (
          <div className="mt-2 flex items-center justify-center gap-1 text-destructive text-xs font-medium">
            <XCircle className="h-3 w-3" />
            {language === "ar" ? "مرفوضة" : "Refusée"}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-start justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-[5%] right-[5%] h-1 bg-muted rounded-full" />
        
        {/* Progress line filled */}
        <div 
          className={cn(
            "absolute top-5 left-[5%] h-1 rounded-full transition-all duration-700 ease-out",
            isRejected 
              ? "bg-destructive" 
              : `bg-gradient-to-r ${STEP_COLORS[Math.min(currentStepIndex, STEP_COLORS.length - 1)]}`
          )}
          style={{ 
            width: isRejected 
              ? "0%" 
              : `${Math.min((currentStepIndex / (WORKFLOW_STEPS.length - 1)) * 90, 90)}%` 
          }}
        />

        {WORKFLOW_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = !isRejected && index < currentStepIndex;
          const isCurrent = !isRejected && index === currentStepIndex;
          const isPending = isRejected || index > currentStepIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
                  isCompleted && `${step.bgClass} ${step.borderClass} ${step.colorClass}`,
                  isCurrent && `${step.bgClass} ${step.borderClass} ${step.colorClass} ring-4 ring-offset-2 ring-offset-background`,
                  isCurrent && index === 0 && "ring-blue-200 dark:ring-blue-900",
                  isCurrent && index === 1 && "ring-amber-200 dark:ring-amber-900",
                  isCurrent && index === 2 && "ring-purple-200 dark:ring-purple-900",
                  isCurrent && index === 3 && "ring-orange-200 dark:ring-orange-900",
                  isCurrent && index === 4 && "ring-teal-200 dark:ring-teal-900",
                  isCurrent && index === 5 && "ring-green-200 dark:ring-green-900",
                  isPending && "bg-muted border-muted-foreground/20 text-muted-foreground"
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
                  "mt-2 text-xs text-center font-medium max-w-[70px] leading-tight",
                  isCompleted && step.colorClass,
                  isCurrent && step.colorClass,
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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
            <XCircle className="h-4 w-4" />
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
    paiement_recu: { fr: "En validation comptabilité", ar: "قيد التحقق المحاسبي" },
    en_cours_reproduction: { fr: "En cours de reproduction", ar: "قيد الاستنساخ" },
    terminee: { fr: "Terminée", ar: "منتهية" },
    refusee: { fr: "Refusée", ar: "مرفوضة" },
  };
  return labels[status]?.[language === "ar" ? "ar" : "fr"] || status;
}

// Role-based step info
export function getStepRoleInfo(status: string, language: string): { role: string; canValidate: string } {
  const roleInfo: Record<string, { role: string; roleFr: string; roleAr: string }> = {
    soumise: { role: "service", roleFr: "Service technique", roleAr: "الخدمة التقنية" },
    en_validation_service: { role: "service", roleFr: "Service technique", roleAr: "الخدمة التقنية" },
    en_validation_responsable: { role: "manager", roleFr: "Responsable", roleAr: "المسؤول" },
    en_attente_paiement: { role: "user", roleFr: "Demandeur", roleAr: "مقدم الطلب" },
    paiement_recu: { role: "accounting", roleFr: "Comptabilité", roleAr: "المحاسبة" },
    en_cours_reproduction: { role: "reproduction", roleFr: "Service reproduction", roleAr: "خدمة الاستنساخ" },
    terminee: { role: "none", roleFr: "-", roleAr: "-" },
  };
  const info = roleInfo[status] || { role: "unknown", roleFr: "-", roleAr: "-" };
  return {
    role: info.role,
    canValidate: language === "ar" ? info.roleAr : info.roleFr
  };
}
