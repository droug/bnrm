import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertTriangle, Building2, Printer, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface PendingConfirmation {
  token_id: string;
  request_id: string;
  request_number: string;
  title: string;
  party_type: string;
  initiator_name: string;
  created_at: string;
  expires_at: string;
  token?: string;
}

export function PendingConfirmationsWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmations, setConfirmations] = useState<PendingConfirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPendingConfirmations();
    }
  }, [user]);

  const fetchPendingConfirmations = async () => {
    try {
      // Utiliser la fonction RPC pour obtenir les confirmations en attente
      const { data, error } = await supabase.rpc("get_pending_confirmations_for_user", {
        p_user_id: user?.id,
      });

      if (error) throw error;

      // Récupérer les tokens pour chaque confirmation
      if (data && data.length > 0) {
        const { data: tokens } = await supabase
          .from("deposit_confirmation_tokens")
          .select("id, token")
          .in("id", data.map((c: any) => c.token_id));

        const tokenMap = new Map(tokens?.map(t => [t.id, t.token]) || []);
        
        setConfirmations(data.map((c: any) => ({
          ...c,
          token: tokenMap.get(c.token_id),
        })));
      } else {
        setConfirmations([]);
      }
    } catch (err) {
      console.error("Error fetching pending confirmations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (confirmation: PendingConfirmation) => {
    if (!confirmation.token) {
      toast.error("Token de confirmation non disponible");
      return;
    }

    setProcessing(confirmation.token_id);
    try {
      const { data, error } = await supabase.functions.invoke("deposit-confirmation", {
        body: { action: "confirm", token: confirmation.token },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Confirmation enregistrée !");
        fetchPendingConfirmations();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la confirmation");
    } finally {
      setProcessing(null);
    }
  };

  const handleViewDetails = (confirmation: PendingConfirmation) => {
    if (confirmation.token) {
      navigate(`/confirm-deposit/${confirmation.token}`);
    }
  };

  if (loading) {
    return null;
  }

  if (confirmations.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg">Confirmations en attente</CardTitle>
        </div>
        <CardDescription>
          {confirmations.length} demande{confirmations.length > 1 ? "s" : ""} de dépôt légal nécessite{confirmations.length > 1 ? "nt" : ""} votre confirmation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {confirmations.map((confirmation) => {
          const isExpiringSoon = new Date(confirmation.expires_at).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
          const PartyIcon = confirmation.party_type === "editor" ? Building2 : Printer;
          const partyLabel = confirmation.party_type === "editor" ? "Éditeur" : "Imprimeur";

          return (
            <div
              key={confirmation.token_id}
              className="flex items-center justify-between gap-4 p-3 bg-background rounded-lg border"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <PartyIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{confirmation.request_number}</p>
                    <Badge variant="outline" className="shrink-0">
                      {partyLabel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {confirmation.title || "Sans titre"}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className={`h-3 w-3 ${isExpiringSoon ? "text-red-500" : "text-muted-foreground"}`} />
                    <span className={`text-xs ${isExpiringSoon ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                      Expire {formatDistanceToNow(new Date(confirmation.expires_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetails(confirmation)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleConfirm(confirmation)}
                  disabled={processing === confirmation.token_id}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirmer
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
