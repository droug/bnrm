import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import StepOrganizerType from "./steps/StepOrganizerType";
import StepDateTime from "./steps/StepDateTime";
import StepEquipment from "./steps/StepEquipment";
import StepContactInfo from "./steps/StepContactInfo";
import StepSummary from "./steps/StepSummary";
import StepConfirmation from "./steps/StepConfirmation";

export interface EventSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  participants: number;
}

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
  eventSlots?: EventSlot[];
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

const STORAGE_KEY = 'cultural_activities_booking_draft';

export default function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    equipment: [],
    services: [],
    eventSlots: [{
      id: `slot-${Date.now()}`,
      date: new Date(),
      startTime: "09:00",
      endTime: "18:00",
      participants: 1
    }]
  });

  // Charger les données sauvegardées au montage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // Reconvertir les dates
        if (parsed.eventSlots) {
          parsed.eventSlots = parsed.eventSlots.map((slot: any) => ({
            ...slot,
            date: new Date(slot.date)
          }));
          
          // MIGRATION: Synchroniser les champs simples depuis eventSlots si manquants
          if (parsed.eventSlots.length > 0) {
            const sortedSlots = [...parsed.eventSlots].sort((a: any, b: any) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            const firstSlot = sortedSlots[0];
            const lastSlot = sortedSlots[sortedSlots.length - 1];
            const totalParticipants = parsed.eventSlots.reduce(
              (sum: number, slot: any) => sum + (slot.participants || 0), 0
            );
            
            // Migrer les données si les champs simples sont manquants
            if (!parsed.startDate) parsed.startDate = new Date(firstSlot.date);
            if (!parsed.endDate) parsed.endDate = new Date(lastSlot.date);
            if (!parsed.startTime) parsed.startTime = firstSlot.startTime;
            if (!parsed.endTime) parsed.endTime = lastSlot.endTime;
            if (!parsed.expectedAttendees) parsed.expectedAttendees = totalParticipants;
            
            console.log('📦 Migration brouillon:', {
              slots: parsed.eventSlots.length,
              startDate: parsed.startDate,
              endDate: parsed.endDate,
              startTime: parsed.startTime,
              endTime: parsed.endTime,
              expectedAttendees: parsed.expectedAttendees
            });
          }
        }
        
        if (parsed.startDate && typeof parsed.startDate === 'string') {
          parsed.startDate = new Date(parsed.startDate);
        }
        if (parsed.endDate && typeof parsed.endDate === 'string') {
          parsed.endDate = new Date(parsed.endDate);
        }
        
        setBookingData(parsed);
        toast.success("Brouillon chargé et migré");
      } catch (error) {
        console.error("Erreur lors du chargement du brouillon:", error);
      }
    }
  }, []);

  // Sauvegarder automatiquement les données
  useEffect(() => {
    if (bookingData.organizerType || bookingData.spaceId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingData));
    }
  }, [bookingData]);

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
    setBookingData(prev => {
      const updated = { ...prev, ...data };
      
      // Si eventSlots est mis à jour, synchroniser automatiquement les champs simples
      if (data.eventSlots && data.eventSlots.length > 0) {
        const sortedSlots = [...data.eventSlots].sort((a, b) => 
          a.date.getTime() - b.date.getTime()
        );
        const firstSlot = sortedSlots[0];
        const lastSlot = sortedSlots[sortedSlots.length - 1];
        const totalParticipants = data.eventSlots.reduce(
          (sum, slot) => sum + (slot.participants || 0), 0
        );
        
        updated.startDate = firstSlot.date;
        updated.endDate = lastSlot.date;
        updated.startTime = firstSlot.startTime;
        updated.endTime = lastSlot.endTime;
        updated.expectedAttendees = totalParticipants;
      }
      
      return updated;
    });
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
          bookingData.eventSlots &&
          bookingData.eventSlots.length > 0 &&
          bookingData.programDocument
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
                <button
                  onClick={() => setCurrentStep(stepNumber)}
                  className={`flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-200 cursor-pointer hover:scale-110 ${
                    stepNumber === currentStep
                      ? "border-[#D4AF37] bg-[#D4AF37] text-white shadow-md"
                      : stepNumber < currentStep
                      ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                      : "border-[#002B45]/20 text-[#002B45]/40 hover:border-[#D4AF37]/40"
                  }`}
                >
                  {stepNumber < currentStep ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-light">{stepNumber}</span>
                  )}
                </button>
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
            <button
              key={index}
              onClick={() => setCurrentStep(index + 1)}
              className={`text-xs font-light transition-colors duration-200 cursor-pointer hover:text-[#D4AF37] ${
                index + 1 === currentStep
                  ? "text-[#D4AF37]"
                  : index + 1 < currentStep
                  ? "text-[#D4AF37]/70"
                  : "text-[#002B45]/40"
              }`}
              style={{ width: `${100 / STEPS.length}%` }}
            >
              <div className="text-center">{step.title}</div>
            </button>
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
