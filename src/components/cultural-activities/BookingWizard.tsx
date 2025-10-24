import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StepOrganizerType from "./steps/StepOrganizerType";
import StepDateTime from "./steps/StepDateTime";
import StepEquipment from "./steps/StepEquipment";
import StepContactInfo from "./steps/StepContactInfo";
import StepSummary from "./steps/StepSummary";
import StepConfirmation from "./steps/StepConfirmation";

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
  durationType?: 'demi_journee' | 'journee_complete';
  // Informations du demandeur
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  contactCity?: string;
  contactCountry?: string;
  contactWebsite?: string;
  statusDocument?: File;
  authorizationDocument?: File;
  // État de soumission
  submittedBookingId?: string;
}

const STEPS = [
  { id: 1, title: "Type d'organisme & sélection de l'espace", component: StepOrganizerType },
  { id: 2, title: "Détails de l'événement", component: StepDateTime },
  { id: 3, title: "Équipements & Services", component: StepEquipment },
  { id: 4, title: "Informations du demandeur", component: StepContactInfo },
  { id: 5, title: "Validation & Acceptation", component: StepSummary },
  { id: 6, title: "Confirmation & notification", component: StepConfirmation }
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
      
      case 3: // Équipements & Services
        return true; // Cette étape est optionnelle
      
      case 4: // Informations du demandeur
        // Validation du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = bookingData.contactEmail ? emailRegex.test(bookingData.contactEmail) : false;
        
        // Validation du format téléphone
        const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
        const isPhoneValid = bookingData.contactPhone ? phoneRegex.test(bookingData.contactPhone) : false;
        
        const baseFieldsValid = !!(
          bookingData.contactPerson &&
          bookingData.contactEmail &&
          isEmailValid &&
          bookingData.contactPhone &&
          isPhoneValid &&
          bookingData.contactAddress &&
          bookingData.contactCity &&
          bookingData.contactCountry
        );
        
        // Si organisme public, vérifier le document de statut
        if (bookingData.organizerType === 'public') {
          return baseFieldsValid && !!bookingData.statusDocument;
        }
        
        return baseFieldsValid;
      
      case 5: // Validation & Acceptation
        return true;
      
      case 6: // Confirmation
        return true; // Toujours accessible une fois que la soumission est faite
      
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Progress indicator - Style identique à GuidedTourWizard */}
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
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-[#D4AF37]/20 shadow-sm mb-6 transition-all duration-200 animate-fade-in">
        <CurrentStepComponent
          data={bookingData}
          onUpdate={handleUpdateData}
          onNext={handleNext}
          bookingId={bookingData.submittedBookingId}
        />
      </div>

      {/* Navigation Buttons */}
      {currentStep < STEPS.length && (
        <div className="flex justify-between">
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
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="ml-auto bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="ml-auto bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Valider
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
