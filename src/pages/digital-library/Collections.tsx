import { useState } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, FileText, Book, Image, Video, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BNPageHeader } from "@/components/digital-library/shared";
import { Icon } from "@iconify/react";

export default function Collections() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");

  const collections = [
    {
      id: "manuscripts",
      title: "Manuscrits numérisés",
      icon: "mdi:script-text-outline",
      count: "+12 000",
      description: "Manuscrits arabes, berbères et hébraïques du patrimoine marocain",
      color: "text-purple-600",
      bgColor: "from-purple-500/10 to-purple-500/5",
      borderColor: "border-purple-500/20 hover:border-purple-500/40",
    },
    {
      id: "lithography",
      title: "Lithographies",
      icon: "mdi:draw",
      count: "+30",
      description: "Collection de lithographies marocaines historiques",
      color: "text-amber-600",
      bgColor: "from-amber-500/10 to-amber-500/5",
      borderColor: "border-amber-500/20 hover:border-amber-500/40",
    },
    {
      id: "books",
      title: "Livres",
      icon: "mdi:book-open-variant",
      count: "+400",
      description: "Ouvrages numérisés sur le patrimoine marocain, littérature classique et contemporaine",
      color: "text-blue-600",
      bgColor: "from-blue-500/10 to-blue-500/5",
      borderColor: "border-blue-500/20 hover:border-blue-500/40",
    },
    {
      id: "periodicals",
      title: "Périodiques",
      icon: "mdi:newspaper-variant-outline",
      count: "+70",
      description: "Journaux et revues marocains historiques, publications scientifiques et culturelles",
      color: "text-green-600",
      bgColor: "from-green-500/10 to-green-500/5",
      borderColor: "border-green-500/20 hover:border-green-500/40",
    },
    {
      id: "specialized",
      title: "Collections spécialisées",
      icon: "mdi:folder-star-outline",
      count: "+2 000",
      description: "Collections de photographies historiques, cartes anciennes et documents rares",
      color: "text-rose-600",
      bgColor: "from-rose-500/10 to-rose-500/5",
      borderColor: "border-rose-500/20 hover:border-rose-500/40",
    },
    {
      id: "audiovisual",
      title: "Audio-visuel",
      icon: "mdi:play-circle-outline",
      count: "+100",
      description: "Enregistrements audio, vidéos documentaires et archives orales",
      color: "text-red-600",
      bgColor: "from-red-500/10 to-red-500/5",
      borderColor: "border-red-500/20 hover:border-red-500/40",
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
      <BNPageHeader
        title="Collections Numériques"
        subtitle="Explorez nos fonds documentaires numérisés classés par type et thématique"
        icon="mdi:library-shelves"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 dark:bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-bn-blue-primary/10 to-gold-bn-primary/10 border border-bn-blue-primary/20">
                <Filter className="h-5 w-5 text-bn-blue-primary" />
              </div>
              Filtrer les collections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par auteur, titre, sujet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-border/50 focus:border-bn-blue-primary"
                />
              </div>
              <Button onClick={handleSearch} className="bg-bn-blue-primary hover:bg-bn-blue-deep">
                <Search className="h-4 w-4 mr-2" />
                Rechercher
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">Type de document</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-11">
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
                <label className="text-sm font-medium mb-2 block text-muted-foreground">Langue</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="h-11">
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
                <label className="text-sm font-medium mb-2 block text-muted-foreground">Date</label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="h-11">
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
              className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border bg-gradient-to-br ${collection.bgColor} ${collection.borderColor}`}
              onClick={() => navigate(`/digital-library/collections/${collection.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-4 rounded-2xl bg-white/80 dark:bg-card/80 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon icon={collection.icon} className={`h-8 w-8 ${collection.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1 bg-white/80 dark:bg-card/80">
                    {collection.count}
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-4 group-hover:text-bn-blue-primary transition-colors">
                  {collection.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {collection.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="ghost" size="sm" className="group-hover:text-bn-blue-primary group-hover:bg-bn-blue-primary/10 transition-all">
                  Explorer la collection
                  <Icon icon="mdi:arrow-right" className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DigitalLibraryLayout>
  );
}
