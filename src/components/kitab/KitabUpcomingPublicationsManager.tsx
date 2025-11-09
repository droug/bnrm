import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eye, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpcomingPublication {
  id: string;
  titre: string;
  soustitre?: string;
  auteur: string;
  editeur: string;
  type: string;
  isbn?: string;
  issn?: string;
  ismn?: string;
  date_parution?: string;
  status: string;
  numero_depot?: string;
  langue?: string;
  nombre_pages?: number;
  metadata?: any;
}

export function KitabUpcomingPublicationsManager() {
  const [publications, setPublications] = useState<UpcomingPublication[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<UpcomingPublication | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const { toast } = useToast();

  const loadPublications = async () => {
    try {
      setLoading(true);
      
      // Charger les publications approuvées avec le statut "upcoming" (à paraître)
      const { data, error } = await supabase
        .from('legal_deposit_requests')
        .select('*')
        .eq('kitab_status', 'approved')
        .eq('publication_status', 'upcoming')
        .order('publication_date', { ascending: true });

      if (error) throw error;

      // Mapper les données au format attendu
      const mappedPublications: UpcomingPublication[] = (data || []).map(pub => ({
        id: pub.id,
        titre: pub.title,
        soustitre: pub.subtitle,
        auteur: pub.author_name || 'Auteur inconnu',
        editeur: (pub.metadata as any)?.publisher || 'Éditeur non spécifié',
        type: pub.support_type,
        isbn: pub.isbn,
        issn: pub.issn,
        ismn: pub.ismn,
        date_parution: pub.publication_date,
        status: pub.kitab_status,
        numero_depot: pub.dl_number,
        langue: pub.language,
        nombre_pages: pub.page_count,
        metadata: pub.metadata
      }));

      setPublications(mappedPublications);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les publications à paraître",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, []);

  const handlePreview = (publication: UpcomingPublication) => {
    setSelectedPublication(publication);
    setPreviewDialogOpen(true);
  };

  const handleMarkAsPublished = async (publicationId: string) => {
    try {
      const { error } = await supabase
        .from('legal_deposit_requests')
        .update({ 
          publication_status: 'published',
          publication_date: new Date().toISOString().split('T')[0]
        } as any)
        .eq('id', publicationId);

      if (error) throw error;

      toast({
        title: "Publication marquée comme publiée",
        description: "La publication a été déplacée vers les nouvelles parutions.",
      });

      loadPublications();
    } catch (error) {
      console.error('Error updating publication:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la publication",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (publicationId: string) => {
    try {
      const { error } = await supabase
        .from('legal_deposit_requests')
        .update({ kitab_status: 'rejected' } as any)
        .eq('id', publicationId);

      if (error) throw error;

      toast({
        title: "Publication rejetée",
        description: "La publication a été retirée de Kitab.",
        variant: "destructive",
      });

      loadPublications();
    } catch (error) {
      console.error('Error rejecting publication:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la publication",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Publications avec le statut "À paraître"
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={loadPublications}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {publications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune publication à paraître pour le moment
          </div>
        ) : (
          <div className="divide-y divide-border">
            {publications.map((pub) => (
              <div key={pub.id} className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-kitab-primary">{pub.titre}</h3>
                    {pub.soustitre && (
                      <p className="text-sm text-muted-foreground italic">{pub.soustitre}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                      {pub.auteur && <span>Auteur: {pub.auteur}</span>}
                      {pub.editeur && <span>• Éditeur: {pub.editeur}</span>}
                      {pub.type && <span>• Type: {pub.type}</span>}
                      {pub.langue && <span>• Langue: {pub.langue}</span>}
                    </div>
                    {(pub.isbn || pub.issn) && (
                      <div className="flex gap-2 mt-2 text-xs">
                        {pub.isbn && (
                          <span className="px-2 py-1 rounded bg-kitab-primary/10 text-kitab-primary font-medium">
                            ISBN: {pub.isbn}
                          </span>
                        )}
                        {pub.issn && (
                          <span className="px-2 py-1 rounded bg-kitab-secondary/10 text-kitab-secondary font-medium">
                            ISSN: {pub.issn}
                          </span>
                        )}
                      </div>
                    )}
                     {pub.date_parution && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-kitab-accent">
                          <span className="text-base">📅</span>
                          Date de parution prévue: {new Date(pub.date_parution).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                    {pub.nombre_pages && (
                      <div className="text-xs text-muted-foreground text-right">
                        {pub.nombre_pages} pages
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(pub)}
                        className="border-kitab-primary/30 hover:bg-kitab-primary/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsPublished(pub.id)}
                        className="border-green-500/30 hover:bg-green-500/10 text-green-600"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(pub.id)}
                        className="border-red-500/30 hover:bg-red-500/10 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Total: {publications.length} publication(s) à paraître
      </div>

      {/* Dialog de prévisualisation */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-kitab-primary">
              {selectedPublication?.titre}
            </DialogTitle>
            {selectedPublication?.soustitre && (
              <DialogDescription className="text-base italic">
                {selectedPublication.soustitre}
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedPublication && (
            <div className="space-y-6 mt-4">
              {/* Informations principales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Auteur</h4>
                  <p className="text-base">{selectedPublication.auteur}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Éditeur</h4>
                  <p className="text-base">{selectedPublication.editeur}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Type</h4>
                  <p className="text-base">{selectedPublication.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">Langue</h4>
                  <p className="text-base">{selectedPublication.langue || 'Non spécifiée'}</p>
                </div>
                {selectedPublication.nombre_pages && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Nombre de pages</h4>
                    <p className="text-base">{selectedPublication.nombre_pages}</p>
                  </div>
                )}
                {selectedPublication.date_parution && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Date de parution prévue</h4>
                    <p className="text-base text-kitab-accent font-medium">
                      {new Date(selectedPublication.date_parution).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Identifiants */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Identifiants</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPublication.isbn && (
                    <span className="px-3 py-1 rounded-lg bg-kitab-primary/10 text-kitab-primary font-medium">
                      ISBN: {selectedPublication.isbn}
                    </span>
                  )}
                  {selectedPublication.issn && (
                    <span className="px-3 py-1 rounded-lg bg-kitab-secondary/10 text-kitab-secondary font-medium">
                      ISSN: {selectedPublication.issn}
                    </span>
                  )}
                  {selectedPublication.ismn && (
                    <span className="px-3 py-1 rounded-lg bg-kitab-accent/10 text-kitab-accent font-medium">
                      ISMN: {selectedPublication.ismn}
                    </span>
                  )}
                  {selectedPublication.numero_depot && (
                    <span className="px-3 py-1 rounded-lg bg-muted text-foreground font-medium">
                      Dépôt Légal: {selectedPublication.numero_depot}
                    </span>
                  )}
                </div>
              </div>

              {/* Métadonnées supplémentaires */}
              {selectedPublication.metadata && Object.keys(selectedPublication.metadata).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Métadonnées supplémentaires</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    {Object.entries(selectedPublication.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-sm text-muted-foreground">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    handleMarkAsPublished(selectedPublication.id);
                    setPreviewDialogOpen(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Marquer comme publié
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleReject(selectedPublication.id);
                    setPreviewDialogOpen(false);
                  }}
                  className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Retirer de Kitab
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
