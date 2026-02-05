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
  langue: z.enum(["arabe", "français", "anglais", "amazighe"]),
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
      <div className="text-center">
        <h2 className="text-3xl font-light text-[#002B45] mb-2">
          Vos informations
        </h2>
        <p className="text-[#002B45]/70 font-light">
          Remplissez le formulaire pour finaliser votre réservation
        </p>
      </div>

      <Alert className="bg-white/80 border-[#D4AF37]/30">
        <AlertCircle className="h-4 w-4 text-[#D4AF37] stroke-1" />
        <AlertDescription className="text-[#002B45]/70 font-light">
          Places disponibles : {capaciteRestante}
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
                  <FormLabel className="text-[#002B45] font-light">Nom complet *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ahmed Benali" 
                      className="border-[#002B45]/20 focus:border-[#D4AF37] font-light"
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
                  <FormLabel className="text-[#002B45] font-light">Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="exemple@email.com" 
                      className="border-[#002B45]/20 focus:border-[#D4AF37] font-light"
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
                  <FormLabel className="text-[#002B45] font-light">Téléphone *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+212612345678" 
                      className="border-[#002B45]/20 focus:border-[#D4AF37] font-light"
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
                  <FormLabel className="text-[#002B45] font-light">Organisme / École</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Optionnel" 
                      className="border-[#002B45]/20 focus:border-[#D4AF37] font-light"
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
                  <FormLabel className="text-[#002B45] font-light">Nombre de visiteurs *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={capaciteRestante}
                      className="border-[#002B45]/20 focus:border-[#D4AF37] font-light"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-[#002B45]/50 font-light">
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
                  <FormLabel className="text-[#002B45] font-light">Langue souhaitée *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-[#002B45]/20 focus:border-[#D4AF37] font-light">
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-[#D4AF37]/20">
                      <SelectItem value="arabe" className="font-light">العربية (Arabe)</SelectItem>
                      <SelectItem value="français" className="font-light">Français</SelectItem>
                      <SelectItem value="anglais" className="font-light">English (Anglais)</SelectItem>
                      <SelectItem value="amazighe" className="font-light">ⵜⴰⵎⴰⵣⵉⵖⵜ (Amazighe)</SelectItem>
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
                <FormLabel className="text-[#002B45] font-light">Commentaire</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Informations complémentaires (optionnel)"
                    className="border-[#002B45]/20 focus:border-[#D4AF37] resize-none font-light"
                    rows={4}
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-[#002B45]/50 font-light">
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
