import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, CheckCircle, XCircle, Search, Filter, Loader2, Hash, Shuffle, BookOpen, ArrowRight, Paperclip, ExternalLink } from "lucide-react";
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
  justification_file_url: string | null;
}

interface IssnRange {
  id: string;
  range_start: string;
  range_end: string;
  current_position: string;
  total_numbers: number;
  used_numbers: number;
  requester_name: string;
  status: string;
}

export default function IssnRequestsManager() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<IssnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [supportFilter, setSupportFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRequest, setSelectedRequest] = useState<IssnRequest | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [issnNumber, setIssnNumber] = useState("");
  const [attributing, setAttributing] = useState(false);
  const [attributionMode, setAttributionMode] = useState<"manual" | "range" | "random" | null>(null);
  const [issnRanges, setIssnRanges] = useState<IssnRange[]>([]);
  const [selectedRangeId, setSelectedRangeId] = useState<string>("");
  const [loadingRanges, setLoadingRanges] = useState(false);

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

  const fetchIssnRanges = async () => {
    setLoadingRanges(true);
    try {
      const { data, error } = await supabase
        .from('reserved_number_ranges')
        .select('*')
        .eq('number_type', 'issn')
        .eq('status', 'active')
        .order('requester_name');

      if (error) throw error;
      setIssnRanges((data || []) as IssnRange[]);
    } catch (error) {
      console.error('Error fetching ISSN ranges:', error);
    } finally {
      setLoadingRanges(false);
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
    const labels: Record<string, string> = { papier: "Papier", en_ligne: "En ligne", mixte: "Mixte" };
    return labels[support] || support;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      hebdomadaire: "Hebdomadaire", mensuelle: "Mensuelle",
      trimestrielle: "Trimestrielle", annuelle: "Annuelle",
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
        .update({ status: 'validee', reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
        .eq('id', request.id);
      if (error) throw error;

      if (request.requester_email) {
        try {
          await supabase.functions.invoke('send-workflow-notification', {
            body: { request_type: 'issn_request', request_id: request.id, notification_type: 'validee', recipient_email: request.requester_email }
          });
        } catch (notifError) { console.warn('Notification email failed:', notifError); }
      }
      setRequests(requests.map(r => r.id === request.id ? { ...r, status: "validee" as const, reviewed_at: new Date().toISOString() } : r));
      if (selectedRequest?.id === request.id) setSelectedRequest({ ...request, status: "validee", reviewed_at: new Date().toISOString() });
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
        .update({ status: 'refusee', reviewed_at: new Date().toISOString(), reviewed_by: user?.id, rejection_reason: rejectionReason })
        .eq('id', selectedRequest.id);
      if (error) throw error;

      if (selectedRequest.requester_email) {
        try {
          await supabase.functions.invoke('send-workflow-notification', {
            body: { request_type: 'issn_request', request_id: selectedRequest.id, notification_type: 'refusee', recipient_email: selectedRequest.requester_email, additional_data: { reason: rejectionReason } }
          });
        } catch (notifError) { console.warn('Notification email failed:', notifError); }
      }
      setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, status: "refusee" as const, reviewed_at: new Date().toISOString(), rejection_reason: rejectionReason } : r));
      toast.success(`Demande ${selectedRequest.request_number} refusée`);
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRequest(null);
      setIsSheetOpen(false);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error("Erreur lors du refus");
    }
  };

  const generateRandomIssn = () => {
    // Generate random ISSN with valid check digit
    const digits = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
    const weights = [8, 7, 6, 5, 4, 3, 2];
    const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
    const remainder = sum % 11;
    const checkDigit = remainder === 0 ? '0' : remainder === 1 ? 'X' : String(11 - remainder);
    const issn = `${digits.slice(0, 4).join('')}-${digits.slice(4).join('')}${checkDigit}`;
    setIssnNumber(issn);
  };

  const getNextFromRange = (range: IssnRange): string => {
    // Parse current_position to get next available number
    const current = range.current_position;
    const parts = current.split('-');
    if (parts.length === 2) {
      const prefix = parts[0];
      const num = parseInt(parts[1], 10);
      return `${prefix}-${String(num).padStart(parts[1].length, '0')}`;
    }
    return current;
  };

  const selectFromRange = (rangeId: string) => {
    const range = issnRanges.find(r => r.id === rangeId);
    if (range) {
      const nextIssn = getNextFromRange(range);
      setIssnNumber(nextIssn);
      setSelectedRangeId(rangeId);
    }
  };

  const handleAttributeIssn = async () => {
    if (!selectedRequest || !issnNumber.trim()) {
      toast.error("Veuillez saisir ou sélectionner un numéro ISSN");
      return;
    }

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

      // Update range usage if selected from a range
      if (selectedRangeId) {
        const range = issnRanges.find(r => r.id === selectedRangeId);
        if (range) {
          const parts = range.current_position.split('-');
          const nextNum = parseInt(parts[1], 10) + 1;
          const nextPosition = `${parts[0]}-${String(nextNum).padStart(parts[1].length, '0')}`;
          await supabase
            .from('reserved_number_ranges')
            .update({
              used_numbers: range.used_numbers + 1,
              current_position: nextPosition,
              used_numbers_list: [...(range as any).used_numbers_list || [], issnNumber.trim().toUpperCase()]
            })
            .eq('id', selectedRangeId);
        }
      }

      if (selectedRequest.requester_email) {
        try {
          await supabase.functions.invoke('send-workflow-notification', {
            body: { request_type: 'issn_request', request_id: selectedRequest.id, notification_type: 'issn_attributed', recipient_email: selectedRequest.requester_email, additional_data: { issn: issnNumber.trim().toUpperCase() } }
          });
        } catch (notifError) { console.warn('Notification email failed:', notifError); }
      }

      const updated = {
        ...selectedRequest,
        assigned_issn: issnNumber.trim().toUpperCase(),
        assigned_at: new Date().toISOString(),
        assigned_by: user?.id || null,
        status: "validee" as const
      };
      setRequests(requests.map(r => r.id === selectedRequest.id ? updated : r));
      setSelectedRequest(updated);
      toast.success(`ISSN ${issnNumber.trim().toUpperCase()} attribué à "${selectedRequest.title}"`);
      setAttributionMode(null);
      setIssnNumber("");
      setSelectedRangeId("");
    } catch (error) {
      console.error('Error attributing ISSN:', error);
      toast.error("Erreur lors de l'attribution du numéro ISSN");
    } finally {
      setAttributing(false);
    }
  };

  const openSheet = (request: IssnRequest) => {
    setSelectedRequest(request);
    setAttributionMode(null);
    setIssnNumber("");
    setSelectedRangeId("");
    setIsSheetOpen(true);
  };

  const openRejectDialog = (request: IssnRequest) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  };

  const startAttribution = (mode: "manual" | "range" | "random") => {
    setAttributionMode(mode);
    setIssnNumber("");
    setSelectedRangeId("");
    if (mode === "range") fetchIssnRanges();
    if (mode === "random") generateRandomIssn();
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
          <CardDescription>Gérez les demandes d'ISSN pour les publications périodiques</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par titre, n° de demande ou éditeur..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="validee">Validée</SelectItem>
                  <SelectItem value="refusee">Refusée</SelectItem>
                </SelectContent>
              </Select>
              <Select value={supportFilter} onValueChange={setSupportFilter}>
                <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Support" /></SelectTrigger>
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
                <div className="text-2xl font-bold text-[#F57C00]">{requests.filter(r => r.status === "en_attente").length}</div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </CardContent>
            </Card>
            <Card className="bg-[#E7F5EC] border-[#2E7D32]">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#2E7D32]">{requests.filter(r => r.status === "validee" && !r.assigned_issn).length}</div>
                <div className="text-sm text-muted-foreground">Validées (sans ISSN)</div>
              </CardContent>
            </Card>
            <Card className="bg-[#E3F2FD] border-[#1565C0]">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#1565C0]">{requests.filter(r => r.assigned_issn).length}</div>
                <div className="text-sm text-muted-foreground">ISSN attribués</div>
              </CardContent>
            </Card>
            <Card className="bg-[#FDEAEA] border-[#C62828]">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#C62828]">{requests.filter(r => r.status === "refusee").length}</div>
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
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">Aucune demande trouvée</TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openSheet(request)}>
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
                        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => openSheet(request)} title="Voir les détails">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === "en_attente" && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleValidate(request)} className="text-green-600 hover:text-green-700 hover:bg-green-50" title="Valider la demande">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openRejectDialog(request)} className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Refuser la demande">
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

      {/* Sheet latéral - Détails + Attribution ISSN */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[540px] overflow-y-auto p-0">
          {selectedRequest && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b bg-muted/30">
                <SheetHeader>
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-lg">Demande {selectedRequest.request_number}</SheetTitle>
                    {getStatusBadge(selectedRequest)}
                  </div>
                  <SheetDescription>{selectedRequest.title}</SheetDescription>
                </SheetHeader>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* ISSN attribué */}
                {selectedRequest.assigned_issn && (
                  <div className="p-4 bg-[#E3F2FD] rounded-lg border border-[#1565C0]/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-4 w-4 text-[#1565C0]" />
                      <Label className="text-[#1565C0] font-semibold">ISSN attribué</Label>
                    </div>
                    <p className="font-mono font-bold text-xl text-[#1565C0]">{selectedRequest.assigned_issn}</p>
                    {selectedRequest.assigned_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Attribué le {format(new Date(selectedRequest.assigned_at), "dd/MM/yyyy à HH:mm")}
                      </p>
                    )}
                  </div>
                )}

                {/* Informations de la publication */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Informations de la publication</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Titre</Label>
                      <p className="font-medium text-sm">{selectedRequest.title}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Discipline</Label>
                      <p className="font-medium text-sm">{selectedRequest.discipline}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Éditeur</Label>
                      <p className="font-medium text-sm">{selectedRequest.publisher}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Support</Label>
                      <p className="font-medium text-sm">{getSupportLabel(selectedRequest.support)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Fréquence</Label>
                      <p className="font-medium text-sm">{getFrequencyLabel(selectedRequest.frequency)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Langue</Label>
                      <p className="font-medium text-sm">{selectedRequest.language_code}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Pays</Label>
                      <p className="font-medium text-sm">{selectedRequest.country_code}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Date de soumission</Label>
                      <p className="font-medium text-sm">{format(new Date(selectedRequest.created_at), "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Contact</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Adresse</Label>
                      <p className="font-medium text-sm">{selectedRequest.contact_address}</p>
                    </div>
                    {selectedRequest.requester_email && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p className="font-medium text-sm">{selectedRequest.requester_email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fichiers joints */}
                {selectedRequest.justification_file_url && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                        <Paperclip className="h-3.5 w-3.5 inline mr-1.5" />
                        Fichiers joints
                      </h3>
                      <a
                        href={selectedRequest.justification_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                      >
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">Justificatif</p>
                          <p className="text-xs text-muted-foreground truncate">{selectedRequest.justification_file_url.split('/').pop()}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                  </>
                )}

                {/* Motif de refus */}
                {selectedRequest.rejection_reason && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm text-red-600 uppercase tracking-wide mb-2">Motif de refus</h3>
                      <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">{selectedRequest.rejection_reason}</p>
                    </div>
                  </>
                )}

                {/* Section Attribution ISSN */}
                {!selectedRequest.assigned_issn && selectedRequest.status !== "refusee" && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Attribution ISSN</h3>

                      {!attributionMode ? (
                        <div className="grid gap-2">
                          <Button
                            variant="outline"
                            className="justify-start h-auto py-3 px-4"
                            onClick={() => startAttribution("range")}
                          >
                            <BookOpen className="h-4 w-4 mr-3 text-[#1565C0]" />
                            <div className="text-left">
                              <div className="font-medium">Sélectionner depuis une tranche</div>
                              <div className="text-xs text-muted-foreground">Choisir le prochain numéro disponible dans une tranche ISSN</div>
                            </div>
                          </Button>
                          <Button
                            variant="outline"
                            className="justify-start h-auto py-3 px-4"
                            onClick={() => startAttribution("manual")}
                          >
                            <Hash className="h-4 w-4 mr-3 text-[#1565C0]" />
                            <div className="text-left">
                              <div className="font-medium">Saisir un numéro manuellement</div>
                              <div className="text-xs text-muted-foreground">Entrer un numéro ISSN spécifique</div>
                            </div>
                          </Button>
                          <Button
                            variant="outline"
                            className="justify-start h-auto py-3 px-4"
                            onClick={() => startAttribution("random")}
                          >
                            <Shuffle className="h-4 w-4 mr-3 text-[#1565C0]" />
                            <div className="text-left">
                              <div className="font-medium">Proposer un numéro aléatoire</div>
                              <div className="text-xs text-muted-foreground">Générer un ISSN aléatoire avec chiffre de contrôle valide</div>
                            </div>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={() => { setAttributionMode(null); setIssnNumber(""); setSelectedRangeId(""); }}
                          >
                            ← Retour aux options
                          </Button>

                          {attributionMode === "range" && (
                            <div className="space-y-3">
                              <Label>Sélectionner une tranche ISSN</Label>
                              {loadingRanges ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                              ) : issnRanges.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Aucune tranche ISSN active disponible</p>
                              ) : (
                                <div className="space-y-2">
                                  {issnRanges.map((range) => (
                                    <button
                                      key={range.id}
                                      onClick={() => selectFromRange(range.id)}
                                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                        selectedRangeId === range.id
                                          ? 'border-[#1565C0] bg-[#E3F2FD]'
                                          : 'border-border hover:border-[#1565C0]/50 hover:bg-muted/50'
                                      }`}
                                    >
                                      <div className="font-medium text-sm">{range.requester_name}</div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {range.range_start} → {range.range_end}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {range.total_numbers - range.used_numbers} disponible(s) sur {range.total_numbers}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {attributionMode === "manual" && (
                            <div className="space-y-2">
                              <Label>Numéro ISSN</Label>
                              <Input
                                placeholder="ex: 1234-5678"
                                value={issnNumber}
                                onChange={(e) => setIssnNumber(e.target.value)}
                                className="font-mono text-lg"
                                maxLength={9}
                              />
                              <p className="text-xs text-muted-foreground">Format : XXXX-XXXX</p>
                            </div>
                          )}

                          {attributionMode === "random" && (
                            <div className="space-y-2">
                              <Label>Numéro ISSN généré</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={issnNumber}
                                  onChange={(e) => setIssnNumber(e.target.value)}
                                  className="font-mono text-lg flex-1"
                                  maxLength={9}
                                />
                                <Button variant="outline" size="icon" onClick={generateRandomIssn} title="Régénérer">
                                  <Shuffle className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">Vous pouvez régénérer ou modifier le numéro proposé</p>
                            </div>
                          )}

                          {issnNumber && (
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <div className="text-sm text-muted-foreground mb-1">ISSN à attribuer :</div>
                              <div className="font-mono font-bold text-lg text-[#1565C0]">{issnNumber}</div>
                            </div>
                          )}

                          <Button
                            onClick={handleAttributeIssn}
                            disabled={attributing || !issnNumber.trim()}
                            className="w-full bg-[#1565C0] hover:bg-[#0D47A1]"
                          >
                            {attributing ? (
                              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Attribution...</>
                            ) : (
                              <><ArrowRight className="h-4 w-4 mr-2" />Attribuer l'ISSN</>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer actions */}
              {selectedRequest.status === "en_attente" && !selectedRequest.assigned_issn && (
                <div className="p-4 border-t bg-muted/20 flex gap-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleValidate(selectedRequest)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Valider
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => openRejectDialog(selectedRequest)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog de refus */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la demande ISSN</DialogTitle>
            <DialogDescription>Veuillez indiquer le motif du refus pour la demande {selectedRequest?.request_number}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Motif du refus <span className="text-destructive">*</span></Label>
              <Textarea placeholder="Saisir le motif détaillé du refus..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleReject}>Confirmer le refus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}