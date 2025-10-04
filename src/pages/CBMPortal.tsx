import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Target, Users, UserPlus, Database, BookOpen, ArrowRight, Sparkles } from "lucide-react";

export default function CBMPortal() {
  const menuCards = [
    {
      title: "Objectifs du Réseau CBM",
      description: "Découvrez les missions et objectifs du Catalogue des Bibliothèques Marocaines",
      icon: Target,
      path: "/cbm/objectifs",
      gradient: "from-cbm-primary to-cbm-primary-light"
    },
    {
      title: "Plan d'Actions",
      description: "Étapes d'intégration et feuille de route du réseau",
      icon: Network,
      path: "/cbm/plan-actions",
      gradient: "from-cbm-secondary to-cbm-secondary-light"
    },
    {
      title: "Organes de Gestion",
      description: "Bureau CBM, Comité Actif et structure organisationnelle",
      icon: Users,
      path: "/cbm/organes-gestion",
      gradient: "from-cbm-accent to-cbm-accent-glow"
    },
    {
      title: "Adhésion au Réseau",
      description: "Rejoignez le réseau CBM - Formulaire et conditions",
      icon: UserPlus,
      path: "/cbm/adhesion",
      gradient: "from-cbm-primary-dark to-cbm-primary"
    },
    {
      title: "Recherche Documentaire",
      description: "Accédez aux ressources des bibliothèques membres",
      icon: Database,
      path: "/cbm/recherche",
      gradient: "from-cbm-secondary to-cbm-accent"
    },
    {
      title: "Accès Rapide",
      description: "Charte, règlements, formations et connectivité",
      icon: BookOpen,
      path: "/cbm/acces-rapide",
      gradient: "from-cbm-accent to-cbm-secondary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner - Design Moderne Marocain */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cbm-primary via-cbm-secondary to-cbm-accent">
        {/* Pattern background subtil */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'var(--pattern-cbm-network)' }}
        />
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Icon Badge */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-cbm-strong">
              <Network className="w-10 h-10 text-white" />
            </div>
            
            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Portail CBM
            </h1>
            
            {/* Subtitle */}
            <p className="text-2xl md:text-3xl mb-4 font-light opacity-95">
              Catalogue des Bibliothèques Marocaines
            </p>
            
            {/* Decorative line */}
            <div className="w-32 h-1 bg-white/40 mx-auto mb-8 rounded-full" />
            
            {/* Description */}
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 opacity-90 leading-relaxed">
              Réseau national de coopération et de partage des ressources documentaires 
              entre bibliothèques marocaines
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/cbm/recherche">
                <Button size="lg" className="bg-white text-cbm-primary hover:bg-white/90 shadow-lg">
                  <Database className="w-5 h-5 mr-2" />
                  Rechercher dans le Catalogue
                </Button>
              </Link>
              <Link to="/cbm/adhesion">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Adhérer au Réseau
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave decoration at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>
      
      <main className="container mx-auto px-4 py-16">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Explorez le Portail
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accédez aux différentes sections du réseau CBM
          </p>
        </div>

        {/* Menu Cards Grid - Design Moderne */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {menuCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link key={card.path} to={card.path}>
                <Card className="group h-full hover:shadow-cbm-strong transition-all duration-300 cursor-pointer border hover:border-cbm-accent/60 bg-white overflow-hidden">
                  <div className="relative">
                    {/* Gradient header */}
                    <div className={`h-2 bg-gradient-to-r ${card.gradient}`} />
                    
                    <CardHeader className="relative pb-4">
                      <div className={`inline-flex h-14 w-14 rounded-xl bg-gradient-to-br ${card.gradient} items-center justify-center mb-4 shadow-cbm group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-xl text-foreground group-hover:text-cbm-primary transition-colors">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-cbm-primary group-hover:translate-x-2 transition-transform duration-300">
                        <span className="text-sm font-medium">Découvrir</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats Section - Style Moderne */}
        <div className="bg-gradient-to-br from-cbm-primary/5 via-cbm-secondary/5 to-cbm-accent/5 rounded-2xl p-8 md:p-12 border border-cbm-primary/10">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-cbm-accent" />
              Le Réseau CBM en Chiffres
            </h3>
            <p className="text-muted-foreground">Impact et portée du catalogue national</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-cbm-primary/20 hover:shadow-cbm transition-shadow">
              <div className="text-4xl md:text-5xl font-bold text-cbm-primary mb-2">150+</div>
              <div className="text-sm text-muted-foreground font-medium">Bibliothèques membres</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-cbm-secondary/20 hover:shadow-cbm transition-shadow">
              <div className="text-4xl md:text-5xl font-bold text-cbm-secondary mb-2">2M+</div>
              <div className="text-sm text-muted-foreground font-medium">Documents catalogués</div>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-cbm-accent/20 hover:shadow-cbm transition-shadow">
              <div className="text-4xl md:text-5xl font-bold text-cbm-accent mb-2">24/7</div>
              <div className="text-sm text-muted-foreground font-medium">Accès aux ressources</div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
