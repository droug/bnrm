import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Construction } from "lucide-react";

const GuidedToursBackoffice = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-light">Gestion des visites guidées</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Construction className="h-4 w-4" />
            <AlertDescription>
              Cette fonctionnalité sera disponible prochainement. Elle permettra de gérer les créneaux de visites guidées et les réservations.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4 text-sm text-muted-foreground">
            <p className="font-medium">Fonctionnalités à venir :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Gestion des créneaux de visites disponibles</li>
              <li>Tableau des réservations de visites</li>
              <li>Colonnes : Visiteur, Date, Horaire, Nombre de personnes, Langue, Statut</li>
              <li>Confirmation et annulation de réservations</li>
              <li>Génération de billets de visite</li>
              <li>Envoi d'emails de confirmation</li>
              <li>Gestion de la capacité des visites</li>
              <li>Statistiques de fréquentation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuidedToursBackoffice;
