import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface PermissionSearchProps {
  searchQuery: string;
}

export function PermissionSearch({ searchQuery }: PermissionSearchProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Recherche Avancée de Permissions
        </CardTitle>
        <CardDescription>
          Trouvez rapidement les permissions spécifiques à travers toutes les plateformes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {searchQuery ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Résultats pour: <Badge variant="secondary">{searchQuery}</Badge>
            </p>
            <p className="text-sm text-muted-foreground">
              Les résultats de recherche seront affichés ici
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Utilisez la barre de recherche pour trouver des permissions spécifiques
          </p>
        )}
      </CardContent>
    </Card>
  );
}
