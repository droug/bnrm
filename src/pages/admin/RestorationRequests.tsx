import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, XCircle, Clock, Wrench, Eye, Filter, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { WatermarkContainer } from "@/components/ui/watermark";
import { AdminHeader } from "@/components/AdminHeader";
import { useNavigate } from "react-router-dom";

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
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "assign">("approve");
  const [actionNotes, setActionNotes] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [assignedRestorer, setAssignedRestorer] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [alertThresholdDays, setAlertThresholdDays] = useState(7);

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
    return true;
  });

  // Update request status
  const updateStatus = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      notes, 
      cost, 
      duration, 
      restorer 
    }: { 
      requestId: string; 
      status: string; 
      notes: string;
      cost?: number;
      duration?: number;
      restorer?: string;
    }) => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'validee') {
        updateData.validated_by = user?.id;
        updateData.validated_at = new Date().toISOString();
        updateData.validation_notes = notes;
        if (cost) updateData.estimated_cost = cost;
        if (duration) updateData.estimated_duration = duration;
        if (restorer) updateData.assigned_restorer = restorer;
      } else if (status === 'refusee') {
        updateData.rejected_by = user?.id;
        updateData.rejected_at = new Date().toISOString();
        updateData.rejection_reason = notes;
      } else if (status === 'en_cours') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'terminee') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('restoration_requests')
        .update(updateData)
        .eq('id', requestId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restoration-requests-admin'] });
      setShowActionDialog(false);
      setSelectedRequest(null);
      setActionNotes("");
      setEstimatedCost("");
      setEstimatedDuration("");
      setAssignedRestorer("");
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
    const statusConfig: Record<string, { label: string; variant: any }> = {
      'soumise': { label: 'Soumise', variant: 'secondary' },
      'en_evaluation': { label: 'En évaluation', variant: 'default' },
      'validee': { label: 'Validée', variant: 'default' },
      'refusee': { label: 'Refusée', variant: 'destructive' },
      'en_cours': { label: 'En cours', variant: 'default' },
      'terminee': { label: 'Terminée', variant: 'default' },
      'annulee': { label: 'Annulée', variant: 'destructive' }
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
           !['validee', 'refusee', 'terminee', 'annulee'].includes(request.status);
  };

  const delayedRequests = requests?.filter(isRequestDelayed) || [];

  // Stats
  const totalRequests = requests?.length || 0;
  const pendingRequests = requests?.filter(r => ['soumise', 'en_evaluation'].includes(r.status)).length || 0;
  const inProgressRequests = requests?.filter(r => r.status === 'en_cours').length || 0;
  const completedRequests = requests?.filter(r => r.status === 'terminee').length || 0;

  const handleAction = (request: RestorationRequest, type: "approve" | "reject" | "assign") => {
    setSelectedRequest(request);
    setActionType(type);
    setShowActionDialog(true);
  };

  const handleSubmitAction = () => {
    if (!selectedRequest) return;
    
    let newStatus = selectedRequest.status;
    if (actionType === "approve") {
      newStatus = "validee";
    } else if (actionType === "reject") {
      newStatus = "refusee";
    } else if (actionType === "assign") {
      newStatus = "en_cours";
    }

    updateStatus.mutate({
      requestId: selectedRequest.id,
      status: newStatus,
      notes: actionNotes,
      cost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      duration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
      restorer: assignedRestorer || undefined
    });
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

            {/* Requests List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Liste des Demandes</CardTitle>
                    <CardDescription>Toutes les demandes de restauration de manuscrits</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
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
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filtrer par statut" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="soumise">Soumise</SelectItem>
                        <SelectItem value="en_evaluation">En évaluation</SelectItem>
                        <SelectItem value="validee">Validée</SelectItem>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="terminee">Terminée</SelectItem>
                        <SelectItem value="refusee">Refusée</SelectItem>
                      </SelectContent>
                    </Select>
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
                      {requests?.map((request) => (
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowDetailsDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {['soumise', 'en_evaluation'].includes(request.status) && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAction(request, "approve")}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAction(request, "reject")}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Détails de la demande {selectedRequest?.request_number}</DialogTitle>
                  <DialogDescription>
                    Informations complètes sur la demande de restauration
                  </DialogDescription>
                </DialogHeader>
                {selectedRequest && (
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
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                    Fermer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Action Dialog */}
            <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {actionType === "approve" ? "Valider la demande" : 
                     actionType === "reject" ? "Refuser la demande" : 
                     "Assigner la restauration"}
                  </DialogTitle>
                  <DialogDescription>
                    {actionType === "approve" ? "Validez cette demande de restauration et fournissez une estimation" :
                     actionType === "reject" ? "Indiquez la raison du refus" :
                     "Assignez un restaurateur et planifiez la restauration"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {actionType === "approve" && (
                    <>
                      <div>
                        <Label>Coût estimé (DH)</Label>
                        <Input
                          type="number"
                          value={estimatedCost}
                          onChange={(e) => setEstimatedCost(e.target.value)}
                          placeholder="Ex: 5000"
                        />
                      </div>
                      <div>
                        <Label>Durée estimée (jours)</Label>
                        <Input
                          type="number"
                          value={estimatedDuration}
                          onChange={(e) => setEstimatedDuration(e.target.value)}
                          placeholder="Ex: 30"
                        />
                      </div>
                    </>
                  )}
                  
                  {actionType === "assign" && (
                    <div>
                      <Label>Restaurateur</Label>
                      <Input
                        value={assignedRestorer}
                        onChange={(e) => setAssignedRestorer(e.target.value)}
                        placeholder="Nom du restaurateur"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder={
                        actionType === "approve" ? "Notes de validation (optionnel)" :
                        actionType === "reject" ? "Raison du refus (requis)" :
                        "Instructions pour le restaurateur"
                      }
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSubmitAction}
                    disabled={actionType === "reject" && !actionNotes}
                  >
                    Confirmer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </WatermarkContainer>
  );
}
