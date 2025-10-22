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
    <div className="animate-fade-in">
      {/* Progress indicator */}
      <div className="mb-10 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#D4AF37]/20 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((step, index) => {
            const stepNumber = index + 1;
            return (
              <div
                key={index}
                className={`flex items-center ${
                  index < STEPS.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-200 ${
                    stepNumber === currentStep
                      ? "border-[#D4AF37] bg-[#D4AF37] text-white shadow-md"
                      : stepNumber < currentStep
                      ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                      : "border-[#002B45]/20 text-[#002B45]/40"
                  }`}
                >
                  {stepNumber < currentStep ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-light">{stepNumber}</span>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-px flex-1 mx-3 transition-all duration-200 ${
                      stepNumber < currentStep ? "bg-[#D4AF37]" : "bg-[#002B45]/10"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-4">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className={`text-xs font-light transition-colors duration-200 ${
                index + 1 === currentStep
                  ? "text-[#D4AF37]"
                  : index + 1 < currentStep
                  ? "text-[#D4AF37]/70"
                  : "text-[#002B45]/40"
              }`}
              style={{ width: `${100 / STEPS.length}%` }}
            >
              <div className="text-center">{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-[#D4AF37]/20 shadow-sm mb-6 transition-all duration-200 animate-fade-in max-w-[800px] mx-auto">
        <CurrentStepComponent
          data={bookingData}
          onUpdate={handleUpdateData}
          onNext={handleNext}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-[800px] mx-auto">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-200"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
        )}
        {currentStep < 3 && (
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="ml-auto bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
