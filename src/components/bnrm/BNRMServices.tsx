import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface BNRMService {
  id_service: string;
  categorie: string;
  nom_service: string;
  description: string;
  public_cible: string;
  reference_legale: string;
  created_at: string;
  updated_at: string;
}

interface BNRMServicesProps {
  filterCategory?: string; // "Inscription" pour abonnements, "exclude-Inscription" pour services
}

export function BNRMServices({ filterCategory }: BNRMServicesProps) {
  const [services, setServices] = useState<BNRMService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<BNRMService | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    id_service: "",
    categorie: "",
    nom_service: "",
    description: "",
    public_cible: "",
    reference_legale: ""
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('bnrm_services')
        .select('*')
        .order('id_service');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(services.map(s => s.categorie)));
  
  const filteredServices = services.filter(service => {
    const matchesSearch = service.nom_service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.categorie === selectedCategory;
    
    // Appliquer le filtre de catégorie si spécifié
    let matchesFilter = true;
    if (filterCategory === "Inscription") {
      matchesFilter = service.categorie === "Inscription";
    } else if (filterCategory === "exclude-Inscription") {
      matchesFilter = service.categorie !== "Inscription";
    }
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        const { error } = await supabase
          .from('bnrm_services')
          .update(formData)
          .eq('id_service', editingService.id_service);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Service modifié avec succès"
        });
      } else {
        const { error } = await supabase
          .from('bnrm_services')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Service créé avec succès"
        });
      }
      
      fetchServices();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le service",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (service: BNRMService) => {
    setEditingService(service);
    setFormData({
      id_service: service.id_service,
      categorie: service.categorie,
      nom_service: service.nom_service,
      description: service.description,
      public_cible: service.public_cible,
      reference_legale: service.reference_legale
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) return;
    
    try {
      const { error } = await supabase
        .from('bnrm_services')
        .delete()
        .eq('id_service', serviceId);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Service supprimé avec succès"
      });
      
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le service",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id_service: "",
      categorie: "",
      nom_service: "",
      description: "",
      public_cible: "",
      reference_legale: ""
    });
    setEditingService(null);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Inscription": "bg-blue-100 text-blue-800",
      "Reproduction": "bg-green-100 text-green-800",
      "Location": "bg-purple-100 text-purple-800",
      "Formation": "bg-orange-100 text-orange-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des services...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Modifier le service" : "Nouveau service"}
              </DialogTitle>
              <DialogDescription>
                {editingService ? "Modifiez les informations du service" : "Créez un nouveau service BNRM"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id_service">ID Service</Label>
                  <Input
                    id="id_service"
                    value={formData.id_service}
                    onChange={(e) => setFormData({...formData, id_service: e.target.value})}
                    placeholder="S001"
                    required
                    disabled={!!editingService}
                  />
                </div>
                <div>
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Input
                    id="categorie"
                    value={formData.categorie}
                    onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                    placeholder="Inscription"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="nom_service">Nom du service</Label>
                <Input
                  id="nom_service"
                  value={formData.nom_service}
                  onChange={(e) => setFormData({...formData, nom_service: e.target.value})}
                  placeholder="Inscription étudiants/chercheurs"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description détaillée du service"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="public_cible">Public cible</Label>
                <Input
                  id="public_cible"
                  value={formData.public_cible}
                  onChange={(e) => setFormData({...formData, public_cible: e.target.value})}
                  placeholder="Étudiants inscrits en cycle supérieur"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reference_legale">Référence légale</Label>
                <Input
                  id="reference_legale"
                  value={formData.reference_legale}
                  onChange={(e) => setFormData({...formData, reference_legale: e.target.value})}
                  placeholder="Loi 67-99, Décision 2014"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingService ? "Modifier" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <Card key={service.id_service} className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{service.id_service}</Badge>
                  <Badge className={getCategoryColor(service.categorie)}>
                    {service.categorie}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(service.id_service)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{service.nom_service}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription>{service.description}</CardDescription>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Public cible :</span>
                  <p className="text-muted-foreground">{service.public_cible}</p>
                </div>
                <div>
                  <span className="font-medium">Référence légale :</span>
                  <p className="text-muted-foreground">{service.reference_legale}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun service trouvé pour les critères sélectionnés.
        </div>
      )}
    </div>
  );
}