import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Scale, CheckCircle, XCircle, Eye, Clock, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { LegalDepositDetailsView } from "@/components/legal-deposit/LegalDepositDetailsView";
import { useSearchParams } from "react-router-dom";

interface ArbitrationRequest {
  id: string;
  request_number: string;
  title: string;
  subtitle?: string;
  support_type: string;
  status: string;
  author_name: string;
  created_at: string;
  metadata?: any;
  documents_urls?: any;
  arbitration_requested: boolean;
  arbitration_requested_at: string;
  arbitration_status: string;
  arbitration_reason: string;
  arbitration_requested_by?: string;
}

export function ArbitrationWorkflow() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState<ArbitrationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ArbitrationRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [decisionReason, setDecisionReason] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Gérer le paramètre URL ?request=... (depuis My Space)
  useEffect(() => {
    const requestId = searchParams.get('request');
    if (requestId && requests.length > 0) {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        setSelectedRequest(request);
        setIsDetailsOpen(true);
        // Nettoyer l'URL
        searchParams.delete('request');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, requests]);

  useEffect(() => {
    if (user) {
      fetchArbitrationRequests();
    }
  }, [user]);

  const fetchArbitrationRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("legal_deposit_requests")
        .select(`
          id,
          request_number,
          title,
          subtitle,
          support_type,
          status,
          author_name,
          created_at,
          metadata,
          documents_urls,
          arbitration_requested,
          arbitration_requested_at,
          arbitration_status,
          arbitration_reason,
          arbitration_requested_by
        `)
        .eq("arbitration_requested", true)
        .order("arbitration_requested_at", { ascending: false });

      if (error) {
        console.error("Error fetching arbitration requests:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les demandes d'arbitrage",
          variant: "destructive"
        });
        return;
      }

      setRequests(data as ArbitrationRequest[]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArbitrationDecision = async (approved: boolean) => {
    if (!selectedRequest || !user) return;
    
    setIsLoading(true);
    try {
      const newStatus = approved ? "approved" : "rejected";
      const { error } = await supabase
        .from("legal_deposit_requests")
        .update({
          arbitration_status: newStatus,
          arbitration_validated_at: new Date().toISOString(),
          arbitration_validated_by: user.id,
          arbitration_decision_reason: decisionReason,
          // Si approuvé, on peut valider la demande
          ...(approved ? {
            validated_by_department: user.id,
            department_validated_at: new Date().toISOString(),
            department_validation_notes: `Validé par arbitrage. Motif: ${decisionReason}`,
            status: "valide_par_b"
          } : {
            rejected_by: user.id,
            rejected_at: new Date().toISOString(),
            rejection_reason: `Rejeté par arbitrage. Motif: ${decisionReason}`,
            status: "rejete_par_b"
          })
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: approved ? "Arbitrage approuvé" : "Arbitrage rejeté",
        description: `La demande ${selectedRequest.request_number} a été ${approved ? "approuvée" : "rejetée"} par arbitrage.`
      });

      setShowApproveModal(false);
      setShowRejectModal(false);
      setIsDetailsOpen(false);
      setSelectedRequest(null);
      setDecisionReason("");
      fetchArbitrationRequests();
    } catch (error) {
      console.error("Error processing arbitration:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'arbitrage",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">En attente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approuvé</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = requests.filter(r => r.arbitration_status === "pending").length;
  const processedCount = requests.filter(r => r.arbitration_status !== "pending").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{requests.filter(r => r.arbitration_status === "approved").length}</div>
                <div className="text-sm text-muted-foreground">Approuvés</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{requests.filter(r => r.arbitration_status === "rejected").length}</div>
                <div className="text-sm text-muted-foreground">Rejetés</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-600" />
            Demandes d'arbitrage
          </CardTitle>
          <CardDescription>
            Liste des demandes nécessitant un arbitrage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Aucune demande d'arbitrage</h3>
              <p className="text-muted-foreground">Il n'y a actuellement aucune demande nécessitant un arbitrage.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Demande</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date demande</TableHead>
                  <TableHead>Statut arbitrage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id} className={request.arbitration_status === "pending" ? "bg-amber-50/50" : ""}>
                    <TableCell className="font-medium">{request.request_number}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{request.title}</TableCell>
                    <TableCell>{request.support_type}</TableCell>
                    <TableCell>
                      {request.arbitration_requested_at && 
                        format(new Date(request.arbitration_requested_at), "dd MMM yyyy", { locale: fr })
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(request.arbitration_status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-600" />
              Arbitrage - {selectedRequest?.request_number}
            </SheetTitle>
            <SheetDescription>
              Examen de la demande d'arbitrage
            </SheetDescription>
          </SheetHeader>

          {selectedRequest && (
            <div className="space-y-6 mt-6">
              {/* Motif de l'arbitrage */}
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    Motif de la demande d'arbitrage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-900">{selectedRequest.arbitration_reason}</p>
                  <p className="text-xs text-amber-700 mt-2">
                    Demandé le {selectedRequest.arbitration_requested_at && 
                      format(new Date(selectedRequest.arbitration_requested_at), "dd MMMM yyyy à HH:mm", { locale: fr })
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Détails complets de la demande */}
              <LegalDepositDetailsView request={selectedRequest} />

              {/* Actions d'arbitrage */}
              {selectedRequest.arbitration_status === "pending" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Décision d'arbitrage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="decision-reason">Motif de la décision</Label>
                      <Textarea
                        id="decision-reason"
                        placeholder="Expliquez votre décision..."
                        value={decisionReason}
                        onChange={(e) => setDecisionReason(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleArbitrationDecision(true)}
                        disabled={isLoading || !decisionReason.trim()}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleArbitrationDecision(false)}
                        disabled={isLoading || !decisionReason.trim()}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Afficher la décision si déjà traitée */}
              {selectedRequest.arbitration_status !== "pending" && (
                <Card className={selectedRequest.arbitration_status === "approved" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {selectedRequest.arbitration_status === "approved" ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-800">Arbitrage approuvé</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-800">Arbitrage rejeté</span>
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Cette demande a déjà été traitée.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
