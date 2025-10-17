import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FlaskConical, Loader2 } from "lucide-react";

export function CreateTestProfessionalsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateTestProfessionals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-test-professionals');

      if (error) throw error;

      toast({
        title: "Professionnels de test créés",
        description: `${data.results?.length || 0} comptes professionnels ont été créés avec succès`,
        className: "bg-green-50 border-green-200",
      });

      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer les professionnels de test",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCreateTestProfessionals}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Création...
        </>
      ) : (
        <>
          <FlaskConical className="mr-2 h-4 w-4" />
          Créer données de test
        </>
      )}
    </Button>
  );
}
