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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Unlock, Edit, Save, X, BookOpen, FileText, Search, Filter, Eye, EyeOff, Plus, Trash2, Shield, Download, Camera, MousePointerClick, Square, Sparkles, ArrowLeft, BookOpenCheck, ScrollText, FileQuestion, AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function PageAccessRestrictionsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  
  // Filtres de recherche
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // État du formulaire
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionMode, setRestrictionMode] = useState<"range" | "manual" | "percentage">("range");
  const [pageRanges, setPageRanges] = useState<Array<{start: number, end: number}>>([{start: 1, end: 10}]);
  const [manualPages, setManualPages] = useState<number[]>([]);
  const [percentageValue, setPercentageValue] = useState(10);
  const [percentagePages, setPercentagePages] = useState<number[]>([]);
  const [showPercentagePages, setShowPercentagePages] = useState(false);
  const [allowPhysicalConsultation, setAllowPhysicalConsultation] = useState(false);
  const [isRareBook, setIsRareBook] = useState(false);
  const [totalPages, setTotalPages] = useState(245);
  
  // Paramètres de sécurité
  const [allowDownload, setAllowDownload] = useState(true);
  const [allowScreenshot, setAllowScreenshot] = useState(true);
  const [restrictedPageDisplay, setRestrictedPageDisplay] = useState<"blur" | "empty" | "hidden">("blur");
  const [allowRightClick, setAllowRightClick] = useState(true);
  const [allowInternetAccess, setAllowInternetAccess] = useState(true);
  const [allowInternalAccess, setAllowInternalAccess] = useState(false);
  
  // Paramètres de vue
  const [allowDoublePageView, setAllowDoublePageView] = useState(true);
  const [allowScrollView, setAllowScrollView] = useState(true);
  
  // Pages manquantes
  const [missingPages, setMissingPages] = useState<number[]>([]);
  const [missingPagesReason, setMissingPagesReason] = useState<string>("");
  const [missingPagesCustomReason, setMissingPagesCustomReason] = useState("");
  const [showMissingPagesSection, setShowMissingPagesSection] = useState(false);
  const [newMissingPage, setNewMissingPage] = useState("");
  
  // Liste des raisons prédéfinies
  const missingPagesReasons = [
    { value: "deterioration", label: "Détérioration du document original" },
    { value: "lacune_origine", label: "Lacune d'origine (pages jamais présentes)" },
    { value: "restauration", label: "Pages retirées pour restauration" },
    { value: "censure_historique", label: "Censure historique" },
    { value: "numerisation_incomplete", label: "Numérisation incomplète" },
    { value: "pages_brulees", label: "Pages brulées" },
    { value: "autre", label: "Autre (préciser)" },
  ];

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['digital-library-documents-with-restrictions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          page_access_restrictions (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Filtrer les documents
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    const getRestriction = (doc: any) => {
      const pr = doc?.page_access_restrictions;
      if (!pr) return null;
      return Array.isArray(pr) ? (pr[0] ?? null) : pr;
    };

    return documents.filter((doc) => {
      const matchesSearch =
        searchQuery === "" ||
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === "all" || doc.content_type === filterType;

      const restriction = getRestriction(doc);
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "restricted" && restriction?.is_restricted) ||
        (filterStatus === "public" && (!restriction || !restriction.is_restricted));

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, searchQuery, filterType, filterStatus]);

  // Mutation pour créer ou mettre à jour une restriction
  const saveRestriction = useMutation({
    mutationFn: async (data: any) => {
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
        allowedPages = data.percentagePages.length > 0 ? data.percentagePages : [];
        if (allowedPages.length === 0) {
          const numPages = Math.ceil((totalPages * data.percentageValue) / 100);
          for (let i = 1; i <= numPages; i++) {
            allowedPages.push(i);
          }
        }
      } else {
        allowedPages = data.manualPages;
      }

      const restrictionData = {
        content_id: selectedDocument.id,
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
        allow_internet_access: data.allowInternetAccess,
        allow_internal_access: data.allowInternalAccess,
        is_rare_book: data.isRareBook,
        allow_double_page_view: data.allowDoublePageView,
        allow_scroll_view: data.allowScrollView,
        missing_pages: data.missingPages || [],
        missing_pages_reason: data.missingPagesReason || null,
        missing_pages_custom_reason: data.missingPagesReason === 'autre' ? data.missingPagesCustomReason : null,
      };

      const { error } = await supabase
        .from('page_access_restrictions')
        .upsert(restrictionData, {
          onConflict: 'content_id',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents-with-restrictions'] });
      setSelectedDocument(null);
      toast({ 
        title: "Restriction enregistrée", 
        description: "Les paramètres d'accès aux pages ont été mis à jour." 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Erreur", 
        description: "Impossible d'enregistrer la restriction", 
        variant: "destructive" 
      });
      console.error(error);
    }
  });

  // Mutation pour supprimer une restriction
  const deleteRestriction = useMutation({
    mutationFn: async (contentId: string) => {
      const { error } = await supabase
        .from('page_access_restrictions')
        .delete()
        .eq('content_id', contentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-library-documents-with-restrictions'] });
      toast({ title: "Restriction supprimée" });
      setShowDeleteConfirm(false);
      setDocumentToDelete(null);
    }
  });

  const handleEditDocument = (doc: any) => {
    setSelectedDocument(doc);
    const restriction = Array.isArray(doc.page_access_restrictions)
      ? doc.page_access_restrictions?.[0]
      : doc.page_access_restrictions;
    
    if (restriction) {
      setIsRestricted(restriction.is_restricted);
      setRestrictionMode(restriction.restriction_mode);
      setAllowPhysicalConsultation(restriction.allow_physical_consultation || false);
      setAllowDownload(restriction.allow_download !== false);
      setAllowScreenshot(restriction.allow_screenshot !== false);
      setAllowRightClick(restriction.allow_right_click !== false);
      setRestrictedPageDisplay(restriction.restricted_page_display || "blur");
      setAllowInternetAccess(restriction.allow_internet_access !== false);
      setAllowInternalAccess(restriction.allow_internal_access || false);
      setIsRareBook(restriction.is_rare_book || false);
      setAllowDoublePageView(restriction.allow_double_page_view !== false);
      setAllowScrollView(restriction.allow_scroll_view !== false);
      
      // Pages manquantes
      setMissingPages(restriction.missing_pages || []);
      setMissingPagesReason(restriction.missing_pages_reason || "");
      setMissingPagesCustomReason(restriction.missing_pages_custom_reason || "");
      setShowMissingPagesSection((restriction.missing_pages?.length || 0) > 0);
      
      if (restriction.restriction_mode === 'range' && restriction.manual_pages?.length > 0) {
        const pages = [...restriction.manual_pages].sort((a, b) => a - b);
        const ranges: Array<{start: number, end: number}> = [];
        let currentRange = { start: pages[0], end: pages[0] };
        
        for (let i = 1; i < pages.length; i++) {
          if (pages[i] === currentRange.end + 1) {
            currentRange.end = pages[i];
          } else {
            ranges.push({...currentRange});
            currentRange = { start: pages[i], end: pages[i] };
          }
        }
        ranges.push(currentRange);
        setPageRanges(ranges.length > 0 ? ranges : [{start: 1, end: 10}]);
      } else {
        setPageRanges([{start: restriction.start_page || 1, end: restriction.end_page || 10}]);
      }
      
      setManualPages(restriction.manual_pages || []);
      
      if (restriction.restriction_mode === 'percentage' && restriction.manual_pages?.length > 0) {
        const percentage = Math.round((restriction.manual_pages.length / totalPages) * 100);
        setPercentageValue(percentage);
        setPercentagePages(restriction.manual_pages);
        setShowPercentagePages(true);
      } else {
        setPercentagePages([]);
        setShowPercentagePages(false);
      }
    } else {
      setIsRestricted(false);
      setRestrictionMode("range");
      setPageRanges([{start: 1, end: 10}]);
      setManualPages([]);
      setPercentageValue(10);
      setPercentagePages([]);
      setShowPercentagePages(false);
      setAllowPhysicalConsultation(false);
      setAllowDownload(true);
      setAllowScreenshot(true);
      setAllowRightClick(true);
      setRestrictedPageDisplay("blur");
      setAllowInternetAccess(true);
      setAllowInternalAccess(false);
      setIsRareBook(false);
      setAllowDoublePageView(true);
      setAllowScrollView(true);
      setMissingPages([]);
      setMissingPagesReason("");
      setMissingPagesCustomReason("");
      setShowMissingPagesSection(false);
    }
  };

  const handleSaveRestriction = () => {
    saveRestriction.mutate({
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
      allowInternetAccess,
      allowInternalAccess,
      isRareBook,
      allowDoublePageView,
      allowScrollView,
      missingPages,
      missingPagesReason,
      missingPagesCustomReason,
    });
  };

  const handleAddMissingPage = () => {
    const pageNum = parseInt(newMissingPage, 10);
    if (!isNaN(pageNum) && pageNum > 0 && pageNum <= totalPages && !missingPages.includes(pageNum)) {
      setMissingPages([...missingPages, pageNum].sort((a, b) => a - b));
      setNewMissingPage("");
    }
  };

  const handleRemoveMissingPage = (page: number) => {
    setMissingPages(missingPages.filter(p => p !== page));
  };

  const calculatePercentagePages = () => {
    const numPages = Math.ceil((totalPages * percentageValue) / 100);
    const pages = [];
    for (let i = 1; i <= numPages; i++) {
      pages.push(i);
    }
    setPercentagePages(pages);
    setShowPercentagePages(true);
    toast({
      title: "Pages calculées",
      description: `${numPages} pages ont été sélectionnées selon le pourcentage de ${percentageValue}%`,
    });
  };

  const togglePercentagePage = (page: number) => {
    if (percentagePages.includes(page)) {
      setPercentagePages(percentagePages.filter(p => p !== page));
    } else {
      setPercentagePages([...percentagePages, page].sort((a, b) => a - b));
    }
  };

  const handleRemoveRestriction = (doc: any) => {
    setDocumentToDelete(doc);
    setShowDeleteConfirm(true);
  };

  // Si un document est sélectionné, afficher le panneau de configuration
  if (selectedDocument) {
    return (
      <div className="space-y-6">
        {/* En-tête avec bouton retour */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedDocument(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Button>
        </div>

        {/* Titre du document */}
        <Card className="border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl flex items-center gap-3">
                  {selectedDocument.title}
                  {(selectedDocument.content_type as string) === 'rare_book' && (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      Livre rare
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Configuration des restrictions d'accès aux pages</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Panneau de configuration */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Colonne gauche - Paramètres principaux */}
          <div className="space-y-6">
            {/* Activer/Désactiver la restriction */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label className="text-base font-semibold">Activer la restriction</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Limiter l'accès aux pages pour les visiteurs non connectés
                    </p>
                  </div>
                  <Switch
                    checked={isRestricted}
                    onCheckedChange={setIsRestricted}
                    className="ml-4"
                  />
                </div>
              </CardContent>
            </Card>

            {isRestricted && (
              <>
                {/* Mode d'accès */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Mode d'accès
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Sélectionnez un ou plusieurs modes d'accès
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div 
                      className={`w-full py-4 px-4 flex items-center gap-3 rounded-md border cursor-pointer transition-colors ${
                        allowInternetAccess ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'
                      }`}
                      onClick={() => setAllowInternetAccess(!allowInternetAccess)}
                    >
                      <Switch
                        checked={allowInternetAccess}
                        onCheckedChange={setAllowInternetAccess}
                        className="data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
                      />
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <div className="text-left flex-1">
                        <div className="font-semibold">Libre d'accès par Internet</div>
                        <div className="text-xs opacity-80">Accessible depuis n'importe où</div>
                      </div>
                    </div>
                    <div 
                      className={`w-full py-4 px-4 flex items-center gap-3 rounded-md border cursor-pointer transition-colors ${
                        allowInternalAccess ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'
                      }`}
                      onClick={() => setAllowInternalAccess(!allowInternalAccess)}
                    >
                      <Switch
                        checked={allowInternalAccess}
                        onCheckedChange={setAllowInternalAccess}
                        className="data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
                      />
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div className="text-left flex-1">
                        <div className="font-semibold">Accès interne uniquement</div>
                        <div className="text-xs opacity-80">Consultation sur place à la bibliothèque</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Consultation physique */}
                {allowInternetAccess && (
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-base font-semibold">Consultation physique autorisée</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Autoriser la consultation du document complet sur place
                          </p>
                        </div>
                        <Switch
                          checked={allowPhysicalConsultation}
                          onCheckedChange={setAllowPhysicalConsultation}
                          className="ml-4"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-full bg-amber-500/20">
                            <Sparkles className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <Label className="text-base font-semibold cursor-pointer">Livre rare</Label>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Marquer ce document comme livre rare ou précieux
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={isRareBook}
                          onCheckedChange={setIsRareBook}
                          className="ml-4"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Mode de restriction */}
                {allowInternetAccess && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Mode de restriction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        type="button"
                        variant={restrictionMode === "range" ? "default" : "outline"}
                        onClick={() => setRestrictionMode("range")}
                        className="w-full h-auto py-4 flex items-center gap-3"
                      >
                        <BookOpen className="h-5 w-5" />
                        <div className="text-left flex-1">
                          <div className="font-semibold">Plage de pages</div>
                          <div className="text-xs opacity-80">Définir début et fin</div>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant={restrictionMode === "manual" ? "default" : "outline"}
                        onClick={() => setRestrictionMode("manual")}
                        className="w-full h-auto py-4 flex items-center gap-3"
                      >
                        <FileText className="h-5 w-5" />
                        <div className="text-left flex-1">
                          <div className="font-semibold">Sélection manuelle</div>
                          <div className="text-xs opacity-80">Choisir page par page</div>
                        </div>
                      </Button>
                      <Button
                        type="button"
                        variant={restrictionMode === "percentage" ? "default" : "outline"}
                        onClick={() => setRestrictionMode("percentage")}
                        className="w-full h-auto py-4 flex items-center gap-3"
                      >
                        <Eye className="h-5 w-5" />
                        <div className="text-left flex-1">
                          <div className="font-semibold">Pourcentage de pages</div>
                          <div className="text-xs opacity-80">Autoriser un % de pages</div>
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Colonne droite - Configuration détaillée */}
          <div className="space-y-6">
            {isRestricted && allowInternetAccess && (
              <>
                {/* Configuration selon le mode */}
                {restrictionMode === "percentage" ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Pourcentage de pages accessibles</CardTitle>
                      <CardDescription className="text-xs">
                        Définissez le pourcentage de pages accessibles aux visiteurs non connectés
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="percentage-input" className="text-sm font-medium">
                          Pourcentage (%)
                        </Label>
                        <div className="flex gap-3 items-center">
                          <Input
                            id="percentage-input"
                            type="number"
                            min={1}
                            max={100}
                            value={percentageValue}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setPercentageValue(Math.min(100, Math.max(1, val)));
                              setShowPercentagePages(false);
                            }}
                            className="h-11 text-lg font-semibold"
                          />
                          <span className="text-2xl font-bold text-muted-foreground">%</span>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={calculatePercentagePages}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Calculer et visualiser les pages
                      </Button>
                      
                      {showPercentagePages && percentagePages.length > 0 && (
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="page-list" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline">
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4" />
                                <span>Voir et modifier les pages ({percentagePages.length})</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <ScrollArea className="h-48 pr-4">
                                <div className="grid grid-cols-6 gap-2">
                                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                    const isSelected = percentagePages.includes(pageNum);
                                    return (
                                      <Button
                                        key={pageNum}
                                        type="button"
                                        variant={isSelected ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => togglePercentagePage(pageNum)}
                                        className={`h-8 ${isSelected ? 'bg-primary' : ''}`}
                                      >
                                        {pageNum}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </ScrollArea>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                      
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm font-semibold mb-2">Résumé :</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-muted-foreground">
                            • Total de pages : <span className="font-semibold text-foreground">{totalPages}</span>
                          </p>
                          <p className="text-muted-foreground">
                            • Pages calculées : <span className="font-semibold text-foreground">{Math.ceil((totalPages * percentageValue) / 100)}</span> pages ({percentageValue}%)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : restrictionMode === "range" ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Configuration des plages de pages</CardTitle>
                      <CardDescription className="text-xs">
                        Définissez une ou plusieurs plages de pages accessibles
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {pageRanges.map((range, index) => (
                        <div key={index} className="flex gap-3 items-end p-3 border rounded-lg bg-muted/30">
                          <div className="flex-1 space-y-2">
                            <Label className="text-xs font-medium">Début</Label>
                            <Input
                              type="number"
                              min={1}
                              max={totalPages}
                              value={range.start}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                const newRanges = [...pageRanges];
                                newRanges[index].start = Math.min(totalPages, Math.max(1, val));
                                setPageRanges(newRanges);
                              }}
                              className="h-9"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label className="text-xs font-medium">Fin</Label>
                            <Input
                              type="number"
                              min={range.start}
                              max={totalPages}
                              value={range.end}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                const newRanges = [...pageRanges];
                                newRanges[index].end = Math.min(totalPages, Math.max(range.start, val));
                                setPageRanges(newRanges);
                              }}
                              className="h-9"
                            />
                          </div>
                          {pageRanges.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newRanges = pageRanges.filter((_, i) => i !== index);
                                setPageRanges(newRanges);
                              }}
                              className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPageRanges([...pageRanges, { start: 1, end: 10 }])}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une plage
                      </Button>
                      
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">
                          Résumé des pages accessibles :
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {pageRanges.map((range, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {range.start === range.end ? 
                                `Page ${range.start}` : 
                                `Pages ${range.start}-${range.end}`
                              }
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Sélection manuelle des pages</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Numéros de pages (séparés par des virgules)
                        </Label>
                        <Input
                          placeholder="Ex: 1,5,10,15,20"
                          value={manualPages.join(",")}
                          onChange={(e) => {
                            const pages = e.target.value
                              .split(",")
                              .map(p => parseInt(p.trim()))
                              .filter(p => !isNaN(p) && p >= 1 && p <= totalPages);
                            setManualPages(pages);
                          }}
                          className="h-10"
                        />
                      </div>
                      
                      {manualPages.length > 0 && (
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold">
                              {manualPages.length} page(s) accessible(s)
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setManualPages([])}
                              className="h-7 text-xs"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Tout effacer
                            </Button>
                          </div>
                          <ScrollArea className="h-24">
                            <div className="flex flex-wrap gap-2">
                              {manualPages.sort((a, b) => a - b).map((page) => (
                                <Badge 
                                  key={page} 
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors px-3 py-1"
                                  onClick={() => setManualPages(manualPages.filter(p => p !== page))}
                                >
                                  {page}
                                  <X className="h-3 w-3 ml-1.5" />
                                </Badge>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Paramètres de sécurité */}
                <Card className="border-2 border-primary/20">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Paramètres de sécurité</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Contrôlez les actions autorisées pour les utilisateurs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Download className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Téléchargement</Label>
                          <p className="text-xs text-muted-foreground">Autoriser le téléchargement</p>
                        </div>
                      </div>
                      <Switch checked={allowDownload} onCheckedChange={setAllowDownload} />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Camera className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Capture d'écran</Label>
                          <p className="text-xs text-muted-foreground">Autoriser les captures</p>
                        </div>
                      </div>
                      <Switch checked={allowScreenshot} onCheckedChange={setAllowScreenshot} />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <MousePointerClick className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Clic droit</Label>
                          <p className="text-xs text-muted-foreground">Autoriser le menu contextuel</p>
                        </div>
                      </div>
                      <Switch checked={allowRightClick} onCheckedChange={setAllowRightClick} />
                    </div>
                  </CardContent>
                </Card>

                {/* Paramètres de vue */}
                <Card className="border-2 border-blue-200 dark:border-blue-800">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpenCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <CardTitle className="text-base">Paramètres de vue</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Contrôlez les modes d'affichage disponibles dans le lecteur
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <BookOpenCheck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Vue double page</Label>
                          <p className="text-xs text-muted-foreground">Affichage de deux pages côte à côte</p>
                        </div>
                      </div>
                      <Switch checked={allowDoublePageView} onCheckedChange={setAllowDoublePageView} />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <ScrollText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Mode défilement</Label>
                          <p className="text-xs text-muted-foreground">Navigation par défilement vertical</p>
                        </div>
                      </div>
                      <Switch checked={allowScrollView} onCheckedChange={setAllowScrollView} />
                    </div>
                  </CardContent>
                </Card>

                {/* Affichage des pages non accessibles */}
                <Card className="border-2 border-orange-200 dark:border-orange-800">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 pb-3">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <CardTitle className="text-base">Affichage des pages non accessibles</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        type="button"
                        variant={restrictedPageDisplay === "blur" ? "default" : "outline"}
                        onClick={() => setRestrictedPageDisplay("blur")}
                        className="h-auto py-3 flex flex-col items-center gap-2"
                      >
                        <Eye className="h-5 w-5" />
                        <span className="text-xs">Effet flou</span>
                      </Button>
                      
                      <Button
                        type="button"
                        variant={restrictedPageDisplay === "empty" ? "default" : "outline"}
                        onClick={() => setRestrictedPageDisplay("empty")}
                        className="h-auto py-3 flex flex-col items-center gap-2"
                      >
                        <Square className="h-5 w-5" />
                        <span className="text-xs">Page vide</span>
                      </Button>
                      
                      <Button
                        type="button"
                        variant={restrictedPageDisplay === "hidden" ? "default" : "outline"}
                        onClick={() => setRestrictedPageDisplay("hidden")}
                        className="h-auto py-3 flex flex-col items-center gap-2"
                      >
                        <EyeOff className="h-5 w-5" />
                        <span className="text-xs">Masquer</span>
                      </Button>
                    </div>

                    {/* Section Pages manquantes */}
                    <div className="border-t pt-4 mt-4">
                      <Button
                        type="button"
                        variant={showMissingPagesSection ? "default" : "outline"}
                        onClick={() => setShowMissingPagesSection(!showMissingPagesSection)}
                        className="w-full gap-2"
                      >
                        <FileQuestion className="h-4 w-4" />
                        Pages manquantes
                        {missingPages.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {missingPages.length}
                          </Badge>
                        )}
                      </Button>

                      {showMissingPagesSection && (
                        <div className="mt-4 space-y-4 p-4 bg-muted/30 rounded-lg border">
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              Indiquez les pages qui ne sont pas disponibles dans le document numérisé. Ces pages seront signalées aux utilisateurs.
                            </p>
                          </div>

                          {/* Ajout de pages manquantes */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Ajouter une page manquante</Label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                min={1}
                                max={totalPages}
                                value={newMissingPage}
                                onChange={(e) => setNewMissingPage(e.target.value)}
                                placeholder="N° de page"
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddMissingPage();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddMissingPage}
                                disabled={!newMissingPage}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Liste des pages manquantes */}
                          {missingPages.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">Pages manquantes ({missingPages.length})</Label>
                              <div className="flex flex-wrap gap-2">
                                {missingPages.map((page) => (
                                  <Badge
                                    key={page}
                                    variant="secondary"
                                    className="gap-1 pr-1 cursor-pointer hover:bg-destructive/20"
                                    onClick={() => handleRemoveMissingPage(page)}
                                  >
                                    Page {page}
                                    <X className="h-3 w-3" />
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Raison de non-disponibilité */}
                          {missingPages.length > 0 && (
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold">Raison de la non-disponibilité</Label>
                              <Select
                                value={missingPagesReason}
                                onValueChange={setMissingPagesReason}
                              >
                                <SelectTrigger className="w-full bg-background">
                                  <SelectValue placeholder="Sélectionner une raison..." />
                                </SelectTrigger>
                                <SelectContent className="bg-background z-[10001]">
                                  {missingPagesReasons.map((reason) => (
                                    <SelectItem key={reason.value} value={reason.value}>
                                      {reason.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {/* Champ de saisie personnalisé pour "Autre" */}
                              {missingPagesReason === "autre" && (
                                <div className="space-y-2">
                                  <Label className="text-sm">Précisez la raison</Label>
                                  <Textarea
                                    value={missingPagesCustomReason}
                                    onChange={(e) => setMissingPagesCustomReason(e.target.value)}
                                    placeholder="Décrivez la raison de la non-disponibilité des pages..."
                                    className="min-h-[80px] resize-none"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setSelectedDocument(null)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleSaveRestriction} disabled={saveRestriction.isPending} className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                {saveRestriction.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue liste des documents
  return (
    <div className="space-y-8">
      {/* En-tête avec gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-start gap-6">
          <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
            <Lock className="h-10 w-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Restriction d'accès aux pages</h1>
            <p className="text-white/90 text-lg">
              Gérer les restrictions d'accès aux pages pour les utilisateurs non connectés et les comptes publics
            </p>
            <div className="mt-4 flex gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <FileText className="h-3 w-3 mr-1" />
                {documents?.length || 0} documents
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Lock className="h-3 w-3 mr-1" />
                {documents?.filter(d => d.page_access_restrictions?.[0]?.is_restricted).length || 0} restreints
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
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <Label htmlFor="search" className="text-sm font-semibold flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                Rechercher un document
              </Label>
              <Input
                id="search"
                placeholder="Rechercher par titre ou description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="filter-type" className="text-sm font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                Type de contenu
              </Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="filter-type" className="h-11">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="page">Pages</SelectItem>
                  <SelectItem value="news">Actualités</SelectItem>
                  <SelectItem value="event">Événements</SelectItem>
                  <SelectItem value="exhibition">Expositions</SelectItem>
                  <SelectItem value="manuscript">Manuscrits</SelectItem>
                  <SelectItem value="book">Livres</SelectItem>
                  <SelectItem value="rare_book">Livres rares</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="photo">Photos</SelectItem>
                  <SelectItem value="video">Vidéos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="filter-status" className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Statut de restriction
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filter-status" className="h-11">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="restricted">Restreints</SelectItem>
                  <SelectItem value="public">Publics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Résultats:</span>
              <span className="text-foreground font-bold">{filteredDocuments.length} document(s)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des documents */}
      <Card className="shadow-lg">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Documents
          </CardTitle>
          <CardDescription>
            Sélectionnez un document pour configurer ses restrictions d'accès
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Document</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Pages accessibles</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Aucun document trouvé</p>
                        <p className="text-sm">Modifiez vos critères de recherche</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => {
                      const restriction = doc.page_access_restrictions?.[0];
                      
                      return (
                        <TableRow key={doc.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium line-clamp-1">{doc.title}</p>
                                {doc.excerpt && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{doc.excerpt}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-medium">
                                {(doc.content_type as string) === 'rare_book' ? 'Livre rare' : doc.content_type}
                              </Badge>
                              {(doc.content_type as string) === 'rare_book' && (
                                <Sparkles className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {restriction?.is_restricted ? (
                              <Badge variant="destructive" className="gap-1.5 px-3 py-1">
                                <Lock className="h-3 w-3" />
                                Restreint
                              </Badge>
                            ) : (
                              <Badge className="gap-1.5 px-3 py-1 bg-green-500 hover:bg-green-600">
                                <Unlock className="h-3 w-3" />
                                Public
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {restriction?.is_restricted ? (
                              <span className="text-sm font-medium">{restriction.manual_pages?.length || 0} pages</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Aucune restriction</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditDocument(doc)}
                                className="gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Configurer
                              </Button>
                              {restriction && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveRestriction(doc)}
                                  className="hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer la restriction d'accès pour "{documentToDelete?.title}" ? 
              Le document deviendra entièrement public.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => documentToDelete && deleteRestriction.mutate(documentToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
