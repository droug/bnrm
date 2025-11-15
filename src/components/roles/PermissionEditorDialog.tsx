import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Permission {
  id?: string;
  permission_name: string;
  category: string;
  description: string;
}

interface PermissionEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: Permission | null;
  onSave: () => void;
}

const CATEGORIES = [
  "Administration",
  "Transitions Workflow",
  "Inscriptions",
  "Adhésions",
  "Dépôt Légal",
  "ISBN/ISSN",
  "Reproduction",
  "Restauration",
  "Manuscrits",
  "Catalogage",
  "Activités Culturelles",
  "Réservation d'Espaces",
  "CBM",
  "Bibliothèque Numérique",
  "GED",
  "Portail",
  "Analytics",
];

export function PermissionEditorDialog({
  open,
  onOpenChange,
  permission,
  onSave,
}: PermissionEditorDialogProps) {
  const [permissionName, setPermissionName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (permission) {
      setPermissionName(permission.permission_name);
      setCategory(permission.category);
      setDescription(permission.description);
    } else {
      setPermissionName("");
      setCategory("");
      setDescription("");
    }
  }, [permission]);

  const handleSave = async () => {
    if (!permissionName.trim() || !category || !description.trim()) {
      toast.error("Erreur", {
        description: "Veuillez remplir tous les champs",
      });
      return;
    }

    setIsSaving(true);

    try {
      if (permission?.id) {
        // Mise à jour
        const { error } = await supabase
          .from('workflow_permissions')
          .update({
            permission_name: permissionName.trim(),
            category,
            description: description.trim(),
          })
          .eq('id', permission.id);

        if (error) throw error;

        toast.success("Permission modifiée", {
          description: "La permission a été modifiée avec succès",
        });
      } else {
        // Création
        const { error } = await supabase
          .from('workflow_permissions')
          .insert({
            permission_name: permissionName.trim(),
            category,
            description: description.trim(),
          });

        if (error) throw error;

        toast.success("Permission créée", {
          description: "La nouvelle permission a été créée avec succès",
        });
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving permission:', error);
      toast.error("Erreur", {
        description: error.message || "Impossible de sauvegarder la permission",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {permission ? "Modifier la permission" : "Nouvelle permission"}
          </DialogTitle>
          <DialogDescription>
            {permission
              ? "Modifiez les informations de la permission"
              : "Créez une nouvelle permission pour le système"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="permission_name">Nom de la permission *</Label>
            <Input
              id="permission_name"
              placeholder="ex: workflow.transition.validate"
              value={permissionName}
              onChange={(e) => setPermissionName(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Format recommandé: module.action ou module.resource.action
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Description de la permission et de son usage"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Décrivez clairement ce que cette permission autorise
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {permission ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
