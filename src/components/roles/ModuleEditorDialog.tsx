import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Module {
  id: string;
  code: string;
  name: string;
  platform: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
}

interface ModuleEditorDialogProps {
  module: Module | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLATFORMS = [
  { value: "bnrm", label: "Portail BNRM" },
  { value: "digital_library", label: "Bibliothèque Numérique" },
  { value: "manuscripts", label: "Plateforme Manuscrits" },
  { value: "cbm", label: "Plateforme CBM" },
  { value: "kitab", label: "Plateforme Kitab" },
  { value: "cultural", label: "Activités Culturelles" },
];

const ICONS = [
  { value: "Library", label: "Bibliothèque" },
  { value: "BookOpen", label: "Livre" },
  { value: "FileText", label: "Document" },
  { value: "Archive", label: "Archive" },
  { value: "Calendar", label: "Calendrier" },
];

export function ModuleEditorDialog({ module, open, onOpenChange }: ModuleEditorDialogProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Library");
  const [color, setColor] = useState("");
  const [isActive, setIsActive] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (module) {
      setCode(module.code);
      setName(module.name);
      setPlatform(module.platform);
      setDescription(module.description || "");
      setIcon(module.icon || "Library");
      setColor(module.color || "");
      setIsActive(module.is_active);
    } else {
      setCode("");
      setName("");
      setPlatform("");
      setDescription("");
      setIcon("Library");
      setColor("");
      setIsActive(true);
    }
  }, [module]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const moduleData = {
        code,
        name,
        platform,
        description: description || null,
        icon,
        color: color || null,
        is_active: isActive,
      };

      if (module) {
        const { error } = await supabase
          .from("system_modules")
          .update(moduleData)
          .eq("id", module.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("system_modules")
          .insert(moduleData);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success(module ? "Module modifié" : "Module créé");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    if (!code || !name || !platform) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {module ? "Modifier le module" : "Créer un module"}
          </DialogTitle>
          <DialogDescription>
            Définissez les informations du module système
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code du module *</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ex: MOD_CATALOG"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nom du module *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Catalogage"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Plateforme *</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une plateforme" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du module..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icône</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map((i) => (
                    <SelectItem key={i.value} value={i.value}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Couleur (Tailwind class)</Label>
              <Input
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="ex: bg-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is_active">Module actif</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
