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
import digitalLibraryHero from "@/assets/digital-library-hero.jpg";
import manuscript1 from "@/assets/manuscript-1.jpg";
import manuscript2 from "@/assets/manuscript-2.jpg";
import manuscript3 from "@/assets/manuscript-3.jpg";
import moroccanPatternBg from "@/assets/moroccan-pattern-bg.jpg";

const DigitalLibrary = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const collections = [
    {
      id: "manuscripts",
      title: "Manuscrits",
      icon: BookOpen,
      count: "12,450",
      description: "Manuscrits arabes, berbères et hébraïques",
      color: "text-primary",
      bgColor: "bg-primary/10",
      gradient: "from-primary/20 to-accent/20"
    },
    {
      id: "periodicals",
      title: "Périodiques",
      icon: FileText,
      count: "8,320",
      description: "Journaux marocains historiques et revues",
      color: "text-accent",
      bgColor: "bg-accent/10",
      gradient: "from-accent/20 to-highlight/20"
    },
    {
      id: "monographs",
      title: "Monographies",
      icon: Book,
      count: "45,670",
      description: "Ouvrages sur le patrimoine marocain",
      color: "text-highlight",
      bgColor: "bg-highlight/10",
      gradient: "from-highlight/20 to-royal/20"
    },
    {
      id: "special",
      title: "Collections Spécialisées",
      icon: ImageIcon,
      count: "3,240",
      description: "Cartes anciennes, lithographies marocaines",
      color: "text-royal",
      bgColor: "bg-royal/10",
      gradient: "from-royal/20 to-gold/20"
    },
    {
      id: "audiovisual",
      title: "Documents Audiovisuels",
      icon: Video,
      count: "2,890",
      description: "Archives sonores et vidéos du Maroc",
      color: "text-gold",
      bgColor: "bg-gold/10",
      gradient: "from-gold/20 to-primary/20"
    }
  ];

  const featuredWorks = [
    {
      title: "Al-Kulliyat fi al-Tibb (Le Canon de la Médecine)",
      author: "Ibn Sina (Avicenne) - Copie marocaine",
      views: "5,234",
      category: "Manuscrits",
      image: manuscript1,
      date: "XVe siècle",
      description: "Manuscrit médical en arabe classique, calligraphie maghrébie"
    },
    {
      title: "Es-Saada (Le Bonheur) - Journal historique",
      author: "Archives nationales marocaines",
      views: "3,890",
      category: "Périodiques",
      image: manuscript2,
      date: "1904-1920",
      description: "Premier journal marocain en langue arabe"
    },
    {
      title: "Al-Muqaddima (Les Prolégomènes)",
      author: "Ibn Khaldoun",
      views: "7,120",
      category: "Manuscrits",
      image: manuscript3,
      date: "XIVe siècle",
      description: "Œuvre fondatrice de sociologie et d'histoire"
    },
    {
      title: "Rihla (Voyages)",
      author: "Ibn Battuta",
      views: "4,567",
      category: "Manuscrits",
      image: manuscript1,
      date: "XIVe siècle",
      description: "Récit des voyages du célèbre explorateur marocain"
    },
    {
      title: "Kitab al-Shifa (Le Livre de la guérison)",
      author: "Ibn Sina - Édition maghrébine",
      views: "3,456",
      category: "Manuscrits",
      image: manuscript2,
      date: "XIIe siècle",
      description: "Encyclopédie philosophique et scientifique"
    },
    {
      title: "L'Indépendance Marocaine",
      author: "Archives de la résistance",
      views: "2,890",
      category: "Périodiques",
      image: manuscript3,
      date: "1944-1956",
      description: "Documents sur le mouvement national"
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
        <section className="relative mb-12 py-16 px-8 rounded-3xl border-4 border-gold/40 overflow-hidden shadow-2xl">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${digitalLibraryHero})` }}
          ></div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/85 to-accent/90"></div>
          <div className="absolute inset-0 bg-pattern-zellige-complex opacity-20"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-moroccan font-bold text-white mb-4 drop-shadow-lg">
              Bibliothèque Numérique du Maroc
            </h1>
            <p className="text-xl text-white/95 mb-8 max-w-3xl mx-auto drop-shadow-md">
              Découvrez le patrimoine écrit marocain : manuscrits andalous, périodiques historiques, ouvrages rares et collections d'exception
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
                  <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 border-3 border-gold/30 hover:border-primary cursor-pointer relative overflow-hidden group">
                    {/* Moroccan Pattern Background */}
                    <div 
                      className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                      style={{ backgroundImage: `url(${moroccanPatternBg})`, backgroundSize: 'cover' }}
                    ></div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-60`}></div>
                    
                    <CardHeader className="relative z-10">
                      <div className={`w-16 h-16 ${collection.bgColor} rounded-xl flex items-center justify-center mb-4 shadow-lg border-2 border-gold/20`}>
                        <Icon className={`h-8 w-8 ${collection.color}`} />
                      </div>
                      <CardTitle className="text-xl font-moroccan font-bold">{collection.title}</CardTitle>
                      <CardDescription className="font-elegant">{collection.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-base px-4 py-1 bg-white/80 backdrop-blur-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWorks.slice(0, 3).map((work, index) => (
              <Link key={index} to={`/book-reader/${index}`}>
                <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-3 border-gold/30 hover:border-primary group overflow-hidden">
                  {/* Image */}
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img 
                      src={work.image} 
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <Badge variant="secondary" className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm">
                      {work.category}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg font-moroccan leading-tight">{work.title}</CardTitle>
                    <CardDescription className="font-elegant">{work.author}</CardDescription>
                    <div className="text-xs text-muted-foreground mt-2">{work.date}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{work.description}</p>
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
              <Card className="border-2 border-gold/20">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-2 font-elegant">
                    Découvrez les derniers documents numérisés et ajoutés à notre bibliothèque numérique.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {featuredWorks.slice(0, 4).map((work, item) => (
                      <Link key={item} to={`/book-reader/${item}`}>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-md hover:shadow-xl relative group">
                          <img 
                            src={work.image} 
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="text-white text-xs font-semibold line-clamp-2">{work.title}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="popular">
              <Card className="border-2 border-gold/20">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-2 font-elegant">
                    Les documents les plus consultés par notre communauté.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[...featuredWorks].sort((a, b) => parseInt(b.views.replace(',', '')) - parseInt(a.views.replace(',', ''))).slice(0, 4).map((work, item) => (
                      <Link key={item} to={`/book-reader/${item}`}>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-md hover:shadow-xl relative group">
                          <img 
                            src={work.image} 
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="text-white text-xs font-semibold line-clamp-2">{work.title}</p>
                          </div>
                          <Badge className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm">
                            <Eye className="h-3 w-3 mr-1" />
                            {work.views}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommended">
              <Card className="border-2 border-gold/20">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-2 font-elegant">
                    Sélection personnalisée basée sur les manuscrits andalous et maghrébins.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {featuredWorks.slice(2, 6).map((work, item) => (
                      <Link key={item} to={`/book-reader/${item + 2}`}>
                        <div className="aspect-[3/4] rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-md hover:shadow-xl relative group">
                          <img 
                            src={work.image} 
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <p className="text-white text-xs font-semibold line-clamp-2">{work.title}</p>
                          </div>
                        </div>
                      </Link>
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
