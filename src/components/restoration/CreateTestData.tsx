import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function CreateTestData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const createTestData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Créer 3 demandes de test
      const requests: any[] = [
        {
          user_id: user.id,
          manuscript_title: 'Manuscrit enluminé du 14e siècle',
          manuscript_cote: 'MS-14-042',
          damage_description: 'Dégâts d\'eau importants sur les pages 5 à 15, décoloration des enluminures',
          urgency_level: 'elevee',
          status: 'devis_en_attente',
          quote_amount: 2500.00,
          estimated_duration: 30
        },
        {
          user_id: user.id,
          manuscript_title: 'Recueil de poésie arabe',
          manuscript_cote: 'MS-AR-156',
          damage_description: 'Reliure endommagée, pages détachées',
          urgency_level: 'moyenne',
          status: 'restauration_en_cours',
          quote_amount: 1800.00,
          estimated_duration: 20
        },
        {
          user_id: user.id,
          manuscript_title: 'Traité de médecine andalouse',
          manuscript_cote: 'MS-MED-089',
          damage_description: 'Taches d\'humidité, moisissures légères',
          urgency_level: 'faible',
          status: 'terminee'
        }
      ];

      // Insérer les demandes
      const { data: insertedRequests, error: requestsError } = await supabase
        .from('restoration_requests')
        .insert(requests)
        .select();

      if (requestsError) throw requestsError;

      // Créer des notifications pour chaque demande
      if (insertedRequests && insertedRequests.length > 0) {
        const notifications = [
          {
            request_id: insertedRequests[0].id,
            recipient_id: user.id,
            notification_type: 'quote_sent',
            title: `Devis de restauration - ${insertedRequests[0].request_number}`,
            message: 'Le devis pour la restauration de votre manuscrit est maintenant disponible. Montant: 2500 DH. Veuillez consulter et accepter le devis.'
          },
          {
            request_id: insertedRequests[1].id,
            recipient_id: user.id,
            notification_type: 'restoration_started',
            title: `Restauration en cours - ${insertedRequests[1].request_number}`,
            message: 'La restauration de votre manuscrit a commencé. Durée estimée: 20 jours.'
          },
          {
            request_id: insertedRequests[2].id,
            recipient_id: user.id,
            notification_type: 'restoration_completed',
            title: `Restauration terminée - ${insertedRequests[2].request_number}`,
            message: 'La restauration de votre manuscrit est terminée. Un rapport détaillé est disponible.'
          }
        ];

        const { error: notificationsError } = await supabase
          .from('restoration_notifications')
          .insert(notifications);

        if (notificationsError) throw notificationsError;
      }

      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['restoration-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['my-restoration-requests'] });

      toast({
        title: "Succès",
        description: "Données de test créées avec succès ! Rafraîchissez la page.",
      });
    } catch (error: any) {
      console.error('Error creating test data:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer les données de test",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={createTestData}
      disabled={loading}
      size="sm"
      variant="outline"
    >
      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      Créer des données de test
    </Button>
  );
}
