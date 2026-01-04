import { useState, useEffect } from "react";
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
import { UserPlus, Upload, Download, Search, Edit, Trash2, Shield, CheckCircle, XCircle, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  institution: string | null;
  research_field: string | null;
  role: string;
  is_approved: boolean;
  created_at: string;
}

const ROLE_OPTIONS = [
  { value: 'public_user', label: 'Grand Public', color: 'outline' },
  { value: 'subscriber', label: 'Abonné Premium', color: 'secondary' },
  { value: 'researcher', label: 'Chercheur', color: 'default' },
  { value: 'partner', label: 'Partenaire Institutionnel', color: 'secondary' },
  { value: 'editor', label: 'Éditeur', color: 'default' },
  { value: 'printer', label: 'Imprimeur', color: 'default' },
  { value: 'producer', label: 'Producteur', color: 'default' },
  { value: 'distributor', label: 'Distributeur', color: 'default' },
  { value: 'librarian', label: 'Bibliothécaire', color: 'default' },
  { value: 'dac', label: 'DAC', color: 'default' },
  { value: 'comptable', label: 'Comptable', color: 'default' },
  { value: 'direction', label: 'Direction', color: 'default' },
  { value: 'read_only', label: 'Lecture seule', color: 'outline' },
  { value: 'admin', label: 'Administrateur', color: 'destructive' },
  { value: 'visitor', label: 'Visiteur', color: 'outline' },
];

