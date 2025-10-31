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
import { Trash2, Plus, Upload, Download, Edit2, Zap, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { SystemListsSyncButton } from "@/components/admin/SystemListsSyncButton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SystemList {
  id: string;
  list_code: string;
  list_name: string;
  description: string | null;
  is_active: boolean;
  portal: string | null;
  platform: string | null;
  service: string | null;
  sub_service: string | null;
  module: string | null;
  form_name: string | null;
  field_type: string | null;
  parent_list_id: string | null;
  depends_on_parent_value: boolean;
}

interface SystemListValue {
  id: string;
  list_id: string;
  value_code: string;
  value_label: string;
  sort_order: number;
  is_active: boolean;
  parent_value_id: string | null;
}

export const SystemListsManager = () => {
  const { toast } = useToast();
  const [lists, setLists] = useState<SystemList[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [listValues, setListValues] = useState<SystemListValue[]>([]);
  const [loading, setLoading] = useState(true);
  
  // État des sections expandables
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  const [newValue, setNewValue] = useState({ code: "", label: "", order: 0, parent_value_id: null as string | null });
  const [editingValue, setEditingValue] = useState<SystemListValue | null>(null);
  const [parentLists, setParentLists] = useState<SystemList[]>([]);
  const [parentValues, setParentValues] = useState<SystemListValue[]>([]);
  const [selectedParentList, setSelectedParentList] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateListDialogOpen, setIsCreateListDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredValues, setFilteredValues] = useState<SystemListValue[]>([]);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState({ code: "", label: "", order: 0 });
  const [newListData, setNewListData] = useState({
    list_name: "",
    list_code: "",
    portal: "",
    platform: "",
    service: "",
    sub_service: "",
    module: "",
    form_name: "",
    field_type: "simple",
    description: "",
    parent_list_id: null as string | null,
    depends_on_parent_value: false
  });

  useEffect(() => {
    fetchLists();
    fetchParentLists();
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
  
  // Organiser les listes en hiérarchie (exclure les valeurs nulles/vides)
  const groupedLists = lists
    .filter(list => list.portal && list.platform && list.service) // Exclure les listes sans hiérarchie complète
    .reduce((acc, list) => {
      const portalKey = list.portal!;
      const platformKey = list.platform!;
      const serviceKey = list.service!;
      const subServiceKey = list.sub_service || "Général";
      const formKey = list.form_name || "Général";
      
      if (!acc[portalKey]) acc[portalKey] = {};
      if (!acc[portalKey][platformKey]) acc[portalKey][platformKey] = {};
      if (!acc[portalKey][platformKey][serviceKey]) acc[portalKey][platformKey][serviceKey] = {};
      if (!acc[portalKey][platformKey][serviceKey][subServiceKey]) acc[portalKey][platformKey][serviceKey][subServiceKey] = {};
      if (!acc[portalKey][platformKey][serviceKey][subServiceKey][formKey]) acc[portalKey][platformKey][serviceKey][subServiceKey][formKey] = [];
      
      acc[portalKey][platformKey][serviceKey][subServiceKey][formKey].push(list);
      return acc;
    }, {} as Record<string, Record<string, Record<string, Record<string, Record<string, SystemList[]>>>>>);
  
  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSections(newExpanded);
  };

  const handleCleanDuplicateServices = async () => {
    try {
      setLoading(true);
      
      // Uniformiser "digital_library" et "Bibliothèque" vers "Bibliothèque Numérique"
      const { error: updateError } = await supabase
        .from('system_lists')
        .update({ 
          service: 'Bibliothèque Numérique',
          updated_at: new Date().toISOString()
        })
        .in('service', ['digital_library', 'Bibliothèque']);

      if (updateError) throw updateError;

      // Ajouter sub_service pour les listes navigation
      const { error: subServiceError } = await supabase
        .from('system_lists')
        .update({ 
          sub_service: 'Navigation',
          updated_at: new Date().toISOString()
        })
        .in('list_code', ['digital_library_collections', 'digital_library_themes'])
        .is('sub_service', null);

      if (subServiceError) throw subServiceError;

      toast({
        title: "Succès",
        description: "Services uniformisés avec succès",
      });

      await fetchLists();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const fetchParentLists = async () => {
    try {
      const { data, error } = await supabase
        .from('system_lists')
        .select('*')
        .order('list_name');

      if (error) throw error;
      setParentLists(data || []);
    } catch (error: any) {
      console.error("Error fetching parent lists:", error);
    }
  };

  const fetchParentValues = async (listId: string) => {
    try {
      const { data, error } = await supabase
        .from('system_list_values')
        .select('*')
        .eq('list_id', listId)
        .order('sort_order');

      if (error) throw error;
      setParentValues(data || []);
    } catch (error: any) {
      console.error("Error fetching parent values:", error);
    }
  };

  const fetchListValues = async (listId: string) => {
    try {
      const { data, error } = await supabase
        .from('system_list_values')
        .select(`
          *,
          parent:parent_value_id (
            value_label,
            value_code,
            list:list_id (
              list_name
            )
          )
        `)
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
          parent_value_id: newValue.parent_value_id,
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Valeur ajoutée avec succès",
      });

      setNewValue({ code: "", label: "", order: 0, parent_value_id: null });
      setSelectedParentList(null);
      setParentValues([]);
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
          parent_value_id: editingValue.parent_value_id,
        })
        .eq('id', editingValue.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Valeur modifiée avec succès",
      });

      setIsEditDialogOpen(false);
      setEditingValue(null);
      setSelectedParentList(null);
      setParentValues([]);
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
          portal: newListData.portal,
          platform: newListData.platform,
          service: newListData.service,
          sub_service: newListData.sub_service,
          module: newListData.module,
          form_name: newListData.form_name,
          field_type: newListData.field_type,
          description: newListData.description,
          parent_list_id: newListData.parent_list_id,
          depends_on_parent_value: newListData.depends_on_parent_value,
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
        portal: "",
        platform: "",
        service: "",
        sub_service: "",
        module: "",
        form_name: "",
        field_type: "simple",
        description: "",
        parent_list_id: null,
        depends_on_parent_value: false
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

  const handleDownloadTemplate = () => {
    // Créer un modèle Excel avec les colonnes nécessaires
    const templateData = [
      {
        Code: "exemple_1",
        Libellé: "Exemple 1",
        Ordre: 1
      },
      {
        Code: "exemple_2",
        Libellé: "Exemple 2",
        Ordre: 2
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Modèle");
    
    const selectedListData = lists.find(l => l.id === selectedList);
    const fileName = `modele_${selectedListData?.list_code || 'liste'}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Modèle téléchargé",
      description: "Remplissez le fichier Excel et importez-le",
    });
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
    return <div className="p-8">Chargement...</div>;
  }

  const renderListHierarchy = () => {
    const listsCount = lists.filter(list => list.portal && list.platform && list.service).length;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Listes système</h3>
          <Badge variant="secondary">{listsCount} liste{listsCount > 1 ? 's' : ''}</Badge>
        </div>

        {Object.entries(groupedLists).map(([portalName, platforms]) => (
          <Card key={portalName} className="border-2">
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleSection(`portal-${portalName}`)}
            >
              <div className="flex items-center gap-2">
                {expandedSections.has(`portal-${portalName}`) ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <CardTitle className="text-base">{portalName}</CardTitle>
                <Badge variant="outline">
                  {Object.values(platforms).flatMap(services => 
                    Object.values(services).flatMap(subServices =>
                      Object.values(subServices).flatMap(forms =>
                        Object.values(forms).flat()
                      )
                    )
                  ).length} listes
                </Badge>
              </div>
            </CardHeader>
            
            {expandedSections.has(`portal-${portalName}`) && (
              <CardContent className="space-y-3">
                {Object.entries(platforms).map(([platformName, services]) => (
                  <div key={platformName} className="ml-4 border-l-2 border-muted pl-4">
                    <div 
                      className="flex items-center gap-2 py-2 cursor-pointer hover:bg-muted/50 rounded px-2"
                      onClick={() => toggleSection(`platform-${portalName}-${platformName}`)}
                    >
                      {expandedSections.has(`platform-${portalName}-${platformName}`) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <span className="font-medium">{platformName}</span>
                      <Badge variant="secondary" className="text-xs">
                        {Object.values(services).flatMap(subServices =>
                          Object.values(subServices).flatMap(forms =>
                            Object.values(forms).flat()
                          )
                        ).length}
                      </Badge>
                    </div>
                    
                    {expandedSections.has(`platform-${portalName}-${platformName}`) && (
                      <div className="ml-4 space-y-2 mt-2">
                        {Object.entries(services).map(([serviceName, subServices]) => (
                          <div key={serviceName} className="border-l-2 border-muted pl-4">
                            <div 
                              className="flex items-center gap-2 py-2 cursor-pointer hover:bg-muted/50 rounded px-2"
                              onClick={() => toggleSection(`service-${portalName}-${platformName}-${serviceName}`)}
                            >
                              {expandedSections.has(`service-${portalName}-${platformName}-${serviceName}`) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <span className="text-sm font-medium">{serviceName}</span>
                              <Badge variant="outline" className="text-xs">
                                {Object.values(subServices).flatMap(forms =>
                                  Object.values(forms).flat()
                                ).length}
                              </Badge>
                            </div>
                            
                            {expandedSections.has(`service-${portalName}-${platformName}-${serviceName}`) && (
                              <div className="ml-4 space-y-2 mt-2">
                                {Object.entries(subServices).map(([subServiceName, forms]) => (
                                  <div key={subServiceName} className="border-l-2 border-muted pl-4">
                                    <div 
                                      className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/50 rounded px-2"
                                      onClick={() => toggleSection(`subservice-${portalName}-${platformName}-${serviceName}-${subServiceName}`)}
                                    >
                                      {expandedSections.has(`subservice-${portalName}-${platformName}-${serviceName}-${subServiceName}`) ? (
                                        <ChevronDown className="w-3 h-3" />
                                      ) : (
                                        <ChevronRight className="w-3 h-3" />
                                      )}
                                      <span className="text-sm">{subServiceName}</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {Object.values(forms).flat().length}
                                      </Badge>
                                    </div>
                                    
                                    {expandedSections.has(`subservice-${portalName}-${platformName}-${serviceName}-${subServiceName}`) && (
                                      <div className="ml-4 space-y-1 mt-1">
                                        {Object.entries(forms).map(([formName, listItems]) => (
                                          <div key={formName} className="border-l-2 border-muted pl-4">
                                            <div 
                                              className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/50 rounded px-2"
                                              onClick={() => toggleSection(`form-${portalName}-${platformName}-${serviceName}-${subServiceName}-${formName}`)}
                                            >
                                              {expandedSections.has(`form-${portalName}-${platformName}-${serviceName}-${subServiceName}-${formName}`) ? (
                                                <ChevronDown className="w-3 h-3" />
                                              ) : (
                                                <ChevronRight className="w-3 h-3" />
                                              )}
                                              <span className="text-xs font-medium">{formName}</span>
                                              <Badge variant="outline" className="text-xs">
                                                {listItems.length}
                                              </Badge>
                                            </div>
                                            
                                            {expandedSections.has(`form-${portalName}-${platformName}-${serviceName}-${subServiceName}-${formName}`) && (
                                              <div className="ml-4 space-y-1 mt-1">
                                                {listItems.map((list) => (
                                                  <div 
                                                    key={list.id}
                                                    className={cn(
                                                      "p-2 rounded border cursor-pointer transition-colors",
                                                      selectedList === list.id 
                                                        ? "bg-primary/10 border-primary" 
                                                        : "hover:bg-muted/50 border-border"
                                                    )}
                                                    onClick={() => setSelectedList(list.id)}
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      <Zap className={cn(
                                                        "w-3 h-3",
                                                        list.field_type === 'auto_select' ? "text-amber-500" : "text-blue-500"
                                                      )} />
                                                      <span className="text-xs font-medium">{list.list_name}</span>
                                                      <code className="text-xs text-muted-foreground">{list.list_code}</code>
                                                    </div>
                                                    {list.description && (
                                                      <p className="text-xs text-muted-foreground mt-1 ml-5">
                                                        {list.description}
                                                      </p>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>🗂️ Gestion des listes système</CardTitle>
            <CardDescription>
              Organisation hiérarchique par portail, plateforme, service et formulaire
            </CardDescription>
          </div>
          <Dialog open={isCreateListDialogOpen} onOpenChange={setIsCreateListDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer une liste
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle liste système</DialogTitle>
                <DialogDescription>
                  Définissez la hiérarchie et les paramètres de la liste
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
                    <Label>Code interne *</Label>
                    <Input
                      value={newListData.list_code}
                      onChange={(e) => setNewListData({ ...newListData, list_code: e.target.value })}
                      placeholder="Ex: type_publication"
                    />
                  </div>
                </div>

                <Separator />
                <h4 className="text-sm font-semibold">Hiérarchie</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Portail *</Label>
                    <Select value={newListData.portal} onValueChange={(v) => setNewListData({ ...newListData, portal: v })}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="BNRM">BNRM</SelectItem>
                        <SelectItem value="Kitab">Kitab</SelectItem>
                        <SelectItem value="CBM">CBM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Plateforme *</Label>
                    <Select value={newListData.platform} onValueChange={(v) => setNewListData({ ...newListData, platform: v })}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background">
                        <SelectItem value="Dépôt Légal">Dépôt Légal</SelectItem>
                        <SelectItem value="Activités Culturelles">Activités Culturelles</SelectItem>
                        <SelectItem value="Bibliothèque Numérique">Bibliothèque Numérique</SelectItem>
                        <SelectItem value="Manuscrits">Manuscrits</SelectItem>
                        <SelectItem value="Reproduction">Reproduction</SelectItem>
                        <SelectItem value="CBM">CBM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Service *</Label>
                    <Input
                      value={newListData.service}
                      onChange={(e) => setNewListData({ ...newListData, service: e.target.value })}
                      placeholder="Ex: Gestion des dépôts"
                    />
                  </div>
                  <div>
                    <Label>Sous-service</Label>
                    <Input
                      value={newListData.sub_service}
                      onChange={(e) => setNewListData({ ...newListData, sub_service: e.target.value })}
                      placeholder="Ex: Monographies"
                    />
                  </div>
                </div>

                <div>
                  <Label>Formulaire *</Label>
                  <Input
                    value={newListData.form_name}
                    onChange={(e) => setNewListData({ ...newListData, form_name: e.target.value })}
                    placeholder="Ex: Demande de dépôt"
                  />
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
                      <SelectItem value="auto_select">Auto-complétion</SelectItem>
                      <SelectItem value="hierarchical">Liste hiérarchique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={newListData.description || ""}
                    onChange={(e) => setNewListData({ ...newListData, description: e.target.value })}
                    placeholder="Description optionnelle"
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
        {/* Synchronisation et Nettoyage */}
        <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
          <div>
            <h4 className="text-sm font-semibold">🔄 Synchronisation</h4>
            <p className="text-xs text-muted-foreground">
              Synchronisez toutes les listes prédéfinies avec la base de données
            </p>
            <div className="mt-2">
              <SystemListsSyncButton />
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="text-sm font-semibold">🧹 Nettoyage</h4>
            <p className="text-xs text-muted-foreground">
              Uniformiser les noms de services (digital_library, Bibliothèque → Bibliothèque Numérique)
            </p>
            <Button 
              onClick={handleCleanDuplicateServices} 
              variant="outline" 
              size="sm"
              className="mt-2"
              disabled={loading}
            >
              <Zap className="w-4 h-4 mr-2" />
              Nettoyer les doublons
            </Button>
          </div>
        </div>
        
        <Separator />

        {/* Vue hiérarchique des listes */}
        {renderListHierarchy()}

        {/* Gestion des valeurs de la liste sélectionnée */}
        {selectedList && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Valeurs de la liste</h3>
                <div className="flex gap-2">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background">
                      <DialogHeader>
                        <DialogTitle>Ajouter une valeur</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Code</Label>
                          <Input
                            value={newValue.code}
                            onChange={(e) => setNewValue({ ...newValue, code: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Libellé</Label>
                          <Input
                            value={newValue.label}
                            onChange={(e) => setNewValue({ ...newValue, label: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Ordre</Label>
                          <Input
                            type="number"
                            value={newValue.order}
                            onChange={(e) => setNewValue({ ...newValue, order: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <Button onClick={handleAddValue} className="w-full">Ajouter</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger modèle
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => document.getElementById('excel-import')?.click()}>
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

                  <Button variant="outline" size="sm" onClick={handleExportExcel}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter Excel
                  </Button>
                </div>
              </div>

              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

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
                                <Button variant="ghost" size="sm" onClick={() => saveInlineEdit(value.id)}>
                                  ✓
                                </Button>
                                <Button variant="ghost" size="sm" onClick={cancelInlineEdit}>
                                  ✕
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => startInlineEdit(value)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteValue(value.id)}>
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
