import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CmsMediaManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bibliothèque de Médias</CardTitle>
        <CardDescription>
          Gérez vos images, vidéos et autres fichiers avec métadonnées bilingues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Interface de gestion des médias en cours de développement...
        </p>
      </CardContent>
    </Card>
  );
}
