import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Archive, Download, Loader2, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ReservationRequest {
  id: string;
  user_name: string;
  user_email: string;
  document_title: string;
  document_cote: string | null;
  requested_date: string;
  requested_time: string;
  status: string;
  comments: string | null;
  admin_comments: string | null;
  created_at: string;
  updated_at: string;
  document_status?: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  en_attente: { label: "En attente", variant: "secondary" },
  acceptee: { label: "Acceptée", variant: "default" },
  refusee: { label: "Refusée", variant: "destructive" },
  terminee: { label: "Terminée", variant: "outline" },
};

export function ReservationRequestsTable() {
  const [requests, setRequests] = useState<ReservationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ReservationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDocumentStatus, setFilterDocumentStatus] = useState<string>("all");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ReservationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    let filtered = requests;
    
    // Filtre par statut de demande
    if (filterStatus !== "all") {
      filtered = filtered.filter(r => r.status === filterStatus);
    }
    
    // Filtre par statut du document
    if (filterDocumentStatus !== "all") {
      filtered = filtered.filter(r => r.document_status === filterDocumentStatus);
    }
    
    setFilteredRequests(filtered);
  }, [filterStatus, filterDocumentStatus, requests]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reservations_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Ajouter des exemples si la table est vide
      const requestsData = data || [];
      if (requestsData.length === 0) {
        const mockRequests: ReservationRequest[] = [
          {
            id: "mock-1",
            user_name: "Ahmed El Fassi",
            user_email: "ahmed.elfassi@example.ma",
            document_title: "Histoire du Maroc Numérisé - Tome I",
            document_cote: "MAR-HIST-NUM-001",
            document_status: "numerise",
            requested_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            requested_time: "14:00",
            status: "en_attente",
            comments: "Je souhaite consulter ce document numérisé pour mes recherches",
            admin_comments: null,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "mock-2",
            user_name: "Fatima Zahra Benani",
            user_email: "f.benani@example.ma",
            document_title: "Manuscrits arabes numérisés du 12ème siècle",
            document_cote: "ARA-MS-NUM-147",
            document_status: "numerise",
            requested_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            requested_time: "10:30",
            status: "acceptee",
            comments: "Consultation en ligne du document numérisé",
            admin_comments: "Accès numérique accordé",
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "mock-3",
            user_name: "Karim Alaoui",
            user_email: "k.alaoui@example.ma",
            document_title: "Archives coloniales 1920-1956",
            document_cote: "ARCH-COL-032",
            document_status: "physique",
            requested_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            requested_time: "15:00",
            status: "refusee",
            comments: "Document physique pour publication",
            admin_comments: "Document en cours de restauration, non disponible pour consultation",
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "mock-4",
            user_name: "Sarah Benjelloun",
            user_email: "sarah.b@example.ma",
            document_title: "Collection photographique numérisée - Fès 1900",
            document_cote: "PHOTO-FES-NUM-1900",
            document_status: "numerise",
            requested_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            requested_time: "11:00",
            status: "terminee",
            comments: "Projet documentaire - accès numérique",
            admin_comments: null,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "mock-5",
            user_name: "Omar Idrissi",
            user_email: "o.idrissi@example.ma",
            document_title: "Traité de mathématiques andalous",
            document_cote: "MATH-AND-234",
            document_status: "en_cours_numerisation",
            requested_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            requested_time: "09:30",
            status: "en_attente",
            comments: "Document en cours de numérisation, réservation anticipée",
            admin_comments: null,
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          },
        ];
        setRequests(mockRequests);
        setFilteredRequests(mockRequests);
      } else {
        setRequests(requestsData);
        setFilteredRequests(requestsData);
      }
    } catch (error) {
      console.error("Error loading reservation requests:", error);
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (request: ReservationRequest) => {
    try {
      const { error } = await supabase
        .from("reservations_requests")
        .update({ 
          status: "acceptee",
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (error) throw error;

      // Log activity
      await supabase.rpc("insert_activity_log", {
        p_action: "accept_reservation",
        p_resource_type: "reservation_request",
        p_resource_id: request.id,
        p_details: { user_email: request.user_email, document: request.document_title },
      });

      toast.success("Demande acceptée avec succès");
      loadRequests();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Erreur lors de l'acceptation");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      toast.error("Veuillez indiquer un motif de refus");
      return;
    }

    try {
      const { error } = await supabase
        .from("reservations_requests")
        .update({ 
          status: "refusee",
          admin_comments: rejectReason,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      // Log activity
      await supabase.rpc("insert_activity_log", {
        p_action: "reject_reservation",
        p_resource_type: "reservation_request",
        p_resource_id: selectedRequest.id,
        p_details: { 
          user_email: selectedRequest.user_email, 
          document: selectedRequest.document_title,
          reason: rejectReason 
        },
      });

      toast.success("Demande refusée");
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedRequest(null);
      loadRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Erreur lors du refus");
    }
  };

  const handleArchive = async (request: ReservationRequest) => {
    try {
      const { error } = await supabase
        .from("reservations_requests")
        .update({ status: "terminee" })
        .eq("id", request.id);

      if (error) throw error;

      // Log activity
      await supabase.rpc("insert_activity_log", {
        p_action: "archive_reservation",
        p_resource_type: "reservation_request",
        p_resource_id: request.id,
        p_details: { user_email: request.user_email, document: request.document_title },
      });

      toast.success("Demande archivée");
      loadRequests();
    } catch (error) {
      console.error("Error archiving request:", error);
      toast.error("Erreur lors de l'archivage");
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredRequests.map(r => ({
      "Nom du lecteur": r.user_name,
      "Email": r.user_email,
      "Document": r.document_title,
      "Cote": r.document_cote || "-",
      "Date souhaitée": format(new Date(r.requested_date), "dd/MM/yyyy", { locale: fr }),
      "Heure": r.requested_time,
      "Statut": STATUS_LABELS[r.status]?.label || r.status,
      "Commentaire": r.comments || "-",
      "Date de demande": format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: fr }),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Réservations");
    XLSX.writeFile(wb, `reservations_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("Export Excel réussi");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Export */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label>Statut demande:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="acceptee">Acceptée</SelectItem>
                <SelectItem value="refusee">Refusée</SelectItem>
                <SelectItem value="terminee">Terminée</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label>Statut document:</Label>
            <Select value={filterDocumentStatus} onValueChange={setFilterDocumentStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="physique">Physique</SelectItem>
                <SelectItem value="numerise">Numérisé</SelectItem>
                <SelectItem value="en_cours_numerisation">En cours de numérisation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={exportToExcel} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter en Excel
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom Lecteur</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Statut Document</TableHead>
              <TableHead>Date souhaitée</TableHead>
              <TableHead>Heure</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucune demande trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.user_name}</p>
                      <p className="text-sm text-muted-foreground">{request.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.document_title}</p>
                      {request.document_cote && (
                        <p className="text-sm text-muted-foreground">Cote: {request.document_cote}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.document_status ? (
                      <Badge variant={request.document_status === "numerise" ? "default" : "secondary"}>
                        {request.document_status === "numerise" ? "Numérisé" :
                         request.document_status === "physique" ? "Physique" :
                         request.document_status === "en_cours_numerisation" ? "En cours" : 
                         request.document_status}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Non spécifié</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.requested_date), "dd/MM/yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>{request.requested_time}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_LABELS[request.status]?.variant || "default"}>
                      {STATUS_LABELS[request.status]?.label || request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                      {request.status === "en_attente" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAccept(request)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectDialog(true);
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Refuser
                          </Button>
                        </>
                      )}
                      {(request.status === "acceptee" || request.status === "refusee") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleArchive(request)}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Archiver
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

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motif du refus</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du refus de cette demande de réservation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Motif *</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Expliquez la raison du refus..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setRejectReason("");
              setSelectedRequest(null);
            }}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Sheet */}
      <Sheet open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl">Détails de la demande de réservation</SheetTitle>
            <SheetDescription>
              Informations complètes sur la demande et le demandeur
            </SheetDescription>
          </SheetHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Informations du demandeur */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Informations du demandeur
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Nom complet</Label>
                    <p className="font-medium text-base mt-1">{selectedRequest.user_name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Email</Label>
                    <p className="font-medium text-base mt-1">{selectedRequest.user_email}</p>
                  </div>
                </div>
              </div>

              {/* Informations du document */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-base mb-3">Document demandé</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Titre</Label>
                    <p className="font-medium text-base mt-1">{selectedRequest.document_title}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRequest.document_cote && (
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase">Cote</Label>
                        <p className="font-mono text-sm mt-1 bg-muted px-2 py-1 rounded inline-block">
                          {selectedRequest.document_cote}
                        </p>
                      </div>
                    )}
                    {selectedRequest.document_status && (
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase">Type de document</Label>
                        <div className="mt-1">
                          <Badge variant={selectedRequest.document_status === "numerise" ? "default" : "secondary"}>
                            {selectedRequest.document_status === "numerise" ? "📱 Numérisé" :
                             selectedRequest.document_status === "physique" ? "📚 Physique" :
                             selectedRequest.document_status === "en_cours_numerisation" ? "⏳ En cours" : 
                             selectedRequest.document_status}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Détails de la réservation */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-base mb-3">Détails de la réservation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Date souhaitée</Label>
                    <p className="font-medium text-base mt-1">
                      {format(new Date(selectedRequest.requested_date), "dd MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Heure</Label>
                    <p className="font-medium text-base mt-1">{selectedRequest.requested_time}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Statut</Label>
                    <div className="mt-1">
                      <Badge variant={STATUS_LABELS[selectedRequest.status]?.variant || "default"}>
                        {STATUS_LABELS[selectedRequest.status]?.label || selectedRequest.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commentaires */}
              {(selectedRequest.comments || selectedRequest.admin_comments) && (
                <div className="space-y-3">
                  {selectedRequest.comments && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Label className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                        💬 Commentaire du lecteur
                      </Label>
                      <p className="text-sm mt-2">{selectedRequest.comments}</p>
                    </div>
                  )}

                  {selectedRequest.admin_comments && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <Label className="text-xs text-muted-foreground uppercase flex items-center gap-2">
                        🔐 Commentaire administrateur
                      </Label>
                      <p className="text-sm mt-2">{selectedRequest.admin_comments}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Métadonnées */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">Demande créée le</Label>
                  <p className="text-sm mt-1">
                    {format(new Date(selectedRequest.created_at), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">Dernière modification</Label>
                  <p className="text-sm mt-1">
                    {format(new Date(selectedRequest.updated_at), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            </div>
          )}
          </SheetContent>
      </Sheet>
    </div>
  );
}
