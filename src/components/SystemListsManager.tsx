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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, Plus, Upload, Download, Edit2, Zap, List, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { SystemListsSyncButton } from "@/components/admin/SystemListsSyncButton";

interface SystemList {
  id: string;
  list_code: string;
  list_name: string;
  description: string | null;
  is_active: boolean;
  module: string | null;
  form_name: string | null;
  field_type: string | null;
}

interface SystemListValue {
  id: string;
  list_id: string;
  value_code: string;
  value_label: string;
  sort_order: number;
  is_active: boolean;
}

export const SystemListsManager = () => {
  const { toast } = useToast();
  const [lists, setLists] = useState<SystemList[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [listValues, setListValues] = useState<SystemListValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [newValue, setNewValue] = useState({ code: "", label: "", order: 0 });
  const [editingValue, setEditingValue] = useState<SystemListValue | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateListDialogOpen, setIsCreateListDialogOpen] = useState(false);
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [filteredLists, setFilteredLists] = useState<SystemList[]>([]);
  const [openModuleCombo, setOpenModuleCombo] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredValues, setFilteredValues] = useState<SystemListValue[]>([]);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState({ code: "", label: "", order: 0 });
  const [newListData, setNewListData] = useState({
    list_name: "",
    list_code: "",
    module: "",
    form_name: "",
    field_type: "simple",
    description: ""
  });

  // Créer une liste unique de modules/formulaires
  const moduleFormOptions = Array.from(
    new Set(
      lists
        .filter(list => list.module && list.form_name)
        .map(list => `${list.module} / ${list.form_name}`)
    )
  ).sort();
  const [filterOpen, setFilterOpen] = useState(false);
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [uniqueModuleForms, setUniqueModuleForms] = useState<Array<{ value: string; label: string; module: string; form: string }>>([]);

  useEffect(() => {
    fetchLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      fetchListValues(selectedList);
    }
  }, [selectedList]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredValues(listValues);
    } else {
      const filtered = listValues.filter(
        (v) =>
          v.value_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.value_label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredValues(filtered);
    }
  }, [searchTerm, listValues]);

  useEffect(() => {
    // Définir les modules disponibles (même sans listes existantes)
    const predefinedModules = [
      { module: "Activités Culturelles", form: "Réservation d'espaces" },
      { module: "Activités Culturelles", form: "Visites guidées" },
      { module: "Activités Culturelles", form: "Partenariats" },
      { module: "Activités Culturelles", form: "Programmation culturelle" },
      { module: "CBM", form: "Gestion adhésions" },
      { module: "CBM", form: "Plan d'actions" },
      { module: "Dépôt Légal", form: "Demande dépôt" },
      { module: "Bibliothèque Numérique", form: "Réservation documents" },
      { module: "Bibliothèque Numérique", form: "Demande numérisation" },
      { module: "Manuscrits", form: "Demande d'accès" },
      { module: "Reproduction", form: "Demande reproduction" },
      { module: "BNRM", form: "Services généraux" }
    ];

    // Extraire les combinaisons uniques de module + formulaire depuis les listes existantes
    const uniqueCombinations = new Map<string, { module: string; form: string }>();
    
    // Ajouter d'abord les modules prédéfinis
    predefinedModules.forEach(({ module, form }) => {
      const key = `${module}|${form}`;
      uniqueCombinations.set(key, { module, form });
    });
    
    // Ajouter ensuite les combinaisons depuis les listes existantes
    lists.forEach(list => {
      if (list.module && list.form_name) {
        const key = `${list.module}|${list.form_name}`;
        if (!uniqueCombinations.has(key)) {
          uniqueCombinations.set(key, { module: list.module, form: list.form_name });
        }
      }
    });
    
    const options = Array.from(uniqueCombinations.entries()).map(([key, value]) => ({
      value: key,
      label: `${value.module} - ${value.form}`,
      module: value.module,
      form: value.form
    })).sort((a, b) => a.label.localeCompare(b.label));
    
    setUniqueModuleForms(options);
  }, [lists]);

  useEffect(() => {
    if (moduleFilter) {
      const [selectedModule, selectedForm] = moduleFilter.split('|');
      const filtered = lists.filter(list => 
        list.module === selectedModule && list.form_name === selectedForm
      );
      setFilteredLists(filtered);
    } else {
      setFilteredLists(lists);
    }
  }, [moduleFilter, lists]);

  const fetchLists = async () => {
    try {
      const { data, error } = await supabase
        .from('system_lists')
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
        .from('system_list_values')
        .select('*')
        .eq('list_id', listId)
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

  const handleAddValue = async () => {
    if (!selectedList || !newValue.code || !newValue.label) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('system_list_values')
        .insert({
          list_id: selectedList,
          value_code: newValue.code,
          value_label: newValue.label,
          sort_order: newValue.order,
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Valeur ajoutée avec succès",
      });

      setNewValue({ code: "", label: "", order: 0 });
      setIsAddDialogOpen(false);
      fetchListValues(selectedList);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateValue = async () => {
    if (!editingValue) return;

    try {
      const { error } = await supabase
        .from('system_list_values')
        .update({
          value_code: editingValue.value_code,
          value_label: editingValue.value_label,
          sort_order: editingValue.sort_order,
        })
        .eq('id', editingValue.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Valeur modifiée avec succès",
      });

      setIsEditDialogOpen(false);
      setEditingValue(null);
      if (selectedList) fetchListValues(selectedList);
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
        .from('system_list_values')
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

  const handleCreateList = async () => {
    if (!newListData.list_name || !newListData.list_code) {
      toast({
        title: "Erreur",
        description: "Le nom et le code interne sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('system_lists')
        .insert({
          list_name: newListData.list_name,
          list_code: newListData.list_code,
          module: newListData.module,
          form_name: newListData.form_name,
          field_type: newListData.field_type,
          description: newListData.description,
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Liste créée avec succès",
      });

      setIsCreateListDialogOpen(false);
      setNewListData({
        list_name: "",
        list_code: "",
        module: "",
        form_name: "",
        field_type: "simple",
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

  const startInlineEdit = (value: SystemListValue) => {
    setInlineEditId(value.id);
    setInlineEditValue({
      code: value.value_code,
      label: value.value_label,
      order: value.sort_order
    });
  };

  const saveInlineEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('system_list_values')
        .update({
          value_code: inlineEditValue.code,
          value_label: inlineEditValue.label,
          sort_order: inlineEditValue.order,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Valeur modifiée avec succès",
      });

      setInlineEditId(null);
      if (selectedList) fetchListValues(selectedList);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const cancelInlineEdit = () => {
    setInlineEditId(null);
    setInlineEditValue({ code: "", label: "", order: 0 });
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

      const values = jsonData.map((row, index) => ({
        list_id: selectedList,
        value_code: row.Code || row.code,
        value_label: row.Libellé || row.Libelle || row.libelle || row.label,
        sort_order: index + 1,
      }));

      const { error } = await supabase
        .from('system_list_values')
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
      Ordre: v.sort_order,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Valeurs");
    
    const selectedListData = lists.find(l => l.id === selectedList);
    const fileName = `${selectedListData?.list_code || 'liste'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>🗂️ Gestion des listes système</CardTitle>
            <CardDescription>
              Gérez toutes les listes déroulantes du système
            </CardDescription>
          </div>
          <Dialog open={isCreateListDialogOpen} onOpenChange={setIsCreateListDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer une nouvelle liste
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle liste système</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle liste déroulante paramétrable
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nom de la liste *</Label>
                    <Input
                      value={newListData.list_name}
                      onChange={(e) => setNewListData({ ...newListData, list_name: e.target.value })}
                      placeholder="Ex: Type de publication"
                    />
                  </div>
                  <div>
                    <Label>Code interne (API) *</Label>
                    <Input
                      value={newListData.list_code}
                      onChange={(e) => setNewListData({ ...newListData, list_code: e.target.value })}
                      placeholder="Ex: type_publication"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Code unique pour la liaison API
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Module à rattacher</Label>
                  <Popover open={createModuleOpen} onOpenChange={setCreateModuleOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={createModuleOpen}
                        className="w-full justify-between mt-2 bg-background"
                      >
                        {newListData.module && newListData.form_name
                          ? `${newListData.module} - ${newListData.form_name}`
                          : "Sélectionner un module et formulaire..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0 bg-background" align="start">
                      <Command>
                        <CommandInput placeholder="Rechercher un module ou formulaire..." />
                        <CommandList>
                          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                          <CommandGroup>
                            {uniqueModuleForms.map((item) => (
                              <CommandItem
                                key={item.value}
                                value={item.label}
                                onSelect={() => {
                                  setNewListData({
                                    ...newListData,
                                    module: item.module,
                                    form_name: item.form
                                  });
                                  setCreateModuleOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    newListData.module === item.module && 
                                    newListData.form_name === item.form
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {item.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recherchez et sélectionnez le module et le formulaire associés
                  </p>
                </div>

                <div>
                  <Label>Type de liste</Label>
                  <Select
                    value={newListData.field_type}
                    onValueChange={(value) => setNewListData({ ...newListData, field_type: value })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="simple">Liste simple</SelectItem>
                      <SelectItem value="auto_select">Auto-complétion (Combobox)</SelectItem>
                      <SelectItem value="hierarchical">Liste hiérarchique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={newListData.description || ""}
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
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bouton de synchronisation */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
          <div className="mb-3">
            <h4 className="text-sm font-semibold mb-1">🔄 Synchronisation des Listes Système</h4>
            <p className="text-xs text-muted-foreground">
              Synchroniser toutes les listes déroulantes des formulaires du système avec la base de données
            </p>
          </div>
          <SystemListsSyncButton />
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>Filtrer les listes par module / formulaire</Label>
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={filterOpen}
                  className="w-full justify-between mt-2"
                >
                  {moduleFilter
                    ? uniqueModuleForms.find((item) => item.value === moduleFilter)?.label
                    : "Sélectionner un module / formulaire..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Rechercher un module ou formulaire..." />
                  <CommandList>
                    <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          setModuleFilter("");
                          setFilterOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            moduleFilter === "" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Toutes les listes
                      </CommandItem>
                      {uniqueModuleForms.map((item) => (
                        <CommandItem
                          key={item.value}
                          value={item.label}
                          onSelect={() => {
                            setModuleFilter(item.value === moduleFilter ? "" : item.value);
                            setFilterOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              moduleFilter === item.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{item.module}</span>
                            <span className="text-xs text-muted-foreground">{item.form}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {moduleFilter && (
              <p className="text-sm text-muted-foreground mt-2">
                {filteredLists.length} liste(s) trouvée(s)
              </p>
            )}
          </div>
          
          <div>
            <Label>Sélectionner une liste</Label>
            <Select value={selectedList || ""} onValueChange={setSelectedList}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une liste" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {filteredLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    <div className="flex items-center gap-2">
                      {list.field_type === 'auto_select' ? (
                        <Zap className="w-4 h-4 text-amber-500" />
                      ) : (
                        <List className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="font-medium">{list.list_name}</span>
                      <span className="text-muted-foreground text-xs">({list.list_code})</span>
                      {list.module && list.form_name && (
                        <span className="text-xs text-muted-foreground">
                          - {list.module} / {list.form_name}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedList && (
              <div className="mt-2 p-3 bg-muted/50 rounded-md">
                {(() => {
                  const list = lists.find(l => l.id === selectedList);
                  return list ? (
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        {list.field_type === 'auto_select' ? (
                          <>
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="font-medium text-amber-700">Champ Auto select (autocomplétion)</span>
                          </>
                        ) : (
                          <>
                            <List className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-blue-700">Liste déroulante simple</span>
                          </>
                        )}
                      </div>
                      {list.module && <p className="text-muted-foreground">Module: {list.module}</p>}
                      {list.form_name && <p className="text-muted-foreground">Formulaire: {list.form_name}</p>}
                      {list.description && <p className="text-muted-foreground mt-2">{list.description}</p>}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>

        {selectedList && (
          <>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une valeur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background">
                    <DialogHeader>
                      <DialogTitle>Ajouter une nouvelle valeur</DialogTitle>
                      <DialogDescription>
                        Ajoutez une nouvelle valeur à la liste sélectionnée
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Code</Label>
                        <Input
                          value={newValue.code}
                          onChange={(e) => setNewValue({ ...newValue, code: e.target.value })}
                          placeholder="Ex: COR"
                        />
                      </div>
                      <div>
                        <Label>Libellé</Label>
                        <Input
                          value={newValue.label}
                          onChange={(e) => setNewValue({ ...newValue, label: e.target.value })}
                          placeholder="Ex: Coran"
                        />
                      </div>
                      <div>
                        <Label>Ordre d'affichage</Label>
                        <Input
                          type="number"
                          value={newValue.order}
                          onChange={(e) => setNewValue({ ...newValue, order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <Button onClick={handleAddValue} className="w-full">
                        Ajouter
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

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

              <div>
                <Label>Rechercher dans les valeurs</Label>
                <Input
                  placeholder="Rechercher par code ou libellé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2"
                />
                {searchTerm && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {filteredValues.length} résultat(s) trouvé(s)
                  </p>
                )}
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Ordre</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredValues.map((value) => (
                    <TableRow key={value.id}>
                      <TableCell>
                        {inlineEditId === value.id ? (
                          <Input
                            value={inlineEditValue.code}
                            onChange={(e) => setInlineEditValue({ ...inlineEditValue, code: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          value.value_code
                        )}
                      </TableCell>
                      <TableCell>
                        {inlineEditId === value.id ? (
                          <Input
                            value={inlineEditValue.label}
                            onChange={(e) => setInlineEditValue({ ...inlineEditValue, label: e.target.value })}
                            className="h-8"
                          />
                        ) : (
                          value.value_label
                        )}
                      </TableCell>
                      <TableCell>
                        {inlineEditId === value.id ? (
                          <Input
                            type="number"
                            value={inlineEditValue.order}
                            onChange={(e) => setInlineEditValue({ ...inlineEditValue, order: parseInt(e.target.value) || 0 })}
                            className="h-8 w-20"
                          />
                        ) : (
                          value.sort_order
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {inlineEditId === value.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => saveInlineEdit(value.id)}
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelInlineEdit}
                              >
                                ✕
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startInlineEdit(value)}
                                title="Éditer inline"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteValue(value.id)}
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la valeur</DialogTitle>
            </DialogHeader>
            {editingValue && (
              <div className="space-y-4">
                <div>
                  <Label>Code</Label>
                  <Input
                    value={editingValue.value_code}
                    onChange={(e) => setEditingValue({ ...editingValue, value_code: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Libellé</Label>
                  <Input
                    value={editingValue.value_label}
                    onChange={(e) => setEditingValue({ ...editingValue, value_label: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Ordre d'affichage</Label>
                  <Input
                    type="number"
                    value={editingValue.sort_order}
                    onChange={(e) => setEditingValue({ ...editingValue, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <Button onClick={handleUpdateValue} className="w-full">
                  Enregistrer
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
