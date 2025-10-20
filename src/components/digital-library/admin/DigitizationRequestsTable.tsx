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
import { Label } from "@/components/ui/label";
import { Loader2, Download, ExternalLink, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { USAGE_TYPES } from "@/schemas/digitizationRequestSchema";

interface DigitizationRequest {
  id: string;
  user_name: string;
  user_email: string;
  document_title: string;
  document_cote: string | null;
  pages_count: number;
  justification: string;
  usage_type: string;
  attachment_url: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  en_attente: { label: "En attente", variant: "secondary" },
  en_cours: { label: "En cours", variant: "default" },
  approuve: { label: "Approuvé", variant: "default" },
  rejete: { label: "Rejeté", variant: "destructive" },
  termine: { label: "Terminé", variant: "outline" },
};

export function DigitizationRequestsTable() {
  const [requests, setRequests] = useState<DigitizationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DigitizationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DigitizationRequest | null>(null);

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
        .from("digitization_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
      setFilteredRequests(data || []);
    } catch (error) {
      console.error("Error loading digitization requests:", error);
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("digitization_requests")
        .update({ 
          status: newStatus,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      // Log activity
      await supabase.rpc("insert_activity_log", {
        p_action: `change_digitization_status_${newStatus}`,
        p_resource_type: "digitization_request",
        p_resource_id: requestId,
      });

      toast.success("Statut mis à jour");
      loadRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredRequests.map(r => ({
      "Nom du lecteur": r.user_name,
      "Email": r.user_email,
      "Document": r.document_title,
      "Cote": r.document_cote || "-",
      "Pages": r.pages_count,
      "Type d'utilisation": USAGE_TYPES[r.usage_type as keyof typeof USAGE_TYPES] || r.usage_type,
      "Justification": r.justification,
      "Statut": STATUS_LABELS[r.status]?.label || r.status,
      "Date de demande": format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: fr }),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Numérisations");
    XLSX.writeFile(wb, `numerisations_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
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
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="approuve">Approuvé</SelectItem>
              <SelectItem value="rejete">Rejeté</SelectItem>
              <SelectItem value="termine">Terminé</SelectItem>
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
              <TableHead>Pages</TableHead>
              <TableHead>Type</TableHead>
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
                  <TableCell>{request.pages_count}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {USAGE_TYPES[request.usage_type as keyof typeof USAGE_TYPES] || request.usage_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_LABELS[request.status]?.variant || "default"}>
                      {STATUS_LABELS[request.status]?.label || request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select
                        value={request.status}
                        onValueChange={(value) => handleStatusChange(request.id, value)}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en_attente">En attente</SelectItem>
                          <SelectItem value="en_cours">En cours</SelectItem>
                          <SelectItem value="approuve">Approuvé</SelectItem>
                          <SelectItem value="rejete">Rejeté</SelectItem>
                          <SelectItem value="termine">Terminé</SelectItem>
                        </SelectContent>
                      </Select>
                      {request.attachment_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(request.attachment_url!, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
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
    </div>
  );
}
