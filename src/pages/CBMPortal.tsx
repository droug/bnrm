import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Target, Users, UserPlus, Database, BookOpen, ArrowRight, Library, FileText, GraduationCap } from "lucide-react";
import cbmHeroBanner from "@/assets/cbm-hero-banner.jpg";

export default function CBMPortal() {
  const spotlightItems = [
    {
      title: "Objectifs du Réseau CBM",
      description: "Découvrez les missions et objectifs du Catalogue des Bibliothèques Marocaines",
      icon: Target,
      path: "/cbm/objectifs",
      gradient: "from-[hsl(var(--cbm-primary))] to-[hsl(var(--cbm-primary-light))]"
    },
    {
      title: "Adhésion au Réseau",
      description: "Rejoignez le réseau CBM - Formulaire et conditions d'adhésion",
      icon: UserPlus,
      path: "/cbm/adhesion",
      gradient: "from-[hsl(var(--cbm-secondary))] to-[hsl(var(--cbm-secondary-light))]"
    },
    {
      title: "Recherche Documentaire",
      description: "Accédez au catalogue unifié des bibliothèques marocaines",
      icon: Database,
      path: "/cbm/recherche",
      gradient: "from-[hsl(var(--cbm-accent))] to-[hsl(var(--cbm-accent-glow))]"
    },
    {
      title: "Plan d'Actions",
      description: "Étapes d'intégration et feuille de route du réseau CBM",
      icon: Network,
      path: "/cbm/plan-actions",
      gradient: "from-[hsl(var(--cbm-primary-dark))] to-[hsl(var(--cbm-primary))]"
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
      
      {/* Hero Banner - CBM avec charte graphique distinctive */}
      <section className="relative overflow-hidden h-[650px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={cbmHeroBanner} 
            alt="Bibliothèque" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* CBM Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'var(--pattern-cbm-network)' }}
        />
        
        {/* Gradient overlay CBM */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--cbm-primary))]/60 via-[hsl(var(--cbm-secondary))]/40 to-[hsl(var(--cbm-accent))]/50"></div>
        
        <div className="container mx-auto px-4 h-full relative z-10">
          <div className="flex flex-col justify-center h-full max-w-3xl">
            {/* Content box avec glassmorphism CBM */}
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-[var(--shadow-cbm-strong)] border border-[hsl(var(--cbm-primary))]/20">
              {/* Badge */}
              <Badge className="w-fit mb-6 bg-[hsl(var(--cbm-secondary))] text-white border-0 px-4 py-2 text-sm font-medium">
                RÉSEAU NATIONAL
              </Badge>
              
              {/* Main Title */}
              <h1 className="text-5xl md:text-6xl font-bold text-[hsl(var(--cbm-primary))] mb-6 leading-tight">
                Catalogue des Bibliothèques Marocaines
              </h1>
              
              {/* Description */}
              <p className="text-xl text-[hsl(var(--cbm-neutral))] mb-8 leading-relaxed">
                Connectez-vous au réseau national de partage de ressources documentaires 
                entre bibliothèques marocaines.
              </p>
              
              {/* CTA Button */}
              <div>
                <Link to="/cbm/recherche">
                  <Button size="lg" className="bg-[hsl(var(--cbm-primary))] hover:bg-[hsl(var(--cbm-primary-dark))] text-white h-12 px-8 shadow-[var(--shadow-cbm)]">
                    <Database className="w-5 h-5 mr-2" />
                    Rechercher dans le Catalogue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <main className="container mx-auto px-4 py-16">
        {/* Spotlight Section - NYPL Style */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-4">
              À la Une
            </h2>
            <Link to="/cbm/recherche">
              <Button variant="outline" className="gap-2">
                Voir Plus
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {spotlightItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Card className="group h-full transition-all duration-500 cursor-pointer overflow-hidden border border-[hsl(var(--cbm-primary))]/20 shadow-[var(--shadow-cbm)] hover:shadow-[var(--shadow-cbm-strong)]">
                    {/* Icon Header with CBM Gradient */}
                    <div className={`bg-gradient-to-br ${item.gradient} h-40 flex items-center justify-center relative`}>
                      <div 
                        className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'var(--pattern-cbm-network)' }}
                      />
                      <IconComponent className="w-20 h-20 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                    </div>
                    
                    <CardHeader className="p-6 bg-gradient-to-b from-white to-[hsl(var(--cbm-neutral-light))]">
                      <CardTitle className="text-lg font-semibold group-hover:text-[hsl(var(--cbm-primary))] transition-colors mb-2">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-[hsl(var(--cbm-neutral))]">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-4 mb-8">
            Liens Rapides
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {quickLinks.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Card className="group transition-all duration-500 cursor-pointer border border-[hsl(var(--cbm-primary))]/20 shadow-[var(--shadow-cbm)] hover:shadow-[var(--shadow-cbm-strong)] h-full bg-white/95 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-start gap-4 p-8">
                      <div 
                        className="bg-gradient-to-br from-[hsl(var(--cbm-secondary))]/20 to-[hsl(var(--cbm-accent))]/15 p-4 rounded-xl group-hover:scale-105 transition-transform duration-300 border border-[hsl(var(--cbm-primary))]/10"
                        style={{ backgroundImage: 'var(--pattern-cbm-network)', backgroundSize: '30px 30px' }}
                      >
                        <IconComponent className="w-8 h-8 text-[hsl(var(--cbm-primary))]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-3 group-hover:text-[hsl(var(--cbm-primary))] transition-colors font-semibold">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed text-[hsl(var(--cbm-neutral))]">
                          {item.description}
                        </CardDescription>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[hsl(var(--cbm-neutral))]/60 group-hover:text-[hsl(var(--cbm-primary))] group-hover:translate-x-2 transition-all duration-300" />
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Stats Section avec charte CBM */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-[hsl(var(--cbm-primary))] via-[hsl(var(--cbm-secondary))] to-[hsl(var(--cbm-accent))] text-white rounded-2xl p-12 shadow-[var(--shadow-cbm-strong)] relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'var(--pattern-cbm-network)' }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2 text-center">Le Réseau CBM en Chiffres</h2>
              <p className="text-center text-white/90 mb-10">
                Un réseau en constante croissance au service de la recherche et du savoir
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-4xl font-bold mb-2">150+</div>
                  <div className="text-sm text-white/80">Bibliothèques Membres</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-4xl font-bold mb-2">2M+</div>
                  <div className="text-sm text-white/80">Documents Catalogués</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-4xl font-bold mb-2">50K+</div>
                  <div className="text-sm text-white/80">Utilisateurs Actifs</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-4xl font-bold mb-2">98%</div>
                  <div className="text-sm text-white/80">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action avec charte CBM */}
        <section>
          <div className="bg-gradient-to-br from-[hsl(var(--cbm-neutral-light))] to-white rounded-2xl p-12 text-center border border-[hsl(var(--cbm-primary))]/20 shadow-[var(--shadow-cbm)] relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'var(--pattern-cbm-network)' }}
            />
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[hsl(var(--cbm-primary))] to-[hsl(var(--cbm-secondary))] rounded-2xl flex items-center justify-center shadow-[var(--shadow-cbm)]">
                <Library className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-[hsl(var(--cbm-primary))] mb-4">
                Rejoignez le Réseau CBM
              </h3>
              <p className="text-lg text-[hsl(var(--cbm-neutral))] max-w-2xl mx-auto mb-8">
                Devenez membre du réseau et bénéficiez d'un accès privilégié aux ressources 
                documentaires de toutes les bibliothèques marocaines participantes.
              </p>
              <Link to="/cbm/adhesion">
                <Button size="lg" className="h-12 px-8 bg-[hsl(var(--cbm-primary))] hover:bg-[hsl(var(--cbm-primary-dark))] text-white shadow-[var(--shadow-cbm)]">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Adhérer Maintenant
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
