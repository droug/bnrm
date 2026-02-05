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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Loader2, Download, ExternalLink, UserPlus, Eye, Check, X } from "lucide-react";
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
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
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
      
      // Ajouter des exemples si la table est vide
      const requestsData = data || [];
      if (requestsData.length === 0) {
        const mockRequests: DigitizationRequest[] = [
          {
            id: "mock-dig-1",
            user_name: "Mohamed Tazi",
            user_email: "m.tazi@example.ma",
            document_title: "Traité de médecine traditionnelle marocaine",
            document_cote: "MED-TRAD-089",
            pages_count: 45,
            justification: "Recherche pour publication scientifique sur les plantes médicinales du Maroc",
            usage_type: "recherche",
            attachment_url: null,
            status: "en_attente",
            admin_notes: null,
            reviewed_by: null,
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "mock-dig-2",
            user_name: "Leila Mansouri",
            user_email: "l.mansouri@example.ma",
            document_title: "Recueil de poésie amazighe",
            document_cote: "POE-AMZ-234",
            pages_count: 120,
            justification: "Conservation personnelle et étude linguistique",
            usage_type: "conservation",
            attachment_url: null,
            status: "en_cours",
            admin_notes: "Assigné à l'équipe de numérisation - Priorité moyenne",
            reviewed_by: "admin-123",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "mock-dig-3",
            user_name: "Rachid Cherki",
            user_email: "r.cherki@example.ma",
            document_title: "Plans architecturaux - Médina de Marrakech",
            document_cote: "ARCH-PLAN-056",
            pages_count: 28,
            justification: "Projet de restauration urbaine - Collaboration avec ministère de l'habitat",
            usage_type: "diffusion",
            attachment_url: "https://example.com/authorization.pdf",
            status: "approuve",
            admin_notes: "Demande approuvée - Usage à des fins patrimoniales",
            reviewed_by: "admin-456",
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "mock-dig-4",
            user_name: "Imane El Khatib",
            user_email: "i.elkhatib@example.ma",
            document_title: "Journal Al-Maghrib 1950-1955",
            document_cote: "PRESSE-MAG-1950",
            pages_count: 180,
            justification: "Thèse de doctorat en histoire du journalisme marocain",
            usage_type: "education",
            attachment_url: null,
            status: "termine",
            admin_notes: "Numérisation complétée - Fichiers envoyés au demandeur",
            reviewed_by: "admin-789",
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "mock-dig-5",
            user_name: "Youssef Berrada",
            user_email: "y.berrada@example.ma",
            document_title: "Manuscrit enluminé - Coran du 14ème siècle",
            document_cote: "COR-MS-014",
            pages_count: 350,
            justification: "Usage commercial pour exposition internationale",
            usage_type: "commercial",
            attachment_url: null,
            status: "rejete",
            admin_notes: "Demande refusée - Document trop fragile. Usage commercial non autorisé pour ce manuscrit classé patrimoine national",
            reviewed_by: "admin-456",
            created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        setRequests(mockRequests);
        setFilteredRequests(mockRequests);
      } else {
        setRequests(requestsData);
        setFilteredRequests(requestsData);
      }
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
                            onClick={() => handleStatusChange(request.id, "en_cours")}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(request.id, "rejete")}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </>
                      )}
                      {request.status === "en_cours" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(request.id, "termine")}
                        >
                          Marquer terminé
                        </Button>
                      )}
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

      {/* Details Sheet */}
      <Sheet open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de la demande de numérisation</SheetTitle>
          </SheetHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Lecteur</Label>
                  <p className="font-medium">{selectedRequest.user_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.user_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className="mt-1">
                    <Badge variant={STATUS_LABELS[selectedRequest.status]?.variant || "default"}>
                      {STATUS_LABELS[selectedRequest.status]?.label || selectedRequest.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Document demandé</Label>
                <p className="font-medium">{selectedRequest.document_title}</p>
                {selectedRequest.document_cote && (
                  <p className="text-sm text-muted-foreground">Cote: {selectedRequest.document_cote}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nombre de pages</Label>
                  <p className="font-medium">{selectedRequest.pages_count} pages</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type d'utilisation</Label>
                  <p className="font-medium">
                    {USAGE_TYPES[selectedRequest.usage_type as keyof typeof USAGE_TYPES] || selectedRequest.usage_type}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Justification</Label>
                <p className="text-sm mt-1">{selectedRequest.justification}</p>
              </div>

              {selectedRequest.attachment_url && (
                <div>
                  <Label className="text-muted-foreground">Pièce jointe</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => window.open(selectedRequest.attachment_url!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Télécharger la pièce jointe
                  </Button>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div>
                  <Label className="text-muted-foreground">Notes administrateur</Label>
                  <p className="text-sm mt-1">{selectedRequest.admin_notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground">Date de création</Label>
                  <p className="text-sm">
                    {format(new Date(selectedRequest.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Dernière modification</Label>
                  <p className="text-sm">
                    {format(new Date(selectedRequest.updated_at), "dd/MM/yyyy HH:mm", { locale: fr })}
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
