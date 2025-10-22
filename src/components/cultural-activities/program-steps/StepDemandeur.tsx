import { UseFormReturn } from "react-hook-form";
import { ProgramContributionFormData } from "@/schemas/programContributionSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, FileText, User, Building2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StepDemandeurProps {
  form: UseFormReturn<ProgramContributionFormData>;
}

const StepDemandeur = ({ form }: StepDemandeurProps) => {
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingStatut, setUploadingStatut] = useState(false);
  const { toast } = useToast();
  const typeDemandeur = form.watch("type_demandeur");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'cv_url' | 'statut_juridique_url',
    setUploading: (val: boolean) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Starting file upload:', file.name, 'Size:', file.size);

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 10 MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `program-contributions/${fileName}`;

      console.log('Uploading to:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      console.log('Upload result:', { data: uploadData, error: uploadError });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      console.log('Public URL:', urlData.publicUrl);

      form.setValue(fieldName, urlData.publicUrl, { shouldValidate: true });
      
      console.log('Form value set for', fieldName, ':', urlData.publicUrl);

      toast({
        title: "Fichier uploadé",
        description: "Le fichier a été uploadé avec succès",
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d'uploader le fichier",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
          <User className="h-6 w-6 text-[#D4AF37]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#333333]">Informations sur le demandeur</h3>
          <p className="text-sm text-[#333333]/70">Veuillez renseigner vos informations personnelles</p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="nom_complet"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom complet *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Votre nom complet" className="rounded-xl" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="type_demandeur"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Statut *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="artiste">Artiste</SelectItem>
                <SelectItem value="auteur">Auteur</SelectItem>
                <SelectItem value="intervenant">Intervenant</SelectItem>
                <SelectItem value="association">Association</SelectItem>
                <SelectItem value="institution">Institution</SelectItem>
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="votre@email.com" className="rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telephone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+212 6XX XXX XXX" className="rounded-xl" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="organisme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organisme (si applicable)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nom de l'organisme" className="rounded-xl" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="adresse"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Adresse</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Adresse complète" className="rounded-xl" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cv_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Upload CV / Présentation *</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl border-[#333333]/20"
                  onClick={() => document.getElementById('cv-upload')?.click()}
                  disabled={uploadingCV}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingCV ? "Upload en cours..." : field.value ? "Fichier uploadé ✓" : "Choisir un fichier"}
                </Button>
                <input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'cv_url', setUploadingCV)}
                />
                <FormDescription>PDF ou DOCX, max 10 MB</FormDescription>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {(typeDemandeur === 'association' || typeDemandeur === 'institution') && (
        <FormField
          control={form.control}
          name="statut_juridique_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Statut Juridique *</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl border-[#333333]/20"
                    onClick={() => document.getElementById('statut-upload')?.click()}
                    disabled={uploadingStatut}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {uploadingStatut ? "Upload en cours..." : field.value ? "Fichier uploadé ✓" : "Choisir un fichier"}
                  </Button>
                  <input
                    id="statut-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'statut_juridique_url', setUploadingStatut)}
                  />
                  <FormDescription>PDF ou DOCX, max 10 MB</FormDescription>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default StepDemandeur;
