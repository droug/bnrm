import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface PaymentTransaction {
  id: string;
  transaction_number: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  transaction_type: string;
  created_at: string | null;
  completed_at: string | null;
  metadata: any;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pending: { label: "En attente", variant: "outline", icon: Clock },
  processing: { label: "En cours", variant: "secondary", icon: Loader2 },
  completed: { label: "Payé", variant: "default", icon: CheckCircle },
  failed: { label: "Échoué", variant: "destructive", icon: XCircle },
  refunded: { label: "Remboursé", variant: "outline", icon: AlertCircle },
  cancelled: { label: "Annulé", variant: "destructive", icon: XCircle },
};

const typeLabels: Record<string, string> = {
  reproduction: "Reproduction",
  legal_deposit: "Dépôt légal",
  restoration: "Restauration",
  subscription: "Abonnement",
  service: "Service",
};

export function MyPayments() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("id, transaction_number, amount, currency, payment_method, payment_status, transaction_type, created_at, completed_at, metadata")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching payment transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Chargement des paiements...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Mes paiements
        </CardTitle>
        <CardDescription>
          Historique de vos paiements par carte bancaire
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Aucun paiement</h3>
            <p className="text-muted-foreground text-sm">
              Vous n'avez effectué aucun paiement par carte bancaire pour le moment.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {transactions.map((tx) => {
                const status = statusConfig[tx.payment_status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {typeLabels[tx.transaction_type] || tx.transaction_type}
                        </span>
                        <Badge variant={status.variant} className="text-xs gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        N° {tx.transaction_number} • {formatDate(tx.created_at)}
                      </p>
                      {tx.metadata?.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {tx.metadata.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-sm">
                        {formatAmount(tx.amount, tx.currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
