import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CmsMenusManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Menus & Footer</CardTitle>
        <CardDescription>
          Configurez la navigation et le pied de page bilingues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Interface de gestion des menus et footer en cours de développement...
        </p>
      </CardContent>
    </Card>
  );
}