export default function UsersManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editStatus, setEditStatus] = useState<string>("true");
  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [editRole, setEditRole] = useState<string>("visitor");
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['bn-users'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      
      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .order('granted_at', { ascending: false })
            .limit(1)
            .single();
          
          return {
            ...profile,
            role: roleData?.role || 'visitor'
          };
        })
      );
      
      return usersWithRoles as Profile[];
    }
  });

  // Filter users
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.institution?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // Create user
  const createUser = useMutation({
    mutationFn: async (data: any) => {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
          }
        }
      });

      if (authError) throw authError;

      // Update profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone || null,
            institution: data.institution || null,
            research_field: data.research_field || null,
            role: data.role,
            is_approved: true,
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bn-users'] });
      setShowAddDialog(false);
      reset();
      toast({ title: "Utilisateur créé avec succès" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible de créer l'utilisateur", 
        variant: "destructive" 
      });
    }
  });

  // Update user
  const updateUser = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || null,
          institution: data.institution || null,
          research_field: data.research_field || null,
          role: data.role,
          is_approved: data.is_approved,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bn-users'] });
      setEditingUser(null);
      toast({ title: "Utilisateur mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour l'utilisateur", variant: "destructive" });
    }
  });

  // Delete user
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bn-users'] });
      setDeletingUserId(null);
      toast({ title: "Utilisateur supprimé" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer l'utilisateur", variant: "destructive" });
    }
  });

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({ title: "Email de réinitialisation envoyé" });
    } catch (error: any) {
      toast({ 
        title: "Erreur", 
        description: "Impossible d'envoyer l'email de réinitialisation", 
        variant: "destructive" 
      });
    }
  };

  const onSubmitAdd = (data: any) => {
    createUser.mutate(data);
  };

  const onSubmitEdit = (data: any) => {
    if (editingUser) {
      updateUser.mutate({ ...data, id: editingUser.id, is_approved: editStatus === "true", role: editRole });
    }
  };

  // Reset edit values when opening edit dialog
  useEffect(() => {
    if (editingUser) {
      setEditStatus(editingUser.is_approved ? "true" : "false");
      setEditRole(editingUser.role || "visitor");
    }
  }, [editingUser]);

  const getRoleBadge = (role: string) => {
    const roleOption = ROLE_OPTIONS.find(r => r.value === role);
    return roleOption ? { label: roleOption.label, variant: roleOption.color as any } : { label: role, variant: 'outline' as any };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Comptes Utilisateurs</h2>
          <p className="text-muted-foreground">Création, modification et gestion des droits d'accès</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Utilisateurs</div>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Approuvés</div>
            <div className="text-2xl font-bold text-green-600">
              {users?.filter(u => u.is_approved).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">En Attente</div>
            <div className="text-2xl font-bold text-orange-600">
              {users?.filter(u => !u.is_approved).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Administrateurs</div>
            <div className="text-2xl font-bold text-red-600">
              {users?.filter(u => u.role === 'admin').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter un utilisateur
          </Button>
          <Button variant="outline" onClick={() => setShowBulkImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import en masse (Excel)
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter la liste
          </Button>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>Gérez les comptes et permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, prénom, institution..."
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
                  <TableHead>Institution</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-muted-foreground">{user.phone}</div>
                      )}
                    </TableCell>
                    <TableCell>{user.institution || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadge(user.role).variant}>
                        {getRoleBadge(user.role).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_approved ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Approuvé
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          En attente
                        </Badge>
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingUserId(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un Utilisateur</DialogTitle>
            <DialogDescription>Créer un nouveau compte utilisateur avec ses permissions</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prénom *</Label>
                <Input {...register("first_name", { required: true })} />
              </div>
              <div>
                <Label>Nom *</Label>
                <Input {...register("last_name", { required: true })} />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" {...register("email", { required: true })} />
            </div>
            <div>
              <Label>Mot de passe *</Label>
              <Input type="password" {...register("password", { required: true, minLength: 6 })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Téléphone</Label>
                <Input {...register("phone")} />
              </div>
              <div>
                <Label>Institution</Label>
                <Input {...register("institution")} />
              </div>
            </div>
            <div>
              <Label>Domaine de recherche</Label>
              <Input {...register("research_field")} />
            </div>
            <div>
              <Label>Rôle *</Label>
              <Select onValueChange={(value) => register("role").onChange({ target: { value } })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createUser.isPending}>
                {createUser.isPending ? "Création..." : "Créer l'utilisateur"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'Utilisateur</DialogTitle>
              <DialogDescription>Mettre à jour les informations et permissions</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prénom *</Label>
                  <Input defaultValue={editingUser.first_name} {...register("first_name", { required: true })} />
                </div>
                <div>
                  <Label>Nom *</Label>
                  <Input defaultValue={editingUser.last_name} {...register("last_name", { required: true })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Téléphone</Label>
                  <Input defaultValue={editingUser.phone || ''} {...register("phone")} />
                </div>
                <div>
                  <Label>Institution</Label>
                  <Input defaultValue={editingUser.institution || ''} {...register("institution")} />
                </div>
              </div>
              <div>
                <Label>Domaine de recherche</Label>
                <Input defaultValue={editingUser.research_field || ''} {...register("research_field")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Label>Rôle *</Label>
                  <button
                    type="button"
                    onClick={() => setEditRoleOpen(!editRoleOpen)}
                    className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <span>{ROLE_OPTIONS.find(r => r.value === editRole)?.label || "Sélectionner"}</span>
                    <svg className={`w-4 h-4 text-muted-foreground transition-transform ${editRoleOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {editRoleOpen && (
                    <ul className="absolute bottom-full left-0 right-0 mb-1 bg-background border border-border rounded-md shadow-lg z-[100] max-h-60 overflow-y-auto">
                      {ROLE_OPTIONS.map(role => (
                        <li
                          key={role.value}
                          onClick={() => { setEditRole(role.value); setEditRoleOpen(false); }}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent ${editRole === role.value ? "bg-accent/50 font-medium" : ""}`}
                        >
                          {role.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="relative">
                  <Label>Statut</Label>
                  <button
                    type="button"
                    onClick={() => setEditStatusOpen(!editStatusOpen)}
                    className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <span>{editStatus === "true" ? "Approuvé" : "En attente"}</span>
                    <svg className={`w-4 h-4 text-muted-foreground transition-transform ${editStatusOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {editStatusOpen && (
                    <ul className="absolute bottom-full left-0 right-0 mb-1 bg-background border border-border rounded-md shadow-lg z-[100]">
                      <li
                        onClick={() => { setEditStatus("true"); setEditStatusOpen(false); }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent ${editStatus === "true" ? "bg-accent/50 font-medium" : ""}`}
                      >
                        Approuvé
                      </li>
                      <li
                        onClick={() => { setEditStatus("false"); setEditStatusOpen(false); }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-accent ${editStatus === "false" ? "bg-accent/50 font-medium" : ""}`}
                      >
                        En attente
                      </li>
                    </ul>
                  )}
                </div>
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingUserId && deleteUser.mutate(deletingUserId)}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Import Dialog */}
      <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import en Masse</DialogTitle>
            <DialogDescription>
              Importez plusieurs utilisateurs depuis un fichier Excel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Glissez-déposez un fichier Excel ou cliquez pour sélectionner
              </p>
              <Input type="file" accept=".xlsx,.xls" className="max-w-xs mx-auto" />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Format requis :</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Prénom, Nom, Email (requis)</li>
                <li>Téléphone, Institution, Rôle (optionnel)</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkImportDialog(false)}>
              Annuler
            </Button>
            <Button>
              Importer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
