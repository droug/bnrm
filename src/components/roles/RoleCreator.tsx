import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RoleCreator() {
  const [open, setOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const { toast } = useToast();

  const handleCreate = () => {
    if (!roleName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du rôle est requis",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Rôle créé",
      description: `Le rôle "${roleName}" a été créé avec succès`,
    });

    setRoleName("");
    setRoleDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Créer un Rôle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un Nouveau Rôle</DialogTitle>
          <DialogDescription>
            Définissez un nouveau rôle pour votre système
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom du rôle</Label>
            <Input
              id="name"
              placeholder="Ex: Gestionnaire de contenu"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Décrivez les responsabilités de ce rôle..."
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreate}>Créer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
