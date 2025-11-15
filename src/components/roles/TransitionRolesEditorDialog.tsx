import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMPLETE_SYSTEM_ROLES } from "@/config/completeSystemRoles";
import { Plus, X, Save, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransitionRolesEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transitionName: string;
  currentRoles: string[];
  onSave: (transitionName: string, newRoles: string[]) => void;
}

export function TransitionRolesEditorDialog({
  open,
  onOpenChange,
  transitionName,
  currentRoles,
  onSave,
}: TransitionRolesEditorDialogProps) {
  const { toast } = useToast();
  const [roles, setRoles] = useState<string[]>(currentRoles);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrer les rôles disponibles (non encore ajoutés)
  const availableRoles = COMPLETE_SYSTEM_ROLES
    .filter(role => !roles.includes(role.role_name))
    .filter(role => 
      role.role_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleAddRole = () => {
    if (selectedRole && !roles.includes(selectedRole)) {
      setRoles([...roles, selectedRole]);
      setSelectedRole("");
    }
  };

  const handleRemoveRole = (roleName: string) => {
    // Ne pas permettre de supprimer "Administrateur Système"
    if (roleName === "Administrateur Système") {
      toast({
        title: "Action impossible",
        description: "L'Administrateur Système ne peut pas être retiré des transitions",
        variant: "destructive",
      });
      return;
    }
    setRoles(roles.filter(r => r !== roleName));
  };

  const handleSave = () => {
    // S'assurer que Administrateur Système est toujours présent
    const finalRoles = roles.includes("Administrateur Système") 
      ? roles 
      : [...roles, "Administrateur Système"];

    onSave(transitionName, finalRoles);
    toast({
      title: "Transition mise à jour",
      description: `Les rôles pour "${transitionName}" ont été modifiés avec succès`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Gérer les rôles - Transition: {transitionName}</DialogTitle>
          <DialogDescription>
            Ajoutez ou supprimez des rôles autorisés à effectuer cette transition de workflow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avertissement Administrateur Système */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> L'Administrateur Système est toujours autorisé pour toutes les transitions et ne peut pas être retiré.
            </div>
          </div>

          {/* Ajouter un rôle */}
          <div className="space-y-2">
            <Label>Ajouter un rôle</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher un rôle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                />
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {availableRoles.map((role) => (
                        <SelectItem key={role.role_name} value={role.role_name}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.role_name}</span>
                            <span className="text-xs text-muted-foreground">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddRole} 
                disabled={!selectedRole}
                size="icon"
                className="mt-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Liste des rôles actuels */}
          <div className="space-y-2">
            <Label>Rôles autorisés ({roles.length})</Label>
            <ScrollArea className="h-[300px] border rounded-lg p-4">
              <div className="space-y-2">
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucun rôle assigné à cette transition
                  </p>
                ) : (
                  roles.map((roleName) => {
                    const role = COMPLETE_SYSTEM_ROLES.find(r => r.role_name === roleName);
                    const isSystemAdmin = roleName === "Administrateur Système";
                    
                    return (
                      <div
                        key={roleName}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{roleName}</span>
                            {isSystemAdmin && (
                              <Badge variant="secondary" className="text-xs">
                                Protégé
                              </Badge>
                            )}
                          </div>
                          {role && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {role.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRole(roleName)}
                          disabled={isSystemAdmin}
                          className="ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
