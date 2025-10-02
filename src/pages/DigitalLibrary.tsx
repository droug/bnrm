import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Search, Book, BookOpen, FileText, Video, Music, Image as ImageIcon, Globe, ArrowRight, TrendingUp, Clock, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const DigitalLibrary = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const collections = [
    {
      id: "manuscripts",
      title: "Manuscrits",
      icon: BookOpen,
      count: "12,450",
      description: "Collections de manuscrits précieux",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      id: "periodicals",
      title: "Périodiques",
      icon: FileText,
      count: "8,320",
      description: "Revues et journaux numérisés",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      id: "monographs",
      title: "Monographies",
      icon: Book,
      count: "45,670",
      description: "Livres et ouvrages complets",
      color: "text-highlight",
      bgColor: "bg-highlight/10"
    },
    {
      id: "special",
      title: "Collections Spécialisées",
      icon: ImageIcon,
      count: "3,240",
      description: "Lithographies et documents iconographiques",
      color: "text-royal",
      bgColor: "bg-royal/10"
    },
    {
      id: "audiovisual",
      title: "Documents Audiovisuels",
      icon: Video,
      count: "2,890",
      description: "Documents sonores et vidéos",
      color: "text-gold",
      bgColor: "bg-gold/10"
    }
  ];

  const featuredWorks = [
    {
      title: "Manuscrit andalou du XIIe siècle",
      author: "Ibn Rushd (Averroès)",
      views: "2,345",
      category: "Manuscrits",
      image: "/placeholder.svg"
    },
    {
      title: "Journal Al Maghrib - Collection complète",
      author: "Archives historiques",
      views: "1,890",
      category: "Périodiques",
      image: "/placeholder.svg"
    },
    {
      title: "Histoire du Maroc - Édition rare",
      author: "Divers auteurs",
      views: "3,120",
      category: "Monographies",
      image: "/placeholder.svg"
    }
  ];

  const internationalRepositories = [
    { name: "Bibliothèque Nationale de France", code: "BNF", url: "#" },
    { name: "World Digital Library", code: "WDL", url: "#" },
    { name: "Europeana", code: "EUROPEANA", url: "#" },
    { name: "Internet Archive", code: "IA", url: "#" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative mb-12 py-16 px-8 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20 rounded-3xl border-4 border-primary/30 overflow-hidden">
          <div className="absolute inset-0 bg-pattern-zellige-complex opacity-20"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-moroccan font-bold text-foreground mb-4">
              Bibliothèque Numérique
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Accédez à notre patrimoine numérisé : manuscrits, périodiques, monographies et collections spécialisées
            </p>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Rechercher dans les collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-16 text-lg bg-white/98 shadow-lg border-3 border-gold/30 focus:border-primary pl-6 pr-16 rounded-full"
                />
                <Button 
                  size="lg" 
                  className="absolute right-2 top-2 h-12 w-12 rounded-full"
                >
                  <Search className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="mb-12">
          <h2 className="text-3xl font-moroccan font-bold text-foreground mb-6">
            Nos Collections Numériques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => {
              const Icon = collection.icon;
              return (
                <Link key={collection.id} to={`/digital-library/${collection.id}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary cursor-pointer">
                    <CardHeader>
                      <div className={`w-16 h-16 ${collection.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon className={`h-8 w-8 ${collection.color}`} />
                      </div>
                      <CardTitle className="text-xl font-bold">{collection.title}</CardTitle>
                      <CardDescription>{collection.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-lg px-4 py-1">
                          {collection.count} documents
                        </Badge>
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Works */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-moroccan font-bold text-foreground">
              Œuvres à la Une
            </h2>
            <Button variant="outline" className="flex items-center gap-2">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredWorks.map((work, index) => (
              <Link key={index} to={`/book-reader/${index}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                    <Book className="h-24 w-24 text-primary/40" />
                  </div>
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">{work.category}</Badge>
                    <CardTitle className="text-lg">{work.title}</CardTitle>
                    <CardDescription>{work.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{work.views} consultations</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Tabs Section */}
        <section className="mb-12">
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Récemment ajoutés
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Les plus consultés
              </TabsTrigger>
              <TabsTrigger value="recommended" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Recommandations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">
                    Découvrez les derniers documents numérisés et ajoutés à notre bibliothèque numérique.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                        <Book className="h-12 w-12 text-primary/40" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="popular">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">
                    Les documents les plus consultés par notre communauté.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="aspect-[3/4] bg-gradient-to-br from-accent/10 to-highlight/10 rounded-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                        <BookOpen className="h-12 w-12 text-accent/40" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommended">
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">
                    Sélection personnalisée basée sur vos intérêts.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="aspect-[3/4] bg-gradient-to-br from-highlight/10 to-royal/10 rounded-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                        <FileText className="h-12 w-12 text-highlight/40" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* International Repositories */}
        <section className="mb-12">
          <h2 className="text-3xl font-moroccan font-bold text-foreground mb-6">
            Réservoirs Internationaux
          </h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-6">
                Accédez aux collections des grandes bibliothèques numériques mondiales
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {internationalRepositories.map((repo) => (
                  <a 
                    key={repo.code}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border-2 border-muted rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-300"
                  >
                    <Globe className="h-6 w-6 text-primary" />
                    <div>
                      <div className="font-semibold">{repo.code}</div>
                      <div className="text-xs text-muted-foreground">{repo.name}</div>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DigitalLibrary;
