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

    try {
      // Récupérer les parties en attente de l'utilisateur
      const { data: partiesData, error: partiesError } = await supabase
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
            initiator_id
          )
        `)
        .eq("user_id", user.id)
        .eq("approval_status", "pending")
        .order("created_at", { ascending: false });

      if (partiesError) {
        console.error("Error fetching approvals:", partiesError);
        loadExampleData();
        return;
      }

      if (!partiesData || partiesData.length === 0) {
        setApprovals([]);
        return;
      }

      // Récupérer les profils des initiateurs
      const initiatorIds = [...new Set(partiesData.map(p => (p.request as any)?.initiator_id).filter(Boolean))];
      
      let profilesMap: Record<string, { first_name: string | null; last_name: string | null }> = {};
      
      if (initiatorIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", initiatorIds);
        
        if (profilesData) {
          profilesData.forEach(p => {
            profilesMap[p.user_id] = { first_name: p.first_name, last_name: p.last_name };
          });
        }
      }

      // Mapper les données avec les profils
      const mappedApprovals = partiesData.map(party => ({
        id: party.id,
        request_id: party.request_id,
        party_role: party.party_role,
        approval_status: party.approval_status,
        notified_at: party.notified_at,
        created_at: party.created_at,
        request: {
          request_number: (party.request as any)?.request_number || '',
          title: (party.request as any)?.title || '',
          subtitle: (party.request as any)?.subtitle || '',
          support_type: (party.request as any)?.support_type || '',
          status: (party.request as any)?.status || '',
          created_at: (party.request as any)?.created_at || '',
          initiator: profilesMap[(party.request as any)?.initiator_id] || null,
        }
      }));

      setApprovals(mappedApprovals as any);
    } catch (err) {
      console.error("Error in fetchPendingApprovals:", err);
      loadExampleData();
    }
  };

  const loadExampleData = () => {
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

      <Sheet open={!!selectedApproval} onOpenChange={() => setSelectedApproval(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Approuver ou Rejeter la Demande</SheetTitle>
            <SheetDescription>
              Demande de dépôt légal N° {selectedApproval?.request.request_number}
            </SheetDescription>
          </SheetHeader>
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
        </SheetContent>
      </Sheet>
    </>
  );
}
