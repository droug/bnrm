import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface StepBookingFormProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const formSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().email("Email invalide").max(255),
  telephone: z.string().regex(/^(\+212|0)[5-7]\d{8}$/, "Numéro de téléphone marocain invalide"),
  organisme: z.string().max(200).optional(),
  nbVisiteurs: z.coerce.number().int().min(1, "Au moins 1 visiteur").max(100),
  langue: z.enum(["arabe", "français", "anglais", "amazigh"]),
  commentaire: z.string().max(500).optional(),
});

const StepBookingForm = ({ data, onUpdate }: StepBookingFormProps) => {
  const capaciteRestante = (data.selectedSlot?.capacite_max || 0) - (data.selectedSlot?.reservations_actuelles || 0);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: data.nom || "",
      email: data.email || "",
      telephone: data.telephone || "+212",
      organisme: data.organisme || "",
      nbVisiteurs: data.nbVisiteurs || 1,
      langue: data.langue || data.selectedSlot?.langue || "français",
      commentaire: data.commentaire || "",
    },
  });

  const handleFormChange = () => {
    const values = form.getValues();
    onUpdate(values);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Vos informations
        </h2>
        <p className="text-muted-foreground">
          Remplissez le formulaire pour finaliser votre réservation
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Les visites sont guidées par les équipes de la BNRM et durent environ 45 minutes.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onChange={handleFormChange} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Ahmed Benali" 
                      className="rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="exemple@email.com" 
                      className="rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="telephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+212612345678" 
                      className="rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organisme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organisme / École</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nom de votre organisme (optionnel)" 
                      className="rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nbVisiteurs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de visiteurs *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={capaciteRestante}
                      className="rounded-xl"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum {capaciteRestante} places disponibles
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="langue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Langue souhaitée *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Sélectionnez une langue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="arabe">العربية (Arabe)</SelectItem>
                      <SelectItem value="français">Français</SelectItem>
                      <SelectItem value="anglais">English (Anglais)</SelectItem>
                      <SelectItem value="amazigh">ⵜⴰⵎⴰⵣⵉⵖⵜ (Amazigh)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="commentaire"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commentaire</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Informations complémentaires (optionnel)"
                    className="rounded-xl resize-none"
                    rows={4}
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Maximum 500 caractères
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default StepBookingForm;
