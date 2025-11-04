import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FormGeneratorProps {
  formKey: string;
  formName: string;
  onGenerate: () => Promise<void>;
}

export function FormGenerator({ formKey, formName, onGenerate }: FormGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!confirm(`Voulez-vous générer automatiquement toutes les sections et champs pour "${formName}" ?\n\nCela créera la structure complète du formulaire.`)) {
      return;
    }

    setGenerating(true);
    try {
      await onGenerate();
      toast.success("Structure du formulaire générée avec succès !");
    } catch (error) {
      console.error("Error generating form:", error);
      toast.error("Erreur lors de la génération du formulaire");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="p-4 mb-6 border-2 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Génération automatique</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Générer automatiquement toutes les sections et champs du formulaire
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4 mr-2" />
          )}
          Générer le formulaire
        </Button>
      </div>
    </Card>
  );
}
