import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useCulturalActivitiesAuth } from "@/hooks/useCulturalActivitiesAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Upload, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SystemList {
  id: string;
  list_code: string;
  list_name: string;
  module: string;
  field_type: string;
  description: string;
  is_active: boolean;
  updated_at: string;
  value_count?: number;
}

export default function SystemListsPage() {
  const { user } = useAuth();
  const { isAuthorized, loading: authLoading } = useCulturalActivitiesAuth();
  const { toast } = useToast();
  
  const [lists, setLists] = useState<SystemList[]>([]);
  const [filteredLists, setFilteredLists] = useState<SystemList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<SystemList | null>(null);
  const [formData, setFormData] = useState({
    list_name: "",
    list_code: "",
    module: "",
    field_type: "simple",
    description: ""
  });

  const modules = [
    { value: "all", label: "Tous les modules" },
    { value: "activites_culturelles", label: "Activités Culturelles" },
    { value: "reservations", label: "Réservations" },
    { value: "visites", label: "Visites guidées" },
    { value: "partenariats", label: "Partenariats" },
    { value: "programmation", label: "Programmation" },
    { value: "cbm", label: "CBM" },
    { value: "depot_legal", label: "Dépôt Légal" },
    { value: "bibliotheque", label: "Bibliothèque Numérique" },
    { value: "manuscrits", label: "Manuscrits" }
  ];

  useEffect(() => {
    if (user && isAuthorized) {
      fetchLists();
    }
  }, [user, isAuthorized]);

  useEffect(() => {
    if (selectedModule === "all") {
      setFilteredLists(lists);
    } else {
      setFilteredLists(lists.filter(list => list.module === selectedModule));
    }
  }, [selectedModule, lists]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      
      // Fetch lists with value counts
      const { data: listsData, error: listsError } = await supabase
        .from("system_lists")
        .select(`
          *,
          system_list_values(count)
        `)
        .order("module", { ascending: true })
        .order("list_name", { ascending: true });

      if (listsError) throw listsError;

      const listsWithCounts = listsData.map(list => ({
        ...list,
        value_count: list.system_list_values?.[0]?.count || 0
      }));

      setLists(listsWithCounts);
      setFilteredLists(listsWithCounts);
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les listes système",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (list: SystemList) => {
    setSelectedList(list);
    setFormData({
      list_name: list.list_name,
      list_code: list.list_code,
      module: list.module || "",
      field_type: list.field_type,
      description: list.description || ""
    });
    setEditDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedList(null);
    setFormData({
      list_name: "",
      list_code: "",
      module: "",
      field_type: "simple",
      description: ""
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedList) {
        // Update
        const { error } = await supabase
          .from("system_lists")
          .update({
            list_name: formData.list_name,
            list_code: formData.list_code,
            module: formData.module,
            field_type: formData.field_type,
            description: formData.description,
            updated_at: new Date().toISOString()
          })
          .eq("id", selectedList.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Liste mise à jour avec succès"
        });
      } else {
        // Create
        const { error } = await supabase
          .from("system_lists")
          .insert({
            list_name: formData.list_name,
            list_code: formData.list_code,
            module: formData.module,
            field_type: formData.field_type,
            description: formData.description
          });

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Liste créée avec succès"
        });
      }

      setEditDialogOpen(false);
      fetchLists();
    } catch (error) {
      console.error("Error saving list:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la liste",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedList) return;

    try {
      const { error } = await supabase
        .from("system_lists")
        .delete()
        .eq("id", selectedList.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Liste supprimée avec succès"
      });

      setDeleteDialogOpen(false);
      fetchLists();
    } catch (error) {
      console.error("Error deleting list:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la liste",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getFieldTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      simple: { label: "Simple", className: "bg-blue-500" },
      hierarchical: { label: "Hiérarchique", className: "bg-purple-500" },
      multiple: { label: "Multiple", className: "bg-green-500" }
    };

    const variant = variants[type] || variants.simple;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6">
          <Skeleton className="h-8 w-[250px] mb-4" />
          <Skeleton className="h-[600px]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Systèmes de listes</h1>
          <p className="text-muted-foreground">
            Gestion centralisée des listes déroulantes utilisées dans les formulaires
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Listes système</CardTitle>
                <CardDescription>
                  Sélectionnez un module pour filtrer les listes
                </CardDescription>
              </div>
              <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle liste
              </Button>
            </div>

            <div className="mt-4">
              <Label htmlFor="module-filter">Module concerné</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger id="module-filter" className="w-full md:w-[300px] bg-background">
                  <SelectValue placeholder="Sélectionner un module" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {modules.map((module) => (
                    <SelectItem key={module.value} value={module.value}>
                      {module.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom de la liste</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Nombre d'entrées</TableHead>
                      <TableHead>Dernière mise à jour</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLists.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Aucune liste trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLists.map((list) => (
                        <TableRow key={list.id}>
                          <TableCell className="font-medium">{list.list_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {modules.find(m => m.value === list.module)?.label || list.module}
                            </Badge>
                          </TableCell>
                          <TableCell>{getFieldTypeBadge(list.field_type)}</TableCell>
                          <TableCell>{list.value_count || 0}</TableCell>
                          <TableCell>{formatDate(list.updated_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(list)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedList(list);
                                  setDeleteDialogOpen(true);
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
            )}
          </CardContent>
        </Card>

        {/* Edit/Create Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>
                {selectedList ? "Modifier la liste" : "Nouvelle liste"}
              </DialogTitle>
              <DialogDescription>
                Configurez les paramètres de la liste système
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="list_name">Nom de la liste</Label>
                <Input
                  id="list_name"
                  value={formData.list_name}
                  onChange={(e) => setFormData({ ...formData, list_name: e.target.value })}
                  placeholder="Ex: Type de publication"
                />
              </div>

              <div>
                <Label htmlFor="list_code">Code de la liste</Label>
                <Input
                  id="list_code"
                  value={formData.list_code}
                  onChange={(e) => setFormData({ ...formData, list_code: e.target.value })}
                  placeholder="Ex: type_publication"
                />
              </div>

              <div>
                <Label htmlFor="module">Module</Label>
                <Select value={formData.module} onValueChange={(value) => setFormData({ ...formData, module: value })}>
                  <SelectTrigger id="module" className="bg-background">
                    <SelectValue placeholder="Sélectionner un module" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {modules.filter(m => m.value !== "all").map((module) => (
                      <SelectItem key={module.value} value={module.value}>
                        {module.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="field_type">Type de liste</Label>
                <Select value={formData.field_type} onValueChange={(value) => setFormData({ ...formData, field_type: value })}>
                  <SelectTrigger id="field_type" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="hierarchical">Hiérarchique</SelectItem>
                    <SelectItem value="multiple">Multiple</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la liste..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                {selectedList ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer la liste "{selectedList?.list_name}" ?
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
