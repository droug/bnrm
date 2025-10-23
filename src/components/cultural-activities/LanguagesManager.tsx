import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Languages as LanguagesIcon, ArrowLeftRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Language {
  id: string;
  name: string;
  code: string;
  native_name: string | null;
  orientation: "ltr" | "rtl";
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

type LanguageFormData = Omit<Language, "id" | "created_at" | "updated_at">;

export function LanguagesManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [formData, setFormData] = useState<LanguageFormData>({
    name: "",
    code: "",
    native_name: "",
    orientation: "ltr",
    is_active: true,
    sort_order: 0,
  });

  // Fetch languages
  const { data: languages, isLoading } = useQuery({
    queryKey: ["languages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("languages")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as Language[];
    },
  });

  // Create language mutation
  const createMutation = useMutation({
    mutationFn: async (data: LanguageFormData) => {
      const { error } = await supabase
        .from("languages")
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      toast.success("Langue créée avec succès");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la création: ${error.message}`);
    },
  });

  // Update language mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LanguageFormData> }) => {
      const { error } = await supabase
        .from("languages")
        .update(data)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      toast.success("Langue mise à jour avec succès");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });

  // Delete language mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("languages")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      toast.success("Langue supprimée avec succès");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      native_name: "",
      orientation: "ltr",
      is_active: true,
      sort_order: 0,
    });
    setEditingLanguage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLanguage) {
      updateMutation.mutate({ id: editingLanguage.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (language: Language) => {
    setEditingLanguage(language);
    setFormData({
      name: language.name,
      code: language.code,
      native_name: language.native_name || "",
      orientation: language.orientation,
      is_active: language.is_active,
      sort_order: language.sort_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette langue ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LanguagesIcon className="h-5 w-5" />
              Langues disponibles
            </CardTitle>
            <CardDescription>
              Gérez les langues et localisations du système avec codes ISO
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une langue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingLanguage ? "Modifier la langue" : "Ajouter une langue"}
                  </DialogTitle>
                  <DialogDescription>
                    Renseignez les informations de la langue avec son code ISO
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de la langue *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Français"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code">Code ISO 639-1 *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                        placeholder="fr"
                        maxLength={3}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Code ISO à 2-3 lettres (ex: fr, ar, en)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="native_name">Nom natif</Label>
                    <Input
                      id="native_name"
                      value={formData.native_name}
                      onChange={(e) => setFormData({ ...formData, native_name: e.target.value })}
                      placeholder="Français (nom dans la langue elle-même)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comment la langue s'écrit dans sa propre écriture
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orientation">Orientation du texte *</Label>
                      <Select
                        value={formData.orientation}
                        onValueChange={(value: "ltr" | "rtl") => 
                          setFormData({ ...formData, orientation: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ltr">
                            <div className="flex items-center gap-2">
                              <ArrowLeftRight className="h-4 w-4" />
                              LTR (Gauche à droite)
                            </div>
                          </SelectItem>
                          <SelectItem value="rtl">
                            <div className="flex items-center gap-2">
                              <ArrowLeftRight className="h-4 w-4 rotate-180" />
                              RTL (Droite à gauche)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sort_order">Ordre d'affichage</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Langue active</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingLanguage ? "Mettre à jour" : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Code ISO</TableHead>
                <TableHead>Nom natif</TableHead>
                <TableHead>Orientation</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {languages?.map((language) => (
                <TableRow key={language.id}>
                  <TableCell className="font-medium">{language.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{language.code.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>{language.native_name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {language.orientation === "rtl" ? "RTL →" : "LTR ←"}
                    </Badge>
                  </TableCell>
                  <TableCell>{language.sort_order}</TableCell>
                  <TableCell>
                    <Badge variant={language.is_active ? "default" : "secondary"}>
                      {language.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(language)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(language.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!languages?.length && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune langue configurée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
