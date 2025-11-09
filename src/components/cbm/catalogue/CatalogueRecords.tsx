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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type Record = {
  id: string;
  title: string;
  author: string;
  type: string;
  isbn: string;
  library: string;
  dateAdded: string;
  status: string;
};

export function CatalogueRecords() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLibrary, setFilterLibrary] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    type: "livre",
    isbn: "",
    library: "bn",
  });

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

  const filteredRecords = records.filter((record) => {
    const matchesSearch = 
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.isbn.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || record.type.toLowerCase() === filterType;
    
    const matchesLibrary = filterLibrary === "all" || 
      (filterLibrary === "bn" && record.library.includes("BN")) ||
      (filterLibrary === "hassan2" && record.library.includes("Hassan II")) ||
      (filterLibrary === "ibntofail" && record.library.includes("Ibn Tofail"));
    
    return matchesSearch && matchesType && matchesLibrary;
  });

  const handleCreate = () => {
    toast({
      title: "Notice créée",
      description: `La notice "${formData.title}" a été créée avec succès.`,
    });
    setIsCreateDialogOpen(false);
    setFormData({ title: "", author: "", type: "livre", isbn: "", library: "bn" });
  };

  const handleView = (record: Record) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (record: Record) => {
    setSelectedRecord(record);
    setFormData({
      title: record.title,
      author: record.author,
      type: record.type.toLowerCase(),
      isbn: record.isbn,
      library: record.library.toLowerCase().includes("hassan") ? "hassan2" : 
               record.library.toLowerCase().includes("ibn") ? "ibntofail" : "bn",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    toast({
      title: "Notice mise à jour",
      description: `La notice a été modifiée avec succès.`,
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    toast({
      title: "Notice supprimée",
      description: "La notice a été supprimée avec succès.",
      variant: "destructive",
    });
    setIsDeleteDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleExport = () => {
    const csvContent = [
      ["Titre", "Auteur", "Type", "ISBN/ISSN", "Bibliothèque", "Date d'ajout", "Statut"],
      ...filteredRecords.map(r => [r.title, r.author, r.type, r.isbn, r.library, r.dateAdded, r.status])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalogue-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: "Export réussi",
      description: `${filteredRecords.length} notices exportées.`,
    });
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
            <Button 
              className="gap-2"
              variant={searchQuery || filterType !== "all" || filterLibrary !== "all" ? "default" : "outline"}
            >
              <Filter className="h-4 w-4" />
              Filtrer ({filteredRecords.length})
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              className="gap-2 bg-cbm-primary hover:bg-cbm-primary/90"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Nouvelle notice
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleExport}
              disabled={filteredRecords.length === 0}
            >
              <Download className="h-4 w-4" />
              Exporter ({filteredRecords.length})
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
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucune notice trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleView(record)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Affichage de {filteredRecords.length} notice{filteredRecords.length > 1 ? 's' : ''}
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

      {/* Dialog Création/Édition */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        setIsEditDialogOpen(open);
        if (!open) setFormData({ title: "", author: "", type: "livre", isbn: "", library: "bn" });
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? "Nouvelle notice bibliographique" : "Modifier la notice"}
            </DialogTitle>
            <DialogDescription>
              {isCreateDialogOpen 
                ? "Créer une nouvelle notice dans le catalogue collectif" 
                : "Modifier les informations de la notice"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de l'ouvrage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Auteur *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Nom de l'auteur"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type de document *</Label>
                <CustomSelect
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  options={[
                    { value: "livre", label: "Livre" },
                    { value: "periodique", label: "Périodique" },
                    { value: "audio", label: "Document audio" },
                    { value: "video", label: "Document vidéo" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN/ISSN *</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  placeholder="978-X-XXX-XXXXX-X"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="library">Bibliothèque *</Label>
              <CustomSelect
                value={formData.library}
                onValueChange={(value) => setFormData({ ...formData, library: value })}
                options={[
                  { value: "bn", label: "BN Rabat" },
                  { value: "hassan2", label: "BU Hassan II" },
                  { value: "ibntofail", label: "BU Ibn Tofail" },
                ]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
            }}>
              Annuler
            </Button>
            <Button 
              onClick={isCreateDialogOpen ? handleCreate : handleUpdate}
              disabled={!formData.title || !formData.author || !formData.isbn}
            >
              {isCreateDialogOpen ? "Créer" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Visualisation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la notice</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Titre</Label>
                  <p className="font-medium mt-1">{selectedRecord.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Auteur</Label>
                  <p className="font-medium mt-1">{selectedRecord.author}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium mt-1">{selectedRecord.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ISBN/ISSN</Label>
                  <p className="font-mono mt-1">{selectedRecord.isbn}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Bibliothèque</Label>
                  <p className="font-medium mt-1">{selectedRecord.library}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date d'ajout</Label>
                  <p className="font-medium mt-1">
                    {new Date(selectedRecord.dateAdded).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette notice ?
              {selectedRecord && (
                <span className="block mt-2 font-medium text-foreground">
                  "{selectedRecord.title}"
                </span>
              )}
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
