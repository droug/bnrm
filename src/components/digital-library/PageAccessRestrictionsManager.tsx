import { useState } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Unlock, Edit, Save, X, BookOpen, FileText } from "lucide-react";

export function PageAccessRestrictionsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // État du formulaire
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionMode, setRestrictionMode] = useState<"range" | "manual">("range");
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(10);
  const [manualPages, setManualPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(245);

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

  // Mutation pour créer ou mettre à jour une restriction
  const saveRestriction = useMutation({
    mutationFn: async (data: any) => {
      const restrictionData = {
        content_id: selectedDocument.id,
        is_restricted: data.isRestricted,
        restriction_mode: data.restrictionMode,
        start_page: data.startPage,
        end_page: data.endPage,
        manual_pages: data.manualPages,
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
      setStartPage(restriction.start_page);
      setEndPage(restriction.end_page);
      setManualPages(restriction.manual_pages || []);
    } else {
      setIsRestricted(false);
      setRestrictionMode("range");
      setStartPage(1);
      setEndPage(10);
      setManualPages([]);
    }
    
    setShowEditDialog(true);
  };

  const handleSaveRestriction = () => {
    saveRestriction.mutate({
      isRestricted,
      restrictionMode,
      startPage,
      endPage,
      manualPages,
    });
  };

  const handleRemoveRestriction = (doc: any) => {
    if (confirm("Voulez-vous vraiment supprimer la restriction d'accès pour ce document ?")) {
      deleteRestriction.mutate(doc.id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle>Restriction d'accès aux pages</CardTitle>
              <CardDescription>
                Gérer les restrictions d'accès aux pages pour les utilisateurs non connectés et les comptes publics
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Chargement...</p>
          ) : (
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
                {documents?.map((doc) => {
                  const restriction = doc.page_access_restrictions?.[0];
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.content_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {restriction?.is_restricted ? (
                          <Badge variant="destructive" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Restreint
                          </Badge>
                        ) : (
                          <Badge variant="default" className="gap-1">
                            <Unlock className="h-3 w-3" />
                            Public
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {restriction?.is_restricted ? (
                          restriction.restriction_mode === 'range' ? (
                            `Pages ${restriction.start_page}-${restriction.end_page}`
                          ) : (
                            `${restriction.manual_pages?.length || 0} pages sélectionnées`
                          )
                        ) : (
                          'Aucune restriction'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditDocument(doc)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Configurer
                          </Button>
                          {restriction && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveRestriction(doc)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Configuration des restrictions - {selectedDocument?.title}
            </DialogTitle>
            <DialogDescription>
              Définir les pages accessibles aux utilisateurs non authentifiés
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Activer/Désactiver la restriction */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-semibold">Activer la restriction</Label>
                <p className="text-sm text-muted-foreground">
                  Limiter l'accès aux pages pour les visiteurs non connectés
                </p>
              </div>
              <Switch
                checked={isRestricted}
                onCheckedChange={setIsRestricted}
              />
            </div>

            {isRestricted && (
              <>
                {/* Mode de restriction */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Mode de restriction</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={restrictionMode === "range" ? "default" : "outline"}
                      onClick={() => setRestrictionMode("range")}
                      className="h-auto py-4 flex-col gap-2"
                    >
                      <BookOpen className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-semibold">Plage de pages</div>
                        <div className="text-xs opacity-80">Définir début et fin</div>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant={restrictionMode === "manual" ? "default" : "outline"}
                      onClick={() => setRestrictionMode("manual")}
                      className="h-auto py-4 flex-col gap-2"
                    >
                      <FileText className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-semibold">Sélection manuelle</div>
                        <div className="text-xs opacity-80">Choisir page par page</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Configuration selon le mode */}
                {restrictionMode === "range" ? (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-page">Page de début</Label>
                        <Input
                          id="start-page"
                          type="number"
                          min={1}
                          max={totalPages}
                          value={startPage}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setStartPage(Math.min(totalPages, Math.max(1, val)));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-page">Page de fin</Label>
                        <Input
                          id="end-page"
                          type="number"
                          min={startPage}
                          max={totalPages}
                          value={endPage}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setEndPage(Math.min(totalPages, Math.max(startPage, val)));
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Les utilisateurs non connectés pourront voir les pages {startPage} à {endPage}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-2">
                      <Label>Pages accessibles (séparées par des virgules)</Label>
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
                      />
                    </div>
                    
                    <Accordion type="single" collapsible>
                      <AccordionItem value="grid">
                        <AccordionTrigger>
                          Sélectionner visuellement ({manualPages.length} pages)
                        </AccordionTrigger>
                        <AccordionContent>
                          <ScrollArea className="h-64 border rounded-md p-3">
                            <div className="grid grid-cols-8 gap-2">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                  key={page}
                                  size="sm"
                                  variant={manualPages.includes(page) ? "default" : "outline"}
                                  onClick={() => {
                                    if (manualPages.includes(page)) {
                                      setManualPages(manualPages.filter(p => p !== page));
                                    } else {
                                      setManualPages([...manualPages, page].sort((a, b) => a - b));
                                    }
                                  }}
                                  className="h-8 w-full text-xs p-0"
                                >
                                  {page}
                                </Button>
                              ))}
                            </div>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {manualPages.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Pages sélectionnées: {manualPages.sort((a, b) => a - b).join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveRestriction} disabled={saveRestriction.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}