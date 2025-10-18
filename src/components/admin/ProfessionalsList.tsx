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
import { Eye, Search, FileDown, Database } from "lucide-react";
import { CustomDialog, CustomDialogContent, CustomDialogHeader, CustomDialogTitle, CustomDialogClose } from "@/components/ui/custom-portal-dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

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
  registration_data?: any;
}

export function ProfessionalsList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showInjectDialog, setShowInjectDialog] = useState(false);
  const [selectedRoleToInject, setSelectedRoleToInject] = useState<string>("");

  // Récupérer tous les rôles professionnels disponibles
  const { data: availableRoles } = useQuery({
    queryKey: ["professional-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .in("role", ["editor", "printer", "producer", "distributor", "author"]);
      
      if (error) throw error;
      
      // Extraire les rôles uniques
      const uniqueRoles = [...new Set(data?.map(r => r.role) || [])];
      return uniqueRoles;
    },
  });

  const { data: professionals, isLoading, refetch } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["editor", "printer", "producer", "distributor", "author"]);

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

      // Récupérer les données d'inscription
      const { data: registrations } = await supabase
        .from("professional_registration_requests")
        .select("*")
        .in("user_id", userIds)
        .eq("status", "approved");

      return (profiles || []).map(profile => {
        const userRole = userRoles?.find(r => r.user_id === profile.user_id);
        const authUser = users.find((u: any) => u.id === profile.user_id);
        const registration = registrations?.find(r => r.user_id === profile.user_id);
        
        return {
          ...profile,
          role: userRole?.role || "unknown",
          email: authUser?.email || "",
          registration_data: registration?.registration_data,
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
      distributor: { label: "Distributeur", variant: "outline" },
      producer: { label: "Producteur", variant: "default" },
      author: { label: "Auteur", variant: "secondary" },
    };
    const roleInfo = roleMap[role] || { label: role, variant: "outline" as const };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      editor: "Éditeur",
      printer: "Imprimeur",
      distributor: "Distributeur",
      producer: "Producteur",
      author: "Auteur",
    };
    return labels[role] || role;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Liste des Professionnels", 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);
    doc.text(`Total: ${filteredProfessionals?.length || 0} professionnels`, 14, 34);

    const tableData = filteredProfessionals?.map(prof => [
      `${prof.first_name} ${prof.last_name}`,
      prof.email,
      prof.institution || "-",
      getRoleLabel(prof.role),
      prof.is_approved ? "Approuvé" : "En attente",
      new Date(prof.created_at).toLocaleDateString("fr-FR"),
    ]) || [];

    autoTable(doc, {
      startY: 40,
      head: [["Nom", "Email", "Institution", "Rôle", "Statut", "Date"]],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [139, 27, 27] },
    });

    doc.save(`professionnels_${new Date().getTime()}.pdf`);
    
    toast({
      title: "Export réussi",
      description: "Le PDF a été téléchargé avec succès",
      className: "bg-green-50 border-green-200",
    });
  };

  const handleExportExcel = () => {
    const excelData = filteredProfessionals?.map(prof => ({
      Nom: `${prof.first_name} ${prof.last_name}`,
      Email: prof.email,
      Téléphone: prof.phone || "-",
      Institution: prof.institution || "-",
      Rôle: getRoleLabel(prof.role),
      Statut: prof.is_approved ? "Approuvé" : "En attente",
      "Date d'inscription": new Date(prof.created_at).toLocaleDateString("fr-FR"),
    })) || [];

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Professionnels");
    
    XLSX.writeFile(wb, `professionnels_${new Date().getTime()}.xlsx`);

    toast({
      title: "Export réussi",
      description: "Le fichier Excel a été téléchargé avec succès",
      className: "bg-green-50 border-green-200",
    });
  };

  const handleInjectData = async () => {
    try {
      console.log('🔧 Injection des données pour le rôle:', selectedRoleToInject);
      
      const { data, error } = await supabase.functions.invoke('inject-professional-data', {
        body: { role: selectedRoleToInject }
      });

      console.log('📊 Réponse de la fonction:', { data, error });

      if (error) {
        console.error('❌ Erreur lors de l\'injection:', error);
        throw error;
      }

      toast({
        title: "Injection réussie",
        description: `${data.count || 0} professionnels de type "${getRoleLabel(selectedRoleToInject)}" ont été créés`,
        className: "bg-green-50 border-green-200",
      });

      setShowInjectDialog(false);
      setSelectedRoleToInject("");
      refetch();
    } catch (error: any) {
      console.error('💥 Erreur complète:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'injecter les données",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des Professionnels</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={!filteredProfessionals || filteredProfessionals.length === 0}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={!filteredProfessionals || filteredProfessionals.length === 0}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInjectDialog(true)}
              >
                <Database className="mr-2 h-4 w-4" />
                Injecter données
              </Button>
              
            </div>
          </div>
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
                  <SelectItem value="distributor">Distributeur</SelectItem>
                  <SelectItem value="producer">Producteur</SelectItem>
                  <SelectItem value="author">Auteur</SelectItem>
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
        <CustomDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <CustomDialogClose onClose={() => setSelectedProfessional(null)} />
          <CustomDialogHeader>
            <CustomDialogTitle>Fiche Professionnelle Complète</CustomDialogTitle>
          </CustomDialogHeader>
          
          {selectedProfessional && (
            <div className="space-y-6 py-4">
              {/* Informations générales */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold border-b pb-2">Informations Générales</h3>
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

              {/* Informations spécifiques selon le rôle */}
              {selectedProfessional.registration_data && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Informations {selectedProfessional.role === 'editor' ? "de l'Éditeur" : 
                                  selectedProfessional.role === 'printer' ? "de l'Imprimeur" : 
                                  "du Producteur"}
                  </h3>

                  {/* Éditeur */}
                  {selectedProfessional.role === 'editor' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        <p className="text-base">
                          {selectedProfessional.registration_data.type === 'morale' ? 'Personne Morale' : 'Personne Physique'}
                        </p>
                      </div>
                      {selectedProfessional.registration_data.nameAr && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Nom (Arabe)</p>
                          <p className="text-base">{selectedProfessional.registration_data.nameAr}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.nameFr && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Nom (Français)</p>
                          <p className="text-base">{selectedProfessional.registration_data.nameFr}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.commerceRegistry && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Registre de Commerce</p>
                          <p className="text-base">{selectedProfessional.registration_data.commerceRegistry}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.contactPerson && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Personne de Contact</p>
                          <p className="text-base">{selectedProfessional.registration_data.contactPerson}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.cin && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">CIN</p>
                          <p className="text-base">{selectedProfessional.registration_data.cin}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.address && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                          <p className="text-base">{selectedProfessional.registration_data.address}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.region && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Région</p>
                          <p className="text-base">{selectedProfessional.registration_data.region}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.city && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Ville</p>
                          <p className="text-base">{selectedProfessional.registration_data.city}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Imprimeur */}
                  {selectedProfessional.role === 'printer' && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProfessional.registration_data.nameAr && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Nom (Arabe)</p>
                          <p className="text-base">{selectedProfessional.registration_data.nameAr}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.nameFr && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Nom (Français)</p>
                          <p className="text-base">{selectedProfessional.registration_data.nameFr}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.commerceRegistry && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Registre de Commerce</p>
                          <p className="text-base">{selectedProfessional.registration_data.commerceRegistry}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.contactPerson && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Personne de Contact</p>
                          <p className="text-base">{selectedProfessional.registration_data.contactPerson}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.address && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                          <p className="text-base">{selectedProfessional.registration_data.address}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.region && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Région</p>
                          <p className="text-base">{selectedProfessional.registration_data.region}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.city && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Ville</p>
                          <p className="text-base">{selectedProfessional.registration_data.city}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Producteur */}
                  {selectedProfessional.role === 'producer' && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProfessional.registration_data.companyName && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Nom de l'Entreprise</p>
                          <p className="text-base font-medium">{selectedProfessional.registration_data.companyName}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.companyRegistrationNumber && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">N° d'Enregistrement</p>
                          <p className="text-base">{selectedProfessional.registration_data.companyRegistrationNumber}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.taxIdentificationNumber && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Identifiant Fiscal</p>
                          <p className="text-base">{selectedProfessional.registration_data.taxIdentificationNumber}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.productionType && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Type de Production</p>
                          <p className="text-base">{selectedProfessional.registration_data.productionType}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.productionCapacity && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Capacité de Production</p>
                          <p className="text-base">{selectedProfessional.registration_data.productionCapacity}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.yearsOfExperience && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Années d'Expérience</p>
                          <p className="text-base">{selectedProfessional.registration_data.yearsOfExperience} ans</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.website && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Site Web</p>
                          <a href={selectedProfessional.registration_data.website} target="_blank" rel="noopener noreferrer" className="text-base text-primary hover:underline">
                            {selectedProfessional.registration_data.website}
                          </a>
                        </div>
                      )}
                      {selectedProfessional.registration_data.address && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                          <p className="text-base">{selectedProfessional.registration_data.address}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.city && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Ville</p>
                          <p className="text-base">{selectedProfessional.registration_data.city}</p>
                        </div>
                      )}
                      {selectedProfessional.registration_data.description && (
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Description</p>
                          <p className="text-base text-muted-foreground">{selectedProfessional.registration_data.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CustomDialogContent>
      </CustomDialog>

      {/* Dialogue d'injection de données */}
      <CustomDialog open={showInjectDialog} onOpenChange={setShowInjectDialog}>
        <CustomDialogContent>
          <CustomDialogClose onClose={() => setShowInjectDialog(false)} />
          <CustomDialogHeader>
            <CustomDialogTitle>Injecter des données professionnelles</CustomDialogTitle>
          </CustomDialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez le type de professionnel pour lequel vous souhaitez générer des données de test.
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de professionnel</label>
              <Select value={selectedRoleToInject} onValueChange={setSelectedRoleToInject}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Éditeur</SelectItem>
                  <SelectItem value="printer">Imprimeur</SelectItem>
                  <SelectItem value="distributor">Distributeur</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Les rôles disponibles sont synchronisés avec la configuration du système
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowInjectDialog(false);
                  setSelectedRoleToInject("");
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleInjectData}
                disabled={!selectedRoleToInject}
                className="bg-[#1976D2] hover:bg-[#1565C0] text-white"
              >
                <Database className="mr-2 h-4 w-4" />
                💾 Injecter
              </Button>
            </div>
          </div>
        </CustomDialogContent>
      </CustomDialog>
    </>
  );
}
