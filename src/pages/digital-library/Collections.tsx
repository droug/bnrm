import { useState } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, FileText, Book, Image, Video, Music, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function Collections() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");

  const collections = [
    {
      id: "books",
      title: "Livres numériques",
      icon: Book,
      count: "45,670",
      description: "Ouvrages numérisés sur le patrimoine marocain, littérature classique et contemporaine",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "periodicals",
      title: "Revues et périodiques",
      icon: FileText,
      count: "8,320",
      description: "Journaux marocains historiques, revues scientifiques et culturelles",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "manuscripts",
      title: "Manuscrits numérisés",
      icon: BookOpen,
      count: "12,450",
      description: "Manuscrits arabes, berbères et hébraïques du patrimoine marocain",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "photos",
      title: "Photographies et cartes",
      icon: Image,
      count: "15,890",
      description: "Collections de photographies historiques, cartes anciennes et lithographies",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      id: "audiovisual",
      title: "Archives sonores et audiovisuelles",
      icon: Video,
      count: "2,890",
      description: "Enregistrements audio, vidéos documentaires et archives orales",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (selectedType !== "all") params.append("type", selectedType);
    if (selectedLanguage !== "all") params.append("lang", selectedLanguage);
    if (selectedDate !== "all") params.append("date", selectedDate);
    navigate(`/digital-library/search?${params.toString()}`);
  };

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Collections Numériques</h1>
          <p className="text-lg text-muted-foreground">
            Explorez nos fonds documentaires numérisés classés par type et thématique
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrer les collections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par auteur, titre, sujet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type de document</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="book">Livre</SelectItem>
                    <SelectItem value="periodical">Périodique</SelectItem>
                    <SelectItem value="manuscript">Manuscrit</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="audio">Audio/Vidéo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Langue</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes langues</SelectItem>
                    <SelectItem value="ar">Arabe</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">Anglais</SelectItem>
                    <SelectItem value="ber">Amazigh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes périodes</SelectItem>
                    <SelectItem value="ancient">Avant 1900</SelectItem>
                    <SelectItem value="modern">1900-1950</SelectItem>
                    <SelectItem value="contemporary">1950-2000</SelectItem>
                    <SelectItem value="recent">2000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(`/digital-library/collections/${collection.id}`)}
            >
              <CardHeader>
                <div className={`p-4 rounded-lg ${collection.bgColor} w-fit mb-3 group-hover:scale-110 transition-transform`}>
                  <collection.icon className={`h-8 w-8 ${collection.color}`} />
                </div>
                <CardTitle className="text-xl">{collection.title}</CardTitle>
                <CardDescription className="text-sm">{collection.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {collection.count} documents
                  </Badge>
                  <Button variant="ghost" size="sm">
                    Explorer →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DigitalLibraryLayout>
  );
}
