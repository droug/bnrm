import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SimpleSelect } from "@/components/ui/simple-select";
import { User, Phone, Building, Calendar, Edit, UserCheck, UserX, Trash } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  institution: string;
  research_field: string;
  role: string;
  all_roles?: string[];
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  partner_organization?: string;
  subscription_type?: string;
  email?: string;
  account_status?: string;
}

interface RoleOption {
  value: string;
  label: string;
}

interface UserCategoryTableProps {
  users: Profile[];
  rolePermissions: Record<string, { name: string }>;
  availableRoleOptions: RoleOption[];
  onEditUser: (user: Profile) => void;
  onUpdateRole: (userId: string, newRole: string) => void;
  onUpdateApproval: (userId: string, isApproved: boolean) => void;
  onDeleteUser: (userId: string) => void;
  getRoleBadgeVariant: (role: string) => "default" | "secondary" | "destructive" | "outline";
  formatDate: (dateString: string) => string;
  emptyMessage?: string;
}

export function UserCategoryTable({
  users,
  rolePermissions,
  availableRoleOptions,
  onEditUser,
  onUpdateRole,
  onUpdateApproval,
  onDeleteUser,
  getRoleBadgeVariant,
  formatDate,
  emptyMessage = "Aucun utilisateur dans cette catégorie"
}: UserCategoryTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Utilisateur</TableHead>
            <TableHead className="min-w-[100px] hidden md:table-cell">Contact</TableHead>
            <TableHead className="min-w-[120px] hidden lg:table-cell">Institution</TableHead>
            <TableHead className="min-w-[160px]">Rôle(s)</TableHead>
            <TableHead className="min-w-[90px]">Statut</TableHead>
            <TableHead className="min-w-[120px] hidden md:table-cell">Inscription</TableHead>
            <TableHead className="min-w-[140px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((userProfile) => (
            <TableRow key={userProfile.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {userProfile.first_name} {userProfile.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userProfile.email || `ID: ${userProfile.id.slice(0, 8)}...`}
                    </div>
                    {userProfile.partner_organization && (
                      <div className="text-xs text-primary font-medium">
                        Partenaire: {userProfile.partner_organization}
                      </div>
                    )}
                    {userProfile.subscription_type && (
                      <div className="text-xs text-accent-foreground font-medium">
                        Abonnement: {userProfile.subscription_type}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {userProfile.phone && (
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-3 w-3" />
                    {userProfile.phone}
                  </div>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {userProfile.institution && (
                  <div className="flex items-center gap-1 text-sm truncate max-w-[200px]">
                    <Building className="h-3 w-3 flex-shrink-0" />
                    {userProfile.institution}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {userProfile.all_roles && userProfile.all_roles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {userProfile.all_roles.map((role: string) => (
                        <Badge 
                          key={role} 
                          variant={getRoleBadgeVariant(role)}
                          className="text-xs"
                        >
                          {rolePermissions[role]?.name || role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <Badge variant={getRoleBadgeVariant(userProfile.role)}>
                      {rolePermissions[userProfile.role]?.name || userProfile.role}
                    </Badge>
                  )}
                  <SimpleSelect
                    value={userProfile.role}
                    onChange={(newRole) => onUpdateRole(userProfile.id, newRole)}
                    options={availableRoleOptions}
                    className="w-full min-w-[180px] mt-1"
                  />
                </div>
              </TableCell>
              <TableCell>
                {(userProfile as any).account_status === 'deleted' ? (
                  <Badge variant="destructive">Supprimé</Badge>
                ) : (
                  <Badge variant={userProfile.is_approved ? "default" : "secondary"}>
                    {userProfile.is_approved ? "Approuvé" : "En attente"}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(userProfile.created_at)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1 sm:gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onEditUser(userProfile)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  {!userProfile.is_approved ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approuver l'utilisateur</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir approuver cet utilisateur ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onUpdateApproval(userProfile.id, true)}>
                            Approuver
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <UserX className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Révoquer l'approbation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir révoquer l'approbation ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onUpdateApproval(userProfile.id, false)}>
                            Révoquer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible et supprimera toutes les données associées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteUser(userProfile.user_id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
