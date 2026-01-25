import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Annotation {
  id: string;
  document_id: string;
  document_title: string;
  page_number: number | null;
  content: string;
  highlight_color: string | null;
  created_at: string;
}

export function MySpaceAnnotations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadAnnotations();
  }, [user]);

  const loadAnnotations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mock data - In a real implementation, query a user_annotations table
      const mockAnnotations: Annotation[] = [
        {
          id: "1",
          document_id: "doc-1",
          document_title: "Al-Muqaddima (Les Prolégomènes)",
          page_number: 42,
          content: "L'histoire est une discipline qui a pour objet l'étude des sociétés humaines et des civilisations passées.",
          highlight_color: "yellow",
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          document_id: "doc-2",
          document_title: "Rihla (Voyages)",
          page_number: 156,
          content: "À mon arrivée à Tanger, je fus frappé par la beauté de la médina et la richesse de son patrimoine architectural.",
          highlight_color: "green",
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          document_id: "doc-1",
          document_title: "Al-Muqaddima (Les Prolégomènes)",
          page_number: 78,
          content: "La civilisation (umran) se développe dans les villes grâce au commerce et à l'artisanat.",
          highlight_color: "blue",
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          document_id: "doc-3",
          document_title: "Kitab al-Shifa",
          page_number: 23,
          content: "La médecine est l'art de maintenir la santé et de la rétablir lorsqu'elle est perdue.",
          highlight_color: "pink",
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setAnnotations(mockAnnotations);
    } catch (error: any) {
      console.error("Error loading annotations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos annotations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      // Mock delete - In real implementation, delete from database
      setAnnotations(annotations.filter(a => a.id !== deleteId));
      toast({
        title: "Annotation supprimée",
        description: "L'annotation a été supprimée avec succès",
      });
    } catch (error: any) {
      console.error("Error deleting annotation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annotation",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleGoToDocument = (annotation: Annotation) => {
    navigate(`/digital-library/book-reader/${annotation.document_id}${annotation.page_number ? `?page=${annotation.page_number}` : ''}`);
  };

  const getColorClass = (color: string | null) => {
    switch (color) {
      case "yellow": return "bg-yellow-50 border-yellow-300";
      case "green": return "bg-emerald-50 border-emerald-300";
      case "blue": return "bg-blue-50 border-blue-300";
      case "pink": return "bg-pink-50 border-pink-300";
      case "purple": return "bg-purple-50 border-purple-300";
      default: return "bg-muted border-border";
    }
  };

  const filteredAnnotations = annotations.filter(
    (a) =>
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.document_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border-bn-blue-primary/10">
      <CardHeader className="bg-gradient-to-r from-bn-blue-primary/5 to-gold-bn-primary/5">
        <CardTitle className="flex items-center gap-3 text-bn-blue-primary">
          <div className="p-2 rounded-lg bg-amber-100">
            <Icon icon="mdi:note-text" className="h-5 w-5 text-amber-600" />
          </div>
          Mes Annotations
        </CardTitle>
        <CardDescription>Vos notes et surlignages dans les documents consultés</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Stats */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:note-multiple" className="h-6 w-6 text-amber-600" />
              <div>
                <p className="text-xl font-bold text-amber-700">{annotations.length}</p>
                <p className="text-xs text-muted-foreground">annotations</p>
              </div>
            </div>
          </div>
          
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans vos annotations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bn-blue-primary"></div>
          </div>
        ) : filteredAnnotations.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Icon icon="mdi:note-off-outline" className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <div>
              <p className="text-muted-foreground">
                {searchQuery ? "Aucune annotation trouvée" : "Aucune annotation"}
              </p>
              <p className="text-sm text-muted-foreground/70">
                {searchQuery 
                  ? "Essayez avec d'autres termes de recherche"
                  : "Annotez des passages lors de votre lecture pour les retrouver ici"
                }
              </p>
            </div>
            {!searchQuery && (
              <Button onClick={() => navigate("/digital-library")} className="mt-4 bg-bn-blue-primary hover:bg-bn-blue-dark">
                <Icon icon="mdi:bookshelf" className="h-4 w-4 mr-2" />
                Parcourir la bibliothèque
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filteredAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className={`p-4 rounded-lg border-l-4 ${getColorClass(annotation.highlight_color)} hover:shadow-sm transition-all`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm truncate">{annotation.document_title}</h4>
                        {annotation.page_number && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            Page {annotation.page_number}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 line-clamp-3">{annotation.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(annotation.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleGoToDocument(annotation)}
                        className="h-8 w-8 p-0"
                        title="Aller au document"
                      >
                        <Icon icon="mdi:eye" className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(annotation.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Supprimer"
                      >
                        <Icon icon="mdi:delete-outline" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
          <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Icon icon="mdi:lightbulb-outline" className="h-4 w-4 text-gold-bn-primary" />
            Astuce
          </h4>
          <p className="text-xs text-muted-foreground">
            Sélectionnez du texte lors de la lecture pour créer une annotation. Utilisez différentes couleurs pour organiser vos notes.
          </p>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette annotation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'annotation sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}