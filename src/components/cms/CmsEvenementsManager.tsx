import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CmsEvenementsManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Événements</CardTitle>
        <CardDescription>
          Créez et gérez les événements avec dates et lieux bilingues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Interface de gestion des événements en cours de développement...
        </p>
      </CardContent>
    </Card>
  );
}
