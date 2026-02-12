import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  CheckCircle,
  Loader2,
  BookOpen,
  Newspaper,
  Hash,
  FileText,
  AlertCircle,
  PackagePlus,
} from "lucide-react";

interface NumberRangeEntry {
  id: string;
  number_type: 'isbn' | 'issn' | 'ismn' | 'dl';
  range_start: string;
  range_end: string;
  quantity: number;
  notes: string;
}

const getNumberTypeIcon = (type: string) => {
  switch (type) {
    case 'isbn': return BookOpen;
    case 'issn': return Newspaper;
    case 'ismn': return Hash;
    case 'dl': return FileText;
    default: return Hash;
  }
};

const getNumberTypeLabel = (type: string) => {
  switch (type) {
    case 'isbn': return 'ISBN';
    case 'issn': return 'ISSN';
    case 'ismn': return 'ISMN';
    case 'dl': return 'N° Dépôt Légal';
    default: return type.toUpperCase();
  }
};

const getPlaceholder = (type: string, field: 'start' | 'end') => {
  const placeholders: Record<string, { start: string; end: string }> = {
    isbn: { start: '978-9981-100-00-0', end: '978-9981-100-99-9' },
    issn: { start: '2550-0001', end: '2550-0100' },
    ismn: { start: '979-0-000000-00-0', end: '979-0-000000-99-9' },
    dl: { start: 'DL-2026-000001', end: 'DL-2026-000100' },
  };
  return placeholders[type]?.[field] || '';
};

let entryCounter = 0;

