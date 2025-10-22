import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { ProgramContributionFormData } from "@/schemas/programContributionSchema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Building2, FileText, Upload } from "lucide-react";

interface StepDemandeurProps {
  form: UseFormReturn<ProgramContributionFormData>;
}

const StepDemandeur = ({ form }: StepDemandeurProps) => {
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingStatut, setUploadingStatut] = useState(false);
  const { toast } = useToast();
  const typeDemandeur = form.watch("type_demandeur");

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "Le fichier ne doit pas dépasser 10 Mo",
        variant: "destructive",
      });
      return;
    }

    setUploadingCV(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cv_${Math.random()}.${fileExt}`;
      const filePath = `program-contributions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      form.setValue('cv_url', publicUrl);
      toast({
        title: "Succès",
        description: "CV téléchargé avec succès",
      });
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le CV",
        variant: "destructive",
      });
    } finally {
      setUploadingCV(false);
    }
  };

  const handleStatutUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "Le fichier ne doit pas dépasser 10 Mo",
        variant: "destructive",
      });
      return;
    }

    setUploadingStatut(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `statut_${Math.random()}.${fileExt}`;
      const filePath = `program-contributions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      form.setValue('statut_juridique_url', publicUrl);
      toast({
        title: "Succès",
        description: "Statut juridique téléchargé avec succès",
      });
    } catch (error) {
      console.error('Error uploading statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le statut juridique",
        variant: "destructive",
      });
    } finally {
      setUploadingStatut(false);
    }
  };

  return (
    <div className="space-y-6 font-['Segoe_UI','Noto_Sans',sans-serif]">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
          <User className="h-5 w-5 text-[#D4AF37]" />
        </div>
        <h2 className="text-xl font-bold text-[#333333]">Informations sur le demandeur</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="nom_complet"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#333333]">Nom complet *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Nom complet" 
                  className="rounded-xl border-[#333333]/20 transition-all duration-300 focus:border-[#D4AF37]"
                />
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
              <FormLabel className="text-[#333333]">Statut *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl border-[#333333]/20">
                    <SelectValue placeholder="Sélectionnez votre statut" />
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#333333]">Email *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="email" 
                  placeholder="email@exemple.com" 
                  className="rounded-xl border-[#333333]/20 transition-all duration-300 focus:border-[#D4AF37]"
                />
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
              <FormLabel className="text-[#333333]">Téléphone *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="+212 6XX XXX XXX" 
                  className="rounded-xl border-[#333333]/20 transition-all duration-300 focus:border-[#D4AF37]"
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
              <FormLabel className="text-[#333333]">Organisme (si applicable)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Nom de l'organisme" 
                  className="rounded-xl border-[#333333]/20 transition-all duration-300 focus:border-[#D4AF37]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="adresse"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-[#333333]">Adresse</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Adresse complète" 
                className="rounded-xl border-[#333333]/20 transition-all duration-300 focus:border-[#D4AF37] min-h-[80px]"
              />
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
            <FormLabel className="text-[#333333] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#D4AF37]" />
              CV / Présentation *
            </FormLabel>
            <FormControl>
              <div className="space-y-2">
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#D4AF37]/30 rounded-xl cursor-pointer hover:bg-[#D4AF37]/5 transition-all duration-300">
                  <Upload className="h-4 w-4 text-[#D4AF37]" />
                  <span className="text-[#333333]">
                    {uploadingCV ? "Téléchargement..." : field.value ? "✓ Fichier téléchargé" : "Télécharger le CV (PDF, DOCX)"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCVUpload}
                    disabled={uploadingCV}
                    className="hidden"
                  />
                </label>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {(typeDemandeur === "association" || typeDemandeur === "institution") && (
        <FormField
          control={form.control}
          name="statut_juridique_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#333333] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#D4AF37]" />
                Statut juridique *
              </FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#D4AF37]/30 rounded-xl cursor-pointer hover:bg-[#D4AF37]/5 transition-all duration-300">
                    <Upload className="h-4 w-4 text-[#D4AF37]" />
                    <span className="text-[#333333]">
                      {uploadingStatut ? "Téléchargement..." : field.value ? "✓ Fichier téléchargé" : "Télécharger le statut juridique (PDF, DOCX)"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleStatutUpload}
                      disabled={uploadingStatut}
                      className="hidden"
                    />
                  </label>
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
