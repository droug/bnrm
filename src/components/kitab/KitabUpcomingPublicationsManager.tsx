import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function KitabUpcomingPublicationsManager() {
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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
      const mappedPublications = (data || []).map(pub => ({
        id: pub.id,
        titre: pub.title,
        soustitre: pub.subtitle,
        auteur: pub.author_name || 'Auteur inconnu',
        editeur: (pub.metadata as any)?.publisher || 'Éditeur non spécifié',
        type: pub.support_type,
        isbn: pub.isbn,
        issn: pub.issn,
        date_parution: pub.publication_date,
        status: pub.kitab_status,
        numero_depot: pub.dl_number,
        langue: pub.language,
        nombre_pages: pub.page_count
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
                  {pub.nombre_pages && (
                    <div className="text-xs text-muted-foreground ml-4 flex-shrink-0">
                      {pub.nombre_pages} pages
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Total: {publications.length} publication(s) à paraître
      </div>
    </div>
  );
}
