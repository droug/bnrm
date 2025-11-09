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
                <h3 className="font-semibold text-lg">{pub.titre}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {pub.auteur} • {pub.editeur}
                </p>
                {pub.date_parution && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Date de parution prévue: {new Date(pub.date_parution).toLocaleDateString('fr-FR')}
                  </p>
                )}
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
