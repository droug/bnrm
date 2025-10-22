import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StepOrganizerType from "./steps/StepOrganizerType";
import StepDateTime from "./steps/StepDateTime";
import StepEquipment from "./steps/StepEquipment";
import StepServices from "./steps/StepServices";
import StepSummary from "./steps/StepSummary";

export interface BookingData {
  organizerType?: string;
  organizationName?: string;
  justificationDocument?: File;
  spaceId?: string;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  eventTitle?: string;
  eventDescription?: string;
  expectedAttendees?: number;
  programDocument?: File;
  equipment: string[];
  services: string[];
}

const STEPS = [
  { id: 1, title: "Type d'organisme & sélection de l'espace", component: StepOrganizerType },
  { id: 2, title: "Détails de l'événement", component: StepDateTime },
  { id: 3, title: "Équipements", component: StepEquipment },
  { id: 4, title: "Services complémentaires", component: StepServices },
  { id: 5, title: "Récapitulatif", component: StepSummary }
];

export default function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    equipment: [],
    services: []
  });

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpdateData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  // Validation pour chaque étape
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Type d'organisme & sélection de l'espace
        if (!bookingData.organizerType || !bookingData.spaceId) return false;
        if (bookingData.organizerType === 'public' && !bookingData.justificationDocument) return false;
        return true;
      
      case 2: // Détails de l'événement
        return !!(
          bookingData.eventTitle &&
          bookingData.eventDescription &&
          bookingData.startDate &&
          bookingData.endDate &&
          bookingData.startTime &&
          bookingData.endTime &&
          bookingData.expectedAttendees &&
          bookingData.expectedAttendees > 0
        );
      
      case 3: // Équipements
      case 4: // Services complémentaires
        return true; // Ces étapes sont optionnelles
      
      case 5: // Récapitulatif
        return true;
      
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Étape {currentStep} sur {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-1 min-w-[120px] text-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  step.id === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step.id < currentStep
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      <Card>
        <CardContent className="pt-6">
          <CurrentStepComponent
            data={bookingData}
            onUpdate={handleUpdateData}
            onNext={handleNext}
          />

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} className="gap-2" disabled={!canProceed}>
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
