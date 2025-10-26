import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { 
  BookOpen, 
  Eye, 
  Check, 
  X, 
  Archive, 
  Download, 
  Search,
  Filter,
  TrendingUp,
  Users,
  FileText,
  Home,
  Clock,
  CheckCircle,
  XCircle,
  FolderArchive,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Reservation {
  id: string;
  document_id: string;
  document_title: string;
  document_author?: string;
  support_type: string;
  support_status: string;
  is_free_access: boolean;
  routed_to: string;
  statut: string;
  user_name: string;
  user_email: string;
  user_type?: string;
  requested_date?: string;
  motif?: string;
  comments?: string;
  created_at: string;
  processed_at?: string;
  reason_refus?: string;
  admin_comments?: string;
}

interface Stats {
  total: number;
  soumise: number;
  en_cours: number;
  validee: number;
  refusee: number;
  archivee: number;
}

export default function GestionReservationsOuvrages() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading } = useSecureRoles();
  const navigate = useNavigate();
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    soumise: 0,
    en_cours: 0,
    validee: 0,
    refusee: 0,
    archivee: 0
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [routeFilter, setRouteFilter] = useState<string>("all");
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRefuseDialog, setShowRefuseDialog] = useState(false);
  const [refuseReason, setRefuseReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin && !isLibrarian) {
      navigate("/");
      toast.error("Accès non autorisé");
    }
  }, [loading, isAdmin, isLibrarian, navigate]);

  useEffect(() => {
    if (isAdmin || isLibrarian) {
      fetchReservations();
    }
  }, [isAdmin, isLibrarian]);

  useEffect(() => {
    applyFilters();
  }, [reservations, searchTerm, statusFilter, routeFilter]);

  const fetchReservations = async () => {
    try {
      setIsLoadingData(true);
      const { data, error } = await supabase
        .from("reservations_ouvrages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReservations(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      console.error("Erreur lors du chargement des réservations:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoadingData(false);
    }
  };

  const calculateStats = (data: Reservation[]) => {
    const newStats: Stats = {
      total: data.length,
      soumise: data.filter(r => r.statut === "soumise").length,
      en_cours: data.filter(r => r.statut === "en_cours").length,
      validee: data.filter(r => r.statut === "validee").length,
      refusee: data.filter(r => r.statut === "refusee").length,
      archivee: data.filter(r => r.statut === "archivee").length,
    };
    setStats(newStats);
  };

  const applyFilters = () => {
    let filtered = [...reservations];

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.document_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.document_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.statut === statusFilter);
    }

    if (routeFilter !== "all") {
      filtered = filtered.filter(r => r.routed_to === routeFilter);
    }

    setFilteredReservations(filtered);
  };

  const handleValidate = async (reservation: Reservation) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("reservations_ouvrages")
        .update({
          statut: "validee",
          validated_by: user?.id,
          date_validation: new Date().toISOString(),
          processed_at: new Date().toISOString(),
          processed_by: user?.id
        })
        .eq("id", reservation.id);

      if (error) throw error;

      toast.success("Réservation validée avec succès");
      fetchReservations();
      setShowDetailDialog(false);
    } catch (error: any) {
      console.error("Erreur lors de la validation:", error);
      toast.error("Erreur lors de la validation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefuse = async () => {
    if (!selectedReservation || !refuseReason.trim()) {
      toast.error("Veuillez indiquer une raison du refus");
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("reservations_ouvrages")
        .update({
          statut: "refusee",
          refused_by: user?.id,
          date_refus: new Date().toISOString(),
          reason_refus: refuseReason,
          processed_at: new Date().toISOString(),
          processed_by: user?.id
        })
        .eq("id", selectedReservation.id);

      if (error) throw error;

      toast.success("Réservation refusée");
      fetchReservations();
      setShowRefuseDialog(false);
      setShowDetailDialog(false);
      setRefuseReason("");
    } catch (error: any) {
      console.error("Erreur lors du refus:", error);
      toast.error("Erreur lors du refus");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async (reservation: Reservation) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("reservations_ouvrages")
        .update({
          statut: "archivee",
          archived_by: user?.id,
          date_archivage: new Date().toISOString()
        })
        .eq("id", reservation.id);

      if (error) throw error;

      toast.success("Réservation archivée");
      fetchReservations();
      setShowDetailDialog(false);
    } catch (error: any) {
      console.error("Erreur lors de l'archivage:", error);
      toast.error("Erreur lors de l'archivage");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "validee": return "bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/20";
      case "refusee": return "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20";
      case "archivee": return "bg-muted/50 text-muted-foreground border-border hover:bg-muted/70";
      case "en_cours": return "bg-accent/10 text-accent border-accent/30 hover:bg-accent/20";
      default: return "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20";
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case "soumise": return "Soumise";
      case "en_cours": return "En cours";
      case "validee": return "Validée";
      case "refusee": return "Refusée";
      case "archivee": return "Archivée";
      default: return statut;
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-lg text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Accueil
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin/settings">Administration</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Gestion des Réservations</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary">Gestion des Réservations d'Ouvrages</h1>
          <p className="text-muted-foreground">
            Interface de gestion centralisée pour toutes les demandes de réservation
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-transparent opacity-50" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Toutes réservations</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-primary">Soumises</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-primary">{stats.soumise}</div>
              <p className="text-xs text-muted-foreground mt-1">À traiter</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-accent/30">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-md">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-accent">En cours</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-accent">{stats.en_cours}</div>
              <p className="text-xs text-muted-foreground mt-1">En traitement</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-green-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-green-700">Validées</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-green-700">{stats.validee}</div>
              <p className="text-xs text-muted-foreground mt-1">Approuvées</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-destructive/30">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-md">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-destructive">Refusées</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-destructive">{stats.refusee}</div>
              <p className="text-xs text-muted-foreground mt-1">Non approuvées</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/10 to-transparent" />
            <CardHeader className="pb-3 relative">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-md">
                  <Archive className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Archivées</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-muted-foreground">{stats.archivee}</div>
              <p className="text-xs text-muted-foreground mt-1">Traitées</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres et recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="soumise">Soumise</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="validee">Validée</SelectItem>
                  <SelectItem value="refusee">Refusée</SelectItem>
                  <SelectItem value="archivee">Archivée</SelectItem>
                </SelectContent>
              </Select>

              <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les routes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les routes</SelectItem>
                  <SelectItem value="bibliotheque_numerique">Bibliothèque Numérique</SelectItem>
                  <SelectItem value="responsable_support">Responsable Support</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setRouteFilter("all");
              }}>
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des réservations */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des réservations ({filteredReservations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° demande</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Demandeur</TableHead>
                    <TableHead>Type support</TableHead>
                    <TableHead>Date demande</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Routée vers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucune réservation trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-mono text-sm">
                          {reservation.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium max-w-xs truncate">
                          {reservation.document_title}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{reservation.user_name}</span>
                            <span className="text-sm text-muted-foreground">{reservation.user_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{reservation.support_type}</TableCell>
                        <TableCell>
                          {format(new Date(reservation.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(reservation.statut)}>
                            {getStatusLabel(reservation.statut)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {reservation.routed_to === "bibliotheque_numerique" ? "BN" : "Support"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setShowDetailDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {reservation.statut !== "validee" && reservation.statut !== "refusee" && reservation.statut !== "archivee" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-success"
                                  onClick={() => handleValidate(reservation)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedReservation(reservation);
                                    setShowRefuseDialog(true);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {(reservation.statut === "validee" || reservation.statut === "refusee") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleArchive(reservation)}
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialogue détail */}
      {selectedReservation && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de la réservation</DialogTitle>
              <DialogDescription>
                N° {selectedReservation.id.slice(0, 8)}...
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Informations sur l'ouvrage */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Informations sur l'ouvrage
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Titre:</span>
                    <span className="font-medium">{selectedReservation.document_title}</span>
                  </div>
                  {selectedReservation.document_author && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Auteur:</span>
                      <span>{selectedReservation.document_author}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Type de support:</span>
                    <span>{selectedReservation.support_type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Statut du support:</span>
                    <Badge variant="outline">
                      {selectedReservation.support_status === "numerise" ? "Numérisé" : "Non numérisé"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Informations sur le demandeur */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Informations sur le demandeur
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Nom:</span>
                    <span className="font-medium">{selectedReservation.user_name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{selectedReservation.user_email}</span>
                  </div>
                  {selectedReservation.user_type && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{selectedReservation.user_type}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Détails de la demande */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Détails de la demande
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Date de demande:</span>
                    <span>{format(new Date(selectedReservation.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}</span>
                  </div>
                  {selectedReservation.requested_date && (
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-muted-foreground">Date souhaitée:</span>
                      <span>{format(new Date(selectedReservation.requested_date), "dd/MM/yyyy", { locale: fr })}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Statut:</span>
                    <Badge variant="outline" className={getStatusColor(selectedReservation.statut)}>
                      {getStatusLabel(selectedReservation.statut)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">Routée vers:</span>
                    <Badge variant="outline">
                      {selectedReservation.routed_to === "bibliotheque_numerique" ? "Bibliothèque Numérique" : "Responsable Support"}
                    </Badge>
                  </div>
                  {selectedReservation.motif && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Motif:</span>
                      <p className="mt-1 p-2 bg-muted rounded">{selectedReservation.motif}</p>
                    </div>
                  )}
                  {selectedReservation.comments && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Commentaires:</span>
                      <p className="mt-1 p-2 bg-muted rounded">{selectedReservation.comments}</p>
                    </div>
                  )}
                  {selectedReservation.reason_refus && (
                    <div className="col-span-2">
                      <span className="text-destructive font-medium">Raison du refus:</span>
                      <p className="mt-1 p-2 bg-destructive/10 rounded">{selectedReservation.reason_refus}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Fermer
              </Button>
              {selectedReservation.statut !== "validee" && selectedReservation.statut !== "refusee" && selectedReservation.statut !== "archivee" && (
                <>
                  <Button
                    variant="outline"
                    className="text-destructive"
                    onClick={() => {
                      setShowDetailDialog(false);
                      setShowRefuseDialog(true);
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Refuser
                  </Button>
                  <Button
                    onClick={() => handleValidate(selectedReservation)}
                    disabled={isProcessing}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Valider
                  </Button>
                </>
              )}
              {(selectedReservation.statut === "validee" || selectedReservation.statut === "refusee") && (
                <Button
                  variant="outline"
                  onClick={() => handleArchive(selectedReservation)}
                  disabled={isProcessing}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archiver
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialogue de refus */}
      <Dialog open={showRefuseDialog} onOpenChange={setShowRefuseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la réservation</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du refus. Cette information sera communiquée au demandeur.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Raison du refus..."
              value={refuseReason}
              onChange={(e) => setRefuseReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRefuseDialog(false);
                setRefuseReason("");
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefuse}
              disabled={!refuseReason.trim() || isProcessing}
            >
              <X className="mr-2 h-4 w-4" />
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
