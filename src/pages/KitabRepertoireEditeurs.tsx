import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Book, MapPin, Mail, Phone, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Publisher {
  id: string;
  company_name: string;
  city: string | null;
  email: string | null;
  phone: string | null;
  contact_person: string | null;
  is_verified: boolean;
}

const KitabRepertoireEditeurs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editeurs, setEditeurs] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    try {
      setLoading(true);
      
      // Récupérer uniquement les éditeurs de type "Personne morale" depuis professional_registry
      // Pour l'instant, tous les éditeurs dans cette table sont considérés comme personne morale
      const { data, error } = await supabase
        .from('professional_registry')
        .select('*')
        .eq('professional_type', 'editeur')
        .eq('is_verified', true)
        .order('company_name');

      if (error) {
        console.error('Erreur lors du chargement des éditeurs:', error);
        toast.error('Erreur lors du chargement des éditeurs');
        return;
      }

      setEditeurs(data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const filteredEditeurs = editeurs.filter(editeur =>
    editeur.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (editeur.city && editeur.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-[hsl(var(--kitab-accent))]/5 to-background">
      <KitabHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* En-tête */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--kitab-primary))]/10 border border-[hsl(var(--kitab-primary))]/20 mb-4">
            <Building2 className="h-5 w-5 text-[hsl(var(--kitab-primary))]" />
            <span className="text-sm font-medium text-[hsl(var(--kitab-primary))]">Programme Kitab BNRM</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[hsl(var(--kitab-primary))] to-[hsl(var(--kitab-accent))] bg-clip-text text-transparent">
            Répertoire des Éditeurs
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tous les éditeurs (Personne morale) ayant rejoint le programme Kitab de la BNRM
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-12">
          <Input
            type="search"
            placeholder="Rechercher un éditeur par nom ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 text-lg"
          />
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-[hsl(var(--kitab-primary))]/20">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">{editeurs.length}</div>
                <div className="text-sm text-muted-foreground">Éditeurs Inscrits (Personne morale)</div>
              </CardContent>
            </Card>
            <Card className="border-[hsl(var(--kitab-primary))]/20">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">
                  {editeurs.filter(e => e.is_verified).length}
                </div>
                <div className="text-sm text-muted-foreground">Éditeurs Vérifiés</div>
              </CardContent>
            </Card>
            <Card className="border-[hsl(var(--kitab-primary))]/20">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-[hsl(var(--kitab-primary))] mb-2">
                  {new Set(editeurs.filter(e => e.city).map(e => e.city)).size}
                </div>
                <div className="text-sm text-muted-foreground">Villes Représentées</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* État de chargement */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--kitab-primary))]" />
          </div>
        )}

        {/* Liste des éditeurs */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEditeurs.map((editeur) => (
                <Card key={editeur.id} className="group hover:shadow-xl transition-all duration-300 border-[hsl(var(--kitab-primary))]/20 hover:border-[hsl(var(--kitab-primary))]/40">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-3 rounded-lg bg-[hsl(var(--kitab-primary))]/10 group-hover:bg-[hsl(var(--kitab-primary))]/20 transition-colors">
                        <Building2 className="h-6 w-6 text-[hsl(var(--kitab-primary))]" />
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                        Personne morale
                      </span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-[hsl(var(--kitab-primary))] transition-colors">
                      {editeur.company_name}
                    </CardTitle>
                    {editeur.city && (
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {editeur.city}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      {editeur.contact_person && (
                        <div className="text-muted-foreground">
                          <strong>Contact:</strong> {editeur.contact_person}
                        </div>
                      )}
                      {editeur.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {editeur.email}
                        </div>
                      )}
                      {editeur.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {editeur.phone}
                        </div>
                      )}
                    </div>
                    
                    <Button className="w-full bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary))]/90 gap-2">
                      <Book className="h-4 w-4" />
                      Voir le profil
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredEditeurs.length === 0 && !loading && (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Aucun éditeur (Personne morale) trouvé</p>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default KitabRepertoireEditeurs;