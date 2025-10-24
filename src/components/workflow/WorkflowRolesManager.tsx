import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Shield, Calendar, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['user_role'];

interface UserWithRoles {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  roles: Array<{
    id: string;
    role: UserRole;
    granted_at: string;
    expires_at: string | null;
  }>;
}

export function WorkflowRolesManager() {
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("visitor");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const availableRoles: Array<{ value: UserRole; label: string; color: string }> = [
    { value: "admin", label: "Administrateur", color: "bg-red-500" },
    { value: "librarian", label: "Bibliothécaire", color: "bg-blue-500" },
    { value: "dac", label: "DAC", color: "bg-green-500" },
    { value: "comptable", label: "Comptable", color: "bg-yellow-500" },
    { value: "direction", label: "Direction", color: "bg-purple-500" },
    { value: "editor", label: "Éditeur", color: "bg-orange-500" },
    { value: "printer", label: "Imprimeur", color: "bg-pink-500" },
    { value: "producer", label: "Producteur", color: "bg-violet-500" },
    { value: "distributor", label: "Distributeur", color: "bg-rose-500" },
    { value: "researcher", label: "Chercheur", color: "bg-indigo-500" },
    { value: "partner", label: "Partenaire", color: "bg-teal-500" },
    { value: "subscriber", label: "Abonné", color: "bg-cyan-500" },
    { value: "public_user", label: "Utilisateur public", color: "bg-gray-500" },
    { value: "visitor", label: "Visiteur", color: "bg-slate-400" },
    { value: "read_only", label: "Lecture seule", color: "bg-slate-600" },
  ];

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name");

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles: UserWithRoles[] = profiles?.map(profile => ({
        ...profile,
        roles: userRoles?.filter(r => r.user_id === profile.user_id) || [],
      })) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error("Veuillez sélectionner un utilisateur et un rôle");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: selectedUser,
          role: selectedRole,
          granted_by: user?.id,
          expires_at: expiresAt || null,
        });

      if (error) throw error;

      toast.success("Rôle attribué avec succès");
      setIsDialogOpen(false);
      setSelectedUser("");
      setSelectedRole("visitor");
      setExpiresAt("");
      fetchUsers();
    } catch (error: any) {
      console.error("Error adding role:", error);
      toast.error(error.message || "Erreur lors de l'attribution du rôle");
    }
  };

  const handleRevokeRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast.success("Rôle révoqué avec succès");
      fetchUsers();
    } catch (error: any) {
      console.error("Error revoking role:", error);
      toast.error(error.message || "Erreur lors de la révocation du rôle");
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    return availableRoles.find(r => r.value === role)?.color || "bg-gray-500";
  };

  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    return (
      u.first_name.toLowerCase().includes(searchLower) ||
      u.last_name.toLowerCase().includes(searchLower)
    );
  });

  if (rolesLoading || loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion des Rôles Utilisateurs
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Attribuer un rôle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Attribuer un nouveau rôle</DialogTitle>
                  <DialogDescription>
                    Sélectionnez un utilisateur et le rôle à lui attribuer
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="user">Utilisateur</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger id="user">
                        <SelectValue placeholder="Sélectionnez un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(u => (
                          <SelectItem key={u.user_id} value={u.user_id}>
                            {u.first_name} {u.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expires">Date d'expiration (optionnel)</Label>
                    <Input
                      id="expires"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddRole}>Attribuer</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="space-y-3">
              {filteredUsers.map(user => (
                <Card key={user.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {user.first_name} {user.last_name}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {user.roles.length === 0 ? (
                            <Badge variant="outline" className="text-muted-foreground">
                              Aucun rôle
                            </Badge>
                          ) : (
                            user.roles.map(roleData => (
                              <div key={roleData.id} className="flex items-center gap-1">
                                <Badge className={getRoleBadgeColor(roleData.role)}>
                                  {availableRoles.find(r => r.value === roleData.role)?.label}
                                </Badge>
                                {roleData.expires_at && (
                                  <Badge variant="outline" className="text-xs">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Expire le {new Date(roleData.expires_at).toLocaleDateString()}
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleRevokeRole(roleData.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Aucun utilisateur trouvé
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
