import { UseFormReturn } from "react-hook-form";
import { ProgramContributionFormData } from "@/schemas/programContributionSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { FileCheck, Info, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface StepConfirmationProgProps {
  form: UseFormReturn<ProgramContributionFormData>;
}

const StepConfirmationProg = ({ form }: StepConfirmationProgProps) => {
  const formData = form.watch();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
          <FileCheck className="h-6 w-6 text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#333333]">Validation et confirmation</h3>
          <p className="text-sm text-[#333333]/70">Vérifiez et validez votre proposition</p>
        </div>
      </div>

      <Alert className="border-[#D4AF37]/30 bg-[#D4AF37]/5 rounded-xl">
        <Info className="h-4 w-4 text-[#D4AF37]" />
        <AlertDescription className="text-[#333333]">
          Veuillez vérifier attentivement toutes les informations avant de soumettre votre proposition.
        </AlertDescription>
      </Alert>

      <Card className="rounded-xl border-[#333333]/10 bg-[#FAF9F5]">
        <CardContent className="p-6 space-y-4">
          <h4 className="font-bold text-[#333333] flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#D4AF37]" />
            Récapitulatif de votre proposition
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#333333]/70">Nom complet</p>
              <p className="font-semibold text-[#333333]">{formData.nom_complet}</p>
            </div>
            <div>
              <p className="text-[#333333]/70">Email</p>
              <p className="font-semibold text-[#333333]">{formData.email}</p>
            </div>
            <div>
              <p className="text-[#333333]/70">Titre de l'activité</p>
              <p className="font-semibold text-[#333333]">{formData.titre}</p>
            </div>
            <div>
              <p className="text-[#333333]/70">Type d'activité</p>
              <p className="font-semibold text-[#333333] capitalize">{formData.type_activite?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-[#333333]/70">Date proposée</p>
              <p className="font-semibold text-[#333333]">
                {formData.date_proposee ? format(new Date(formData.date_proposee), 'dd MMMM yyyy', { locale: fr }) : '-'}
              </p>
            </div>
            <div>
              <p className="text-[#333333]/70">Heure proposée</p>
              <p className="font-semibold text-[#333333]">{formData.heure_proposee || '-'}</p>
            </div>
            <div>
              <p className="text-[#333333]/70">Durée</p>
              <p className="font-semibold text-[#333333]">{formData.duree_minutes ? `${formData.duree_minutes} minutes` : '-'}</p>
            </div>
            <div>
              <p className="text-[#333333]/70">Espace souhaité</p>
              <p className="font-semibold text-[#333333] capitalize">{formData.espace_souhaite?.replace('_', ' ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="certification_exactitude"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0 rounded-xl border border-[#333333]/10 p-4 bg-white">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1 rounded border-[#333333]/30"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium text-[#333333] cursor-pointer">
                  Je certifie que les informations fournies sont exactes *
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consentement_diffusion"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0 rounded-xl border border-[#333333]/10 p-4 bg-white">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1 rounded border-[#333333]/30"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium text-[#333333] cursor-pointer">
                  Je consens à la diffusion de cette activité sur le site de la BNRM en cas d'acceptation *
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>

      <Alert className="border-[#D4AF37]/30 bg-white rounded-xl">
        <Info className="h-4 w-4 text-[#D4AF37]" />
        <AlertDescription className="text-[#333333]">
          <strong>Après soumission :</strong> Vous recevrez un email de confirmation avec un numéro de référence. 
          Votre proposition sera examinée par le Département des Activités Culturelles dans les meilleurs délais.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StepConfirmationProg;
