import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function CreateTestDepositButton() {
  const createTestDeposits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }

      const testDeposits = [
        {
          request_number: `DL-2025-TEST-${Date.now()}-1`,
          title: "Histoire du Maroc Contemporain",
          subtitle: "De l'indépendance à nos jours",
          publication_title: "Histoire du Maroc Contemporain",
          author_name: "Mohammed Benali",
          publication_type: "monographies",
          monograph_type: "livres",
          language: "ar",
          support_type: "livre",
          status: "soumis",
          initiator_id: user.id,
        },
        {
          request_number: `DL-2025-TEST-${Date.now()}-2`,
          title: "Poésie Amazighe",
          subtitle: "Recueil traditionnel",
          publication_title: "Poésie Amazighe",
          author_name: "Fatima Tahiri",
          publication_type: "monographies",
          monograph_type: "livres",
          language: "ber",
          support_type: "livre",
          status: "en_attente_validation_b",
          initiator_id: user.id,
          validated_by_service: user.id,
          service_validated_at: new Date().toISOString(),
          service_validation_notes: "Dossier complet",
        },
        {
          request_number: `DL-2025-TEST-${Date.now()}-3`,
          title: "Architecture Marocaine",
          subtitle: "Tradition et modernité",
          publication_title: "Architecture Marocaine",
          author_name: "Ahmed Tazi",
          publication_type: "monographies",
          monograph_type: "livres",
          language: "fr",
          support_type: "livre",
          status: "en_attente_comite_validation",
          initiator_id: user.id,
          validated_by_service: user.id,
          service_validated_at: new Date().toISOString(),
          validated_by_department: user.id,
          department_validated_at: new Date().toISOString(),
        },
      ];

      const { error } = await supabase
        .from("legal_deposit_requests")
        .insert(testDeposits as any);

      if (error) throw error;

      toast.success(`${testDeposits.length} dépôts de test créés avec succès`);
      window.location.reload();
    } catch (error) {
      console.error("Error creating test deposits:", error);
      toast.error("Erreur lors de la création des dépôts de test");
    }
  };

  return (
    <Button onClick={createTestDeposits} variant="outline" size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Créer des dépôts de test
    </Button>
  );
}
