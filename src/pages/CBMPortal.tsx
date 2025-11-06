import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Target, Users, UserPlus, Database, BookOpen, ArrowRight, Library, FileText, GraduationCap, Search, Settings } from "lucide-react";
import cbmHeroBanner from "@/assets/cbm-hero-banner.jpg";
import EventsCarousel from "@/components/cultural-activities/EventsCarousel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function CBMPortal() {
  // Vérifier si l'utilisateur est admin ou librarian
  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "librarian"])
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }
      
      return data?.role || null;
    }
  });

  const spotlightItems = [
    {
      title: "Objectifs du Réseau CBM",
      description: "Découvrez les missions et objectifs du Catalogue des Bibliothèques Marocaines",
      icon: Target,
      path: "/cbm/objectifs",
      gradient: "from-primary/90 to-primary"
    },
    {
      title: "Plan d'Actions",
      description: "Étapes d'intégration et feuille de route du réseau CBM",
      icon: Network,
      path: "/cbm/plan-actions",
      gradient: "from-primary/80 to-primary/90"
    }
  ];

  const servicesItems = [
    {
      title: "Adhésion au Réseau",
      description: "Rejoignez le réseau CBM - Formulaire et conditions d'adhésion",
      icon: UserPlus,
      path: "/cbm/adhesion",
      gradient: "from-accent/90 to-accent"
    },
    {
      title: "Demande de Formation",
      description: "Sollicitez une formation adaptée aux besoins de votre établissement",
      icon: GraduationCap,
      path: "/cbm/demande-formation",
      gradient: "from-primary/70 to-primary/90"
    },
    {
      title: "Recherche Documentaire",
      description: "Accédez au catalogue unifié des bibliothèques marocaines",
      icon: Database,
      path: "/cbm/recherche",
      gradient: "from-secondary/90 to-secondary"
    }
  ];

  const quickLinks = [
    {
      title: "Organes de Gestion",
      description: "Bureau CBM et structure organisationnelle",
      icon: Users,
      path: "/cbm/organes-gestion"
    },
    {
      title: "Accès Rapide",
      description: "Charte, règlements et formations",
      icon: BookOpen,
      path: "/cbm/acces-rapide"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner - NYPL Style */}
      <section className="relative overflow-hidden bg-primary h-[650px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={cbmHeroBanner} 
            alt="Bibliothèque" 
            className="w-full h-full object-cover opacity-100"
          />
        </div>
        
        <div className="container mx-auto px-4 h-full relative z-10">
          <div className="flex flex-col justify-center h-full max-w-2xl">
            {/* Badge */}
            <Badge className="w-fit mb-6 bg-accent text-accent-foreground border-0 px-4 py-2 text-sm font-medium">
              RÉSEAU NATIONAL
            </Badge>
            
            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Catalogue des Bibliothèques Marocaines
            </h1>
            
            {/* Description */}
            <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
              Connectez-vous au réseau national de partage de ressources documentaires 
              entre bibliothèques marocaines.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to="/cbm/recherche">
                <Button size="lg" variant="outline" className="bg-background/10 text-primary-foreground border-primary-foreground/30 hover:bg-background/20 h-12 px-8 backdrop-blur-sm">
                  <Database className="w-5 h-5 mr-2" />
                  Rechercher dans le Catalogue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/cbm/recherche-avancee">
                <Button size="lg" variant="outline" className="bg-background/10 text-primary-foreground border-primary-foreground/30 hover:bg-background/20 h-12 px-8 backdrop-blur-sm">
                  <Search className="w-5 h-5 mr-2" />
                  Recherche Avancée
                </Button>
              </Link>
              {!isLoadingRole && userRole && (
                <Link to="/cbm/admin">
                  <Button size="lg" variant="outline" className="bg-background/10 text-primary-foreground border-primary-foreground/30 hover:bg-background/20 h-12 px-8 backdrop-blur-sm">
                    <Settings className="w-5 h-5 mr-2" />
                    Administration CBM
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <main className="container mx-auto px-4 py-16">
        {/* News and Events Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-4">
              Actualités et événements
            </h2>
            <Link to="/digital-library/news-events">
              <Button variant="outline" className="gap-2">
                Voir Tout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <EventsCarousel />
        </section>

        {/* Spotlight Section - Professional Design */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">À la Une</h2>
              <p className="text-muted-foreground">Découvrez les ressources essentielles du réseau CBM</p>
            </div>
            <Link to="/cbm/recherche">
              <Button variant="ghost" className="gap-2 hover:gap-3 transition-all">
                Voir Plus
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {spotlightItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Card className="group h-full hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30">
                    <div className="relative">
                      {/* Subtle gradient background */}
                      <div className={`bg-gradient-to-br ${item.gradient} h-32 flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-pattern-zellige-complex opacity-5"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        <IconComponent className="w-16 h-16 text-white/90 relative z-10 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500" strokeWidth={1.5} />
                      </div>
                      {/* Decorative line */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    </div>
                    
                    <CardHeader className="p-6 space-y-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors flex-1">
                          {item.title}
                        </CardTitle>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 ml-2" />
                      </div>
                      <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Services Section - Enhanced Professional Design */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Nos Services</h2>
            <p className="text-muted-foreground">Des solutions adaptées à vos besoins documentaires</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {servicesItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Card className="group relative h-full hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-border/50 bg-card hover:border-primary/30">
                    {/* Gradient accent on top */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient}`}></div>
                    
                    <CardHeader className="p-8 space-y-4">
                      {/* Icon with background */}
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                          <IconComponent className="w-8 h-8 text-white" strokeWidth={2} />
                        </div>
                        {/* Decorative glow effect */}
                        <div className={`absolute inset-0 w-16 h-16 rounded-xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}></div>
                      </div>
                      
                      <div className="space-y-2">
                        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed min-h-[3rem]">
                          {item.description}
                        </CardDescription>
                      </div>

                      {/* Call to action */}
                      <div className="flex items-center text-primary text-sm font-medium pt-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span>En savoir plus</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardHeader>

                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 bg-pattern-zellige-complex opacity-[0.02] pointer-events-none"></div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Quick Links Section - Refined Design */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Accès Rapide</h2>
            <p className="text-muted-foreground">Informations et ressources utiles</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {quickLinks.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border border-border/50 h-full bg-gradient-to-br from-card to-card/50 hover:border-primary/30">
                    <CardHeader className="flex flex-row items-center gap-5 p-6">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                          <IconComponent className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors font-semibold">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {item.description}
                        </CardDescription>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="bg-primary text-primary-foreground rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-2 text-center">Le Réseau CBM en Chiffres</h2>
            <p className="text-center text-primary-foreground/90 mb-10">
              Un réseau en constante croissance au service de la recherche et du savoir
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">150+</div>
                <div className="text-sm text-primary-foreground/80">Bibliothèques Membres</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">2M+</div>
                <div className="text-sm text-primary-foreground/80">Documents Catalogués</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">50K+</div>
                <div className="text-sm text-primary-foreground/80">Utilisateurs Actifs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">750K+</div>
                <div className="text-sm text-primary-foreground/80">Consultations</div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section>
          <div className="bg-muted rounded-lg p-12 text-center">
            <Library className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Rejoignez le Réseau CBM
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Devenez membre du réseau et bénéficiez d'un accès privilégié aux ressources 
              documentaires de toutes les bibliothèques marocaines participantes.
            </p>
            <Link to="/cbm/adhesion">
              <Button size="lg" className="h-12 px-8">
                <UserPlus className="w-5 h-5 mr-2" />
                Adhérer Maintenant
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Outils globaux (Accessibilité + Chatbot) */}
      <GlobalAccessibilityTools />
    </div>
  );
}
