import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileSpreadsheet, Plus, Trash2, Check, X } from 'lucide-react';
import { useSystemLists, useSystemList } from '@/hooks/useSystemList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

/**
 * Gestionnaire Excel pour import/export des listes système
 */
export function SystemListsExcelManager({ listCode }: { listCode: string }) {
  const { values, loading, reload } = useSystemList(listCode);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export vers Excel
  const handleExport = () => {
    if (values.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      values.map(v => ({
        'Code': v.value_code,
        'Label': v.value_label,
        'Parent Code': v.parent_code || '',
        'Ordre': v.sort_order || 0,
        'Métadonnées (JSON)': v.metadata ? JSON.stringify(v.metadata) : ''
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, listCode);

    XLSX.writeFile(workbook, `${listCode}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Liste exportée avec succès');
  };

  // Import depuis Excel
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Récupérer l'ID de la liste
      const { data: listData, error: listError } = await supabase
        .from('system_lists')
        .select('id')
        .eq('list_code', listCode)
        .single();

      if (listError) throw listError;

      // Préparer les données pour insertion
      const valuesToInsert = jsonData.map((row: any, index) => ({
        list_id: listData.id,
        value_code: row['Code'] || `CODE_${index + 1}`,
        value_label: row['Label'] || `Label ${index + 1}`,
        parent_code: row['Parent Code'] || null,
        sort_order: row['Ordre'] || index,
        metadata: row['Métadonnées (JSON)'] ? JSON.parse(row['Métadonnées (JSON)']) : {},
        is_active: true
      }));

      // Insérer les valeurs (upsert)
      const { error: insertError } = await supabase
        .from('system_list_values')
        .upsert(valuesToInsert, {
          onConflict: 'list_id,value_code',
          ignoreDuplicates: false
        });

      if (insertError) throw insertError;

      toast.success(`${valuesToInsert.length} valeurs importées avec succès`);
      reload();
    } catch (error: any) {
      console.error('Erreur lors de l\'import:', error);
      toast.error('Erreur lors de l\'import: ' + error.message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleImport}
          className="hidden"
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing || loading}
          variant="outline"
        >
          {importing ? (
            <>
              <FileSpreadsheet className="mr-2 h-4 w-4 animate-pulse" />
              Import en cours...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Importer Excel
            </>
          )}
        </Button>

        <Button
          onClick={handleExport}
          disabled={loading || values.length === 0}
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter Excel
        </Button>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Format Excel attendu:</strong>
        </p>
        <ul className="text-xs text-blue-800 dark:text-blue-200 mt-2 space-y-1">
          <li>• <strong>Code</strong>: Code unique de la valeur</li>
          <li>• <strong>Label</strong>: Libellé affiché</li>
          <li>• <strong>Parent Code</strong>: Code parent (pour listes hiérarchiques)</li>
          <li>• <strong>Ordre</strong>: Ordre d'affichage (numérique)</li>
          <li>• <strong>Métadonnées (JSON)</strong>: JSON optionnel</li>
        </ul>
      </div>
    </div>
  );
}
