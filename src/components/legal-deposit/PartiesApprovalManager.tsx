import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";

interface Party {
  id: string;
  request_id: string;
  user_id: string;
  party_role: string;
  is_initiator: boolean;
  approval_status: string;
  approval_date: string | null;
  approval_comments: string | null;
  notified_at: string | null;
}

interface LegalDepositRequest {
  id: string;
  request_number: string;
  title: string;
  status: string;
}

export function PartiesApprovalManager() {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState<(Party & { request: LegalDepositRequest })[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      fetchPendingApprovals();
    }
  }, [user]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_deposit_parties')
        .select(`
          *,
          request:legal_deposit_requests(id, request_number, title, status)
        `)
        .eq('user_id', user?.id)
        .eq('approval_status', 'pending');

      if (error) throw error;

      setPendingApprovals(data || []);
    } catch (error: any) {
      console.error('Error fetching pending approvals:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes d'approbation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (partyId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('legal_deposit_parties')
        .update({
          approval_status: status,
          approval_date: new Date().toISOString(),
          approval_comments: comments[partyId] || null,
        })
        .eq('id', partyId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: status === 'approved' 
          ? "Demande approuvée avec succès" 
          : "Demande rejetée",
      });

      fetchPendingApprovals();
    } catch (error: any) {
      console.error('Error updating approval:', error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      editor: "Éditeur",
      printer: "Imprimeur",
      producer: "Producteur",
    };
    return labels[role] || role;
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (pendingApprovals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demandes d'Approbation</CardTitle>
          <CardDescription>
            Aucune demande d'approbation en attente
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Demandes d'Approbation</h2>
        <p className="text-muted-foreground">
          Approuvez ou refusez les demandes de dépôt légal vous concernant
        </p>
      </div>

      {pendingApprovals.map((party) => (
        <Card key={party.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {party.request.title}
                </CardTitle>
                <CardDescription>
                  N° {party.request.request_number}
                </CardDescription>
              </div>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                En attente
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Vous êtes invité en tant que <strong>{getRoleLabel(party.party_role)}</strong>
              </p>
            </div>

            <div>
              <Label htmlFor={`comments-${party.id}`}>Commentaires (optionnel)</Label>
              <Textarea
                id={`comments-${party.id}`}
                value={comments[party.id] || ''}
                onChange={(e) => setComments({ ...comments, [party.id]: e.target.value })}
                placeholder="Ajoutez un commentaire..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleApproval(party.id, 'approved')}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver
              </Button>
              <Button
                onClick={() => handleApproval(party.id, 'rejected')}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Refuser
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}