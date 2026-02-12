import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollableDialog, ScrollableDialogContent, ScrollableDialogHeader, ScrollableDialogTitle } from "@/components/ui/scrollable-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Newspaper, 
  FileText,
  Plus,
  Edit,
  Trash2,
  User,
  AlertCircle,
  CheckCircle,
  Ban,
  Search,
  Printer,
  Factory,
  X
} from "lucide-react";

interface Publisher {
  id: string;
  name: string;
  city?: string;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
}

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

export const ReservedRangesManager = () => {
  const { toast } = useToast();
  const [reservedRanges, setReservedRanges] = useState<ReservedRange[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [allPrinters, setAllPrinters] = useState<Publisher[]>([]);
  const [allProducers, setAllProducers] = useState<Publisher[]>([]);
  const [publisherSearch, setPublisherSearch] = useState<string>("");
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<ReservedRange | null>(null);
  const [showDepositTypeDropdown, setShowDepositTypeDropdown] = useState(false);
  const [showNumberTypeDropdown, setShowNumberTypeDropdown] = useState(false);
  const [showQuantityDropdown, setShowQuantityDropdown] = useState(false);
  const [showSourceRangeDropdown, setShowSourceRangeDropdown] = useState(false);
  const [selectedSourceRange, setSelectedSourceRange] = useState<ReservedRange | null>(null);

  const [formData, setFormData] = useState({
    requester_id: '',
    deposit_type: 'monographie',
    number_type: 'isbn' as 'isbn' | 'issn' | 'ismn' | 'dl',
    quantity: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch reserved ranges without join (no foreign key exists)
      const { data: rangesData, error: rangesError } = await supabase
        .from('reserved_number_ranges')
        .select('*')
        .order('created_at', { ascending: false });

      if (rangesError) throw rangesError;

      // Fetch publishers, printers and producers in parallel (exclude deleted)
      const fetchValidated = async (table: string) => {
        const { data, error } = await (supabase as any).from(table).select('id, name, city, country, address, phone, email').is('deleted_at', null).eq('is_validated', true).order('name');
        if (error) throw error;
        return data || [];
      };
      const fetchAll = async (table: string) => {
        const { data, error } = await (supabase as any).from(table).select('id, name, city, country, address, phone, email').order('name');
        if (error) throw error;
        return data || [];
      };
      // Also fetch deleted professionals to filter their ranges out
      const fetchDeletedNames = async (table: string) => {
        const { data, error } = await (supabase as any).from(table).select('id, name').not('deleted_at', 'is', null);
        if (error) return [];
        return data || [];
      };
      const [publishersData, printersData, producersData, deletedPubs, deletedPrints] = await Promise.all([
        fetchValidated('publishers'), fetchValidated('printers'), fetchAll('producers'),
        fetchDeletedNames('publishers'), fetchDeletedNames('printers')
      ]);

      // Set of all deleted professional IDs and names
      const deletedProfessionalIds = new Set([...deletedPubs, ...deletedPrints].map((d: any) => d.id));
      const deletedProfessionalNames = new Set([...deletedPubs, ...deletedPrints].map((d: any) => d.name?.toLowerCase()));

      // Mock data for demonstration if no real data
      const mockPublishers = [
        { id: '1', name: 'Éditions Marocaines', city: 'Rabat', country: 'Maroc' },
        { id: '2', name: 'Dar Al Kitab', city: 'Casablanca', country: 'Maroc' },
        { id: '3', name: 'Publications Universitaires', city: 'Fès', country: 'Maroc' },
        { id: '4', name: 'Librairie Nationale', city: 'Marrakech', country: 'Maroc' },
        { id: '5', name: 'Imprimerie Royale', city: 'Rabat', country: 'Maroc' },
      ];

      const mockRanges: any[] = [];

      // Use real data if available, otherwise use mock data
      const finalPublishers = (publishersData && publishersData.length > 0) ? publishersData : mockPublishers;
      const finalRanges = (rangesData && rangesData.length > 0) ? rangesData : mockRanges;

      // Map ranges with publisher names - filter out deleted professionals by ID or name
      const allProfessionals = [...finalPublishers, ...printersData, ...producersData];
      const rangesWithNames = finalRanges
        .filter((range: any) => {
          // Filter by requester_id if present
          if (range.requester_id && deletedProfessionalIds.has(range.requester_id)) return false;
          // Filter by requester_name for ranges without requester_id
          if (!range.requester_id && range.requester_name && deletedProfessionalNames.has(range.requester_name.toLowerCase())) return false;
          return true;
        })
        .map((range: any) => ({
          ...range,
          requester_email: range.requester_email || range.requester?.email,
          requester_name: range.requester_name || allProfessionals.find(p => p.id === range.requester_id)?.name || 'Professionnel inconnu'
        }));

      setReservedRanges(rangesWithNames);
      setPublishers(finalPublishers);
      setAllPrinters(printersData);
      setAllProducers(producersData);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateRange = (numberType: string, depositType: string, quantity: number) => {
    const now = new Date();
    const year = now.getFullYear();
    const timestamp = Date.now().toString().slice(-6);

    if (numberType === 'isbn') {
      const start = `978-9981-${timestamp}-00-0`;
      const endNum = parseInt(timestamp) + quantity - 1;
      const end = `978-9981-${endNum.toString().padStart(6, '0')}-99-9`;
      return { range_start: start, range_end: end };
    } else if (numberType === 'issn') {
      const start = `2550-${timestamp}`;
      const endNum = parseInt(timestamp) + quantity - 1;
      const end = `2550-${endNum.toString().padStart(4, '0')}`;
      return { range_start: start, range_end: end };
    } else {
      const start = `DL-${year}-${timestamp}`;
      const endNum = parseInt(timestamp) + quantity - 1;
      const end = `DL-${year}-${endNum.toString().padStart(6, '0')}`;
      return { range_start: start, range_end: end };
    }
  };

  const handleAddRange = async () => {
    try {
      const quantity = parseInt(formData.quantity);
      if (!selectedPublisher || !formData.deposit_type || !quantity) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      const { range_start, range_end } = calculateRange(
        formData.number_type,
        formData.deposit_type,
        quantity
      );

      const { error } = await supabase
        .from('reserved_number_ranges')
        .insert([{
          deposit_type: activeProType,
          number_type: formData.number_type,
          range_start,
          range_end,
          current_position: range_start,
          total_numbers: quantity,
          used_numbers: 0,
          status: 'active',
          notes: formData.notes,
          requester_name: selectedPublisher?.name || '',
          requester_email: selectedPublisher?.email || '',
          reserved_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Tranche réservée avec succès"
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchData();

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réserver la tranche",
        variant: "destructive"
      });
    }
  };

  const handleCancelRange = async (rangeId: string) => {
    try {
      const { error } = await supabase
        .from('reserved_number_ranges')
        .update({ status: 'cancelled' })
        .eq('id', rangeId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Tranche annulée"
      });

      fetchData();

    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la tranche",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      requester_id: '',
      deposit_type: 'monographie',
      number_type: 'isbn',
      quantity: '',
      notes: ''
    });
    setSelectedPublisher(null);
    setPublisherSearch('');
    setShowDepositTypeDropdown(false);
    setShowNumberTypeDropdown(false);
    setShowQuantityDropdown(false);
    setShowSourceRangeDropdown(false);
    setSelectedSourceRange(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-primary/10 text-primary"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
      case 'exhausted':
        return <Badge className="bg-accent text-accent-foreground"><AlertCircle className="w-3 h-3 mr-1" />Épuisé</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive"><Ban className="w-3 h-3 mr-1" />Annulé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getNumberTypeIcon = (type: string) => {
    switch (type) {
      case 'isbn': return BookOpen;
      case 'issn': return Newspaper;
      case 'dl': return FileText;
      default: return FileText;
    }
  };

  const getProgressPercentage = (range: ReservedRange) => {
    return (range.used_numbers / range.total_numbers) * 100;
  };

  // Filter state
  const [activeProType, setActiveProType] = useState<string>("editeur");
  const [nameSearch, setNameSearch] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  

  const proTypeTabs = [
    { value: "editeur", label: "Éditeurs", icon: BookOpen, color: "text-blue-600" },
    { value: "producteur", label: "Producteurs", icon: Factory, color: "text-violet-600" },
  ];

  const filteredRanges = useMemo(() => {
    return reservedRanges.filter((range) => {
      // Filter by professional type (deposit_type field stores this)
      const typeMatch = range.deposit_type?.toLowerCase().includes(activeProType);
      
      // Hide cancelled ranges (history is in separate tab now)
      const statusMatch = range.status !== 'cancelled';
      
      // Filter by name
      const nameMatch = !nameSearch || 
        (range.requester_name || '').toLowerCase().includes(nameSearch.toLowerCase()) ||
        (range.requester_email || '').toLowerCase().includes(nameSearch.toLowerCase());
      
      // Filter by keyword (search in notes, number_type, range values)
      const kwMatch = !keywordSearch ||
        (range.notes || '').toLowerCase().includes(keywordSearch.toLowerCase()) ||
        range.number_type?.toLowerCase().includes(keywordSearch.toLowerCase()) ||
        range.range_start?.toLowerCase().includes(keywordSearch.toLowerCase()) ||
        range.range_end?.toLowerCase().includes(keywordSearch.toLowerCase()) ||
        (range.requester_name || '').toLowerCase().includes(keywordSearch.toLowerCase());
      
      return typeMatch && statusMatch && nameMatch && kwMatch;
    });
  }, [reservedRanges, activeProType, nameSearch, keywordSearch]);

  // Get the right professional list based on active tab
  const activeProfessionals = useMemo(() => {
    if (activeProType === 'imprimeur') return allPrinters;
    if (activeProType === 'producteur') return allProducers;
    return publishers;
  }, [activeProType, publishers, allPrinters, allProducers]);

  const countByType = useMemo(() => {
    const counts: Record<string, number> = { editeur: 0, imprimeur: 0, producteur: 0 };
    reservedRanges.forEach((r) => {
      if (r.status === 'cancelled') return;
      const dt = (r.deposit_type || '').toLowerCase();
      if (dt.includes('editeur')) counts.editeur++;
      else if (dt.includes('imprimeur')) counts.imprimeur++;
      else if (dt.includes('producteur')) counts.producteur++;
    });
    return counts;
  }, [reservedRanges]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tranches Réservées</h2>
          <p className="text-muted-foreground">
            Gestion des plages de numéros réservées par type de professionnel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => {
            resetForm();
            if (activeProType === 'producteur') {
              setFormData(prev => ({ ...prev, deposit_type: 'audiovisuel_logiciels_bd', number_type: 'ismn' }));
            } else if (activeProType === 'editeur') {
              setFormData(prev => ({ ...prev, deposit_type: 'monographie', number_type: 'isbn' }));
            }
            setIsAddDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Attribuer une tranche
          </Button>
        </div>
      </div>

      {/* Tabs by professional type */}
      <Tabs value={activeProType} onValueChange={setActiveProType}>
        <TabsList className="grid w-full grid-cols-3 h-12">
          {proTypeTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 data-[state=active]:shadow-sm">
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
                  {countByType[tab.value] || 0}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Search filters bar */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom..."
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="pl-9 h-10"
            />
            {nameSearch && (
              <button onClick={() => setNameSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Mot-clé (n°, notes...)"
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              className="pl-9 h-10"
            />
            {keywordSearch && (
              <button onClick={() => setKeywordSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          {(nameSearch || keywordSearch) && (
            <Button variant="ghost" size="sm" onClick={() => { setNameSearch(""); setKeywordSearch(""); }}>
              Réinitialiser
            </Button>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground mt-2">
          {filteredRanges.length} tranche{filteredRanges.length !== 1 ? 's' : ''} trouvée{filteredRanges.length !== 1 ? 's' : ''}
        </div>

        {/* Content for each tab (same layout, data filtered) */}
        {proTypeTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredRanges.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-32 gap-2">
                  <p className="text-muted-foreground">
                    {nameSearch || keywordSearch
                      ? "Aucune tranche ne correspond à votre recherche"
                      : `Aucune tranche réservée pour les ${tab.label.toLowerCase()}`}
                  </p>
                  {(nameSearch || keywordSearch) && (
                    <Button variant="link" size="sm" onClick={() => { setNameSearch(""); setKeywordSearch(""); }}>
                      Effacer les filtres
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredRanges.map((range) => {
                  const Icon = getNumberTypeIcon(range.number_type);
                  return (
                    <Card key={range.id} className="border-l-4" style={{ borderLeftColor: tab.value === 'editeur' ? 'hsl(var(--primary))' : tab.value === 'imprimeur' ? 'hsl(38, 92%, 50%)' : 'hsl(263, 70%, 50%)' }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="h-6 w-6 text-primary" />
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
                          <div className="flex items-center gap-2">
                            {getStatusBadge(range.status)}
                            {range.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelRange(range.id)}
                              >
                                <Ban className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
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
                            <span className="font-medium">
                              {range.used_numbers} / {range.total_numbers} numéros
                            </span>
                          </div>
                          <Progress value={getProgressPercentage(range)} className="h-2" />
                        </div>

                        {range.notes && (
                          <div className="text-sm p-3 bg-muted rounded-md">
                            <p className="font-medium mb-1">Notes:</p>
                            <p className="text-muted-foreground">{range.notes}</p>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Créé le {new Date(range.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
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

      {/* Dialog pour attribuer une tranche */}
      <ScrollableDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <ScrollableDialogContent className="max-w-2xl">
          <ScrollableDialogHeader>
            <ScrollableDialogTitle>Attribuer une tranche de numéros</ScrollableDialogTitle>
          </ScrollableDialogHeader>
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{activeProType === 'imprimeur' ? 'Imprimeur' : activeProType === 'producteur' ? 'Producteur' : 'Éditeur'} *</Label>
                {!selectedPublisher ? (
                  <div className="relative">
                    <Input
                      placeholder="Rechercher un professionnel..."
                      value={publisherSearch}
                      onChange={(e) => setPublisherSearch(e.target.value)}
                      className="pr-10"
                    />
                    {publisherSearch && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {activeProfessionals
                          .filter(pub => 
                            pub.name.toLowerCase().includes(publisherSearch.toLowerCase()) ||
                            pub.city?.toLowerCase().includes(publisherSearch.toLowerCase())
                          )
                          .map((pub) => (
                            <button
                              key={pub.id}
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-accent transition-colors"
                              onClick={() => {
                                setSelectedPublisher(pub);
                                setPublisherSearch('');
                                setFormData({ ...formData, requester_id: pub.id });
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{pub.name}</span>
                                {pub.city && (
                                  <span className="text-sm text-muted-foreground">
                                    {pub.city}, {pub.country}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        {activeProfessionals.filter(pub => 
                          pub.name.toLowerCase().includes(publisherSearch.toLowerCase()) ||
                          pub.city?.toLowerCase().includes(publisherSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            Aucun professionnel trouvé
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-accent/50">
                    <div className="flex-1">
                      <p className="font-medium">{selectedPublisher.name}</p>
                      {selectedPublisher.city && (
                        <p className="text-sm text-muted-foreground">
                          {selectedPublisher.city}, {selectedPublisher.country}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPublisher(null);
                        setFormData({ ...formData, requester_id: '' });
                      }}
                    >
                      Changer
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Type de dépôt *</Label>
                {activeProType === 'editeur' ? (
                  <Input value="Monographie" disabled className="bg-muted cursor-not-allowed" />
                ) : activeProType === 'producteur' ? (
                  <Input value="Audio-visuel & Logiciels et BD" disabled className="bg-muted cursor-not-allowed" />
                ) : (
                <div className="relative">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background hover:bg-accent transition-colors"
                    onClick={() => setShowDepositTypeDropdown(!showDepositTypeDropdown)}
                  >
                    <span className={formData.deposit_type ? "" : "text-muted-foreground"}>
                      {formData.deposit_type === "monographie" ? "Monographie" :
                       formData.deposit_type === "periodique" ? "Publication périodique" :
                       formData.deposit_type === "audiovisuel_logiciels_bd" ? "Audio-visuel & Logiciels et BD" :
                       formData.deposit_type === "collections_speciales" ? "Collections Spéciales" :
                       "Sélectionner le type"}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showDepositTypeDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                      {[
                        { value: "monographie", label: "Monographie" },
                        { value: "periodique", label: "Publication périodique" },
                        { value: "audiovisuel_logiciels_bd", label: "Audio-visuel & Logiciels et BD" },
                        { value: "collections_speciales", label: "Collections Spéciales" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                          onClick={() => {
                            setFormData({ ...formData, deposit_type: option.value });
                            setShowDepositTypeDropdown(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de numéro *</Label>
                {activeProType === 'editeur' ? (
                  <Input value="ISBN" disabled className="bg-muted cursor-not-allowed" />
                ) : activeProType === 'producteur' ? (
                  <Input value="ISMN" disabled className="bg-muted cursor-not-allowed" />
                ) : (
                <div className="relative">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background hover:bg-accent transition-colors"
                    onClick={() => setShowNumberTypeDropdown(!showNumberTypeDropdown)}
                  >
                    <span>
                      {formData.number_type === "isbn" ? "ISBN" :
                       formData.number_type === "issn" ? "ISSN" :
                       formData.number_type === "ismn" ? "ISMN" :
                       formData.number_type === "dl" ? "Dépôt Légal" :
                       "Sélectionner"}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showNumberTypeDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                      {[
                        { value: "isbn", label: "ISBN" },
                        { value: "issn", label: "ISSN" },
                        { value: "ismn", label: "ISMN" },
                        { value: "dl", label: "Dépôt Légal" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                          onClick={() => {
                            setFormData({ ...formData, number_type: option.value as 'isbn' | 'issn' | 'ismn' | 'dl' });
                            setShowNumberTypeDropdown(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Nombre de numéros *</Label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background hover:bg-accent transition-colors"
                    onClick={() => setShowQuantityDropdown(!showQuantityDropdown)}
                  >
                    <span className={formData.quantity ? "" : "text-muted-foreground"}>
                      {formData.quantity === '10' ? '10 numéros' :
                       formData.quantity === '100' ? '100 numéros' :
                       'Sélectionner'}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showQuantityDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
                      {[
                        { value: "10", label: "10 numéros" },
                        { value: "100", label: "100 numéros" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                          onClick={() => {
                            setFormData({ ...formData, quantity: option.value });
                            setShowQuantityDropdown(false);
                            setSelectedSourceRange(null);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Plage source (attribution depuis les numéros importés) *</Label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background hover:bg-accent transition-colors"
                  onClick={() => setShowSourceRangeDropdown(!showSourceRangeDropdown)}
                >
                  <span className={selectedSourceRange ? "" : "text-muted-foreground"}>
                    {selectedSourceRange
                      ? `${selectedSourceRange.range_start} → ${selectedSourceRange.range_end} (${selectedSourceRange.total_numbers - selectedSourceRange.used_numbers} disponibles)`
                      : 'Sélectionner une plage source'}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showSourceRangeDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {(() => {
                      const selectedQty = parseInt(formData.quantity) || 0;
                      const filtered = reservedRanges.filter(r => 
                        r.number_type === formData.number_type && 
                        r.status === 'active' && 
                        (r.total_numbers - r.used_numbers) >= selectedQty &&
                        selectedQty > 0 &&
                        !r.requester_name?.includes('Professionnel')
                      );
                      return filtered.length > 0 ? filtered.map((range) => (
                        <button
                          key={range.id}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-accent transition-colors border-b last:border-b-0"
                          onClick={() => {
                            setSelectedSourceRange(range);
                            setShowSourceRangeDropdown(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{range.range_start} → {range.range_end}</span>
                            <span className="text-xs text-muted-foreground">
                              {range.total_numbers - range.used_numbers} numéros disponibles sur {range.total_numbers} • {range.notes}
                            </span>
                          </div>
                        </button>
                      )) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          {selectedQty === 0 
                            ? "Veuillez d'abord sélectionner le nombre de numéros"
                            : `Aucune plage disponible avec au moins ${selectedQty} numéros pour ce type`}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddRange} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Attribuer
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </ScrollableDialogContent>
      </ScrollableDialog>
    </div>
  );
};