import { UseFormReturn } from "react-hook-form";
import { PartnershipRequestFormData } from "@/schemas/partnershipRequestSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Lightbulb } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StepDetailsPartenariatProps {
  form: UseFormReturn<PartnershipRequestFormData>;
}

const StepDetailsPartenariat = ({ form }: StepDetailsPartenariatProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 10 Mo",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("partnership-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("partnership-documents")
        .getPublicUrl(filePath);

      form.setValue("programme_url", publicUrl);
      toast({
        title: "Programme téléchargé",
        description: "Le programme a été téléchargé avec succès",
      });
    } catch (error) {
      console.error("Erreur upload:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement du programme",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-[#333333]">Détails du partenariat proposé</h3>
      </div>

      <FormField
        control={form.control}
        name="objet_partenariat"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objet du partenariat *</FormLabel>
            <FormControl>
              <Input placeholder="Titre court du partenariat" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description_projet"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description du projet *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Décrivez en détail votre projet de partenariat..."
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type_partenariat"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type de partenariat *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="culturel">Culturel</SelectItem>
                <SelectItem value="educatif">Éducatif</SelectItem>
                <SelectItem value="evenementiel">Événementiel</SelectItem>
                <SelectItem value="scientifique">Scientifique</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="date_debut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de début souhaitée *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_fin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de fin souhaitée *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="lieu_concerne"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lieu ou espace concerné</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Auditorium, Salle d'exposition..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 transition-all duration-300">
        <FormField
          control={form.control}
          name="programme_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Programme / Concept note *
              </FormLabel>
              <FormDescription>
                Téléchargez le programme détaillé ou concept note (PDF ou DOCX, max 10 Mo)
              </FormDescription>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    disabled={isUploading}
                    className="transition-all duration-300"
                  />
                  <Button type="button" variant="outline" disabled={isUploading}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              {field.value && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  ✓ Programme téléchargé
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="objectifs"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objectifs du partenariat *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Quels sont les objectifs de ce partenariat ?"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="public_cible"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Public cible *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Quel public visez-vous ?"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="moyens_organisme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Moyens / ressources apportées par votre organisme *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Quelles ressources humaines, matérielles ou financières apportez-vous ?"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="moyens_bnrm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Moyens attendus de la BNRM *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Quelles ressources attendez-vous de la BNRM ?"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default StepDetailsPartenariat;
