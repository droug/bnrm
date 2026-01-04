import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalSelect } from "@/components/ui/portal-select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const MODULES = [
  { value: 'legal_deposit', label: 'Dépôt Légal' },
  { value: 'cataloging', label: 'Catalogage' },
  { value: 'ged', label: 'GED (Archivage)' },
  { value: 'cbm', label: 'CBM' },
  { value: 'payment', label: 'e-Payment' },
  { value: 'general', label: 'Général' },
];

const ROLE_LEVELS = [
  { value: 'module', label: 'Module' },
  { value: 'system', label: 'Système' },
  { value: 'admin', label: 'Administration' },
];

export function CreateRoleDialog({ open, onOpenChange, onSaved }: CreateRoleDialogProps) {
  const [roleName, setRoleName] = useState("");
  const [module, setModule] = useState("");
  const [roleLevel, setRoleLevel] = useState("module");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!roleName.trim() || !module) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from('workflow_roles').insert({
        role_name: roleName.trim(),
        module: module,
        role_level: roleLevel,
        description: description.trim() || null,
      });

      if (error) throw error;

      toast.success("Rôle créé avec succès");
      onOpenChange(false);
      resetForm();
      onSaved?.();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error("Erreur lors de la création du rôle");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setRoleName("");
    setModule("");
    setRoleLevel("module");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau Rôle Workflow</DialogTitle>
          <DialogDescription>
            Créez un nouveau rôle pour les workflows
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">
              Nom du rôle <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role-name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Ex: Agent Dépôt Légal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="module">
              Module <span className="text-destructive">*</span>
            </Label>
            <PortalSelect 
              value={module} 
              onChange={setModule}
              placeholder="Sélectionner un module..."
              options={MODULES.map((mod) => ({
                value: mod.value,
                label: mod.label
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-level">Niveau du rôle</Label>
            <PortalSelect 
              value={roleLevel} 
              onChange={setRoleLevel}
              options={ROLE_LEVELS.map((level) => ({
                value: level.value,
                label: level.label
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du rôle..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Création..." : "Créer le rôle"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
