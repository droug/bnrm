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
import { Plus, Pencil, Trash2, Download, TestTube } from "lucide-react";
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
    return model
      .replace("ED##", `ED${data.edition}`)
      .replace("VILLE##", data.ville)
      .replace("###", String(data.numero).padStart(3, "0"));
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
                          <Label>Édition</Label>
                          <Input
                            value={testData.edition}
                            onChange={(e) => setTestData({ ...testData, edition: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Ville</Label>
                          <Input
                            value={testData.ville}
                            onChange={(e) => setTestData({ ...testData, ville: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Numéro</Label>
                          <Input
                            value={testData.numero}
                            onChange={(e) => setTestData({ ...testData, numero: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleTest} className="w-full">
                          Générer
                        </Button>
                        {testResult && (
                          <div className="p-3 bg-muted rounded-md">
                            <Label>Résultat :</Label>
                            <p className="font-mono text-lg mt-1">{testResult}</p>
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
