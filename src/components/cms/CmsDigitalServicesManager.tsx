import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditorCompact from "@/components/cms/RichTextEditorCompact";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, Plus, Trash2, Loader2, Edit2, Eye, X, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BNRMService {
  id_service: string;
  categorie: string;
  nom_service: string;
  description: string;
  public_cible: string;
  reference_legale: string;
  is_free: boolean | null;
  usage_limit_per_year: number | null;
}

interface BNRMTariff {
  id_tarif: string;
  id_service: string;
  montant: number;
  devise: string;
  condition_tarif: string | null;
  periode_validite: string;
  is_active: boolean | null;
}

const categories = [
  "Consultation",
  "Reproduction",
  "Formation",
  "Recherche",
  "Adhésion",
  "Événement",
  "Autre"
];

const publicCibles = [
  "Grand public",
  "Chercheurs",
  "Étudiants",
  "Professionnels",
  "Institutions",
  "Tous"
];

export default function CmsDigitalServicesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState<BNRMService | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch services from bnrm_services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['bnrm-services-cms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bnrm_services')
        .select('*')
        .order('nom_service');
      
      if (error) throw error;
      return data as BNRMService[];
    }
  });

  // Fetch tariffs
  const { data: tariffs = [] } = useQuery({
    queryKey: ['bnrm-tarifs-cms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bnrm_tarifs')
        .select('*')
        .order('montant');
      
      if (error) throw error;
      return data as BNRMTariff[];
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (service: BNRMService) => {
      const { error } = await supabase
        .from('bnrm_services')
        .upsert({
          ...service,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id_service' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bnrm-services-cms'] });
      toast({ title: "Service sauvegardé avec succès" });
      setIsDialogOpen(false);
      setEditingService(null);
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id_service: string) => {
      const { error } = await supabase
        .from('bnrm_services')
        .delete()
        .eq('id_service', id_service);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bnrm-services-cms'] });
      toast({ title: "Service supprimé" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const getTariffsForService = (serviceId: string) => {
    return tariffs.filter(t => t.id_service === serviceId && t.is_active);
  };

  const handleEdit = (service: BNRMService) => {
    setEditingService({ ...service });
    setIsCreating(false);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    const newService: BNRMService = {
      id_service: `SRV-${Date.now()}`,
      categorie: "Autre",
      nom_service: "",
      description: "",
      public_cible: "Grand public",
      reference_legale: "",
      is_free: false,
      usage_limit_per_year: null
    };
    setEditingService(newService);
    setIsCreating(true);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingService) {
      saveMutation.mutate(editingService);
    }
  };

  const handleDelete = (id_service: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      deleteMutation.mutate(id_service);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Gestion des Services Numériques
            </CardTitle>
            <CardDescription>
              Gérez les services BNRM affichés dans le carousel "Nos Services Numériques" ({services.length} services)
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un service
          </Button>
        </CardHeader>

        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucun service configuré</p>
              <p className="text-sm">Cliquez sur "Ajouter un service" pour commencer</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Public cible</TableHead>
                    <TableHead>Tarifs</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => {
                    const serviceTariffs = getTariffsForService(service.id_service);
                    return (
                      <TableRow key={service.id_service}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{service.nom_service}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {service.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{service.categorie}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{service.public_cible}</span>
                        </TableCell>
                        <TableCell>
                          {service.is_free ? (
                            <Badge className="bg-green-100 text-green-800 border-0">Gratuit</Badge>
                          ) : serviceTariffs.length > 0 ? (
                            <div className="space-y-1">
                              {serviceTariffs.slice(0, 2).map(t => (
                                <Badge key={t.id_tarif} variant="secondary" className="block w-fit">
                                  {t.montant} {t.devise}
                                </Badge>
                              ))}
                              {serviceTariffs.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{serviceTariffs.length - 2} autres
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Non défini</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800 border-0">
                            <Eye className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(service)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(service.id_service)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Ajouter un service" : "Modifier le service"}
            </DialogTitle>
          </DialogHeader>

          {editingService && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du service *</Label>
                  <Input
                    value={editingService.nom_service}
                    onChange={(e) => setEditingService({ ...editingService, nom_service: e.target.value })}
                    placeholder="Ex: Consultation sur place"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ID Service</Label>
                  <Input
                    value={editingService.id_service}
                    onChange={(e) => setEditingService({ ...editingService, id_service: e.target.value })}
                    placeholder="SRV-001"
                    disabled={!isCreating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <RichTextEditorCompact
                  value={editingService.description}
                  onChange={(value) => setEditingService({ ...editingService, description: value })}
                  placeholder="Décrivez le service..."
                  minHeight="120px"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={editingService.categorie}
                    onValueChange={(v) => setEditingService({ ...editingService, categorie: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Public cible</Label>
                  <Select
                    value={editingService.public_cible}
                    onValueChange={(v) => setEditingService({ ...editingService, public_cible: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {publicCibles.map(pc => (
                        <SelectItem key={pc} value={pc}>{pc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Référence légale</Label>
                <Input
                  value={editingService.reference_legale}
                  onChange={(e) => setEditingService({ ...editingService, reference_legale: e.target.value })}
                  placeholder="Ex: Décret n° 2-98-..."
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label className="text-base">Service gratuit</Label>
                  <p className="text-sm text-muted-foreground">
                    Cochez si ce service est offert gratuitement
                  </p>
                </div>
                <Switch
                  checked={editingService.is_free || false}
                  onCheckedChange={(checked) => setEditingService({ ...editingService, is_free: checked })}
                />
              </div>

              {!editingService.is_free && (
                <div className="space-y-2">
                  <Label>Limite d'utilisation par an (optionnel)</Label>
                  <Input
                    type="number"
                    value={editingService.usage_limit_per_year || ""}
                    onChange={(e) => setEditingService({ 
                      ...editingService, 
                      usage_limit_per_year: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    placeholder="Illimité"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending || !editingService?.nom_service}
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {isCreating ? "Créer" : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
