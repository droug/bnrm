import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Clock, BookOpen } from "lucide-react";

interface LegalDepositRequest {
  id: string;
  request_number: string;
  title: string;
  author_name: string | null;
  support_type: string;
  status: string;
  created_at: string;
  submission_date: string | null;
  dl_number: string | null;
}

export function MyLegalDeposits() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<LegalDepositRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDeposits();
    }
  }, [user]);

  const fetchDeposits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('legal_deposit_requests')
        .select('*')
        .eq('initiator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setDeposits(data);
    } catch (error) {
      console.error('Error fetching legal deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      brouillon: { label: "Brouillon", variant: "outline" },
      soumis: { label: "Soumis", variant: "default" },
      en_attente_validation_b: { label: "En attente validation B", variant: "default" },
      valide_par_b: { label: "Validé par B", variant: "secondary" },
      rejete_par_b: { label: "Rejeté par B", variant: "destructive" },
      en_attente_comite_validation: { label: "En attente comité", variant: "default" },
      valide_par_comite: { label: "Validé par comité", variant: "secondary" },
      rejete_par_comite: { label: "Rejeté par comité", variant: "destructive" },
      attribue: { label: "Attribué", variant: "secondary" },
      rejete: { label: "Rejeté", variant: "destructive" },
      termine: { label: "Terminé", variant: "secondary" }
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dépôts légaux</CardTitle>
        <CardDescription>
          Suivez vos dépôts légaux
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {deposits.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun dépôt légal pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deposits.map((deposit) => (
                <Card key={deposit.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{deposit.title}</h3>
                        {deposit.author_name && (
                          <p className="text-sm text-muted-foreground">{deposit.author_name}</p>
                        )}
                      </div>
                      {getStatusBadge(deposit.status)}
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {deposit.request_number}
                        </Badge>
                        {deposit.dl_number && (
                          <Badge variant="secondary">
                            DL: {deposit.dl_number}
                          </Badge>
                        )}
                      </div>
                      {deposit.support_type && (
                        <p className="text-sm">
                          <span className="font-medium">Support:</span> {deposit.support_type}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Créé le {formatDate(deposit.created_at)}
                      </span>
                      {deposit.submission_date && (
                        <span>
                          Soumis le {formatDate(deposit.submission_date)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
