import { UseFormReturn, useFieldArray } from "react-hook-form";
import { PartnershipRequestFormData } from "@/schemas/partnershipRequestSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StepRepresentantsProps {
  form: UseFormReturn<PartnershipRequestFormData>;
}

const StepRepresentants = ({ form }: StepRepresentantsProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "representants",
  });
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File, index: number) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 10 Mo",
        variant: "destructive",
      });
      return;
    }

    setUploadingIndex(index);
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

      form.setValue(`representants.${index}.piece_identite_url`, publicUrl);
      toast({
        title: "Document téléchargé",
        description: "La pièce d'identité a été téléchargée avec succès",
      });
    } catch (error) {
      console.error("Erreur upload:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement",
        variant: "destructive",
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Représentants de l'organisme</h3>
          <p className="text-sm text-muted-foreground">
            Ajoutez au moins un représentant
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              nom_complet: "",
              fonction: "",
              telephone: "",
              email: "",
              piece_identite_url: "",
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un représentant
        </Button>
      </div>

      {fields.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              Aucun représentant ajouté. Cliquez sur "Ajouter un représentant" pour commencer.
            </p>
          </CardContent>
        </Card>
      )}

      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base">
              Représentant {index + 1}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name={`representants.${index}.nom_complet`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom et prénom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`representants.${index}.fonction`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fonction / Titre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Président, Directeur..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`representants.${index}.telephone`}
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
                name={`representants.${index}.email`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemple.ma" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`representants.${index}.piece_identite_url`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pièce d'identité (facultatif)</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, index);
                        }}
                        disabled={uploadingIndex === index}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingIndex === index}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  {field.value && (
                    <p className="text-sm text-green-600">✓ Document téléchargé</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StepRepresentants;
