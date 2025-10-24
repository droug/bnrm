import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { programContributionSchema, type ProgramContributionFormData } from "@/schemas/programContributionSchema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateProgramContributionPDF } from "@/utils/pdfGenerator";

import StepDemandeur from "./program-steps/StepDemandeur";
import StepProposition from "./program-steps/StepProposition";
import StepLogistique from "./program-steps/StepLogistique";
import StepConfirmationProg from "./program-steps/StepConfirmationProg";

const STEPS = [
  { id: 1, title: "Informations sur le demandeur", component: StepDemandeur },
  { id: 2, title: "Proposition d'activité", component: StepProposition },
  { id: 3, title: "Informations logistiques", component: StepLogistique },
  { id: 4, title: "Validation & confirmation", component: StepConfirmationProg },
];

const ProgramContributionWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProgramContributionFormData>({
    resolver: zodResolver(programContributionSchema),
    defaultValues: {
      moyens_techniques: [],
      certification_exactitude: false,
      consentement_diffusion: false,
    },
    mode: "onChange",
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof ProgramContributionFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          "nom_complet",
          "type_demandeur",
          "email",
          "telephone",
          "cv_url",
        ];
        break;
      case 2:
        fieldsToValidate = [
          "type_activite",
          "titre",
          "description",
          "objectifs",
          "public_cible",
          "langue",
          "dossier_projet_url",
        ];
        break;
      case 3:
        fieldsToValidate = [
          "date_proposee",
          "heure_proposee",
          "duree_minutes",
          "espace_souhaite",
        ];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    if (result) {
      setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs avant de continuer",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: ProgramContributionFormData) => {
    console.log('Form submission started', data);
    setIsSubmitting(true);
    try {
      // Insérer la demande (le trigger vérifiera automatiquement la limite de 3 propositions actives)
      const { data: contribution, error: insertError } = await supabase
        .from("program_contributions")
        .insert({
          nom_complet: data.nom_complet,
          type_demandeur: data.type_demandeur,
          email: data.email,
          telephone: data.telephone,
          organisme: data.organisme,
          adresse: data.adresse,
          cv_url: data.cv_url,
          statut_juridique_url: data.statut_juridique_url,
          type_activite: data.type_activite,
          titre: data.titre,
          description: data.description,
          objectifs: data.objectifs,
          public_cible: data.public_cible,
          langue: data.langue,
          nb_participants_estime: data.nb_participants_estime,
          dossier_projet_url: data.dossier_projet_url,
          date_proposee: data.date_proposee,
          heure_proposee: data.heure_proposee,
          duree_minutes: data.duree_minutes,
          moyens_techniques: data.moyens_techniques,
          besoins_specifiques: data.besoins_specifiques,
          espace_souhaite: data.espace_souhaite,
          certification_exactitude: data.certification_exactitude,
          consentement_diffusion: data.consentement_diffusion,
          statut: "en_attente",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Appeler l'edge function pour envoyer l'email de confirmation
      const { error: emailError } = await supabase.functions.invoke("send-program-contribution-confirmation", {
        body: {
          contribution_id: contribution.id,
          email: data.email,
          nom: data.nom_complet,
          titre_activite: data.titre,
          reference: contribution.numero_reference,
        },
      });

      if (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
      }

      // Générer le PDF avec le vrai numéro de référence
      generateProgramContributionPDF(data, contribution.numero_reference);

      toast({
        title: "Proposition soumise avec succès",
        description: "Vous recevrez un email de confirmation sous peu. Le PDF a été téléchargé.",
      });

      // Rediriger vers la page de confirmation après un délai
      setTimeout(() => {
        window.location.href = `/activites-culturelles/participation/confirmation?id=${contribution.id}`;
      }, 2000);
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error);
      
      // Gérer l'erreur de limite de propositions actives
      if (error.message && error.message.includes("propositions actives")) {
        toast({
          title: "Limite atteinte",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la soumission",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Card className="rounded-2xl shadow-lg border-[#333333]/10 overflow-hidden transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-[#FAF9F5] to-white border-b border-[#333333]/10">
          <div className="flex items-center justify-center gap-4 mb-6">
            {STEPS.map((step, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index + 1)}
                className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 cursor-pointer ${
                  index + 1 === currentStep ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 ${
                  index + 1 === currentStep 
                    ? 'bg-[#D4AF37]' 
                    : 'bg-[#D4AF37]/20'
                }`}>
                  <span className={`font-bold text-lg ${
                    index + 1 === currentStep ? 'text-white' : 'text-[#D4AF37]'
                  }`}>{index + 1}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-[#333333]/30" />
                )}
              </button>
            ))}
          </div>
          <CardTitle className="text-xl font-semibold text-[#333333] text-center">
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription className="text-base text-[#333333]/70 text-center">
            Étape {currentStep} sur {STEPS.length}
          </CardDescription>
          <Progress value={progress} className="mt-4 h-2 bg-[#333333]/10" />
        </CardHeader>
        <CardContent className="pt-8 bg-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="transition-all duration-300 ease-in-out animate-fade-in">
                <CurrentStepComponent form={form} />
              </div>

              <div className="flex justify-between pt-8 border-t border-[#333333]/10">
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrevious}
                    className="transition-all duration-300 text-[#333333] border-[#333333]/20 hover:bg-[#333333]/5"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>
                )}

                {currentStep < STEPS.length ? (
                  <Button 
                    type="button" 
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="ml-auto transition-all duration-300 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white shadow-md"
                  >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="ml-auto transition-all duration-300 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white shadow-md disabled:opacity-50"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Envoi en cours..." : "Soumettre la demande"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgramContributionWizard;
