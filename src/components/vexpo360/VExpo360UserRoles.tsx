import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Trash2, Shield, Edit2, Crown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserRole {
  id: string;
  user_id: string;
  role: 'super_admin' | 'editor' | 'reviewer';
  assigned_at: string;
  user_email?: string;
}

const roleLabels: Record<string, { label: string; description: string; color: string }> = {
  super_admin: { 
    label: 'Super Admin', 
    description: 'Accès complet: gestion système, utilisateurs, paramètres',
    color: 'bg-red-500'
  },
  editor: { 
    label: 'Éditeur', 
    description: 'Création et modification des expositions, panoramas, œuvres',
    color: 'bg-blue-500'
  },
  reviewer: { 
    label: 'Réviseur', 
    description: 'Révision, approbation et publication des expositions',
    color: 'bg-amber-500'
  }
};

export default function VExpo360UserRoles() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState({
    email: '',
    role: 'editor' as 'super_admin' | 'editor' | 'reviewer'
  });

  // Fetch user roles with user emails
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['vexpo360-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vexpo_user_roles')
        .select('*')
        .order('assigned_at', { ascending: false });
      
      if (error) throw error;
      
      // Get user emails from auth.users via profiles
      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds);
      
      return data.map(role => ({
        ...role,
        user_email: profiles?.find(p => p.user_id === role.user_id)
          ? `${profiles.find(p => p.user_id === role.user_id)?.first_name || ''} ${profiles.find(p => p.user_id === role.user_id)?.last_name || ''}`
          : role.user_id
      })) as UserRole[];
    }
  });

  // Add role mutation
  const addRole = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // First, find user by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .ilike('first_name', `%${email}%`)
        .limit(1);
      
      if (profileError) throw profileError;
      
      if (!profiles || profiles.length === 0) {
        throw new Error('Utilisateur non trouvé. Vérifiez l\'email.');
      }
      
      const { error } = await supabase
        .from('vexpo_user_roles')
        .insert({
          user_id: profiles[0].user_id,
          role: role as 'super_admin' | 'editor' | 'reviewer',
          assigned_by: user?.id
        });
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Cet utilisateur a déjà ce rôle.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vexpo360-user-roles'] });
      toast({ title: "Rôle attribué avec succès" });
      setShowDialog(false);
      setNewRole({ email: '', role: 'editor' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erreur", 
        description: error.message || "Impossible d'attribuer le rôle", 
        variant: "destructive" 
      });
    }
  });

  // Delete role mutation
  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vexpo_user_roles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vexpo360-user-roles'] });
      toast({ title: "Rôle retiré" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de retirer le rôle", variant: "destructive" });
    }
  });

  const filteredRoles = userRoles?.filter(r => 
    r.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const config = roleLabels[role];
    if (!config) return <Badge variant="secondary">{role}</Badge>;
    
    return (
      <Badge className={`${config.color} text-white`}>
        {role === 'super_admin' && <Crown className="h-3 w-3 mr-1" />}
        {role === 'editor' && <Edit2 className="h-3 w-3 mr-1" />}
        {role === 'reviewer' && <Shield className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Matrice des Permissions</CardTitle>
          <CardDescription>Aperçu des droits par rôle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(roleLabels).map(([role, config]) => (
              <div key={role} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  {role === 'super_admin' && <Crown className="h-5 w-5 text-red-500" />}
                  {role === 'editor' && <Edit2 className="h-5 w-5 text-blue-500" />}
                  {role === 'reviewer' && <Shield className="h-5 w-5 text-amber-500" />}
                  <h3 className="font-semibold">{config.label}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Roles List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Utilisateurs et Rôles</CardTitle>
              <CardDescription>Gérez les accès au CMS Expositions 360°</CardDescription>
            </div>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Attribuer un rôle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredRoles && filteredRoles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Attribué le</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((userRole) => (
                  <TableRow key={userRole.id}>
                    <TableCell>
                      <p className="font-medium">{userRole.user_email}</p>
                      <p className="text-xs text-muted-foreground">{userRole.user_id}</p>
                    </TableCell>
                    <TableCell>{getRoleBadge(userRole.role)}</TableCell>
                    <TableCell>
                      {format(new Date(userRole.assigned_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setDeleteId(userRole.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun utilisateur avec un rôle CMS</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowDialog(true)}>
                Attribuer le premier rôle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Role Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attribuer un rôle</DialogTitle>
            <DialogDescription>
              Donnez accès au CMS Expositions 360° à un utilisateur
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nom de l'utilisateur</Label>
              <Input
                value={newRole.email}
                onChange={(e) => setNewRole({ ...newRole, email: e.target.value })}
                placeholder="Prénom de l'utilisateur..."
              />
              <p className="text-xs text-muted-foreground">
                Entrez le prénom de l'utilisateur enregistré dans le système
              </p>
            </div>

            <div className="space-y-2">
              <Label>Rôle</Label>
              <select
                value={newRole.role}
                onChange={(e) => setNewRole({ ...newRole, role: e.target.value as any })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="editor">Éditeur</option>
                <option value="reviewer">Réviseur</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <p className="text-sm text-muted-foreground">
                {roleLabels[newRole.role]?.description}
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => addRole.mutate(newRole)}
              disabled={!newRole.email || addRole.isPending}
            >
              {addRole.isPending ? 'Attribution...' : 'Attribuer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer le rôle ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'utilisateur n'aura plus accès au CMS Expositions 360°.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteRole.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
