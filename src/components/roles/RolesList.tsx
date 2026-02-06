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
import { Shield, MoreVertical, Edit, Trash, Users, Eye, UserCheck, Building2, Plus, Loader2, RefreshCw, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RoleEditorDialog } from "./RoleEditorDialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  users_count: number;
  permissions_count: number;
  is_system: boolean;
  role_type: 'internal' | 'external' | 'professional';
  category: string;
  source: 'enum' | 'dynamic';
}

// Mapping des rôles enum vers leurs métadonnées
const enumRoleMetadata: Record<string, { name: string; description: string; color: string; category: string; type: 'internal' | 'external' | 'professional' }> = {
  admin: { name: "Administrateur Système", description: "Accès complet au système", color: "bg-red-500", category: "administration", type: "internal" },
  librarian: { name: "Bibliothécaire", description: "Gestion de la bibliothèque et des catalogues", color: "bg-blue-500", category: "administration", type: "internal" },
  researcher: { name: "Chercheur", description: "Accès avancé pour la recherche académique", color: "bg-emerald-500", category: "user", type: "external" },
  visitor: { name: "Visiteur", description: "Accès en lecture seule", color: "bg-gray-400", category: "user", type: "external" },
  public_user: { name: "Grand Public", description: "Utilisateur inscrit avec accès de base", color: "bg-teal-500", category: "user", type: "external" },
  subscriber: { name: "Abonné Premium", description: "Accès premium aux ressources numériques", color: "bg-violet-500", category: "user", type: "external" },
  partner: { name: "Partenaire", description: "Institution ou organisation partenaire", color: "bg-amber-500", category: "user", type: "external" },
  producer: { name: "Producteur", description: "Producteur de contenus audiovisuels", color: "bg-orange-500", category: "professional", type: "professional" },
  editor: { name: "Éditeur", description: "Maison d'édition", color: "bg-purple-500", category: "professional", type: "professional" },
  printer: { name: "Imprimeur", description: "Imprimerie agréée", color: "bg-pink-500", category: "professional", type: "professional" },
  distributor: { name: "Distributeur", description: "Distributeur de livres", color: "bg-indigo-500", category: "professional", type: "professional" },
  author: { name: "Auteur", description: "Auteur/Écrivain", color: "bg-cyan-500", category: "professional", type: "professional" },
  dac: { name: "DAC", description: "Direction des Affaires Culturelles", color: "bg-rose-500", category: "administration", type: "internal" },
  comptable: { name: "Comptable", description: "Gestion financière", color: "bg-lime-500", category: "administration", type: "internal" },
  direction: { name: "Direction", description: "Direction BNRM", color: "bg-sky-500", category: "administration", type: "internal" },
  read_only: { name: "Lecture Seule", description: "Accès en lecture seule", color: "bg-slate-500", category: "internal", type: "internal" },
  validateur: { name: "Validateur DL", description: "Validation des demandes de dépôt légal en arbitrage", color: "bg-fuchsia-500", category: "administration", type: "internal" },
};

