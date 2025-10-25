import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Upload, Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import * as XLSX from "xlsx";

interface Ville {
  id: string;
  nom_arabe: string;
  nom_francais: string;
  abreviation: string;
  created_at: string;
}

export const CoteVillesTab = () => {
  const { toast } = useToast();
  const [villes, setVilles] = useState<Ville[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVille, setEditingVille] = useState<Ville | null>(null);
  const [formData, setFormData] = useState({
    nom_arabe: "",
    nom_francais: "",
    abreviation: ""
  });

  useEffect(() => {
    fetchVilles();
  }, []);

  const fetchVilles = async () => {
    try {
      const { data, error } = await supabase
        .from("cote_villes")
        .select("*")
        .order("nom_francais");
      
      if (error) throw error;
      setVilles(data || []);
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
      if (editingVille) {
        const { error } = await supabase
          .from("cote_villes")
          .update(formData)
          .eq("id", editingVille.id);
        
        if (error) throw error;
        toast({ title: "Ville mise à jour avec succès" });
      } else {
        const { error } = await supabase
          .from("cote_villes")
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Ville ajoutée avec succès" });
      }
      
      setIsAddOpen(false);
      setEditingVille(null);
      setFormData({ nom_arabe: "", nom_francais: "", abreviation: "" });
      fetchVilles();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette ville ?")) return;
    
    try {
      const { error } = await supabase
        .from("cote_villes")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: "Ville supprimée avec succès" });
      fetchVilles();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (ville: Ville) => {
    setEditingVille(ville);
    setFormData({
      nom_arabe: ville.nom_arabe,
      nom_francais: ville.nom_francais,
      abreviation: ville.abreviation
    });
    setIsAddOpen(true);
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
          await supabase.from("cote_villes").upsert({
            nom_arabe: row['Nom Arabe'] || row.nom_arabe,
            nom_francais: row['Nom Français'] || row.nom_francais,
            abreviation: row.Abréviation || row.abreviation
          }, { onConflict: 'abreviation' });
        }

        toast({ title: "Import réussi" });
        fetchVilles();
      } catch (error: any) {
        toast({
          title: "Erreur d'import",
          description: error.message,
          variant: "destructive"
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      villes.map(v => ({
        'Nom Arabe': v.nom_arabe,
        'Nom Français': v.nom_francais,
        'Abréviation': v.abreviation
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Villes");
    XLSX.writeFile(workbook, "villes.xlsx");
  };

  const columns: ColumnDef<Ville>[] = [
    {
      accessorKey: "nom_arabe",
      header: "Nom en Arabe",
    },
    {
      accessorKey: "nom_francais",
      header: "Nom en Français",
    },
    {
      accessorKey: "abreviation",
      header: "Abréviation",
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
        <h3 className="text-lg font-semibold">Abréviations officielles des villes</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
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
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingVille(null);
                setFormData({ nom_arabe: "", nom_francais: "", abreviation: "" });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une ville
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingVille ? "Modifier la ville" : "Ajouter une ville"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nom en Arabe *</Label>
                  <Input
                    value={formData.nom_arabe}
                    onChange={(e) => setFormData({ ...formData, nom_arabe: e.target.value })}
                    placeholder="مراكش"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label>Nom en Français *</Label>
                  <Input
                    value={formData.nom_francais}
                    onChange={(e) => setFormData({ ...formData, nom_francais: e.target.value })}
                    placeholder="Marrakech"
                  />
                </div>
                <div>
                  <Label>Abréviation officielle *</Label>
                  <Input
                    value={formData.abreviation}
                    onChange={(e) => setFormData({ ...formData, abreviation: e.target.value.toUpperCase() })}
                    placeholder="MRK"
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingVille ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={villes}
        searchKey="nom_francais"
        showSearch
      />
    </div>
  );
};
