import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Upload, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';
import { AutocompleteList, AutocompleteListValue } from "@/hooks/useAutocompleteList";

interface ExtendedValue extends Omit<AutocompleteListValue, 'id'> {
  id: string;
  list_id: string;
  is_active: boolean;
}

export const AutocompleteListsManager = () => {
  const { toast } = useToast();
  const [lists, setLists] = useState<AutocompleteList[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [listValues, setListValues] = useState<ExtendedValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [newListData, setNewListData] = useState({
    list_name: "",
    list_code: "",
    module: "",
    form_name: "",
    max_levels: 2,
    description: ""
  });

  useEffect(() => {
    fetchLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      fetchListValues(selectedList);
    }
  }, [selectedList]);

  const fetchLists = async () => {
    try {
      const { data, error } = await supabase
        .from('autocomplete_lists')
        .select('*')
        .order('list_name');

      if (error) throw error;
      setLists(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les listes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchListValues = async (listId: string) => {
    try {
      const { data, error } = await supabase
        .from('autocomplete_list_values')
        .select('*')
        .eq('list_id', listId)
        .order('level')
        .order('sort_order');

      if (error) throw error;
      setListValues(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les valeurs",
        variant: "destructive",
      });
    }
  };

  const handleCreateList = async () => {
    if (!newListData.list_name || !newListData.list_code) {
      toast({
        title: "Erreur",
        description: "Le nom et le code sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('autocomplete_lists')
        .insert({
          list_name: newListData.list_name,
          list_code: newListData.list_code,
          module: newListData.module,
          form_name: newListData.form_name,
          max_levels: newListData.max_levels,
          description: newListData.description,
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Liste créée avec succès",
      });

      setIsCreateDialogOpen(false);
      setNewListData({
        list_name: "",
        list_code: "",
        module: "",
        form_name: "",
        max_levels: 2,
        description: ""
      });
      fetchLists();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteValue = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette valeur ?")) return;

    try {
      const { error } = await supabase
        .from('autocomplete_list_values')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Valeur supprimée avec succès",
      });

      if (selectedList) fetchListValues(selectedList);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedList) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une liste",
        variant: "destructive",
      });
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const values = jsonData.map((row) => ({
        list_id: selectedList,
        value_code: row.Code || row.code,
        value_label: row.Libellé || row.Libelle || row.libelle || row.label,
        parent_value_code: row.Parent || row.parent || null,
        level: row.Niveau || row.niveau || row.Level || row.level || 1,
        sort_order: row.Ordre || row.ordre || row.Order || row.order || 0,
      }));

      const { error } = await supabase
        .from('autocomplete_list_values')
        .insert(values);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `${values.length} valeurs importées avec succès`,
      });

      fetchListValues(selectedList);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }

    event.target.value = "";
  };

  const handleExportExcel = () => {
    if (!listValues.length) {
      toast({
        title: "Erreur",
        description: "Aucune valeur à exporter",
        variant: "destructive",
      });
      return;
    }

    const data = listValues.map(v => ({
      Code: v.value_code,
      Libellé: v.value_label,
      Parent: v.parent_value_code || '',
      Niveau: v.level,
      Ordre: v.sort_order,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Valeurs");
    
    const selectedListData = lists.find(l => l.id === selectedList);
    const fileName = `${selectedListData?.list_code || 'liste'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  };

  const handleDownloadTemplate = () => {
    const template = [
      { Code: 'categorie1', Libellé: 'Catégorie 1', Parent: '', Niveau: 1, Ordre: 1 },
      { Code: 'sous_cat1', Libellé: 'Sous-catégorie 1', Parent: 'categorie1', Niveau: 2, Ordre: 1 },
      { Code: 'sous_cat2', Libellé: 'Sous-catégorie 2', Parent: 'categorie1', Niveau: 2, Ordre: 2 },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, 'template_liste_hierarchique.xlsx');
  };

  const filteredLists = moduleFilter
    ? lists.filter(l => l.module === moduleFilter)
    : lists;

  const modules = Array.from(new Set(lists.map(l => l.module).filter(Boolean)));

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>🔗 Listes Auto-Complètes Hiérarchiques</CardTitle>
              <CardDescription>
                Gérez les listes à 1-2 niveaux pour les champs auto-complétion
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Télécharger modèle Excel
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une liste
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background">
                  <DialogHeader>
                    <DialogTitle>Créer une liste auto-complète</DialogTitle>
                    <DialogDescription>
                      Créez une nouvelle liste hiérarchique pour les champs d'auto-complétion
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nom de la liste *</Label>
                      <Input
                        value={newListData.list_name}
                        onChange={(e) => setNewListData({ ...newListData, list_name: e.target.value })}
                        placeholder="Ex: Disciplines académiques"
                      />
                    </div>
                    <div>
                      <Label>Code interne *</Label>
                      <Input
                        value={newListData.list_code}
                        onChange={(e) => setNewListData({ ...newListData, list_code: e.target.value })}
                        placeholder="Ex: book_disciplines"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Module</Label>
                        <Input
                          value={newListData.module}
                          onChange={(e) => setNewListData({ ...newListData, module: e.target.value })}
                          placeholder="Ex: Dépôt Légal"
                        />
                      </div>
                      <div>
                        <Label>Formulaire</Label>
                        <Input
                          value={newListData.form_name}
                          onChange={(e) => setNewListData({ ...newListData, form_name: e.target.value })}
                          placeholder="Ex: Publications périodiques"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Nombre de niveaux</Label>
                      <Select
                        value={newListData.max_levels.toString()}
                        onValueChange={(v) => setNewListData({ ...newListData, max_levels: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          <SelectItem value="1">1 niveau (liste simple)</SelectItem>
                          <SelectItem value="2">2 niveaux (catégorie + sous-catégorie)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={newListData.description}
                        onChange={(e) => setNewListData({ ...newListData, description: e.target.value })}
                        placeholder="Description de la liste"
                      />
                    </div>
                    <Button onClick={handleCreateList} className="w-full">
                      Créer la liste
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modules.length > 0 && (
              <div>
                <Label>Filtrer par module</Label>
                <Select value={moduleFilter || "all"} onValueChange={(v) => setModuleFilter(v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les modules" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="all">Tous les modules</SelectItem>
                    {modules.map((module) => (
                      <SelectItem key={module} value={module!}>
                        {module}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Sélectionner une liste</Label>
              <Select value={selectedList || "none"} onValueChange={(v) => setSelectedList(v === "none" ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une liste" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="none">Choisir une liste</SelectItem>
                  {filteredLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.list_name} ({list.list_code}) - {list.max_levels} niveau(x)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedList && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => document.getElementById('excel-import')?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Importer Excel
                  </Button>
                  <input
                    id="excel-import"
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handleImportExcel}
                  />
                  <Button variant="outline" onClick={handleExportExcel}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter Excel
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Libellé</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Ordre</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listValues.map((value) => (
                        <TableRow key={value.id}>
                          <TableCell className="font-mono">{value.value_code}</TableCell>
                          <TableCell>{value.value_label}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${value.level === 1 ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                              Niveau {value.level}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {value.parent_value_code || '-'}
                          </TableCell>
                          <TableCell>{value.sort_order}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteValue(value.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {listValues.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            Aucune valeur. Utilisez l'import Excel pour ajouter des données.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
