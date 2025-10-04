import { Link } from "react-router-dom";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, TrendingUp, Database, ArrowLeft, CheckCircle2 } from "lucide-react";
import mosaicBanner from "@/assets/kitab-banner-mosaic-purple.jpg";

export default function KitabAbout() {
  const objectives = [
    {
      icon: Database,
      title: "Répertorier les Éditeurs",
      description: "Lister l'ensemble des éditeurs du Royaume ainsi que leurs publications pour une visibilité complète du paysage éditorial marocain."
    },
    {
      icon: Users,
      title: "Structurer la Communauté",
      description: "Structurer et formaliser la communauté éditoriale en créant un réseau professionnel solide et interconnecté."
    },
    {
      icon: TrendingUp,
      title: "Promouvoir l'Industrie Nationale",
      description: "Mettre en avant les dernières publications marocaines et les prochaines sorties pour promouvoir l'industrie nationale du livre."
    },
    {
      icon: Target,
      title: "Faciliter la Connexion",
      description: "Proposer une variété de métadonnées pour chaque publication afin de faciliter la connexion avec le public cible."
    }
  ];

  const features = [
    "Bibliothèque bibliographique numérique entièrement gratuite",
    "Mise à jour régulière depuis l'application de Dépôt Légal",
    "Métadonnées enrichies (informations, couvertures, sommaires)",
    "Téléchargement de bibliographies numériques en arabe et français",
    "Accès à l'historique complet des publications marocaines",
    "Plateforme accessible à tous les professionnels du secteur"
  ];

  return (
    <div className="min-h-screen bg-background">
      <KitabHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden h-[400px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={mosaicBanner} 
            alt="Mosaïque Marocaine" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--kitab-primary))]/70 to-[hsl(var(--kitab-secondary))]/70"></div>
        
        <div className="container mx-auto px-4 relative z-10 h-full flex items-start pt-16">
          <div className="w-full">
            <Link to="/kitab">
              <Button variant="ghost" className="text-white hover:text-white/80 mb-6">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour au Portail Kitab
              </Button>
            </Link>
            
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                À Propos de Kitab
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                La plateforme digitale dédiée à l'édition marocaine et à la promotion 
                de l'industrie nationale du livre
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Mission Statement */}
        <section className="mb-16">
          <Card className="border-0 shadow-[var(--shadow-kitab-strong)] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[hsl(var(--kitab-neutral-light))] to-white p-8">
              <CardTitle className="text-3xl text-[hsl(var(--kitab-primary))]">
                Notre Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Kitab est une bibliothèque bibliographique numérique gratuite, entièrement dédiée aux 
                publications nationales. Elle est régulièrement mise à jour à partir des données de 
                l'application de Dépôt Légal lors de la réception des ouvrages (informations, couvertures 
                et sommaires) selon des critères définis.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Notre plateforme vise à promouvoir l'industrie nationale du livre en mettant en avant 
                les dernières publications marocaines et les prochaines sorties, tout en offrant une 
                variété de métadonnées pour faciliter la connexion avec le public cible.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Objectives */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground border-l-4 border-[hsl(var(--kitab-primary))] pl-4 mb-8">
            Nos Objectifs
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {objectives.map((objective, index) => {
              const IconComponent = objective.icon;
              return (
                <Card key={index} className="border-0 shadow-[var(--shadow-kitab)] hover:shadow-[var(--shadow-kitab-strong)] transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-[hsl(var(--kitab-primary))]/20 to-[hsl(var(--kitab-accent))]/10 p-3 rounded-lg">
                        <IconComponent className="w-8 h-8 text-[hsl(var(--kitab-primary))]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {objective.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {objective.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground border-l-4 border-[hsl(var(--kitab-primary))] pl-4 mb-8">
            Caractéristiques de la Plateforme
          </h2>
          
          <Card className="border-0 shadow-[var(--shadow-kitab-strong)]">
            <CardContent className="p-8">
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[hsl(var(--kitab-accent))] flex-shrink-0 mt-0.5" />
                    <p className="text-lg text-muted-foreground">{feature}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section>
          <Card className="border-0 shadow-[var(--shadow-kitab-strong)] overflow-hidden">
            <div className="bg-gradient-to-r from-[hsl(var(--kitab-primary))] to-[hsl(var(--kitab-secondary))] p-12 text-center text-white relative">
              <div 
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'var(--pattern-kitab-books)' }}
              />
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">
                  Prêt à Explorer ?
                </h3>
                <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                  Découvrez les richesses de l'édition marocaine à travers notre plateforme
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link to="/kitab/new-publications">
                    <Button size="lg" className="bg-white text-[hsl(var(--kitab-primary))] hover:bg-white/90 h-12 px-8">
                      Nouvelles Parutions
                    </Button>
                  </Link>
                  <Link to="/kitab/bibliography">
                    <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 h-12 px-8">
                      Bibliographie Nationale
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
