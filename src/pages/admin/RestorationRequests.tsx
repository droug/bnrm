import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertCircle, CheckCircle, XCircle, Clock, Wrench, Eye, Filter, ArrowLeft, 
  FileCheck, Package, CreditCard, Settings, RotateCcw, ChevronLeft, ChevronRight, DollarSign 
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WatermarkContainer } from "@/components/ui/watermark";
import { AdminHeader } from "@/components/AdminHeader";
import { useNavigate } from "react-router-dom";
import { RestorationWorkflowStepper } from "@/components/restoration/RestorationWorkflowStepper";
import { RestorationWorkflowDialog } from "@/components/restoration/RestorationWorkflowDialog";
import { SampleDataManager } from "@/components/admin/SampleDataManager";

interface RestorationRequest {
  id: string;
  request_number: string;
  manuscript_title: string;
  manuscript_cote: string;
  damage_description: string;
  urgency_level: string;
  status: string;
  submitted_at: string;
  user_id: string;
  user_notes?: string;
  rejection_reason?: string;
  validation_notes?: string;
  estimated_cost?: number;
  estimated_duration?: number;
  assigned_restorer?: string;
  quote_amount?: number;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export default function RestorationRequests() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<RestorationRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [currentActionType, setCurrentActionType] = useState<string>('director_approve');
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [alertThresholdDays, setAlertThresholdDays] = useState(7);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all restoration requests
  const { data: allRequests, isLoading } = useQuery({
    queryKey: ['restoration-requests-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restoration_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);

        // Map profiles to requests
        return data.map(request => ({
          ...request,
          profiles: profilesData?.find(p => p.user_id === request.user_id)
        })) as RestorationRequest[];
      }

      return data as RestorationRequest[];
    }
  });

  // Filter requests client-side
  const requests = allRequests?.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (urgencyFilter !== 'all' && r.urgency_level !== urgencyFilter) return false;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesNumber = r.request_number?.toLowerCase().includes(query);
      const matchesTitle = r.manuscript_title?.toLowerCase().includes(query);
      const matchesCote = r.manuscript_cote?.toLowerCase().includes(query);
      const matchesUser = `${r.profiles?.first_name} ${r.profiles?.last_name}`.toLowerCase().includes(query);
      
      if (!matchesNumber && !matchesTitle && !matchesCote && !matchesUser) return false;
    }
    
    return true;
  });

  //Update request status mutation
  const updateStatus = useMutation({
    mutationFn: async (updateData: any) => {
      const { error } = await supabase
        .from('restoration_requests')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updateData.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restoration-requests-admin'] });
      setWorkflowDialogOpen(false);
      setSelectedRequest(null);
      toast({ title: "Statut mis à jour avec succès" });
    },
    onError: () => {
      toast({ 
        title: "Erreur", 
        description: "Impossible de mettre à jour le statut", 
        variant: "destructive" 
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; color: string }> = {
      'soumise': { label: 'Soumise', variant: 'secondary', color: 'bg-gray-100 text-gray-800' },
      'en_attente_autorisation': { label: 'En attente d\'autorisation', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
      'autorisee': { label: 'Autorisée', variant: 'default', color: 'bg-green-100 text-green-800' },
      'refusee_direction': { label: 'Refusée Direction', variant: 'destructive', color: 'bg-red-100 text-red-800' },
      'oeuvre_recue': { label: 'Œuvre reçue', variant: 'default', color: 'bg-blue-100 text-blue-800' },
      'diagnostic_en_cours': { label: 'Diagnostic en cours', variant: 'default', color: 'bg-purple-100 text-purple-800' },
      'devis_en_attente': { label: 'Devis en attente', variant: 'secondary', color: 'bg-orange-100 text-orange-800' },
      'devis_accepte': { label: 'Devis accepté', variant: 'default', color: 'bg-teal-100 text-teal-800' },
      'devis_refuse': { label: 'Devis refusé', variant: 'destructive', color: 'bg-red-100 text-red-800' },
      'paiement_en_attente': { label: 'Paiement en attente', variant: 'secondary', color: 'bg-amber-100 text-amber-800' },
      'paiement_valide': { label: 'Paiement validé', variant: 'default', color: 'bg-green-100 text-green-800' },
      'restauration_en_cours': { label: 'Restauration en cours', variant: 'default', color: 'bg-indigo-100 text-indigo-800' },
      'terminee': { label: 'Terminée', variant: 'default', color: 'bg-emerald-100 text-emerald-800' },
      'cloturee': { label: 'Clôturée', variant: 'default', color: 'bg-slate-100 text-slate-800' },
      'annulee': { label: 'Annulée', variant: 'destructive', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || { label: status, variant: 'outline', color: 'bg-gray-100 text-gray-800' };
    return <Badge variant={config.variant} className={config.color}>{config.label}</Badge>;
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig: Record<string, { label: string; variant: any }> = {
      'faible': { label: 'Faible', variant: 'secondary' },
      'moyenne': { label: 'Moyenne', variant: 'default' },
      'elevee': { label: 'Élevée', variant: 'default' },
      'critique': { label: 'Critique', variant: 'destructive' }
    };

    const config = urgencyConfig[urgency] || { label: urgency, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isRequestDelayed = (request: RestorationRequest) => {
    const submittedDate = new Date(request.submitted_at);
    const daysSinceSubmission = Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceSubmission > alertThresholdDays && 
           !['terminee', 'cloturee', 'refusee_direction', 'devis_refuse', 'annulee'].includes(request.status);
  };

  const delayedRequests = requests?.filter(isRequestDelayed) || [];

  // Pagination
  const totalPages = Math.ceil((requests?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = requests?.slice(startIndex, endIndex) || [];

  // Reset to first page when filters change
  const handleFilterChange = (filterType: 'status' | 'urgency', value: string) => {
    setCurrentPage(1);
    if (filterType === 'status') {
      setStatusFilter(value);
    } else {
      setUrgencyFilter(value);
    }
  };

  // Stats
  const totalRequests = requests?.length || 0;
  const pendingRequests = requests?.filter(r => ['soumise', 'en_attente_autorisation', 'devis_en_attente'].includes(r.status)).length || 0;
  const inProgressRequests = requests?.filter(r => ['autorisee', 'oeuvre_recue', 'diagnostic_en_cours', 'devis_accepte', 'restauration_en_cours', 'terminee', 'paiement_en_attente', 'paiement_valide'].includes(r.status)).length || 0;
  const completedRequests = requests?.filter(r => ['cloturee'].includes(r.status)).length || 0;

  const handleWorkflowAction = (request: RestorationRequest, action: string) => {
    setSelectedRequest(request);
    setCurrentActionType(action);
    setWorkflowDialogOpen(true);
  };

  const sendNotification = async (actionType: string, additionalData?: any) => {
    if (!selectedRequest) return;

    const notificationTypeMap: Record<string, string> = {
      'director_approve': 'authorized',
      'director_reject': 'request_rejected',
      'receive_artwork': 'artwork_received',
      'send_quote': 'quote_sent',
      'accept_quote': 'quote_accepted',
      'reject_quote': 'quote_rejected',
      'validate_payment': 'payment_confirmed',
      'start_restoration': 'restoration_started',
      'complete_restoration': 'restoration_completed',
      'return_artwork': 'artwork_ready',
    };

    const notificationType = notificationTypeMap[actionType];
    if (!notificationType) return;

    try {
      // Récupérer l'email de l'utilisateur
      const { data: userData } = await supabase.auth.admin.getUserById(selectedRequest.user_id);
      if (!userData?.user?.email) return;

      await supabase.functions.invoke('send-restoration-notification', {
        body: {
          requestId: selectedRequest.id,
          recipientEmail: userData.user.email,
          recipientId: selectedRequest.user_id,
          notificationType,
          requestNumber: selectedRequest.request_number,
          manuscriptTitle: selectedRequest.manuscript_title,
          quoteAmount: selectedRequest.quote_amount,
          additionalInfo: additionalData?.notes || additionalData?.comment
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      // Ne pas bloquer le workflow si la notification échoue
    }
  };

  const handleWorkflowSubmit = async (actionType: string, data: any) => {
    if (!selectedRequest) return;

    try {
      let updateData: any = { id: selectedRequest.id };
      let notificationData: any = {};

      switch (actionType) {
        case 'director_approve':
          updateData.status = 'autorisee';
          updateData.director_approval_notes = data.notes;
          updateData.director_approval_at = new Date().toISOString();
          updateData.estimated_cost = data.estimatedCost ? parseFloat(data.estimatedCost) : null;
          updateData.estimated_duration = data.estimatedDuration ? parseInt(data.estimatedDuration) : null;
          notificationData.estimatedCost = data.estimatedCost;
          notificationData.estimatedDuration = data.estimatedDuration;
          break;
        case 'director_reject':
          updateData.status = 'refusee_direction';
          updateData.director_rejection_reason = data.notes;
          updateData.rejected_at = new Date().toISOString();
          notificationData.rejectionReason = data.notes;
          break;
        case 'receive_artwork':
          updateData.status = 'diagnostic_en_cours';
          updateData.artwork_received_at = new Date().toISOString();
          updateData.artwork_condition_at_reception = data.notes;
          notificationData.instructions = data.notes;
          break;
        case 'complete_diagnosis':
          updateData.status = 'devis_en_attente';
          updateData.diagnosis_report = data.diagnosisReport;
          updateData.conservation_state = data.conservationState;
          updateData.identified_damages = data.identifiedDamages;
          updateData.recommended_works = data.recommendedWorks;
          updateData.estimated_cost = data.estimatedCost ? parseFloat(data.estimatedCost) : null;
          updateData.estimated_duration = data.estimatedDuration ? parseInt(data.estimatedDuration) : null;
          updateData.required_materials = data.requiredMaterials;
          if (data.urgencyLevel && data.urgencyLevel !== '') {
            updateData.urgency_level = data.urgencyLevel;
          }
          updateData.diagnosis_completed_at = new Date().toISOString();
          break;
        case 'send_quote':
          updateData.status = 'devis_en_attente';
          updateData.quote_amount = data.quoteAmount ? parseFloat(data.quoteAmount) : null;
          updateData.quote_issued_at = new Date().toISOString();
          notificationData.quoteAmount = data.quoteAmount;
          break;
        case 'accept_quote':
          updateData.status = 'restauration_en_cours';
          updateData.quote_accepted_at = new Date().toISOString();
          updateData.restoration_started_at = new Date().toISOString();
          notificationData.quoteAmount = selectedRequest.quote_amount;
          notificationData.estimatedDuration = selectedRequest.estimated_duration;
          break;
        case 'reject_quote':
          updateData.status = 'devis_refuse';
          updateData.quote_rejection_reason = data.notes;
          updateData.quote_rejected_at = new Date().toISOString();
          notificationData.quoteAmount = selectedRequest.quote_amount;
          notificationData.rejectionReason = data.notes;
          break;
        case 'validate_payment':
          updateData.status = 'paiement_valide';
          updateData.payment_reference = data.paymentReference;
          updateData.payment_date = new Date().toISOString();
          updateData.payment_validated_by = (await supabase.auth.getUser()).data.user?.id;
          notificationData.quoteAmount = selectedRequest.quote_amount;
          notificationData.paymentLink = data.paymentLink || '';
          break;
        case 'start_restoration':
          // L'admin termine directement la restauration après acceptation du devis
          updateData.status = 'paiement_en_attente';
          updateData.restoration_started_at = new Date().toISOString();
          updateData.restoration_report = data.restorationReport;
          updateData.initial_condition = data.initialCondition;
          updateData.works_performed = data.worksPerformed;
          updateData.techniques_applied = data.techniquesApplied;
          updateData.final_condition = data.finalCondition;
          updateData.recommendations = data.recommendations;
          updateData.completed_at = new Date().toISOString();
          updateData.restoration_completed_by = (await supabase.auth.getUser()).data.user?.id;
          notificationData.estimatedDuration = selectedRequest.estimated_duration;
          break;
        case 'complete_restoration':
          updateData.status = 'paiement_en_attente';
          updateData.restoration_report = data.restorationReport;
          updateData.initial_condition = data.initialCondition;
          updateData.works_performed = data.worksPerformed;
          updateData.materials_used = data.materialsUsed;
          updateData.techniques_applied = data.techniquesApplied;
          updateData.final_condition = data.finalCondition;
          updateData.recommendations = data.recommendations;
          updateData.actual_duration = data.actualDuration ? parseInt(data.actualDuration) : null;
          updateData.actual_cost = data.actualCost ? parseFloat(data.actualCost) : null;
          updateData.completed_at = new Date().toISOString();
          updateData.restoration_completed_by = (await supabase.auth.getUser()).data.user?.id;
          break;
        case 'return_artwork':
          updateData.status = 'cloturee';
          updateData.artwork_returned_at = new Date().toISOString();
          updateData.return_notes = data.completionNotes;
          break;
        case 'reset_request':
          // Pour les tests - réinitialise la demande au début
          updateData.status = 'soumise';
          updateData.director_approval_notes = null;
          updateData.director_approval_at = null;
          updateData.director_rejection_reason = null;
          updateData.rejected_at = null;
          updateData.artwork_received_at = null;
          updateData.artwork_condition_at_reception = null;
          updateData.diagnosis_report = null;
          updateData.diagnosis_completed_at = null;
          updateData.quote_amount = null;
          updateData.quote_issued_at = null;
          updateData.quote_accepted_at = null;
          updateData.quote_rejected_at = null;
          updateData.quote_rejection_reason = null;
          updateData.payment_reference = null;
          updateData.payment_date = null;
          updateData.payment_validated_by = null;
          updateData.restoration_started_at = null;
          updateData.restoration_report = null;
          updateData.completed_at = null;
          updateData.restoration_completed_by = null;
          updateData.artwork_returned_at = null;
          updateData.return_notes = null;
          break;
      }

      await updateStatus.mutateAsync(updateData);
      
      // Envoyer la notification email et créer notification portail
      if (actionType !== 'reset_request' && actionType !== 'complete_diagnosis') {
        await sendNotification(actionType, notificationData);
      }
      
      toast({
        title: "Succès",
        description: "L'action a été effectuée avec succès.",
      });
    } catch (error) {
      console.error('Error submitting action:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'action.",
        variant: "destructive",
      });
    }
  };

  const getActionButton = (request: RestorationRequest) => {
    // Statuts terminaux - pas de bouton d'action (sauf bouton reset pour tests)
    if (['cloturee', 'refusee_direction', 'devis_refuse', 'annulee'].includes(request.status)) {
      return (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleWorkflowAction(request, 'reset_request')}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Réinitialiser (Test)
        </Button>
      );
    }

    switch (request.status) {
      case 'soumise':
      case 'en_attente_autorisation':
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleWorkflowAction(request, 'director_approve')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approuver
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleWorkflowAction(request, 'director_reject')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Refuser
            </Button>
          </div>
        );
      case 'autorisee':
        return (
          <Button size="sm" onClick={() => handleWorkflowAction(request, 'receive_artwork')}>
            <Package className="w-4 h-4 mr-1" />
            Réceptionner
          </Button>
        );
      case 'oeuvre_recue':
      case 'diagnostic_en_cours':
        return (
          <Button size="sm" onClick={() => handleWorkflowAction(request, 'complete_diagnosis')}>
            <FileCheck className="w-4 h-4 mr-1" />
            Compléter diagnostic
          </Button>
        );
      case 'devis_en_attente':
        // Si le montant du devis n'est pas encore défini, montrer le bouton "Envoyer le devis"
        if (!request.quote_amount) {
          return (
            <Button size="sm" onClick={() => handleWorkflowAction(request, 'send_quote')}>
              <DollarSign className="w-4 h-4 mr-1" />
              Envoyer le devis
            </Button>
          );
        }
        // Une fois le devis envoyé, l'admin attend la réponse du demandeur
        return (
          <div className="text-sm text-muted-foreground italic flex items-center gap-2">
            <Clock className="w-4 h-4" />
            En attente de la réponse du demandeur
          </div>
        );
      case 'devis_accepte':
        return (
          <Button size="sm" onClick={() => handleWorkflowAction(request, 'start_restoration')}>
            <Wrench className="w-4 h-4 mr-1" />
            Restauration
          </Button>
        );
      case 'paiement_en_attente':
        return (
          <Button size="sm" onClick={() => handleWorkflowAction(request, 'validate_payment')}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Valider paiement
          </Button>
        );
      case 'paiement_valide':
        return (
          <Button size="sm" onClick={() => handleWorkflowAction(request, 'return_artwork')}>
            <Package className="w-4 h-4 mr-1" />
            Retourner œuvre
          </Button>
        );
      case 'restauration_en_cours':
        return (
          <Button size="sm" onClick={() => handleWorkflowAction(request, 'complete_restoration')}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Terminer restauration
          </Button>
        );
      case 'terminee':
        return (
          <div className="text-sm text-muted-foreground italic flex items-center gap-2">
            <Clock className="w-4 h-4" />
            En attente du paiement
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM Restauration - Administration", 
        variant: "subtle", 
        position: "corner",
        opacity: 0.03
      }}
    >
      <div className="min-h-screen bg-background">
        <AdminHeader 
          title="Gestion des Demandes de Restauration"
          subtitle="Suivi et validation des demandes de restauration de manuscrits"
        />

        <main className="container py-8">
          <div className="space-y-6">
            {/* Header with controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/settings')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <div className="flex items-center gap-2">
                  <Wrench className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Demandes de Restauration</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label>Délai d'alerte (jours)</Label>
                <Input
                  type="number"
                  value={alertThresholdDays}
                  onChange={(e) => setAlertThresholdDays(Number(e.target.value))}
                  className="w-20"
                  min={1}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Demandes</p>
                      <p className="text-2xl font-bold">{totalRequests}</p>
                    </div>
                    <Wrench className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">En attente</p>
                      <p className="text-2xl font-bold">{pendingRequests}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">En cours</p>
                      <p className="text-2xl font-bold">{inProgressRequests}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Terminées</p>
                      <p className="text-2xl font-bold">{completedRequests}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Delayed Requests Alert */}
            {delayedRequests.length > 0 && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-destructive">
                      Demandes en retard ({delayedRequests.length})
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Demandes dépassant le délai de {alertThresholdDays} jours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Demande</TableHead>
                        <TableHead>Manuscrit</TableHead>
                        <TableHead>Urgence</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date soumission</TableHead>
                        <TableHead>Jours écoulés</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {delayedRequests.slice(0, 5).map((request) => {
                        const daysElapsed = Math.floor((Date.now() - new Date(request.submitted_at).getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <TableRow key={request.id} className="cursor-pointer" onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsDialog(true);
                          }}>
                            <TableCell className="font-medium">{request.request_number}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.manuscript_title}</p>
                                <p className="text-xs text-muted-foreground">{request.manuscript_cote}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getUrgencyBadge(request.urgency_level)}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>{format(new Date(request.submitted_at), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">{daysElapsed} jours</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Gestion des données d'exemple */}
            <SampleDataManager />

            {/* Requests List */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Liste des Demandes</CardTitle>
                      <CardDescription>Toutes les demandes de restauration de manuscrits</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <Select value={urgencyFilter} onValueChange={(value) => handleFilterChange('urgency', value)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Urgence" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="all">Toutes urgences</SelectItem>
                          <SelectItem value="faible">Faible</SelectItem>
                          <SelectItem value="moyenne">Moyenne</SelectItem>
                          <SelectItem value="elevee">Élevée</SelectItem>
                          <SelectItem value="critique">Critique</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="soumise">Soumise</SelectItem>
                          <SelectItem value="en_attente_autorisation">En attente d'autorisation</SelectItem>
                          <SelectItem value="autorisee">Autorisée</SelectItem>
                          <SelectItem value="oeuvre_recue">Œuvre reçue</SelectItem>
                          <SelectItem value="diagnostic_en_cours">Diagnostic en cours</SelectItem>
                          <SelectItem value="devis_en_attente">Devis en attente</SelectItem>
                          <SelectItem value="devis_accepte">Devis accepté</SelectItem>
                          <SelectItem value="paiement_valide">Paiement validé</SelectItem>
                          <SelectItem value="restauration_en_cours">Restauration en cours</SelectItem>
                          <SelectItem value="terminee">Terminée</SelectItem>
                          <SelectItem value="cloturee">Clôturée</SelectItem>
                          <SelectItem value="refusee_direction">Refusée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Search bar */}
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Rechercher par n° demande, titre, cote ou utilisateur..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-4 pr-10"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setSearchQuery('')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Chargement...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Demande</TableHead>
                        <TableHead>Manuscrit</TableHead>
                        <TableHead>Demandeur</TableHead>
                        <TableHead>Urgence</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.request_number}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.manuscript_title}</p>
                              <p className="text-xs text-muted-foreground">{request.manuscript_cote}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {request.profiles ? (
                              <div>
                                <p className="text-sm">{request.profiles.first_name} {request.profiles.last_name}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getUrgencyBadge(request.urgency_level)}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{format(new Date(request.submitted_at), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {getActionButton(request)}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowDetailsDialog(true);
                                }}
                              >
                                <Eye className="h-4 h-4 mr-1" />
                                Voir
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {/* Pagination Controls */}
                {!isLoading && requests && requests.length > 0 && (
                  <div className="flex items-center justify-between px-2 py-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Affichage de {startIndex + 1} à {Math.min(endIndex, requests.length)} sur {requests.length} résultats
                      </span>
                      <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          <SelectItem value="5">5 / page</SelectItem>
                          <SelectItem value="10">10 / page</SelectItem>
                          <SelectItem value="20">20 / page</SelectItem>
                          <SelectItem value="50">50 / page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details Dialog avec stepper */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Détails de la demande {selectedRequest?.request_number}</DialogTitle>
                  <DialogDescription>
                    Informations complètes sur la demande de restauration
                  </DialogDescription>
                </DialogHeader>
                
                {selectedRequest && (
                  <>
                    <RestorationWorkflowStepper 
                      currentStatus={selectedRequest.status} 
                      className="mb-6"
                    />
                    <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Titre du manuscrit</Label>
                        <p className="text-sm font-medium">{selectedRequest.manuscript_title}</p>
                      </div>
                      <div>
                        <Label>Cote</Label>
                        <p className="text-sm font-medium">{selectedRequest.manuscript_cote}</p>
                      </div>
                      <div>
                        <Label>Niveau d'urgence</Label>
                        <div className="mt-1">{getUrgencyBadge(selectedRequest.urgency_level)}</div>
                      </div>
                      <div>
                        <Label>Statut actuel</Label>
                        <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                      </div>
                      <div>
                        <Label>Date de soumission</Label>
                        <p className="text-sm">{format(new Date(selectedRequest.submitted_at), 'dd/MM/yyyy HH:mm')}</p>
                      </div>
                      {selectedRequest.estimated_cost && (
                        <div>
                          <Label>Coût estimé</Label>
                          <p className="text-sm font-medium">{selectedRequest.estimated_cost} DH</p>
                        </div>
                      )}
                      {selectedRequest.estimated_duration && (
                        <div>
                          <Label>Durée estimée</Label>
                          <p className="text-sm">{selectedRequest.estimated_duration} jours</p>
                        </div>
                      )}
                      {selectedRequest.assigned_restorer && (
                        <div>
                          <Label>Restaurateur assigné</Label>
                          <p className="text-sm">{selectedRequest.assigned_restorer}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label>Description des dégâts</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded">{selectedRequest.damage_description}</p>
                    </div>

                    {selectedRequest.user_notes && (
                      <div>
                        <Label>Notes de l'utilisateur</Label>
                        <p className="text-sm mt-1 p-3 bg-muted rounded">{selectedRequest.user_notes}</p>
                      </div>
                    )}

                    {selectedRequest.validation_notes && (
                      <div>
                        <Label>Notes de validation</Label>
                        <p className="text-sm mt-1 p-3 bg-muted rounded">{selectedRequest.validation_notes}</p>
                      </div>
                    )}

                    {selectedRequest.rejection_reason && (
                      <div>
                        <Label>Raison du refus</Label>
                        <p className="text-sm mt-1 p-3 bg-destructive/10 text-destructive rounded">
                          {selectedRequest.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                      Fermer
                    </Button>
                  </DialogFooter>
                </>
              )}
              </DialogContent>
            </Dialog>

            {/* Workflow Dialog avec génération de documents */}
            <RestorationWorkflowDialog
              open={workflowDialogOpen}
              onClose={() => setWorkflowDialogOpen(false)}
              request={selectedRequest}
              onAction={handleWorkflowSubmit}
              actionType={currentActionType}
            />
          </div>
        </main>
      </div>
    </WatermarkContainer>
  );
}
