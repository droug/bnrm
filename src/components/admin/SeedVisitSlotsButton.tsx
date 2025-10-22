import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const SeedVisitSlotsButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-visit-slots");

      if (error) throw error;

      console.log("Seed result:", data);
      toast.success(data.message || "Créneaux créés avec succès!");
      
      // Invalider le cache pour rafraîchir les créneaux
      queryClient.invalidateQueries({ queryKey: ["visit-slots"] });
    } catch (error: any) {
      console.error("Error seeding visit slots:", error);
      toast.error("Erreur lors de la création des créneaux: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSeed}
      disabled={isLoading}
      variant="outline"
      className="rounded-xl"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Création en cours...
        </>
      ) : (
        <>
          <Calendar className="mr-2 h-4 w-4" />
          Générer créneaux de test
        </>
      )}
    </Button>
  );
};

export default SeedVisitSlotsButton;
