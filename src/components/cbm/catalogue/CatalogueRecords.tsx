import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Download, Eye, Edit, Trash2 } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function CatalogueRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLibrary, setFilterLibrary] = useState("all");

  // Données simulées
  const records = [
    {
      id: "1",
      title: "تاريخ المغرب الحديث والمعاصر",
      author: "محمد العربي المساري",
      type: "Livre",
      isbn: "978-9954-123-456-7",
      library: "BN Rabat",
      dateAdded: "2025-01-10",
      status: "publié"
    },
    {
      id: "2",
      title: "Histoire du Maroc: De l'indépendance à nos jours",
      author: "Pierre Vermeren",
      type: "Livre",
      isbn: "978-2-7071-9876-5",
      library: "BU Hassan II",
      dateAdded: "2025-01-12",
      status: "publié"
    },
    {
      id: "3",
      title: "Revue Marocaine des Sciences Politiques",
      author: "Collectif",
      type: "Périodique",
      isbn: "ISSN 2028-5981",
      library: "BU Ibn Tofail",
      dateAdded: "2025-01-13",
      status: "en_validation"
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "publié":
        return <Badge className="bg-green-500">Publié</Badge>;
      case "en_validation":
        return <Badge className="bg-amber-500">En validation</Badge>;
      case "brouillon":
        return <Badge className="bg-gray-500">Brouillon</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Notices Bibliographiques</CardTitle>
          <CardDescription>
            Rechercher, modifier et gérer les notices du catalogue collectif
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, auteur, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <CustomSelect
              value={filterType}
              onValueChange={setFilterType}
              options={[
                { value: "all", label: "Tous les types" },
                { value: "livre", label: "Livres" },
                { value: "periodique", label: "Périodiques" },
                { value: "audio", label: "Documents audio" },
                { value: "video", label: "Documents vidéo" },
              ]}
            />
            <CustomSelect
              value={filterLibrary}
              onValueChange={setFilterLibrary}
              options={[
                { value: "all", label: "Toutes les bibliothèques" },
                { value: "bn", label: "BN Rabat" },
                { value: "hassan2", label: "BU Hassan II" },
                { value: "ibntofail", label: "BU Ibn Tofail" },
              ]}
            />
            <Button className="gap-2">
              <Filter className="h-4 w-4" />
              Filtrer
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="gap-2 bg-cbm-primary hover:bg-cbm-primary/90">
              <Plus className="h-4 w-4" />
              Nouvelle notice
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter la sélection
            </Button>
          </div>

          {/* Tableau des notices */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>ISBN/ISSN</TableHead>
                  <TableHead>Bibliothèque</TableHead>
                  <TableHead>Date d'ajout</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.title}</TableCell>
                    <TableCell>{record.author}</TableCell>
                    <TableCell>{record.type}</TableCell>
                    <TableCell className="font-mono text-sm">{record.isbn}</TableCell>
                    <TableCell>{record.library}</TableCell>
                    <TableCell>{new Date(record.dateAdded).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Affichage de 1 à 3 sur 125,450 notices
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Précédent
              </Button>
              <Button variant="outline" size="sm">
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
