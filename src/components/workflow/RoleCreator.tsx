import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Shield, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Permission {
  id: string;
  permission_name: string;
  category: string;
  description: string | null;
}

interface PermissionsByCategory {
  [category: string]: Permission[];
}

export function RoleCreator() {
  const [roleName, setRoleName] = useState("");
  const [roleCode, setRoleCode] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [fetchingPermissions, setFetchingPermissions] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setFetchingPermissions(true);
      const { data, error } = await supabase
        .from("workflow_permissions")
        .select("*")
        .order("category", { ascending: true })
        .order("permission_name", { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
      toast.error("Erreur lors du chargement des permissions");
    } finally {
      setFetchingPermissions(false);
    }
  };

  const groupPermissionsByCategory = (): PermissionsByCategory => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as PermissionsByCategory);
  };

  const handlePermissionToggle = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  const handleSelectAllInCategory = (category: string) => {
    const categoryPermissions = permissions.filter(p => p.category === category);
    const allSelected = categoryPermissions.every(p => selectedPermissions.has(p.id));
    
    const newSelected = new Set(selectedPermissions);
    categoryPermissions.forEach(p => {
      if (allSelected) {
        newSelected.delete(p.id);
      } else {
        newSelected.add(p.id);
      }
    });
    setSelectedPermissions(newSelected);
  };

  const handleCreateRole = async () => {
    if (!roleName.trim() || !roleCode.trim()) {
      toast.error("Veuillez remplir le nom et le code du rôle");
      return;
    }

    if (selectedPermissions.size === 0) {
      toast.error("Veuillez sélectionner au moins une permission");
      return;
    }

    setLoading(true);
    try {
      // Note: L'ajout d'un nouveau rôle à l'enum nécessite une migration SQL
      toast.info(
        "Création de rôle", 
        {
          description: `Pour créer le rôle "${roleName}" (${roleCode}), vous devez d'abord l'ajouter à l'enum user_role via une migration SQL. Ensuite, les permissions pourront être assignées.`,
          duration: 10000
        }
      );

      // Log the role configuration for admin reference
      console.log("Configuration du nouveau rôle:", {
        name: roleName,
        code: roleCode,
        description: roleDescription,
        permissions: Array.from(selectedPermissions)
      });

      toast.success(
        "Configuration enregistrée",
        {
          description: "Les détails du rôle ont été enregistrés dans la console. Un administrateur système doit créer la migration SQL."
        }
      );

      // Reset form
      setRoleName("");
      setRoleCode("");
      setRoleDescription("");
      setSelectedPermissions(new Set());
    } catch (error: any) {
      console.error("Error creating role:", error);
      toast.error("Erreur lors de la création du rôle");
    } finally {
      setLoading(false);
    }
  };

  const permissionsByCategory = groupPermissionsByCategory();
  const categoryLabels: Record<string, string> = {
    collections: "Collections",
    content: "Contenu",
    legal_deposit: "Dépôt Légal",
    manuscripts: "Manuscrits",
    requests: "Demandes",
    subscriptions: "Abonnements",
    system: "Système",
    users: "Utilisateurs",
    cultural_activities: "Activités Culturelles",
    reproductions: "Reproductions",
    digitization: "Numérisation",
    exhibitions: "Expositions",
    payments: "Paiements",
    workflows: "Workflows",
    templates: "Modèles"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Créer un nouveau rôle
          </CardTitle>
          <CardDescription>
            Définissez un nouveau rôle et sélectionnez les permissions associées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Role Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="roleName">Nom du rôle *</Label>
              <Input
                id="roleName"
                placeholder="Ex: Gestionnaire de contenu"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleCode">Code du rôle * (snake_case)</Label>
              <Input
                id="roleCode"
                placeholder="Ex: content_manager"
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleDescription">Description</Label>
            <Textarea
              id="roleDescription"
              placeholder="Décrivez les responsabilités et le niveau d'accès de ce rôle..."
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Separator />

          {/* Permissions Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permissions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sélectionnez les permissions pour ce rôle
                </p>
              </div>
              <Badge variant="secondary">
                {selectedPermissions.size} sélectionnée(s)
              </Badge>
            </div>

            {fetchingPermissions ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement des permissions...
              </div>
            ) : (
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-6">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => {
                    const allSelected = perms.every(p => selectedPermissions.has(p.id));
                    const someSelected = perms.some(p => selectedPermissions.has(p.id));

                    return (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={() => handleSelectAllInCategory(category)}
                              className={someSelected && !allSelected ? "data-[state=checked]:bg-primary/50" : ""}
                            />
                            <h4 className="font-semibold text-sm">
                              {categoryLabels[category] || category}
                            </h4>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {perms.filter(p => selectedPermissions.has(p.id)).length}/{perms.length}
                          </Badge>
                        </div>
                        
                        <div className="ml-6 space-y-2">
                          {perms.map(permission => (
                            <div
                              key={permission.id}
                              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <Checkbox
                                checked={selectedPermissions.has(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {permission.permission_name}
                                  </span>
                                  {selectedPermissions.has(permission.id) && (
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  )}
                                </div>
                                {permission.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {permission.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={handleCreateRole}
              disabled={loading || !roleName.trim() || !roleCode.trim() || selectedPermissions.size === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer le rôle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-sm">ℹ️ Instructions importantes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            La création d'un nouveau rôle nécessite une migration SQL pour l'ajouter à l'enum <code className="bg-blue-100 px-1 rounded">user_role</code>.
          </p>
          <p className="font-medium">Étapes requises :</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Créez une migration SQL pour ajouter le rôle à l'enum</li>
            <li>Insérez les permissions dans la table <code className="bg-blue-100 px-1 rounded">role_permissions</code></li>
            <li>Le rôle sera ensuite disponible pour attribution aux utilisateurs</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