export const NumberImportTab = () => {
  const { toast } = useToast();

  const [selectedNumberType, setSelectedNumberType] = useState<'isbn' | 'issn' | 'ismn' | 'dl'>('isbn');
  const [entries, setEntries] = useState<NumberRangeEntry[]>([]);
  const [saving, setSaving] = useState(false);

  // Current form state for adding a new entry
  const [quantity, setQuantity] = useState<number | ''>('');
  const [pastedNumbers, setPastedNumbers] = useState('');

  const parsePastedNumbers = (text: string): string[] => {
    return text
      .split(/[\n,;\t]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
  };

  const addEntry = () => {
    if (!quantity) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner le nombre de numéros",
        variant: "destructive",
      });
      return;
    }

    const numbers = parsePastedNumbers(pastedNumbers);
    if (numbers.length === 0) {
      toast({
        title: "Numéros requis",
        description: "Veuillez coller les numéros à importer",
        variant: "destructive",
      });
      return;
    }

    if (numbers.length !== quantity) {
      toast({
        title: "Incohérence de quantité",
        description: `Vous avez sélectionné ${quantity} numéros mais collé ${numbers.length} numéro(s). Veuillez corriger.`,
        variant: "destructive",
      });
      return;
    }

    // Sort numbers to determine range
    const sorted = [...numbers].sort();
    const rangeStart = sorted[0];
    const rangeEnd = sorted[sorted.length - 1];

    const newEntry: NumberRangeEntry = {
      id: `entry-${++entryCounter}`,
      number_type: selectedNumberType,
      range_start: rangeStart,
      range_end: rangeEnd,
      quantity: quantity,
      notes: '',
    };

    setEntries(prev => [...prev, newEntry]);

    // Reset form
    setQuantity('');
    setPastedNumbers('');

    toast({
      title: "Tranche ajoutée",
      description: `${getNumberTypeLabel(selectedNumberType)} : ${numbers.length} numéros (${rangeStart} → ${rangeEnd})`,
    });
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveAll = async () => {
    if (entries.length === 0) {
      toast({
        title: "Aucune tranche",
        description: "Ajoutez au moins une tranche avant d'importer",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      const rangesToInsert = entries.map(entry => ({
        requester_id: userId || '',
        requester_name: 'BNRM (Import)',
        deposit_type: 'import',
        number_type: entry.number_type,
        range_start: entry.range_start,
        range_end: entry.range_end,
        current_position: entry.range_start,
        total_numbers: entry.quantity > 0 ? entry.quantity : estimateQuantity(entry.range_start, entry.range_end),
        used_numbers: 0,
        status: 'active',
        notes: entry.notes || `Import N° - ${getNumberTypeLabel(entry.number_type)}`,
        reserved_by: userId,
      }));

      const { error } = await supabase
        .from('reserved_number_ranges')
        .insert(rangesToInsert);

      if (error) throw error;

      toast({
        title: "Import réussi",
        description: `${entries.length} tranche(s) importée(s) avec succès`,
      });

      setEntries([]);
    } catch (error: any) {
      console.error('Error saving ranges:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer les tranches",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Simple estimation of quantity from range
  const estimateQuantity = (start: string, end: string): number => {
    // Try to extract numeric parts
    const startNum = parseInt(start.replace(/\D/g, '').slice(-4) || '0');
    const endNum = parseInt(end.replace(/\D/g, '').slice(-4) || '0');
    const diff = Math.abs(endNum - startNum) + 1;
    return diff > 0 ? diff : 100;
  };

  const totalNumbers = entries.reduce((sum, e) => sum + (e.quantity > 0 ? e.quantity : estimateQuantity(e.range_start, e.range_end)), 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            Import de tranches de numéros
          </CardTitle>
          <CardDescription>
            Ajoutez des tranches de numéros (ISBN, ISSN, ISMN, DL) pour les rendre disponibles à la réservation par les professionnels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Number type selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs">1</span>
              Type de numéro
            </Label>
            <Select
              value={selectedNumberType}
              onValueChange={(v) => setSelectedNumberType(v as any)}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="isbn">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    ISBN — Livres
                  </div>
                </SelectItem>
                <SelectItem value="issn">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4" />
                    ISSN — Périodiques
                  </div>
                </SelectItem>
                <SelectItem value="ismn">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    ISMN — Musique imprimée
                  </div>
                </SelectItem>
                <SelectItem value="dl">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    N° Dépôt Légal
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Add range form */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs">2</span>
              Ajouter une tranche
            </Label>
            <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de numéros <span className="text-destructive">*</span></Label>
                  <Select
                    value={quantity ? String(quantity) : ''}
                    onValueChange={(val) => setQuantity(parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la quantité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 numéros</SelectItem>
                      <SelectItem value="100">100 numéros</SelectItem>
                      <SelectItem value="1000">1000 numéros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  {quantity && pastedNumbers && (
                    <div className="text-sm">
                      {(() => {
                        const count = parsePastedNumbers(pastedNumbers).length;
                        const isValid = count === quantity;
                        return (
                          <Badge variant={isValid ? "default" : "destructive"} className="text-xs">
                            {count} / {quantity} numéros collés {isValid ? '✓' : '✗'}
                          </Badge>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Numéros à importer (copier-coller) <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder={`Collez vos numéros ici, un par ligne...\nExemple :\n${getPlaceholder(selectedNumberType, 'start')}\n${getPlaceholder(selectedNumberType, 'end')}`}
                  value={pastedNumbers}
                  onChange={(e) => setPastedNumbers(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Collez les numéros séparés par des retours à la ligne, virgules ou points-virgules.
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={addEntry} disabled={!quantity || !pastedNumbers.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter la tranche
                </Button>
              </div>
            </div>
          </div>

          {/* Step 3: Preview & submit */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs">3</span>
              Tranches à importer
              {entries.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {entries.length} tranche(s) — {totalNumbers} numéros
                </Badge>
              )}
            </Label>

            {entries.length === 0 ? (
              <div className="border rounded-lg p-8 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune tranche ajoutée. Utilisez le formulaire ci-dessus pour ajouter des tranches.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Type</TableHead>
                        <TableHead>Début</TableHead>
                        <TableHead>Fin</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry) => {
                        const Icon = getNumberTypeIcon(entry.number_type);
                        const qty = entry.quantity > 0 ? entry.quantity : estimateQuantity(entry.range_start, entry.range_end);
                        return (
                          <TableRow key={entry.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline" className="font-mono text-xs">
                                  {getNumberTypeLabel(entry.number_type)}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{entry.range_start}</TableCell>
                            <TableCell className="font-mono text-sm">{entry.range_end}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{qty}</Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                              {entry.notes || '—'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEntry(entry.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setEntries([])}
                    disabled={saving}
                  >
                    Tout effacer
                  </Button>
                  <Button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="min-w-[200px]"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Importer {entries.length} tranche(s)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NumberImportTab;
