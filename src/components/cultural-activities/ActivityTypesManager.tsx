import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Wrench, Zap, Package } from "lucide-react";

interface ActivityType {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface EquipmentType {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  unit_price: number;
  unit_type: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

type ActivityTypeFormData = Omit<ActivityType, "id" | "created_at" | "updated_at">;
type EquipmentTypeFormData = Omit<EquipmentType, "id" | "created_at" | "updated_at">;

const EQUIPMENT_CATEGORIES = [
  { value: "audio", label: "Audio / Sonorisation" },
  { value: "lighting", label: "Éclairage" },
  { value: "technical", label: "Technique / Vidéo" },
  { value: "furniture", label: "Mobilier" },
  { value: "other", label: "Autre" },
];

const UNIT_TYPES = [
  { value: "unit", label: "Unité" },
  { value: "hour", label: "Heure" },
  { value: "day", label: "Jour" },
];

export function ActivityTypesManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("activity-types");
  
  // Activity Types Dialog State
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityType | null>(null);
  const [activityFormData, setActivityFormData] = useState<ActivityTypeFormData>({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "",
    is_active: true,
    sort_order: 0,
  });

  // Equipment Types Dialog State
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);
  const [equipmentFormData, setEquipmentFormData] = useState<EquipmentTypeFormData>({
    name: "",
    description: "",
    category: "other",
    unit_price: 0,
    unit_type: "unit",
    is_active: true,
    sort_order: 0,
  });

