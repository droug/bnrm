import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, User, Calendar, AlertTriangle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WatermarkContainer } from "@/components/ui/watermark";
import { AdminHeader } from "@/components/AdminHeader";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ServiceRegistration {
  id: string;
  user_id: string;
  service_id: string;
  tariff_id: string | null;
  status: string;
  is_paid: boolean;
  registration_data: any;
  rejection_reason?: string | null;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at: string;
  updated_at: string;
  subscription_id: string;
  bnrm_services: {
    nom_service: string;
    categorie: string;
  };
  bnrm_tarifs: {
    montant: number;
    devise: string;
    periode_validite: string;
    condition_tarif?: string | null;
  } | null;
}

import { useSecureRoles } from "@/hooks/useSecureRoles";

export default function AccessRequestsManagement() {
  const { user } = useAuth();
  const { isAdmin, loading } = useSecureRoles();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState<ServiceRegistration[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ServiceRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRegistration | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<ServiceRegistration | null>(null);

  useEffect(() => {
    if (user && isAdmin && !loading) {
      fetchRequests();
    }
  }, [user, isAdmin, loading]);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, categoryFilter]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('service_registrations')
        .select(`
          *,
          bnrm_services (
            nom_service,
            categorie
          ),
          bnrm_tarifs (
            montant,
            devise,
            periode_validite
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(req => 
        req.registration_data.formuleType?.includes(categoryFilter) || 
        req.bnrm_tarifs?.condition_tarif?.includes(categoryFilter)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = async () => {
    if (!requestToApprove) return;

    try {
      const { error } = await supabase
        .from('service_registrations')
        .update({ 
          status: 'active',
          processed_by: user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', requestToApprove.id);

      if (error) throw error;

      toast({
        title: "Demande approuvée",
        description: "L'utilisateur a été notifié",
      });

      setApproveDialogOpen(false);
      setRequestToApprove(null);
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver la demande",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez fournir une raison du rejet",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('service_registrations')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectReason,
          processed_by: user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Demande rejetée",
        description: "L'utilisateur a été notifié",
      });

      setSelectedRequest(null);
      setRejectReason("");
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la demande",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "En attente", variant: "default" },
      active: { label: "Active", variant: "default" },
      rejected: { label: "Rejetée", variant: "destructive" },
      expired: { label: "Expirée", variant: "secondary" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const categoryLabels: Record<string, string> = {
      "Abonnements": "Abonnements",
      "Reproduction": "Reproduction",
      "Consultation": "Consultation",
    };
    return categoryLabels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const activeCount = requests.filter(r => r.status === 'active').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM - Gestion des Demandes", 
        variant: "subtle", 
        position: "pattern",
        opacity: 0.02
      }}
    >
      <div className="min-h-screen bg-background">
        <AdminHeader 
          title="Gestion des Demandes d'Abonnement"
          subtitle="Traiter et gérer toutes les demandes d'abonnement aux services BNRM"
        />

        <main className="container py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/admin/settings")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <div>
                  <h1 className="text-3xl font-bold">Demandes d'Abonnement</h1>
                  <p className="text-muted-foreground">
                    Gérer toutes les demandes d'abonnement aux services BNRM
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{requests.length}</div>
                  <p className="text-xs text-muted-foreground">Demandes totales</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En attente</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                  <p className="text-xs text-muted-foreground">À traiter</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Actives</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeCount}</div>
                  <p className="text-xs text-muted-foreground">Acceptées</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rejectedCount}</div>
                  <p className="text-xs text-muted-foreground">Refusées</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filtres</CardTitle>
                <CardDescription>Filtrer les demandes par statut et catégorie</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Statut</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="rejected">Rejetée</SelectItem>
                        <SelectItem value="expired">Expirée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Catégorie</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        <SelectItem value="Etudiants">Etudiants</SelectItem>
                        <SelectItem value="Grand public">Grand public</SelectItem>
                        <SelectItem value="Etudiants chercheurs">Etudiants chercheurs</SelectItem>
                        <SelectItem value="Chercheurs professionnels">Chercheurs professionnels</SelectItem>
                        <SelectItem value="Pass Jeunes">Pass Jeunes</SelectItem>
                        <SelectItem value="Duplicata de carte d'inscription">Duplicata de carte d'inscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests Table */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des demandes ({filteredRequests.length})</CardTitle>
                <CardDescription>Toutes les demandes d'abonnement</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Chargement...</div>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune demande</h3>
                    <p className="text-muted-foreground">
                      Aucune demande ne correspond aux critères sélectionnés
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Formule</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Région</TableHead>
                        <TableHead>Tarif</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: fr })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {request.registration_data.firstName} {request.registration_data.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {request.registration_data.email}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  CNIE: {request.registration_data.cnie}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{request.bnrm_services.nom_service}</div>
                            {request.registration_data.manuscriptTitle && (
                              <div className="text-xs text-muted-foreground">
                                Document: {request.registration_data.manuscriptTitle}
                              </div>
                            )}
                            {request.registration_data.pageCount && (
                              <div className="text-xs text-muted-foreground">
                                Pages: {request.registration_data.pageCount}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {request.registration_data.formuleType || request.bnrm_tarifs?.condition_tarif || "Non spécifié"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getCategoryLabel(request.bnrm_services.categorie)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {request.registration_data.region}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {request.registration_data.ville}
                            </div>
                          </TableCell>
                          <TableCell>
                            {request.bnrm_tarifs ? (
                              <div>
                                <div className="font-medium">
                                  {request.bnrm_tarifs.montant} {request.bnrm_tarifs.devise}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {request.bnrm_tarifs.periode_validite}
                                </div>
                              </div>
                            ) : (
                              <Badge variant="secondary">Gratuit</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog open={detailsDialogOpen && selectedRequest?.id === request.id} onOpenChange={(open) => {
                                setDetailsDialogOpen(open);
                                if (!open) setSelectedRequest(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setDetailsDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Détails
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Détails de la demande</DialogTitle>
                                    <DialogDescription>
                                      Informations complètes du demandeur
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                                        <p className="text-sm font-medium">{request.registration_data.firstName} {request.registration_data.lastName}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">CNIE</label>
                                        <p className="text-sm">{request.registration_data.cnie}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                        <p className="text-sm">{request.registration_data.email}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                                        <p className="text-sm">{request.registration_data.phone}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Région</label>
                                        <p className="text-sm">{request.registration_data.region}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Ville</label>
                                        <p className="text-sm">{request.registration_data.ville}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Service</label>
                                        <p className="text-sm font-medium">{request.bnrm_services.nom_service}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Formule</label>
                                        <p className="text-sm font-medium">{request.registration_data.formuleType || request.bnrm_tarifs?.condition_tarif || "Non spécifié"}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Catégorie</label>
                                        <p className="text-sm">{getCategoryLabel(request.bnrm_services.categorie)}</p>
                                      </div>
                                      {request.registration_data.manuscriptTitle && (
                                        <div className="col-span-2">
                                          <label className="text-sm font-medium text-muted-foreground">Document</label>
                                          <p className="text-sm">{request.registration_data.manuscriptTitle}</p>
                                        </div>
                                      )}
                                      {request.registration_data.pageCount && (
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Nombre de pages</label>
                                          <p className="text-sm">{request.registration_data.pageCount}</p>
                                        </div>
                                      )}
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Date de demande</label>
                                        <p className="text-sm">{format(new Date(request.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Statut</label>
                                        <div className="mt-1">{getStatusBadge(request.status)}</div>
                                      </div>
                                      {request.bnrm_tarifs && (
                                        <div>
                                          <label className="text-sm font-medium text-muted-foreground">Tarif</label>
                                          <p className="text-sm font-medium">{request.bnrm_tarifs.montant} {request.bnrm_tarifs.devise}</p>
                                          <p className="text-xs text-muted-foreground">{request.bnrm_tarifs.periode_validite}</p>
                                        </div>
                                      )}
                                      {request.rejection_reason && (
                                        <div className="col-span-2">
                                          <label className="text-sm font-medium text-muted-foreground">Motif du rejet</label>
                                          <p className="text-sm text-destructive">{request.rejection_reason}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {request.status === 'pending' && (
                                <>
                                  <AlertDialog open={approveDialogOpen && requestToApprove?.id === request.id} onOpenChange={(open) => {
                                    setApproveDialogOpen(open);
                                    if (!open) setRequestToApprove(null);
                                  }}>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => {
                                          setRequestToApprove(request);
                                          setApproveDialogOpen(true);
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approuver
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Approuver la demande</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Êtes-vous sûr de vouloir approuver cette demande d'abonnement pour {request.registration_data.firstName} {request.registration_data.lastName} ?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleApprove}>
                                          Confirmer l'approbation
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setSelectedRequest(request)}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Rejeter
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Rejeter la demande</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Veuillez indiquer la raison du rejet de cette demande pour {request.registration_data.firstName} {request.registration_data.lastName}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <Textarea
                                        placeholder="Raison du rejet (obligatoire)..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        className="min-h-[100px]"
                                      />
                                      <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => {
                                          setSelectedRequest(null);
                                          setRejectReason("");
                                        }}>
                                          Annuler
                                        </AlertDialogCancel>
                                        <AlertDialogAction onClick={handleReject}>
                                          Confirmer le rejet
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </div>
                            {request.status === 'rejected' && request.rejection_reason && (
                              <div className="text-xs text-muted-foreground mt-2">
                                <span className="font-medium">Motif:</span> {request.rejection_reason}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </WatermarkContainer>
  );
}
