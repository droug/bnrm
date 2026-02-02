import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Newspaper, 
  Hash, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  User,
  Building2,
  ChevronRight,
  Check,
  X
} from "lucide-react";

interface ReservedRange {
  id: string;
  requester_name: string | null;
  requester_email: string | null;
  number_type: string;
  range_start: string;
  range_end: string;
  current_position: string | null;
  total_numbers: number;
  used_numbers: number;
  used_numbers_list: string[] | null;
  status: string;
  notes: string | null;
}

interface NumberRange {
  id: string;
  number_type: string;
  range_start: string;
  range_end: string;
  current_position: string;
  total_numbers: number;
  used_numbers: number;
  status: string;
  agency?: string;
}

interface SelectedRequest {
  id: string;
  title?: string;
  author_name?: string;
  metadata?: {
    declarant?: {
      name?: string;
      organization?: string;
    };
    publisher_name?: string;
    publisher_email?: string;
    email?: string;
  };
}

interface NumberSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  numberType: 'isbn' | 'issn' | 'ismn';
  request: SelectedRequest | null;
  availableRanges: NumberRange[];
  onConfirm: (number: string, rangeId?: string) => Promise<void>;
  generateNextNumber: (type: 'isbn' | 'issn' | 'ismn', range: NumberRange) => string;
}

