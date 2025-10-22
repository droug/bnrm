import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { partnershipRequestSchema, type PartnershipRequestFormData } from "@/schemas/partnershipRequestSchema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import StepOrganismeIdentification from "./partnership-steps/StepOrganismeIdentification";
import StepRepresentants from "./partnership-steps/StepRepresentants";
import StepDetailsPartenariat from "./partnership-steps/StepDetailsPartenariat";
import StepValidation from "./partnership-steps/StepValidation";

const STEPS = [
  { id: 1, title: "Identification de l'organisme", component: StepOrganismeIdentification },
  { id: 2, title: "Représentants", component: StepRepresentants },
  { id: 3, title: "Détails du partenariat", component: StepDetailsPartenariat },
  { id: 4, title: "Validation & confirmation", component: StepValidation },
];

const PartnershipWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PartnershipRequestFormData>({
    resolver: zodResolver(partnershipRequestSchema),
    defaultValues: {
      representants: [],
      confirmation_exactitude: false,
      confirmation_reglement: false,
    },
    mode: "onChange",
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof PartnershipRequestFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          "nom_organisme",
          "statut_juridique",
          "nationalite",
          "type_organisation",
          "telephone",
          "email_officiel",
          "adresse",
        ];
        break;
      case 2:
        fieldsToValidate = ["representants"];
        break;
      case 3:
        fieldsToValidate = [
          "objet_partenariat",
          "description_projet",
          "type_partenariat",
          "date_debut",
          "date_fin",
          "programme_url",
          "objectifs",
          "public_cible",
          "moyens_organisme",
          "moyens_bnrm",
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

  const onSubmit = async (data: PartnershipRequestFormData) => {
    setIsSubmitting(true);
    try {
      // Vérifier qu'il n'y a pas déjà une demande active pour cet email
      const { data: existingRequests, error: checkError } = await supabase
        .from("partnerships")
        .select("id")
        .eq("email_officiel", data.email_officiel)
        .eq("statut", "en_attente")
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingRequests) {
        toast({
          title: "Demande existante",
          description: "Vous avez déjà une demande active en cours d'examen",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Insérer la demande
      const { data: partnership, error: insertError } = await supabase
        .from("partnerships")
        .insert({
          nom_organisme: data.nom_organisme,
          statut_juridique: data.statut_juridique,
          nationalite: data.nationalite,
          type_organisation: data.type_organisation,
          description_organisme: data.description_organisme,
          telephone: data.telephone,
          email_officiel: data.email_officiel,
          adresse: data.adresse,
          site_web: data.site_web,
          statut_document_url: data.statut_document_url,
          representants: data.representants,
          objet_partenariat: data.objet_partenariat,
          description_projet: data.description_projet,
          type_partenariat: data.type_partenariat,
          date_debut: data.date_debut,
          date_fin: data.date_fin,
          lieu_concerne: data.lieu_concerne,
          programme_url: data.programme_url,
          objectifs: data.objectifs,
          public_cible: data.public_cible,
          moyens_organisme: data.moyens_organisme,
          moyens_bnrm: data.moyens_bnrm,
          statut: "en_attente",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Appeler l'edge function pour envoyer l'email de confirmation
      const { error: emailError } = await supabase.functions.invoke("send-partnership-confirmation", {
        body: {
          partnership_id: partnership.id,
          email: data.email_officiel,
          organisme: data.nom_organisme,
        },
      });

      if (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
      }

      toast({
        title: "Demande soumise avec succès",
        description: "Vous recevrez un email de confirmation sous peu",
      });

      // Rediriger vers la page de confirmation
      window.location.href = `/cultural-activities/partnership/confirmation?id=${partnership.id}`;
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Card className="rounded-2xl shadow-lg border-border/50 overflow-hidden transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-xl font-semibold text-[#333333]">
            Étape {currentStep} sur {STEPS.length}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {STEPS[currentStep - 1].title}
          </CardDescription>
          <Progress value={progress} className="mt-4 h-2" />
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="transition-all duration-300 ease-in-out">
                <CurrentStepComponent form={form} />
              </div>

              <div className="flex justify-between pt-8 border-t border-border/50">
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrevious}
                    className="transition-all duration-300 hover:scale-105"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>
                )}

                {currentStep < STEPS.length ? (
                  <Button 
                    type="button" 
                    onClick={handleNext} 
                    className="ml-auto transition-all duration-300 hover:scale-105"
                  >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="ml-auto transition-all duration-300 hover:scale-105"
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

export default PartnershipWizard;
