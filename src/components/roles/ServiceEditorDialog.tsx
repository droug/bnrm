import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

interface Service {
  id: string;
  code: string;
  name: string;
  module_id?: string;
  description?: string;
  is_active: boolean;
  requires_approval: boolean;
}

interface ServiceEditorDialogProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceEditorDialog({ service, open, onOpenChange }: ServiceEditorDialogProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [moduleId, setModuleId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const queryClient = useQueryClient();

  const { data: modules } = useQuery({
    queryKey: ["modules-for-service"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_modules")
        .select("id, code, name, platform")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (service) {
      setCode(service.code);
      setName(service.name);
      setModuleId(service.module_id || "");
      setDescription(service.description || "");
      setIsActive(service.is_active);
      setRequiresApproval(service.requires_approval);
    } else {
      setCode("");
      setName("");
      setModuleId("");
      setDescription("");
      setIsActive(true);
      setRequiresApproval(false);
    }
  }, [service]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const serviceData = {
        code,
        name,
        module_id: moduleId || null,
        description: description || null,
        is_active: isActive,
        requires_approval: requiresApproval,
      };

      if (service) {
        const { error } = await supabase
          .from("system_services")
          .update(serviceData)
          .eq("id", service.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("system_services")
          .insert(serviceData);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success(service ? "Service modifié" : "Service créé");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    if (!code || !name) {
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
            {service ? "Modifier le service" : "Créer un service"}
          </DialogTitle>
          <DialogDescription>
            Définissez les informations du service système
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code du service *</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ex: SRV_REPRODUCTION"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nom du service *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Demande de reproduction"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="module">Module (optionnel)</Label>
            <Select value={moduleId} onValueChange={setModuleId}>
              <SelectTrigger>
                <SelectValue placeholder="Aucun module (service global)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun module</SelectItem>
                {modules?.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name} ({module.platform})
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
              placeholder="Description du service..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is_active">Service actif</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requires_approval"
                checked={requiresApproval}
                onCheckedChange={setRequiresApproval}
              />
              <Label htmlFor="requires_approval">Nécessite une approbation</Label>
            </div>
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
