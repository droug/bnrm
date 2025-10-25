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
import { Plus, Pencil, Trash2, Upload, Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { ArabicInputWithKeyboard } from "@/components/ui/arabic-keyboard";

interface Collection {
  id: string;
  code: string;
  nom_arabe: string;
  nom_francais: string;
  type_collection: string;
  commentaire?: string;
  created_at: string;
}

const COLLECTION_TYPES = ['Manuscrit', 'Document', 'Photo', 'Autre'];

export const CoteCollectionsTab = () => {
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    nom_arabe: "",
    nom_francais: "",
    type_collection: "Manuscrit",
    commentaire: ""
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from("cote_collections")
        .select("*")
        .order("code");
      
      if (error) throw error;
      setCollections(data || []);
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
      if (editingCollection) {
        const { error } = await supabase
          .from("cote_collections")
          .update(formData)
          .eq("id", editingCollection.id);
        
        if (error) throw error;
        toast({ title: "Collection mise à jour avec succès" });
      } else {
        const { error } = await supabase
          .from("cote_collections")
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Collection ajoutée avec succès" });
      }
      
      setIsAddOpen(false);
      setEditingCollection(null);
      setFormData({ code: "", nom_arabe: "", nom_francais: "", type_collection: "Manuscrit", commentaire: "" });
      fetchCollections();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette collection ?")) return;
    
    try {
      const { error } = await supabase
        .from("cote_collections")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: "Collection supprimée avec succès" });
      fetchCollections();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      code: collection.code,
      nom_arabe: collection.nom_arabe,
      nom_francais: collection.nom_francais,
      type_collection: collection.type_collection,
      commentaire: collection.commentaire || ""
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
          await supabase.from("cote_collections").upsert({
            code: row.Code || row.code,
            nom_arabe: row['Nom Arabe'] || row.nom_arabe,
            nom_francais: row['Nom Français'] || row.nom_francais,
            type_collection: row['Type'] || row.type_collection || 'Manuscrit',
            commentaire: row.Commentaire || row.commentaire
          }, { onConflict: 'code' });
        }

        toast({ title: "Import réussi" });
        fetchCollections();
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
      collections.map(c => ({
        Code: c.code,
        'Nom Arabe': c.nom_arabe,
        'Nom Français': c.nom_francais,
        Type: c.type_collection,
        Commentaire: c.commentaire || ''
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Collections");
    XLSX.writeFile(workbook, "collections.xlsx");
  };

  const columns: ColumnDef<Collection>[] = [
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "nom_arabe",
      header: "Nom en Arabe",
    },
    {
      accessorKey: "nom_francais",
      header: "Nom en Français",
    },
    {
      accessorKey: "type_collection",
      header: "Type",
    },
    {
      accessorKey: "commentaire",
      header: "Commentaire",
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
        <h3 className="text-lg font-semibold">Nomenclature des Collections / Manuscrits</h3>
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
                setEditingCollection(null);
                setFormData({ code: "", nom_arabe: "", nom_francais: "", type_collection: "Manuscrit", commentaire: "" });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une collection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCollection ? "Modifier la collection" : "Ajouter une collection"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Code *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="D, BG, J..."
                  />
                </div>
                <div>
                  <Label>Nom en Arabe *</Label>
                  <ArabicInputWithKeyboard
                    value={formData.nom_arabe}
                    onChange={(value) => setFormData({ ...formData, nom_arabe: value })}
                    placeholder="الدخيرة"
                  />
                </div>
                <div>
                  <Label>Nom en Français *</Label>
                  <Input
                    value={formData.nom_francais}
                    onChange={(e) => setFormData({ ...formData, nom_francais: e.target.value })}
                    placeholder="Collection Ad-Dakhira"
                  />
                </div>
                <div>
                  <Label>Type de collection *</Label>
                  <Select
                    value={formData.type_collection}
                    onValueChange={(value) => setFormData({ ...formData, type_collection: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLLECTION_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Commentaire</Label>
                  <Textarea
                    value={formData.commentaire}
                    onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editingCollection ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={collections}
        searchKey="nom_francais"
        showSearch
      />
    </div>
  );
};