  // Fetch Activity Types
  const { data: activityTypes = [], isLoading: isLoadingActivities } = useQuery({
    queryKey: ["activity-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_types")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ActivityType[];
    },
  });

  // Fetch Equipment Types
  const { data: equipmentTypes = [], isLoading: isLoadingEquipment } = useQuery({
    queryKey: ["equipment-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_types")
        .select("*")
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as EquipmentType[];
    },
  });

  // Activity Type Mutations
  const createActivityMutation = useMutation({
    mutationFn: async (data: ActivityTypeFormData) => {
      const { error } = await supabase.from("activity_types").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-types"] });
      toast.success("Type d'activité créé avec succès");
      resetActivityForm();
    },
    onError: (error: Error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ActivityTypeFormData> }) => {
      const { error } = await supabase.from("activity_types").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-types"] });
      toast.success("Type d'activité mis à jour");
      resetActivityForm();
    },
    onError: (error: Error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("activity_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-types"] });
      toast.success("Type d'activité supprimé");
    },
    onError: (error: Error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  // Equipment Type Mutations
  const createEquipmentMutation = useMutation({
    mutationFn: async (data: EquipmentTypeFormData) => {
      const { error } = await supabase.from("equipment_types").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment-types"] });
      toast.success("Équipement créé avec succès");
      resetEquipmentForm();
    },
    onError: (error: Error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EquipmentTypeFormData> }) => {
      const { error } = await supabase.from("equipment_types").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment-types"] });
      toast.success("Équipement mis à jour");
      resetEquipmentForm();
    },
    onError: (error: Error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("equipment_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment-types"] });
      toast.success("Équipement supprimé");
    },
    onError: (error: Error) => {
      toast.error("Erreur: " + error.message);
    },
  });

  // Form Handlers
  const resetActivityForm = () => {
    setActivityFormData({
      name: "",
      description: "",
      color: "#3B82F6",
      icon: "",
      is_active: true,
      sort_order: 0,
    });
    setEditingActivity(null);
    setActivityDialogOpen(false);
  };

  const resetEquipmentForm = () => {
    setEquipmentFormData({
      name: "",
      description: "",
      category: "other",
      unit_price: 0,
      unit_type: "unit",
      is_active: true,
      sort_order: 0,
    });
    setEditingEquipment(null);
    setEquipmentDialogOpen(false);
  };

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingActivity) {
      updateActivityMutation.mutate({ id: editingActivity.id, data: activityFormData });
    } else {
      createActivityMutation.mutate(activityFormData);
    }
  };

  const handleEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEquipment) {
      updateEquipmentMutation.mutate({ id: editingEquipment.id, data: equipmentFormData });
    } else {
      createEquipmentMutation.mutate(equipmentFormData);
    }
  };

  const handleEditActivity = (activity: ActivityType) => {
    setEditingActivity(activity);
    setActivityFormData({
      name: activity.name,
      description: activity.description || "",
      color: activity.color,
      icon: activity.icon || "",
      is_active: activity.is_active,
      sort_order: activity.sort_order,
    });
    setActivityDialogOpen(true);
  };

  const handleEditEquipment = (equipment: EquipmentType) => {
    setEditingEquipment(equipment);
    setEquipmentFormData({
      name: equipment.name,
      description: equipment.description || "",
      category: equipment.category || "other",
      unit_price: equipment.unit_price,
      unit_type: equipment.unit_type,
      is_active: equipment.is_active,
      sort_order: equipment.sort_order,
    });
    setEquipmentDialogOpen(true);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="activity-types" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Types d'activités
        </TabsTrigger>
        <TabsTrigger value="equipment" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Équipements
        </TabsTrigger>
      </TabsList>

      {/* Activity Types Tab */}
      <TabsContent value="activity-types">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Types d'activités culturelles
                </CardTitle>
                <CardDescription>
                  Configurez les types d'activités disponibles pour les événements
                </CardDescription>
              </div>
              <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetActivityForm(); setActivityDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un type
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <form onSubmit={handleActivitySubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingActivity ? "Modifier le type d'activité" : "Ajouter un type d'activité"}
                      </DialogTitle>
                      <DialogDescription>
                        Définissez les caractéristiques du type d'activité
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="activity-name">Nom *</Label>
                        <Input
                          id="activity-name"
                          value={activityFormData.name}
                          onChange={(e) => setActivityFormData({ ...activityFormData, name: e.target.value })}
                          placeholder="Conférence, Atelier..."
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="activity-description">Description</Label>
                        <Textarea
                          id="activity-description"
                          value={activityFormData.description}
                          onChange={(e) => setActivityFormData({ ...activityFormData, description: e.target.value })}
                          placeholder="Description du type d'activité"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="activity-color">Couleur</Label>
                          <div className="flex gap-2">
                            <Input
                              id="activity-color"
                              type="color"
                              value={activityFormData.color}
                              onChange={(e) => setActivityFormData({ ...activityFormData, color: e.target.value })}
                              className="w-20 h-10"
                            />
                            <Input
                              value={activityFormData.color}
                              onChange={(e) => setActivityFormData({ ...activityFormData, color: e.target.value })}
                              placeholder="#3B82F6"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="activity-sort">Ordre d'affichage</Label>
                          <Input
                            id="activity-sort"
                            type="number"
                            value={activityFormData.sort_order}
                            onChange={(e) => setActivityFormData({ ...activityFormData, sort_order: parseInt(e.target.value) || 0 })}
                            min={0}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="activity-active"
                          checked={activityFormData.is_active}
                          onCheckedChange={(checked) => setActivityFormData({ ...activityFormData, is_active: checked })}
                        />
                        <Label htmlFor="activity-active">Type actif</Label>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={resetActivityForm}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        {editingActivity ? "Mettre à jour" : "Créer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent>
            {isLoadingActivities ? (
              <div className="text-center py-8">Chargement...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Couleur</TableHead>
                    <TableHead>Ordre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityTypes.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.name}</TableCell>
                      <TableCell className="text-muted-foreground">{activity.description || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: activity.color }}
                          />
                          <span className="text-xs text-muted-foreground">{activity.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>{activity.sort_order}</TableCell>
                      <TableCell>
                        <Badge variant={activity.is_active ? "default" : "secondary"}>
                          {activity.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditActivity(activity)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Êtes-vous sûr de vouloir supprimer ce type ?")) {
                                deleteActivityMutation.mutate(activity.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {activityTypes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucun type d'activité configuré
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Equipment Types Tab */}
      <TabsContent value="equipment">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Équipements standards
                </CardTitle>
                <CardDescription>
                  Gérez les équipements disponibles avec leurs tarifs
                </CardDescription>
              </div>
              <Dialog open={equipmentDialogOpen} onOpenChange={setEquipmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetEquipmentForm(); setEquipmentDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un équipement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <form onSubmit={handleEquipmentSubmit}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingEquipment ? "Modifier l'équipement" : "Ajouter un équipement"}
                      </DialogTitle>
                      <DialogDescription>
                        Définissez les caractéristiques de l'équipement
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="equipment-name">Nom *</Label>
                        <Input
                          id="equipment-name"
                          value={equipmentFormData.name}
                          onChange={(e) => setEquipmentFormData({ ...equipmentFormData, name: e.target.value })}
                          placeholder="Vidéoprojecteur HD, Microphone..."
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="equipment-description">Description</Label>
                        <Textarea
                          id="equipment-description"
                          value={equipmentFormData.description}
                          onChange={(e) => setEquipmentFormData({ ...equipmentFormData, description: e.target.value })}
                          placeholder="Description de l'équipement"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="equipment-category">Catégorie</Label>
                          <Select
                            value={equipmentFormData.category}
                            onValueChange={(value) => setEquipmentFormData({ ...equipmentFormData, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {EQUIPMENT_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="equipment-unit">Unité de tarification</Label>
                          <Select
                            value={equipmentFormData.unit_type}
                            onValueChange={(value) => setEquipmentFormData({ ...equipmentFormData, unit_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNIT_TYPES.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="equipment-price">Prix unitaire (MAD)</Label>
                          <Input
                            id="equipment-price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={equipmentFormData.unit_price}
                            onChange={(e) => setEquipmentFormData({ ...equipmentFormData, unit_price: parseFloat(e.target.value) || 0 })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="equipment-sort">Ordre d'affichage</Label>
                          <Input
                            id="equipment-sort"
                            type="number"
                            value={equipmentFormData.sort_order}
                            onChange={(e) => setEquipmentFormData({ ...equipmentFormData, sort_order: parseInt(e.target.value) || 0 })}
                            min={0}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="equipment-active"
                          checked={equipmentFormData.is_active}
                          onCheckedChange={(checked) => setEquipmentFormData({ ...equipmentFormData, is_active: checked })}
                        />
                        <Label htmlFor="equipment-active">Équipement actif</Label>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={resetEquipmentForm}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        {editingEquipment ? "Mettre à jour" : "Créer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent>
            {isLoadingEquipment ? (
              <div className="text-center py-8">Chargement...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipmentTypes.map((equipment) => (
                    <TableRow key={equipment.id}>
                      <TableCell className="font-medium">{equipment.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {EQUIPMENT_CATEGORIES.find(c => c.value === equipment.category)?.label || equipment.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{equipment.unit_price.toFixed(2)} MAD</TableCell>
                      <TableCell>
                        {UNIT_TYPES.find(u => u.value === equipment.unit_type)?.label}
                      </TableCell>
                      <TableCell>
                        <Badge variant={equipment.is_active ? "default" : "secondary"}>
                          {equipment.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditEquipment(equipment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) {
                                deleteEquipmentMutation.mutate(equipment.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {equipmentTypes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucun équipement configuré
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
