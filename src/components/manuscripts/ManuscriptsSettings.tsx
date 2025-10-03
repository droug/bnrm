import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export function ManuscriptsSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Paramètres de la Plateforme
        </CardTitle>
        <CardDescription>
          Configuration générale de la plateforme des manuscrits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Paramètres à venir : configuration de l'accès, règles de numérisation, workflows, etc.
        </p>
      </CardContent>
    </Card>
  );
}
