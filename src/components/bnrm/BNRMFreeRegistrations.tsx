import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface FreeService {
  id_service: string;
  nom_service: string;
  description: string;
  public_cible: string;
  reference_legale: string;
  is_free: boolean;
  usage_limit_per_year: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const DEFAULT_FORM = {
  id_service: "",
  nom_service: "",
  description: "",
  public_cible: "",
  reference_legale: "",
  is_free: true,
  usage_limit_per_year: "",
};

export function BNRMFreeRegistrations() {
  const [services, setServices] = useState<FreeService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<FreeService | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const { toast } = useToast();

  useEffect(() => {
    fetchFreeServices();
  }, []);

  const fetchFreeServices = async () => {
    try {
      const { data, error } = await supabase
        .from("bnrm_services")
        .select("*")
        .eq("is_free", true)
        .order("id_service");
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching free services:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les inscriptions gratuites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setEditingService(null);
  };

  const handleEdit = (service: FreeService) => {
    setEditingService(service);
    setFormData({
      id_service: service.id_service,
      nom_service: service.nom_service,
      description: service.description,
      public_cible: service.public_cible,
      reference_legale: service.reference_legale,
      is_free: service.is_free,
      usage_limit_per_year: service.usage_limit_per_year?.toString() ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette inscription gratuite ?")) return;
    try {
      const { error } = await supabase
        .from("bnrm_services")
        .delete()
        .eq("id_service", id);
      if (error) throw error;
      toast({ title: "Succès", description: "Inscription supprimée avec succès" });
      fetchFreeServices();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        id_service: formData.id_service,
        nom_service: formData.nom_service,
        description: formData.description,
        public_cible: formData.public_cible,
        reference_legale: formData.reference_legale,
        categorie: "Inscription",
        is_free: true,
        usage_limit_per_year: formData.usage_limit_per_year
          ? parseInt(formData.usage_limit_per_year)
          : null,
      };

      if (editingService) {
        const { error } = await supabase
          .from("bnrm_services")
          .update(payload)
          .eq("id_service", editingService.id_service);
        if (error) throw error;
        toast({ title: "Succès", description: "Inscription modifiée avec succès" });
      } else {
        const { error } = await supabase.from("bnrm_services").insert([payload]);
        if (error) throw error;
        toast({ title: "Succès", description: "Inscription créée avec succès" });
      }

      fetchFreeServices();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Catégories bénéficiant d'un accès gratuit — Décision 2025
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle inscription gratuite
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Modifier l'inscription" : "Nouvelle inscription gratuite"}
              </DialogTitle>
              <DialogDescription>
                {editingService
                  ? "Modifiez les informations de cette inscription gratuite"
                  : "Créez une nouvelle catégorie d'inscription gratuite"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id_service">ID Service</Label>
                  <Input
                    id="id_service"
                    value={formData.id_service}
                    onChange={(e) => setFormData({ ...formData, id_service: e.target.value })}
                    placeholder="SL001"
                    required
                    disabled={!!editingService}
                  />
                </div>
                <div>
                  <Label htmlFor="usage_limit">Limite visites/an</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit_per_year}
                    onChange={(e) =>
                      setFormData({ ...formData, usage_limit_per_year: e.target.value })
                    }
                    placeholder="Sans limite"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="nom_service">Nom de l'inscription</Label>
                <Input
                  id="nom_service"
                  value={formData.nom_service}
                  onChange={(e) => setFormData({ ...formData, nom_service: e.target.value })}
                  placeholder="Carte d'honneur"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Condition d'attribution</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Conditions d'attribution de cette inscription..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="public_cible">Salles accessibles</Label>
                <Input
                  id="public_cible"
                  value={formData.public_cible}
                  onChange={(e) => setFormData({ ...formData, public_cible: e.target.value })}
                  placeholder="Toutes les salles de lecture"
                  required
                />
              </div>

              <div>
                <Label htmlFor="reference_legale">Référence légale</Label>
                <Input
                  id="reference_legale"
                  value={formData.reference_legale}
                  onChange={(e) =>
                    setFormData({ ...formData, reference_legale: e.target.value })
                  }
                  placeholder="Décision Directrice BNRM 2025"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
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

      {/* Cards grid — same design as BNRMTariffs */}
      {loading ? (
        <div className="flex justify-center p-8">Chargement...</div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id_service} className="h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{service.id_service}</Badge>
                      <Badge variant="outline" className="text-primary border-primary">
                        Gratuit
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(service.id_service)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{service.nom_service}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">Condition :</span>
                    <p className="text-muted-foreground text-sm mt-0.5">{service.description}</p>
                  </div>
                  <div>
                    <span className="font-medium">Salles :</span>
                    <p className="text-muted-foreground text-sm mt-0.5">{service.public_cible}</p>
                  </div>
                  {service.usage_limit_per_year && (
                    <div className="text-sm">
                      <span className="font-medium">Limite :</span>
                      <span className="text-muted-foreground ml-1">
                        {service.usage_limit_per_year} visite(s)/an
                      </span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground pt-1 border-t border-border">
                    {service.reference_legale}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune inscription gratuite configurée.
            </div>
          )}
        </>
      )}
    </div>
  );
}
