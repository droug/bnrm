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

      if (jsonData.length === 0) {
        toast({
          title: "Erreur",
          description: "Le fichier Excel est vide",
          variant: "destructive",
        });
        return;
      }

      // Valider les données
      const errors: string[] = [];
      const values = jsonData.map((row, index) => {
        const rowNum = index + 2; // +2 car Excel commence à 1 et il y a une ligne d'en-tête
        
        if (!row.Code && !row.code) {
          errors.push(`Ligne ${rowNum}: Le champ 'Code' est obligatoire`);
        }
        if (!row.Libellé && !row.Libelle && !row.libelle && !row.label) {
          errors.push(`Ligne ${rowNum}: Le champ 'Libellé' est obligatoire`);
        }

        const level = parseInt(row.Niveau || row.niveau || row.Level || row.level || '1');
        if (level < 1 || level > 2) {
          errors.push(`Ligne ${rowNum}: Le niveau doit être 1 ou 2`);
        }

        // Si niveau 2, vérifier qu'il y a un parent
        if (level === 2 && !row.Parent && !row.parent) {
          errors.push(`Ligne ${rowNum}: Un parent est obligatoire pour le niveau 2`);
        }

        return {
          list_id: selectedList,
          value_code: row.Code || row.code,
          value_label: row.Libellé || row.Libelle || row.libelle || row.label,
          parent_value_code: row.Parent || row.parent || null,
          level: level,
          sort_order: parseInt(row.Ordre || row.ordre || row.Order || row.order || '0'),
        };
      });

      if (errors.length > 0) {
        toast({
          title: "Erreurs de validation",
          description: errors.slice(0, 3).join("\n") + (errors.length > 3 ? `\n...et ${errors.length - 3} autres erreurs` : ""),
          variant: "destructive",
        });
        return;
      }

      // Supprimer les valeurs existantes pour cette liste
      const confirmReplace = confirm(
        `Cette opération va remplacer toutes les valeurs existantes de cette liste par les données du fichier Excel.\n\nNombre de lignes à importer: ${values.length}\n\nVoulez-vous continuer ?`
      );

      if (!confirmReplace) {
        event.target.value = "";
        return;
      }

      // Supprimer les anciennes valeurs
      const { error: deleteError } = await supabase
        .from('autocomplete_list_values')
        .delete()
        .eq('list_id', selectedList);

      if (deleteError) throw deleteError;

      // Insérer les nouvelles valeurs
      const { error: insertError } = await supabase
        .from('autocomplete_list_values')
        .insert(values);

      if (insertError) throw insertError;

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
      { Code: 'sous_cat1_1', Libellé: 'Sous-catégorie 1.1', Parent: 'categorie1', Niveau: 2, Ordre: 1 },
      { Code: 'sous_cat1_2', Libellé: 'Sous-catégorie 1.2', Parent: 'categorie1', Niveau: 2, Ordre: 2 },
      { Code: 'categorie2', Libellé: 'Catégorie 2', Parent: '', Niveau: 1, Ordre: 2 },
      { Code: 'sous_cat2_1', Libellé: 'Sous-catégorie 2.1', Parent: 'categorie2', Niveau: 2, Ordre: 1 },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    
    // Ajouter des instructions en commentaire
    const instructions = [
      "",
      "INSTRUCTIONS D'UTILISATION :",
      "1. Code: Identifiant unique (ex: cat1, sous_cat1)",
      "2. Libellé: Nom affiché (ex: Sciences, Mathématiques)",
      "3. Parent: Laisser vide pour niveau 1, indiquer le Code parent pour niveau 2",
      "4. Niveau: 1 pour catégorie principale, 2 pour sous-catégorie",
      "5. Ordre: Numéro d'ordre d'affichage (1, 2, 3...)",
      "",
      "EXEMPLE DE STRUCTURE :",
      "Code: sciences | Libellé: Sciences | Parent: (vide) | Niveau: 1 | Ordre: 1",
      "Code: maths | Libellé: Mathématiques | Parent: sciences | Niveau: 2 | Ordre: 1",
      "Code: physique | Libellé: Physique | Parent: sciences | Niveau: 2 | Ordre: 2",
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Données");
    
    // Ajouter une feuille d'instructions
    const instructionsWs = XLSX.utils.aoa_to_sheet(instructions.map(i => [i]));
    XLSX.utils.book_append_sheet(workbook, instructionsWs, "Instructions");
    
    XLSX.writeFile(workbook, 'template_liste_hierarchique.xlsx');
    
    toast({
      title: "Template téléchargé",
      description: "Remplissez le fichier Excel selon le modèle et importez-le",
    });
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
                <div className="flex gap-2 flex-wrap">
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
                  <div className="text-sm text-muted-foreground flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                    <FileSpreadsheet className="w-4 h-4" />
                    Format: Code, Libellé, Parent, Niveau (1-2), Ordre
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    💡 Comment importer vos données ?
                  </p>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                    <li>Téléchargez le modèle Excel ci-dessus</li>
                    <li>Remplissez-le avec vos catégories et sous-catégories</li>
                    <li>Utilisez le bouton "Importer Excel" pour injecter les données</li>
                    <li>Les données existantes seront remplacées</li>
                  </ol>
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
