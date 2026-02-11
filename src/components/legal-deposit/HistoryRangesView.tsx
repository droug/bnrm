import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, Newspaper, FileText, User, Search, Printer, Factory, Ban, X, History
} from "lucide-react";

interface ReservedRange {
  id: string;
  requester_id: string;
  requester_name?: string;
  requester_email?: string;
  deposit_type: string;
  number_type: 'isbn' | 'issn' | 'ismn' | 'dl';
  range_start: string;
  range_end: string;
  current_position: string;
  total_numbers: number;
  used_numbers: number;
  status: 'active' | 'exhausted' | 'cancelled';
  notes?: string;
  created_at: string;
}

export const HistoryRangesView = () => {
  const { toast } = useToast();
  const [ranges, setRanges] = useState<ReservedRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProType, setActiveProType] = useState("editeur");
  const [nameSearch, setNameSearch] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");

  const proTypeTabs = [
    { value: "editeur", label: "Éditeurs", icon: BookOpen, color: "text-blue-600" },
    { value: "imprimeur", label: "Imprimeurs", icon: Printer, color: "text-amber-600" },
    { value: "producteur", label: "Producteurs", icon: Factory, color: "text-violet-600" },
  ];

  useEffect(() => {
    fetchCancelledRanges();
  }, []);

  const fetchCancelledRanges = async () => {
    try {
      setLoading(true);
      
      // Fetch all ranges (we'll filter client-side)
      const { data: allRanges, error: rangesError } = await supabase
        .from('reserved_number_ranges')
        .select('*')
        .order('created_at', { ascending: false });

      if (rangesError) throw rangesError;

      // Fetch deleted professionals (ID + name) from publishers and printers
      const fetchDeleted = async (table: string) => {
        const { data, error } = await (supabase as any).from(table).select('id, name').not('deleted_at', 'is', null);
        if (error) return [];
        return data || [];
      };
      const [deletedPubs, deletedPrints] = await Promise.all([
        fetchDeleted('publishers'), fetchDeleted('printers')
      ]);
      const deletedProfessionalIds = new Set([...deletedPubs, ...deletedPrints].map((d: any) => d.id));
      const deletedProfessionalNames = new Set([...deletedPubs, ...deletedPrints].map((d: any) => d.name?.toLowerCase()));

      // Show in history: cancelled ranges OR ranges belonging to deleted professionals (by ID or name)
      const historyRanges = (allRanges || []).filter((r: any) => {
        if (r.status === 'cancelled') return true;
        if (r.requester_id && deletedProfessionalIds.has(r.requester_id)) return true;
        if (!r.requester_id && r.requester_name && deletedProfessionalNames.has(r.requester_name.toLowerCase())) return true;
        return false;
      });

      setRanges(historyRanges as ReservedRange[]);
    } catch (error) {
      console.error('Erreur:', error);
      toast({ title: "Erreur", description: "Impossible de charger l'historique", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredRanges = useMemo(() => {
    return ranges.filter((range) => {
      const typeMatch = range.deposit_type?.toLowerCase().includes(activeProType);
      const nameMatch = !nameSearch ||
        (range.requester_name || '').toLowerCase().includes(nameSearch.toLowerCase()) ||
        (range.requester_email || '').toLowerCase().includes(nameSearch.toLowerCase());
      const kwMatch = !keywordSearch ||
        (range.notes || '').toLowerCase().includes(keywordSearch.toLowerCase()) ||
        range.number_type?.toLowerCase().includes(keywordSearch.toLowerCase()) ||
        range.range_start?.toLowerCase().includes(keywordSearch.toLowerCase()) ||
        range.range_end?.toLowerCase().includes(keywordSearch.toLowerCase());
      return typeMatch && nameMatch && kwMatch;
    });
  }, [ranges, activeProType, nameSearch, keywordSearch]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    proTypeTabs.forEach(tab => {
      counts[tab.value] = ranges.filter(r => r.deposit_type?.toLowerCase().includes(tab.value)).length;
    });
    return counts;
  }, [ranges]);

  const getNumberTypeIcon = (type: string) => {
    switch (type) {
      case 'isbn': return BookOpen;
      case 'issn': return Newspaper;
      default: return FileText;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique des tranches annulées
        </CardTitle>
        <CardDescription>
          Tranches annulées et archivées — conservées pour traçabilité
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs by professional type */}
        <Tabs value={activeProType} onValueChange={setActiveProType}>
          <TabsList className="grid w-full grid-cols-3 h-12">
            {proTypeTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 data-[state=active]:shadow-sm">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tabCounts[tab.value] > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-xs">
                      {tabCounts[tab.value]}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Search filters */}
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={nameSearch}
                onChange={e => setNameSearch(e.target.value)}
                className="pl-9"
              />
              {nameSearch && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setNameSearch("")}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Mot-clé (notes, type, plage)..."
                value={keywordSearch}
                onChange={e => setKeywordSearch(e.target.value)}
                className="pl-9"
              />
              {keywordSearch && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setKeywordSearch("")}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            {(nameSearch || keywordSearch) && (
              <Button variant="ghost" size="sm" onClick={() => { setNameSearch(""); setKeywordSearch(""); }}>
                Réinitialiser
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground mt-2">
            {filteredRanges.length} tranche{filteredRanges.length !== 1 ? 's' : ''} trouvée{filteredRanges.length !== 1 ? 's' : ''}
          </div>

          {proTypeTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredRanges.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                  <History className="h-8 w-8 opacity-50" />
                  <p>Aucune tranche annulée pour les {tab.label.toLowerCase()}</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredRanges.map((range) => {
                    const Icon = getNumberTypeIcon(range.number_type);
                    return (
                      <Card key={range.id} className="border-l-4 opacity-75" style={{ borderLeftColor: 'hsl(var(--destructive))' }}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="h-6 w-6 text-muted-foreground" />
                              <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {range.number_type.toUpperCase()}
                                  <Badge variant="outline">{range.deposit_type}</Badge>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                  <User className="h-3 w-3" />
                                  {range.requester_name || range.requester_email}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Ban className="h-3 w-3" />
                              Annulée
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Début de plage</p>
                              <p className="font-medium font-mono">{range.range_start}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Fin de plage</p>
                              <p className="font-medium font-mono">{range.range_end}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Position actuelle</p>
                              <p className="font-medium font-mono">{range.current_position}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Utilisation</span>
                              <span className="font-medium">{range.used_numbers} / {range.total_numbers} numéros</span>
                            </div>
                            <Progress value={(range.used_numbers / range.total_numbers) * 100} className="h-2" />
                          </div>
                          {range.notes && (
                            <div className="text-sm p-3 bg-muted rounded-md">
                              <p className="font-medium mb-1">Notes:</p>
                              <p className="text-muted-foreground">{range.notes}</p>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Créé le {new Date(range.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
