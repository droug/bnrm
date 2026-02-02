import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollableDialog, ScrollableDialogContent, ScrollableDialogHeader, ScrollableDialogTitle } from "@/components/ui/scrollable-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { 
  Upload, 
  Download, 
  Plus, 
  FileSpreadsheet,
  BookOpen,
  Newspaper,
  Hash,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Library
} from "lucide-react";
import { ReservedRangesManager } from "./ReservedRangesManager";

interface ImportedNumber {
  number_type: 'isbn' | 'issn' | 'ismn' | 'dl';
  number_value: string;
  status: 'available' | 'used' | 'reserved';
  professional_name?: string;
  professional_type?: 'editeur' | 'imprimeur' | 'producteur';
  notes?: string;
}

interface RangeAssignment {
  professional_id: string;
  professional_name: string;
  professional_type: 'editeur' | 'imprimeur' | 'producteur';
  number_type: 'isbn' | 'issn' | 'ismn' | 'dl';
  range_start: string;
  range_end: string;
  quantity: number;
  notes?: string;
}

interface BNRMRange {
  id: string;
  number_type: string;
  range_start: string;
  range_end: string;
  total_numbers: number;
  used_numbers: number;
  used_numbers_list: string[];
  status: string;
  requester_name?: string;
}

export const NumberManagementTab = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState("import");
  const [importing, setImporting] = useState(false);
  const [importedNumbers, setImportedNumbers] = useState<ImportedNumber[]>([]);
  const [importPreview, setImportPreview] = useState<ImportedNumber[]>([]);
  const [selectedNumberType, setSelectedNumberType] = useState<'isbn' | 'issn' | 'ismn' | 'dl'>('isbn');
  
  // Range assignment state
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [professionalSearch, setProfessionalSearch] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [assignmentMode, setAssignmentMode] = useState<'bnrm' | 'manual'>('bnrm');
  const [bnrmRanges, setBnrmRanges] = useState<BNRMRange[]>([]);
  const [selectedBnrmRange, setSelectedBnrmRange] = useState<BNRMRange | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [loadingRanges, setLoadingRanges] = useState(false);
  const [rangeForm, setRangeForm] = useState<RangeAssignment>({
    professional_id: '',
    professional_name: '',
    professional_type: 'editeur',
    number_type: 'isbn',
    range_start: '',
    range_end: '',
    quantity: 0,
    notes: ''
  });

  // Fetch professionals based on type
  const fetchProfessionals = async (type: 'editeur' | 'imprimeur' | 'producteur') => {
    try {
      // Fetch from publishers table for all types as it's a common directory
      const { data, error } = await supabase
        .from('publishers')
        .select('id, name, city, email')
        .order('name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      // Fallback to mock data
      setProfessionals([
        { id: '1', name: 'Éditions Marocaines', city: 'Rabat', email: 'contact@editions-marocaines.ma' },
        { id: '2', name: 'Dar Al Kitab', city: 'Casablanca', email: 'info@darelkitab.ma' },
        { id: '3', name: 'Publications Universitaires', city: 'Fès', email: 'pub@uni-fes.ma' },
      ]);
    }
  };

  // Handle Excel file import
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      // Map Excel data to our format
      const numbers: ImportedNumber[] = jsonData.map((row) => ({
        number_type: (row['Type'] || row['type'] || row['NUMBER_TYPE'] || selectedNumberType).toLowerCase() as any,
        number_value: String(row['Numéro'] || row['numero'] || row['NUMBER'] || row['number'] || ''),
        status: 'available' as const,
        professional_name: row['Professionnel'] || row['professional_name'] || row['EDITEUR'] || row['IMPRIMEUR'] || '',
        professional_type: row['Type Professionnel'] || row['professional_type'] || 'editeur',
        notes: row['Notes'] || row['notes'] || ''
      })).filter(n => n.number_value);

      setImportPreview(numbers);
      toast({
        title: "Fichier analysé",
        description: `${numbers.length} numéros trouvés dans le fichier`,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lire le fichier Excel",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Save imported numbers to database - creates reserved ranges from the imported numbers
  const saveImportedNumbers = async () => {
    if (importPreview.length === 0) return;

    setImporting(true);
    try {
      // Group numbers by type and professional for batch insertion as ranges
      const groupedNumbers = importPreview.reduce((acc, num) => {
        const key = `${num.number_type}-${num.professional_name || 'BNRM'}`;
        if (!acc[key]) {
          acc[key] = {
            number_type: num.number_type,
            professional_name: num.professional_name,
            numbers: []
          };
        }
        acc[key].numbers.push(num.number_value);
        return acc;
      }, {} as Record<string, { number_type: string; professional_name?: string; numbers: string[] }>);

      // Create ranges from grouped numbers
      const user = await supabase.auth.getUser();
      const rangesToInsert = Object.values(groupedNumbers).map((group: any) => ({
        requester_id: user.data.user?.id || '',
        requester_name: group.professional_name || 'BNRM (Import)',
        deposit_type: 'import',
        number_type: group.number_type,
        range_start: group.numbers[0],
        range_end: group.numbers[group.numbers.length - 1],
        current_position: group.numbers[0],
        total_numbers: group.numbers.length,
        used_numbers: 0,
        status: 'active',
        notes: `Import Excel - ${group.numbers.length} numéros`,
        reserved_by: user.data.user?.id
      }));

      const { error } = await supabase
        .from('reserved_number_ranges')
        .insert(rangesToInsert);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `${importPreview.length} numéros importés avec succès`,
      });

      setImportedNumbers([...importedNumbers, ...importPreview]);
      setImportPreview([]);
    } catch (error: any) {
      console.error('Error saving numbers:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer les numéros",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  // Download Excel template
  const downloadTemplate = () => {
    const templateData = [
      {
        'Type': 'isbn',
        'Numéro': '978-9981-100-00-0',
        'Professionnel': 'Nom Éditeur (optionnel)',
        'Type Professionnel': 'editeur',
        'Notes': 'Commentaires (optionnel)'
      },
      {
        'Type': 'issn',
        'Numéro': '2550-0001',
        'Professionnel': '',
        'Type Professionnel': '',
        'Notes': ''
      },
      {
        'Type': 'ismn',
        'Numéro': '979-0-000000-00-0',
        'Professionnel': '',
        'Type Professionnel': '',
        'Notes': ''
      },
      {
        'Type': 'dl',
        'Numéro': 'DL-2025-000001',
        'Professionnel': '',
        'Type Professionnel': '',
        'Notes': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Numéros');
    XLSX.writeFile(wb, 'modele_import_numeros.xlsx');
  };

  // Assign range to professional
  const handleAssignRange = async () => {
    if (!selectedProfessional || !rangeForm.range_start || !rangeForm.range_end) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('reserved_number_ranges')
        .insert({
          requester_id: selectedProfessional.id,
          requester_name: selectedProfessional.name,
          deposit_type: rangeForm.professional_type,
          number_type: rangeForm.number_type,
          range_start: rangeForm.range_start,
          range_end: rangeForm.range_end,
          current_position: rangeForm.range_start,
          total_numbers: rangeForm.quantity || 100,
          used_numbers: 0,
          status: 'active',
          notes: rangeForm.notes,
          reserved_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Plage attribuée à ${selectedProfessional.name}`,
      });

      setIsAssignDialogOpen(false);
      resetRangeForm();
    } catch (error: any) {
      console.error('Error assigning range:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'attribuer la plage",
        variant: "destructive"
      });
    }
  };

  const resetRangeForm = () => {
    setRangeForm({
      professional_id: '',
      professional_name: '',
      professional_type: 'editeur',
      number_type: 'isbn',
      range_start: '',
      range_end: '',
      quantity: 0,
      notes: ''
    });
    setSelectedProfessional(null);
    setProfessionalSearch('');
    setAssignmentMode('bnrm');
    setSelectedBnrmRange(null);
    setSelectedNumbers([]);
  };

  // Fetch BNRM ranges
  const fetchBnrmRanges = async (numberType: string) => {
    setLoadingRanges(true);
    try {
      const { data, error } = await supabase
        .from('reserved_number_ranges')
        .select('*')
        .eq('number_type', numberType)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBnrmRanges(data || []);
    } catch (error) {
      console.error('Error fetching BNRM ranges:', error);
      setBnrmRanges([]);
    } finally {
      setLoadingRanges(false);
    }
  };

  // Generate available numbers from a range
  const generateAvailableNumbers = (range: BNRMRange): string[] => {
    const usedList = range.used_numbers_list || [];
    const numbers: string[] = [];
    
    // Parse the range and generate numbers
    // This is a simplified version - adapt based on your number format
    const start = range.range_start;
    const end = range.range_end;
    
    // For ISBN format: 978-9920-600-00-0 to 978-9920-600-99-9
    if (range.number_type === 'isbn') {
      const prefix = start.substring(0, start.lastIndexOf('-', start.lastIndexOf('-') - 1) + 1);
      const startNum = parseInt(start.split('-').slice(-2, -1)[0]);
      const endNum = parseInt(end.split('-').slice(-2, -1)[0]);
      
      for (let i = startNum; i <= Math.min(endNum, startNum + 99); i++) {
        const numStr = i.toString().padStart(2, '0');
        // Calculate check digit (simplified - you may need proper ISBN check digit calculation)
        const checkDigit = (i % 10).toString();
        const fullNumber = `${prefix}${numStr}-${checkDigit}`;
        if (!usedList.includes(fullNumber)) {
          numbers.push(fullNumber);
        }
      }
    } else if (range.number_type === 'issn') {
      const prefix = start.split('-')[0];
      const startNum = parseInt(start.split('-')[1]);
      const endNum = parseInt(end.split('-')[1]);
      
      for (let i = startNum; i <= Math.min(endNum, startNum + 99); i++) {
        const fullNumber = `${prefix}-${i.toString().padStart(4, '0')}`;
        if (!usedList.includes(fullNumber)) {
          numbers.push(fullNumber);
        }
      }
    } else {
      // DL or other format
      const parts = start.split('-');
      const prefix = parts.slice(0, -1).join('-');
      const startNum = parseInt(parts[parts.length - 1]);
      const endParts = end.split('-');
      const endNum = parseInt(endParts[endParts.length - 1]);
      
      for (let i = startNum; i <= Math.min(endNum, startNum + 99); i++) {
        const fullNumber = `${prefix}-${i.toString().padStart(6, '0')}`;
        if (!usedList.includes(fullNumber)) {
          numbers.push(fullNumber);
        }
      }
    }
    
    return numbers.slice(0, 50); // Limit to first 50 available
  };

  // Handle assigning selected numbers from BNRM range
  const handleAssignFromBnrm = async () => {
    if (!selectedProfessional || selectedNumbers.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un professionnel et au moins un numéro",
        variant: "destructive"
      });
      return;
    }

    try {
      const user = await supabase.auth.getUser();
      
      // Create a new range for the professional with the selected numbers
      const { error } = await supabase
        .from('reserved_number_ranges')
        .insert({
          requester_id: selectedProfessional.id,
          requester_name: selectedProfessional.name,
          requester_email: selectedProfessional.email,
          deposit_type: rangeForm.professional_type,
          number_type: rangeForm.number_type,
          range_start: selectedNumbers[0],
          range_end: selectedNumbers[selectedNumbers.length - 1],
          current_position: selectedNumbers[0],
          total_numbers: selectedNumbers.length,
          used_numbers: 0,
          used_numbers_list: [],
          status: 'active',
          notes: `Attribution de ${selectedNumbers.length} numéros depuis BNRM${rangeForm.notes ? ' - ' + rangeForm.notes : ''}`,
          reserved_by: user.data.user?.id
        });

      if (error) throw error;

      // If we took numbers from an existing range, update its used_numbers_list
      if (selectedBnrmRange) {
        const updatedUsedList = [...(selectedBnrmRange.used_numbers_list || []), ...selectedNumbers];
        await supabase
          .from('reserved_number_ranges')
          .update({
            used_numbers_list: updatedUsedList,
            used_numbers: updatedUsedList.length
          })
          .eq('id', selectedBnrmRange.id);
      }

      toast({
        title: "Succès",
        description: `${selectedNumbers.length} numéros attribués à ${selectedProfessional.name}`,
      });

      setIsAssignDialogOpen(false);
      resetRangeForm();
    } catch (error: any) {
      console.error('Error assigning from BNRM:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'attribuer les numéros",
        variant: "destructive"
      });
    }
  };

  // Toggle number selection
  const toggleNumberSelection = (number: string) => {
    setSelectedNumbers(prev => 
      prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number]
    );
  };

  // Select all available numbers
  const selectAllNumbers = (numbers: string[]) => {
    setSelectedNumbers(numbers);
  };

  const getNumberTypeIcon = (type: string) => {
    switch (type) {
      case 'isbn': return BookOpen;
      case 'issn': return Newspaper;
      case 'ismn': return Hash;
      case 'dl': return FileText;
      default: return FileText;
    }
  };

  const filteredProfessionals = professionals.filter(p =>
    p.name?.toLowerCase().includes(professionalSearch.toLowerCase()) ||
    p.city?.toLowerCase().includes(professionalSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Excel
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Attribution Plages
          </TabsTrigger>
        </TabsList>

        {/* Import Excel Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import de numéros via Excel
              </CardTitle>
              <CardDescription>
                Importez des numéros ISBN, ISSN, ISMN ou DL depuis un fichier Excel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type selection */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Type de numéro par défaut</Label>
                  <Select 
                    value={selectedNumberType} 
                    onValueChange={(v) => setSelectedNumberType(v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="isbn">ISBN</SelectItem>
                      <SelectItem value="issn">ISSN</SelectItem>
                      <SelectItem value="ismn">ISMN</SelectItem>
                      <SelectItem value="dl">N° Dépôt Légal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-6">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger modèle
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} disabled={importing}>
                    {importing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Importer fichier
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Preview table */}
              {importPreview.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Aperçu de l'import ({importPreview.length} numéros)</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setImportPreview([])}>
                        Annuler
                      </Button>
                      <Button onClick={saveImportedNumbers} disabled={importing}>
                        {importing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Confirmer l'import
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Numéro</TableHead>
                          <TableHead>Professionnel</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importPreview.slice(0, 100).map((num, index) => {
                          const Icon = getNumberTypeIcon(num.number_type);
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                  <span className="uppercase font-mono text-sm">{num.number_type}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono">{num.number_value}</TableCell>
                              <TableCell>{num.professional_name || '-'}</TableCell>
                              <TableCell className="max-w-xs truncate">{num.notes || '-'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {importPreview.length > 100 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Affichage des 100 premiers numéros sur {importPreview.length}
                    </p>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Format du fichier Excel
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li><strong>Type</strong>: isbn, issn, ismn ou dl</li>
                  <li><strong>Numéro</strong>: Le numéro complet (ex: 978-9981-100-00-0)</li>
                  <li><strong>Professionnel</strong>: Nom de l'éditeur/imprimeur/producteur (optionnel)</li>
                  <li><strong>Type Professionnel</strong>: editeur, imprimeur ou producteur</li>
                  <li><strong>Notes</strong>: Commentaires additionnels (optionnel)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Range Assignment Tab */}
        <TabsContent value="assign" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Attribution de plages par professionnel
                  </CardTitle>
                  <CardDescription>
                    Attribuez une plage de numéros à un éditeur, imprimeur ou producteur
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  setIsAssignDialogOpen(true);
                  fetchProfessionals('editeur');
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle attribution
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* This will show existing range assignments - delegated to ReservedRangesManager */}
              <ReservedRangesManager />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Range Assignment Dialog */}
      <ScrollableDialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <ScrollableDialogContent className="max-w-3xl max-h-[90vh]">
          <ScrollableDialogHeader>
            <ScrollableDialogTitle>Attribuer une plage de numéros</ScrollableDialogTitle>
          </ScrollableDialogHeader>
          <div className="space-y-4 p-6 overflow-y-auto max-h-[70vh]">
            {/* Professional Type and Number Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de professionnel *</Label>
                <Select 
                  value={rangeForm.professional_type} 
                  onValueChange={(v) => {
                    setRangeForm(prev => ({ ...prev, professional_type: v as any }));
                    fetchProfessionals(v as any);
                    setSelectedProfessional(null);
                    setProfessionalSearch('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editeur">Éditeur</SelectItem>
                    <SelectItem value="imprimeur">Imprimeur</SelectItem>
                    <SelectItem value="producteur">Producteur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type de numéro *</Label>
                <Select 
                  value={rangeForm.number_type} 
                  onValueChange={(v) => {
                    setRangeForm(prev => ({ ...prev, number_type: v as any }));
                    fetchBnrmRanges(v);
                    setSelectedBnrmRange(null);
                    setSelectedNumbers([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="isbn">ISBN</SelectItem>
                    <SelectItem value="issn">ISSN</SelectItem>
                    <SelectItem value="ismn">ISMN</SelectItem>
                    <SelectItem value="dl">N° Dépôt Légal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Professional Search */}
            <div className="space-y-2">
              <Label>
                {rangeForm.professional_type === 'editeur' ? 'Éditeur' : 
                 rangeForm.professional_type === 'imprimeur' ? 'Imprimeur' : 'Producteur'} *
              </Label>
              {selectedProfessional ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{selectedProfessional.name}</span>
                    {selectedProfessional.city && (
                      <span className="text-sm text-muted-foreground">({selectedProfessional.city})</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProfessional(null)}>
                    Modifier
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Rechercher..."
                    value={professionalSearch}
                    onChange={(e) => setProfessionalSearch(e.target.value)}
                  />
                  {professionalSearch && filteredProfessionals.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredProfessionals.slice(0, 10).map((prof) => (
                        <div
                          key={prof.id}
                          className="px-3 py-2 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedProfessional(prof);
                            setProfessionalSearch('');
                          }}
                        >
                          <div className="font-medium">{prof.name}</div>
                          {prof.city && (
                            <div className="text-sm text-muted-foreground">{prof.city}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mode Selection */}
            <div className="space-y-3">
              <Label>Mode d'attribution *</Label>
              <RadioGroup 
                value={assignmentMode} 
                onValueChange={(v) => {
                  setAssignmentMode(v as 'bnrm' | 'manual');
                  if (v === 'bnrm') {
                    fetchBnrmRanges(rangeForm.number_type);
                  }
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bnrm" id="mode-bnrm" />
                  <Label htmlFor="mode-bnrm" className="flex items-center gap-2 cursor-pointer">
                    <Library className="h-4 w-4" />
                    Sélectionner depuis les tranches BNRM
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="mode-manual" />
                  <Label htmlFor="mode-manual" className="cursor-pointer">
                    Saisie manuelle
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* BNRM Selection Mode */}
            {assignmentMode === 'bnrm' && (
              <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Tranches BNRM disponibles</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchBnrmRanges(rangeForm.number_type)}
                    disabled={loadingRanges}
                  >
                    {loadingRanges ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualiser'}
                  </Button>
                </div>

                {loadingRanges ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : bnrmRanges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Aucune tranche BNRM disponible pour ce type de numéro</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Range Selection */}
                    <div className="space-y-2">
                      <Label>Sélectionner une tranche</Label>
                      <Select 
                        value={selectedBnrmRange?.id || ''} 
                        onValueChange={(id) => {
                          const range = bnrmRanges.find(r => r.id === id);
                          setSelectedBnrmRange(range || null);
                          setSelectedNumbers([]);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une tranche..." />
                        </SelectTrigger>
                        <SelectContent>
                          {bnrmRanges.map((range) => (
                            <SelectItem key={range.id} value={range.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">
                                  {range.range_start} → {range.range_end}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {range.total_numbers - range.used_numbers} dispo
                                </Badge>
                                {range.requester_name && (
                                  <span className="text-xs text-muted-foreground">
                                    ({range.requester_name})
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Number Selection */}
                    {selectedBnrmRange && (
                      <div className="space-y-3">
                        {/* Quantity selector */}
                        <div className="flex items-center gap-4 p-3 bg-background border rounded-lg">
                          <div className="flex-1">
                            <Label className="text-sm">Quantité de numéros à attribuer</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="number"
                                min={1}
                                max={generateAvailableNumbers(selectedBnrmRange).length}
                                value={selectedNumbers.length || ''}
                                onChange={(e) => {
                                  const qty = Math.min(
                                    parseInt(e.target.value) || 0, 
                                    generateAvailableNumbers(selectedBnrmRange).length
                                  );
                                  const availableNums = generateAvailableNumbers(selectedBnrmRange);
                                  setSelectedNumbers(availableNums.slice(0, qty));
                                }}
                                placeholder="Entrer la quantité..."
                                className="w-32 font-mono"
                              />
                              <span className="text-sm text-muted-foreground">
                                sur {generateAvailableNumbers(selectedBnrmRange).length} disponibles
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => selectAllNumbers(generateAvailableNumbers(selectedBnrmRange))}
                            >
                              Tout sélectionner
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedNumbers([])}
                            >
                              Effacer
                            </Button>
                          </div>
                        </div>

                        {/* Quick quantity buttons */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Sélection rapide:</span>
                          {[10, 25, 50, 100].map(qty => {
                            const available = generateAvailableNumbers(selectedBnrmRange).length;
                            if (qty > available) return null;
                            return (
                              <Button
                                key={qty}
                                variant={selectedNumbers.length === qty ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  const availableNums = generateAvailableNumbers(selectedBnrmRange);
                                  setSelectedNumbers(availableNums.slice(0, qty));
                                }}
                              >
                                {qty}
                              </Button>
                            );
                          })}
                        </div>
                        
                        {/* Numbers preview */}
                        <div className="border rounded-lg p-3 max-h-48 overflow-y-auto bg-background">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm">Aperçu des numéros sélectionnés</Label>
                            {selectedNumbers.length > 0 && (
                              <Badge variant="secondary">{selectedNumbers.length} sélectionné(s)</Badge>
                            )}
                          </div>
                          {selectedNumbers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Entrez une quantité ou utilisez les boutons de sélection rapide
                            </p>
                          ) : (
                            <div className="grid grid-cols-3 gap-2">
                              {selectedNumbers.slice(0, 30).map((number) => (
                                <div
                                  key={number}
                                  className="flex items-center gap-2 p-2 rounded bg-primary/10 border border-primary/20"
                                >
                                  <CheckCircle className="h-3 w-3 text-primary" />
                                  <span className="font-mono text-xs">{number}</span>
                                </div>
                              ))}
                              {selectedNumbers.length > 30 && (
                                <div className="col-span-3 text-center text-sm text-muted-foreground py-2">
                                  ... et {selectedNumbers.length - 30} autres numéros
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {selectedNumbers.length > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <div>
                              <span className="font-medium text-foreground">
                                {selectedNumbers.length} numéro(s) prêt(s) à être attribués
                              </span>
                              <p className="text-xs text-muted-foreground">
                                De {selectedNumbers[0]} à {selectedNumbers[selectedNumbers.length - 1]}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Manual Mode */}
            {assignmentMode === 'manual' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Début de plage *</Label>
                  <Input
                    placeholder={rangeForm.number_type === 'isbn' ? '978-9981-XXX-00-0' : 
                                rangeForm.number_type === 'issn' ? '2550-0000' : 
                                rangeForm.number_type === 'ismn' ? '979-0-000000-00-0' : 'DL-2025-000001'}
                    value={rangeForm.range_start}
                    onChange={(e) => setRangeForm(prev => ({ ...prev, range_start: e.target.value }))}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fin de plage *</Label>
                  <Input
                    placeholder={rangeForm.number_type === 'isbn' ? '978-9981-XXX-99-9' : 
                                rangeForm.number_type === 'issn' ? '2550-9999' : 
                                rangeForm.number_type === 'ismn' ? '979-0-000000-99-9' : 'DL-2025-000099'}
                    value={rangeForm.range_end}
                    onChange={(e) => setRangeForm(prev => ({ ...prev, range_end: e.target.value }))}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={rangeForm.quantity || ''}
                    onChange={(e) => setRangeForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Commentaires additionnels..."
                value={rangeForm.notes || ''}
                onChange={(e) => setRangeForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setIsAssignDialogOpen(false);
                resetRangeForm();
              }}>
                Annuler
              </Button>
              <Button 
                onClick={assignmentMode === 'bnrm' ? handleAssignFromBnrm : handleAssignRange}
                disabled={
                  !selectedProfessional || 
                  (assignmentMode === 'bnrm' && selectedNumbers.length === 0) ||
                  (assignmentMode === 'manual' && (!rangeForm.range_start || !rangeForm.range_end))
                }
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {assignmentMode === 'bnrm' 
                  ? `Attribuer ${selectedNumbers.length} numéro(s)` 
                  : 'Attribuer la plage'}
              </Button>
            </div>
          </div>
        </ScrollableDialogContent>
      </ScrollableDialog>
    </div>
  );
};

export default NumberManagementTab;
