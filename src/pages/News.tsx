import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight, MessageSquare, Heart, Share2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const News = () => {
  const { t } = useLanguage();

  const newsArticles = [
    {
      id: 1,
      title: "La BNRM accueille les directeurs des Archives nationales d'Autriche et de Hongrie",
      excerpt: "Madame Samira El Malizi, Directrice de la Bibliothèque nationale du Royaume du Maroc, a reçu dans la matinée du mercredi 10 septembre 2025...",
      content: "Une délégation de haut niveau composée de Monsieur Csaba Szabó, Directeur général des Archives nationales de Hongrie, ainsi que Monsieur Helmut Wohnout, Directeur général des Archives d'État d'Autriche, a été reçue par la direction de la BNRM pour discuter des opportunités de coopération internationale.",
      date: "2025-09-10",
      author: "Service Communication BNRM",
      category: "Coopération internationale",
      readTime: "3 min",
      likes: 42,
      comments: 8,
      featured: true,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop"
    },
    {
      id: 2,
      title: "Le 4ème Colloque des Réseaux de Bibliothèques Marocaines",
      excerpt: "Sous le thème 'Vers une transformation numérique des bibliothèques marocaines', la BNRM organise son colloque annuel...",
      content: "Cet événement majeur réunit les professionnels de l'information documentaire du Royaume pour échanger sur les défis et opportunités de la digitalisation.",
      date: "2025-09-05",
      author: "Direction des Affaires Culturelles",
      category: "Événements",
      readTime: "4 min",
      likes: 67,
      comments: 15,
      featured: false
    },
    {
      id: 3,
      title: "Nouveaux Bouquets Électroniques Disponibles",
      excerpt: "La BNRM enrichit son offre numérique avec de nouvelles ressources scientifiques internationales...",
      content: "Plus de 10 000 nouvelles ressources numériques sont désormais accessibles via nos bouquets électroniques, couvrant les domaines des sciences humaines, sociales et exactes.",
      date: "2025-08-28",
      author: "Service des Ressources Numériques",
      category: "Ressources",
      readTime: "2 min",
      likes: 89,
      comments: 23,
      featured: false
    },
    {
      id: 4,
      title: "Exposition : Manuscrits Andalous du Moyen Âge",
      excerpt: "Découvrez la richesse du patrimoine manuscrit andalou à travers une exposition exceptionnelle...",
      content: "Une sélection de manuscrits rares datant du XIIe au XVe siècle, témoignant de l'âge d'or de la civilisation arabo-andalouse.",
      date: "2025-08-20",
      author: "Département des Manuscrits",
      category: "Expositions",
      readTime: "5 min",
      likes: 156,
      comments: 34,
      featured: false
    }
  ];

  const categories = [
    { name: "Tout", count: newsArticles.length, active: true },
    { name: "Coopération internationale", count: 1 },
    { name: "Événements", count: 1 },
    { name: "Ressources", count: 1 },
    { name: "Expositions", count: 1 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-hero py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold border border-white/20">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Actualités</h1>
            <div className="w-24 h-1 bg-gradient-accent mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Suivez les dernières nouvelles et événements de la Bibliothèque Nationale du Royaume du Maroc
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={category.active ? "default" : "outline"}
                className={`rounded-full ${category.active ? 'bg-primary' : 'hover:bg-accent'}`}
              >
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Featured Article */}
            <div className="lg:col-span-2">
              {newsArticles.filter(article => article.featured).map((article) => (
                <Card key={article.id} className="mb-8 overflow-hidden shadow-moroccan hover:shadow-elegant transition-all duration-300 group">
                  <div 
                    className="h-64 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${article.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <Badge className="absolute top-4 left-4 bg-primary">
                      À la Une
                    </Badge>
                    <div className="absolute bottom-4 left-4 text-white">
                      <Badge variant="secondary" className="mb-2">
                        {article.category}
                      </Badge>
                      <h2 className="text-2xl font-bold mb-2 group-hover:text-gold transition-colors">
                        {article.title}
                      </h2>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(article.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {article.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {article.readTime}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {article.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Heart className="h-4 w-4" />
                          {article.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          {article.comments}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Share2 className="h-4 w-4" />
                          Partager
                        </button>
                      </div>
                      <Button className="group">
                        Lire la suite
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Recent Articles */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Articles récents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {newsArticles.filter(article => !article.featured).map((article, index) => (
                    <div key={article.id} className="group cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors">
                        <div className="flex-1">
                          <Badge variant="outline" className="text-xs mb-2">
                            {article.category}
                          </Badge>
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card className="bg-gradient-primary text-primary-foreground shadow-moroccan">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-3">
                    Newsletter BNRM
                  </h3>
                  <p className="text-primary-foreground/90 text-sm mb-4">
                    Recevez nos dernières actualités et événements directement dans votre boîte mail
                  </p>
                  <Button variant="secondary" className="w-full">
                    S'abonner
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>En chiffres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Articles publiés</span>
                      <span className="font-bold text-primary">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Événements organisés</span>
                      <span className="font-bold text-accent">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Expositions</span>
                      <span className="font-bold text-highlight">23</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;