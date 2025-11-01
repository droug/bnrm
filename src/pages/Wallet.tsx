import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PaymentDialog from "@/components/PaymentDialog";
import { 
  Wallet as WalletIcon, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Plus
} from "lucide-react";
import { toast } from "sonner";

interface WalletData {
  id: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
  reference_id: string | null;
}

export default function Wallet() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(100);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      setLoadingWallet(true);

      // Fetch wallet
      const { data: walletData, error: walletError } = await supabase
        .from("bnrm_wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (walletError && walletError.code !== "PGRST116") {
        throw walletError;
      }

      if (!walletData) {
        // Create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from("bnrm_wallets")
          .insert([
            {
              user_id: user.id,
              balance: 0,
              currency: "MAD",
              is_active: true,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        setWallet(newWallet);
      } else {
        setWallet(walletData);
      }

      // Fetch transactions
      if (walletData?.id) {
        const { data: transactionsData, error: transError } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (transError) throw transError;
        setTransactions(transactionsData || []);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast.error("Erreur lors du chargement du portefeuille");
    } finally {
      setLoadingWallet(false);
    }
  };

  const handleRechargeSuccess = () => {
    setShowRechargeDialog(false);
    fetchWalletData();
    toast.success("Rechargement effectué avec succès");
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "recharge":
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case "debit":
      case "payment":
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "recharge":
        return "text-green-600";
      case "debit":
      case "payment":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading || loadingWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <WalletIcon className="h-10 w-10 text-primary" />
              Mon e-Wallet BNRM
            </h1>
            <p className="text-muted-foreground">
              Gérez votre portefeuille électronique et vos transactions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wallet Balance Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Solde disponible
                  {wallet?.is_active ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Inactif
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Portefeuille électronique BNRM</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {wallet?.balance?.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {wallet?.currency || "MAD"}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setShowRechargeDialog(true)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Recharger le portefeuille
                  </Button>

                  <div className="text-xs text-center text-muted-foreground">
                    Dernière mise à jour : {new Date(wallet?.updated_at || "").toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions History */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Historique des transactions</CardTitle>
                <CardDescription>
                  {transactions.length} transaction(s) récente(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune transaction pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-accent">
                            {getTransactionIcon(transaction.transaction_type)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.description || transaction.transaction_type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                            {transaction.transaction_type === "recharge" ? "+" : "-"}
                            {Math.abs(transaction.amount).toFixed(2)} {wallet?.currency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Solde: {transaction.balance_after.toFixed(2)} {wallet?.currency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Utilisez votre e-wallet pour payer vos services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center gap-2"
                  onClick={() => navigate("/reproduction")}
                >
                  <CreditCard className="h-8 w-8" />
                  <span className="font-medium">Reproduction de documents</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center gap-2"
                  onClick={() => navigate("/tarifs-bnrm")}
                >
                  <WalletIcon className="h-8 w-8" />
                  <span className="font-medium">Services BNRM</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center gap-2"
                  onClick={() => navigate("/admin/legal-deposit")}
                >
                  <CreditCard className="h-8 w-8" />
                  <span className="font-medium">Dépôt légal</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* Recharge Dialog */}
      <PaymentDialog
        open={showRechargeDialog}
        onOpenChange={setShowRechargeDialog}
        amount={rechargeAmount}
        description={`Rechargement e-wallet de ${rechargeAmount} MAD`}
        transactionType="recharge_wallet"
        onSuccess={handleRechargeSuccess}
      />
    </div>
  );
}
