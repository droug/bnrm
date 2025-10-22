import { UseFormReturn } from "react-hook-form";
import { PartnershipRequestFormData } from "@/schemas/partnershipRequestSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, CheckCircle2, FileCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StepValidationProps {
  form: UseFormReturn<PartnershipRequestFormData>;
}

const StepValidation = ({ form }: StepValidationProps) => {
  const formData = form.watch();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
        <FileCheck className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-[#333333]">Validation et confirmation</h3>
      </div>

      <Alert className="border-primary/30 bg-primary/5 rounded-xl">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-[#333333]">
          Veuillez vérifier attentivement les informations suivantes avant de soumettre votre demande.
        </AlertDescription>
      </Alert>

      <Card className="rounded-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-[#333333]">Récapitulatif de votre demande</CardTitle>
          <CardDescription>Informations à valider</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-muted-foreground">Organisme</p>
              <p>{formData.nom_organisme}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Email</p>
              <p>{formData.email_officiel}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Statut juridique</p>
              <p className="capitalize">{formData.statut_juridique?.replace("_", " ")}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Type d'organisation</p>
              <p className="capitalize">{formData.type_organisation}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Nombre de représentants</p>
              <p>{formData.representants?.length || 0}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Type de partenariat</p>
              <p className="capitalize">{formData.type_partenariat}</p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Période</p>
              <p>
                {formData.date_debut && formData.date_fin
                  ? `Du ${new Date(formData.date_debut).toLocaleDateString("fr-MA")} au ${new Date(formData.date_fin).toLocaleDateString("fr-MA")}`
                  : "Non renseignée"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-muted-foreground">Programme</p>
              <p>{formData.programme_url ? "✓ Téléchargé" : "Non fourni"}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-muted-foreground mb-2">Objet du partenariat</p>
            <p className="text-sm">{formData.objet_partenariat}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="confirmation_exactitude"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border-2 border-primary/20 p-4 bg-white transition-all duration-300 hover:border-primary/40">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-[#333333] flex items-center gap-2 cursor-pointer">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Je confirme que les informations fournies sont exactes *
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmation_reglement"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border-2 border-primary/20 p-4 bg-white transition-all duration-300 hover:border-primary/40">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-[#333333] flex items-center gap-2 cursor-pointer">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  J'ai pris connaissance du règlement d'utilisation des espaces culturels *
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>

      <Alert className="border-primary/30 bg-primary/5 rounded-xl">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-[#333333]">
          Après soumission, votre demande sera examinée par le Département des Activités Culturelles de la BNRM. 
          Vous recevrez un email de confirmation avec la référence de votre demande.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StepValidation;
