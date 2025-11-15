import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CompleteSystemRole } from "@/config/completeSystemRoles";
import { Save, Plus, X, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RolePermissionsEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: CompleteSystemRole;
  onSave: (roleName: string, newPermissions: string[], canManageTransitions: boolean) => void;
}

// Permissions communes disponibles
const AVAILABLE_PERMISSIONS = [
  'admin.full_access',
  'workflow.transition.*',
  'workflow.manage_all',
  'workflow.view_all',
  'roles.manage',
  'users.manage',
  'system.configure',
  'inscription.view_all',
  'inscription.validate',
  'inscription.reject',
  'inscription.approve',
  'inscription.create',
  'inscription.update',
  'adhesion.view_all',
  'adhesion.validate',
  'adhesion.approve',
  'adhesion.manage',
  'legal_deposit.view',
  'legal_deposit.validate',
  'legal_deposit.approve',
  'isbn_issn.view',
  'isbn_issn.validate',
  'isbn_issn.assign',
  'reproduction.view',
  'reproduction.validate',
  'reproduction.approve',
  'restoration.view',
  'restoration.validate',
  'restoration.approve',
  'manuscripts.view',
  'manuscripts.access',
  'manuscripts.manage',
  'cultural_activities.view',
  'cultural_activities.manage',
  'space_booking.view',
  'space_booking.validate',
  'space_booking.approve',
  'cbm.view',
  'cbm.manage',
  'cbm.coordinate',
  'digital_library.view',
  'digital_library.manage',
  'cataloging.view',
  'cataloging.edit',
  'ged.view',
  'ged.manage',
  'portal.view',
  'portal.publish',
  'portal.moderate',
  'analytics.view',
  'analytics.create_reports',
];

export function RolePermissionsEditorDialog({
  open,
  onOpenChange,
  role,
  onSave,
}: RolePermissionsEditorDialogProps) {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<string[]>(role.permissions);
  const [canManageTransitions, setCanManageTransitions] = useState(role.can_manage_transitions || false);
  const [newPermission, setNewPermission] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<string>("");

  const isSystemAdmin = role.role_name === "Administrateur Système";

  const togglePermission = (permission: string) => {
    if (permissions.includes(permission)) {
      setPermissions(permissions.filter(p => p !== permission));
    } else {
      setPermissions([...permissions, permission]);
    }
  };

  const handleAddCustomPermission = () => {
    if (newPermission && !permissions.includes(newPermission)) {
      setPermissions([...permissions, newPermission]);
      setNewPermission("");
      toast({
        title: "Permission ajoutée",
        description: `La permission "${newPermission}" a été ajoutée`,
      });
    }
  };

  const handleRemovePermission = (permission: string) => {
    setPermissionToDelete(permission);
    setDeleteDialogOpen(true);
  };

  const confirmRemovePermission = () => {
    setPermissions(permissions.filter(p => p !== permissionToDelete));
    setDeleteDialogOpen(false);
    toast({
      title: "Permission supprimée",
      description: `La permission "${permissionToDelete}" a été retirée`,
    });
    setPermissionToDelete("");
  };

  const handleSave = () => {
    onSave(role.role_name, permissions, canManageTransitions);
    toast({
      title: "Rôle mis à jour",
      description: `Les permissions de "${role.role_name}" ont été modifiées`,
    });
    onOpenChange(false);
  };

  const filteredAvailablePermissions = AVAILABLE_PERMISSIONS.filter(p => 
    p.toLowerCase().includes(searchQuery.toLowerCase()) && !permissions.includes(p)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Modifier les permissions - {role.role_name}
          </DialogTitle>
          <DialogDescription>
            {role.description}
            {isSystemAdmin && (
              <Badge variant="destructive" className="ml-2">
                Rôle système protégé
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Colonne gauche: Permissions actuelles */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Permissions actuelles ({permissions.length})</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Cliquez sur une permission pour la retirer
              </p>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg p-3">
              <div className="space-y-2">
                {permissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucune permission assignée
                  </p>
                ) : (
                  permissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 group"
                    >
                      <span className="text-sm font-mono">{permission}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => handleRemovePermission(permission)}
                        disabled={isSystemAdmin}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Option de gestion des transitions */}
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Checkbox
                id="manage-transitions"
                checked={canManageTransitions}
                onCheckedChange={(checked) => setCanManageTransitions(checked as boolean)}
                disabled={isSystemAdmin}
              />
              <div className="flex-1">
                <label
                  htmlFor="manage-transitions"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Peut gérer les transitions de workflow
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Autorise ce rôle à effectuer des transitions dans les workflows
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite: Ajouter des permissions */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Ajouter des permissions</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Sélectionnez parmi les permissions disponibles ou créez-en une nouvelle
              </p>
            </div>

            {/* Ajouter une permission personnalisée */}
            <div className="space-y-2">
              <Label>Permission personnalisée</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="ex: module.action"
                  value={newPermission}
                  onChange={(e) => setNewPermission(e.target.value)}
                  disabled={isSystemAdmin}
                />
                <Button 
                  onClick={handleAddCustomPermission} 
                  disabled={!newPermission || isSystemAdmin}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Recherche et liste des permissions disponibles */}
            <div className="space-y-2">
              <Label>Permissions prédéfinies</Label>
              <Input
                placeholder="Rechercher une permission..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <ScrollArea className="h-[320px] border rounded-lg p-3">
                <div className="space-y-1">
                  {filteredAvailablePermissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {searchQuery ? "Aucune permission trouvée" : "Toutes les permissions sont déjà ajoutées"}
                    </p>
                  ) : (
                    filteredAvailablePermissions.map((permission) => (
                      <Button
                        key={permission}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => togglePermission(permission)}
                        disabled={isSystemAdmin}
                      >
                        <Plus className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="text-xs font-mono break-all">{permission}</span>
                      </Button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {isSystemAdmin && "⚠️ Les modifications sont désactivées pour l'Administrateur Système"}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSystemAdmin}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </div>

        {/* Dialog de confirmation de suppression */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir retirer la permission <strong className="font-mono text-foreground">{permissionToDelete}</strong> du rôle <strong>{role.role_name}</strong> ?
                <br /><br />
                Cette action peut affecter les capacités des utilisateurs ayant ce rôle.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRemovePermission} className="bg-destructive hover:bg-destructive/90">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
