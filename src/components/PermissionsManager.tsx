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

  const roles = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'librarian', label: 'Bibliothécaire' },
    { value: 'researcher', label: 'Chercheur' },
    { value: 'partner', label: 'Partenaire' },
    { value: 'subscriber', label: 'Abonné' },
    { value: 'public_user', label: 'Utilisateur public' },
    { value: 'visitor', label: 'Visiteur' },
    { value: 'dac', label: 'DAC (Direction Activités Culturelles)' },
    { value: 'comptable', label: 'Comptable' },
    { value: 'direction', label: 'Direction' },
    { value: 'read_only', label: 'Lecture seule' }
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
    cultural_activities: 'Activités Culturelles'
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
        supabase.from('profiles').select('user_id, first_name, last_name, role').order('first_name')
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Permissions par Rôle</span>
              </CardTitle>
              <CardDescription>
                Gérez les permissions attribuées à chaque rôle système par catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="role-select">Sélectionner un rôle</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Category Tabs for Permissions */}
              <Tabs defaultValue="collections" className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
                  <TabsTrigger value="collections">Collections</TabsTrigger>
                  <TabsTrigger value="content">Contenu</TabsTrigger>
                  <TabsTrigger value="legal_deposit">Dépôt Légal</TabsTrigger>
                  <TabsTrigger value="manuscripts">Manuscrits</TabsTrigger>
                  <TabsTrigger value="requests">Demandes</TabsTrigger>
                  <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
                  <TabsTrigger value="system">Système</TabsTrigger>
                  <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                  <TabsTrigger value="cultural_activities">Activités Culturelles</TabsTrigger>
                </TabsList>

                {['collections', 'content', 'legal_deposit', 'manuscripts', 'requests', 'subscriptions', 'system', 'users', 'cultural_activities'].map((category) => (
                  <TabsContent key={category} value={category} className="mt-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">{categoryLabels[category]}</h3>
                      <div className="grid gap-3">
                        {permissions
                          .filter(p => p.category === category)
                          .map((permission) => {
                            const rolePermission = getRolePermissions(selectedRole).find(
                              rp => rp.permission_id === permission.id
                            );
                            
                            return (
                              <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{permission.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {categoryLabels[permission.category]}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
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
                  </TabsContent>
                ))}
              </Tabs>
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
                  <Badge variant="secondary">{roles.length}</Badge>
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