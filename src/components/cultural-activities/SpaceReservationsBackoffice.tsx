import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Construction } from "lucide-react";

const SpaceReservationsBackoffice = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-light">Gestion des réservations d'espaces</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Construction className="h-4 w-4" />
            <AlertDescription>
              Cette fonctionnalité sera disponible prochainement. Elle permettra de gérer les demandes de réservation d'espaces culturels de la BNRM.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4 text-sm text-muted-foreground">
            <p className="font-medium">Fonctionnalités à venir :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Tableau de gestion des demandes de réservation</li>
              <li>Colonnes : Demandeur, Espace demandé, Date, Horaire, Statut, Actions</li>
              <li>Validation et rejet des demandes</li>
              <li>Génération automatique de confirmations</li>
              <li>Envoi d'emails automatiques</li>
              <li>Calendrier de disponibilité des espaces</li>
              <li>Gestion des conflits de réservation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpaceReservationsBackoffice;
