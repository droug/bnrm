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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Unlock, Edit, Save, X, BookOpen, FileText, Search, Filter, Eye, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { PageFlipBook } from "@/components/book-reader/PageFlipBook";

export function PageAccessRestrictionsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
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
  const [totalPages, setTotalPages] = useState(245);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1);
  const [viewMode, setViewMode] = useState<"single" | "double">("single");
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

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
        .in('content_type', ['page', 'news'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Filtrer les documents
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    
    return documents.filter((doc) => {
      // Filtre par recherche textuelle
      const matchesSearch = searchQuery === "" || 
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtre par type
      const matchesType = filterType === "all" || doc.content_type === filterType;
      
      // Filtre par statut de restriction
      const restriction = doc.page_access_restrictions?.[0];
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "restricted" && restriction?.is_restricted) ||
        (filterStatus === "public" && (!restriction || !restriction.is_restricted));
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, searchQuery, filterType, filterStatus]);

  // Mutation pour créer ou mettre à jour une restriction
  const saveRestriction = useMutation({
    mutationFn: async (data: any) => {
      // Convertir les plages en tableau de pages
      let allowedPages: number[] = [];
      
      if (data.restrictionMode === 'range') {
        // Fusionner toutes les plages
        data.pageRanges.forEach((range: {start: number, end: number}) => {
          for (let i = range.start; i <= range.end; i++) {
            if (!allowedPages.includes(i)) {
              allowedPages.push(i);
            }
          }
        });
        allowedPages.sort((a, b) => a - b);
      } else if (data.restrictionMode === 'percentage') {
        // Calculer le nombre de pages selon le pourcentage
        const numPages = Math.ceil((totalPages * data.percentageValue) / 100);
        // Autoriser les premières pages (ou ajuster selon besoin)
        for (let i = 1; i <= numPages; i++) {
          allowedPages.push(i);
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
      setShowEditDialog(false);
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
    }
  });

  const handleEditDocument = (doc: any) => {
    setSelectedDocument(doc);
    const restriction = doc.page_access_restrictions?.[0];
    
    if (restriction) {
      setIsRestricted(restriction.is_restricted);
      setRestrictionMode(restriction.restriction_mode);
      
      // Reconstruire les plages à partir des pages manuelles
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
      
      // Calculer le pourcentage si c'est le mode percentage
      if (restriction.restriction_mode === 'percentage' && restriction.manual_pages?.length > 0) {
        const percentage = Math.round((restriction.manual_pages.length / totalPages) * 100);
        setPercentageValue(percentage);
      }
    } else {
      setIsRestricted(false);
      setRestrictionMode("range");
      setPageRanges([{start: 1, end: 10}]);
      setManualPages([]);
      setPercentageValue(10);
    }
    
    setCurrentPreviewPage(1);
    setViewMode("single");
    setZoom(100);
    setRotation(0);
    setShowEditDialog(true);
  };

  // Obtenir l'image de la page actuelle pour la preview
  const getCurrentPageImage = (page: number) => {
    return selectedDocument?.file_url || "/placeholder.svg";
  };

  // Générer les images pour le flip book
  const generatePageImages = () => {
    const images = [];
    for (let i = 0; i < totalPages; i++) {
      images.push(selectedDocument?.file_url || "/placeholder.svg");
    }
    return images;
  };

  const handleSaveRestriction = () => {
    saveRestriction.mutate({
      isRestricted,
      restrictionMode,
      pageRanges,
      manualPages,
      percentageValue,
    });
  };

  const handleRemoveRestriction = (doc: any) => {
    if (confirm("Voulez-vous vraiment supprimer la restriction d'accès pour ce document ?")) {
      deleteRestriction.mutate(doc.id);
    }
  };

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
                  <SelectItem value="restricted">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-destructive" />
                      Restreints
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Unlock className="h-4 w-4 text-green-600" />
                      Publics
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Résultats */}
          <div className="mt-6 flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Résultats: 
              </span>
              <span className="text-foreground font-bold">
                {filteredDocuments.length} document(s)
              </span>
            </div>
            {(searchQuery || filterType !== "all" || filterStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                  setFilterStatus("all");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des documents */}
      <Card className="shadow-lg">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Documents de la bibliothèque
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Chargement des documents...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Restriction</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="rounded-full bg-muted p-6">
                            <Search className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-lg font-medium">Aucun document trouvé</p>
                            <p className="text-sm text-muted-foreground">
                              Essayez de modifier vos critères de recherche
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => {
                      const restriction = doc.page_access_restrictions?.[0];
                      return (
                        <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">{doc.title}</p>
                                {doc.excerpt && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {doc.excerpt}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              {doc.content_type}
                            </Badge>
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
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  {restriction.restriction_mode === 'range' ? (
                                    <BookOpen className="h-4 w-4 text-primary" />
                                  ) : (
                                    <FileText className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <div className="text-sm">
                                  {restriction.restriction_mode === 'range' ? (
                                    <span className="font-medium">
                                      {restriction.manual_pages?.length || 0} pages
                                    </span>
                                  ) : (
                                    <span className="font-medium">
                                      {restriction.manual_pages?.length || 0} pages
                                    </span>
                                  )}
                                </div>
                              </div>
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

      {/* Dialog d'édition */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              Configuration des restrictions - {selectedDocument?.title}
            </DialogTitle>
            <DialogDescription className="text-base">
              Définir les pages accessibles aux utilisateurs non authentifiés
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex gap-6 py-6">
            {/* Prévisualisation de l'ouvrage - Style BookReader */}
            <div className="flex-1 flex flex-col gap-4">
              <Card className="flex-1 flex flex-col overflow-hidden shadow-xl">
                <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background shadow-sm">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Prévisualisation de l'ouvrage</CardTitle>
                        <CardDescription className="text-xs">
                          Naviguez et sélectionnez les pages accessibles
                        </CardDescription>
                      </div>
                    </div>
                    
                    {/* Navigation des pages */}
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPreviewPage(Math.max(1, currentPreviewPage - 1))}
                        disabled={currentPreviewPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg shadow-sm border">
                        <Input
                          type="number"
                          value={currentPreviewPage}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setCurrentPreviewPage(Math.min(totalPages, Math.max(1, val)));
                          }}
                          className="w-16 text-center h-8"
                        />
                        <span className="text-sm font-medium text-muted-foreground">/ {totalPages}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPreviewPage(Math.min(totalPages, currentPreviewPage + 1))}
                        disabled={currentPreviewPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-0 bg-muted/30 relative overflow-hidden">
                  {/* Image de la page - Style BookReader */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    {viewMode === "double" ? (
                      <PageFlipBook 
                        images={generatePageImages()}
                        currentPage={currentPreviewPage}
                        onPageChange={setCurrentPreviewPage}
                        zoom={zoom}
                        rotation={rotation}
                      />
                    ) : (
                      <Card className="max-w-4xl w-full shadow-2xl">
                        <CardContent className="p-0 relative">
                          <div 
                            className="aspect-[3/4] bg-gradient-to-br from-background to-muted flex items-center justify-center overflow-hidden rounded-lg"
                            style={{ 
                              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                              transformOrigin: 'center',
                              transition: 'transform 0.3s ease'
                            }}
                          >
                            <img 
                              src={getCurrentPageImage(currentPreviewPage)}
                              alt={`Page ${currentPreviewPage}`}
                              className="w-full h-full object-contain"
                            />
                            
                            {/* Badge de sélection */}
                            {restrictionMode === 'manual' && manualPages.includes(currentPreviewPage) && (
                              <Badge className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-white text-base px-4 py-2 shadow-lg">
                                <Lock className="h-4 w-4 mr-2" />
                                Page accessible
                              </Badge>
                            )}
                            
                            {/* Numéro de page */}
                            <Badge className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 shadow-lg">
                              Page {currentPreviewPage}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {/* Contrôles de vue */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                      size="sm"
                      variant={viewMode === "single" ? "default" : "outline"}
                      onClick={() => setViewMode("single")}
                      className="shadow-lg"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Simple
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "double" ? "default" : "outline"}
                      onClick={() => setViewMode("double")}
                      className="shadow-lg"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Double
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Actions rapides sur la page courante */}
              {restrictionMode === 'manual' && (
                <Card className="shadow-md">
                  <CardContent className="p-4">
                    <Button
                      className="w-full h-12 text-base"
                      variant={manualPages.includes(currentPreviewPage) ? "destructive" : "default"}
                      onClick={() => {
                        if (manualPages.includes(currentPreviewPage)) {
                          setManualPages(manualPages.filter(p => p !== currentPreviewPage));
                          toast({ 
                            title: "Page retirée", 
                            description: `La page ${currentPreviewPage} ne sera plus accessible` 
                          });
                        } else {
                          setManualPages([...manualPages, currentPreviewPage].sort((a, b) => a - b));
                          toast({ 
                            title: "Page ajoutée", 
                            description: `La page ${currentPreviewPage} sera accessible` 
                          });
                        }
                      }}
                    >
                      {manualPages.includes(currentPreviewPage) ? (
                        <>
                          <Unlock className="h-5 w-5 mr-2" />
                          Retirer l'accès à cette page
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Autoriser l'accès à cette page
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Panneau de configuration - Droite */}
            <div className="w-96 space-y-6 overflow-y-auto pr-2">
              {/* Activer/Désactiver la restriction */}
              <Card className="shadow-md">
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
                  {/* Mode de restriction */}
                  <Card className="shadow-md">
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

                  {/* Configuration selon le mode */}
                  {restrictionMode === "percentage" ? (
                    <Card className="shadow-md">
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
                              }}
                              className="h-11 text-lg font-semibold"
                            />
                            <span className="text-2xl font-bold text-muted-foreground">%</span>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <p className="text-sm font-semibold mb-2">Résumé :</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-muted-foreground">
                              • Total de pages : <span className="font-semibold text-foreground">{totalPages}</span>
                            </p>
                            <p className="text-muted-foreground">
                              • Pourcentage autorisé : <span className="font-semibold text-foreground">{percentageValue}%</span>
                            </p>
                            <p className="text-muted-foreground">
                              • Pages accessibles : <span className="font-semibold text-foreground">{Math.ceil((totalPages * percentageValue) / 100)}</span> pages
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              (Les {Math.ceil((totalPages * percentageValue) / 100)} premières pages de l'œuvre)
                            </p>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-900 dark:text-blue-100">
                            💡 <strong>Exemples :</strong>
                            <br />• 10% = {Math.ceil((totalPages * 10) / 100)} pages
                            <br />• 25% = {Math.ceil((totalPages * 25) / 100)} pages
                            <br />• 50% = {Math.ceil((totalPages * 50) / 100)} pages
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : restrictionMode === "range" ? (
                    <Card className="shadow-md">
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
                              <Label htmlFor={`start-page-${index}`} className="text-xs font-medium">
                                Début
                              </Label>
                              <Input
                                id={`start-page-${index}`}
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
                              <Label htmlFor={`end-page-${index}`} className="text-xs font-medium">
                                Fin
                              </Label>
                              <Input
                                id={`end-page-${index}`}
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
                          onClick={() => {
                            setPageRanges([...pageRanges, { start: 1, end: 10 }]);
                          }}
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
                        
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-900 dark:text-blue-100">
                            💡 <strong>Exemples :</strong>
                            <br />• Les 10 premières pages : 1-10
                            <br />• Les 10 dernières pages : {totalPages - 9}-{totalPages}
                            <br />• Pages 5-15 + dernières : Ajoutez deux plages
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="shadow-md">
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
                            <ScrollArea className="h-32">
                              <div className="flex flex-wrap gap-2">
                                {manualPages.sort((a, b) => a - b).map((page) => (
                                  <Badge 
                                    key={page} 
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors px-3 py-1"
                                    onClick={() => {
                                      setManualPages(manualPages.filter(p => p !== page));
                                      if (currentPreviewPage === page) {
                                        toast({ 
                                          title: "Page retirée", 
                                          description: `La page ${page} ne sera plus accessible` 
                                        });
                                      }
                                    }}
                                  >
                                    {page}
                                    <X className="h-3 w-3 ml-1.5" />
                                  </Badge>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        )}
                        
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-blue-900 dark:text-blue-100">
                            💡 <strong>Astuce :</strong> Naviguez dans la prévisualisation et cliquez sur le bouton pour ajouter/retirer l'accès page par page
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="h-10">
              Annuler
            </Button>
            <Button onClick={handleSaveRestriction} disabled={saveRestriction.isPending} className="h-10 gap-2">
              <Save className="h-4 w-4" />
              {saveRestriction.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}