import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Download, TestTube, Upload } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import * as XLSX from "xlsx";

interface Nomenclature {
  id: string;
  prefixe: string;
  modele_codification: string;
  description?: string;
  module_concerne: string;
  is_active: boolean;
  created_at: string;
}

const MODULES = ['Manuscrits', 'Activités culturelles', 'Prix Hassan II', 'Autres'];

export const CoteNomenclaturesTab = () => {
  const { toast } = useToast();
  const [nomenclatures, setNomenclatures] = useState<Nomenclature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [editingNomenclature, setEditingNomenclature] = useState<Nomenclature | null>(null);
  const [formData, setFormData] = useState({
    prefixe: "",
    modele_codification: "",
    description: "",
    module_concerne: "Manuscrits",
    is_active: true
  });
  const [testData, setTestData] = useState({
    edition: "25",
    ville: "MRK",
    numero: "42"
  });
  const [testResult, setTestResult] = useState("");

  useEffect(() => {
    fetchNomenclatures();
  }, []);

  const fetchNomenclatures = async () => {
    try {
      const { data, error } = await supabase
        .from("cote_nomenclatures")
        .select("*")
        .order("prefixe");
      
      if (error) throw error;
      setNomenclatures(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingNomenclature) {
        const { error } = await supabase
          .from("cote_nomenclatures")
          .update(formData)
          .eq("id", editingNomenclature.id);
        
        if (error) throw error;
        toast({ title: "Nomenclature mise à jour avec succès" });
      } else {
        const { error } = await supabase
          .from("cote_nomenclatures")
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Nomenclature ajoutée avec succès" });
      }
      
      setIsAddOpen(false);
      setEditingNomenclature(null);
      setFormData({ prefixe: "", modele_codification: "", description: "", module_concerne: "Manuscrits", is_active: true });
      fetchNomenclatures();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette nomenclature ?")) return;
    
    try {
      const { error } = await supabase
        .from("cote_nomenclatures")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: "Nomenclature supprimée avec succès" });
      fetchNomenclatures();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (nomenclature: Nomenclature) => {
    setEditingNomenclature(nomenclature);
    setFormData({
      prefixe: nomenclature.prefixe,
      modele_codification: nomenclature.modele_codification,
      description: nomenclature.description || "",
      module_concerne: nomenclature.module_concerne,
      is_active: nomenclature.is_active
    });
    setIsAddOpen(true);
  };

  const testCodification = (model: string, data: typeof testData) => {
    let result = model;
    
    // Remplacer ED## par ED + numéro d'édition
    if (result.includes('ED##')) {
      result = result.replace('ED##', `ED${data.edition}`);
    }
    
    // Remplacer VILLE## par le code ville
    if (result.includes('VILLE##')) {
      result = result.replace('VILLE##', data.ville);
    }
    
    // Remplacer COLL## par le code collection
    if (result.includes('COLL##')) {
      result = result.replace('COLL##', data.ville); // Réutilise le champ ville pour collection
    }
    
    // Remplacer AAAA par l'année (utilise edition comme année)
    if (result.includes('AAAA')) {
      result = result.replace(/AAAA/g, data.edition.padStart(4, '20'));
    }
    
    // Remplacer MM par le mois (utilise les 2 premiers chiffres de numero)
    if (result.includes('MM')) {
      result = result.replace('MM', data.numero.padStart(2, '0').substring(0, 2));
    }
    
    // Remplacer #### par numéro à 4 chiffres
    if (result.includes('####')) {
      result = result.replace('####', data.numero.padStart(4, '0'));
    }
    
    // Remplacer ### par numéro à 3 chiffres
    if (result.includes('###')) {
      result = result.replace('###', data.numero.padStart(3, '0'));
    }
    
    // Remplacer ## par numéro à 2 chiffres
    if (result.includes('##')) {
      result = result.replace(/##/g, data.numero.padStart(2, '0'));
    }
    
    return result;
  };

  const handleTest = () => {
    const result = testCodification(formData.modele_codification, testData);
    setTestResult(result);
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      nomenclatures.map(n => ({
        Préfixe: n.prefixe,
        'Modèle': n.modele_codification,
        Description: n.description || '',
        Module: n.module_concerne,
        Actif: n.is_active ? 'Oui' : 'Non'
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nomenclatures");
    XLSX.writeFile(workbook, "nomenclatures.xlsx");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        for (const row of jsonData as any[]) {
          await supabase.from("cote_nomenclatures").insert({
            prefixe: row.Préfixe || row.prefixe,
            modele_codification: row['Modèle'] || row.modele_codification,
            description: row.Description || row.description,
            module_concerne: row.Module || row.module_concerne || 'Autres',
            is_active: row.Actif === 'Oui' || row.is_active === true
          });
        }

        toast({ title: "Import réussi" });
        fetchNomenclatures();
      } catch (error: any) {
        toast({
          title: "Erreur d'import",
          description: error.message,
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset input to allow re-importing the same file
    event.target.value = '';
  };

  const columns: ColumnDef<Nomenclature>[] = [
    {
      accessorKey: "prefixe",
      header: "Préfixe",
    },
    {
      accessorKey: "modele_codification",
      header: "Modèle de codification",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "module_concerne",
      header: "Module",
    },
    {
      accessorKey: "is_active",
      header: "Actif",
      cell: ({ row }) => (
        <span className={row.original.is_active ? "text-green-600" : "text-gray-400"}>
          {row.original.is_active ? "✓" : "✗"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion unifiée des Nomenclatures de Fichiers</h3>
        <div className="flex gap-2">
          <label>
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Importer
              </span>
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingNomenclature(null);
                setFormData({ prefixe: "", modele_codification: "", description: "", module_concerne: "Manuscrits", is_active: true });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un modèle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingNomenclature ? "Modifier la nomenclature" : "Ajouter une nomenclature"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Préfixe *</Label>
                  <Input
                    value={formData.prefixe}
                    onChange={(e) => setFormData({ ...formData, prefixe: e.target.value })}
                    placeholder="PH2, MAN, DOC..."
                  />
                </div>
                <div>
                  <Label>Modèle de codification *</Label>
                  <Input
                    value={formData.modele_codification}
                    onChange={(e) => setFormData({ ...formData, modele_codification: e.target.value })}
                    placeholder="PH2_ED##_VILLE##_###"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Utilisez ED## pour édition, VILLE## pour ville, ### pour numéro
                  </p>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Format Prix Hassan II (édition, ville, numéro de dossier)"
                  />
                </div>
                <div>
                  <Label>Module concerné *</Label>
                  <Select
                    value={formData.module_concerne}
                    onValueChange={(value) => setFormData({ ...formData, module_concerne: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODULES.map(module => (
                        <SelectItem key={module} value={module}>{module}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Actif</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} className="flex-1">
                    {editingNomenclature ? "Mettre à jour" : "Ajouter"}
                  </Button>
                  <Dialog open={isTestOpen} onOpenChange={setIsTestOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" type="button">
                        <TestTube className="h-4 w-4 mr-2" />
                        Tester
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tester le modèle</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Édition / Année</Label>
                          <Input
                            value={testData.edition}
                            onChange={(e) => setTestData({ ...testData, edition: e.target.value })}
                            placeholder="42 ou 2024"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Pour ED## ou AAAA
                          </p>
                        </div>
                        <div>
                          <Label>Ville / Collection</Label>
                          <Input
                            value={testData.ville}
                            onChange={(e) => setTestData({ ...testData, ville: e.target.value })}
                            placeholder="MRK ou D"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Pour VILLE## ou COLL##
                          </p>
                        </div>
                        <div>
                          <Label>Numéro séquentiel</Label>
                          <Input
                            value={testData.numero}
                            onChange={(e) => setTestData({ ...testData, numero: e.target.value })}
                            placeholder="122"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Pour ###, ####, ou ##
                          </p>
                        </div>
                        <Button onClick={handleTest} className="w-full">
                          Générer l&apos;exemple
                        </Button>
                        {testResult && (
                          <div className="p-3 bg-muted rounded-md">
                            <Label>Résultat :</Label>
                            <p className="font-mono text-lg mt-1 font-bold text-primary">{testResult}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={nomenclatures}
        searchKey="prefixe"
        showSearch
      />
    </div>
  );
};
