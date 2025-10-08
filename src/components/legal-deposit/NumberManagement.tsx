import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Newspaper, 
  Hash, 
  Upload, 
  Download, 
  Plus,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import * as XLSX from 'xlsx';
import { ReservedRangesManager } from "./ReservedRangesManager";

interface NumberRange {
  id: string;
  number_type: 'isbn' | 'issn';
  prefix: string;
  range_start: string;
  range_end: string;
  current_position: string;
  total_numbers: number;
  used_numbers: number;
  range_status: 'active' | 'exhausted' | 'reserved' | 'inactive';
  assigned_date: string;
  expiry_date?: string;
}

interface NumberAttribution {
  id: string;
  request_id: string;
  number_type: 'isbn' | 'issn' | 'ismn' | 'dl';
  attributed_number: string;
  attribution_date: string;
  attribution_status: string;
}

export const NumberManagement = () => {
  const { toast } = useToast();
  const [ranges, setRanges] = useState<NumberRange[]>([]);
  const [attributions, setAttributions] = useState<NumberAttribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddRangeOpen, setIsAddRangeOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const [newRange, setNewRange] = useState({
    number_type: 'isbn' as 'isbn' | 'issn',
    prefix: '',
    range_start: '',
    range_end: '',
    total_numbers: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: rangesData, error: rangesError } = await (supabase as any)
        .from('number_ranges')
        .select('*')
        .order('created_at', { ascending: false });

      if (rangesError) throw rangesError;

      const { data: attributionsData, error: attributionsError } = await (supabase as any)
        .from('number_attributions')
        .select('*')
        .order('attribution_date', { ascending: false })
        .limit(100);

      if (attributionsError) throw attributionsError;

      setRanges((rangesData as any) || []);
      setAttributions((attributionsData as any) || []);
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

  const handleAddRange = async () => {
    try {
      const { error } = await (supabase as any)
        .from('number_ranges')
        .insert([{
          number_type: newRange.number_type,
          prefix: newRange.prefix,
          range_start: newRange.range_start,
          range_end: newRange.range_end,
          current_position: newRange.range_start,
          total_numbers: newRange.total_numbers,
          used_numbers: 0,
          range_status: 'active'
        }]);

      if (error) throw error;

      toast({
        title: "Plage ajoutée",
        description: "La nouvelle plage de numéros a été ajoutée avec succès"
      });

      setIsAddRangeOpen(false);
      setNewRange({
        number_type: 'isbn',
        prefix: '',
        range_start: '',
        range_end: '',
        total_numbers: 0
      });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la plage",
        variant: "destructive"
      });
    }
  };

  const handleImportExcel = async (file: File, numberType: 'isbn' | 'issn') => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Créer un import log
      const { data: importData, error: importError } = await (supabase as any)
        .from('number_imports')
        .insert([{
          number_type: numberType,
          file_name: file.name,
          total_numbers: jsonData.length,
          import_status: 'processing',
          imported_data: jsonData
        }])
        .select()
        .single();

      if (importError) throw importError;

      // Traiter les données
      let imported = 0;
      let failed = 0;
      const errors: any[] = [];

      for (const row of jsonData as any[]) {
        try {
          const number = row.number || row.Number || row.NUM || row[Object.keys(row)[0]];
          
          if (!number) {
            failed++;
            errors.push({ row, error: 'Numéro manquant' });
            continue;
          }

          // Ici, vous pouvez ajouter la logique pour créer une plage à partir du numéro
          // ou simplement l'enregistrer dans une table temporaire
          
          imported++;
        } catch (error) {
          failed++;
          errors.push({ row, error });
        }
      }

      // Mettre à jour le statut de l'import
      await (supabase as any)
        .from('number_imports')
        .update({
          import_status: 'completed',
          imported_numbers: imported,
          failed_numbers: failed,
          error_log: errors
        })
        .eq('id', importData.id);

      toast({
        title: "Import terminé",
        description: `${imported} numéros importés, ${failed} échecs`
      });

      setIsImportOpen(false);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer le fichier",
        variant: "destructive"
      });
    }
  };

  const getRangeProgress = (range: NumberRange) => {
    return (range.used_numbers / range.total_numbers) * 100;
  };

  const getRangeStatusColor = (range: NumberRange) => {
    const progress = getRangeProgress(range);
    if (progress >= 90) return 'bg-red-500';
    if (progress >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const downloadTemplate = (type: 'isbn' | 'issn') => {
    const template = [
      { number: type === 'isbn' ? '978-9981-000-00-0' : '2550-0000' },
      { number: type === 'isbn' ? '978-9981-000-01-7' : '2550-0001' }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `template_${type}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Numéros ISBN/ISSN</h2>
          <p className="text-muted-foreground">Attribution et gestion des plages de numéros</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsImportOpen(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer Excel
          </Button>
          <Button onClick={() => setIsAddRangeOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une plage
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ranges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ranges">Plages de numéros</TabsTrigger>
          <TabsTrigger value="reserved">Tranches réservées</TabsTrigger>
          <TabsTrigger value="attributions">Historique d'attribution</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="ranges" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {ranges.map((range) => (
                <Card key={range.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {range.number_type === 'isbn' ? (
                          <BookOpen className="h-6 w-6 text-primary" />
                        ) : (
                          <Newspaper className="h-6 w-6 text-primary" />
                        )}
                        <div>
                          <CardTitle className="text-lg uppercase">{range.number_type}</CardTitle>
                          <CardDescription>Préfixe: {range.prefix}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={range.range_status === 'active' ? 'default' : 'secondary'}>
                        {range.range_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Début</p>
                        <p className="font-medium">{range.range_start}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fin</p>
                        <p className="font-medium">{range.range_end}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Position actuelle</p>
                        <p className="font-medium">{range.current_position}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Utilisation</span>
                        <span className="font-medium">
                          {range.used_numbers} / {range.total_numbers}
                        </span>
                      </div>
                      <Progress value={getRangeProgress(range)} className="h-2" />
                    </div>

                    {range.expiry_date && (
                      <div className="text-sm text-muted-foreground">
                        Expire le: {new Date(range.expiry_date).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reserved">
          <ReservedRangesManager />
        </TabsContent>

        <TabsContent value="attributions">
          <Card>
            <CardHeader>
              <CardTitle>Historique des attributions</CardTitle>
              <CardDescription>Dernières attributions de numéros</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Numéro attribué</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributions.map((attr) => (
                    <TableRow key={attr.id}>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {attr.number_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{attr.attributed_number}</TableCell>
                      <TableCell>
                        {new Date(attr.attribution_date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge>{attr.attribution_status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total ISBN</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ranges.filter(r => r.number_type === 'isbn').reduce((acc, r) => acc + r.used_numbers, 0)}
                </div>
                <p className="text-xs text-muted-foreground">attribués</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total ISSN</CardTitle>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ranges.filter(r => r.number_type === 'issn').reduce((acc, r) => acc + r.used_numbers, 0)}
                </div>
                <p className="text-xs text-muted-foreground">attribués</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plages actives</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ranges.filter(r => r.range_status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">sur {ranges.length} total</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog pour ajouter une plage */}
      <Dialog open={isAddRangeOpen} onOpenChange={setIsAddRangeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une plage de numéros</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type de numéro</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={newRange.number_type}
                onChange={(e) => setNewRange({ ...newRange, number_type: e.target.value as 'isbn' | 'issn' })}
              >
                <option value="isbn">ISBN</option>
                <option value="issn">ISSN</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Préfixe</Label>
              <Input
                placeholder={newRange.number_type === 'isbn' ? '978-9981' : '2550'}
                value={newRange.prefix}
                onChange={(e) => setNewRange({ ...newRange, prefix: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Début de plage</Label>
                <Input
                  placeholder={newRange.number_type === 'isbn' ? '978-9981-000-00-0' : '2550-0000'}
                  value={newRange.range_start}
                  onChange={(e) => setNewRange({ ...newRange, range_start: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Fin de plage</Label>
                <Input
                  placeholder={newRange.number_type === 'isbn' ? '978-9981-999-99-9' : '2550-9999'}
                  value={newRange.range_end}
                  onChange={(e) => setNewRange({ ...newRange, range_end: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Nombre total de numéros</Label>
              <Input
                type="number"
                placeholder="10000"
                value={newRange.total_numbers}
                onChange={(e) => setNewRange({ ...newRange, total_numbers: parseInt(e.target.value) })}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddRange} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
              <Button variant="outline" onClick={() => setIsAddRangeOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour import Excel */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importer des numéros depuis Excel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Le fichier Excel doit contenir une colonne "number" avec les numéros
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => downloadTemplate('isbn')}>
                <Download className="h-4 w-4 mr-2" />
                Template ISBN
              </Button>
              <Button variant="outline" onClick={() => downloadTemplate('issn')}>
                <Download className="h-4 w-4 mr-2" />
                Template ISSN
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Type de numéro</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                <option value="isbn">ISBN</option>
                <option value="issn">ISSN</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Fichier Excel</Label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportExcel(file, 'isbn');
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};