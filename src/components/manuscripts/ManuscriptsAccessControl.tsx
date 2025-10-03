import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function ManuscriptsAccessControl() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Contrôle d'Accès
        </CardTitle>
        <CardDescription>
          Gestion des permissions et niveaux d'accès aux manuscrits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Module de contrôle d'accès à venir : gestion des demandes d'accès, attribution de permissions, etc.
        </p>
      </CardContent>
    </Card>
  );
}
