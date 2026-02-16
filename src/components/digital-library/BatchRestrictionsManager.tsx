import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SimpleDropdown } from "@/components/cbn/SimpleDropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Unlock, Search, Filter, FileText, X, Shield, Download, Camera, MousePointerClick, Layers, Eye, EyeOff, Info, Square, BookOpenCheck, ScrollText } from "lucide-react";
import { TemplateSelector } from "@/components/digital-library/TemplateSelector";

export function BatchRestrictionsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  
  // Filtres de recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBatch, setFilterBatch] = useState<string>("all");
  
  // État du formulaire batch
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionMode, setRestrictionMode] = useState<"range" | "manual" | "percentage">("range");
  const [pageRanges, setPageRanges] = useState<Array<{start: number, end: number}>>([{start: 1, end: 10}]);
  const [manualPages, setManualPages] = useState("");
  const [percentageValue, setPercentageValue] = useState(10);
  const [percentagePages, setPercentagePages] = useState<number[]>([]);
  const [showPercentagePages, setShowPercentagePages] = useState(false);
  const [totalPages, setTotalPages] = useState(100);
  const [percentageDistribution, setPercentageDistribution] = useState<"start" | "end" | "distributed">("start");
  const [allowPhysicalConsultation, setAllowPhysicalConsultation] = useState(false);
  
  // Paramètres de sécurité
  const [allowDownload, setAllowDownload] = useState(true);
  const [allowScreenshot, setAllowScreenshot] = useState(true);
  const [allowRightClick, setAllowRightClick] = useState(true);
  const [restrictedPageDisplay, setRestrictedPageDisplay] = useState<"blur" | "empty" | "hidden">("blur");
  
  // Paramètres de vue
  const [allowDoublePageView, setAllowDoublePageView] = useState(true);
  const [allowScrollView, setAllowScrollView] = useState(true);
  
  // État pour le dialog de détails
  const [selectedDocumentForDetails, setSelectedDocumentForDetails] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Fetch documents from digital_library_documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['digital-library-documents-batch-restrictions'],
    queryFn: async () => {
      // Fetch documents
      const { data: docs, error: docsError } = await supabase
        .from('digital_library_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (docsError) throw docsError;

      // Fetch all restrictions
      const { data: restrictions, error: restError } = await supabase
        .from('page_access_restrictions')
        .select('*');
      
      if (restError) throw restError;

      // Merge restrictions onto documents by content_id = doc.id
      const restrictionMap = new Map<string, any>();
      (restrictions || []).forEach((r: any) => {
        restrictionMap.set(r.content_id, r);
      });

      return (docs || []).map((doc: any) => ({
        ...doc,
        _restriction: restrictionMap.get(doc.id) || null,
      }));
    }
  });

  // Extract unique batch names for filter
  const batchNames = useMemo(() => {
    if (!documents) return [];
    const names = documents
      .map((doc: any) => doc.batch_name)
      .filter((name: string | null) => name && name.trim() !== '');
    return [...new Set(names)] as string[];
  }, [documents]);

  // Filtrer les documents
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    const getRestriction = (doc: any) => {
      return doc?._restriction || null;
    };

    return documents.filter((doc: any) => {
      const matchesSearch =
        searchQuery === "" ||
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.author?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === "all" || doc.document_type === filterType;

      const restriction = getRestriction(doc);
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "restricted" && restriction?.is_restricted) ||
        (filterStatus === "public" && (!restriction || !restriction.is_restricted));

      const matchesBatch =
        filterBatch === "all" ||
        (filterBatch === "__none__" && !doc.batch_name) ||
        doc.batch_name === filterBatch;

      return matchesSearch && matchesType && matchesStatus && matchesBatch;
    });
  }, [documents, searchQuery, filterType, filterStatus, filterBatch]);

  // Mutation pour appliquer les restrictions en lot
  const applyBatchRestrictions = useMutation({
    mutationFn: async (data: any) => {
      const selectedDocs = Array.from(selectedDocuments);
      
      // Convertir les plages en tableau de pages
      let allowedPages: number[] = [];
      
      if (data.restrictionMode === 'range') {
        data.pageRanges.forEach((range: {start: number, end: number}) => {
          for (let i = range.start; i <= range.end; i++) {
            if (!allowedPages.includes(i)) {
              allowedPages.push(i);
            }
          }
        });
        allowedPages.sort((a, b) => a - b);
      } else if (data.restrictionMode === 'percentage') {
        // Utiliser les pages du pourcentage (modifiées manuellement ou calculées)
        allowedPages = data.percentagePages.length > 0 ? data.percentagePages : [];
      } else {
        // Mode manuel: convertir la chaîne en tableau
        const pages = data.manualPages.split(',').map((p: string) => parseInt(p.trim())).filter((p: number) => !isNaN(p));
        allowedPages = pages.sort((a, b) => a - b);
      }

      // Appliquer les restrictions à tous les documents sélectionnés
      const promises = selectedDocs.map(async (contentId) => {
        const restrictionData = {
          content_id: contentId,
          is_restricted: data.isRestricted,
          restriction_mode: data.restrictionMode,
          start_page: data.restrictionMode === 'range' && data.pageRanges.length > 0 ? data.pageRanges[0].start : 1,
          end_page: data.restrictionMode === 'range' && data.pageRanges.length > 0 ? data.pageRanges[data.pageRanges.length - 1].end : 10,
          manual_pages: allowedPages,
          allow_physical_consultation: data.allowPhysicalConsultation,
          allow_download: data.allowDownload,
          allow_screenshot: data.allowScreenshot,
          allow_right_click: data.allowRightClick,
          restricted_page_display: data.restrictedPageDisplay,
          allow_double_page_view: data.allowDoublePageView,
          allow_scroll_view: data.allowScrollView,
        };

        const { error } = await supabase
          .from('page_access_restrictions')
          .upsert(restrictionData, {
            onConflict: 'content_id',
          });
        
        if (error) throw error;
      });

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents-batch-restrictions'] });
      setShowBatchDialog(false);
      setSelectedDocuments(new Set());
      toast({ 
        title: "Restrictions appliquées", 
        description: `Les paramètres ont été appliqués à ${selectedDocuments.size} document(s).` 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: "Impossible d'appliquer les restrictions", 
        variant: "destructive" 
      });
      console.error(error);
    }
  });

  // Mutation pour supprimer les restrictions en lot
  const deleteBatchRestrictions = useMutation({
    mutationFn: async () => {
      const selectedDocs = Array.from(selectedDocuments);
      
      const promises = selectedDocs.map(async (contentId) => {
        const { error } = await supabase
          .from('page_access_restrictions')
          .delete()
          .eq('content_id', contentId);
        
        if (error) throw error;
      });

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents-batch-restrictions'] });
      setSelectedDocuments(new Set());
      toast({ 
        title: "Restrictions supprimées", 
        description: `Les restrictions ont été supprimées pour ${selectedDocuments.size} document(s).` 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: "Impossible de supprimer les restrictions", 
        variant: "destructive" 
      });
      console.error(error);
    }
  });

  const toggleDocumentSelection = (docId: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedDocuments(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.id)));
    }
  };

  const handleApplyBatchRestrictions = () => {
    if (selectedDocuments.size === 0) {
      toast({
        title: "Aucun document sélectionné",
        description: "Veuillez sélectionner au moins un document",
        variant: "destructive"
      });
      return;
    }
    setShowBatchDialog(true);
  };

  const handleSaveBatchRestrictions = () => {
    applyBatchRestrictions.mutate({
      isRestricted,
      restrictionMode,
      pageRanges,
      manualPages,
      percentageValue,
      percentagePages,
      allowPhysicalConsultation,
      allowDownload,
      allowScreenshot,
      allowRightClick,
      restrictedPageDisplay,
      allowDoublePageView,
      allowScrollView,
    });
  };

  // Calculer les pages basées sur le pourcentage
  const calculatePercentagePages = () => {
    const numPages = Math.ceil((totalPages * percentageValue) / 100);
    const pages: number[] = [];
    
    if (percentageDistribution === "start") {
      // Pages du début
      for (let i = 1; i <= numPages; i++) {
        pages.push(i);
      }
    } else if (percentageDistribution === "end") {
      // Pages de la fin
      for (let i = totalPages - numPages + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Distribution équilibrée
      const interval = Math.floor(totalPages / numPages);
      for (let i = 0; i < numPages; i++) {
        pages.push(Math.min(1 + (i * interval), totalPages));
      }
    }
    
    setPercentagePages(pages.sort((a, b) => a - b));
    setShowPercentagePages(true);
    toast({
      title: "Pages calculées",
      description: `${numPages} pages ont été sélectionnées selon le pourcentage de ${percentageValue}% (${percentageDistribution === "start" ? "début" : percentageDistribution === "end" ? "fin" : "réparties"})`,
    });
  };

  // Basculer une page dans la liste percentage
  const togglePercentagePage = (page: number) => {
    if (percentagePages.includes(page)) {
      setPercentagePages(percentagePages.filter(p => p !== page));
    } else {
      setPercentagePages([...percentagePages, page].sort((a, b) => a - b));
    }
  };

  const handleRemoveBatchRestrictions = () => {
    if (selectedDocuments.size === 0) {
      toast({
        title: "Aucun document sélectionné",
        description: "Veuillez sélectionner au moins un document",
        variant: "destructive"
      });
      return;
    }
    
    if (confirm(`Voulez-vous vraiment supprimer les restrictions pour ${selectedDocuments.size} document(s) ?`)) {
      deleteBatchRestrictions.mutate();
    }
  };

  const addPageRange = () => {
    setPageRanges([...pageRanges, { start: 1, end: 10 }]);
  };

  const removePageRange = (index: number) => {
    setPageRanges(pageRanges.filter((_, i) => i !== index));
  };

  const updatePageRange = (index: number, field: 'start' | 'end', value: number) => {
    const newRanges = [...pageRanges];
    newRanges[index][field] = value;
    setPageRanges(newRanges);
  };

  return (
    <div className="space-y-8">
      {/* En-tête avec gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-start gap-6">
          <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
            <Layers className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Restrictions par lot</h1>
            <p className="text-white/90 text-lg">
              Appliquer des restrictions d'accès aux pages à plusieurs documents simultanément
            </p>
            <div className="mt-4 flex gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <FileText className="h-3 w-3 mr-1" />
                {filteredDocuments.length} document(s)
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Layers className="h-3 w-3 mr-1" />
                {selectedDocuments.size} sélectionné(s)
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres de recherche */}
      <Card className="shadow-lg">
        <CardHeader className="bg-muted/30">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Recherche et Filtres</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <Label htmlFor="search" className="text-sm font-semibold flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                Rechercher un document
              </Label>
              <Input
                id="search"
                placeholder="Rechercher par titre ou auteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="filter-type" className="text-sm font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                Type de document
              </Label>
              <SimpleDropdown
                value={filterType}
                onChange={setFilterType}
                options={[
                  { value: "all", label: "Tous les types" },
                  { value: "livre", label: "Livres" },
                  { value: "periodique", label: "Périodiques" },
                  { value: "carte", label: "Cartes" },
                  { value: "manuscrit", label: "Manuscrits" },
                ]}
                placeholder="Tous les types"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="filter-batch" className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Lot d'import
              </Label>
              <SimpleDropdown
                value={filterBatch}
                onChange={setFilterBatch}
                options={[
                  { value: "all", label: "Tous les lots" },
                  { value: "__none__", label: "Sans lot" },
                  ...batchNames.map((name: string) => ({ value: name, label: name })),
                ]}
                placeholder="Tous les lots"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="filter-status" className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Statut de restriction
              </Label>
              <SimpleDropdown
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: "all", label: "Tous les statuts" },
                  { value: "restricted", label: "Restreints" },
                  { value: "public", label: "Publics" },
                ]}
                placeholder="Tous les statuts"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Résultats:</span>
              <span className="text-foreground font-bold">{filteredDocuments.length} document(s)</span>
            </div>
            {(searchQuery || filterType !== "all" || filterStatus !== "all" || filterBatch !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                  setFilterStatus("all");
                  setFilterBatch("all");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions en lot */}
      {selectedDocuments.size > 0 && (
        <Card className="border-primary shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <span className="font-semibold">{selectedDocuments.size} document(s) sélectionné(s)</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApplyBatchRestrictions} className="gap-2">
                  <Lock className="h-4 w-4" />
                  Appliquer des restrictions
                </Button>
                <Button variant="destructive" onClick={handleRemoveBatchRestrictions} className="gap-2">
                  <Unlock className="h-4 w-4" />
                  Supprimer les restrictions
                </Button>
                <Button variant="outline" onClick={() => setSelectedDocuments(new Set())}>
                  <X className="h-4 w-4 mr-2" />
                  Désélectionner tout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des documents */}
      <Card className="shadow-lg">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-xl">Documents disponibles</CardTitle>
          <CardDescription>
            Sélectionnez les documents auxquels vous souhaitez appliquer des restrictions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Chargement des documents...</p>
          ) : filteredDocuments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Aucun document trouvé</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-4 border-b">
                <Checkbox
                  id="select-all"
                  checked={selectedDocuments.size === filteredDocuments.length && filteredDocuments.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <Label htmlFor="select-all" className="font-semibold cursor-pointer">
                  Tout sélectionner ({filteredDocuments.length} documents)
                </Label>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Mode de restriction</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    const restriction = doc._restriction;
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedDocuments.has(doc.id)}
                            onCheckedChange={() => toggleDocumentSelection(doc.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{doc.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.document_type || doc.batch_name || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          {restriction?.is_restricted ? (
                            <Badge variant="destructive" className="gap-1">
                              <Lock className="h-3 w-3" />
                              Restreint
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Unlock className="h-3 w-3" />
                              Public
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {restriction?.restriction_mode ? (
                            <Badge variant="outline">
                              {restriction.restriction_mode === 'range' && 'Par plage'}
                              {restriction.restriction_mode === 'manual' && 'Manuel'}
                              {restriction.restriction_mode === 'percentage' && 'Pourcentage'}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDocumentForDetails(doc);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Info className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de détails du document */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Info className="h-6 w-6" />
              Détails du document
            </DialogTitle>
          </DialogHeader>

          {selectedDocumentForDetails && (
            <div className="space-y-6 py-4">
              {/* Informations générales */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informations générales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">Titre:</span>
                    <span className="col-span-2 text-sm">{selectedDocumentForDetails.title}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">Type:</span>
                    <span className="col-span-2">
                      <Badge variant="outline">{selectedDocumentForDetails.content_type}</Badge>
                    </span>
                  </div>
                  {selectedDocumentForDetails.excerpt && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">Description:</span>
                      <span className="col-span-2 text-sm">{selectedDocumentForDetails.excerpt}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">ID:</span>
                    <span className="col-span-2 text-xs font-mono">{selectedDocumentForDetails.id}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Statut de restriction */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Statut de restriction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDocumentForDetails.page_access_restrictions?.[0] ? (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-sm font-semibold text-muted-foreground">Statut:</span>
                        <span className="col-span-2">
                          {selectedDocumentForDetails.page_access_restrictions[0].is_restricted ? (
                            <Badge variant="destructive" className="gap-1">
                              <Lock className="h-3 w-3" />
                              Restreint
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Unlock className="h-3 w-3" />
                              Public
                            </Badge>
                          )}
                        </span>
                      </div>

                      {selectedDocumentForDetails.page_access_restrictions[0].is_restricted && (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-semibold text-muted-foreground">Mode:</span>
                            <span className="col-span-2">
                              <Badge variant="outline">
                                {selectedDocumentForDetails.page_access_restrictions[0].restriction_mode === 'range' && 'Par plage de pages'}
                                {selectedDocumentForDetails.page_access_restrictions[0].restriction_mode === 'manual' && 'Sélection manuelle'}
                                {selectedDocumentForDetails.page_access_restrictions[0].restriction_mode === 'percentage' && 'Par pourcentage'}
                              </Badge>
                            </span>
                          </div>

                          {selectedDocumentForDetails.page_access_restrictions[0].restriction_mode === 'range' && (
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-sm font-semibold text-muted-foreground">Plage:</span>
                              <span className="col-span-2 text-sm">
                                Pages {selectedDocumentForDetails.page_access_restrictions[0].start_page} à {selectedDocumentForDetails.page_access_restrictions[0].end_page}
                              </span>
                            </div>
                          )}

                          {selectedDocumentForDetails.page_access_restrictions[0].manual_pages && selectedDocumentForDetails.page_access_restrictions[0].manual_pages.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              <span className="text-sm font-semibold text-muted-foreground">Pages accessibles:</span>
                              <div className="col-span-2">
                                <div className="p-3 bg-muted/50 rounded-md max-h-32 overflow-y-auto">
                                  <span className="text-sm font-mono">
                                    {selectedDocumentForDetails.page_access_restrictions[0].manual_pages.join(', ')}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {selectedDocumentForDetails.page_access_restrictions[0].manual_pages.length} page(s) accessible(s)
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Badge variant="secondary" className="gap-1">
                        <Unlock className="h-3 w-3" />
                        Aucune restriction configurée
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        Ce document est entièrement public
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Paramètres de sécurité */}
              {selectedDocumentForDetails.page_access_restrictions?.[0] && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Paramètres de sécurité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        Téléchargement:
                      </span>
                      <span className="col-span-2">
                        <Badge variant={selectedDocumentForDetails.page_access_restrictions[0].allow_download ? "default" : "destructive"}>
                          {selectedDocumentForDetails.page_access_restrictions[0].allow_download ? "Autorisé" : "Bloqué"}
                        </Badge>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        Captures d'écran:
                      </span>
                      <span className="col-span-2">
                        <Badge variant={selectedDocumentForDetails.page_access_restrictions[0].allow_screenshot ? "default" : "destructive"}>
                          {selectedDocumentForDetails.page_access_restrictions[0].allow_screenshot ? "Autorisé" : "Bloqué"}
                        </Badge>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                        <MousePointerClick className="h-3 w-3" />
                        Clic droit:
                      </span>
                      <span className="col-span-2">
                        <Badge variant={selectedDocumentForDetails.page_access_restrictions[0].allow_right_click ? "default" : "destructive"}>
                          {selectedDocumentForDetails.page_access_restrictions[0].allow_right_click ? "Autorisé" : "Bloqué"}
                        </Badge>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Consultation physique:
                      </span>
                      <span className="col-span-2">
                        <Badge variant={selectedDocumentForDetails.page_access_restrictions[0].allow_physical_consultation ? "default" : "secondary"}>
                          {selectedDocumentForDetails.page_access_restrictions[0].allow_physical_consultation ? "Autorisée" : "Non disponible"}
                        </Badge>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                        <EyeOff className="h-3 w-3" />
                        Affichage pages restreintes:
                      </span>
                      <span className="col-span-2">
                        <Badge variant="outline">
                          {selectedDocumentForDetails.page_access_restrictions[0].restricted_page_display === 'blur' && 'Effet flou'}
                          {selectedDocumentForDetails.page_access_restrictions[0].restricted_page_display === 'empty' && 'Page vide'}
                          {selectedDocumentForDetails.page_access_restrictions[0].restricted_page_display === 'hidden' && 'Masqué'}
                          {!selectedDocumentForDetails.page_access_restrictions[0].restricted_page_display && 'Effet flou (par défaut)'}
                        </Badge>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de configuration des restrictions en lot */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Layers className="h-6 w-6" />
              Appliquer des restrictions en lot
            </DialogTitle>
            <DialogDescription>
              Ces paramètres seront appliqués à {selectedDocuments.size} document(s) sélectionné(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Appliquer depuis un modèle */}
            <TemplateSelector onApply={(tpl) => {
              setIsRestricted(tpl.is_restricted);
              setRestrictionMode((tpl.restriction_mode as any) || "range");
              if (tpl.restriction_mode === 'range') {
                setPageRanges([{ start: tpl.start_page || 1, end: tpl.end_page || 10 }]);
              }
              if (tpl.restriction_mode === 'manual' && tpl.manual_pages) {
                setManualPages(tpl.manual_pages.join(", "));
              }
              if (tpl.restriction_mode === 'percentage') {
                setPercentageValue(tpl.percentage_value || 10);
                setPercentageDistribution((tpl.percentage_distribution as any) || "start");
              }
              setAllowPhysicalConsultation(tpl.allow_physical_consultation ?? false);
              setAllowDownload(tpl.allow_download ?? true);
              setAllowScreenshot(tpl.allow_screenshot ?? true);
              setAllowRightClick(tpl.allow_right_click ?? true);
              setRestrictedPageDisplay((tpl.restricted_page_display as any) || "blur");
              setAllowDoublePageView(tpl.allow_double_page_view ?? true);
              setAllowScrollView(tpl.allow_scroll_view ?? true);
            }} />
            {/* Activer/Désactiver les restrictions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Statut de restriction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="is-restricted" className="text-base font-medium">
                      Activer les restrictions d'accès
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Limite l'accès aux pages selon les paramètres ci-dessous
                    </p>
                  </div>
                  <Switch
                    id="is-restricted"
                    checked={isRestricted}
                    onCheckedChange={setIsRestricted}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configuration des pages accessibles */}
            {isRestricted && (
              <>
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Mode de restriction</CardTitle>
                    <CardDescription>
                      Choisissez comment définir les pages accessibles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SimpleDropdown
                      value={restrictionMode}
                      onChange={(value: any) => setRestrictionMode(value)}
                      options={[
                        { value: "range", label: "Par plage de pages" },
                        { value: "manual", label: "Sélection manuelle" },
                        { value: "percentage", label: "Par pourcentage" },
                      ]}
                      placeholder="Sélectionner un mode"
                    />

                    {/* Mode plage */}
                    {restrictionMode === 'range' && (
                      <div className="space-y-4">
                        <Label>Plages de pages accessibles</Label>
                        {pageRanges.map((range, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <Input
                              type="number"
                              placeholder="Début"
                              value={range.start}
                              onChange={(e) => updatePageRange(index, 'start', parseInt(e.target.value) || 1)}
                              className="flex-1"
                            />
                            <span>à</span>
                            <Input
                              type="number"
                              placeholder="Fin"
                              value={range.end}
                              onChange={(e) => updatePageRange(index, 'end', parseInt(e.target.value) || 10)}
                              className="flex-1"
                            />
                            {pageRanges.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removePageRange(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" onClick={addPageRange} size="sm">
                          Ajouter une plage
                        </Button>
                      </div>
                    )}

                    {/* Mode manuel */}
                    {restrictionMode === 'manual' && (
                      <div className="space-y-2">
                        <Label htmlFor="manual-pages">Pages accessibles (séparées par des virgules)</Label>
                        <Input
                          id="manual-pages"
                          placeholder="Ex: 1, 2, 3, 5, 8, 13"
                          value={manualPages}
                          onChange={(e) => setManualPages(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Entrez les numéros de pages séparés par des virgules
                        </p>
                      </div>
                    )}

                    {/* Mode pourcentage */}
                    {restrictionMode === 'percentage' && (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="percentage">Pourcentage de pages accessibles</Label>
                            <div className="flex gap-2 items-center">
                              <Input
                                id="percentage"
                                type="number"
                                min="1"
                                max="100"
                                value={percentageValue}
                                onChange={(e) => setPercentageValue(parseInt(e.target.value) || 10)}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground font-medium">%</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="total-pages">Nombre total de pages (référence)</Label>
                            <Input
                              id="total-pages"
                              type="number"
                              min="1"
                              value={totalPages}
                              onChange={(e) => setTotalPages(parseInt(e.target.value) || 100)}
                              placeholder="Ex: 245"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="distribution">Mode de distribution des pages</Label>
                          <SimpleDropdown
                            value={percentageDistribution}
                            onChange={(value: any) => setPercentageDistribution(value)}
                            options={[
                              { value: "start", label: "Pages du début" },
                              { value: "end", label: "Pages de la fin" },
                              { value: "distributed", label: "Répartition équilibrée" },
                            ]}
                            placeholder="Sélectionner une distribution"
                          />
                          <p className="text-xs text-muted-foreground">
                            {percentageDistribution === "start" && "Les premières pages seront accessibles (1, 2, 3, ...)"}
                            {percentageDistribution === "end" && "Les dernières pages seront accessibles (..., n-2, n-1, n)"}
                            {percentageDistribution === "distributed" && "Les pages seront réparties de manière équilibrée dans tout le document"}
                          </p>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Nombre de pages calculé:</span>
                            <span className="font-bold text-lg">{Math.ceil((totalPages * percentageValue) / 100)} pages</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Sur un document de {totalPages} pages, {percentageValue}% représente {Math.ceil((totalPages * percentageValue) / 100)} pages accessibles
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="default"
                          onClick={calculatePercentagePages}
                          className="w-full"
                        >
                          Calculer et prévisualiser les pages
                        </Button>

                        {showPercentagePages && percentagePages.length > 0 && (
                          <Card className="border-primary">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Pages sélectionnées ({percentagePages.length} sur {totalPages})
                                </CardTitle>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setPercentagePages([]);
                                    setShowPercentagePages(false);
                                  }}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Réinitialiser
                                </Button>
                              </div>
                              <CardDescription>
                                Cliquez sur les numéros pour ajouter/retirer des pages
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="max-h-64 overflow-y-auto">
                                <div className="grid grid-cols-10 gap-2">
                                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    const isSelected = percentagePages.includes(page);
                                    return (
                                      <Button
                                        key={page}
                                        type="button"
                                        variant={isSelected ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => togglePercentagePage(page)}
                                        className="h-10 text-xs"
                                      >
                                        {page}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                <p className="text-xs text-blue-900 dark:text-blue-100">
                                  💡 <strong>Astuce:</strong> Cette sélection servira de modèle. Le calcul réel sera fait individuellement pour chaque document selon son nombre de pages.
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Paramètres de sécurité */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Paramètres de sécurité
                    </CardTitle>
                    <CardDescription>
                      Contrôlez les actions disponibles pour les utilisateurs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="allow-download" className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Autoriser le téléchargement
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Permet aux utilisateurs de télécharger les pages accessibles
                        </p>
                      </div>
                      <Switch
                        id="allow-download"
                        checked={allowDownload}
                        onCheckedChange={setAllowDownload}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="allow-screenshot" className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          Autoriser les captures d'écran
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Bloque les captures d'écran si désactivé (navigateurs compatibles)
                        </p>
                      </div>
                      <Switch
                        id="allow-screenshot"
                        checked={allowScreenshot}
                        onCheckedChange={setAllowScreenshot}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="allow-right-click" className="flex items-center gap-2">
                          <MousePointerClick className="h-4 w-4" />
                          Autoriser le clic droit
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Désactive le menu contextuel sur le visualiseur
                        </p>
                      </div>
                      <Switch
                        id="allow-right-click"
                        checked={allowRightClick}
                        onCheckedChange={setAllowRightClick}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Paramètres de vue */}
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-lg">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpenCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Paramètres de vue
                    </CardTitle>
                    <CardDescription>
                      Contrôlez les modes d'affichage disponibles dans le lecteur
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="allow-double-page" className="flex items-center gap-2">
                          <BookOpenCheck className="h-4 w-4" />
                          Autoriser la vue double page
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Affichage de deux pages côte à côte
                        </p>
                      </div>
                      <Switch
                        id="allow-double-page"
                        checked={allowDoublePageView}
                        onCheckedChange={setAllowDoublePageView}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="allow-scroll" className="flex items-center gap-2">
                          <ScrollText className="h-4 w-4" />
                          Autoriser le mode défilement
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Navigation par défilement vertical
                        </p>
                      </div>
                      <Switch
                        id="allow-scroll"
                        checked={allowScrollView}
                        onCheckedChange={setAllowScrollView}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Affichage des pages non accessibles */}
                <Card className="border-orange-200 dark:border-orange-800">
                  <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-t-lg">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <EyeOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      Affichage des pages non accessibles
                    </CardTitle>
                    <CardDescription>
                      Choisissez comment les pages restreintes seront affichées aux visiteurs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div className="grid gap-3">
                      <Button
                        type="button"
                        variant={restrictedPageDisplay === "blur" ? "default" : "outline"}
                        onClick={() => setRestrictedPageDisplay("blur")}
                        className="w-full h-auto py-3 flex items-center gap-3 justify-start"
                      >
                        <Eye className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Effet flou</div>
                          <div className="text-xs opacity-80">Les pages sont visibles mais floues</div>
                        </div>
                      </Button>
                      
                      <Button
                        type="button"
                        variant={restrictedPageDisplay === "empty" ? "default" : "outline"}
                        onClick={() => setRestrictedPageDisplay("empty")}
                        className="w-full h-auto py-3 flex items-center gap-3 justify-start"
                      >
                        <Square className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Page vide</div>
                          <div className="text-xs opacity-80">Une page blanche avec un message</div>
                        </div>
                      </Button>
                      
                      <Button
                        type="button"
                        variant={restrictedPageDisplay === "hidden" ? "default" : "outline"}
                        onClick={() => setRestrictedPageDisplay("hidden")}
                        className="w-full h-auto py-3 flex items-center gap-3 justify-start"
                      >
                        <EyeOff className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-semibold">Masquer complètement</div>
                          <div className="text-xs opacity-80">Les pages sont totalement invisibles</div>
                        </div>
                      </Button>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mt-3">
                      <p className="text-xs text-blue-900 dark:text-blue-100">
                        💡 <strong>Conseil :</strong> L'effet flou permet aux visiteurs de voir qu'il y a du contenu, tandis que les pages vides indiquent clairement qu'un contenu existe mais n'est pas accessible.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Option consultation physique */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Options additionnelles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="physical-consultation" className="text-base font-medium">
                          Autoriser la consultation physique sur demande
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Les utilisateurs pourront demander à consulter les documents complets en bibliothèque
                        </p>
                      </div>
                      <Switch
                        id="physical-consultation"
                        checked={allowPhysicalConsultation}
                        onCheckedChange={setAllowPhysicalConsultation}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveBatchRestrictions} disabled={applyBatchRestrictions.isPending}>
              {applyBatchRestrictions.isPending ? "Application..." : "Appliquer les restrictions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
