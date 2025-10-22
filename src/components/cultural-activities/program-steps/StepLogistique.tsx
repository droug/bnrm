import { UseFormReturn } from "react-hook-form";
import { ProgramContributionFormData } from "@/schemas/programContributionSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface StepLogistiqueProps {
  form: UseFormReturn<ProgramContributionFormData>;
}

const moyensTechniquesOptions = [
  { id: "videoprojecteur", label: "Vidéoprojecteur" },
  { id: "sonorisation", label: "Sonorisation" },
  { id: "scene", label: "Scène" },
  { id: "eclairage", label: "Éclairage" },
  { id: "ordinateurs", label: "Ordinateurs" },
  { id: "autres", label: "Autres" },
];

const StepLogistique = ({ form }: StepLogistiqueProps) => {
  const moyensTechniques = form.watch("moyens_techniques") || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
          <MapPin className="h-6 w-6 text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#333333]">Informations logistiques et techniques</h3>
          <p className="text-sm text-[#333333]/70">Précisez les besoins et la planification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="date_proposee"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date proposée *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "rounded-xl pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP", { locale: fr })
                      ) : (
                        <span>Choisir une date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="heure_proposee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Heure proposée *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#333333]/50" />
                  <Input 
                    {...field} 
                    type="time" 
                    className="rounded-xl pl-10" 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="duree_minutes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Durée approximative (en minutes) *</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                type="number" 
                min="30"
                max="480"
                placeholder="ex: 120" 
                className="rounded-xl"
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
              />
            </FormControl>
            <FormDescription>Entre 30 minutes et 8 heures</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="moyens_techniques"
        render={() => (
          <FormItem>
            <FormLabel>Moyens techniques requis</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {moyensTechniquesOptions.map((moyen) => (
                <FormField
                  key={moyen.id}
                  control={form.control}
                  name="moyens_techniques"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={moyensTechniques.includes(moyen.id)}
                          onCheckedChange={(checked) => {
                            const currentMoyens = field.value || [];
                            const newMoyens = checked
                              ? [...currentMoyens, moyen.id]
                              : currentMoyens.filter((val) => val !== moyen.id);
                            field.onChange(newMoyens);
                          }}
                          className="rounded border-[#333333]/30"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        {moyen.label}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="besoins_specifiques"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Besoins spécifiques</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Précisez tout besoin particulier..." 
                className="rounded-xl min-h-[100px]" 
              />
            </FormControl>
            <FormDescription>Optionnel - max 1000 caractères</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="espace_souhaite"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Espaces souhaités *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Sélectionnez un espace" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="auditorium">Auditorium</SelectItem>
                <SelectItem value="salle_conference">Salle de conférence</SelectItem>
                <SelectItem value="espace_exposition">Espace d'exposition</SelectItem>
                <SelectItem value="esplanade">Esplanade</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default StepLogistique;
