import { useState, useEffect } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StickyNote, Search, Download, Trash2, BookOpen, Calendar, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function MyNotes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadNotes();
  }, [user, navigate]);

  const loadNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_bookmarks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Use mock data if no real data exists
      setNotes(data && data.length > 0 ? data : [
        {
          id: "note-1",
          page_number: 45,
          note: "Concept fondamental de la civilisation et de l'organisation sociale selon Ibn Khaldoun. À approfondir pour la recherche sur les structures sociales médiévales.",
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: user.id,
          content_id: null,
          manuscript_id: "demo-1",
        },
        {
          id: "note-2",
          page_number: 78,
          note: "Analyse intéressante sur les cycles dynastiques. Lien possible avec les théories modernes de sociologie et d'anthropologie.",
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: user.id,
          content_id: null,
          manuscript_id: "demo-1",
        },
        {
          id: "note-3",
          page_number: 123,
          note: "Description détaillée de Tombouctou au XIVe siècle. Source primaire importante pour l'histoire de l'Afrique de l'Ouest.",
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: user.id,
          content_id: null,
          manuscript_id: "demo-2",
        },
        {
          id: "note-4",
          page_number: 56,
          note: "Dates importantes de l'indépendance à vérifier avec d'autres sources historiques.",
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: user.id,
          content_id: "demo-3",
          manuscript_id: null,
        },
        {
          id: "note-5",
          page_number: 89,
          note: null,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: user.id,
          content_id: null,
          manuscript_id: "demo-2",
        },
      ]);
    } catch (error: any) {
      console.error("Error loading notes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos annotations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_bookmarks")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setNotes(notes.filter(note => note.id !== id));
      toast({
        title: "Annotation supprimée",
        description: "L'annotation a été supprimée avec succès",
      });
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annotation",
        variant: "destructive",
      });
    }
  };

  const handleExportNotes = () => {
    const exportData = filteredNotes.map(note => ({
      Page: note.page_number,
      Note: note.note || "",
      Date: new Date(note.created_at).toLocaleDateString('fr-FR'),
    }));

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mes-annotations.csv';
    a.click();

    toast({
      title: "Export réussi",
      description: `${filteredNotes.length} note(s) exportée(s) en CSV`,
    });
  };

  if (!user) return null;

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return note.note?.toLowerCase().includes(searchLower);
  });

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mes Annotations</h1>
          <p className="text-lg text-muted-foreground">
            Gérez et exportez toutes vos notes et annotations de lecture
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total annotations</p>
                  <p className="text-3xl font-bold mt-1">{notes.length}</p>
                </div>
                <StickyNote className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Ce mois-ci</div>
              <div className="text-3xl font-bold mt-1">
                {notes.filter(n => new Date(n.created_at).getMonth() === new Date().getMonth()).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Avec notes</div>
              <div className="text-3xl font-bold mt-1">
                {notes.filter(n => n.note).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Rechercher
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans vos notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleExportNotes} variant="outline" disabled={filteredNotes.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exporter ({filteredNotes.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notes List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des annotations</CardTitle>
            <CardDescription>
              {filteredNotes.length} annotation(s) {searchQuery ? "trouvée(s)" : "au total"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Chargement...</p>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "Aucune annotation trouvée avec ces critères"
                    : "Vous n'avez pas encore d'annotations"
                  }
                </p>
                {!searchQuery && (
                  <Button className="mt-4" onClick={() => navigate("/digital-library")}>
                    Parcourir la bibliothèque
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>Signet</Badge>
                          <span className="text-sm text-muted-foreground">
                            Page {note.page_number}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {note.note && (
                      <div className="bg-accent/30 p-3 rounded-lg mb-3">
                        <p className="text-sm">{note.note}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm">Comment utiliser les annotations</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Annotez directement depuis le lecteur de documents</p>
            <p>• Exportez vos annotations en CSV pour les utiliser dans d'autres applications</p>
            <p>• Les annotations sont privées et synchronisées automatiquement</p>
          </CardContent>
        </Card>
      </div>
    </DigitalLibraryLayout>
  );
}
