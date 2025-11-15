import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, MoreVertical, Edit, Trash, Users, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RoleEditorDialog } from "./RoleEditorDialog";

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  users_count: number;
  permissions_count: number;
  is_system: boolean;
  role_type: 'internal' | 'external'; // internal = administration, external = usagers
}

export function RolesList() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [roleTypeFilter, setRoleTypeFilter] = useState<'all' | 'internal' | 'external'>('all');

  // Données de démonstration avec rôles internes et externes
  const [roles, setRoles] = useState<Role[]>([
    // === RÔLES INTERNES (ADMINISTRATION) ===
    {
      id: "1",
      name: "Administrateur Système",
      description: "Accès complet au système",
      color: "bg-red-500",
      users_count: 5,
      permissions_count: 120,
      is_system: true,
      role_type: 'internal',
    },
    {
      id: "2",
      name: "Bibliothécaire",
      description: "Gestion de la bibliothèque et des catalogues",
      color: "bg-blue-500",
      users_count: 12,
      permissions_count: 45,
      is_system: true,
      role_type: 'internal',
    },
    {
      id: "3",
      name: "Agent Inscription",
      description: "Gère les demandes d'inscription des usagers (étudiants, grand public, pass jeunes)",
      color: "bg-cyan-500",
      users_count: 6,
      permissions_count: 8,
      is_system: false,
      role_type: 'internal',
    },
    {
      id: "4",
      name: "Responsable Inscriptions",
      description: "Supervise et valide toutes les inscriptions",
      color: "bg-cyan-600",
      users_count: 3,
      permissions_count: 12,
      is_system: false,
      role_type: 'internal',
    },
    {
      id: "8",
      name: "Gestionnaire Adhésions",
      description: "Traite les demandes d'adhésion aux services avancés",
      color: "bg-indigo-500",
      users_count: 4,
      permissions_count: 10,
      is_system: false,
      role_type: 'internal',
    },
    {
      id: "9",
      name: "Responsable Adhésions",
      description: "Approuve les adhésions premium et chercheur",
      color: "bg-indigo-600",
      users_count: 2,
      permissions_count: 14,
      is_system: false,
      role_type: 'internal',
    },
    {
      id: "12",
      name: "Catalogueur",
      description: "Création et modification de notices catalographiques",
      color: "bg-green-500",
      users_count: 8,
      permissions_count: 25,
      is_system: false,
      role_type: 'internal',
    },
    {
      id: "13",
      name: "Éditeur de contenu",
      description: "Création et publication de contenu",
      color: "bg-purple-500",
      users_count: 15,
      permissions_count: 30,
      is_system: false,
      role_type: 'internal',
    },
    
    // === RÔLES EXTERNES (USAGERS) ===
    {
      id: "5",
      name: "Inscrit - Étudiant",
      description: "Étudiant inscrit avec accès aux services de lecture",
      color: "bg-teal-500",
      users_count: 150,
      permissions_count: 5,
      is_system: false,
      role_type: 'external',
    },
    {
      id: "6",
      name: "Inscrit - Grand Public",
      description: "Usager grand public avec accès de base",
      color: "bg-teal-600",
      users_count: 200,
      permissions_count: 4,
      is_system: false,
      role_type: 'external',
    },
    {
      id: "7",
      name: "Inscrit - Pass Jeunes",
      description: "Jeune bénéficiant du pass culture avec accès gratuit",
      color: "bg-teal-400",
      users_count: 80,
      permissions_count: 5,
      is_system: false,
      role_type: 'external',
    },
    {
      id: "10",
      name: "Adhérent Premium",
      description: "Adhérent avec accès premium aux ressources numériques",
      color: "bg-violet-500",
      users_count: 75,
      permissions_count: 15,
      is_system: false,
      role_type: 'external',
    },
    {
      id: "11",
      name: "Adhérent Chercheur",
      description: "Chercheur avec accès illimité aux ressources spécialisées",
      color: "bg-violet-600",
      users_count: 45,
      permissions_count: 18,
      is_system: false,
      role_type: 'external',
    },
    {
      id: "14",
      name: "Lecteur",
      description: "Consultation des ressources publiques",
      color: "bg-gray-500",
      users_count: 250,
      permissions_count: 10,
      is_system: true,
      role_type: 'external',
    },
  ]);

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsEditorOpen(true);
  };

  const handleDelete = (role: Role) => {
    if (role.is_system) {
      toast({
        title: "Action non autorisée",
        description: "Les rôles système ne peuvent pas être supprimés",
        variant: "destructive",
      });
      return;
    }
    setRoleToDelete(role);
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      setRoles(roles.filter(r => r.id !== roleToDelete.id));
      toast({
        title: "Rôle supprimé",
        description: `Le rôle "${roleToDelete.name}" a été supprimé avec succès`,
      });
      setRoleToDelete(null);
    }
  };

  const handleSave = (updatedRole: Partial<Role>) => {
    if (selectedRole) {
      // Mise à jour
      setRoles(roles.map(r => 
        r.id === selectedRole.id 
          ? { ...r, ...updatedRole }
          : r
      ));
      toast({
        title: "Rôle modifié",
        description: `Le rôle "${updatedRole.name}" a été mis à jour`,
      });
    } else {
      // Création
      const newRole: Role = {
        id: Date.now().toString(),
        name: updatedRole.name || "",
        description: updatedRole.description || "",
        color: updatedRole.color || "bg-gray-500",
        users_count: 0,
        permissions_count: 0,
        is_system: false,
        role_type: 'internal',
      };
      setRoles([...roles, newRole]);
      toast({
        title: "Rôle créé",
        description: `Le rôle "${newRole.name}" a été créé avec succès`,
      });
    }
    setIsEditorOpen(false);
    setSelectedRole(null);
  };

  // Filtrer les rôles selon le type
  const filteredRoles = roles.filter(role => {
    if (roleTypeFilter === 'all') return true;
    return role.role_type === roleTypeFilter;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rôles Système
              </CardTitle>
              <CardDescription>
                Gérez les rôles et leurs permissions associées
              </CardDescription>
            </div>
            <Button onClick={() => {
              setSelectedRole(null);
              setIsEditorOpen(true);
            }}>
              <Shield className="h-4 w-4 mr-2" />
              Créer un Rôle
            </Button>
          </div>
          
          {/* Filtres par type de rôle */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={roleTypeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleTypeFilter('all')}
            >
              Tous les rôles ({roles.length})
            </Button>
            <Button
              variant={roleTypeFilter === 'internal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleTypeFilter('internal')}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Rôles internes ({roles.filter(r => r.role_type === 'internal').length})
            </Button>
            <Button
              variant={roleTypeFilter === 'external' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleTypeFilter('external')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Rôles externes ({roles.filter(r => r.role_type === 'external').length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rôle</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Utilisateurs</TableHead>
                <TableHead className="text-center">Permissions</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${role.color}`} />
                      <div>
                        <div className="font-semibold">{role.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {role.description}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {role.users_count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {role.permissions_count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col gap-1 items-center">
                      <Badge variant={role.is_system ? "default" : "secondary"}>
                        {role.is_system ? "Système" : "Personnalisé"}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={role.role_type === 'internal' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}
                      >
                        {role.role_type === 'internal' ? 'Interne' : 'Externe'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(role)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir/Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(role)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Éditer les permissions
                        </DropdownMenuItem>
                        {!role.is_system && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(role)}
                              className="text-destructive"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RoleEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        role={selectedRole}
        onSave={handleSave}
      />

      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le rôle "{roleToDelete?.name}" ?
              Cette action est irréversible et affectera {roleToDelete?.users_count} utilisateur(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
