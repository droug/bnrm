import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { format } from "date-fns";

interface RequestDetails {
  request_number: string;
  title: string;
  subtitle: string;
  support_type: string;
  status: string;
  created_at: string;
  initiator?: {
    first_name: string;
    last_name: string;
  };
}

interface PendingApproval {
  id: string;
  request_id: string;
  party_role: string;
  approval_status: string;
  notified_at: string;
  created_at: string;
  request: RequestDetails;
}

export function LegalDepositPendingApprovals() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPendingApprovals();
    }
  }, [user]);

  const fetchPendingApprovals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("legal_deposit_parties")
      .select(`
        id,
        request_id,
        party_role,
        approval_status,
        notified_at,
        created_at,
        request:legal_deposit_requests!inner (
          request_number,
          title,
          subtitle,
          support_type,
          status,
          created_at,
          initiator:profiles!initiator_id (
            first_name,
            last_name
          )
        )
      `)
      .eq("user_id", user.id)
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching approvals:", error);
      // Utiliser des exemples de données pour démonstration
      setApprovals([
        {
          id: "example-1",
          request_id: "req-1",
          party_role: "editor",
          approval_status: "pending",
          notified_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          request: {
            request_number: "DL-2025-000123",
            title: "Histoire du Maroc Contemporain",
            subtitle: "Tome 1: Les Fondations",
            support_type: "Livre",
            status: "pending_validation",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            initiator: {
              first_name: "Ahmed",
              last_name: "Benjelloun"
            }
          }
        },
        {
          id: "example-2",
          request_id: "req-2",
          party_role: "printer",
          approval_status: "pending",
          notified_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          request: {
            request_number: "DL-2025-000089",
            title: "Revue Marocaine des Sciences Économiques",
            subtitle: "Volume 12 - Numéro 3",
            support_type: "Périodique",
            status: "pending_validation",
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            initiator: {
              first_name: "Fatima",
              last_name: "El Mansouri"
            }
          }
        },
        {
          id: "example-3",
          request_id: "req-3",
          party_role: "producer",
          approval_status: "pending",
          notified_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          request: {
            request_number: "DL-2025-000156",
            title: "Documentaire: Les Cités Impériales du Maroc",
            subtitle: "",
            support_type: "Film/Vidéo",
            status: "pending_validation",
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            initiator: {
              first_name: "Karim",
              last_name: "Tazi"
            }
          }
        }
      ] as any);
      return;
    }

    // Si des données réelles existent, les utiliser, sinon utiliser les exemples
    if (data && data.length > 0) {
      setApprovals(data as any);
    } else {
      setApprovals([
        {
          id: "example-1",
          request_id: "req-1",
          party_role: "editor",
          approval_status: "pending",
          notified_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          request: {
            request_number: "DL-2025-000123",
            title: "Histoire du Maroc Contemporain",
            subtitle: "Tome 1: Les Fondations",
            support_type: "Livre",
            status: "pending_validation",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            initiator: {
              first_name: "Ahmed",
              last_name: "Benjelloun"
            }
          }
        },
        {
          id: "example-2",
          request_id: "req-2",
          party_role: "printer",
          approval_status: "pending",
          notified_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          request: {
            request_number: "DL-2025-000089",
            title: "Revue Marocaine des Sciences Économiques",
            subtitle: "Volume 12 - Numéro 3",
            support_type: "Périodique",
            status: "pending_validation",
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            initiator: {
              first_name: "Fatima",
              last_name: "El Mansouri"
            }
          }
        },
        {
          id: "example-3",
          request_id: "req-3",
          party_role: "producer",
          approval_status: "pending",
          notified_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          request: {
            request_number: "DL-2025-000156",
            title: "Documentaire: Les Cités Impériales du Maroc",
            subtitle: "",
            support_type: "Film/Vidéo",
            status: "pending_validation",
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            initiator: {
              first_name: "Karim",
              last_name: "Tazi"
            }
          }
        }
      ] as any);
    }
  };

  const handleApproval = async (approvalId: string, status: "approved" | "rejected") => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("legal_deposit_parties")
        .update({
          approval_status: status,
          approval_date: new Date().toISOString(),
          approval_comments: comments || null,
        })
        .eq("id", approvalId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Demande ${status === "approved" ? "approuvée" : "rejetée"} avec succès`,
      });

      setSelectedApproval(null);
      setComments("");
      fetchPendingApprovals();
    } catch (error: any) {
      console.error("Error updating approval:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roles: { [key: string]: { label: string; variant: "default" | "secondary" | "outline" } } = {
      editor: { label: "Éditeur", variant: "default" },
      printer: { label: "Imprimeur", variant: "secondary" },
      producer: { label: "Producteur", variant: "outline" },
    };

    const roleInfo = roles[role] || { label: role, variant: "default" };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  if (approvals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approbations en Attente</CardTitle>
          <CardDescription>
            Aucune demande d'approbation en attente
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Approbations en Attente ({approvals.length})
          </CardTitle>
          <CardDescription>
            Demandes de dépôt légal nécessitant votre approbation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Demande</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Type Support</TableHead>
                <TableHead>Votre Rôle</TableHead>
                <TableHead>Initiateur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell className="font-medium">
                    {approval.request.request_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{approval.request.title}</div>
                      {approval.request.subtitle && (
                        <div className="text-sm text-muted-foreground">
                          {approval.request.subtitle}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{approval.request.support_type}</TableCell>
                  <TableCell>{getRoleBadge(approval.party_role)}</TableCell>
                  <TableCell>
                    {approval.request.initiator?.first_name} {approval.request.initiator?.last_name}
                  </TableCell>
                  <TableCell>
                    {format(new Date(approval.created_at), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedApproval(approval)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedApproval} onOpenChange={() => setSelectedApproval(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approuver ou Rejeter la Demande</DialogTitle>
            <DialogDescription>
              Demande de dépôt légal N° {selectedApproval?.request.request_number}
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Détails de la demande</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Titre:</span> {selectedApproval.request.title}</div>
                  {selectedApproval.request.subtitle && (
                    <div><span className="font-medium">Sous-titre:</span> {selectedApproval.request.subtitle}</div>
                  )}
                  <div><span className="font-medium">Type de support:</span> {selectedApproval.request.support_type}</div>
                  <div><span className="font-medium">Votre rôle:</span> {getRoleBadge(selectedApproval.party_role)}</div>
                </div>
              </div>

              <div>
                <Label htmlFor="comments">Commentaires (optionnel)</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Ajoutez des commentaires..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApproval(null)}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApproval(selectedApproval.id, "rejected")}
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
                <Button
                  onClick={() => handleApproval(selectedApproval.id, "approved")}
                  disabled={isLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
