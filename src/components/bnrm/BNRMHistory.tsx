import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, History, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TariffHistory {
  id: string;
  id_tarif: string;
  ancienne_valeur: number | null;
  nouvelle_valeur: number | null;
  date_modification: string;
  utilisateur_responsable: string | null;
  commentaire: string | null;
  action: string;
}

export function BNRMHistory() {
  const [history, setHistory] = useState<TariffHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('bnrm_tarifs_historique')
        .select('*')
        .order('date_modification', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const actions = Array.from(new Set(history.map(h => h.action)));
  
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.id_tarif.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.commentaire?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === "all" || item.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Plus className="h-4 w-4" />;
      case 'UPDATE':
        return <TrendingUp className="h-4 w-4" />;
      case 'DELETE':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return "bg-green-100 text-green-800";
      case 'UPDATE':
        return "bg-blue-100 text-blue-800";
      case 'DELETE':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE':
        return "Création";
      case 'UPDATE':
        return "Modification";
      case 'DELETE':
        return "Suppression";
      default:
        return action;
    }
  };

  const formatPrice = (amount: number | null) => {
    if (amount === null) return "N/A";
    return `${amount.toLocaleString('fr-FR')} DH`;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement de l'historique...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Historique des modifications</h2>
        <p className="text-muted-foreground mb-6">
          Suivi complet de toutes les modifications apportées aux tarifs BNRM
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans l'historique..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">Toutes les actions</option>
            {actions.map(action => (
              <option key={action} value={action}>{getActionLabel(action)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* History Timeline */}
      <div className="space-y-4">
        {filteredHistory.map((item) => (
          <Card key={item.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Badge className={getActionColor(item.action)}>
                    {getActionIcon(item.action)}
                    <span className="ml-1">{getActionLabel(item.action)}</span>
                  </Badge>
                  <CardTitle className="text-lg">Tarif {item.id_tarif}</CardTitle>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(item.date_modification).toLocaleString('fr-FR')}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.action === 'UPDATE' && (
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Ancien tarif</div>
                    <div className="font-semibold text-red-600">
                      {formatPrice(item.ancienne_valeur)}
                    </div>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Nouveau tarif</div>
                    <div className="font-semibold text-green-600">
                      {formatPrice(item.nouvelle_valeur)}
                    </div>
                  </div>
                </div>
              )}
              
              {item.action === 'CREATE' && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Tarif créé</div>
                  <div className="font-semibold text-green-600">
                    {formatPrice(item.nouvelle_valeur)}
                  </div>
                </div>
              )}
              
              {item.action === 'DELETE' && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-muted-foreground">Tarif supprimé</div>
                  <div className="font-semibold text-red-600">
                    {formatPrice(item.ancienne_valeur)}
                  </div>
                </div>
              )}
              
              {item.commentaire && (
                <div>
                  <span className="font-medium">Commentaire :</span>
                  <CardDescription className="mt-1">{item.commentaire}</CardDescription>
                </div>
              )}
              
              {item.utilisateur_responsable && (
                <div className="text-sm text-muted-foreground">
                  Modifié par : {item.utilisateur_responsable}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {history.length === 0 
            ? "Aucune modification enregistrée pour le moment."
            : "Aucune modification trouvée pour les critères sélectionnés."
          }
        </div>
      )}
    </div>
  );
}