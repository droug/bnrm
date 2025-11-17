import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CmsActualitesManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Actualités</CardTitle>
        <CardDescription>
          Créez et gérez les actualités bilingues FR/AR
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Interface de gestion des actualités en cours de développement...
        </p>
      </CardContent>
    </Card>
  );
}
