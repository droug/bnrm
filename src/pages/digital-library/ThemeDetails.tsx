import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Eye, Download, Heart, Calendar } from "lucide-react";

export default function ThemeDetails() {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterType, setFilterType] = useState("all");

  const themeInfo: Record<string, any> = {
    history: {
      title: "Histoire & Patrimoine",
      description: "Histoire du Maroc, dynasties, événements historiques, personnalités marquantes",
      count: "15,340",
      icon: "🏛️",
      color: "from-amber-500 to-orange-600",
    },
    arts: {
      title: "Arts & Culture",
      description: "Arts visuels, architecture, musique, traditions culturelles marocaines",
      count: "12,890",
      icon: "🎨",
      color: "from-pink-500 to-rose-600",
    },
    sciences: {
      title: "Sciences & Techniques",
      description: "Sciences naturelles, médecine traditionnelle, astronomie, mathématiques",
      count: "8,450",
      icon: "🔬",
      color: "from-blue-500 to-cyan-600",
    },
    religion: {
      title: "Religion & Philosophie",
      description: "Textes religieux, philosophie islamique, soufisme, études coraniques",
      count: "18,670",
      icon: "📿",
      color: "from-green-500 to-emerald-600",
    },
    literature: {
      title: "Littérature & Poésie",
      description: "Poésie classique et moderne, romans, nouvelles, essais littéraires",
      count: "22,130",
      icon: "✍️",
      color: "from-purple-500 to-indigo-600",
    },
    other: {
      title: "Autres thématiques",
      description: "Droit, économie, géographie, linguistique et autres domaines",
      count: "9,240",
      icon: "📚",
      color: "from-slate-500 to-gray-600",
    },
  };

  const theme = themeInfo[themeId || "history"] || themeInfo.history;

  // Mock documents data
  const documents = [
    {
      id: 1,
      title: "Les grandes dynasties du Maroc",
      author: "Abdelhadi Tazi",
      type: "Livre",
      year: 2010,
      views: 12450,
      downloads: 3420,
      pages: 560,
      description: "Analyse approfondie des dynasties qui ont marqué l'histoire du Maroc, des Idrissides aux Alaouites.",
    },
    {
      id: 2,
      title: "Architecture islamique au Maghreb",
      author: "Marianne Barrucand",
      type: "Monographie",
      year: 2015,
      views: 8920,
      downloads: 2145,
      pages: 420,
      description: "Étude détaillée de l'architecture islamique et son évolution au Maghreb.",
    },
    {
      id: 3,
      title: "Patrimoine immatériel marocain",
      author: "UNESCO - Maroc",
      type: "Périodique",
      year: 2020,
      views: 6780,
      downloads: 1890,
      pages: 280,
      description: "Documentation complète du patrimoine culturel immatériel marocain reconnu par l'UNESCO.",
    },
    {
      id: 4,
      title: "La bataille des Trois Rois",
      author: "Mohamed Kenbib",
      type: "Manuscrit",
      year: 2008,
      views: 5430,
      downloads: 1234,
      pages: 320,
      description: "Récit historique de la bataille d'Oued el-Makhazin et ses conséquences.",
    },
    {
      id: 5,
      title: "Collections royales : Trésors du Maroc",
      author: "Musée Mohammed VI",
      type: "Collection",
      year: 2018,
      views: 9870,
      downloads: 2567,
      pages: 640,
      description: "Catalogue des collections royales marocaines, œuvres d'art et objets historiques.",
    },
  ];

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = !searchQuery || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || doc.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular": return b.views - a.views;
        case "downloads": return b.downloads - a.downloads;
        case "recent": return b.year - a.year;
        case "title": return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

  const subtopics = [
    "Dynasties marocaines",
    "Mouvements de résistance",
    "Patrimoine architectural",
    "Personnalités historiques",
    "Événements majeurs",
    "Villes impériales",
    "Commerce et routes",
    "Relations internationales",
  ];

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${theme.color} shadow-lg`}>
              <span className="text-5xl">{theme.icon}</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">{theme.title}</h1>
              <p className="text-lg text-muted-foreground mt-2">{theme.description}</p>
              <Badge variant="secondary" className="mt-3 text-base px-4 py-1">
                {theme.count} documents
              </Badge>
            </div>
          </div>
        </div>

        {/* Subtopics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sous-thématiques</CardTitle>
            <CardDescription>Affinez votre recherche par sous-catégorie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {subtopics.map((topic, index) => (
                <Button key={index} variant="outline" size="sm">
                  {topic}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans ce thème..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Trier par</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Plus consultés</SelectItem>
                    <SelectItem value="downloads">Plus téléchargés</SelectItem>
                    <SelectItem value="recent">Plus récents</SelectItem>
                    <SelectItem value="title">Titre (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type de document</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="Livre">Livre</SelectItem>
                    <SelectItem value="Manuscrit">Manuscrit</SelectItem>
                    <SelectItem value="Périodique">Périodique</SelectItem>
                    <SelectItem value="Monographie">Monographie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            {filteredDocuments.length} document(s) trouvé(s)
          </p>
        </div>

        {/* Documents List */}
        <div className="space-y-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <BookOpen className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{doc.author}</p>
                        <p className="text-sm mb-3">{doc.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <Badge variant="outline">{doc.type}</Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {doc.year}
                          </span>
                          <span className="text-sm text-muted-foreground">{doc.pages} pages</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {doc.views.toLocaleString()} vues
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-4 w-4" />
                            {doc.downloads.toLocaleString()} téléchargements
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={() => navigate(`/book-reader/${doc.id}`)}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Consulter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Favoris
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDocuments.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Aucun document trouvé</p>
                <Button variant="link" onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}>
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DigitalLibraryLayout>
  );
}
