import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export function WorkflowRolesManager() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des Rôles et Habilitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            La gestion des rôles multi-niveaux (global, par module, contextuel) sera configurée ici.
            Cette fonctionnalité permet de définir les habilitations pour chaque acteur du workflow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
