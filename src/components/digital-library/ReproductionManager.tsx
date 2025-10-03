import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, XCircle, Clock, Copy, Eye, Filter } from "lucide-react";
import { format } from "date-fns";

interface ReproductionRequest {
  id: string;
  request_number: string;
  reproduction_modality: string;
  status: string;
  submitted_at: string;
  user_notes: string;
  rejection_reason?: string;
  service_validation_notes?: string;
  manager_validation_notes?: string;
  created_at: string;
}

export default function ReproductionManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<ReproductionRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [actionNotes, setActionNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [alertThresholdDays, setAlertThresholdDays] = useState(7);

  // Fetch all reproduction requests
  const { data: allRequests, isLoading } = useQuery({
    queryKey: ['reproduction-requests-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reproduction_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data as ReproductionRequest[];
    }
  });

  // Filter requests client-side
  const requests = allRequests?.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  // Fetch reproduction items for a specific request
  const { data: requestItems } = useQuery({
    queryKey: ['reproduction-items', selectedRequest?.id],
    queryFn: async () => {
      if (!selectedRequest) return null;
      
      const { data, error } = await supabase
        .from('reproduction_items')
        .select('*')
        .eq('request_id', selectedRequest.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedRequest
  });

  // Update request status
  const updateStatus = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: string; status: string; notes: string }) => {
      const updateData: any = {
        status,
      };

      if (status === 'validee') {
        updateData.manager_validator_id = user?.id;
        updateData.manager_validated_at = new Date().toISOString();
        updateData.manager_validation_notes = notes;
      } else if (status === 'refusee') {
        updateData.rejected_by = user?.id;
        updateData.rejected_at = new Date().toISOString();
        updateData.rejection_reason = notes;
      }

      const { error } = await supabase
        .from('reproduction_requests')
        .update(updateData)
        .eq('id', requestId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reproduction-requests-admin'] });
      setShowActionDialog(false);
      setSelectedRequest(null);
      setActionNotes("");
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
      'soumise': { label: 'Soumise', variant: 'default' },
      'en_validation_service': { label: 'En validation', variant: 'secondary' },
      'en_validation_responsable': { label: 'En attente manager', variant: 'secondary' },
      'validee': { label: 'Validée', variant: 'default' },
      'refusee': { label: 'Refusée', variant: 'destructive' },
      'en_attente_paiement': { label: 'Attente paiement', variant: 'secondary' },
      'traitee': { label: 'Traitée', variant: 'default' }
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isRequestDelayed = (request: ReproductionRequest) => {
    const submittedDate = new Date(request.submitted_at);
    const daysSinceSubmission = Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceSubmission > alertThresholdDays && 
           !['validee', 'refusee', 'traitee'].includes(request.status);
  };

  const delayedRequests = requests?.filter(isRequestDelayed) || [];

  // Stats
  const totalRequests = requests?.length || 0;
  const pendingRequests = requests?.filter(r => ['soumise', 'en_validation_service', 'en_validation_responsable'].includes(r.status)).length || 0;
  const approvedRequests = requests?.filter(r => r.status === 'validee').length || 0;
  const rejectedRequests = requests?.filter(r => r.status === 'refusee').length || 0;

  const handleAction = (request: ReproductionRequest, type: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(type);
    setShowActionDialog(true);
  };

  const handleSubmitAction = () => {
    if (!selectedRequest) return;
    
    const newStatus = actionType === "approve" ? "validee" : "refusee";
    updateStatus.mutate({
      requestId: selectedRequest.id,
      status: newStatus,
      notes: actionNotes
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Demandes de Reproduction</h2>
          <p className="text-muted-foreground">Suivi et validation des demandes de reproduction</p>
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
              <Copy className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm text-muted-foreground">Validées</p>
                <p className="text-2xl font-bold">{approvedRequests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Refusées</p>
                <p className="text-2xl font-bold">{rejectedRequests}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
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
                  <TableHead>Modalité</TableHead>
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
                      <TableCell>{request.reproduction_modality}</TableCell>
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
              <CardDescription>Toutes les demandes de reproduction</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="soumise">Soumise</SelectItem>
                  <SelectItem value="en_validation_service">En validation</SelectItem>
                  <SelectItem value="en_validation_responsable">Attente manager</SelectItem>
                  <SelectItem value="validee">Validée</SelectItem>
                  <SelectItem value="refusee">Refusée</SelectItem>
                  <SelectItem value="traitee">Traitée</SelectItem>
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
                  <TableHead>Modalité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date soumission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.request_number}</TableCell>
                    <TableCell>{request.reproduction_modality}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{format(new Date(request.submitted_at), 'dd/MM/yyyy HH:mm')}</TableCell>
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
                        {['soumise', 'en_validation_service', 'en_validation_responsable'].includes(request.status) && (
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande {selectedRequest?.request_number}</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande de reproduction
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Modalité de reproduction</Label>
                  <p className="text-sm font-medium">{selectedRequest.reproduction_modality}</p>
                </div>
                <div>
                  <Label>Statut actuel</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <Label>Date de soumission</Label>
                  <p className="text-sm">{format(new Date(selectedRequest.submitted_at), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>
              
              {selectedRequest.user_notes && (
                <div>
                  <Label>Notes de l'utilisateur</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded">{selectedRequest.user_notes}</p>
                </div>
              )}

              {selectedRequest.service_validation_notes && (
                <div>
                  <Label>Notes de validation service</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded">{selectedRequest.service_validation_notes}</p>
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

              {requestItems && requestItems.length > 0 && (
                <div>
                  <Label>Items demandés ({requestItems.length})</Label>
                  <div className="mt-2 space-y-2">
                    {requestItems.map((item: any) => (
                      <div key={item.id} className="p-3 border rounded">
                        <p className="font-medium">{item.document_title}</p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-sm text-muted-foreground">
                          <span>Type: {item.type_item}</span>
                          <span>Format: {item.format_demande}</span>
                          <span>Quantité: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
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
              {actionType === "approve" ? "Valider" : "Refuser"} la demande
            </DialogTitle>
            <DialogDescription>
              Demande N° {selectedRequest?.request_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>
                {actionType === "approve" ? "Notes de validation" : "Raison du refus"}
              </Label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={actionType === "approve" 
                  ? "Ajoutez des notes de validation (optionnel)" 
                  : "Indiquez la raison du refus"}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmitAction}
              variant={actionType === "approve" ? "default" : "destructive"}
            >
              {actionType === "approve" ? "Valider" : "Refuser"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