export function RolesList() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [roleTypeFilter, setRoleTypeFilter] = useState<'all' | 'internal' | 'external' | 'professional'>('all');

  // Fetch all roles from database
  const { data: roles = [], isLoading, refetch } = useQuery({
    queryKey: ['all-system-roles'],
    queryFn: async () => {
      // 1. Fetch enum roles with user counts
      const { data: userRolesData } = await supabase
        .from('user_roles')
        .select('role');

      // Count users per enum role
      const enumRoleCounts: Record<string, number> = {};
      userRolesData?.forEach(ur => {
        const role = ur.role as string;
        enumRoleCounts[role] = (enumRoleCounts[role] || 0) + 1;
      });

      // 2. Fetch dynamic system roles
      const { data: systemRoles } = await supabase
        .from('system_roles')
        .select('*')
        .eq('is_active', true);

      // 3. Fetch user system roles counts
      const { data: userSystemRoles } = await supabase
        .from('user_system_roles')
        .select('role_id')
        .eq('is_active', true);

      const dynamicRoleCounts: Record<string, number> = {};
      userSystemRoles?.forEach(usr => {
        dynamicRoleCounts[usr.role_id] = (dynamicRoleCounts[usr.role_id] || 0) + 1;
      });

      // Build combined roles list
      const allRoles: Role[] = [];

      // Add enum roles
      Object.entries(enumRoleMetadata).forEach(([code, meta]) => {
        allRoles.push({
          id: `enum-${code}`,
          code,
          name: meta.name,
          description: meta.description,
          color: meta.color,
          users_count: enumRoleCounts[code] || 0,
          permissions_count: 0, // Enum roles have implicit permissions
          is_system: true,
          role_type: meta.type,
          category: meta.category,
          source: 'enum',
        });
      });

      // Add dynamic system roles
      systemRoles?.forEach(sr => {
        // Check if this role already exists as enum (avoid duplicates)
        const existingEnum = allRoles.find(r => r.code === sr.role_code);
        if (existingEnum) {
          // Update the existing enum role with dynamic data
          existingEnum.permissions_count = (sr.permissions as string[] || []).length;
          return;
        }

        const categoryToType: Record<string, 'internal' | 'external' | 'professional'> = {
          'administration': 'internal',
          'internal': 'internal',
          'professional': 'professional',
          'user': 'external',
        };

        allRoles.push({
          id: sr.id,
          code: sr.role_code,
          name: sr.role_name,
          description: sr.description || '',
          color: getCategoryColor(sr.role_category),
          users_count: dynamicRoleCounts[sr.id] || 0,
          permissions_count: (sr.permissions as string[] || []).length,
          is_system: false,
          role_type: categoryToType[sr.role_category] || 'external',
          category: sr.role_category,
          source: 'dynamic',
        });
      });

      // Sort by category then name
      return allRoles.sort((a, b) => {
        const categoryOrder = ['administration', 'internal', 'professional', 'user'];
        const aOrder = categoryOrder.indexOf(a.category);
        const bOrder = categoryOrder.indexOf(b.category);
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.name.localeCompare(b.name, 'fr');
      });
    },
  });

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsEditorOpen(true);
  };

  const handleDelete = (role: Role) => {
    if (role.is_system || role.source === 'enum') {
      toast({ title: "Action non autorisée", description: "Les rôles système ne peuvent pas être supprimés", variant: "destructive" });
      return;
    }
    setRoleToDelete(role);
  };

  const confirmDelete = async () => {
    if (roleToDelete && roleToDelete.source === 'dynamic') {
      const { error } = await supabase
        .from('system_roles')
        .update({ is_active: false })
        .eq('id', roleToDelete.id);

      if (error) {
        toast({ title: "Erreur", description: "Impossible de supprimer le rôle", variant: "destructive" });
      } else {
        toast({ title: "Rôle supprimé", description: `Le rôle "${roleToDelete.name}" a été désactivé` });
        refetch();
      }
      setRoleToDelete(null);
    }
  };

  const handleSave = (updatedRole: Partial<Role>) => {
    toast({ title: "Rôle modifié", description: `Le rôle "${updatedRole.name}" a été mis à jour` });
    setIsEditorOpen(false);
    setSelectedRole(null);
    refetch();
  };

  const filteredRoles = roles.filter(role => {
    if (roleTypeFilter === 'all') return true;
    return role.role_type === roleTypeFilter;
  });

  const internalCount = roles.filter(r => r.role_type === 'internal').length;
  const externalCount = roles.filter(r => r.role_type === 'external').length;
  const professionalCount = roles.filter(r => r.role_type === 'professional').length;

  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-cyan-500/10 via-cyan-400/5 to-transparent border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <UserCheck className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Tous les Rôles du Système</CardTitle>
                  <CardDescription>
                    {roles.length} rôles configurés (enum + dynamiques)
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Actualiser
                </Button>
                <Button onClick={() => { setSelectedRole(null); setIsEditorOpen(true); }} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer un Rôle
                </Button>
              </div>
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { id: 'all', label: `Tous (${roles.length})`, icon: Shield, color: 'bg-primary' },
                { id: 'internal', label: `Internes (${internalCount})`, icon: Building2, color: 'bg-blue-500' },
                { id: 'professional', label: `Professionnels (${professionalCount})`, icon: Scale, color: 'bg-purple-500' },
                { id: 'external', label: `Externes (${externalCount})`, icon: Users, color: 'bg-green-500' },
              ].map((filter) => (
                <motion.button
                  key={filter.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRoleTypeFilter(filter.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    roleTypeFilter === filter.id
                      ? `${filter.color} text-white shadow-md`
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <filter.icon className="h-4 w-4" />
                  {filter.label}
                </motion.button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Rôle</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Utilisateurs</TableHead>
                  <TableHead className="text-center">Permissions</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role, index) => (
                  <motion.tr
                    key={role.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="group hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full shadow-sm", role.color)} />
                        <span className="font-semibold">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-xs">{role.code}</code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1">{role.description}</span>
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
                        <Badge 
                          variant="outline" 
                          className={cn(
                            role.role_type === 'internal' && 'bg-blue-50 text-blue-700 border-blue-200',
                            role.role_type === 'professional' && 'bg-purple-50 text-purple-700 border-purple-200',
                            role.role_type === 'external' && 'bg-green-50 text-green-700 border-green-200'
                          )}
                        >
                          {role.role_type === 'internal' ? 'Interne' : role.role_type === 'professional' ? 'Professionnel' : 'Externe'}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">{role.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={role.source === 'enum' ? "default" : "secondary"}>
                        {role.source === 'enum' ? "Système" : "Dynamique"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover z-50">
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
                          {!role.is_system && role.source === 'dynamic' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(role)} className="text-destructive">
                                <Trash className="h-4 w-4 mr-2" />
                                Désactiver
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>

            {filteredRoles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mb-4 opacity-50" />
                <p>Aucun rôle trouvé pour ce filtre</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <RoleEditorDialog open={isEditorOpen} onOpenChange={setIsEditorOpen} role={selectedRole} onSave={handleSave} />

      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la désactivation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir désactiver le rôle "{roleToDelete?.name}" ?
              Cette action affectera {roleToDelete?.users_count} utilisateur(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    administration: 'bg-red-500',
    internal: 'bg-blue-500',
    professional: 'bg-purple-500',
    user: 'bg-green-500',
  };
  return colors[category] || 'bg-gray-500';
}
