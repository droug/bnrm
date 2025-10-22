import { UseFormReturn } from "react-hook-form";
import { PartnershipRequestFormData } from "@/schemas/partnershipRequestSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StepValidationProps {
  form: UseFormReturn<PartnershipRequestFormData>;
}

const StepValidation = ({ form }: StepValidationProps) => {
  const formData = form.watch();

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Veuillez vérifier toutes les informations avant de soumettre votre demande.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Récapitulatif de votre demande</CardTitle>
          <CardDescription>
            Vérifiez que toutes les informations sont correctes
          </CardDescription>
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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">
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
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">
                  J'ai pris connaissance du règlement d'utilisation des espaces culturels *
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>

      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          Une fois votre demande soumise, vous recevrez un accusé de réception par email.
          Votre demande sera examinée par le Département des Activités Culturelles de la BNRM.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StepValidation;
