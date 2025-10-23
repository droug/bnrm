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
import { Shield, User, Clock, Plus, Edit, Trash2, Save, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center space-x-4">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Permissions</h1>
          <p className="text-muted-foreground">
            Configurez les droits et habilitations pour les rôles et utilisateurs
          </p>
        </div>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">Permissions par Rôle</TabsTrigger>
          <TabsTrigger value="users">Permissions Utilisateur</TabsTrigger>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
        </TabsList>

        {/* Role Permissions Tab */}
        <TabsContent value="roles" className="space-y-6">
          {/* Sélecteur de rôle avec groupes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Sélectionner un Rôle</span>
              </CardTitle>
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

          {/* Permissions organisées par modules */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions pour : {roleGroups.flatMap(g => g.roles).find(r => r.value === selectedRole)?.label}</CardTitle>
              <CardDescription>
                Configurez les permissions par module fonctionnel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {categoryGroups.map((group) => (
                <div key={group.title} className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">{group.categories[0].icon}</span>
                    {group.title}
                  </h3>
                  <Separator />
                  <div className="grid gap-4">
                    {group.categories.map((category) => {
                      const categoryPermissions = permissions.filter(p => p.category === category.key);
                      if (categoryPermissions.length === 0) return null;

                      return (
                        <div key={category.key} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center gap-2">
                              <span>{category.icon}</span>
                              {category.label}
                              <Badge variant="secondary" className="text-xs">
                                {categoryPermissions.length} permissions
                              </Badge>
                            </h4>
                          </div>
                          <div className="grid gap-2 pl-8">
                            {categoryPermissions.map((permission) => {
                              const rolePermission = getRolePermissions(selectedRole).find(
                                rp => rp.permission_id === permission.id
                              );
                              
                              return (
                                <div 
                                  key={permission.id} 
                                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-all"
                                >
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{permission.name}</span>
                                      {rolePermission?.granted && (
                                        <Badge variant="default" className="text-xs">Actif</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
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
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
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