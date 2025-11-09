import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, RefreshCw } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";

export function CatalogueSettings() {
  return (
    <div className="space-y-6">
      {/* Paramètres généraux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres Généraux
          </CardTitle>
          <CardDescription>
            Configuration générale du catalogue collectif
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom du catalogue</Label>
              <Input defaultValue="Catalogue Bibliographique Marocain" />
            </div>

            <div className="space-y-2">
              <Label>Code du catalogue</Label>
              <Input defaultValue="CBM-2025" />
            </div>

            <div className="space-y-2">
              <Label>Format par défaut</Label>
              <CustomSelect
                value="marc21"
                onValueChange={() => {}}
                options={[
                  { value: "marc21", label: "MARC21" },
                  { value: "unimarc", label: "UNIMARC" },
                  { value: "dublincore", label: "Dublin Core" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label>Langue par défaut</Label>
              <CustomSelect
                value="fr"
                onValueChange={() => {}}
                options={[
                  { value: "fr", label: "Français" },
                  { value: "ar", label: "Arabe" },
                  { value: "en", label: "Anglais" },
                ]}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Catalogage collaboratif</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre aux bibliothèques membres de contribuer
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Validation automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Publier automatiquement les notices des bibliothèques autorisées
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Détection des doublons</Label>
                <p className="text-sm text-muted-foreground">
                  Vérifier automatiquement les notices en double
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer des notifications pour les nouvelles notices
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indexation et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Indexation et Recherche</CardTitle>
          <CardDescription>
            Paramètres d'indexation et de recherche du catalogue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recherche plein texte</Label>
                <p className="text-sm text-muted-foreground">
                  Activer la recherche dans le contenu complet
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recherche phonétique</Label>
                <p className="text-sm text-muted-foreground">
                  Rechercher par similarité phonétique
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Indexation automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Réindexer automatiquement les nouvelles notices
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Réindexer tout le catalogue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Normes et standards */}
      <Card>
        <CardHeader>
          <CardTitle>Normes et Standards</CardTitle>
          <CardDescription>
            Configuration des normes de catalogage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Norme de catalogage</Label>
              <CustomSelect
                value="rda"
                onValueChange={() => {}}
                options={[
                  { value: "rda", label: "RDA (Resource Description and Access)" },
                  { value: "aacr2", label: "AACR2" },
                  { value: "isbd", label: "ISBD" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label>Classification</Label>
              <CustomSelect
                value="dewey"
                onValueChange={() => {}}
                options={[
                  { value: "dewey", label: "Dewey (CDD)" },
                  { value: "lcc", label: "Library of Congress (LCC)" },
                  { value: "udc", label: "Classification Décimale Universelle (CDU)" },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Enregistrer les paramètres
        </Button>
        <Button variant="outline">
          Réinitialiser
        </Button>
      </div>
    </div>
  );
}