export const NumberSelectionModal = ({
  isOpen,
  onClose,
  numberType,
  request,
  availableRanges,
  onConfirm,
  generateNextNumber
}: NumberSelectionModalProps) => {
  const [declarantRanges, setDeclarantRanges] = useState<ReservedRange[]>([]);
  const [allReservedRanges, setAllReservedRanges] = useState<ReservedRange[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAttributing, setIsAttributing] = useState(false);
  const [selectedRangeId, setSelectedRangeId] = useState<string>("");
  const [selectedNumber, setSelectedNumber] = useState<string>("");
  const [useCustomNumber, setUseCustomNumber] = useState(false);
  const [customNumber, setCustomNumber] = useState("");
  const [activeTab, setActiveTab] = useState("declarant");
  const { toast } = useToast();

  // Extraire les informations du déclarant
  const declarantName = request?.author_name || 
                        request?.metadata?.declarant?.name || 
                        request?.metadata?.publisher_name || 
                        '';
  const declarantEmail = request?.metadata?.publisher_email || 
                         request?.metadata?.email ||
                         '';

  useEffect(() => {
    if (isOpen && numberType) {
      fetchRanges();
    }
  }, [isOpen, numberType, declarantName, declarantEmail]);

  const fetchRanges = async () => {
    setLoading(true);
    try {
      // Charger toutes les tranches réservées pour ce type
      const { data: reserved, error } = await supabase
        .from('reserved_number_ranges')
        .select('*')
        .eq('number_type', numberType)
        .eq('status', 'active');
      
      if (error) throw error;
      
      const allRanges = (reserved || []) as ReservedRange[];
      setAllReservedRanges(allRanges);
      
      // Filtrer les tranches du déclarant
      const declarantMatches = allRanges.filter(r => {
        const nameMatch = r.requester_name && 
          declarantName && 
          r.requester_name.toLowerCase().includes(declarantName.toLowerCase());
        const emailMatch = r.requester_email && 
          declarantEmail && 
          r.requester_email.toLowerCase() === declarantEmail.toLowerCase();
        return nameMatch || emailMatch;
      });
      
      setDeclarantRanges(declarantMatches);
      
      // Si le déclarant a une tranche, passer sur cet onglet
      if (declarantMatches.length > 0) {
        setActiveTab("declarant");
      } else {
        setActiveTab("bnrm");
      }
      
    } catch (e) {
      console.error("Error fetching reserved ranges:", e);
      toast({
        title: "Erreur",
        description: "Impossible de charger les tranches réservées",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Générer la liste des numéros disponibles dans une tranche
  const getAvailableNumbers = (range: ReservedRange): string[] => {
    const usedList = range.used_numbers_list || [];
    const available: string[] = [];
    
    // Générer les 10 premiers numéros disponibles pour affichage
    if (numberType === 'isbn' || numberType === 'ismn') {
      // Format: 978-XXXX-XXX-XX-X
      const prefix = range.range_start.substring(0, 14); // 978-9920-600-
      const startNum = parseInt(range.range_start.replace(/\D/g, '').slice(-3));
      const endNum = parseInt(range.range_end.replace(/\D/g, '').slice(-3));
      
      for (let i = startNum; i <= Math.min(startNum + 20, endNum); i++) {
        const num = `${prefix}${i.toString().padStart(2, '0')}-${calculateISBNCheckDigit(prefix + i.toString().padStart(2, '0'))}`;
        if (!usedList.includes(num)) {
          available.push(num);
          if (available.length >= 10) break;
        }
      }
    } else if (numberType === 'issn') {
      // Format: XXXX-XXXX
      const startNum = parseInt(range.range_start.replace('-', ''));
      const endNum = parseInt(range.range_end.replace('-', ''));
      
      for (let i = startNum; i <= Math.min(startNum + 20, endNum); i++) {
        const formatted = `${i.toString().slice(0, 4)}-${i.toString().slice(4)}`;
        if (!usedList.includes(formatted)) {
          available.push(formatted);
          if (available.length >= 10) break;
        }
      }
    }
    
    return available;
  };

  // Calculer le check digit ISBN-13 (simplify)
  const calculateISBNCheckDigit = (isbn: string): string => {
    const digits = isbn.replace(/\D/g, '');
    if (digits.length < 12) return '0';
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - (sum % 10)) % 10;
    return check.toString();
  };

  const handleConfirm = async () => {
    let numberToAssign = '';
    
    if (useCustomNumber && customNumber.trim()) {
      numberToAssign = customNumber.trim();
    } else if (selectedNumber) {
      numberToAssign = selectedNumber;
    } else if (selectedRangeId) {
      // Générer le prochain numéro depuis la tranche sélectionnée
      const bnrmRange = availableRanges.find(r => r.id === selectedRangeId);
      if (bnrmRange) {
        numberToAssign = generateNextNumber(numberType, bnrmRange);
      }
    }

    if (!numberToAssign) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un numéro",
        variant: "destructive"
      });
      return;
    }

    setIsAttributing(true);
    try {
      await onConfirm(numberToAssign, selectedRangeId);
      onClose();
    } catch (error) {
      console.error("Error confirming number:", error);
    } finally {
      setIsAttributing(false);
    }
  };

  const resetSelection = () => {
    setSelectedRangeId("");
    setSelectedNumber("");
    setUseCustomNumber(false);
    setCustomNumber("");
  };

  const getTypeIcon = () => {
    switch (numberType) {
      case 'isbn': return <BookOpen className="h-5 w-5" />;
      case 'issn': return <Newspaper className="h-5 w-5" />;
      case 'ismn': return <Hash className="h-5 w-5" />;
      default: return <Hash className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" style={{ zIndex: 10002 }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon()}
            Sélection du numéro {numberType?.toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        {/* Informations sur le déclarant */}
        <div className="bg-muted/50 border rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Déclarant</Label>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Nom: </span>
              <span className="font-medium">{declarantName || 'Non spécifié'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email: </span>
              <span className="font-medium">{declarantEmail || 'Non spécifié'}</span>
            </div>
          </div>
          {declarantRanges.length > 0 && (
            <Badge variant="outline" className="mt-2 bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              {declarantRanges.length} tranche(s) attribuée(s) à ce déclarant
            </Badge>
          )}
          {declarantRanges.length === 0 && declarantName && (
            <Badge variant="outline" className="mt-2 bg-amber-100 text-amber-800 border-amber-300">
              <AlertCircle className="h-3 w-3 mr-1" />
              Aucune tranche attribuée à ce déclarant
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); resetSelection(); }} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="declarant" className="relative">
                <Building2 className="h-4 w-4 mr-1" />
                Tranches du déclarant
                {declarantRanges.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {declarantRanges.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bnrm">
                <Hash className="h-4 w-4 mr-1" />
                Tranches BNRM
              </TabsTrigger>
              <TabsTrigger value="custom">
                <ChevronRight className="h-4 w-4 mr-1" />
                N° personnalisé
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 pr-4 mt-4">
              {/* Tab: Tranches du déclarant */}
              <TabsContent value="declarant" className="mt-0">
                {declarantRanges.length === 0 ? (
                  <div className="bg-muted/50 border border-dashed rounded-lg p-8 text-center">
                    <AlertCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Aucune tranche attribuée</p>
                    <p className="text-sm text-muted-foreground">
                      Ce déclarant n'a pas encore de tranche {numberType?.toUpperCase()} réservée.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Utilisez les tranches BNRM ou saisissez un numéro personnalisé.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {declarantRanges.map((range) => {
                      const usagePercent = Math.round((range.used_numbers / range.total_numbers) * 100);
                      const availableNums = getAvailableNumbers(range);
                      const usedNums = range.used_numbers_list || [];
                      
                      return (
                        <div 
                          key={range.id}
                          className="border rounded-lg overflow-hidden"
                        >
                          {/* En-tête de la tranche */}
                          <div className="bg-green-50 border-b border-green-100 p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-green-900">
                                  {range.requester_name || 'Professionnel'}
                                </div>
                                <div className="font-mono text-sm text-green-700">
                                  {range.range_start} → {range.range_end}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="bg-white">
                                  {range.used_numbers}/{range.total_numbers} utilisés
                                </Badge>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {usagePercent}% utilisé
                                </div>
                              </div>
                            </div>
                            {/* Barre de progression */}
                            <div className="mt-2 h-2 bg-green-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 transition-all"
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Numéros utilisés */}
                          {usedNums.length > 0 && (
                            <div className="p-3 bg-gray-50 border-b">
                              <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                                Numéros déjà attribués ({usedNums.length})
                              </Label>
                              <div className="flex flex-wrap gap-1">
                                {usedNums.map((num, i) => (
                                  <Badge 
                                    key={i}
                                    variant="secondary" 
                                    className="font-mono text-xs bg-gray-200 text-gray-600"
                                  >
                                    <X className="h-3 w-3 mr-1 text-red-400" />
                                    {num}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Numéros disponibles */}
                          <div className="p-3">
                            <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                              Numéros disponibles (sélectionnez-en un)
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              {availableNums.map((num, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setSelectedNumber(num);
                                    setSelectedRangeId(range.id);
                                    setUseCustomNumber(false);
                                  }}
                                  className={`flex items-center justify-between p-2 rounded border text-left transition-colors ${
                                    selectedNumber === num
                                      ? 'border-primary bg-primary/10 text-primary'
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <span className="font-mono text-sm">{num}</span>
                                  {selectedNumber === num && (
                                    <Check className="h-4 w-4 text-primary" />
                                  )}
                                </button>
                              ))}
                            </div>
                            {availableNums.length === 0 && (
                              <div className="text-center py-4 text-muted-foreground text-sm">
                                Tous les numéros de cette tranche ont été attribués.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Tab: Tranches BNRM */}
              <TabsContent value="bnrm" className="mt-0">
                {availableRanges.length === 0 ? (
                  <div className="bg-muted/50 border border-dashed rounded-lg p-8 text-center">
                    <AlertCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Aucune tranche BNRM disponible</p>
                    <p className="text-sm text-muted-foreground">
                      Aucune tranche {numberType?.toUpperCase()} n'est actuellement active.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableRanges.map((range) => {
                      const usagePercent = Math.round((range.used_numbers / range.total_numbers) * 100);
                      const nextNumber = generateNextNumber(numberType, range);
                      
                      return (
                        <div 
                          key={range.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedRangeId === range.id && !useCustomNumber
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-muted-foreground/50'
                          }`}
                          onClick={() => {
                            setSelectedRangeId(range.id);
                            setSelectedNumber('');
                            setUseCustomNumber(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                checked={selectedRangeId === range.id && !useCustomNumber && !selectedNumber}
                                onChange={() => {}}
                                className="h-4 w-4 text-primary"
                              />
                              <div>
                                <div className="font-mono text-sm font-medium">
                                  {range.range_start} → {range.range_end}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {range.agency || 'Source manuelle'} • {range.used_numbers}/{range.total_numbers} utilisés ({usagePercent}%)
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Prochain numéro</div>
                              <div className="font-mono text-sm font-bold text-primary">{nextNumber}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Autres tranches réservées (pas du déclarant) */}
                {allReservedRanges.filter(r => !declarantRanges.some(dr => dr.id === r.id)).length > 0 && (
                  <div className="mt-6">
                    <Label className="text-sm font-medium mb-2 block">
                      Autres tranches professionnelles réservées
                    </Label>
                    <div className="space-y-2">
                      {allReservedRanges
                        .filter(r => !declarantRanges.some(dr => dr.id === r.id))
                        .map((range) => (
                          <div 
                            key={range.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-colors bg-amber-50/50 ${
                              selectedRangeId === range.id 
                                ? 'border-amber-500 bg-amber-100/50' 
                                : 'border-amber-200 hover:border-amber-400'
                            }`}
                            onClick={() => {
                              setSelectedRangeId(range.id);
                              setSelectedNumber('');
                              setUseCustomNumber(false);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  checked={selectedRangeId === range.id && !useCustomNumber}
                                  onChange={() => {}}
                                  className="h-4 w-4 text-amber-600"
                                />
                                <div>
                                  <div className="font-mono text-sm font-medium">
                                    {range.range_start} → {range.range_end}
                                  </div>
                                  <div className="text-xs text-amber-700">
                                    Réservé pour: {range.requester_name || 'Professionnel'}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                                Réservé
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab: Numéro personnalisé */}
              <TabsContent value="custom" className="mt-0">
                <div className="space-y-4">
                  <div className="bg-muted/50 border rounded-lg p-4">
                    <Label className="text-sm font-medium mb-2 block">
                      Saisir un numéro {numberType?.toUpperCase()} personnalisé
                    </Label>
                    <Input
                      placeholder={
                        numberType === 'isbn' ? '978-XXXX-XXX-XX-X' :
                        numberType === 'issn' ? 'XXXX-XXXX' :
                        'Numéro ISMN'
                      }
                      value={customNumber}
                      onChange={(e) => {
                        setCustomNumber(e.target.value);
                        setUseCustomNumber(true);
                        setSelectedRangeId('');
                        setSelectedNumber('');
                      }}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Utilisez cette option uniquement si vous avez un numéro spécifique à attribuer.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}

        {/* Résumé de la sélection */}
        {(selectedNumber || (selectedRangeId && !selectedNumber && activeTab === 'bnrm') || (useCustomNumber && customNumber)) && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">Numéro sélectionné:</span>
              </div>
              <div className="font-mono font-bold text-primary text-lg">
                {selectedNumber || 
                 (useCustomNumber && customNumber) || 
                 (selectedRangeId && availableRanges.find(r => r.id === selectedRangeId) && 
                   generateNextNumber(numberType, availableRanges.find(r => r.id === selectedRangeId)!))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isAttributing || (!selectedRangeId && !selectedNumber && !(useCustomNumber && customNumber.trim()))}
          >
            {isAttributing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Attribution...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmer l'attribution
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
