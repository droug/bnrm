import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Settings, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface BNRMParameter {
  parametre: string;
  valeur: string;
  commentaire: string;
  created_at: string;
  updated_at: string;
}

export function BNRMParameters() {
  const [parameters, setParameters] = useState<BNRMParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<BNRMParameter | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    parametre: "",
    valeur: "",
    commentaire: ""
  });

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      const { data, error } = await supabase
        .from('bnrm_parametres')
        .select('*')
        .order('parametre');

      if (error) throw error;
      setParameters(data || []);
    } catch (error) {
      console.error('Error fetching parameters:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingParameter) {
        const { error } = await supabase
          .from('bnrm_parametres')
          .update(formData)
          .eq('parametre', editingParameter.parametre);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Paramètre modifié avec succès"
        });
      } else {
        const { error } = await supabase
          .from('bnrm_parametres')
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Paramètre créé avec succès"
        });
      }
      
      fetchParameters();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving parameter:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le paramètre",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (parameter: BNRMParameter) => {
    setEditingParameter(parameter);
    setFormData({
      parametre: parameter.parametre,
      valeur: parameter.valeur,
      commentaire: parameter.commentaire || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (parameterName: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce paramètre ?")) return;
    
    try {
      const { error } = await supabase
        .from('bnrm_parametres')
        .delete()
        .eq('parametre', parameterName);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Paramètre supprimé avec succès"
      });
      
      fetchParameters();
    } catch (error) {
      console.error('Error deleting parameter:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le paramètre",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      parametre: "",
      valeur: "",
      commentaire: ""
    });
    setEditingParameter(null);
  };

  const updateLastUpdate = async () => {
    try {
      const { error } = await supabase
        .from('bnrm_parametres')
        .update({ valeur: new Date().toISOString().split('T')[0] })
        .eq('parametre', 'Dernière_mise_à_jour');
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Date de mise à jour mise à jour"
      });
      
      fetchParameters();
    } catch (error) {
      console.error('Error updating last update:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la date",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des paramètres...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Paramètres généraux</h2>
          <p className="text-muted-foreground">
            Configuration générale du portail BNRM
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={updateLastUpdate} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Mettre à jour la date
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Paramètre
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingParameter ? "Modifier le paramètre" : "Nouveau paramètre"}
                </DialogTitle>
                <DialogDescription>
                  {editingParameter ? "Modifiez la valeur du paramètre" : "Créez un nouveau paramètre de configuration"}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="parametre">Nom du paramètre</Label>
                  <Input
                    id="parametre"
                    value={formData.parametre}
                    onChange={(e) => setFormData({...formData, parametre: e.target.value})}
                    placeholder="Nom du paramètre"
                    required
                    disabled={!!editingParameter}
                  />
                </div>
                
                <div>
                  <Label htmlFor="valeur">Valeur</Label>
                  <Input
                    id="valeur"
                    value={formData.valeur}
                    onChange={(e) => setFormData({...formData, valeur: e.target.value})}
                    placeholder="Valeur du paramètre"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="commentaire">Commentaire</Label>
                  <Textarea
                    id="commentaire"
                    value={formData.commentaire}
                    onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                    placeholder="Description ou commentaire"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingParameter ? "Modifier" : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Parameters Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {parameters.map((parameter) => (
          <Card key={parameter.parametre}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{parameter.parametre}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(parameter)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(parameter.parametre)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Valeur :</span>
                <p className="text-lg font-semibold text-primary">{parameter.valeur}</p>
              </div>
              
              {parameter.commentaire && (
                <div>
                  <span className="font-medium">Description :</span>
                  <CardDescription>{parameter.commentaire}</CardDescription>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Dernière modification : {new Date(parameter.updated_at).toLocaleDateString('fr-FR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {parameters.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun paramètre configuré.
        </div>
      )}
    </div>
  );
}