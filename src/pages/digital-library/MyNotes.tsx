import { useState } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StickyNote, Search, Download, Trash2, Edit, BookOpen, Calendar, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function MyNotes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDocument, setFilterDocument] = useState("all");
  const [filterType, setFilterType] = useState("all");

  if (!user) {
    navigate("/auth");
    return null;
  }

  const [notes, setNotes] = useState([
    {
      id: 1,
      documentTitle: "Al-Muqaddima",
      documentAuthor: "Ibn Khaldoun",
      pageNumber: 45,
      noteText: "Concept fondamental de la civilisation et de l'organisation sociale. À approfondir pour la recherche.",
      type: "important",
      createdDate: "2025-01-15",
      color: "red",
    },
    {
      id: 2,
      documentTitle: "Al-Muqaddima",
      documentAuthor: "Ibn Khaldoun",
      pageNumber: 78,
      noteText: "Analyse intéressante sur les cycles dynastiques. Lien avec les théories modernes de sociologie.",
      type: "bookmark",
      createdDate: "2025-01-16",
      color: "blue",
    },
    {
      id: 3,
      documentTitle: "Rihla (Voyages)",
      documentAuthor: "Ibn Battuta",
      pageNumber: 123,
      noteText: "Description détaillée de Tombouctou au XIVe siècle.",
      type: "highlight",
      createdDate: "2025-01-12",
      color: "yellow",
    },
    {
      id: 4,
      documentTitle: "Histoire du Maroc moderne",
      documentAuthor: "Archives BNRM",
      pageNumber: 56,
      noteText: "Dates importantes de l'indépendance à vérifier avec d'autres sources.",
      type: "question",
      createdDate: "2025-01-10",
      color: "green",
    },
  ]);

  const uniqueDocuments = [...new Set(notes.map(n => n.documentTitle))];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === "" || 
      note.noteText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.documentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDocument = filterDocument === "all" || note.documentTitle === filterDocument;
    const matchesType = filterType === "all" || note.type === filterType;
    
    return matchesSearch && matchesDocument && matchesType;
  });

  const handleDeleteNote = (noteId: number) => {
    setNotes(notes.filter(n => n.id !== noteId));
    toast({
      title: "Note supprimée",
      description: "La note a été supprimée avec succès",
    });
  };

  const handleExportNotes = () => {
    const exportData = filteredNotes.map(note => ({
      Document: note.documentTitle,
      Auteur: note.documentAuthor,
      Page: note.pageNumber,
      Type: note.type,
      Note: note.noteText,
      Date: note.createdDate,
    }));

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
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

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      important: "bg-red-100 text-red-800",
      bookmark: "bg-blue-100 text-blue-800",
      highlight: "bg-yellow-100 text-yellow-800",
      question: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      important: "Important",
      bookmark: "Signet",
      highlight: "Surlignage",
      question: "Question",
    };
    return labels[type] || type;
  };

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
              <div className="text-sm text-muted-foreground">Documents annotés</div>
              <div className="text-3xl font-bold mt-1">{uniqueDocuments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Important</div>
              <div className="text-3xl font-bold mt-1 text-red-600">
                {notes.filter(n => n.type === "important").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Signets</div>
              <div className="text-3xl font-bold mt-1 text-blue-600">
                {notes.filter(n => n.type === "bookmark").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrer et rechercher
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
              <Button onClick={handleExportNotes} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter ({filteredNotes.length})
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Document</label>
                <Select value={filterDocument} onValueChange={setFilterDocument}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les documents</SelectItem>
                    {uniqueDocuments.map((doc) => (
                      <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type d'annotation</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="bookmark">Signet</SelectItem>
                    <SelectItem value="highlight">Surlignage</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des annotations</CardTitle>
            <CardDescription>
              {filteredNotes.length} annotation(s) {searchQuery || filterDocument !== "all" || filterType !== "all" ? "trouvée(s)" : "au total"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{note.documentTitle}</h3>
                        <Badge className={getTypeColor(note.type)}>
                          {getTypeLabel(note.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {note.documentAuthor} • Page {note.pageNumber}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-accent/30 p-3 rounded-lg mb-3">
                    <p className="text-sm">{note.noteText}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(note.createdDate).toLocaleDateString('fr-FR')}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/book-reader/${note.id}`)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Voir dans le document
                    </Button>
                  </div>
                </div>
              ))}

              {filteredNotes.length === 0 && (
                <div className="text-center py-12">
                  <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery || filterDocument !== "all" || filterType !== "all" 
                      ? "Aucune annotation trouvée avec ces critères"
                      : "Vous n'avez pas encore d'annotations"
                    }
                  </p>
                  {!searchQuery && filterDocument === "all" && filterType === "all" && (
                    <Button className="mt-4" onClick={() => navigate("/digital-library")}>
                      Parcourir la bibliothèque
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm">Comment utiliser les annotations</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Annotez directement depuis le lecteur de documents</p>
            <p>• Utilisez les types pour organiser vos notes (Important, Signet, Surlignage, Question)</p>
            <p>• Exportez vos annotations en CSV pour les utiliser dans d'autres applications</p>
            <p>• Les annotations sont privées et synchronisées sur tous vos appareils</p>
          </CardContent>
        </Card>
      </div>
    </DigitalLibraryLayout>
  );
}
