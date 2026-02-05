import { UseFormReturn } from "react-hook-form";
import { ProgramContributionFormData } from "@/schemas/programContributionSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, Lightbulb } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StepPropositionProps {
  form: UseFormReturn<ProgramContributionFormData>;
}

const StepProposition = ({ form }: StepPropositionProps) => {
  const [uploadingDossier, setUploadingDossier] = useState(false);
  const { toast } = useToast();

  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9.-]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 10 MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingDossier(true);

    try {
      const sanitizedFileName = sanitizeFileName(file.name);
      const fileName = `${Date.now()}-${sanitizedFileName}`;
      const filePath = `program-contributions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      form.setValue("dossier_projet_url", urlData.publicUrl, { shouldValidate: true });

      toast({
        title: "Dossier uploadé",
        description: "Le dossier de projet a été uploadé avec succès",
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d'uploader le dossier",
        variant: "destructive",
      });
    } finally {
      setUploadingDossier(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
          <Lightbulb className="h-6 w-6 text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#333333]">Proposition d'activité</h3>
          <p className="text-sm text-[#333333]/70">Décrivez votre proposition d'activité culturelle</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="type_activite"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type d'activité *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="conference">Conférence</SelectItem>
                <SelectItem value="atelier">Atelier</SelectItem>
                <SelectItem value="exposition">Exposition</SelectItem>
                <SelectItem value="concert">Concert</SelectItem>
                <SelectItem value="lecture">Lecture</SelectItem>
                <SelectItem value="projection">Projection</SelectItem>
                <SelectItem value="debat">Débat</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="titre"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titre de l'activité *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Titre accrocheur de l'activité" className="rounded-xl" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description détaillée *</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Décrivez votre activité en détail..." 
                className="rounded-xl min-h-[120px]" 
              />
            </FormControl>
            <FormDescription>Minimum 50 caractères</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="objectifs"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Objectifs *</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Quels sont les objectifs de cette activité ?" 
                className="rounded-xl min-h-[100px]" 
              />
            </FormControl>
            <FormDescription>Minimum 50 caractères</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="public_cible"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Public cible *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Sélectionnez le public" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="etudiants">Étudiants</SelectItem>
                  <SelectItem value="professionnels">Professionnels</SelectItem>
                  <SelectItem value="grand_public">Grand public</SelectItem>
                  <SelectItem value="jeunes">Jeunes</SelectItem>
                  <SelectItem value="chercheurs">Chercheurs</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="langue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Langue de l'activité *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Sélectionnez la langue" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="arabe">Arabe</SelectItem>
                  <SelectItem value="francais">Français</SelectItem>
                  <SelectItem value="anglais">Anglais</SelectItem>
                  <SelectItem value="amazighe">Amazighe</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="nb_participants_estime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre estimé de participants</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                type="number" 
                min="1"
                placeholder="ex: 50" 
                className="rounded-xl"
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </FormControl>
            <FormDescription>Optionnel</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dossier_projet_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Upload du dossier de projet / programme *</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl border-[#333333]/20"
                  onClick={() => document.getElementById('dossier-upload')?.click()}
                  disabled={uploadingDossier}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingDossier ? "Upload en cours..." : field.value ? "Dossier uploadé ✓" : "Choisir un fichier"}
                </Button>
                <input
                  id="dossier-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <FormDescription>PDF ou DOCX, max 10 MB</FormDescription>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default StepProposition;
