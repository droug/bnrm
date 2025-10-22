import { UseFormReturn } from "react-hook-form";
import { PartnershipRequestFormData } from "@/schemas/partnershipRequestSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, Building2, FileText } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StepOrganismeIdentificationProps {
  form: UseFormReturn<PartnershipRequestFormData>;
}

const StepOrganismeIdentification = ({ form }: StepOrganismeIdentificationProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const statutJuridique = form.watch("statut_juridique");

  const handleFileUpload = async (file: File, fieldName: "statut_document_url") => {
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

      form.setValue(fieldName, publicUrl);
      toast({
        title: "Document téléchargé",
        description: "Le document a été téléchargé avec succès",
      });
    } catch (error) {
      console.error("Erreur upload:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement du document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
        <Building2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-[#333333]">Informations sur l'organisme</h3>
      </div>

      <FormField
        control={form.control}
        name="nom_organisme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom de l'organisme *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Association culturelle..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="statut_juridique"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut juridique *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="association">Association</SelectItem>
                  <SelectItem value="organisme_public">Organisme public</SelectItem>
                  <SelectItem value="organisme_prive">Organisme privé</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nationalite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nationalité *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="marocain">Marocain</SelectItem>
                  <SelectItem value="etranger">Étranger</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="type_organisation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type d'organisation *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="institution">Institution</SelectItem>
                <SelectItem value="etablissement">Établissement</SelectItem>
                <SelectItem value="ong">ONG</SelectItem>
                <SelectItem value="entreprise">Entreprise</SelectItem>
                <SelectItem value="collectivite">Collectivité</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description_organisme"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description de l'organisme</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Présentez brièvement votre organisme..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="telephone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone *</FormLabel>
              <FormControl>
                <Input placeholder="+212 6XX XXX XXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email_officiel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email officiel *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contact@organisme.ma" {...field} />
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
            <FormLabel>Adresse *</FormLabel>
            <FormControl>
              <Input placeholder="Adresse complète" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="site_web"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Site web</FormLabel>
            <FormControl>
              <Input placeholder="https://www.exemple.ma" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {statutJuridique === "association" && (
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 transition-all duration-300">
          <FormField
            control={form.control}
            name="statut_document_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Statut juridique (obligatoire pour les associations) *
                </FormLabel>
                <FormDescription>
                  Téléchargez le statut de votre association (PDF ou DOCX, max 10 Mo)
                </FormDescription>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "statut_document_url");
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
                    ✓ Document téléchargé
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default StepOrganismeIdentification;
