import { Link } from "react-router-dom";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookText, Lightbulb, Sparkles, BookMarked, Library, Mail, ArrowRight, FileText, Clock } from "lucide-react";

export default function KitabPortal() {
  const mainFeatures = [
    {
      title: "À Propos",
      description: "Découvrez Kitab, la plateforme dédiée à l'édition marocaine",
      icon: Lightbulb,
      path: "/kitab/about",
      gradient: "from-kitab-primary/90 to-kitab-primary"
    },
    {
      title: "À Paraître",
      description: "Les prochaines sorties et nouvelles publications",
      icon: Clock,
      path: "/kitab/upcoming",
      gradient: "from-kitab-secondary/90 to-kitab-secondary"
    },
    {
      title: "Nouvelles Parutions",
      description: "Explorez les dernières publications nationales",
      icon: Sparkles,
      path: "/kitab/new-publications",
      gradient: "from-kitab-accent/90 to-kitab-accent"
    },
    {
      title: "Bibliographie Nationale",
      description: "Recherche avancée par support et par année",
      icon: BookMarked,
      path: "/kitab/bibliography",
      gradient: "from-kitab-primary-dark/90 to-kitab-primary"
    }
  ];

  const quickAccess = [
    {
      title: "Questions & Réponses",
      description: "Contactez-nous à kitab@bnrm.ma pour vos suggestions",
      icon: Mail,
      path: "/kitab/faq"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <KitabHeader />
      
      {/* Hero Section - Kitab Style */}
      <section className="relative overflow-hidden h-[600px]">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'var(--pattern-kitab-books)' }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--kitab-primary))]/70 via-[hsl(var(--kitab-secondary))]/60 to-[hsl(var(--kitab-accent))]/50"></div>
        
        <div className="container mx-auto px-4 h-full relative z-10">
          <div className="flex flex-col justify-center h-full max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge className="w-fit mx-auto mb-6 bg-[hsl(var(--kitab-accent))] text-white border-0 px-6 py-2 text-sm font-medium">
              PLATEFORME NATIONALE
            </Badge>
            
            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Kitab
            </h1>
            
            {/* Subtitle */}
            <p className="text-2xl text-white/95 mb-4 font-semibold">
              Plateforme Digitale de l'Édition au Maroc
            </p>
            
            {/* Description */}
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Bibliothèque bibliographique numérique gratuite dédiée aux publications nationales. 
              Découvrez, explorez et promouvez l'industrie marocaine du livre.
            </p>
            
            {/* CTA Button */}
            <div className="flex gap-4 justify-center">
              <Link to="/kitab/new-publications">
                <Button size="lg" className="bg-white text-[hsl(var(--kitab-primary))] hover:bg-white/90 h-14 px-8 text-lg shadow-[var(--shadow-kitab-strong)]">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Nouvelles Parutions
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/kitab/bibliography">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 h-14 px-8 text-lg">
                  <BookMarked className="w-5 h-5 mr-2" />
                  Bibliographie Nationale
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <main className="container mx-auto px-4 py-16">
        {/* Main Features Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground border-l-4 border-[hsl(var(--kitab-primary))] pl-4">
              Explorer Kitab
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {mainFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Link key={feature.path} to={feature.path}>
                  <Card className="group h-full hover:shadow-[var(--shadow-kitab-strong)] transition-all duration-500 cursor-pointer overflow-hidden border-0 shadow-[var(--shadow-kitab)]">
                    {/* Icon Header with Gradient */}
                    <div className={`bg-gradient-to-br ${feature.gradient} h-40 flex items-center justify-center relative`}>
                      <div 
                        className="absolute inset-0 opacity-15"
                        style={{ backgroundImage: 'var(--pattern-kitab-books)' }}
                      ></div>
                      <IconComponent className="w-20 h-20 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                    </div>
                    
                    <CardHeader className="p-6">
                      <CardTitle className="text-lg font-semibold group-hover:text-[hsl(var(--kitab-primary))] transition-colors mb-2">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground border-l-4 border-[hsl(var(--kitab-primary))] pl-4 mb-8">
            Accès Rapide
          </h2>

          <div className="grid gap-6">
            {quickAccess.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Card className="group hover:shadow-[var(--shadow-kitab-strong)] transition-all duration-500 cursor-pointer border-0 shadow-[var(--shadow-kitab)] bg-gradient-to-r from-white to-[hsl(var(--kitab-neutral-light))]/30">
                    <CardHeader className="flex flex-row items-start gap-4 p-8">
                      <div className="bg-gradient-to-br from-[hsl(var(--kitab-primary))]/20 to-[hsl(var(--kitab-accent))]/10 p-4 rounded-xl group-hover:scale-105 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-[hsl(var(--kitab-primary))]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-3 group-hover:text-[hsl(var(--kitab-primary))] transition-colors font-semibold">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {item.description}
                        </CardDescription>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[hsl(var(--kitab-primary))] group-hover:translate-x-2 transition-all duration-300" />
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-[hsl(var(--kitab-primary))] to-[hsl(var(--kitab-secondary))] text-white rounded-2xl p-12 shadow-[var(--shadow-kitab-strong)] relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'var(--pattern-kitab-books)' }}
            />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2 text-center">Kitab en Chiffres</h2>
              <p className="text-center text-white/90 mb-10">
                Une plateforme en constante évolution au service de l'édition marocaine
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">500+</div>
                  <div className="text-sm text-white/80">Éditeurs Référencés</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">15K+</div>
                  <div className="text-sm text-white/80">Publications Cataloguées</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">2K+</div>
                  <div className="text-sm text-white/80">Nouvelles Parutions/An</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">100%</div>
                  <div className="text-sm text-white/80">Gratuit & Accessible</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section>
          <div className="bg-gradient-to-r from-[hsl(var(--kitab-neutral-light))] to-white rounded-2xl p-12 text-center shadow-[var(--shadow-kitab)]">
            <Library className="w-16 h-16 mx-auto mb-6 text-[hsl(var(--kitab-primary))]" />
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Rejoignez l'Écosystème Kitab
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Éditeurs, auteurs, libraires : participez à la promotion de l'industrie nationale du livre. 
              Contactez-nous pour intégrer vos publications dans Kitab.
            </p>
            <Link to="/kitab/faq">
              <Button size="lg" className="bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary-dark))] text-white h-12 px-8 shadow-[var(--shadow-kitab)]">
                <Mail className="w-5 h-5 mr-2" />
                Nous Contacter
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
