import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Shield, User, Clock, Plus, Edit, Trash2, Save, Calendar, CheckCircle2, ChevronDown, Settings, BookOpen, FileText, Scale, Printer, HardDrive, CreditCard, Palette, Image as ImageIcon, Users, DollarSign, Workflow, FileCheck, Cog } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
  granted: boolean;
  permission: Permission;
}

interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  granted: boolean;
  granted_by: string;
  expires_at: string | null;
  reason: string | null;
  permission: Permission;
}

export function PermissionsManager() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newUserPermission, setNewUserPermission] = useState({
    user_id: '',
    permission_id: '',
    granted: true,
    expires_at: '',
    reason: ''
  });
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Groupes de rôles pour une meilleure organisation
  const roleGroups = [
    {
      title: 'Rôles Administratifs',
      roles: [
        { value: 'admin', label: 'Administrateur', color: 'text-red-600', description: 'Accès complet au système' },
        { value: 'direction', label: 'Direction', color: 'text-purple-600', description: 'Vue d\'ensemble et validation' }
      ]
    },
    {
      title: 'Rôles Bibliothèque & Collections',
      roles: [
        { value: 'librarian', label: 'Bibliothécaire', color: 'text-blue-600', description: 'Gestion des collections' },
      ]
    },
    {
      title: 'Rôles Activités Culturelles',
      roles: [
        { value: 'dac', label: 'DAC', color: 'text-green-600', description: 'Direction Activités Culturelles' },
        { value: 'comptable', label: 'Comptable', color: 'text-yellow-600', description: 'Gestion financière' },
      ]
    },
    {
      title: 'Rôles Utilisateurs',
      roles: [
        { value: 'researcher', label: 'Chercheur', color: 'text-indigo-600', description: 'Accès recherche académique' },
        { value: 'partner', label: 'Partenaire', color: 'text-teal-600', description: 'Partenariats institutionnels' },
        { value: 'subscriber', label: 'Abonné', color: 'text-cyan-600', description: 'Services premium' },
        { value: 'public_user', label: 'Utilisateur public', color: 'text-gray-600', description: 'Accès de base' },
        { value: 'visitor', label: 'Visiteur', color: 'text-gray-400', description: 'Consultation publique' },
        { value: 'read_only', label: 'Lecture seule', color: 'text-slate-600', description: 'Consultation uniquement' }
      ]
    }
  ];

  // Toutes les catégories de permissions organisées par module
  const categoryGroups = [
    {
      title: 'Bibliothèque & Collections',
      categories: [
        { key: 'collections', label: 'Collections', icon: '📚' },
        { key: 'manuscripts', label: 'Manuscrits', icon: '📜' },
        { key: 'content', label: 'Contenu', icon: '📄' },
        { key: 'legal_deposit', label: 'Dépôt Légal', icon: '⚖️' },
      ]
    },
    {
      title: 'Services & Demandes',
      categories: [
        { key: 'requests', label: 'Demandes', icon: '📥' },
        { key: 'reproductions', label: 'Reproductions', icon: '🖨️' },
        { key: 'digitization', label: 'Numérisation', icon: '💾' },
        { key: 'subscriptions', label: 'Abonnements', icon: '💳' },
      ]
    },
    {
      title: 'Activités Culturelles',
      categories: [
        { key: 'cultural_activities', label: 'Activités Culturelles', icon: '🎭' },
        { key: 'exhibitions', label: 'Expositions', icon: '🖼️' },
      ]
    },
    {
      title: 'Gestion & Administration',
      categories: [
        { key: 'users', label: 'Utilisateurs', icon: '👥' },
        { key: 'payments', label: 'Paiements', icon: '💰' },
        { key: 'workflows', label: 'Workflows', icon: '⚙️' },
        { key: 'templates', label: 'Modèles', icon: '📋' },
        { key: 'system', label: 'Système', icon: '🔧' },
      ]
    }
  ];

  const categoryLabels: Record<string, string> = {
    collections: 'Collections',
    content: 'Contenu',
    legal_deposit: 'Dépôt Légal',
    manuscripts: 'Manuscrits',
    requests: 'Demandes',
    subscriptions: 'Abonnements',
    system: 'Système',
    users: 'Utilisateurs',
    cultural_activities: 'Activités Culturelles',
    reproductions: 'Reproductions',
    digitization: 'Numérisation',
    exhibitions: 'Expositions',
    payments: 'Paiements',
    workflows: 'Workflows',
    templates: 'Modèles'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [permissionsRes, rolePermsRes, userPermsRes, usersRes] = await Promise.all([
        supabase.from('permissions').select('*').order('category', { ascending: true }),
        supabase.from('role_permissions').select(`
          *,
          permission:permissions(*)
        `).order('role', { ascending: true }),
        supabase.from('user_permissions').select(`
          *,
          permission:permissions(*)
        `).order('created_at', { ascending: false }),
        supabase.from('profiles').select('user_id, first_name, last_name').order('first_name')
      ]);

      if (permissionsRes.data) setPermissions(permissionsRes.data);
      if (rolePermsRes.data) setRolePermissions(rolePermsRes.data);
      if (userPermsRes.data) setUserPermissions(userPermsRes.data);
      if (usersRes.data) setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching permissions data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des permissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRolePermission = async (rolePermissionId: string, granted: boolean) => {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .update({ granted })
        .eq('id', rolePermissionId);

      if (error) throw error;

      setRolePermissions(prev => 
        prev.map(rp => rp.id === rolePermissionId ? { ...rp, granted } : rp)
      );

      toast({
        title: "Permission mise à jour",
        description: "La permission du rôle a été modifiée avec succès.",
      });
    } catch (error) {
      console.error('Error updating role permission:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la permission.",
        variant: "destructive",
      });
    }
  };

  const createUserPermission = async () => {
    if (!newUserPermission.user_id || !newUserPermission.permission_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un utilisateur et une permission.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permissionData = {
        user_id: newUserPermission.user_id,
        permission_id: newUserPermission.permission_id,
        granted: newUserPermission.granted,
        expires_at: newUserPermission.expires_at || null,
        reason: newUserPermission.reason || null
      };

      const { error } = await supabase
        .from('user_permissions')
        .insert([permissionData]);

      if (error) throw error;

      setNewUserPermission({
        user_id: '',
        permission_id: '',
        granted: true,
        expires_at: '',
        reason: ''
      });

      await fetchData();

      toast({
        title: "Permission créée",
        description: "La permission utilisateur a été créée avec succès.",
      });
    } catch (error) {
      console.error('Error creating user permission:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la permission utilisateur.",
        variant: "destructive",
      });
    }
  };

  const deleteUserPermission = async (userPermissionId: string) => {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('id', userPermissionId);

      if (error) throw error;

      setUserPermissions(prev => prev.filter(up => up.id !== userPermissionId));

      toast({
        title: "Permission supprimée",
        description: "La permission utilisateur a été supprimée avec succès.",
      });
    } catch (error) {
      console.error('Error deleting user permission:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la permission.",
        variant: "destructive",
      });
    }
  };

  const getPermissionsByCategory = () => {
    const categories = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
    return categories;
  };

  const getRolePermissions = (role: string) => {
    return rolePermissions.filter(rp => rp.role === role);
  };

  const handleCreateRole = async () => {
    if (!newRole.name.trim() || !newRole.code.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le nom et le code du rôle",
        variant: "destructive"
      });
      return;
    }

    if (selectedPermissions.size === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une permission",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Information",
      description: `Pour créer le rôle "${newRole.name}" (${newRole.code}), vous devez d'abord l'ajouter à l'enum user_role via une migration SQL. Ensuite, les permissions pourront être assignées.`,
      duration: 10000
    });

    console.log("Configuration du nouveau rôle:", {
      name: newRole.name,
      code: newRole.code,
      description: newRole.description,
      permissions: Array.from(selectedPermissions)
    });

    toast({
      title: "Configuration enregistrée",
      description: "Les détails du rôle ont été enregistrés dans la console. Un administrateur système doit créer la migration SQL."
    });

    setIsCreateRoleDialogOpen(false);
    setNewRole({ name: '', code: '', description: '' });
    setSelectedPermissions(new Set());
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

  const groupPermissionsByCategory = () => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Gestion Avancée des Permissions
            </h1>
            <p className="text-muted-foreground mt-1">
              Contrôle granulaire des droits d'accès par rôle et utilisateur - Tous les modules et plateformes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm py-2 px-4">
            <Settings className="h-4 w-4 mr-2" />
            {permissions.length} Permissions
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-12 bg-muted/50">
          <TabsTrigger value="roles" className="text-base">
            <Shield className="h-4 w-4 mr-2" />
            Permissions par Rôle
          </TabsTrigger>
          <TabsTrigger value="users" className="text-base">
            <User className="h-4 w-4 mr-2" />
            Permissions Utilisateur
          </TabsTrigger>
          <TabsTrigger value="overview" className="text-base">
            <Cog className="h-4 w-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
        </TabsList>

          {/* Role Permissions Tab */}
          <TabsContent value="roles" className="space-y-6">
            {/* Sélecteur de rôle avec groupes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Sélectionner un Rôle</span>
                  </CardTitle>
                  <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un nouveau rôle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>Créer un nouveau rôle</DialogTitle>
                        <DialogDescription>
                          Définissez un nouveau rôle et sélectionnez les permissions associées
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[70vh] pr-4">
                        <div className="space-y-6 py-4">
                          {/* Basic Role Information */}
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="roleName">Nom du rôle *</Label>
                              <Input
                                id="roleName"
                                placeholder="Ex: Gestionnaire de contenu"
                                value={newRole.name}
                                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="roleCode">Code du rôle * (snake_case)</Label>
                              <Input
                                id="roleCode"
                                placeholder="Ex: content_manager"
                                value={newRole.code}
                                onChange={(e) => setNewRole({ ...newRole, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="roleDescription">Description</Label>
                            <Textarea
                              id="roleDescription"
                              placeholder="Décrivez les responsabilités et le niveau d'accès de ce rôle..."
                              value={newRole.description}
                              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                              rows={3}
                            />
                          </div>

                          <Separator />

                          {/* Permissions Selection */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold">Permissions</h3>
                                <p className="text-sm text-muted-foreground">
                                  Sélectionnez les permissions pour ce rôle
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {selectedPermissions.size} sélectionnée(s)
                              </Badge>
                            </div>

                            <div className="space-y-4">
                              {Object.entries(groupPermissionsByCategory()).map(([category, perms]) => (
                                <div key={category} className="space-y-2 p-3 border rounded-lg">
                                  <h4 className="font-semibold text-sm">
                                    {categoryLabels[category] || category}
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {perms.filter(p => selectedPermissions.has(p.id)).length}/{perms.length}
                                    </Badge>
                                  </h4>
                                  <div className="space-y-2">
                                    {perms.map(permission => (
                                      <div key={permission.id} className="flex items-start gap-3 py-1">
                                        <Checkbox
                                          checked={selectedPermissions.has(permission.id)}
                                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                                          className="mt-0.5"
                                        />
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                              {permission.name}
                                            </span>
                                            {selectedPermissions.has(permission.id) && (
                                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            )}
                                          </div>
                                          {permission.description && (
                                            <p className="text-xs text-muted-foreground">
                                              {permission.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Instructions */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold mb-2">ℹ️ Instructions importantes</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              La création d'un nouveau rôle nécessite une migration SQL pour l'ajouter à l'enum <code className="bg-blue-100 px-1 rounded">user_role</code>.
                            </p>
                            <p className="text-sm font-medium mb-1">Étapes requises :</p>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                              <li>Créez une migration SQL pour ajouter le rôle à l'enum</li>
                              <li>Insérez les permissions dans la table <code className="bg-blue-100 px-1 rounded">role_permissions</code></li>
                              <li>Le rôle sera ensuite disponible pour attribution aux utilisateurs</li>
                            </ol>
                          </div>
                        </div>
                      </ScrollArea>
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsCreateRoleDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button
                          onClick={handleCreateRole}
                          disabled={!newRole.name.trim() || !newRole.code.trim() || selectedPermissions.size === 0}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Créer le rôle
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {roleGroups.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">{group.title}</h4>
                    {group.roles.map((role) => (
                      <button
                        key={role.value}
                        onClick={() => setSelectedRole(role.value)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedRole === role.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`font-semibold ${role.color}`}>{role.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{role.description}</div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permissions organisées par modules avec Accordéons */}
          <Card className="shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    Permissions pour : {roleGroups.flatMap(g => g.roles).find(r => r.value === selectedRole)?.label}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Configurez les permissions par module fonctionnel via les accordéons ci-dessous
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  {getRolePermissions(selectedRole).filter(rp => rp.granted).length} Actives
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Accordion type="multiple" className="space-y-3">
                {categoryGroups.map((group, groupIndex) => {
                  const groupCategories = group.categories.filter(category => 
                    permissions.filter(p => p.category === category.key).length > 0
                  );
                  
                  if (groupCategories.length === 0) return null;
                  
                  return (
                    <AccordionItem 
                      key={group.title} 
                      value={`group-${groupIndex}`}
                      className="border-2 rounded-xl overflow-hidden bg-gradient-to-br from-background to-muted/20"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:bg-muted/40 transition-all [&[data-state=open]]:bg-primary/5 [&[data-state=open]]:border-b-2">
                        <div className="flex items-center gap-4 text-left flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                            groupIndex === 0 ? 'bg-blue-500/10' :
                            groupIndex === 1 ? 'bg-green-500/10' :
                            groupIndex === 2 ? 'bg-purple-500/10' :
                            'bg-orange-500/10'
                          }`}>
                            {group.categories[0].icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold">{group.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {groupCategories.length} module{groupCategories.length > 1 ? 's' : ''} · {
                                groupCategories.reduce((acc, cat) => 
                                  acc + permissions.filter(p => p.category === cat.key).length, 0
                                )
                              } permissions
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-auto mr-4">
                            {
                              groupCategories.reduce((acc, cat) => {
                                const catPerms = permissions.filter(p => p.category === cat.key);
                                return acc + catPerms.filter(p => {
                                  const rp = getRolePermissions(selectedRole).find(rp => rp.permission_id === p.id);
                                  return rp?.granted;
                                }).length;
                              }, 0)
                            } / {
                              groupCategories.reduce((acc, cat) => 
                                acc + permissions.filter(p => p.category === cat.key).length, 0
                              )
                            } actives
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 pt-4">
                        <Accordion type="multiple" className="space-y-2">
                          {groupCategories.map((category) => {
                            const categoryPermissions = permissions.filter(p => p.category === category.key);
                            const activeCount = categoryPermissions.filter(p => {
                              const rp = getRolePermissions(selectedRole).find(rp => rp.permission_id === p.id);
                              return rp?.granted;
                            }).length;
                            
                            return (
                              <AccordionItem 
                                key={category.key} 
                                value={category.key}
                                className="border rounded-lg overflow-hidden bg-card"
                              >
                                <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 [&[data-state=open]]:bg-muted/50">
                                  <div className="flex items-center gap-3 text-left flex-1">
                                    <span className="text-xl">{category.icon}</span>
                                    <div className="flex-1">
                                      <h4 className="font-semibold">{category.label}</h4>
                                      <p className="text-xs text-muted-foreground">
                                        {categoryPermissions.length} permission{categoryPermissions.length > 1 ? 's' : ''}
                                      </p>
                                    </div>
                                    <Badge 
                                      variant={activeCount === categoryPermissions.length ? "default" : "secondary"}
                                      className="mr-2"
                                    >
                                      {activeCount}/{categoryPermissions.length}
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                  <div className="space-y-2 pt-2">
                                    {categoryPermissions.map((permission) => {
                                      const rolePermission = getRolePermissions(selectedRole).find(
                                        rp => rp.permission_id === permission.id
                                      );
                                      
                                      return (
                                        <div 
                                          key={permission.id} 
                                          className="flex items-center justify-between p-3 rounded-lg border bg-background hover:shadow-md transition-all group"
                                        >
                                          <div className="space-y-1 flex-1 pr-4">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-sm">{permission.name}</span>
                                              {rolePermission?.granted && (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                              {permission.description}
                                            </p>
                                          </div>
                                          <Switch
                                            checked={rolePermission?.granted || false}
                                            onCheckedChange={(checked) => {
                                              if (rolePermission) {
                                                updateRolePermission(rolePermission.id, checked);
                                              }
                                            }}
                                            className="shrink-0"
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Permissions Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Permissions Utilisateur Spécifiques</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle Permission
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Ajouter une Permission Utilisateur</DialogTitle>
                      <DialogDescription>
                        Attribuez une permission spécifique à un utilisateur
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="user-select">Utilisateur</Label>
                        <Select 
                          value={newUserPermission.user_id} 
                          onValueChange={(value) => setNewUserPermission(prev => ({ ...prev, user_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un utilisateur" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.user_id} value={user.user_id}>
                                {user.first_name} {user.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="permission-select">Permission</Label>
                        <Select 
                          value={newUserPermission.permission_id} 
                          onValueChange={(value) => setNewUserPermission(prev => ({ ...prev, permission_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une permission" />
                          </SelectTrigger>
                          <SelectContent>
                            {permissions.map((permission) => (
                              <SelectItem key={permission.id} value={permission.id}>
                                {permission.name} ({categoryLabels[permission.category]})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newUserPermission.granted}
                          onCheckedChange={(checked) => setNewUserPermission(prev => ({ ...prev, granted: checked }))}
                        />
                        <Label>Accorder la permission</Label>
                      </div>

                      <div>
                        <Label htmlFor="expires-at">Date d'expiration (optionnel)</Label>
                        <Input
                          type="datetime-local"
                          value={newUserPermission.expires_at}
                          onChange={(e) => setNewUserPermission(prev => ({ ...prev, expires_at: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="reason">Raison (optionnel)</Label>
                        <Textarea
                          value={newUserPermission.reason}
                          onChange={(e) => setNewUserPermission(prev => ({ ...prev, reason: e.target.value }))}
                          placeholder="Raison pour cette permission spécifique..."
                        />
                      </div>

                      <Button onClick={createUserPermission} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Créer la Permission
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Permissions individuelles qui remplacent les permissions de rôle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPermissions.map((userPermission) => (
                  <div key={userPermission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          Utilisateur {userPermission.user_id.substring(0, 8)}...
                        </span>
                        <Badge variant={userPermission.granted ? "default" : "destructive"}>
                          {userPermission.granted ? "Accordée" : "Refusée"}
                        </Badge>
                        {userPermission.expires_at && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Expire le {new Date(userPermission.expires_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{userPermission.permission.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({categoryLabels[userPermission.permission.category]})
                        </span>
                      </div>
                      {userPermission.reason && (
                        <p className="text-sm text-muted-foreground">
                          Raison: {userPermission.reason}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUserPermission(userPermission.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques des Permissions</CardTitle>
                <CardDescription>Aperçu général du système de permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">Total des permissions</span>
                  <Badge variant="secondary">{permissions.length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">Permissions utilisateur actives</span>
                  <Badge variant="secondary">
                    {userPermissions.filter(up => !up.expires_at || new Date(up.expires_at) > new Date()).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">Rôles système</span>
                  <Badge variant="secondary">{roleGroups.flatMap(g => g.roles).length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permissions par Catégorie</CardTitle>
                <CardDescription>Répartition des permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(getPermissionsByCategory()).map(([category, perms]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium capitalize">{categoryLabels[category]}</span>
                    <Badge>{perms.length}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}