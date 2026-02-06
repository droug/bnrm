import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, Info, Loader2, Save, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['user_role'];

interface Role {
  id: string;
  name: string;
  code?: string;
  description: string;
  color: string;
  is_system?: boolean;
  source?: 'enum' | 'dynamic';
}

interface RoleEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onSave: (role: Partial<Role>) => void;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface PermissionsByCategory {
  [category: string]: Permission[];
}

const categoryLabels: Record<string, { label: string; icon: string }> = {
  collections: { label: "Collections", icon: "📚" },
  content: { label: "Gestion de Contenu", icon: "📝" },
  legal_deposit: { label: "Dépôt Légal", icon: "📋" },
  manuscripts: { label: "Manuscrits", icon: "📜" },
  users: { label: "Utilisateurs", icon: "👥" },
  system: { label: "Système", icon: "⚙️" },
  analytics: { label: "Statistiques", icon: "📊" },
  cbm: { label: "CBM", icon: "🏛️" },
  cultural: { label: "Activités Culturelles", icon: "🎭" },
  digital_library: { label: "Bibliothèque Numérique", icon: "💻" },
};

export function RoleEditorDialog({ open, onOpenChange, role, onSave }: RoleEditorDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("bg-gray-500");
  const [grantedPermissions, setGrantedPermissions] = useState<Set<string>>(new Set());

  const colors = [
    { value: "bg-red-500", label: "Rouge" },
    { value: "bg-blue-500", label: "Bleu" },
    { value: "bg-green-500", label: "Vert" },
    { value: "bg-yellow-500", label: "Jaune" },
    { value: "bg-purple-500", label: "Violet" },
    { value: "bg-pink-500", label: "Rose" },
    { value: "bg-indigo-500", label: "Indigo" },
    { value: "bg-gray-500", label: "Gris" },
  ];

  // Charger toutes les permissions disponibles
  const { data: allPermissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ['all-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Permission[];
    },
    enabled: open,
  });

  // Charger les permissions actuelles du rôle
  const { data: rolePermissions = [], isLoading: loadingRolePermissions } = useQuery({
    queryKey: ['role-permissions', role?.code],
    queryFn: async () => {
      if (!role?.code) return [];
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_id, granted')
        .eq('role', role.code as UserRole)
        .eq('granted', true);
      
      if (error) throw error;
      return data;
    },
    enabled: open && !!role?.code,
  });

  // Mutation pour sauvegarder les permissions
  const savePermissionsMutation = useMutation({
    mutationFn: async ({ roleCode, permissions }: { roleCode: string; permissions: Set<string> }) => {
      const typedRole = roleCode as UserRole;
      
      // Récupérer toutes les permissions existantes pour ce rôle
      const { data: existing } = await supabase
        .from('role_permissions')
        .select('id, permission_id')
        .eq('role', typedRole);

      const existingMap = new Map(existing?.map(e => [e.permission_id, e.id]) || []);
      const permissionsArray = Array.from(permissions);

      // Permissions à ajouter
      const toAdd = permissionsArray.filter(p => !existingMap.has(p));
      
      // Permissions à activer (déjà existantes mais désactivées)
      const toActivate = permissionsArray.filter(p => existingMap.has(p));
      
      // Permissions à désactiver
      const toDeactivate = Array.from(existingMap.keys()).filter(p => !permissions.has(p));

      // Insérer les nouvelles
      if (toAdd.length > 0) {
        const { error } = await supabase
          .from('role_permissions')
          .insert(toAdd.map(permissionId => ({
            role: typedRole,
            permission_id: permissionId,
            granted: true,
          })));
        if (error) throw error;
      }

      // Mettre à jour celles qui existent
      if (toActivate.length > 0) {
        for (const permId of toActivate) {
          await supabase
            .from('role_permissions')
            .update({ granted: true })
            .eq('role', typedRole)
            .eq('permission_id', permId);
        }
      }

      // Désactiver celles qui ne sont plus sélectionnées
      if (toDeactivate.length > 0) {
        for (const permId of toDeactivate) {
          await supabase
            .from('role_permissions')
            .update({ granted: false })
            .eq('role', typedRole)
            .eq('permission_id', permId);
        }
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success("Permissions mises à jour", {
        description: "Les permissions du rôle ont été enregistrées avec succès",
      });
    },
    onError: (error: any) => {
      toast.error("Erreur", {
        description: error.message || "Impossible de sauvegarder les permissions",
      });
    },
  });

  // Grouper les permissions par catégorie
  const permissionsByCategory: PermissionsByCategory = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as PermissionsByCategory);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setColor(role.color);
    } else {
      setName("");
      setDescription("");
      setColor("bg-gray-500");
      setGrantedPermissions(new Set());
    }
  }, [role, open]);

  // Charger les permissions accordées quand les données arrivent
  useEffect(() => {
    if (rolePermissions.length > 0) {
      setGrantedPermissions(new Set(rolePermissions.map(rp => rp.permission_id)));
    } else if (open && role) {
      setGrantedPermissions(new Set());
    }
  }, [rolePermissions, open, role]);

  const handleSave = async () => {
    if (role?.code) {
      await savePermissionsMutation.mutateAsync({
        roleCode: role.code,
        permissions: grantedPermissions,
      });
    }
    
    onSave({
      name,
      description,
      color,
    });
  };

  const togglePermission = (permissionId: string) => {
    setGrantedPermissions(prev => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const toggleCategory = (category: string, enabled: boolean) => {
    const categoryPerms = permissionsByCategory[category] || [];
    setGrantedPermissions(prev => {
      const next = new Set(prev);
      categoryPerms.forEach(perm => {
        if (enabled) {
          next.add(perm.id);
        } else {
          next.delete(perm.id);
        }
      });
      return next;
    });
  };

  const isLoading = loadingPermissions || loadingRolePermissions;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {role ? `Modifier le rôle: ${role.name}` : "Créer un nouveau rôle"}
          </DialogTitle>
          <DialogDescription>
            {role 
              ? "Modifiez les informations et les permissions du rôle"
              : "Définissez les informations et les permissions du nouveau rôle"
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              Permissions
              {grantedPermissions.size > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {grantedPermissions.size}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du rôle *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Gestionnaire de contenu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={role?.source === 'enum'}
                />
                {role?.source === 'enum' && (
                  <p className="text-xs text-muted-foreground">
                    Ce rôle système ne peut pas être renommé
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez les responsabilités de ce rôle..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label>Couleur du badge</Label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={`w-12 h-12 rounded-md ${c.value} transition-transform hover:scale-110 ${
                        color === c.value ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Aperçu du badge:</p>
                    <Badge className={`${color} text-white`}>
                      {name || "Nom du rôle"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="flex-1 overflow-hidden mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">{grantedPermissions.size}</span>
                      {" "}permissions sélectionnées sur {allPermissions.length}
                    </div>
                    {role?.code && (
                      <Badge variant={role.source === 'enum' ? "default" : "secondary"}>
                        {role.source === 'enum' ? "Rôle Système" : "Rôle Dynamique"}
                      </Badge>
                    )}
                  </div>

                  <Accordion type="multiple" className="w-full">
                    {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                      const categoryInfo = categoryLabels[category] || { label: category, icon: "📁" };
                      const grantedInCategory = permissions.filter(p => grantedPermissions.has(p.id)).length;
                      const allGranted = grantedInCategory === permissions.length;
                      
                      return (
                        <AccordionItem key={category} value={category}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{categoryInfo.icon}</span>
                                <span className="font-semibold">{categoryInfo.label}</span>
                              </div>
                              <Badge variant={grantedInCategory > 0 ? "default" : "secondary"}>
                                {grantedInCategory}/{permissions.length}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded">
                                <span className="text-sm font-medium">Tout sélectionner</span>
                                <Switch
                                  checked={allGranted}
                                  onCheckedChange={(checked) => toggleCategory(category, checked)}
                                />
                              </div>
                              <Separator />
                              {permissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 rounded transition-colors"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                        {permission.name}
                                      </code>
                                      {grantedPermissions.has(permission.id) && (
                                        <Check className="h-3 w-3 text-green-500" />
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {permission.description}
                                    </div>
                                  </div>
                                  <Switch
                                    checked={grantedPermissions.has(permission.id)}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                  />
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || savePermissionsMutation.isPending}
            className="gap-2"
          >
            {savePermissionsMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {role ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}