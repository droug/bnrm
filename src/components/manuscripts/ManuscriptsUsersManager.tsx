import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { UserPlus, Search, Edit, Trash2, Users } from "lucide-react";
import { useForm } from "react-hook-form";

interface ManuscriptPlatformUser {
  id: string;
  user_id: string;
  role: 'viewer' | 'contributor' | 'editor' | 'admin';
  is_active: boolean;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email?: string;
  };
}

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Visiteur', description: 'Peut consulter les manuscrits publics', color: 'outline' },
  { value: 'contributor', label: 'Contributeur', description: 'Peut soumettre des suggestions', color: 'secondary' },
  { value: 'editor', label: 'Éditeur', description: 'Peut modifier les manuscrits', color: 'default' },
  { value: 'admin', label: 'Administrateur', description: 'Gestion complète de la plateforme', color: 'destructive' },
];

export function ManuscriptsUsersManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<ManuscriptPlatformUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");

  const { register, handleSubmit, reset, setValue } = useForm();

  // Fetch manuscript platform users with profiles
  const { data: platformUsers, isLoading } = useQuery({
    queryKey: ['manuscript-platform-users'],
    queryFn: async () => {
      const { data: platformData, error: platformError } = await supabase
        .from('manuscript_platform_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (platformError) throw platformError;
      
      // Fetch profiles separately
      const userIds = platformData?.map(u => u.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Merge data
      const merged = platformData?.map(user => ({
        ...user,
        profiles: profilesData?.find(p => p.user_id === user.user_id)
      }));
      
      return merged as ManuscriptPlatformUser[];
    }
  });

  // Fetch all authenticated users for selection
  const { data: allUsers } = useQuery({
    queryKey: ['all-authenticated-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .eq('is_approved', true);
      
      if (error) throw error;
      return data;
    }
  });

  // Filter users
  const filteredUsers = platformUsers?.filter(user => {
    const fullName = `${user.profiles?.first_name} ${user.profiles?.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Add user to platform
  const addUser = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('manuscript_platform_users')
        .insert({
          user_id: data.user_id,
          role: data.role,
          is_active: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manuscript-platform-users'] });
      setShowAddDialog(false);
      reset();
      setSelectedUserEmail("");
      toast({ title: "Utilisateur ajouté à la plateforme manuscrits" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible d'ajouter l'utilisateur", 
        variant: "destructive" 
      });
    }
  });

  // Update user role
  const updateUser = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('manuscript_platform_users')
        .update({
          role: data.role,
          is_active: data.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manuscript-platform-users'] });
      setEditingUser(null);
      toast({ title: "Utilisateur mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour l'utilisateur", variant: "destructive" });
    }
  });

  // Remove user from platform
  const removeUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('manuscript_platform_users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manuscript-platform-users'] });
      setDeletingUserId(null);
      toast({ title: "Utilisateur retiré de la plateforme" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de retirer l'utilisateur", variant: "destructive" });
    }
  });

  const onSubmitAdd = (data: any) => {
    addUser.mutate({ user_id: selectedUserEmail, role: data.role });
  };

  const onSubmitEdit = (data: any) => {
    if (editingUser) {
      updateUser.mutate({ ...data, id: editingUser.id });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleOption = ROLE_OPTIONS.find(r => r.value === role);
    return roleOption ? { label: roleOption.label, variant: roleOption.color as any } : { label: role, variant: 'outline' as any };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Utilisateurs de la Plateforme Manuscrits</h2>
          <p className="text-muted-foreground">
            Gérez les utilisateurs inscrits sur la plateforme des manuscrits numérisés
          </p>
          <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Note: Seuls les utilisateurs ajoutés à cette plateforme peuvent être modifiés ou supprimés ici
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Utilisateurs</div>
            <div className="text-2xl font-bold">{platformUsers?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Actifs</div>
            <div className="text-2xl font-bold text-green-600">
              {platformUsers?.filter(u => u.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Administrateurs</div>
            <div className="text-2xl font-bold text-red-600">
              {platformUsers?.filter(u => u.role === 'admin').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Éditeurs</div>
            <div className="text-2xl font-bold text-blue-600">
              {platformUsers?.filter(u => u.role === 'editor').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Utilisateur Authentifié</CardTitle>
          <CardDescription>
            Sélectionnez un utilisateur déjà authentifié au portail pour lui donner accès à la plateforme manuscrits
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Inscrire un utilisateur du portail
          </Button>
          <div className="text-sm text-muted-foreground flex-1 flex items-center">
            Les utilisateurs du portail doivent être ajoutés ici pour accéder à la plateforme manuscrits
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs Inscrits sur la Plateforme</CardTitle>
          <CardDescription>
            Liste des utilisateurs ayant accès à la plateforme manuscrits - Seuls ces utilisateurs peuvent être modifiés ou retirés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {ROLE_OPTIONS.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <p>Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Ajouté le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.profiles?.first_name} {user.profiles?.last_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadge(user.role).variant}>
                        {getRoleBadge(user.role).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="default">Actif</Badge>
                      ) : (
                        <Badge variant="secondary">Inactif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                          title="Modifier l'utilisateur de la plateforme"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingUserId(user.id)}
                          title="Retirer l'utilisateur de la plateforme"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inscrire un Utilisateur du Portail</DialogTitle>
            <DialogDescription>
              Sélectionnez un utilisateur déjà authentifié au portail principal pour lui donner accès à la plateforme des manuscrits numérisés.
              Une fois inscrit, vous pourrez modifier son rôle ou le retirer de cette plateforme.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
            <div>
              <Label>Utilisateur *</Label>
              <Select value={selectedUserEmail} onValueChange={setSelectedUserEmail}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers?.filter(u => !platformUsers?.some(pu => pu.user_id === u.user_id))
                    .map(user => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.first_name} {user.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rôle dans la plateforme *</Label>
              <Select onValueChange={(value) => setValue("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={addUser.isPending || !selectedUserEmail}>
                {addUser.isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier l'Utilisateur</DialogTitle>
              <DialogDescription>Mettre à jour le rôle et le statut</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input 
                  value={`${editingUser.profiles?.first_name} ${editingUser.profiles?.last_name}`} 
                  disabled 
                />
              </div>
              <div>
                <Label>Rôle *</Label>
                <Select 
                  defaultValue={editingUser.role}
                  onValueChange={(value) => setValue("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statut</Label>
                <Select 
                  defaultValue={editingUser.is_active ? "true" : "false"}
                  onValueChange={(value) => setValue("is_active", value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={updateUser.isPending}>
                  {updateUser.isPending ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer cet utilisateur de la plateforme ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cet utilisateur ne pourra plus accéder à la plateforme des manuscrits numérisés.
              <br /><br />
              <strong>Important:</strong> Il conservera son compte sur le portail principal et pourra y accéder normalement.
              Cette action retire uniquement l'accès à la plateforme manuscrits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingUserId && removeUser.mutate(deletingUserId)}
              className="bg-destructive text-destructive-foreground"
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
