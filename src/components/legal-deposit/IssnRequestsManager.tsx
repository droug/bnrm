import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, CheckCircle, XCircle, Search, Filter, Loader2, Hash } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface IssnRequest {
  id: string;
  request_number: string;
  title: string;
  discipline: string;
  language_code: string;
  country_code: string;
  publisher: string;
  support: string;
  frequency: string;
  contact_address: string;
  status: "en_attente" | "validee" | "refusee";
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  user_id: string | null;
  requester_email: string | null;
  assigned_issn: string | null;
  assigned_at: string | null;
  assigned_by: string | null;
}

export default function IssnRequestsManager() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<IssnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [supportFilter, setSupportFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<IssnRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false);
  const [issnNumber, setIssnNumber] = useState("");
  const [attributing, setAttributing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('issn_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as IssnRequest[]);
    } catch (error) {
      console.error('Error fetching ISSN requests:', error);
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (request: IssnRequest) => {
    if (request.assigned_issn) {
      return <Badge className="bg-[#E3F2FD] text-[#1565C0] hover:bg-[#E3F2FD]">Attribué</Badge>;
    }
    const variants = {
      en_attente: { label: "En attente", className: "bg-[#FFF8E1] text-[#F57C00] hover:bg-[#FFF8E1]" },
      validee: { label: "Validée", className: "bg-[#E7F5EC] text-[#2E7D32] hover:bg-[#E7F5EC]" },
      refusee: { label: "Refusée", className: "bg-[#FDEAEA] text-[#C62828] hover:bg-[#FDEAEA]" },
    };
    const variant = variants[request.status] || variants.en_attente;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getSupportLabel = (support: string) => {
    const labels: Record<string, string> = {
      papier: "Papier",
      en_ligne: "En ligne",
      mixte: "Mixte",
    };
    return labels[support] || support;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      hebdomadaire: "Hebdomadaire",
      mensuelle: "Mensuelle",
      trimestrielle: "Trimestrielle",
      annuelle: "Annuelle",
    };
    return labels[frequency] || frequency;
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesSupport = supportFilter === "all" || request.support === supportFilter;
    const matchesSearch = 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.request_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSupport && matchesSearch;
  });

  const handleValidate = async (request: IssnRequest) => {
    try {
      const { error } = await supabase
        .from('issn_requests')
        .update({
          status: 'validee',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', request.id);

      if (error) throw error;

      if (request.requester_email) {
        try {
          await supabase.functions.invoke('send-workflow-notification', {
            body: {
              request_type: 'issn_request',
              request_id: request.id,
              notification_type: 'validee',
              recipient_email: request.requester_email
            }
          });
        } catch (notifError) {
          console.warn('Notification email failed:', notifError);
        }
      }

      setRequests(requests.map(r => 
        r.id === request.id 
          ? { ...r, status: "validee" as const, reviewed_at: new Date().toISOString() }
          : r
      ));
      toast.success(`Demande ${request.request_number} validée avec succès`);
    } catch (error) {
      console.error('Error validating request:', error);
      toast.error("Erreur lors de la validation");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error("Veuillez saisir un motif de refus");
      return;
    }

    try {
      const { error } = await supabase
        .from('issn_requests')
        .update({
          status: 'refusee',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          rejection_reason: rejectionReason
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      if (selectedRequest.requester_email) {
        try {
          await supabase.functions.invoke('send-workflow-notification', {
            body: {
              request_type: 'issn_request',
              request_id: selectedRequest.id,
              notification_type: 'refusee',
              recipient_email: selectedRequest.requester_email,
              additional_data: { reason: rejectionReason }
            }
          });
        } catch (notifError) {
          console.warn('Notification email failed:', notifError);
        }
      }
      setRequests(requests.map(r => 
        r.id === selectedRequest.id 
          ? { ...r, status: "refusee" as const, reviewed_at: new Date().toISOString(), rejection_reason: rejectionReason }
          : r
      ));
      toast.success(`Demande ${selectedRequest.request_number} refusée`);
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error("Erreur lors du refus");
    }
  };

  const openRejectDialog = (request: IssnRequest) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  };

  const openDetailsDialog = (request: IssnRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const openAttributeDialog = (request: IssnRequest) => {
    setSelectedRequest(request);
    setIssnNumber("");
    setIsAttributeDialogOpen(true);
  };

  const handleAttributeIssn = async () => {
    if (!selectedRequest || !issnNumber.trim()) {
      toast.error("Veuillez saisir un numéro ISSN");
      return;
    }

    // Basic ISSN format validation (XXXX-XXXX)
    const issnPattern = /^\d{4}-\d{3}[\dXx]$/;
    if (!issnPattern.test(issnNumber.trim())) {
      toast.error("Format ISSN invalide. Format attendu : XXXX-XXXX (ex: 1234-5678)");
      return;
    }

    setAttributing(true);
    try {
      const { error } = await supabase
        .from('issn_requests')
        .update({
          assigned_issn: issnNumber.trim().toUpperCase(),
          assigned_at: new Date().toISOString(),
          assigned_by: user?.id,
          status: 'validee',
          reviewed_at: selectedRequest.reviewed_at || new Date().toISOString(),
          reviewed_by: selectedRequest.reviewed_by || user?.id
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Notify requester
      if (selectedRequest.requester_email) {
        try {
          await supabase.functions.invoke('send-workflow-notification', {
            body: {
              request_type: 'issn_request',
              request_id: selectedRequest.id,
              notification_type: 'issn_attributed',
              recipient_email: selectedRequest.requester_email,
              additional_data: { issn: issnNumber.trim().toUpperCase() }
            }
          });
        } catch (notifError) {
          console.warn('Notification email failed:', notifError);
        }
      }

      setRequests(requests.map(r => 
        r.id === selectedRequest.id 
          ? { 
              ...r, 
              assigned_issn: issnNumber.trim().toUpperCase(), 
              assigned_at: new Date().toISOString(),
              assigned_by: user?.id || null,
              status: "validee" as const
            }
          : r
      ));
      toast.success(`ISSN ${issnNumber.trim().toUpperCase()} attribué à "${selectedRequest.title}"`);
      setIsAttributeDialogOpen(false);
      setIssnNumber("");
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error attributing ISSN:', error);
      toast.error("Erreur lors de l'attribution du numéro ISSN");
    } finally {
      setAttributing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestion des demandes ISSN</CardTitle>
          <CardDescription>
            Gérez les demandes d'ISSN pour les publications périodiques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, n° de demande ou éditeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="validee">Validée</SelectItem>
                  <SelectItem value="refusee">Refusée</SelectItem>
                </SelectContent>
              </Select>

              <Select value={supportFilter} onValueChange={setSupportFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Support" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les supports</SelectItem>
                  <SelectItem value="papier">Papier</SelectItem>
                  <SelectItem value="en_ligne">En ligne</SelectItem>
                  <SelectItem value="mixte">Mixte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#FFF8E1] border-[#F57C00]">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#F57C00]">
                  {requests.filter(r => r.status === "en_attente").length}
                </div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </CardContent>
            </Card>
            <Card className="bg-[#E7F5EC] border-[#2E7D32]">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#2E7D32]">
                  {requests.filter(r => r.status === "validee" && !r.assigned_issn).length}
                </div>
                <div className="text-sm text-muted-foreground">Validées (sans ISSN)</div>
              </CardContent>
            </Card>
            <Card className="bg-[#E3F2FD] border-[#1565C0]">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#1565C0]">
                  {requests.filter(r => r.assigned_issn).length}
                </div>
                <div className="text-sm text-muted-foreground">ISSN attribués</div>
              </CardContent>
            </Card>
            <Card className="bg-[#FDEAEA] border-[#C62828]">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#C62828]">
                  {requests.filter(r => r.status === "refusee").length}
                </div>
                <div className="text-sm text-muted-foreground">Refusées</div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau des demandes */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader className="bg-[#DCE6F6]">
                <TableRow>
                  <TableHead className="text-[#2E2E2E]">N° de demande</TableHead>
                  <TableHead className="text-[#2E2E2E]">Titre de la publication</TableHead>
                  <TableHead className="text-[#2E2E2E]">Type de support</TableHead>
                  <TableHead className="text-[#2E2E2E]">ISSN attribué</TableHead>
                  <TableHead className="text-[#2E2E2E]">Date de soumission</TableHead>
                  <TableHead className="text-[#2E2E2E]">Statut</TableHead>
                  <TableHead className="text-[#2E2E2E] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Aucune demande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.request_number}</TableCell>
                      <TableCell>{request.title}</TableCell>
                      <TableCell>{getSupportLabel(request.support)}</TableCell>
                      <TableCell>
                        {request.assigned_issn ? (
                          <span className="font-mono font-semibold text-[#1565C0]">{request.assigned_issn}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(request.created_at), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(request)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailsDialog(request)}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* Attribution ISSN: disponible pour les demandes validées ou en attente sans ISSN */}
                          {!request.assigned_issn && request.status !== "refusee" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAttributeDialog(request)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Attribuer un numéro ISSN"
                            >
                              <Hash className="h-4 w-4" />
                            </Button>
                          )}
                          {request.status === "en_attente" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleValidate(request)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Valider la demande"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openRejectDialog(request)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Refuser la demande"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
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

      {/* Dialog de détails */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de la demande ISSN</DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande {selectedRequest?.request_number}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Titre</Label>
                  <p className="font-medium">{selectedRequest.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Discipline</Label>
                  <p className="font-medium">{selectedRequest.discipline}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Langue</Label>
                  <p className="font-medium">{selectedRequest.language_code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Pays</Label>
                  <p className="font-medium">{selectedRequest.country_code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Éditeur</Label>
                  <p className="font-medium">{selectedRequest.publisher}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Support</Label>
                  <p className="font-medium">{getSupportLabel(selectedRequest.support)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fréquence</Label>
                  <p className="font-medium">{getFrequencyLabel(selectedRequest.frequency)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest)}</div>
                </div>
              </div>
              {selectedRequest.assigned_issn && (
                <div className="p-3 bg-[#E3F2FD] rounded-lg">
                  <Label className="text-[#1565C0]">ISSN attribué</Label>
                  <p className="font-mono font-bold text-lg text-[#1565C0]">{selectedRequest.assigned_issn}</p>
                  {selectedRequest.assigned_at && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Attribué le {format(new Date(selectedRequest.assigned_at), "dd/MM/yyyy à HH:mm")}
                    </p>
                  )}
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Adresse de contact</Label>
                <p className="font-medium">{selectedRequest.contact_address}</p>
              </div>
              {selectedRequest.rejection_reason && (
                <div>
                  <Label className="text-muted-foreground">Motif de refus</Label>
                  <p className="font-medium text-red-600">{selectedRequest.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de refus */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la demande ISSN</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du refus pour la demande {selectedRequest?.request_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motif du refus <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Saisir le motif détaillé du refus..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'attribution ISSN */}
      <Dialog open={isAttributeDialogOpen} onOpenChange={setIsAttributeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-[#1565C0]" />
              Attribuer un numéro ISSN
            </DialogTitle>
            <DialogDescription>
              Attribuer un ISSN à la publication « {selectedRequest?.title} » ({selectedRequest?.request_number})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Numéro ISSN <span className="text-destructive">*</span></Label>
              <Input
                placeholder="ex: 1234-5678"
                value={issnNumber}
                onChange={(e) => setIssnNumber(e.target.value)}
                className="font-mono text-lg"
                maxLength={9}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format : XXXX-XXXX (8 chiffres séparés par un tiret)
              </p>
            </div>
            {selectedRequest && (
              <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                <p><span className="text-muted-foreground">Publication :</span> {selectedRequest.title}</p>
                <p><span className="text-muted-foreground">Éditeur :</span> {selectedRequest.publisher}</p>
                <p><span className="text-muted-foreground">Support :</span> {getSupportLabel(selectedRequest.support)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAttributeDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAttributeIssn} 
              disabled={attributing || !issnNumber.trim()}
              className="bg-[#1565C0] hover:bg-[#0D47A1]"
            >
              {attributing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Attribution...
                </>
              ) : (
                "Attribuer l'ISSN"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
