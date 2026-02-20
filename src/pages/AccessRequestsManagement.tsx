import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, User, Calendar, AlertTriangle, Eye, Ban, Trash2, Send, CreditCard, BadgeCheck, Gift, Download, ExternalLink, Phone, Mail, MapPin, Building, BookOpen, Hash, Info, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WatermarkContainer } from "@/components/ui/watermark";
import { AdminHeader } from "@/components/AdminHeader";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useSecureRoles } from "@/hooks/useSecureRoles";

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

export default function AccessRequestsManagement() {
  const { user } = useAuth();
  const { isAdmin, isComptable, loading } = useSecureRoles();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState<ServiceRegistration[]>([]);
  const [freeServiceIds, setFreeServiceIds] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRegistration | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<ServiceRegistration | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sendingPaymentEmail, setSendingPaymentEmail] = useState<string | null>(null);
  const itemsPerPage = 10;

  const canAccess = isAdmin || isComptable;

  useEffect(() => {
    if (user && canAccess && !loading) {
      fetchRequests();
    }
  }, [user, canAccess, loading]);

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
            periode_validite,
            condition_tarif
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRequests(data || []);
      
      // Fetch free service IDs
      const { data: freeServicesData } = await supabase
        .from('bnrm_services')
        .select('id_service')
        .eq('is_free', true);
      setFreeServiceIds((freeServicesData || []).map(s => s.id_service));

      const { data: subscriptionServices, error: servicesError } = await supabase
        .from('bnrm_services')
        .select('nom_service')
        .eq('categorie', 'Abonnement')
        .order('nom_service');
      
      if (servicesError) throw servicesError;
      
      const uniqueServices = subscriptionServices?.map(s => s.nom_service) || [];
      setServices(uniqueServices);
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

  const getFilteredRequests = (status: string | string[], freeOnly = false) => {
    const statuses = Array.isArray(status) ? status : [status];
    let filtered = requests.filter(r => statuses.includes(r.status));
    
    if (freeOnly) {
      filtered = filtered.filter(r => freeServiceIds.includes(r.service_id));
    } else {
      filtered = filtered.filter(r => !freeServiceIds.includes(r.service_id));
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(r => r.bnrm_services.nom_service === categoryFilter);
    }
    
    return filtered;
  };

  const getPaginatedRequests = (requestsList: ServiceRegistration[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return requestsList.slice(startIndex, endIndex);
  };

  const getTotalPages = (requestsList: ServiceRegistration[]) => {
    return Math.ceil(requestsList.length / itemsPerPage);
  };

  // Admin: envoyer email de paiement => status passe à payment_sent
  const handleSendPaymentEmail = async (request: ServiceRegistration) => {
    setSendingPaymentEmail(request.id);
    try {
      const montant = request.bnrm_tarifs?.montant ?? 0;
      const devise = request.bnrm_tarifs?.devise ?? 'DH';
      const serviceName = request.bnrm_services.nom_service;
      const recipientEmail = request.registration_data?.email;
      const recipientName = `${request.registration_data?.firstName || ''} ${request.registration_data?.lastName || ''}`.trim();

      if (!recipientEmail) {
        throw new Error("L'email du demandeur est introuvable");
      }

      // Invoke edge function to send payment email
      const { error: emailError } = await supabase.functions.invoke('send-payment-email', {
        body: {
          to: recipientEmail,
          recipientName,
          serviceName,
          montant,
          devise,
          registrationId: request.id,
        },
      });

      if (emailError) throw emailError;

      // Update status to payment_sent
      const { error: updateError } = await supabase
        .from('service_registrations')
        .update({
          status: 'payment_sent',
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Créer une notification in-app pour l'utilisateur
      await supabase.from('notifications').insert({
        user_id: request.user_id,
        type: 'payment',
        title: 'Instructions de paiement',
        message: `Les instructions de paiement pour le service "${serviceName}" (${montant} ${devise}) vous ont été envoyées par email.`,
        is_read: false,
        link: '/my-space?tab=payments',
        related_url: '/my-space?tab=payments',
        priority: 3,
        category: 'payment',
        module: 'bnrm',
      });

      toast({
        title: "Email de paiement envoyé",
        description: `Un email a été envoyé à ${recipientEmail} avec les instructions de paiement.`,
      });
      fetchRequests();
    } catch (error: any) {
      console.error('Error sending payment email:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email de paiement",
        variant: "destructive",
      });
    } finally {
      setSendingPaymentEmail(null);
    }
  };

  // Comptable: confirmer le paiement => status passe à paid
  const handleConfirmPayment = async (request: ServiceRegistration) => {
    try {
      const { error } = await supabase
        .from('service_registrations')
        .update({
          status: 'paid',
          is_paid: true,
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (error) throw error;

      // Créer une notification in-app pour l'utilisateur
      await supabase.from('notifications').insert({
        user_id: request.user_id,
        type: 'payment',
        title: 'Paiement confirmé',
        message: `Votre paiement pour le service "${request.bnrm_services.nom_service}" a été confirmé.`,
        is_read: false,
        link: '/my-space?tab=payments',
        related_url: '/my-space?tab=payments',
        priority: 3,
        category: 'payment',
        module: 'bnrm',
      });

      toast({
        title: "Paiement confirmé",
        description: `Le paiement de ${request.registration_data?.firstName} ${request.registration_data?.lastName} a été validé.`,
      });
      fetchRequests();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer le paiement",
        variant: "destructive",
      });
    }
  };

  // Admin: activer l'abonnement après paiement confirmé => status passe à active
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

  const handleDeactivate = async (request: ServiceRegistration) => {
    try {
      const { error } = await supabase
        .from('service_registrations')
        .update({
          status: 'expired',
          processed_by: user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: "Abonnement désactivé",
        description: `L'abonnement de ${request.registration_data?.firstName || ''} ${request.registration_data?.lastName || ''} a été désactivé.`,
      });
      fetchRequests();
    } catch (error) {
      console.error('Error deactivating:', error);
      toast({
        title: "Erreur",
        description: "Impossible de désactiver l'abonnement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async (request: ServiceRegistration) => {
    try {
      const { error: regError } = await supabase
        .from('service_registrations')
        .delete()
        .eq('id', request.id);

      if (regError) throw regError;

      const { error: fnError } = await supabase.functions.invoke('user-service', {
        body: { action: 'delete_professional', user_id: request.user_id },
      });

      if (fnError) {
        console.error('User deletion error (non-blocking):', fnError);
      }

      toast({
        title: "Compte supprimé",
        description: "Le compte et l'abonnement ont été supprimés.",
      });
      fetchRequests();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "En attente", variant: "default" },
      payment_sent: { label: "Paiement envoyé", variant: "outline" },
      paid: { label: "Payé", variant: "secondary" },
      active: { label: "Active", variant: "default" },
      rejected: { label: "Rejetée", variant: "destructive" },
      expired: { label: "Expirée", variant: "secondary" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderActionsForRequest = (request: ServiceRegistration) => {
    return (
      <div className="flex items-center justify-end gap-2">
        {/* Details button - always visible */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedRequest(request);
            setDetailsDialogOpen(true);
          }}
          title="Voir les détails"
        >
          <Eye className="h-4 w-4" />
        </Button>

        {/* PENDING: Admin can send payment email, approve directly (free), or reject */}
        {request.status === 'pending' && isAdmin && (
          <>
            {/* Send payment email button */}
            {request.bnrm_tarifs && request.bnrm_tarifs.montant > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Envoyer email de paiement"
                    disabled={sendingPaymentEmail === request.id}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Envoyer l'email de paiement</AlertDialogTitle>
                    <AlertDialogDescription>
                      Un email sera envoyé à <strong>{request.registration_data?.email}</strong> avec les instructions de paiement
                      pour le service <strong>{request.bnrm_services.nom_service}</strong> ({request.bnrm_tarifs?.montant} {request.bnrm_tarifs?.devise}).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleSendPaymentEmail(request)}>
                      Envoyer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Approve directly (for free services) */}
            {(!request.bnrm_tarifs || request.bnrm_tarifs.montant === 0) && (
              <AlertDialog open={approveDialogOpen && requestToApprove?.id === request.id} onOpenChange={(open) => {
                if (!open) {
                  setApproveDialogOpen(false);
                  setRequestToApprove(null);
                }
              }}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => {
                      setRequestToApprove(request);
                      setApproveDialogOpen(true);
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approuver la demande</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ce service est gratuit. Êtes-vous sûr de vouloir approuver directement cette demande ?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleApprove}>
                      Approuver
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Reject */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setSelectedRequest(request)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rejeter la demande</AlertDialogTitle>
                  <AlertDialogDescription>
                    Veuillez indiquer la raison du rejet
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Motif du rejet (obligatoire) ..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => {
                    setRejectReason("");
                    setSelectedRequest(null);
                  }}>
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReject}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Rejeter
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {/* PAYMENT TAB: Confirmer le paiement + Activer l'abonnement */}
        {(request.status === 'payment_sent' || request.status === 'paid') && (isComptable || isAdmin) && (
          <>
            {/* Confirmer le paiement */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={request.status === 'paid' 
                    ? "text-muted-foreground opacity-50" 
                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"}
                  title={request.status === 'paid' ? "Paiement déjà confirmé" : "Confirmer le paiement"}
                  disabled={request.status === 'paid'}
                >
                  <BadgeCheck className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer le paiement</AlertDialogTitle>
                  <AlertDialogDescription>
                    Confirmez-vous la réception du paiement de{" "}
                    <strong>{request.registration_data?.firstName} {request.registration_data?.lastName}</strong>{" "}
                    pour le service <strong>{request.bnrm_services.nom_service}</strong>
                    {request.bnrm_tarifs && ` (${request.bnrm_tarifs.montant} ${request.bnrm_tarifs.devise})`} ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleConfirmPayment(request)}>
                    Confirmer le paiement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Activer l'abonnement - disabled until payment confirmed */}
            <AlertDialog open={approveDialogOpen && requestToApprove?.id === request.id} onOpenChange={(open) => {
              if (!open) {
                setApproveDialogOpen(false);
                setRequestToApprove(null);
              }
            }}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={request.status === 'paid' 
                    ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" 
                    : "text-muted-foreground opacity-50"}
                  title={request.status === 'paid' ? "Activer l'abonnement" : "Veuillez d'abord confirmer le paiement"}
                  disabled={request.status !== 'paid'}
                  onClick={() => {
                    if (request.status === 'paid') {
                      setRequestToApprove(request);
                      setApproveDialogOpen(true);
                    }
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Activer l'abonnement</AlertDialogTitle>
                  <AlertDialogDescription>
                    Le paiement a été confirmé. Souhaitez-vous activer l'abonnement de{" "}
                    <strong>{request.registration_data?.firstName} {request.registration_data?.lastName}</strong> ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApprove}>
                    Activer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {/* ACTIVE: Deactivate and Delete */}
        {request.status === 'active' && isAdmin && (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  title="Désactiver l'abonnement"
                >
                  <Ban className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Désactiver l'abonnement</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir désactiver l'abonnement de{" "}
                    <strong>{request.registration_data?.firstName} {request.registration_data?.lastName}</strong> ?
                    L'utilisateur ne pourra plus accéder au service.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeactivate(request)}
                    className="bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Désactiver
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Supprimer le compte"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive">Supprimer le compte</AlertDialogTitle>
                  <AlertDialogDescription>
                    <span className="font-semibold text-destructive">Action irréversible.</span>{" "}
                    Le compte de <strong>{request.registration_data?.firstName} {request.registration_data?.lastName}</strong>{" "}
                    ({request.registration_data?.email}) sera définitivement supprimé ainsi que son abonnement.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteAccount(request)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    );
  };

  const renderRequestsTable = (requestsList: ServiceRegistration[]) => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            Chargement des demandes...
          </CardContent>
        </Card>
      );
    }

    if (requestsList.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            Aucune demande trouvée
          </CardContent>
        </Card>
      );
    }

    const paginatedList = getPaginatedRequests(requestsList);
    const totalPages = getTotalPages(requestsList);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Liste des Demandes</CardTitle>
          <CardDescription>{requestsList.length} demande(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <label className="text-sm font-medium">Catégorie</label>
            <Select value={categoryFilter} onValueChange={(value) => {
              setCategoryFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Tous les services" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="all">Tous les services</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Formule</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedList.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.bnrm_services.nom_service}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.bnrm_services.categorie}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {request.registration_data?.firstName} {request.registration_data?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.registration_data?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.bnrm_tarifs?.condition_tarif || 
                       request.registration_data?.formuleType || 
                       "Non spécifiée"}
                    </TableCell>
                    <TableCell>
                      {request.bnrm_tarifs ? (
                        <span className="font-medium">
                          {request.bnrm_tarifs.montant} {request.bnrm_tarifs.devise}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(request.created_at), "dd/MM/yyyy", { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderActionsForRequest(request)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!user || !canAccess) {
    return <Navigate to="/" replace />;
  }

  const pendingRequests = getFilteredRequests('pending');
  const paymentRequests = getFilteredRequests(['payment_sent', 'paid']);
  const activeRequests = getFilteredRequests('active');
  const rejectedRequests = getFilteredRequests('rejected');
  const freeRequests = [
    ...getFilteredRequests('pending', true),
    ...getFilteredRequests('active', true),
    ...getFilteredRequests('rejected', true),
  ];

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

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            setCurrentPage(1);
            setCategoryFilter("all");
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                En Attente ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Paiement ({paymentRequests.length})
              </TabsTrigger>
              <TabsTrigger value="free" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Gratuites ({freeRequests.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Actifs ({activeRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rejetés ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {renderRequestsTable(pendingRequests)}
            </TabsContent>

            <TabsContent value="payment">
              {renderRequestsTable(paymentRequests)}
            </TabsContent>

            <TabsContent value="active">
              {renderRequestsTable(activeRequests)}
            </TabsContent>

            <TabsContent value="rejected">
              {renderRequestsTable(rejectedRequests)}
            </TabsContent>

            <TabsContent value="free">
              {renderRequestsTable(freeRequests)}
            </TabsContent>
          </Tabs>
        </div>

        {/* Details Sheet - side panel */}
        <Sheet open={detailsDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setDetailsDialogOpen(false);
            setSelectedRequest(null);
          }
        }}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Détails de la demande
              </SheetTitle>
              <SheetDescription>
                Informations complètes sur la demande d'abonnement
              </SheetDescription>
            </SheetHeader>

            {selectedRequest && (
              <div className="space-y-5 mt-5 pb-6">

                {/* Statut */}
                <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Statut :</span>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Soumise le {format(new Date(selectedRequest.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                    </p>
                    {selectedRequest.processed_at && (
                      <p className="text-xs text-muted-foreground">
                        Traitée le {format(new Date(selectedRequest.processed_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Service */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> Service demandé
                  </h3>
                  <div className="bg-card border rounded-lg p-3 space-y-1">
                    <p className="font-semibold">{selectedRequest.bnrm_services.nom_service}</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.bnrm_services.categorie}</p>
                    {selectedRequest.bnrm_tarifs && (
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t">
                        <span className="text-base font-bold text-primary">
                          {selectedRequest.bnrm_tarifs.montant === 0 ? "Gratuit" : `${selectedRequest.bnrm_tarifs.montant} ${selectedRequest.bnrm_tarifs.devise}`}
                        </span>
                        <span className="text-xs text-muted-foreground">— {selectedRequest.bnrm_tarifs.periode_validite}</span>
                        {selectedRequest.bnrm_tarifs.condition_tarif && (
                          <Badge variant="outline" className="text-xs">{selectedRequest.bnrm_tarifs.condition_tarif}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Identité */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Identité du demandeur
                  </h3>
                  <div className="bg-card border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">
                        {selectedRequest.registration_data?.firstName} {selectedRequest.registration_data?.lastName}
                      </span>
                    </div>
                    {selectedRequest.registration_data?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm">{selectedRequest.registration_data.email}</span>
                      </div>
                    )}
                    {selectedRequest.registration_data?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm">{selectedRequest.registration_data.phone}</span>
                      </div>
                    )}
                    {selectedRequest.registration_data?.cin && (
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm">CIN : <strong>{selectedRequest.registration_data.cin}</strong></span>
                      </div>
                    )}
                    {(selectedRequest.registration_data?.address || selectedRequest.registration_data?.ville) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-sm">
                          {selectedRequest.registration_data?.address}
                          {selectedRequest.registration_data?.address && selectedRequest.registration_data?.ville && ", "}
                          {selectedRequest.registration_data?.ville}
                        </span>
                      </div>
                    )}
                    {selectedRequest.registration_data?.organization && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm">{selectedRequest.registration_data.organization}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Données complémentaires */}
                {(() => {
                  const excludedKeys = ['firstName', 'lastName', 'email', 'phone', 'cin', 'address', 'ville', 'organization', 'formuleType', 'attachments', 'files', 'documents'];
                  const extraData = Object.entries(selectedRequest.registration_data || {})
                    .filter(([key, val]) => !excludedKeys.includes(key) && val !== null && val !== undefined && val !== '' && typeof val !== 'object');
                  const hasFormule = !!selectedRequest.registration_data?.formuleType;
                  if (extraData.length === 0 && !hasFormule) return null;
                  const labelMap: Record<string, string> = {
                    birthDate: 'Date de naissance', birthPlace: 'Lieu de naissance',
                    nationality: 'Nationalité', profession: 'Profession',
                    institution: 'Établissement', domaine: 'Domaine',
                    specialite: 'Spécialité', niveau: 'Niveau',
                    typeLecteur: 'Type de lecteur', typeOrganisme: "Type d'organisme",
                    nbreExemplaires: 'Nb exemplaires', motif: 'Motif',
                    description: 'Description', region: 'Région', codePostal: 'Code postal',
                  };
                  return (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5" /> Informations complémentaires
                        </h3>
                        <div className="bg-card border rounded-lg p-3 space-y-1.5">
                          {hasFormule && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Formule</span>
                              <span className="font-medium">{selectedRequest.registration_data.formuleType}</span>
                            </div>
                          )}
                          {extraData.map(([key, val]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{labelMap[key] || key}</span>
                              <span className="font-medium text-right max-w-[60%]">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Pièces jointes */}
                {(() => {
                  const data = selectedRequest.registration_data || {};
                  const attachments: Array<{ name: string; url: string }> = [];
                  const attachmentKeys = ['attachments', 'files', 'documents', 'pieces_jointes', 'piecesJointes'];
                  for (const key of attachmentKeys) {
                    if (data[key]) {
                      if (Array.isArray(data[key])) {
                        data[key].forEach((item: any) => {
                          if (typeof item === 'string') attachments.push({ name: item.split('/').pop() || item, url: item });
                          else if (item?.url) attachments.push({ name: item.name || item.url.split('/').pop(), url: item.url });
                        });
                      } else if (typeof data[key] === 'string') {
                        attachments.push({ name: data[key].split('/').pop() || data[key], url: data[key] });
                      }
                    }
                  }
                  const urlKeyMap: Record<string, string> = {
                    photoUrl: 'Photo', cinUrl: 'CIN (scan)', carteEtudiantUrl: "Carte étudiant",
                    attestationUrl: 'Attestation', documentUrl: 'Document', fileUrl: 'Fichier',
                    photoPath: 'Photo', cinPath: 'CIN (scan)', scanUrl: 'Document scanné',
                  };
                  Object.entries(data).forEach(([key, val]) => {
                    if (typeof val === 'string' && (String(val).startsWith('http') || String(val).startsWith('/')) &&
                      (key.toLowerCase().includes('url') || key.toLowerCase().includes('file') || key.toLowerCase().includes('path') ||
                       key.toLowerCase().includes('doc') || key.toLowerCase().includes('piece') || key.toLowerCase().includes('photo') ||
                       key.toLowerCase().includes('carte') || key.toLowerCase().includes('scan'))) {
                      if (!attachments.find(a => a.url === val)) {
                        attachments.push({ name: urlKeyMap[key] || key, url: String(val) });
                      }
                    }
                  });

                  return (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" /> Pièces jointes
                          <Badge variant="secondary" className="ml-auto text-xs">{attachments.length}</Badge>
                        </h3>
                        {attachments.length === 0 ? (
                          <div className="bg-muted/30 border border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                            Aucune pièce jointe associée à cette demande
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {attachments.map((att, idx) => {
                              const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(att.url);
                              const isPdf = /\.pdf(\?|$)/i.test(att.url);
                              return (
                                <div key={idx} className="bg-card border rounded-lg overflow-hidden">
                                  {isImage && (
                                    <div className="bg-muted/30 p-2 border-b">
                                      <img src={att.url} alt={att.name} className="max-h-48 w-full object-contain rounded"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                  )}
                                  {isPdf && (
                                    <div className="bg-muted/30 p-1 border-b">
                                      <iframe src={att.url} title={att.name} className="w-full h-40 rounded" />
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between px-3 py-2 gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                      <span className="text-sm font-medium truncate">{att.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
                                        onClick={() => window.open(att.url, '_blank')} title="Visualiser">
                                        <ExternalLink className="h-3.5 w-3.5 mr-1" />Voir
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
                                        onClick={() => { const a = document.createElement('a'); a.href = att.url; a.download = att.name; a.target = '_blank'; a.click(); }}
                                        title="Télécharger">
                                        <Download className="h-3.5 w-3.5 mr-1" />DL
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Raison du rejet */}
                {selectedRequest.rejection_reason && (
                  <>
                    <Separator />
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <h3 className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1.5">Raison du rejet</h3>
                      <p className="text-sm">{selectedRequest.rejection_reason}</p>
                    </div>
                  </>
                )}

                {/* BOUTONS D'ACTION dans le Sheet — En attente & Gratuites */}
                {selectedRequest.status === 'pending' && isAdmin && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actions</h3>
                      <div className="flex flex-col gap-2">

                        {/* Valider directement si gratuit */}
                        {(!selectedRequest.bnrm_tarifs || selectedRequest.bnrm_tarifs.montant === 0) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Valider et activer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Valider la demande</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Souhaitez-vous valider et activer directement la demande de{" "}
                                  <strong>{selectedRequest.registration_data?.firstName} {selectedRequest.registration_data?.lastName}</strong> ?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    setRequestToApprove(selectedRequest);
                                    await handleApprove();
                                    setDetailsDialogOpen(false);
                                    setSelectedRequest(null);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  Valider
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {/* Envoyer email de paiement si payant */}
                        {selectedRequest.bnrm_tarifs && selectedRequest.bnrm_tarifs.montant > 0 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="w-full" variant="outline">
                                <Send className="h-4 w-4 mr-2" />
                                Envoyer instructions de paiement
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Envoyer l'email de paiement</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Un email sera envoyé à <strong>{selectedRequest.registration_data?.email}</strong> avec les instructions
                                  de paiement pour <strong>{selectedRequest.bnrm_services.nom_service}</strong> ({selectedRequest.bnrm_tarifs?.montant} {selectedRequest.bnrm_tarifs?.devise}).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => { handleSendPaymentEmail(selectedRequest); setDetailsDialogOpen(false); }}>
                                  Envoyer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        {/* Rejeter */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                              onClick={() => setRejectReason("")}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejeter la demande
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Rejeter la demande</AlertDialogTitle>
                              <AlertDialogDescription>
                                Veuillez indiquer la raison du rejet pour{" "}
                                <strong>{selectedRequest.registration_data?.firstName} {selectedRequest.registration_data?.lastName}</strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                              <Textarea placeholder="Motif du rejet (obligatoire) ..." value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)} className="min-h-[100px]" />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setRejectReason("")}>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => { await handleReject(); setDetailsDialogOpen(false); setSelectedRequest(null); }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Rejeter
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </WatermarkContainer>
  );
}
