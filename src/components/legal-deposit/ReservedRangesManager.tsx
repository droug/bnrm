import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollableDialog, ScrollableDialogContent, ScrollableDialogHeader, ScrollableDialogTitle } from "@/components/ui/scrollable-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
  Ban
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
  number_type: 'isbn' | 'issn' | 'dl';
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
  const [publisherSearch, setPublisherSearch] = useState<string>("");
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<ReservedRange | null>(null);
  const [showDepositTypeDropdown, setShowDepositTypeDropdown] = useState(false);
  const [showNumberTypeDropdown, setShowNumberTypeDropdown] = useState(false);

  const [formData, setFormData] = useState({
    requester_id: '',
    deposit_type: '',
    number_type: 'isbn' as 'isbn' | 'issn' | 'dl',
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

      // Fetch publishers
      const { data: publishersData, error: publishersError } = await supabase
        .from('publishers')
        .select('id, name, city, country, address, phone, email')
        .order('name');

      if (publishersError) throw publishersError;

      // Mock data for demonstration if no real data
      const mockPublishers = [
        { id: '1', name: 'Éditions Marocaines', city: 'Rabat', country: 'Maroc' },
        { id: '2', name: 'Dar Al Kitab', city: 'Casablanca', country: 'Maroc' },
        { id: '3', name: 'Publications Universitaires', city: 'Fès', country: 'Maroc' },
        { id: '4', name: 'Librairie Nationale', city: 'Marrakech', country: 'Maroc' },
        { id: '5', name: 'Imprimerie Royale', city: 'Rabat', country: 'Maroc' },
      ];

      const mockRanges = [
        {
          id: '1',
          requester_id: '1',
          deposit_type: 'monographie',
          number_type: 'isbn' as const,
          range_start: '978-9981-100-00-0',
          range_end: '978-9981-100-99-9',
          current_position: '978-9981-100-23-4',
          total_numbers: 100,
          used_numbers: 23,
          status: 'active' as const,
          notes: 'Collection de livres d\'histoire du Maroc',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          requester_id: '2',
          deposit_type: 'periodique',
          number_type: 'issn' as const,
          range_start: '2550-1000',
          range_end: '2550-1049',
          current_position: '2550-1012',
          total_numbers: 50,
          used_numbers: 12,
          status: 'active' as const,
          notes: 'Revue scientifique trimestrielle',
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          requester_id: '3',
          deposit_type: 'monographie',
          number_type: 'isbn' as const,
          range_start: '978-9981-200-00-0',
          range_end: '978-9981-200-49-9',
          current_position: '978-9981-200-47-5',
          total_numbers: 50,
          used_numbers: 47,
          status: 'active' as const,
          notes: 'Éditions littéraires - Romans et poésie',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          requester_id: '4',
          deposit_type: 'numerique',
          number_type: 'dl' as const,
          range_start: 'DL-2025-010000',
          range_end: 'DL-2025-010199',
          current_position: 'DL-2025-010078',
          total_numbers: 200,
          used_numbers: 78,
          status: 'active' as const,
          notes: 'Publications numériques - Livres électroniques',
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          requester_id: '5',
          deposit_type: 'monographie',
          number_type: 'isbn' as const,
          range_start: '978-9981-300-00-0',
          range_end: '978-9981-300-24-9',
          current_position: '978-9981-300-24-9',
          total_numbers: 25,
          used_numbers: 25,
          status: 'exhausted' as const,
          notes: 'Collection épuisée - Demander renouvellement',
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Use real data if available, otherwise use mock data
      const finalPublishers = (publishersData && publishersData.length > 0) ? publishersData : mockPublishers;
      const finalRanges = (rangesData && rangesData.length > 0) ? rangesData : mockRanges;

      // Map ranges with publisher names
      const rangesWithNames = finalRanges.map((range: any) => ({
        ...range,
        requester_email: range.requester?.email,
        requester_name: finalPublishers.find(p => p.id === range.requester_id)?.name || 'Éditeur inconnu'
      }));

      setReservedRanges(rangesWithNames);
      setPublishers(finalPublishers);

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
      if (!formData.requester_id || !formData.deposit_type || !quantity) {
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
          requester_id: formData.requester_id,
          deposit_type: formData.deposit_type,
          number_type: formData.number_type,
          range_start,
          range_end,
          current_position: range_start,
          total_numbers: quantity,
          used_numbers: 0,
          status: 'active',
          notes: formData.notes,
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
      deposit_type: '',
      number_type: 'isbn',
      quantity: '',
      notes: ''
    });
    setSelectedPublisher(null);
    setPublisherSearch('');
    setShowDepositTypeDropdown(false);
    setShowNumberTypeDropdown(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
      case 'exhausted':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Épuisé</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><Ban className="w-3 h-3 mr-1" />Annulé</Badge>;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tranches Réservées par Éditeur</h2>
          <p className="text-muted-foreground">
            Gestion des plages de numéros réservées pour des éditeurs spécifiques
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Réserver une tranche
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservedRanges.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-32">
                <p className="text-muted-foreground">Aucune tranche réservée</p>
              </CardContent>
            </Card>
          ) : (
            reservedRanges.map((range) => {
              const Icon = getNumberTypeIcon(range.number_type);
              return (
                <Card key={range.id}>
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
                            <Ban className="h-4 w-4 text-red-600" />
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
            })
          )}
        </div>
      )}

      {/* Dialog pour réserver une tranche */}
      <ScrollableDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <ScrollableDialogContent className="max-w-2xl">
          <ScrollableDialogHeader>
            <ScrollableDialogTitle>Réserver une tranche de numéros</ScrollableDialogTitle>
          </ScrollableDialogHeader>
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Éditeur *</Label>
                {!selectedPublisher ? (
                  <div className="relative">
                    <Input
                      placeholder="Rechercher un éditeur..."
                      value={publisherSearch}
                      onChange={(e) => setPublisherSearch(e.target.value)}
                      className="pr-10"
                    />
                    {publisherSearch && (
                      <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-y-auto">
                        {publishers
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
                        {publishers.filter(pub => 
                          pub.name.toLowerCase().includes(publisherSearch.toLowerCase()) ||
                          pub.city?.toLowerCase().includes(publisherSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            Aucun éditeur trouvé
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de numéro *</Label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-background hover:bg-accent transition-colors"
                    onClick={() => setShowNumberTypeDropdown(!showNumberTypeDropdown)}
                  >
                    <span>
                      {formData.number_type === "isbn" ? "ISBN" :
                       formData.number_type === "issn" ? "ISSN" :
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
                        { value: "dl", label: "Dépôt Légal" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                          onClick={() => {
                            setFormData({ ...formData, number_type: option.value as 'isbn' | 'issn' | 'dl' });
                            setShowNumberTypeDropdown(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nombre de numéros à réserver *</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ex: 100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Textarea
                placeholder="Informations complémentaires sur cette réservation..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm font-medium text-blue-900 mb-2">Information importante:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Cette tranche sera réservée exclusivement pour cet éditeur</li>
                <li>Elle ne pourra pas être utilisée pour d'autres demandes</li>
                <li>La plage sera générée automatiquement selon le type de numéro</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddRange} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Réserver
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