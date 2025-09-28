import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Newspaper, 
  Hash, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  Download,
  Send,
  RefreshCw,
  FileText,
  Settings,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface NumberAttribution {
  id: string;
  deposit_id: string;
  number_type: 'isbn' | 'issn' | 'dl';
  attributed_number: string;
  attribution_date: string;
  status: 'pending' | 'attributed' | 'confirmed' | 'cancelled';
  metadata: {
    publication_title?: string;
    declarant_name?: string;
    range_start?: string;
    range_end?: string;
    agency_response?: any;
  };
}

interface NumberRange {
  id: string;
  number_type: 'isbn' | 'issn';
  range_start: string;
  range_end: string;
  current_position: string;
  total_numbers: number;
  used_numbers: number;
  status: 'active' | 'exhausted' | 'reserved';
  assigned_date: string;
  expiry_date?: string;
}

export const BNRMNumberAttribution = () => {
  const [attributions, setAttributions] = useState<NumberAttribution[]>([]);
  const [ranges, setRanges] = useState<NumberRange[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [numberTypeFilter, setNumberTypeFilter] = useState("all");
  const [selectedAttribution, setSelectedAttribution] = useState<NumberAttribution | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAttributionDialogOpen, setIsAttributionDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch pending requests that need number attribution
      const { data: requests } = await supabase
        .from("legal_deposits")
        .select("*")
        .eq("status", "validated")
        .order("created_at", { ascending: true });

      setPendingRequests(requests || []);

      // Mock data for attributions and ranges - in real app, these would come from respective tables
      setAttributions([
        {
          id: '1',
          deposit_id: 'dep-001',
          number_type: 'isbn',
          attributed_number: '978-9981-123-45-6',
          attribution_date: new Date().toISOString(),
          status: 'attributed',
          metadata: {
            publication_title: 'Histoire du Maroc Moderne',
            declarant_name: 'Editions Al Manahil'
          }
        },
        {
          id: '2',
          deposit_id: 'dep-002',
          number_type: 'issn',
          attributed_number: '2550-4567',
          attribution_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
          metadata: {
            publication_title: 'Revue Marocaine de Sciences',
            declarant_name: 'Institut de Recherche'
          }
        }
      ]);

      setRanges([
        {
          id: '1',
          number_type: 'isbn',
          range_start: '978-9981-100-00-0',
          range_end: '978-9981-199-99-9',
          current_position: '978-9981-123-45-6',
          total_numbers: 10000,
          used_numbers: 2346,
          status: 'active',
          assigned_date: '2024-01-01',
          expiry_date: '2026-12-31'
        },
        {
          id: '2',
          number_type: 'issn',
          range_start: '2550-0000',
          range_end: '2550-9999',
          current_position: '2550-4567',
          total_numbers: 10000,
          used_numbers: 4567,
          status: 'active',
          assigned_date: '2024-01-01'
        }
      ]);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNextNumber = (type: 'isbn' | 'issn', currentRange: NumberRange): string => {
    if (type === 'isbn') {
      // Simplified ISBN generation logic
      const baseNumber = currentRange.current_position.replace(/-/g, '').slice(0, -1);
      const nextSequence = (parseInt(baseNumber.slice(-4)) + 1).toString().padStart(4, '0');
      const newNumber = `${baseNumber.slice(0, -4)}${nextSequence}`;
      
      // Calculate check digit (simplified)
      const checkDigit = '0'; // In real implementation, calculate proper check digit
      
      // Format with hyphens
      return `${newNumber.slice(0, 3)}-${newNumber.slice(3, 7)}-${newNumber.slice(7, 10)}-${newNumber.slice(10, 12)}-${checkDigit}`;
    } else {
      // ISSN generation
      const currentNum = parseInt(currentRange.current_position.replace('-', ''));
      const nextNum = currentNum + 1;
      const formatted = nextNum.toString().padStart(7, '0');
      return `${formatted.slice(0, 4)}-${formatted.slice(4)}`;
    }
  };

  const attributeNumber = async (requestId: string, numberType: 'isbn' | 'issn' | 'dl') => {
    try {
      let attributedNumber = '';
      
      if (numberType === 'dl') {
        // Generate DL number
        const { data: dlNumber, error } = await supabase.rpc('generate_deposit_number');
        if (error) throw error;
        attributedNumber = dlNumber;
      } else {
        // Find appropriate range and generate next number
        const range = ranges.find(r => r.number_type === numberType && r.status === 'active');
        if (!range) {
          throw new Error(`Aucune tranche ${numberType.toUpperCase()} disponible`);
        }
        attributedNumber = generateNextNumber(numberType, range);
      }

      // Update the legal deposit with the attributed number
      const updateData: any = {};
      if (numberType === 'dl') {
        updateData.deposit_number = attributedNumber;
        updateData.status = 'processed';
      } else {
        // Update metadata with ISBN/ISSN
        const request = pendingRequests.find(r => r.id === requestId);
        updateData.metadata = {
          ...request?.metadata,
          publication: {
            ...request?.metadata?.publication,
            [`${numberType}`]: attributedNumber
          }
        };
      }

      const { error } = await supabase
        .from("legal_deposits")
        .update(updateData)
        .eq("id", requestId);

      if (error) throw error;

      // Add to attributions list (in real app, this would be in a separate table)
      const newAttribution: NumberAttribution = {
        id: Date.now().toString(),
        deposit_id: requestId,
        number_type: numberType,
        attributed_number: attributedNumber,
        attribution_date: new Date().toISOString(),
        status: 'attributed',
        metadata: {
          publication_title: pendingRequests.find(r => r.id === requestId)?.metadata?.publication?.title,
          declarant_name: pendingRequests.find(r => r.id === requestId)?.metadata?.declarant?.name
        }
      };

      setAttributions(prev => [newAttribution, ...prev]);
      await fetchData();

      toast({
        title: "Succès",
        description: `Numéro ${numberType.toUpperCase()} attribué: ${attributedNumber}`,
      });

      setIsAttributionDialogOpen(false);
      setSelectedRequest(null);

    } catch (error) {
      console.error("Error attributing number:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'attribuer le numéro",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "En attente", icon: Clock },
      attributed: { color: "bg-blue-100 text-blue-800", label: "Attribué", icon: Hash },
      confirmed: { color: "bg-green-100 text-green-800", label: "Confirmé", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", label: "Annulé", icon: AlertCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} font-medium`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getNumberTypeIcon = (type: string) => {
    switch (type) {
      case 'isbn': return BookOpen;
      case 'issn': return Newspaper;
      case 'dl': return FileText;
      default: return Hash;
    }
  };

  const getRangeProgressPercentage = (range: NumberRange) => {
    return (range.used_numbers / range.total_numbers) * 100;
  };

  const getRangeStatusColor = (range: NumberRange) => {
    const percentage = getRangeProgressPercentage(range);
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attribution des Numéros</h2>
          <p className="text-muted-foreground">
            Gestion des numéros ISBN, ISSN et Dépôt Légal
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Rapport mensuel
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configurer tranches
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Demandes en attente</TabsTrigger>
          <TabsTrigger value="attributions">Attributions</TabsTrigger>
          <TabsTrigger value="ranges">Gestion des tranches</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
        </TabsList>

        {/* Pending Requests */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demandes validées en attente d'attribution</CardTitle>
              <CardDescription>
                Demandes prêtes pour l'attribution des numéros ISBN/ISSN/DL
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>Déclarant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date validation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="max-w-xs truncate">
                          {request.metadata?.publication?.title || "Sans titre"}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.metadata?.declarant?.name || "Non spécifié"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.metadata?.declarant?.organization}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {request.deposit_type === 'monographie' && <BookOpen className="h-4 w-4" />}
                            {request.deposit_type === 'periodique' && <Newspaper className="h-4 w-4" />}
                            <span className="capitalize">{request.deposit_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.updated_at), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => attributeNumber(request.id, 'dl')}
                            >
                              <Hash className="w-4 h-4 mr-1" />
                              N° DL
                            </Button>
                            
                            {request.deposit_type === 'monographie' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => attributeNumber(request.id, 'isbn')}
                              >
                                <BookOpen className="w-4 h-4 mr-1" />
                                ISBN
                              </Button>
                            )}
                            
                            {request.deposit_type === 'periodique' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => attributeNumber(request.id, 'issn')}
                              >
                                <Newspaper className="w-4 h-4 mr-1" />
                                ISSN
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attributions History */}
        <TabsContent value="attributions" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou titre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={numberTypeFilter} onValueChange={setNumberTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="isbn">ISBN</SelectItem>
                <SelectItem value="issn">ISSN</SelectItem>
                <SelectItem value="dl">Dépôt Légal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Historique des attributions</span>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Numéro attribué</TableHead>
                    <TableHead>Publication</TableHead>
                    <TableHead>Déclarant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributions
                    .filter(attr => 
                      (numberTypeFilter === "all" || attr.number_type === numberTypeFilter) &&
                      (searchTerm === "" || 
                       attr.attributed_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       attr.metadata.publication_title?.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((attribution) => {
                      const TypeIcon = getNumberTypeIcon(attribution.number_type);
                      return (
                        <TableRow key={attribution.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <TypeIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="uppercase font-mono text-sm">
                                {attribution.number_type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono font-medium">
                            {attribution.attributed_number}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {attribution.metadata.publication_title}
                          </TableCell>
                          <TableCell>
                            {attribution.metadata.declarant_name}
                          </TableCell>
                          <TableCell>
                            {format(new Date(attribution.attribution_date), "dd/MM/yyyy HH:mm", { locale: fr })}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(attribution.status)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAttribution(attribution);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Number Ranges Management */}
        <TabsContent value="ranges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {ranges.map((range) => {
              const TypeIcon = getNumberTypeIcon(range.number_type);
              const progressPercentage = getRangeProgressPercentage(range);
              
              return (
                <Card key={range.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TypeIcon className="h-5 w-5" />
                      <span>Tranche {range.number_type.toUpperCase()}</span>
                      <Badge variant={range.status === 'active' ? 'default' : 'secondary'}>
                        {range.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {range.range_start} → {range.range_end}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Utilisation</span>
                        <span>{range.used_numbers} / {range.total_numbers}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getRangeStatusColor(range)}`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {progressPercentage.toFixed(1)}% utilisé
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Position actuelle:</span>
                        <span className="font-mono">{range.current_position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date d'attribution:</span>
                        <span>{format(new Date(range.assigned_date), "dd/MM/yyyy", { locale: fr })}</span>
                      </div>
                      {range.expiry_date && (
                        <div className="flex justify-between">
                          <span>Date d'expiration:</span>
                          <span>{format(new Date(range.expiry_date), "dd/MM/yyyy", { locale: fr })}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Renouveler
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Send className="w-4 h-4 mr-2" />
                        Rapport agence
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ISBN attribués</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +15% ce mois
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ISSN attribués</CardTitle>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87</div>
                <p className="text-xs text-muted-foreground">
                  +3% ce mois
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">N° DL attribués</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,156</div>
                <p className="text-xs text-muted-foreground">
                  +8% ce mois
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Délai moyen</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3j</div>
                <p className="text-xs text-muted-foreground">
                  -0.5j ce mois
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                Évolution mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Graphique d'évolution des attributions par mois
                <br />
                (Intégration avec bibliothèque de graphiques)
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Attribution Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Détails de l'attribution - {selectedAttribution?.attributed_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAttribution && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type de numéro</Label>
                  <div className="text-sm mt-1 uppercase">{selectedAttribution.number_type}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Numéro attribué</Label>
                  <div className="text-sm mt-1 font-mono">{selectedAttribution.attributed_number}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date d'attribution</Label>
                  <div className="text-sm mt-1">
                    {format(new Date(selectedAttribution.attribution_date), "dd/MM/yyyy HH:mm", { locale: fr })}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Statut</Label>
                  <div className="mt-1">{getStatusBadge(selectedAttribution.status)}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Publication</Label>
                <div className="text-sm mt-1">{selectedAttribution.metadata.publication_title}</div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Déclarant</Label>
                <div className="text-sm mt-1">{selectedAttribution.metadata.declarant_name}</div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Fermer
                </Button>
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Notifier attribution
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};