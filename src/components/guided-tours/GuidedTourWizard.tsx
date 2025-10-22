import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StepSlotSelection from "./steps/StepSlotSelection";
import StepBookingForm from "./steps/StepBookingForm";
import StepConfirmation from "./steps/StepConfirmation";

interface VisitSlot {
  id: string;
  date: string;
  heure: string;
  langue: string;
  capacite_max: number;
  reservations_actuelles: number;
}

interface BookingData {
  slotId?: string;
  selectedSlot?: VisitSlot;
  nom?: string;
  email?: string;
  telephone?: string;
  organisme?: string;
  nbVisiteurs?: number;
  langue?: string;
  commentaire?: string;
  confirmation?: boolean;
}

const STEPS = [
  { id: 1, title: "Sélection du créneau", component: StepSlotSelection },
  { id: 2, title: "Formulaire d'inscription", component: StepBookingForm },
  { id: 3, title: "Confirmation", component: StepConfirmation },
];

const GuidedTourWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({});

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUpdateData = (data: Partial<BookingData>) => {
    setBookingData((prev) => {
      const updated = { ...prev, ...data };
      console.log("Booking data updated:", updated);
      return updated;
    });
  };

  const isStepValid = (): boolean => {
    const valid = (() => {
      switch (currentStep) {
        case 1:
          const hasSlot = !!bookingData.slotId && !!bookingData.selectedSlot;
          console.log("Step 1 validation:", { slotId: bookingData.slotId, hasSlot });
          return hasSlot;
        case 2:
          const hasBasicInfo = !!(
            bookingData.nom &&
            bookingData.email &&
            bookingData.telephone &&
            bookingData.nbVisiteurs &&
            bookingData.langue
          );
          const capacityCheck = bookingData.nbVisiteurs! <= (bookingData.selectedSlot?.capacite_max || 0) - (bookingData.selectedSlot?.reservations_actuelles || 0);
          console.log("Step 2 validation:", { hasBasicInfo, capacityCheck, bookingData });
          return hasBasicInfo && capacityCheck;
        case 3:
          const hasConfirmation = !!bookingData.confirmation;
          console.log("Step 3 validation:", { hasConfirmation });
          return hasConfirmation;
        default:
          return false;
      }
    })();
    
    console.log(`Step ${currentStep} is ${valid ? 'valid' : 'invalid'}`);
    return valid;
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progressValue = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <Card className="mb-6 p-6 bg-white rounded-2xl shadow-lg">
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`text-sm font-medium ${
                  step.id === currentStep
                    ? "text-primary"
                    : step.id < currentStep
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      </Card>

      {/* Current Step Content */}
      <Card className="p-8 bg-white rounded-2xl shadow-lg">
        <CurrentStepComponent
          data={bookingData}
          onUpdate={handleUpdateData}
          onNext={handleNext}
        />
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="rounded-2xl"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
        )}
        {currentStep < STEPS.length && (
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="ml-auto rounded-2xl"
          >
            Suivant
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default GuidedTourWizard;
