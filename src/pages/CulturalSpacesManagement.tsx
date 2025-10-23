import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCulturalActivitiesAuth } from "@/hooks/useCulturalActivitiesAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Edit, Trash2, Download, Upload, CalendarDays, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addBNRMHeaderToPDF } from "@/utils/pdfHeader";

interface CulturalSpace {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  space_type: string | null;
  surface_m2: number | null;
  floor_level: string | null;
  image_url: string | null;
  has_stage: boolean;
  has_sound_system: boolean;
  has_lighting: boolean;
  has_projection: boolean;
  tariff_public_full_day: number;
  tariff_public_half_day: number;
  tariff_private_full_day: number;
  tariff_private_half_day: number;
  allows_half_day: boolean;
  electricity_charge: number;
  cleaning_charge: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SpaceAvailability {
  id: string;
  space_id: string;
  start_date: string;
  end_date: string;
  is_blocked: boolean;
  reason: string | null;
}

const CulturalSpacesManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthorized, loading: authLoading } = useCulturalActivitiesAuth();
  
  const [spaces, setSpaces] = useState<CulturalSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<CulturalSpace | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<CulturalSpace | null>(null);
  const [unavailabilities, setUnavailabilities] = useState<SpaceAvailability[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [blockReason, setBlockReason] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: 0,
    space_type: "salle",
    surface_m2: 0,
    floor_level: "",
    image_url: "",
    has_stage: false,
    has_sound_system: false,
    has_lighting: false,
    has_projection: false,
    tariff_public_full_day: 0,
    tariff_public_half_day: 0,
    tariff_private_full_day: 0,
    tariff_private_half_day: 0,
    allows_half_day: false,
    electricity_charge: 0,
    cleaning_charge: 0,
    is_active: true
  });

  useEffect(() => {
    if (!authLoading && isAuthorized) {
      fetchSpaces();
    }
  }, [authLoading, isAuthorized]);

  const fetchSpaces = async () => {
    try {
      const { data, error } = await supabase
        .from('cultural_spaces')
        .select('*')
        .order('name');

      if (error) throw error;
      setSpaces(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les espaces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnavailabilities = async (spaceId: string) => {
    try {
      const { data, error } = await supabase
        .from('space_availability')
        .select('*')
        .eq('space_id', spaceId)
        .eq('is_blocked', true)
        .order('start_date');

      if (error) throw error;
      setUnavailabilities(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les indisponibilités",
        variant: "destructive",
      });
    }
  };

  const handleAddSpace = async () => {
    try {
      const { error } = await supabase
        .from('cultural_spaces')
        .insert(formData);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Espace créé avec succès",
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchSpaces();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditSpace = async () => {
    if (!editingSpace) return;

    try {
      const { error } = await supabase
        .from('cultural_spaces')
        .update(formData)
        .eq('id', editingSpace.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Espace modifié avec succès",
      });

      setIsEditDialogOpen(false);
      setEditingSpace(null);
      resetForm();
      fetchSpaces();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSpace = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet espace ?")) return;

    try {
      const { error } = await supabase
        .from('cultural_spaces')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Espace supprimé avec succès",
      });

      fetchSpaces();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddUnavailability = async () => {
    if (!selectedSpace || selectedDates.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une date",
        variant: "destructive",
      });
      return;
    }

    try {
      const unavailabilityRecords = selectedDates.map(date => ({
        space_id: selectedSpace.id,
        start_date: format(date, "yyyy-MM-dd'T'00:00:00+00:00"),
        end_date: format(date, "yyyy-MM-dd'T'23:59:59+00:00"),
        is_blocked: true,
        reason: blockReason || null
      }));

      const { error } = await supabase
        .from('space_availability')
        .insert(unavailabilityRecords);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `${selectedDates.length} indisponibilité(s) ajoutée(s)`,
      });

      setSelectedDates([]);
      setBlockReason("");
      fetchUnavailabilities(selectedSpace.id);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUnavailability = async (id: string) => {
    try {
      const { error } = await supabase
        .from('space_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Indisponibilité supprimée",
      });

      if (selectedSpace) {
        fetchUnavailabilities(selectedSpace.id);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (space: CulturalSpace) => {
    setEditingSpace(space);
    setFormData({
      name: space.name,
      description: space.description || "",
      capacity: space.capacity,
      space_type: space.space_type || "salle",
      surface_m2: space.surface_m2 || 0,
      floor_level: space.floor_level || "",
      image_url: space.image_url || "",
      has_stage: space.has_stage,
      has_sound_system: space.has_sound_system,
      has_lighting: space.has_lighting,
      has_projection: space.has_projection,
      tariff_public_full_day: space.tariff_public_full_day,
      tariff_public_half_day: space.tariff_public_half_day,
      tariff_private_full_day: space.tariff_private_full_day,
      tariff_private_half_day: space.tariff_private_half_day,
      allows_half_day: space.allows_half_day,
      electricity_charge: space.electricity_charge,
      cleaning_charge: space.cleaning_charge,
      is_active: space.is_active
    });
    setIsEditDialogOpen(true);
  };

  const openCalendarDialog = (space: CulturalSpace) => {
    setSelectedSpace(space);
    fetchUnavailabilities(space.id);
    setIsCalendarDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      capacity: 0,
      space_type: "salle",
      surface_m2: 0,
      floor_level: "",
      image_url: "",
      has_stage: false,
      has_sound_system: false,
      has_lighting: false,
      has_projection: false,
      tariff_public_full_day: 0,
      tariff_public_half_day: 0,
      tariff_private_full_day: 0,
      tariff_private_half_day: 0,
      allows_half_day: false,
      electricity_charge: 0,
      cleaning_charge: 0,
      is_active: true
    });
  };

  const exportSpacePDF = (space: CulturalSpace) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Ajouter l'en-tête professionnel BNRM
    let y = addBNRMHeaderToPDF(doc, `Fiche Espace - ${space.name}`);

    const addLine = (label: string, value: string) => {
      doc.text(`${label}: ${value}`, 14, y);
      y += 7;
    };

    addLine("Type", space.space_type || "Non spécifié");
    addLine("Capacité", `${space.capacity} personnes`);
    if (space.surface_m2) addLine("Surface", `${space.surface_m2} m²`);
    if (space.floor_level) addLine("Étage", space.floor_level);
    if (space.description) {
      doc.text("Description:", 14, y);
      y += 7;
      const splitDescription = doc.splitTextToSize(space.description, 180);
      doc.text(splitDescription, 14, y);
      y += splitDescription.length * 7;
    }

    y += 5;
    doc.text("Équipements disponibles:", 14, y);
    y += 7;
    const equipment = [];
    if (space.has_stage) equipment.push("Scène");
    if (space.has_sound_system) equipment.push("Sonorisation");
    if (space.has_lighting) equipment.push("Éclairage");
    if (space.has_projection) equipment.push("Projection");
    doc.text(equipment.length > 0 ? equipment.join(", ") : "Aucun", 14, y);
    y += 10;

    doc.text("Tarification:", 14, y);
    y += 7;
    addLine("Public - Journée complète", `${space.tariff_public_full_day} MAD`);
    addLine("Public - Demi-journée", `${space.tariff_public_half_day} MAD`);
    addLine("Privé - Journée complète", `${space.tariff_private_full_day} MAD`);
    addLine("Privé - Demi-journée", `${space.tariff_private_half_day} MAD`);
    addLine("Frais électricité", `${space.electricity_charge} MAD`);
    addLine("Frais nettoyage", `${space.cleaning_charge} MAD`);

    doc.save(`espace-${space.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-6">
          <p>Chargement...</p>
        </div>
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

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/activites-culturelles")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Gestion des Espaces et Salles
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Configuration et gestion des espaces culturels disponibles
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Espaces culturels</CardTitle>
                <CardDescription>
                  Gérez les espaces disponibles à la réservation
                </CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un espace
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouvel espace</DialogTitle>
                    <DialogDescription>
                      Créez un nouvel espace culturel disponible à la réservation
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom de l'espace *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: Grande salle polyvalente"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="space_type">Type *</Label>
                        <Select
                          value={formData.space_type}
                          onValueChange={(value) => setFormData({ ...formData, space_type: value })}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="salle">Salle</SelectItem>
                            <SelectItem value="esplanade">Esplanade</SelectItem>
                            <SelectItem value="auditorium">Auditorium</SelectItem>
                            <SelectItem value="exposition">Exposition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description détaillée de l'espace"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Capacité *</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                          placeholder="Ex: 100"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="surface_m2">Surface (m²)</Label>
                        <Input
                          id="surface_m2"
                          type="number"
                          value={formData.surface_m2}
                          onChange={(e) => setFormData({ ...formData, surface_m2: parseFloat(e.target.value) || 0 })}
                          placeholder="Ex: 150"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="floor_level">Étage</Label>
                        <Input
                          id="floor_level"
                          value={formData.floor_level}
                          onChange={(e) => setFormData({ ...formData, floor_level: e.target.value })}
                          placeholder="Ex: RDC, 1er"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_url">URL de l'image</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Équipements disponibles</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="has_stage"
                            checked={formData.has_stage}
                            onCheckedChange={(checked) => setFormData({ ...formData, has_stage: checked })}
                          />
                          <Label htmlFor="has_stage" className="cursor-pointer">Scène</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="has_sound_system"
                            checked={formData.has_sound_system}
                            onCheckedChange={(checked) => setFormData({ ...formData, has_sound_system: checked })}
                          />
                          <Label htmlFor="has_sound_system" className="cursor-pointer">Sonorisation</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="has_lighting"
                            checked={formData.has_lighting}
                            onCheckedChange={(checked) => setFormData({ ...formData, has_lighting: checked })}
                          />
                          <Label htmlFor="has_lighting" className="cursor-pointer">Éclairage</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="has_projection"
                            checked={formData.has_projection}
                            onCheckedChange={(checked) => setFormData({ ...formData, has_projection: checked })}
                          />
                          <Label htmlFor="has_projection" className="cursor-pointer">Projection</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Tarification (MAD)</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tariff_public_full_day" className="text-sm">Public - Journée</Label>
                          <Input
                            id="tariff_public_full_day"
                            type="number"
                            value={formData.tariff_public_full_day}
                            onChange={(e) => setFormData({ ...formData, tariff_public_full_day: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tariff_public_half_day" className="text-sm">Public - Demi-journée</Label>
                          <Input
                            id="tariff_public_half_day"
                            type="number"
                            value={formData.tariff_public_half_day}
                            onChange={(e) => setFormData({ ...formData, tariff_public_half_day: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tariff_private_full_day" className="text-sm">Privé - Journée</Label>
                          <Input
                            id="tariff_private_full_day"
                            type="number"
                            value={formData.tariff_private_full_day}
                            onChange={(e) => setFormData({ ...formData, tariff_private_full_day: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tariff_private_half_day" className="text-sm">Privé - Demi-journée</Label>
                          <Input
                            id="tariff_private_half_day"
                            type="number"
                            value={formData.tariff_private_half_day}
                            onChange={(e) => setFormData({ ...formData, tariff_private_half_day: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="electricity_charge" className="text-sm">Frais électricité</Label>
                          <Input
                            id="electricity_charge"
                            type="number"
                            value={formData.electricity_charge}
                            onChange={(e) => setFormData({ ...formData, electricity_charge: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="cleaning_charge" className="text-sm">Frais nettoyage</Label>
                          <Input
                            id="cleaning_charge"
                            type="number"
                            value={formData.cleaning_charge}
                            onChange={(e) => setFormData({ ...formData, cleaning_charge: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allows_half_day"
                        checked={formData.allows_half_day}
                        onCheckedChange={(checked) => setFormData({ ...formData, allows_half_day: checked })}
                      />
                      <Label htmlFor="allows_half_day" className="cursor-pointer">Autoriser la demi-journée</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active" className="cursor-pointer">Espace actif</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddSpace}>
                      Créer l'espace
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Chargement...</p>
            ) : spaces.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun espace configuré
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacité</TableHead>
                    <TableHead>Équipements</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spaces.map((space) => (
                    <TableRow key={space.id}>
                      <TableCell className="font-medium">{space.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{space.space_type}</Badge>
                      </TableCell>
                      <TableCell>{space.capacity} pers.</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {space.has_stage && <Badge variant="secondary" className="text-xs">Scène</Badge>}
                          {space.has_sound_system && <Badge variant="secondary" className="text-xs">Son</Badge>}
                          {space.has_lighting && <Badge variant="secondary" className="text-xs">Lumière</Badge>}
                          {space.has_projection && <Badge variant="secondary" className="text-xs">Projection</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {space.is_active ? (
                          <Badge className="bg-green-500">Actif</Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCalendarDialog(space)}
                          >
                            <CalendarDays className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportSpacePDF(space)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(space)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSpace(space.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog Modification */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-background max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'espace</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'espace culturel
              </DialogDescription>
            </DialogHeader>
            
            {/* Même formulaire que pour l'ajout */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom de l'espace *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-space_type">Type *</Label>
                  <Select
                    value={formData.space_type}
                    onValueChange={(value) => setFormData({ ...formData, space_type: value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="salle">Salle</SelectItem>
                      <SelectItem value="esplanade">Esplanade</SelectItem>
                      <SelectItem value="auditorium">Auditorium</SelectItem>
                      <SelectItem value="exposition">Exposition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacité *</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-surface_m2">Surface (m²)</Label>
                  <Input
                    id="edit-surface_m2"
                    type="number"
                    value={formData.surface_m2}
                    onChange={(e) => setFormData({ ...formData, surface_m2: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-floor_level">Étage</Label>
                  <Input
                    id="edit-floor_level"
                    value={formData.floor_level}
                    onChange={(e) => setFormData({ ...formData, floor_level: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image_url">URL de l'image</Label>
                <Input
                  id="edit-image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label>Équipements disponibles</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-has_stage"
                      checked={formData.has_stage}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_stage: checked })}
                    />
                    <Label htmlFor="edit-has_stage" className="cursor-pointer">Scène</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-has_sound_system"
                      checked={formData.has_sound_system}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_sound_system: checked })}
                    />
                    <Label htmlFor="edit-has_sound_system" className="cursor-pointer">Sonorisation</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-has_lighting"
                      checked={formData.has_lighting}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_lighting: checked })}
                    />
                    <Label htmlFor="edit-has_lighting" className="cursor-pointer">Éclairage</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-has_projection"
                      checked={formData.has_projection}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_projection: checked })}
                    />
                    <Label htmlFor="edit-has_projection" className="cursor-pointer">Projection</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Tarification (MAD)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-tariff_public_full_day" className="text-sm">Public - Journée</Label>
                    <Input
                      id="edit-tariff_public_full_day"
                      type="number"
                      value={formData.tariff_public_full_day}
                      onChange={(e) => setFormData({ ...formData, tariff_public_full_day: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-tariff_public_half_day" className="text-sm">Public - Demi-journée</Label>
                    <Input
                      id="edit-tariff_public_half_day"
                      type="number"
                      value={formData.tariff_public_half_day}
                      onChange={(e) => setFormData({ ...formData, tariff_public_half_day: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-tariff_private_full_day" className="text-sm">Privé - Journée</Label>
                    <Input
                      id="edit-tariff_private_full_day"
                      type="number"
                      value={formData.tariff_private_full_day}
                      onChange={(e) => setFormData({ ...formData, tariff_private_full_day: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-tariff_private_half_day" className="text-sm">Privé - Demi-journée</Label>
                    <Input
                      id="edit-tariff_private_half_day"
                      type="number"
                      value={formData.tariff_private_half_day}
                      onChange={(e) => setFormData({ ...formData, tariff_private_half_day: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-electricity_charge" className="text-sm">Frais électricité</Label>
                    <Input
                      id="edit-electricity_charge"
                      type="number"
                      value={formData.electricity_charge}
                      onChange={(e) => setFormData({ ...formData, electricity_charge: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-cleaning_charge" className="text-sm">Frais nettoyage</Label>
                    <Input
                      id="edit-cleaning_charge"
                      type="number"
                      value={formData.cleaning_charge}
                      onChange={(e) => setFormData({ ...formData, cleaning_charge: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-allows_half_day"
                  checked={formData.allows_half_day}
                  onCheckedChange={(checked) => setFormData({ ...formData, allows_half_day: checked })}
                />
                <Label htmlFor="edit-allows_half_day" className="cursor-pointer">Autoriser la demi-journée</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="edit-is_active" className="cursor-pointer">Espace actif</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleEditSpace}>
                Enregistrer les modifications
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Calendrier des indisponibilités */}
        <Dialog open={isCalendarDialogOpen} onOpenChange={setIsCalendarDialogOpen}>
          <DialogContent className="bg-background max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Gérer les indisponibilités - {selectedSpace?.name}
              </DialogTitle>
              <DialogDescription>
                Bloquez les dates où l'espace n'est pas disponible
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Sélectionner les dates indisponibles</Label>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  className="rounded-md border"
                  locale={fr}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="block-reason">Raison du blocage</Label>
                  <Input
                    id="block-reason"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Ex: Maintenance, Travaux, Événement privé"
                  />
                </div>

                <Button
                  onClick={handleAddUnavailability}
                  disabled={selectedDates.length === 0}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter {selectedDates.length > 0 && `(${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''})`}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Dates actuellement bloquées</Label>
                {unavailabilities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucune indisponibilité configurée
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {unavailabilities.map((unavailability) => (
                      <div
                        key={unavailability.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {format(new Date(unavailability.start_date), "d MMMM yyyy", { locale: fr })}
                          </p>
                          {unavailability.reason && (
                            <p className="text-sm text-muted-foreground">
                              {unavailability.reason}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUnavailability(unavailability.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCalendarDialogOpen(false);
                  setSelectedDates([]);
                  setBlockReason("");
                }}
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
};

export default CulturalSpacesManagement;
