import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/hooks/useLanguage";
import { Search, Book, BookOpen, Users, FileText, Download, Calendar, Globe, Accessibility, Share2, MousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Main Layout suivant la maquette */}
        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Zone principale de contenu (3/4 de la largeur) */}
            <div className="xl:col-span-3 space-y-6">
              
              {/* Zone de recherche centrale */}
              <div className="text-center mb-8">
                <div className="max-w-2xl mx-auto relative">
                  <Input
                    type="search"
                    placeholder="Barre de recherche"
                    className="w-full h-16 text-lg bg-card shadow-moroccan border-2 border-border/50 focus:border-primary pl-6 pr-16 rounded-full"
                  />
                  <Button 
                    size="lg" 
                    className="absolute right-2 top-2 h-12 w-12 rounded-full bg-gradient-primary shadow-gold"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-4 italic">
                  Exemple de contenu le contenu de ra tre editorialisa le
                </p>
              </div>

              {/* Zone de contenu principal avec blocs de différentes tailles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Bloc principal large (simulation zone contenu éditorialisé) */}
                <Card className="md:col-span-1 bg-card/50 border-2 border-border shadow-elegant hover:shadow-moroccan transition-all duration-300">
                  <CardContent className="p-8 min-h-[300px] flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      Zone de contenu principal
                    </h3>
                    <p className="text-muted-foreground">
                      Contenu éditorialisé à mettre en avant selon la structure du menu
                    </p>
                  </CardContent>
                </Card>

                {/* Bloc secondaire avec fond bleu (zone actualités) */}
                <Card className="bg-primary/90 text-primary-foreground border-primary shadow-gold hover:shadow-moroccan transition-all duration-300">
                  <CardContent className="p-8 min-h-[300px] flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">
                      Actualités & Publications
                    </h3>
                    <p className="text-primary-foreground/80">
                      Dernières nouvelles et publications de la BNRM
                    </p>
                  </CardContent>
                </Card>

                {/* Bloc collections patrimoniales */}
                <Card className="bg-accent/90 text-accent-foreground border-accent shadow-elegant hover:shadow-gold transition-all duration-300">
                  <CardContent className="p-8 min-h-[200px] flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                      <Book className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">
                      Explorer le patrimoine
                    </h3>
                    <p className="text-accent-foreground/80 text-sm">
                      Collections et fonds documentaires
                    </p>
                  </CardContent>
                </Card>

                {/* Bloc services */}
                <Card className="bg-highlight/90 text-highlight-foreground border-highlight shadow-elegant hover:shadow-moroccan transition-all duration-300">
                  <CardContent className="p-8 min-h-[200px] flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">
                      Accéder à nos services
                    </h3>
                    <p className="text-highlight-foreground/80 text-sm">
                      Inscription, réservation, dépôt légal
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Zone horizontale inférieure (services rapides) */}
              <Card className="bg-gradient-subtle border-2 border-border/50 shadow-elegant">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { icon: FileText, label: "Dépôt légal", color: "text-primary" },
                      { icon: BookOpen, label: "Réserver ouvrage", color: "text-accent" },
                      { icon: Download, label: "Reproduction", color: "text-highlight" },
                      { icon: Users, label: "Inscription", color: "text-primary" },
                      { icon: Calendar, label: "Événements", color: "text-accent" }
                    ].map((service, index) => (
                      <div key={index} className="text-center p-3 rounded-lg hover:bg-card/50 transition-colors">
                        <service.icon className={`h-8 w-8 ${service.color} mx-auto mb-2`} />
                        <p className="text-sm font-medium text-foreground">{service.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar droite (1/4 de la largeur) - Correspond aux icônes de la maquette */}
            <div className="xl:col-span-1 space-y-4">
              
              {/* Mon espace utilisateur */}
              <Card className="bg-card border-2 border-border shadow-elegant hover:shadow-moroccan transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Mon espace</h4>
                  <Button size="sm" className="w-full bg-gradient-primary">
                    Connexion
                  </Button>
                </CardContent>
              </Card>

              {/* Aide et assistance */}
              <Card className="bg-card border-2 border-border shadow-elegant hover:shadow-gold transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MousePointer className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Aide & Support</h4>
                  <p className="text-xs text-muted-foreground">FAQ, règlements, contacts</p>
                </CardContent>
              </Card>

              {/* Services numériques */}
              <Card className="bg-card border-2 border-border shadow-elegant hover:shadow-moroccan transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-3 border-2 border-primary/20">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Services numériques</h4>
                  <p className="text-xs text-muted-foreground">Catalogue, reproduction</p>
                </CardContent>
              </Card>

              {/* Choix de langue */}
              <Card className="bg-card border-2 border-border shadow-elegant hover:shadow-gold transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mx-auto mb-3 border-2 border-gold/30">
                    <Globe className="h-6 w-6 text-gold" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Langues</h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    <span className="text-xs px-2 py-1 bg-primary/10 rounded text-primary">AR</span>
                    <span className="text-xs px-2 py-1 bg-accent/10 rounded text-accent">FR</span>
                    <span className="text-xs px-2 py-1 bg-highlight/10 rounded text-highlight">EN</span>
                  </div>
                </CardContent>
              </Card>

              {/* Accessibilité */}
              <Card className="bg-card border-2 border-border shadow-elegant hover:shadow-moroccan transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3 border-2 border-accent/30">
                    <Accessibility className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Accessibilité</h4>
                  <p className="text-xs text-muted-foreground">Options d'accessibilité</p>
                </CardContent>
              </Card>

              {/* Partage réseaux sociaux */}
              <Card className="bg-card border-2 border-border shadow-elegant hover:shadow-gold transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-highlight/20 rounded-lg flex items-center justify-center mx-auto mb-3 border-2 border-highlight/30">
                    <Share2 className="h-6 w-6 text-highlight" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Partager</h4>
                  <p className="text-xs text-muted-foreground">Réseaux sociaux</p>
                </CardContent>
              </Card>

              {/* Zone de chatbot (large en bas de sidebar) */}
              <Card className="bg-gradient-primary text-primary-foreground border-primary shadow-gold">
                <CardContent className="p-6 text-center min-h-[120px] flex flex-col justify-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MousePointer className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold mb-2">Chatbot d'assistance</h4>
                  <p className="text-sm text-primary-foreground/80">
                    Assistance en temps réel
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
