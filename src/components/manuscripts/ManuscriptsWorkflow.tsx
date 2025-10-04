import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, ArrowRight, CheckCircle, XCircle } from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  order: number;
  required_role: string;
  estimated_duration: number;
}

export function ManuscriptsWorkflow() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 1,
    required_role: 'librarian',
    estimated_duration: 1
  });

  // Fetch workflow steps (mock data for now)
  const workflowSteps: WorkflowStep[] = [
    {
      id: '1',
      name: 'Réception du Manuscrit',
      description: 'Enregistrement initial et vérification de l\'état physique',
      order: 1,
      required_role: 'librarian',
      estimated_duration: 1
    },
    {
      id: '2',
      name: 'Numérisation',
      description: 'Scan haute résolution du manuscrit',
      order: 2,
      required_role: 'librarian',
      estimated_duration: 3
    },
    {
      id: '3',
      name: 'Contrôle Qualité',
      description: 'Vérification de la qualité des images numérisées',
      order: 3,
      required_role: 'admin',
      estimated_duration: 1
    },
    {
      id: '4',
      name: 'Catalogage',
      description: 'Saisie des métadonnées et indexation',
      order: 4,
      required_role: 'librarian',
      estimated_duration: 2
    },
    {
      id: '5',
      name: 'Validation',
      description: 'Validation finale et publication',
      order: 5,
      required_role: 'admin',
      estimated_duration: 1
    }
  ];

  const handleSubmit = () => {
    toast({
      title: "Succès",
      description: "Étape de workflow enregistrée"
    });
    setShowAddDialog(false);
    setEditingStep(null);
    setFormData({
      name: '',
      description: '',
      order: 1,
      required_role: 'librarian',
      estimated_duration: 1
    });
  };

  const handleEdit = (step: WorkflowStep) => {
    setEditingStep(step);
    setFormData({
      name: step.name,
      description: step.description,
      order: step.order,
      required_role: step.required_role,
      estimated_duration: step.estimated_duration
    });
    setShowAddDialog(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Workflow de Numérisation</CardTitle>
              <CardDescription>
                Configuration des étapes du processus de numérisation des manuscrits
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une étape
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold">
                      {step.order}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {step.name}
                        <Badge variant="outline">{step.estimated_duration}j</Badge>
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          Rôle: {step.required_role === 'admin' ? 'Administrateur' : 'Bibliothécaire'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(step)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {index < workflowSteps.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques du Workflow */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Temps Moyen Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflowSteps.reduce((acc, step) => acc + step.estimated_duration, 0)} jours
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De la réception à la publication
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Étapes Configurées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowSteps.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Étapes du processus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Validation Requise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflowSteps.filter(s => s.required_role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Étapes nécessitant validation admin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for Add/Edit */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingStep ? 'Modifier l\'étape' : 'Ajouter une étape'}
            </DialogTitle>
            <DialogDescription>
              Configurez les détails de l'étape du workflow
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom de l'étape</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Numérisation"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez cette étape du processus..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="order">Ordre</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Durée (jours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Rôle requis</Label>
                <Select
                  value={formData.required_role}
                  onValueChange={(value) => setFormData({ ...formData, required_role: value })}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="librarian">Bibliothécaire</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {editingStep ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
