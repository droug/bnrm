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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Archive, Download, Loader2 } from "lucide-react";
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
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ReservationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (filterStatus === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(r => r.status === filterStatus));
    }
  }, [filterStatus, requests]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reservations_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
      setFilteredRequests(data || []);
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Label>Filtrer par statut:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
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
              <TableHead>Date souhaitée</TableHead>
              <TableHead>Heure</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
    </div>
  );
}
