import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Search } from "lucide-react";
import { CustomDialog, CustomDialogContent, CustomDialogHeader, CustomDialogTitle, CustomDialogClose } from "@/components/ui/custom-portal-dialog";

interface Professional {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  institution: string;
  role: string;
  is_approved: boolean;
  created_at: string;
}

export function ProfessionalsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  const { data: professionals, isLoading } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["editor", "printer", "producer"]);

      if (rolesError) throw rolesError;

      const userIds = userRoles?.map(r => r.user_id) || [];

      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;
      
      const users = usersData?.users || [];

      return (profiles || []).map(profile => {
        const userRole = userRoles?.find(r => r.user_id === profile.user_id);
        const authUser = users.find((u: any) => u.id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role || "unknown",
          email: authUser?.email || "",
        };
      });
    },
  });

  const filteredProfessionals = professionals?.filter(prof => {
    const matchesSearch = 
      prof.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.institution?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || prof.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "approved" && prof.is_approved) ||
      (statusFilter === "pending" && !prof.is_approved);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      editor: { label: "Éditeur", variant: "default" },
      printer: { label: "Imprimeur", variant: "secondary" },
      producer: { label: "Producteur", variant: "outline" },
    };
    const roleInfo = roleMap[role] || { label: role, variant: "outline" as const };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Professionnels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="editor">Éditeur</SelectItem>
                <SelectItem value="printer">Imprimeur</SelectItem>
                <SelectItem value="producer">Producteur</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="approved">Approuvés</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfessionals?.map((prof) => (
                  <TableRow key={prof.user_id}>
                    <TableCell>{`${prof.first_name} ${prof.last_name}`}</TableCell>
                    <TableCell>{prof.email}</TableCell>
                    <TableCell>{prof.institution || "-"}</TableCell>
                    <TableCell>{getRoleBadge(prof.role)}</TableCell>
                    <TableCell>
                      <Badge variant={prof.is_approved ? "default" : "secondary"}>
                        {prof.is_approved ? "Approuvé" : "En attente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProfessional(prof)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Visualiser
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProfessionals?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun professionnel trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modale de visualisation */}
      <CustomDialog open={!!selectedProfessional} onOpenChange={() => setSelectedProfessional(null)}>
        <CustomDialogContent className="max-w-2xl">
          <CustomDialogClose onClose={() => setSelectedProfessional(null)} />
          <CustomDialogHeader>
            <CustomDialogTitle>Détails du Professionnel</CustomDialogTitle>
          </CustomDialogHeader>
          
          {selectedProfessional && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                  <p className="text-base font-medium">
                    {selectedProfessional.first_name} {selectedProfessional.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rôle</p>
                  <div className="mt-1">{getRoleBadge(selectedProfessional.role)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{selectedProfessional.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                  <p className="text-base">{selectedProfessional.phone || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Institution</p>
                  <p className="text-base">{selectedProfessional.institution || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <div className="mt-1">
                    <Badge variant={selectedProfessional.is_approved ? "default" : "secondary"}>
                      {selectedProfessional.is_approved ? "Approuvé" : "En attente"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date d'inscription</p>
                  <p className="text-base">
                    {new Date(selectedProfessional.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CustomDialogContent>
      </CustomDialog>
    </>
  );
}
