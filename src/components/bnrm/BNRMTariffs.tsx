import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface BNRMTariff {
  id_tarif: string;
  id_service: string;
  montant: number;
  devise: string;
  condition_tarif: string;
  periode_validite: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  bnrm_services?: {
    nom_service: string;
    categorie: string;
  };
}

interface BNRMService {
  id_service: string;
  nom_service: string;
  categorie: string;
}

interface BNRMTariffsProps {
  filterCategory?: string; // "Abonnement" pour abonnements, "Service à la demande" pour services
  filterServiceIds?: string[]; // Filtrer par IDs de service spécifiques
  excludeServiceIds?: string[]; // Exclure des IDs de service spécifiques
}

export function BNRMTariffs({ filterCategory, filterServiceIds, excludeServiceIds }: BNRMTariffsProps) {
  const [tariffs, setTariffs] = useState<BNRMTariff[]>([]);
  const [services, setServices] = useState<BNRMService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<BNRMTariff | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id_tarif: "",
    id_service: "",
    montant: "",
    devise: "DH",
    condition_tarif: "",
    periode_validite: "2025",
    is_active: true
  });

  useEffect(() => {
    fetchTariffs();
    fetchServices();
  }, []);

  const fetchTariffs = async () => {
    try {
      const { data, error } = await supabase
        .from('bnrm_tarifs')
        .select(`
          *,
          bnrm_services (
            nom_service,
            categorie
          )
        `)
        .order('id_tarif');

      if (error) throw error;
      setTariffs(data || []);
    } catch (error) {
      console.error('Error fetching tariffs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tarifs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('bnrm_services')
        .select('id_service, nom_service, categorie')
        .order('id_service');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const filteredTariffs = tariffs.filter(tariff => {
    const matchesSearch = tariff.id_tarif.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tariff.condition_tarif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tariff.bnrm_services?.nom_service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = selectedService === "all" || tariff.id_service === selectedService;
    
    // Appliquer le filtre de catégorie si spécifié
    let matchesFilter = true;
    if (filterCategory) {
      matchesFilter = tariff.bnrm_services?.categorie === filterCategory;
    }
    if (filterServiceIds && filterServiceIds.length > 0) {
      matchesFilter = matchesFilter && filterServiceIds.includes(tariff.id_service);
    }
    if (excludeServiceIds && excludeServiceIds.length > 0) {
      matchesFilter = matchesFilter && !excludeServiceIds.includes(tariff.id_service);
    }
    
    return matchesSearch && matchesService && matchesFilter;
  }).sort((a, b) => {
    const getOrder = (cond: string | null | undefined) => {
      if (!cond) return 99;
      const c = cond.toLowerCase();
      const isParticulier = c.includes('particuliers');
      const isEntreprise = c.includes('entreprises') || c.includes('institutionnels');
      const isNonCommercial = c.includes('non commercial');
      
      if (isParticulier && isNonCommercial) return 0;
      if (isParticulier && !isNonCommercial) return 1;
      if (isEntreprise && isNonCommercial) return 2;
      if (isEntreprise && !isNonCommercial) return 3;
      return 50;
    };
    
    const diff = getOrder(a.condition_tarif) - getOrder(b.condition_tarif);
    if (diff !== 0) return diff;
    return (a.condition_tarif || '').localeCompare(b.condition_tarif || '', 'fr');
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        montant: parseFloat(formData.montant)
      };

      if (editingTariff) {
        const { error } = await supabase
          .from('bnrm_tarifs')
          .update(submitData)
          .eq('id_tarif', editingTariff.id_tarif);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Tarif modifié avec succès"
        });
      } else {
        const { error } = await supabase
          .from('bnrm_tarifs')
          .insert([submitData]);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Tarif créé avec succès"
        });
      }
      
      fetchTariffs();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving tariff:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le tarif",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (tariff: BNRMTariff) => {
    setEditingTariff(tariff);
    setFormData({
      id_tarif: tariff.id_tarif,
      id_service: tariff.id_service,
      montant: tariff.montant.toString(),
      devise: tariff.devise,
      condition_tarif: tariff.condition_tarif || "",
      periode_validite: tariff.periode_validite,
      is_active: tariff.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (tariffId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce tarif ?")) return;
    
    try {
      const { error } = await supabase
        .from('bnrm_tarifs')
        .delete()
        .eq('id_tarif', tariffId);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Tarif supprimé avec succès"
      });
      
      fetchTariffs();
    } catch (error) {
      console.error('Error deleting tariff:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le tarif",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id_tarif: "",
      id_service: "",
      montant: "",
      devise: "DH",
      condition_tarif: "",
      periode_validite: "2025",
      is_active: true
    });
    setEditingTariff(null);
  };

  const formatPrice = (amount: number, currency: string) => {
    return `${amount.toLocaleString('fr-FR')} ${currency}`;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des tarifs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un tarif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">Tous les services</option>
            {services.map(service => (
              <option key={service.id_service} value={service.id_service}>
                {service.id_service} - {service.nom_service}
              </option>
            ))}
          </select>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Tarif
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTariff ? "Modifier le tarif" : "Nouveau tarif"}
              </DialogTitle>
              <DialogDescription>
                {editingTariff ? "Modifiez les informations du tarif" : "Créez un nouveau tarif BNRM"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id_tarif">ID Tarif</Label>
                  <Input
                    id="id_tarif"
                    value={formData.id_tarif}
                    onChange={(e) => setFormData({...formData, id_tarif: e.target.value})}
                    placeholder="T001"
                    required
                    disabled={!!editingTariff}
                  />
                </div>
                <div>
                  <Label htmlFor="id_service">Service</Label>
                  <select
                    id="id_service"
                    value={formData.id_service}
                    onChange={(e) => setFormData({...formData, id_service: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    required
                  >
                    <option value="">Sélectionner un service</option>
                    {services.map(service => (
                      <option key={service.id_service} value={service.id_service}>
                        {service.id_service} - {service.nom_service}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="montant">Montant</Label>
                  <Input
                    id="montant"
                    type="number"
                    step="0.01"
                    value={formData.montant}
                    onChange={(e) => setFormData({...formData, montant: e.target.value})}
                    placeholder="150.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="devise">Devise</Label>
                  <Input
                    id="devise"
                    value={formData.devise}
                    onChange={(e) => setFormData({...formData, devise: e.target.value})}
                    placeholder="DH"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="condition_tarif">Condition</Label>
                <Input
                  id="condition_tarif"
                  value={formData.condition_tarif}
                  onChange={(e) => setFormData({...formData, condition_tarif: e.target.value})}
                  placeholder="Inscription annuelle étudiants/chercheurs"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periode_validite">Période de validité</Label>
                  <Input
                    id="periode_validite"
                    value={formData.periode_validite}
                    onChange={(e) => setFormData({...formData, periode_validite: e.target.value})}
                    placeholder="2025"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Tarif actif</Label>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingTariff ? "Modifier" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tariffs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTariffs.map((tariff) => (
          <Card key={tariff.id_tarif} className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{tariff.id_tarif}</Badge>
                  {!tariff.is_active && (
                    <Badge variant="destructive">Inactif</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(tariff)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(tariff.id_tarif)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">
                {formatPrice(tariff.montant, tariff.devise)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Service :</span>
                <p className="text-muted-foreground">
                  {tariff.id_service} - {tariff.bnrm_services?.nom_service}
                </p>
              </div>
              
              {tariff.condition_tarif && (
                <div>
                  <span className="font-medium">Condition :</span>
                  <p className="text-muted-foreground">{tariff.condition_tarif}</p>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">Période :</span>
                  <span className="text-muted-foreground ml-1">{tariff.periode_validite}</span>
                </div>
                <Badge variant={tariff.is_active ? "default" : "secondary"}>
                  {tariff.is_active ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTariffs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun tarif trouvé pour les critères sélectionnés.
        </div>
      )}
    </div>
  );
}