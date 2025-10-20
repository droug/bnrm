import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, GitBranch } from "lucide-react";

export function RequestsWorkflowSettings() {
  return (
    <div className="space-y-6">
      {/* Statuts des demandes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Statuts et circuits de validation
          </CardTitle>
          <CardDescription>
            Configuration des statuts disponibles pour les demandes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base mb-3 block">Demandes de Réservation</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">En attente</Badge>
              <Badge variant="default">Acceptée</Badge>
              <Badge variant="destructive">Refusée</Badge>
              <Badge variant="outline">Terminée</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Workflow : En attente → Acceptée/Refusée → Terminée
            </p>
          </div>

          <div>
            <Label className="text-base mb-3 block">Demandes de Numérisation</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">En attente</Badge>
              <Badge variant="default">En cours</Badge>
              <Badge variant="default">Approuvé</Badge>
              <Badge variant="destructive">Rejeté</Badge>
              <Badge variant="outline">Terminé</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Workflow : En attente → En cours → Approuvé/Rejeté → Terminé
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rôles autorisés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Rôles et permissions
          </CardTitle>
          <CardDescription>
            Définition des rôles autorisés à traiter les demandes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base mb-2 block">Demandes de Réservation</Label>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Visualiser</span>
                <Badge variant="outline">Admin, Bibliothécaire</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Accepter/Refuser</span>
                <Badge variant="outline">Admin, Bibliothécaire</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Archiver</span>
                <Badge variant="outline">Admin, Bibliothécaire</Badge>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base mb-2 block">Demandes de Numérisation</Label>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Visualiser</span>
                <Badge variant="outline">Admin, Bibliothécaire</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Changer le statut</span>
                <Badge variant="outline">Admin, Bibliothécaire</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Affecter un agent</span>
                <Badge variant="outline">Admin</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Valider/Rejeter</span>
                <Badge variant="outline">Admin, Bibliothécaire</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration des notifications
          </CardTitle>
          <CardDescription>
            Paramètres des notifications automatiques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Nouvelle demande soumise</span>
              <Badge variant="outline">Admin + Bibliothécaires</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Demande acceptée</span>
              <Badge variant="outline">Lecteur concerné</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Demande refusée</span>
              <Badge variant="outline">Lecteur concerné</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Statut modifié</span>
              <Badge variant="outline">Lecteur concerné</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span>Document disponible</span>
              <Badge variant="outline">Lecteur concerné</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Les paramètres affichés sont actuellement en mode lecture seule. 
          Les modifications des workflows et des rôles sont gérées via la configuration système.
          Toutes les actions sont automatiquement tracées dans les logs d'activité.
        </p>
      </div>
    </div>
  );
}
