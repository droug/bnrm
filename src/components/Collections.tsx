import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Scroll, 
  BookOpen, 
  Image, 
  Music, 
  Newspaper, 
  Globe,
  ArrowRight,
  Eye
} from "lucide-react";

const Collections = () => {
  const collections = [
    {
      icon: <Scroll className="h-8 w-8" />,
      title: "Manuscrits Anciens",
      description: "Collection exceptionnelle de manuscrits arabes, berbères et hébraïques",
      count: "50,000+",
      highlights: ["Coran enluminés", "Textes scientifiques médiévaux", "Poésie andalouse"],
      color: "bg-accent",
      featured: true
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Livres Rares",
      description: "Ouvrages précieux et éditions originales de la littérature marocaine",
      count: "25,000+",
      highlights: ["Premières éditions", "Livres d'artistes", "Reliures historiques"],
      color: "bg-primary"
    },
    {
      icon: <Newspaper className="h-8 w-8" />,
      title: "Presse Historique",
      description: "Archives complètes de la presse marocaine depuis le protectorat",
      count: "15,000+",
      highlights: ["Journaux indépendantistes", "Presse coloniale", "Revues culturelles"],
      color: "bg-highlight"
    },
    {
      icon: <Image className="h-8 w-8" />,
      title: "Documents Iconographiques",
      description: "Photographies, cartes et illustrations du patrimoine marocain",
      count: "30,000+",
      highlights: ["Photos historiques", "Cartes anciennes", "Gravures orientalistes"],
      color: "bg-accent"
    },
    {
      icon: <Music className="h-8 w-8" />,
      title: "Archives Sonores",
      description: "Enregistrements de musique traditionnelle et témoignages oraux",
      count: "5,000+",
      highlights: ["Musique andalouse", "Traditions orales", "Conférences historiques"],
      color: "bg-primary"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Collections Numériques",
      description: "Ressources électroniques et bases de données spécialisées",
      count: "100,000+",
      highlights: ["Thèses numériques", "Revues en ligne", "Portails spécialisés"],
      color: "bg-highlight"
    }
  ];

  const featuredManuscripts = [
    {
      title: "Coran de Fès (XIVe siècle)",
      description: "Manuscrit enluminé exceptionnel de l'école calligraphique fassi",
      views: "12,450"
    },
    {
      title: "Traité d'Ibn Rochd",
      description: "Commentaire original d'Averroès sur la philosophie aristotélicienne",
      views: "8,320"
    },
    {
      title: "Diwan d'Ibn Zaidoun",
      description: "Recueil poétique du célèbre poète andalou",
      views: "6,789"
    }
  ];

  return (
    <section id="collections" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Collections & Patrimoine
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Découvrez nos trésors documentaires qui retracent l'histoire et la culture du Maroc
          </p>
        </div>

        {/* Featured manuscripts section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Manuscrits à la Une</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredManuscripts.map((manuscript, index) => (
              <Card key={index} className="bg-card border-border shadow-elegant hover:shadow-moroccan transition-all duration-300 group animate-slide-in"
                    style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="aspect-[4/3] bg-gradient-accent rounded-lg mb-4 flex items-center justify-center group-hover:animate-glow">
                    <Scroll className="h-12 w-12 text-accent-foreground opacity-60" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{manuscript.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{manuscript.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      {manuscript.views} vues
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent-foreground hover:bg-accent">
                      Consulter
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Collections grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <Card key={index} className={`bg-card border-border shadow-elegant hover:shadow-moroccan transition-all duration-300 group animate-fade-in ${collection.featured ? 'md:col-span-2 lg:col-span-1' : ''}`}
                  style={{ animationDelay: `${(index + 3) * 0.1}s` }}>
              <CardContent className="p-8">
                <div className={`w-16 h-16 ${collection.color} rounded-lg flex items-center justify-center mb-6 group-hover:animate-glow`}>
                  <div className="text-white">{collection.icon}</div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-foreground">
                    {collection.title}
                  </h3>
                  <Badge variant="outline" className="text-primary border-primary">
                    {collection.count}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {collection.description}
                </p>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Points forts :</h4>
                  <ul className="space-y-2">
                    {collection.highlights.map((highlight, highlightIndex) => (
                      <li key={highlightIndex} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Explorer la collection
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Digital access section */}
        <div className="mt-16 text-center animate-fade-in">
          <Card className="bg-gradient-accent border-0 shadow-moroccan max-w-4xl mx-auto">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-3xl font-bold text-accent-foreground mb-4">
                Accès Numérique 24h/24
              </h3>
              <p className="text-accent-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
                Consultez nos collections numérisées depuis chez vous. Plus de 100,000 documents 
                sont disponibles en ligne avec des outils de recherche avancés.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="font-medium">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Accéder aux collections
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Scroll className="h-5 w-5 mr-2" />
                  Guide d'utilisation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Collections;