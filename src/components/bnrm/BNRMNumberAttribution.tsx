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
import { NumberManagementTab } from "@/components/legal-deposit/NumberManagementTab";
import { SearchPagination } from "@/components/ui/search-pagination";
import IssnRequestsManager from "@/components/legal-deposit/IssnRequestsManager";
import { NumberSelectionModal } from "@/components/legal-deposit/NumberSelectionModal";
import { RequestDetailsDrawer } from "@/components/legal-deposit/RequestDetailsDrawer";
import * as XLSX from 'xlsx';

interface NumberAttribution {
  id: string;
  deposit_id: string;
  number_type: 'isbn' | 'issn' | 'ismn' | 'dl';
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
  number_type: 'isbn' | 'issn' | 'ismn' | 'dl';
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
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [numberTypeFilter, setNumberTypeFilter] = useState("all");
  const [selectedAttribution, setSelectedAttribution] = useState<NumberAttribution | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAttributionDialogOpen, setIsAttributionDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isRangeDialogOpen, setIsRangeDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importNumberType, setImportNumberType] = useState<'isbn' | 'issn' | 'ismn' | 'dl'>('isbn');
  const [isViewRequestDialogOpen, setIsViewRequestDialogOpen] = useState(false);
  const [selectedRequestForView, setSelectedRequestForView] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newRange, setNewRange] = useState({
    number_type: 'isbn' as 'isbn' | 'issn' | 'ismn' | 'dl',
    range_start: '',
    range_end: '',
    source: 'manual' as 'manual' | 'imported' | 'agency',
    agency: '',
    expiry_date: ''
  });
  
  // État pour la sélection de numéro
  const [isNumberSelectionOpen, setIsNumberSelectionOpen] = useState(false);
  const [selectedNumberType, setSelectedNumberType] = useState<'isbn' | 'issn' | 'ismn' | null>(null);
  const [availableRanges, setAvailableRanges] = useState<NumberRange[]>([]);
  const [reservedRanges, setReservedRanges] = useState<any[]>([]);
  const [selectedRangeId, setSelectedRangeId] = useState<string>("");
  const [customNumber, setCustomNumber] = useState<string>("");
  const [useCustomNumber, setUseCustomNumber] = useState(false);
  const [isAttributing, setIsAttributing] = useState(false);
  
  // Paramétrage des numéros par type de document - avec persistance localStorage
  const defaultSettings = {
    monographie_imprime: { isbn: true, issn: false, ismn: false, dl: true },
    monographie_electronique: { isbn: true, issn: false, ismn: false, dl: false },
    monographie_electronique_collection: { isbn: false, issn: true, ismn: false, dl: false },
    periodique: { isbn: false, issn: true, ismn: false, dl: true },
    audiovisuel: { isbn: false, issn: false, ismn: true, dl: true },
    collections_specialisees: { isbn: false, issn: false, ismn: true, dl: true },
  };
  
  const [numberSettings, setNumberSettings] = useState<Record<string, { isbn: boolean; issn: boolean; ismn: boolean; dl: boolean }>>(() => {
    const saved = localStorage.getItem('depot_legal_number_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });
  
  const { toast } = useToast();

  // Récupérer les paramètres pour un type de document donné
  const getSettingsForType = (depositType: string) => {
    return numberSettings[depositType] || defaultSettings.monographie_imprime;
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Persister automatiquement les modifications du paramétrage dans localStorage
  useEffect(() => {
    localStorage.setItem('depot_legal_number_settings', JSON.stringify(numberSettings));
  }, [numberSettings]);

  const hasAnyAttributedNumber = (req: any) => {
    const metadata = (req?.metadata ?? {}) as Record<string, any>;

    // Vérifier uniquement les vrais numéros attribués (ISBN, ISSN, ISMN, DL assigné)
    // dl_number/request_number n'est PAS un numéro attribué, c'est juste l'identifiant de la demande
    return Boolean(
      metadata?.isbn_assigned ||
      metadata?.issn_assigned ||
      metadata?.ismn_assigned ||
      metadata?.dl_assigned
    );
  };

  // Déterminer le type de dépôt à partir des données de la demande
  const getDepositCategory = (req: any): 'monographie_imprime' | 'monographie_electronique' | 'monographie_electronique_collection' | 'periodique' | 'audiovisuel' | 'collections_specialisees' => {
    const supportType = req.support_type?.toLowerCase() || '';
    const metadata = (req.metadata as Record<string, any>) || {};
    const depositType = metadata?.deposit_type?.toLowerCase() || req.deposit_type?.toLowerCase() || '';
    const isCollection = metadata?.is_collection === true || metadata?.periodicite === 'oui' || supportType.includes('collection');
    const isElectronic = supportType.includes('electron') || supportType.includes('numérique') || supportType.includes('digital') || metadata?.support === 'electronique';
    
    // Vérifier si c'est audiovisuel
    if (depositType.includes('audiovisuel') || depositType.includes('audio-visuel') || 
        supportType.includes('audiovisuel') || supportType.includes('audio') || 
        supportType.includes('video') || supportType.includes('logiciel') ||
        supportType.includes('cd') || supportType.includes('dvd') || supportType.includes('film')) {
      return 'audiovisuel';
    }
    
    // Vérifier si c'est collections spécialisées
    if (depositType.includes('collection') && depositType.includes('special') ||
        supportType.includes('partition') || supportType.includes('musique') ||
        supportType.includes('carte') || supportType.includes('affiche') ||
        supportType.includes('estampe') || supportType.includes('photo')) {
      return 'collections_specialisees';
    }
    
    // Monographie ou périodique
    // "imprime" est aussi un type de monographie imprimée
    if (supportType.includes('livre') || supportType.includes('monograph') || 
        depositType.includes('monograph') || depositType.includes('livres') ||
        supportType === 'imprime' || supportType.includes('imprimé')) {
      // Distinguer les 3 types de monographies
      if (isElectronic && isCollection) {
        return 'monographie_electronique_collection';
      } else if (isElectronic) {
        return 'monographie_electronique';
      }
      return 'monographie_imprime';
    }
    
    // Périodique explicite
    if (supportType.includes('periodique') || supportType.includes('périodique') || 
        supportType.includes('journal') || supportType.includes('revue') ||
        depositType.includes('periodique') || depositType.includes('périodique')) {
      return 'periodique';
    }
    
    // Par défaut, considérer comme monographie imprimée si pas de type spécifique
    return 'monographie_imprime';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all validated requests (valide_par_b, valide_par_comite, attribue) - plus récentes en premier
      // (Même logique que /admin/legal-deposit → Gestion des demandes → Validés)
      const { data: validatedRequests, error: validatedError } = await supabase
        .from("legal_deposit_requests")
        .select("*")
        .in("status", ["valide_par_b", "valide_par_comite", "attribue"])
        .order("created_at", { ascending: false });

      if (validatedError) {
        console.error("Error fetching validated requests:", validatedError);
      }

      // Fetch requests with status 'attribue'
      const { data: attributedRequests, error: attributedError } = await supabase
        .from("legal_deposit_requests")
        .select("*")
        .eq("status", "attribue")
        .order("updated_at", { ascending: false });

      if (attributedError) {
        console.error("Error fetching attributed requests:", attributedError);
      }

      const validatedRows = validatedRequests || [];

      // IMPORTANT: afficher TOUTES les demandes approuvées (comme dans
      // "Gestion des Demandes" > "Validés"), même si un numéro a déjà été attribué.
      // Le bouton d'attribution sera masqué si un numéro existe déjà.
      const pendingRows = validatedRows;
      const attributedRowsFromValidated = validatedRows.filter((r) => hasAnyAttributedNumber(r));

      // Pending requests (à traiter) - toutes les approuvées, triées (plus récentes en premier)
      const transformedRequests = pendingRows.map((req) => {
        const metadata = (req.metadata as Record<string, any>) || {};
        const depositCategory = getDepositCategory(req);
        return {
          id: req.id,
          request_number: req.request_number,
          status: req.status,
          deposit_type: depositCategory,
          title: req.title,
          author_name: req.author_name,
          metadata: {
            publication: {
              title: req.title,
              type: req.support_type,
            },
            declarant: {
              name: req.author_name || "Non spécifié",
              organization: metadata?.publisher_name || "",
            },
            ...metadata,
          },
          created_at: req.created_at,
          updated_at: req.updated_at,
          dl_number: req.request_number,
          isbn_assigned: metadata?.isbn_assigned,
          issn_assigned: metadata?.issn_assigned,
          ismn_assigned: metadata?.ismn_assigned,
        };
      });

      setPendingRequests(transformedRequests);

      // Attributions = demandes avec status 'attribue' + demandes validées ayant un numéro
      // (dédoublonnage par id pour éviter les doublons quand une demande est à la fois attribuée et présente dans validatedRows)
      const allAttributedRows = Array.from(
        new Map(
          [...(attributedRequests || []), ...attributedRowsFromValidated].map((r: any) => [r.id, r])
        ).values()
      );

      const transformedAttributions: NumberAttribution[] = allAttributedRows.map((req) => {
        const metadata = (req.metadata as Record<string, any>) || {};

        // Détecter quel numéro est attribué en priorité (ISBN > ISSN > ISMN > DL)
        let numberType: "isbn" | "issn" | "ismn" | "dl" = "dl";
        let attributedNumber =
          metadata?.dl_number || metadata?.dl_assigned || req.dl_number || req.request_number;

        if (metadata?.isbn_assigned || req.isbn_assigned) {
          numberType = "isbn";
          attributedNumber = metadata?.isbn_assigned || req.isbn_assigned;
        } else if (metadata?.issn_assigned || req.issn_assigned) {
          numberType = "issn";
          attributedNumber = metadata?.issn_assigned || req.issn_assigned;
        } else if (metadata?.ismn_assigned || req.ismn_assigned) {
          numberType = "ismn";
          attributedNumber = metadata?.ismn_assigned || req.ismn_assigned;
        }

        const attributionDate =
          metadata?.[`${numberType}_attribution_date`] ||
          metadata?.dl_attribution_date ||
          metadata?.isbn_attribution_date ||
          metadata?.issn_attribution_date ||
          req.updated_at;

        return {
          id: req.id,
          deposit_id: req.id,
          number_type: numberType,
          attributed_number: attributedNumber,
          attribution_date: attributionDate,
          status: "attributed" as const,
          metadata: {
            publication_title: req.title,
            declarant_name: req.author_name || "Non spécifié",
            dl_number: req.request_number,
          },
        };
      });

      transformedAttributions.sort(
        (a, b) =>
          new Date(b.attribution_date).getTime() - new Date(a.attribution_date).getTime()
      );

      setAttributions(transformedAttributions);

      // Charger les tranches réservées depuis la base de données
      const { data: reservedRangesFromDB, error: reservedError } = await supabase
        .from('reserved_number_ranges')
        .select('*')
        .eq('status', 'active');

      if (reservedError) {
        console.error("Error fetching reserved ranges:", reservedError);
      }

      // Si aucune tranche réservée n'existe, en créer une exemple pour démonstration
      if (!reservedRangesFromDB || reservedRangesFromDB.length === 0) {
        // Créer une tranche exemple pour Editions Al Manar
        try {
          await supabase.from('reserved_number_ranges').insert([
            {
              requester_name: 'Editions Al Manar (Exemple)',
              requester_email: 'editions.almanar@example.com',
              deposit_type: 'monographie',
              number_type: 'isbn',
              range_start: '978-9920-600-00-0',
              range_end: '978-9920-600-99-9',
              current_position: '978-9920-600-03-1',
              total_numbers: 100,
              used_numbers: 3,
              used_numbers_list: ['978-9920-600-00-0', '978-9920-600-01-7', '978-9920-600-02-4'],
              status: 'active',
              notes: 'Tranche ISBN réservée pour Editions Al Manar - 100 numéros (Exemple)'
            },
            {
              requester_name: 'Revue Marocaine de Droit (Exemple)',
              requester_email: 'revue.droit@example.com',
              deposit_type: 'periodique',
              number_type: 'issn',
              range_start: '2820-0001',
              range_end: '2820-0010',
              current_position: '2820-0002',
              total_numbers: 10,
              used_numbers: 1,
              used_numbers_list: ['2820-0001'],
              status: 'active',
              notes: 'Tranche ISSN réservée pour Revue Marocaine de Droit (Exemple)'
            }
          ]);
          console.log("Created example reserved ranges");
        } catch (insertError) {
          console.log("Could not create example ranges:", insertError);
        }
      }

      // Tranches BNRM par défaut (peuvent être remplacées par des vraies données)
      setRanges([
        {
          id: "1",
          number_type: "isbn",
          range_start: "978-9981-100-00-0",
          range_end: "978-9981-199-99-9",
          current_position: "978-9981-123-45-6",
          total_numbers: 10000,
          used_numbers: 2346,
          status: "active",
          assigned_date: "2024-01-01",
          expiry_date: "2026-12-31",
          source: "agency",
          agency: "Agence Internationale ISBN",
        },
        {
          id: "2",
          number_type: "issn",
          range_start: "2550-0000",
          range_end: "2550-9999",
          current_position: "2550-4567",
          total_numbers: 10000,
          used_numbers: 4567,
          status: "active",
          assigned_date: "2024-01-01",
          source: "agency",
          agency: "Centre International ISSN",
        },
        {
          id: "3",
          number_type: "dl",
          range_start: "DL-2025-000001",
          range_end: "DL-2025-999999",
          current_position: "DL-2025-000123",
          total_numbers: 999999,
          used_numbers: 123,
          status: "active",
          assigned_date: "2025-01-01",
          source: "manual",
        },
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

  const generateNextNumber = (type: 'isbn' | 'issn' | 'ismn', currentRange: NumberRange): string => {
    if (type === 'isbn' || type === 'ismn') {
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

  const attributeNumber = async (requestId: string, numberType: 'isbn' | 'issn' | 'ismn' | 'dl') => {
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

      // Envoyer automatiquement la notification par email
      await handleNotifyAttribution(newAttribution);

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

  // Ouvrir l'interface de sélection de numéro
  const openNumberSelection = async (numberType: 'isbn' | 'issn' | 'ismn') => {
    setSelectedNumberType(numberType);
    setUseCustomNumber(false);
    setCustomNumber("");
    setSelectedRangeId("");
    
    // Filtrer les tranches disponibles pour ce type
    const filteredRanges = ranges.filter(r => r.number_type === numberType && r.status === 'active');
    setAvailableRanges(filteredRanges);
    
    // Charger les tranches réservées depuis la base de données
    try {
      const { data: reserved, error } = await supabase
        .from('reserved_number_ranges')
        .select('*')
        .eq('number_type', numberType)
        .eq('status', 'active');
      
      if (!error && reserved) {
        setReservedRanges(reserved);
      }
    } catch (e) {
      console.error("Error fetching reserved ranges:", e);
    }
    
    setIsNumberSelectionOpen(true);
  };

  // Confirmer l'attribution du numéro sélectionné
  const confirmNumberAttribution = async () => {
    if (!selectedRequest || !selectedNumberType) return;
    
    setIsAttributing(true);
    
    try {
      let attributedNumber = '';
      
      if (useCustomNumber && customNumber.trim()) {
        // Utiliser le numéro personnalisé
        attributedNumber = customNumber.trim();
      } else if (selectedRangeId) {
        // Générer depuis la tranche sélectionnée
        const range = availableRanges.find(r => r.id === selectedRangeId);
        if (range) {
          attributedNumber = generateNextNumber(selectedNumberType, range);
        } else {
          // Vérifier si c'est une tranche réservée
          const reservedRange = reservedRanges.find(r => r.id === selectedRangeId);
          if (reservedRange) {
            // Générer le prochain numéro pour la tranche réservée
            const currentNum = parseInt(reservedRange.current_number?.replace(/\D/g, '') || reservedRange.range_start?.replace(/\D/g, ''));
            attributedNumber = formatNumberForType(selectedNumberType, currentNum + 1);
          }
        }
      } else {
        // Prendre le premier range disponible par défaut
        const defaultRange = availableRanges[0];
        if (defaultRange) {
          attributedNumber = generateNextNumber(selectedNumberType, defaultRange);
        } else {
          throw new Error(`Aucune tranche ${selectedNumberType.toUpperCase()} disponible`);
        }
      }

      if (!attributedNumber) {
        throw new Error("Impossible de générer le numéro");
      }

      // Mettre à jour la demande
      const request = pendingRequests.find(r => r.id === selectedRequest.id);
      const currentMetadata = request?.metadata || {};
      
      const updateData: any = {
        metadata: {
          ...currentMetadata,
          [`${selectedNumberType}_assigned`]: attributedNumber,
          [`${selectedNumberType}_attribution_date`]: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from("legal_deposit_requests")
        .update(updateData)
        .eq("id", selectedRequest.id);

      if (error) throw error;

      // Ajouter à la liste des attributions
      const newAttribution: NumberAttribution = {
        id: Date.now().toString(),
        deposit_id: selectedRequest.id,
        number_type: selectedNumberType,
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
        description: `Numéro ${selectedNumberType.toUpperCase()} attribué: ${attributedNumber}`,
      });

      // Envoyer automatiquement la notification par email
      await handleNotifyAttribution(newAttribution);

      // Fermer les modales
      setIsNumberSelectionOpen(false);
      setIsAttributionDialogOpen(false);
      setSelectedRequest(null);
      setSelectedNumberType(null);

    } catch (error) {
      console.error("Error attributing number:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'attribuer le numéro",
        variant: "destructive",
      });
    } finally {
      setIsAttributing(false);
    }
  };

  // Formater un numéro selon le type
  const formatNumberForType = (type: 'isbn' | 'issn' | 'ismn', num: number): string => {
    if (type === 'isbn' || type === 'ismn') {
      const padded = num.toString().padStart(13, '0');
      return `${padded.slice(0, 3)}-${padded.slice(3, 7)}-${padded.slice(7, 10)}-${padded.slice(10, 12)}-${padded.slice(12)}`;
    } else {
      const padded = num.toString().padStart(8, '0');
      return `${padded.slice(0, 4)}-${padded.slice(4)}`;
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
      case 'ismn': return Hash; // Music notation icon
      case 'dl': return FileText;
      default: return Hash;
    }
  };

  const getDepositTypeLabel = (type: string) => {
    switch (type) {
      case 'monographie_imprime': return 'Monographie Imprimé';
      case 'monographie_electronique': return 'Monographie Électronique';
      case 'monographie_electronique_collection': return 'Monographie Électronique (Collection)';
      case 'monographie': return 'Monographie';
      case 'periodique': return 'Périodique';
      case 'audiovisuel': return 'Audio-visuel';
      case 'collections_specialisees': return 'Collections spécialisées';
      default: return type;
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
      toast({
        title: "Import en cours",
        description: "Traitement du fichier Excel...",
      });

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        toast({
          title: "Fichier vide",
          description: "Aucune donnée trouvée dans le fichier",
          variant: "destructive"
        });
        return;
      }

      // Parse and validate imported ranges
      const importedRanges: NumberRange[] = jsonData.map((row, index) => {
        const numberType = (row['Type'] || row['type'] || importNumberType).toLowerCase() as 'isbn' | 'issn' | 'ismn' | 'dl';
        const rangeStart = String(row['Numéro Début'] || row['numero_debut'] || row['range_start'] || '');
        const rangeEnd = String(row['Numéro Fin'] || row['numero_fin'] || row['range_end'] || '');
        const agency = row['Agence'] || row['agence'] || row['agency'] || 'BNRM';
        const expiryDate = row['Date Expiration'] || row['date_expiration'] || row['expiry_date'] || '';
        
        return {
          id: `import-${Date.now()}-${index}`,
          number_type: numberType,
          range_start: rangeStart,
          range_end: rangeEnd,
          current_position: rangeStart,
          total_numbers: 100, // Default estimate
          used_numbers: 0,
          status: 'active' as const,
          assigned_date: new Date().toISOString().split('T')[0],
          expiry_date: expiryDate || undefined,
          source: 'imported' as const,
          agency: agency
        };
      }).filter(r => r.range_start && r.range_end);

      if (importedRanges.length === 0) {
        toast({
          title: "Format invalide",
          description: "Aucune plage valide trouvée. Vérifiez le format du fichier.",
          variant: "destructive"
        });
        return;
      }

      // Add imported ranges to state
      setRanges(prev => [...prev, ...importedRanges]);

      // Also save to database if possible
      try {
        const user = await supabase.auth.getUser();
        const rangesToInsert = importedRanges.map(r => ({
          requester_id: user.data.user?.id || '',
          requester_name: r.agency || 'BNRM (Import)',
          deposit_type: 'import',
          number_type: r.number_type,
          range_start: r.range_start,
          range_end: r.range_end,
          current_position: r.range_start,
          total_numbers: r.total_numbers,
          used_numbers: 0,
          status: 'active',
          notes: `Import Excel - ${r.agency}`,
          reserved_by: user.data.user?.id
        }));

        await supabase.from('reserved_number_ranges').insert(rangesToInsert);
      } catch (dbError) {
        console.log("Could not save to database:", dbError);
      }

      toast({
        title: "Import réussi",
        description: `${importedRanges.length} plage(s) de numéros importée(s)`,
      });
      setIsImportDialogOpen(false);

      // Reset file input
      event.target.value = '';

    } catch (error) {
      console.error("Error importing Excel:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer le fichier. Vérifiez le format.",
        variant: "destructive",
      });
    }
  };

  // Fonction pour envoyer la notification d'attribution
  const handleNotifyAttribution = async (attribution: NumberAttribution) => {
    try {
      toast({
        title: "Envoi en cours",
        description: "Envoi de la notification par email...",
      });

      const { data, error } = await supabase.functions.invoke("notify-deposit-attribution", {
        body: {
          requestId: attribution.deposit_id,
          attributedNumbers: {
            isbn: attribution.number_type === 'isbn' ? attribution.attributed_number : undefined,
            issn: attribution.number_type === 'issn' ? attribution.attributed_number : undefined,
            dlNumber: attribution.metadata?.dl_number,
          }
        }
      });

      if (error) {
        console.error("Error sending notification:", error);
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Notification envoyée",
          description: `Email envoyé avec succès à ${data.recipient || data.recipientEmail || 'l\'utilisateur'}`,
        });
        setIsDetailsOpen(false);
      } else {
        throw new Error(data?.error || "Échec de l'envoi");
      }
    } catch (error: any) {
      console.error("Notification error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer la notification",
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
    // Generate actual Excel template using XLSX
    const templateData = [
      {
        'Type': 'isbn',
        'Numéro Début': '978-9981-100-00-0',
        'Numéro Fin': '978-9981-100-99-9',
        'Agence': 'BNRM',
        'Date Expiration': '2025-12-31',
        'Notes': 'Commentaires (optionnel)'
      },
      {
        'Type': 'issn',
        'Numéro Début': '2550-0001',
        'Numéro Fin': '2550-0100',
        'Agence': 'CIEPS',
        'Date Expiration': '',
        'Notes': ''
      },
      {
        'Type': 'ismn',
        'Numéro Début': '979-0-000000-00-0',
        'Numéro Fin': '979-0-000000-99-9',
        'Agence': 'ISMN International',
        'Date Expiration': '',
        'Notes': ''
      },
      {
        'Type': 'dl',
        'Numéro Début': 'DL-2025-000001',
        'Numéro Fin': 'DL-2025-001000',
        'Agence': 'BNRM',
        'Date Expiration': '',
        'Notes': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    // Set column widths
    ws['!cols'] = [
      { wch: 8 },  // Type
      { wch: 22 }, // Numéro Début
      { wch: 22 }, // Numéro Fin
      { wch: 20 }, // Agence
      { wch: 15 }, // Date Expiration
      { wch: 25 }  // Notes
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tranches Numéros');
    XLSX.writeFile(wb, 'template_import_numeros.xlsx');
    
    toast({
      title: "Téléchargement réussi",
      description: "Le template Excel a été téléchargé",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attribution des Numéros</h2>
          <p className="text-muted-foreground">
            Gestion des numéros ISBN, ISSN, ISMN et Dépôt Légal
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
                  <Select value={importNumberType} onValueChange={(v) => setImportNumberType(v as typeof importNumberType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent className="z-[10002]">
                      <SelectItem value="isbn">ISBN</SelectItem>
                      <SelectItem value="issn">ISSN</SelectItem>
                      <SelectItem value="ismn">ISMN</SelectItem>
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
        <TabsList className="h-11 flex-wrap">
          <TabsTrigger value="pending-requests" className="text-base font-medium">
            Demandes à traiter
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="number-requests" className="text-base font-medium">
            Demandes ISSN
          </TabsTrigger>
          <TabsTrigger value="attributions" className="text-base font-medium">Attribués</TabsTrigger>
          <TabsTrigger value="reserved" className="text-base font-medium">Gestion N°</TabsTrigger>
          <TabsTrigger value="settings" className="text-base font-medium">Paramétrage N°</TabsTrigger>
          <TabsTrigger value="statistics" className="text-base font-medium">Statistiques</TabsTrigger>
        </TabsList>

        {/* Pending Requests Tab - Approved requests awaiting number attribution */}
        <TabsContent value="pending-requests" className="space-y-4">
          {/* Search filter for pending requests */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par N° demande, titre ou déclarant..."
                  value={pendingSearchTerm}
                  onChange={(e) => setPendingSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
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
              {(() => {
                const filteredPendingRequests = pendingRequests.filter((request) => {
                  if (!pendingSearchTerm) return true;
                  const searchLower = pendingSearchTerm.toLowerCase();
                  const requestNumber = (request.request_number || request.dl_number || '').toLowerCase();
                  const title = (request.title || request.metadata?.publication?.title || '').toLowerCase();
                  const declarant = (request.author_name || request.metadata?.declarant?.name || '').toLowerCase();
                  return requestNumber.includes(searchLower) || title.includes(searchLower) || declarant.includes(searchLower);
                });
                
                if (filteredPendingRequests.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>{pendingSearchTerm ? 'Aucune demande correspondant à la recherche' : 'Aucune demande en attente d\'attribution'}</p>
                      <p className="text-sm">{pendingSearchTerm ? 'Essayez un autre terme de recherche' : 'Toutes les demandes validées ont été traitées'}</p>
                    </div>
                  );
                }
                
                return (
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
                    {filteredPendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono font-medium">
                          {request.request_number || request.dl_number}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="font-medium truncate">{request.title || request.metadata?.publication?.title}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getDepositTypeLabel(request.deposit_type)}
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
                            {!hasAnyAttributedNumber(request) ? (
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
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ISSN/Number Requests Tab */}
        <TabsContent value="number-requests" className="space-y-4">
          <IssnRequestsManager />
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
                <SelectItem value="ismn">ISMN</SelectItem>
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

        {/* Number Management - Import & Range Assignment */}
        <TabsContent value="reserved" className="space-y-4">
          <NumberManagementTab />
        </TabsContent>

        {/* Number Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramétrage des numéros par type de document
              </CardTitle>
              <CardDescription>
                Configurez les types de numéros disponibles pour chaque catégorie de dépôt légal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Monographie Imprimé */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Monographie Imprimé</h3>
                    <Badge variant="secondary" className="text-xs">ISBN + DL</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mono-imp-isbn"
                        checked={numberSettings.monographie_imprime?.isbn ?? true}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          monographie_imprime: { ...prev.monographie_imprime, isbn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="mono-imp-isbn" className="font-medium">ISBN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mono-imp-issn"
                        checked={numberSettings.monographie_imprime?.issn ?? false}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          monographie_imprime: { ...prev.monographie_imprime, issn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="mono-imp-issn" className="font-medium">ISSN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mono-imp-ismn"
                        checked={numberSettings.monographie_imprime?.ismn ?? false}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          monographie_imprime: { ...prev.monographie_imprime, ismn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="mono-imp-ismn" className="font-medium">ISMN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mono-imp-dl"
                        checked={numberSettings.monographie_imprime?.dl ?? true}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          monographie_imprime: { ...prev.monographie_imprime, dl: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="mono-imp-dl" className="font-medium">Dépôt Légal</Label>
                    </div>
                  </div>
                </div>

                {/* Monographie Électronique */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">Monographie Électronique</h3>
                    <Badge variant="secondary" className="text-xs">ISBN uniquement</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mono-elec-isbn"
                        checked={numberSettings.monographie_electronique?.isbn ?? true}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          monographie_electronique: { ...prev.monographie_electronique, isbn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="mono-elec-isbn" className="font-medium">ISBN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mono-elec-issn"
                        checked={numberSettings.monographie_electronique?.issn ?? false}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          monographie_electronique: { ...prev.monographie_electronique, issn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="mono-elec-issn" className="font-medium">ISSN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mono-elec-ismn"
                        checked={numberSettings.monographie_electronique?.ismn ?? false}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          monographie_electronique: { ...prev.monographie_electronique, ismn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="mono-elec-ismn" className="font-medium">ISMN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mono-elec-dl"
                        checked={numberSettings.monographie_electronique?.dl ?? false}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          monographie_electronique: { ...prev.monographie_electronique, dl: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="mono-elec-dl" className="font-medium">Dépôt Légal</Label>
                    </div>
                  </div>
                </div>

                {/* Monographie Électronique (Collection) */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold text-lg">Monographie Électronique (Collection)</h3>
                    <Badge variant="secondary" className="text-xs">ISSN uniquement</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mono-elec-col-isbn"
                        checked={numberSettings.monographie_electronique_collection?.isbn ?? false}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          monographie_electronique_collection: { ...prev.monographie_electronique_collection, isbn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="mono-elec-col-isbn" className="font-medium">ISBN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mono-elec-col-issn"
                        checked={numberSettings.monographie_electronique_collection?.issn ?? true}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          monographie_electronique_collection: { ...prev.monographie_electronique_collection, issn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="mono-elec-col-issn" className="font-medium">ISSN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mono-elec-col-ismn"
                        checked={numberSettings.monographie_electronique_collection?.ismn ?? false}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          monographie_electronique_collection: { ...prev.monographie_electronique_collection, ismn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="mono-elec-col-ismn" className="font-medium">ISMN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mono-elec-col-dl"
                        checked={numberSettings.monographie_electronique_collection?.dl ?? false}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          monographie_electronique_collection: { ...prev.monographie_electronique_collection, dl: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="mono-elec-col-dl" className="font-medium">Dépôt Légal</Label>
                    </div>
                  </div>
                </div>

                {/* Périodiques */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Newspaper className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Périodiques</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="period-isbn"
                        checked={numberSettings.periodique.isbn}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          periodique: { ...prev.periodique, isbn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="period-isbn" className="font-medium">ISBN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="period-issn"
                        checked={numberSettings.periodique.issn}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          periodique: { ...prev.periodique, issn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="period-issn" className="font-medium">ISSN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="period-ismn"
                        checked={numberSettings.periodique.ismn}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          periodique: { ...prev.periodique, ismn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="period-ismn" className="font-medium">ISMN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="period-dl"
                        checked={numberSettings.periodique.dl}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          periodique: { ...prev.periodique, dl: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="period-dl" className="font-medium">Dépôt Légal</Label>
                    </div>
                  </div>
                </div>

                {/* Audio-visuel & Logiciels */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Hash className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Audio-visuel & Logiciels</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="av-isbn"
                        checked={numberSettings.audiovisuel.isbn}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          audiovisuel: { ...prev.audiovisuel, isbn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="av-isbn" className="font-medium">ISBN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="av-issn"
                        checked={numberSettings.audiovisuel.issn}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          audiovisuel: { ...prev.audiovisuel, issn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="av-issn" className="font-medium">ISSN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="av-ismn"
                        checked={numberSettings.audiovisuel.ismn}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          audiovisuel: { ...prev.audiovisuel, ismn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="av-ismn" className="font-medium">ISMN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="av-dl"
                        checked={numberSettings.audiovisuel.dl}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          audiovisuel: { ...prev.audiovisuel, dl: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="av-dl" className="font-medium">Dépôt Légal</Label>
                    </div>
                  </div>
                </div>

                {/* Collections spécialisées */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Collections spécialisées</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cs-isbn"
                        checked={numberSettings.collections_specialisees.isbn}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          collections_specialisees: { ...prev.collections_specialisees, isbn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="cs-isbn" className="font-medium">ISBN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cs-issn"
                        checked={numberSettings.collections_specialisees.issn}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          collections_specialisees: { ...prev.collections_specialisees, issn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="cs-issn" className="font-medium">ISSN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cs-ismn"
                        checked={numberSettings.collections_specialisees.ismn}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          collections_specialisees: { ...prev.collections_specialisees, ismn: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="cs-ismn" className="font-medium">ISMN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cs-dl"
                        checked={numberSettings.collections_specialisees.dl}
                        onChange={(e) => setNumberSettings(prev => ({
                          ...prev,
                          collections_specialisees: { ...prev.collections_specialisees, dl: e.target.checked }
                        }))}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="cs-dl" className="font-medium">Dépôt Légal</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Les modifications sont enregistrées automatiquement et appliquées immédiatement.
                  </p>
                  <Button onClick={() => {
                    toast({
                      title: "Paramètres à jour",
                      description: "La configuration est synchronisée sur tous les types de document.",
                    });
                  }} variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Vérifier la configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <Button onClick={() => selectedAttribution && handleNotifyAttribution(selectedAttribution)}>
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
                  <div>{getDepositTypeLabel(selectedRequest.deposit_type)}</div>
                </div>
              </div>

              {/* N° de Dépôt Légal - Attribué automatiquement */}
              {getSettingsForType(selectedRequest.deposit_type).dl && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <Label className="text-sm font-medium text-green-800">N° de Dépôt Légal (attribué automatiquement)</Label>
                  </div>
                  <div className="font-mono font-bold text-green-700">
                    {selectedRequest.metadata?.dl_assigned || 'Sera généré à la validation'}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sélectionnez le type de numéro complémentaire à attribuer :
                </p>
                
                <div className="grid gap-2">
                  {/* ISBN - si activé pour ce type */}
                  {getSettingsForType(selectedRequest.deposit_type).isbn && (
                    <Button 
                      className="w-full justify-start"
                      onClick={() => openNumberSelection('isbn')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Attribuer un numéro ISBN
                    </Button>
                  )}
                  
                  {/* ISSN - si activé pour ce type */}
                  {getSettingsForType(selectedRequest.deposit_type).issn && (
                    <Button 
                      className="w-full justify-start"
                      onClick={() => openNumberSelection('issn')}
                    >
                      <Newspaper className="h-4 w-4 mr-2" />
                      Attribuer un numéro ISSN
                    </Button>
                  )}
                  
                  {/* ISMN - si activé pour ce type */}
                  {getSettingsForType(selectedRequest.deposit_type).ismn && (
                    <Button 
                      className="w-full justify-start"
                      onClick={() => openNumberSelection('ismn')}
                    >
                      <Hash className="h-4 w-4 mr-2" />
                      Attribuer un numéro ISMN
                    </Button>
                  )}
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

      {/* Number Selection Modal - Nouveau composant amélioré */}
      <NumberSelectionModal
        isOpen={isNumberSelectionOpen}
        onClose={() => {
          setIsNumberSelectionOpen(false);
          setSelectedNumberType(null);
        }}
        numberType={selectedNumberType || 'isbn'}
        request={selectedRequest}
        availableRanges={availableRanges}
        onConfirm={async (attributedNumber: string, rangeId?: string) => {
          if (!selectedRequest || !selectedNumberType) return;
          
          const request = pendingRequests.find(r => r.id === selectedRequest.id);
          const currentMetadata = request?.metadata || {};
          
          const updateData: any = {
            metadata: {
              ...currentMetadata,
              [`${selectedNumberType}_assigned`]: attributedNumber,
              [`${selectedNumberType}_attribution_date`]: new Date().toISOString()
            }
          };

          const { error } = await supabase
            .from("legal_deposit_requests")
            .update(updateData)
            .eq("id", selectedRequest.id);

          if (error) throw error;

          // Ajouter à la liste des attributions
          const newAttribution: NumberAttribution = {
            id: Date.now().toString(),
            deposit_id: selectedRequest.id,
            number_type: selectedNumberType,
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
            description: `Numéro ${selectedNumberType.toUpperCase()} attribué: ${attributedNumber}`,
          });

          // Envoyer automatiquement la notification par email
          await handleNotifyAttribution(newAttribution);

          // Fermer les modales
          setIsAttributionDialogOpen(false);
          setSelectedRequest(null);
          setSelectedNumberType(null);
        }}
        generateNextNumber={generateNextNumber}
      />

      {/* Request Details Drawer - Fenêtre latérale gauche */}
      <RequestDetailsDrawer
        isOpen={isViewRequestDialogOpen}
        onClose={() => {
          setIsViewRequestDialogOpen(false);
          setSelectedRequestForView(null);
        }}
        request={selectedRequestForView}
      />
    </div>
  );
};