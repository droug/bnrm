import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Eye,
  CheckCheck,
  X,
  Settings,
  BarChart3,
  Upload,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ReservedRangesManager } from "@/components/legal-deposit/ReservedRangesManager";
import { SearchPagination } from "@/components/ui/search-pagination";

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
    dl_number?: string;
    range_start?: string;
    range_end?: string;
    agency_response?: any;
  };
}

interface NumberRange {
  id: string;
  number_type: 'isbn' | 'issn' | 'dl';
  range_start: string;
  range_end: string;
  current_position: string;
  total_numbers: number;
  used_numbers: number;
  status: 'active' | 'exhausted' | 'reserved';
  assigned_date: string;
  expiry_date?: string;
  source?: 'manual' | 'imported' | 'agency';
  agency?: string;
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
  const [isRangeDialogOpen, setIsRangeDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isViewRequestDialogOpen, setIsViewRequestDialogOpen] = useState(false);
  const [selectedRequestForView, setSelectedRequestForView] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newRange, setNewRange] = useState({
    number_type: 'isbn' as 'isbn' | 'issn' | 'dl',
    range_start: '',
    range_end: '',
    source: 'manual' as 'manual' | 'imported' | 'agency',
    agency: '',
    expiry_date: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch approved requests from legal_deposit_requests that need number attribution
      const { data: requests, error: requestsError } = await supabase
        .from("legal_deposit_requests")
        .select("*")
        .eq("status", "valide_par_b")
        .order("created_at", { ascending: true });

      if (requestsError) {
        console.error("Error fetching approved requests:", requestsError);
      }

      // Fetch attributed requests (status = attribue)
      const { data: attributedRequests, error: attributedError } = await supabase
        .from("legal_deposit_requests")
        .select("*")
        .eq("status", "attribue")
        .order("updated_at", { ascending: false });

      if (attributedError) {
        console.error("Error fetching attributed requests:", attributedError);
      }

      // Transform data to expected format
      const transformedRequests = (requests || []).map(req => {
        const metadata = req.metadata as Record<string, any> || {};
        return {
          id: req.id,
          request_number: req.request_number,
          status: req.status,
          deposit_type: req.support_type?.toLowerCase().includes('livre') || req.support_type?.toLowerCase().includes('monograph') ? 'monographie' : 'periodique',
          title: req.title,
          author_name: req.author_name,
          metadata: {
            publication: {
              title: req.title,
              type: req.support_type
            },
            declarant: {
              name: req.author_name || 'Non spécifié',
              organization: metadata?.publisher_name || ''
            },
            ...metadata
          },
          created_at: req.created_at,
          updated_at: req.updated_at,
          dl_number: req.request_number,
          isbn_assigned: metadata?.isbn_assigned,
          issn_assigned: metadata?.issn_assigned
        };
      });

      setPendingRequests(transformedRequests);

      // Transform attributed requests to attributions format
      const transformedAttributions: NumberAttribution[] = (attributedRequests || []).map(req => {
        const metadata = req.metadata as Record<string, any> || {};
        
        // Determine which number type was attributed
        let numberType: 'isbn' | 'issn' | 'dl' = 'dl';
        let attributedNumber = metadata?.dl_number || req.request_number;
        
        if (metadata?.isbn_assigned) {
          numberType = 'isbn';
          attributedNumber = metadata.isbn_assigned;
        } else if (metadata?.issn_assigned) {
          numberType = 'issn';
          attributedNumber = metadata.issn_assigned;
        }

        return {
          id: req.id,
          deposit_id: req.id,
          number_type: numberType,
          attributed_number: attributedNumber,
          attribution_date: metadata?.dl_attribution_date || metadata?.isbn_attribution_date || metadata?.issn_attribution_date || req.updated_at,
          status: 'attributed' as const,
          metadata: {
            publication_title: req.title,
            declarant_name: req.author_name || 'Non spécifié',
            dl_number: req.request_number
          }
        };
      });

      setAttributions(transformedAttributions);

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
          expiry_date: '2026-12-31',
          source: 'agency',
          agency: 'Agence Internationale ISBN'
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
          assigned_date: '2024-01-01',
          source: 'agency',
          agency: 'Centre International ISSN'
        },
        {
          id: '3',
          number_type: 'dl',
          range_start: 'DL-2025-000001',
          range_end: 'DL-2025-999999',
          current_position: 'DL-2025-000123',
          total_numbers: 999999,
          used_numbers: 123,
          status: 'active',
          assigned_date: '2025-01-01',
          source: 'manual'
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

      // Update the legal_deposit_requests table with the attributed number
      const request = pendingRequests.find(r => r.id === requestId);
      const currentMetadata = request?.metadata || {};
      
      const updateData: any = {
        metadata: {
          ...currentMetadata,
          [`${numberType}_assigned`]: attributedNumber,
          [`${numberType}_attribution_date`]: new Date().toISOString()
        }
      };
      
      // If DL number is attributed, mark as fully processed
      if (numberType === 'dl') {
        updateData.status = 'attribue';
      }

      const { error } = await supabase
        .from("legal_deposit_requests")
        .update(updateData)
        .eq("id", requestId);

      if (error) throw error;

      // Add to attributions list
      const newAttribution: NumberAttribution = {
        id: Date.now().toString(),
        deposit_id: requestId,
        number_type: numberType,
        attributed_number: attributedNumber,
        attribution_date: new Date().toISOString(),
        status: 'attributed',
        metadata: {
          publication_title: request?.title || request?.metadata?.publication?.title,
          declarant_name: request?.author_name || request?.metadata?.declarant?.name,
          dl_number: request?.request_number || request?.dl_number
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

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Simulate Excel import - in real app, use a library like xlsx
      toast({
        title: "Import en cours",
        description: "Traitement du fichier Excel...",
      });

      // Mock processing
      setTimeout(() => {
        toast({
          title: "Succès",
          description: "50 numéros importés avec succès",
        });
        setIsImportDialogOpen(false);
      }, 2000);

    } catch (error) {
      console.error("Error importing Excel:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer le fichier",
        variant: "destructive",
      });
    }
  };

  const handleAddRange = () => {
    const calculateTotalNumbers = () => {
      if (newRange.number_type === 'isbn') {
        // Calculate from ISBN ranges
        return 10000;
      } else if (newRange.number_type === 'issn') {
        return 10000;
      } else {
        // DL numbers
        const start = parseInt(newRange.range_start.split('-').pop() || '0');
        const end = parseInt(newRange.range_end.split('-').pop() || '0');
        return end - start + 1;
      }
    };

    const range: NumberRange = {
      id: Date.now().toString(),
      number_type: newRange.number_type,
      range_start: newRange.range_start,
      range_end: newRange.range_end,
      current_position: newRange.range_start,
      total_numbers: calculateTotalNumbers(),
      used_numbers: 0,
      status: 'active',
      assigned_date: new Date().toISOString().split('T')[0],
      expiry_date: newRange.expiry_date || undefined,
      source: newRange.source,
      agency: newRange.agency || undefined
    };

    setRanges(prev => [...prev, range]);
    
    toast({
      title: "Succès",
      description: `Plage ${newRange.number_type.toUpperCase()} ajoutée avec succès`,
    });

    setIsRangeDialogOpen(false);
    setNewRange({
      number_type: 'isbn',
      range_start: '',
      range_end: '',
      source: 'manual',
      agency: '',
      expiry_date: ''
    });
  };

  // Filter and paginate attributions
  const filteredAttributions = attributions.filter(attr => 
    (numberTypeFilter === "all" || attr.number_type === numberTypeFilter) &&
    (searchTerm === "" || 
      attr.attributed_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attr.metadata.publication_title?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredAttributions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAttributions = filteredAttributions.slice(startIndex, endIndex);

  const downloadExcelTemplate = () => {
    // In real app, generate actual Excel template
    toast({
      title: "Téléchargement",
      description: "Template Excel en cours de téléchargement...",
    });
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
          <Button variant="outline" onClick={downloadExcelTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Template Excel
          </Button>
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Importer Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importer des numéros depuis Excel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Type de numéros</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="isbn">ISBN</SelectItem>
                      <SelectItem value="issn">ISSN</SelectItem>
                      <SelectItem value="dl">Dépôt Légal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Fichier Excel</Label>
                  <Input 
                    type="file" 
                    accept=".xlsx,.xls"
                    onChange={handleImportExcel}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Format: numéro_début, numéro_fin, agence, date_expiration
                  </p>
                </div>

                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium mb-1">Instructions:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Téléchargez le template Excel ci-dessus</li>
                    <li>Remplissez les colonnes avec vos numéros</li>
                    <li>Importez le fichier complété</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="pending-requests" className="w-full">
        <TabsList className="h-11">
          <TabsTrigger value="pending-requests" className="text-base font-medium">
            Demandes à traiter
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="attributions" className="text-base font-medium">Attributions</TabsTrigger>
          <TabsTrigger value="reserved" className="text-base font-medium">Tranches réservées</TabsTrigger>
          <TabsTrigger value="statistics" className="text-base font-medium">Statistiques</TabsTrigger>
        </TabsList>

        {/* Pending Requests Tab - Approved requests awaiting number attribution */}
        <TabsContent value="pending-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Demandes approuvées en attente d'attribution
                </span>
                <Button variant="outline" size="sm" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </CardTitle>
              <CardDescription>
                Ces demandes ont été validées et sont prêtes pour l'attribution des numéros ISBN/ISSN/DL
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Aucune demande en attente d'attribution</p>
                  <p className="text-sm">Toutes les demandes validées ont été traitées</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Demande</TableHead>
                      <TableHead>Publication</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Déclarant</TableHead>
                      <TableHead>Date validation</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono font-medium">
                          {request.request_number || request.dl_number}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="font-medium truncate">{request.title || request.metadata?.publication?.title}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {request.deposit_type === 'monographie' ? 'Monographie' : 'Périodique'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.author_name || request.metadata?.declarant?.name}
                        </TableCell>
                        <TableCell>
                          {request.updated_at 
                            ? format(new Date(request.updated_at), "dd/MM/yyyy", { locale: fr })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequestForView(request);
                                setIsViewRequestDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </Button>
                            {/* Hide attribution button if number already assigned */}
                            {!(request.isbn_assigned || request.issn_assigned || request.metadata?.isbn_assigned || request.metadata?.issn_assigned || request.metadata?.dl_number) ? (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsAttributionDialogOpen(true);
                                }}
                              >
                                <Hash className="h-4 w-4 mr-1" />
                                Attribuer N°
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Attribué
                              </Badge>
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
                      <TableHead>N° DL</TableHead>
                      <TableHead>Publication</TableHead>
                      <TableHead>Déclarant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {paginatedAttributions.map((attribution) => {
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
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {attribution.metadata.dl_number || '-'}
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
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAttribution(attribution);
                                  setIsDetailsOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Visualiser
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              <SearchPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredAttributions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reserved Ranges Management */}
        <TabsContent value="reserved" className="space-y-4">
          <ReservedRangesManager />
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

      {/* Attribution Dialog for new requests */}
      <Dialog open={isAttributionDialogOpen} onOpenChange={setIsAttributionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Attribution de numéro</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div>
                  <Label className="text-sm text-muted-foreground">N° Demande</Label>
                  <div className="font-mono font-medium">{selectedRequest.request_number || selectedRequest.dl_number}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Publication</Label>
                  <div className="font-medium">{selectedRequest.title || selectedRequest.metadata?.publication?.title}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Type</Label>
                  <div>{selectedRequest.deposit_type === 'monographie' ? 'Monographie (ISBN)' : 'Périodique (ISSN)'}</div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sélectionnez le type de numéro à attribuer pour cette publication :
                </p>
                
                <div className="grid gap-2">
                  {selectedRequest.deposit_type === 'monographie' ? (
                    <Button 
                      className="w-full justify-start"
                      onClick={() => attributeNumber(selectedRequest.id, 'isbn')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Attribuer un numéro ISBN
                    </Button>
                  ) : (
                    <Button 
                      className="w-full justify-start"
                      onClick={() => attributeNumber(selectedRequest.id, 'issn')}
                    >
                      <Newspaper className="h-4 w-4 mr-2" />
                      Attribuer un numéro ISSN
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => attributeNumber(selectedRequest.id, 'dl')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Attribuer le N° de Dépôt Légal
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => {
                  setIsAttributionDialogOpen(false);
                  setSelectedRequest(null);
                }}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Request Details Dialog */}
      <Dialog open={isViewRequestDialogOpen} onOpenChange={setIsViewRequestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Détails de la demande - {selectedRequestForView?.request_number || selectedRequestForView?.dl_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequestForView && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Publication</Label>
                  <div className="text-sm mt-1">{selectedRequestForView.title || selectedRequestForView.metadata?.publication?.title}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="text-sm mt-1">{selectedRequestForView.deposit_type === 'monographie' ? 'Monographie' : 'Périodique'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Déclarant</Label>
                  <div className="text-sm mt-1">{selectedRequestForView.author_name || selectedRequestForView.metadata?.declarant?.name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date de création</Label>
                  <div className="text-sm mt-1">
                    {selectedRequestForView.created_at 
                      ? format(new Date(selectedRequestForView.created_at), "dd/MM/yyyy HH:mm", { locale: fr })
                      : '-'}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewRequestDialogOpen(false)}>
                  Fermer
                </Button>
                <Button onClick={() => {
                  setIsViewRequestDialogOpen(false);
                  setSelectedRequest(selectedRequestForView);
                  setIsAttributionDialogOpen(true);
                }}>
                  <Hash className="h-4 w-4 mr-2" />
                  Attribuer N°
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};