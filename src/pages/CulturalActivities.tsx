import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, MapPin, Users, Palette, FileText, ArrowRight, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CulturalCalendar from "@/components/cultural-activities/CulturalCalendar";
import EventsCarousel from "@/components/cultural-activities/EventsCarousel";
import logoBNRM from "@/assets/logo-bnrm.png";

export default function CulturalActivities() {
  const navigationLinks = [
    {
      icon: Building2,
      title: "Demande de réservation des espaces",
      description: "Louer une salle, un espace d'exposition ou un auditorium pour un événement culturel.",
      href: "/cultural-activities/booking",
      buttonText: "Réserver un espace",
    },
    {
      icon: Users,
      title: "Réservation de visites guidées",
      description: "Planifier une visite individuelle ou de groupe des espaces de la BNRM.",
      href: "/cultural-activities/guided-tours",
      buttonText: "Réserver une visite",
    },
    {
      icon: Users,
      title: "Demande de partenariat",
      description: "Proposer une collaboration culturelle, artistique ou éducative avec la BNRM.",
      href: "/cultural-activities/partnership",
      buttonText: "Soumettre un partenariat",
    },
    {
      icon: Palette,
      title: "Participation à la programmation",
      description: "Soumettre une proposition d'activité pour enrichir la programmation culturelle.",
      href: "/cultural-activities/programming",
      buttonText: "Proposer une activité",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section with watermark */}
        <section className="relative bg-background py-16 overflow-hidden">
          {/* Watermark logo */}
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none"
            style={{
              backgroundImage: `url(${logoBNRM})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: '400px',
            }}
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Activités culturelles de la Bibliothèque Nationale du Royaume du Maroc
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Découvrez la programmation culturelle de la BNRM, réservez vos espaces, participez aux événements ou proposez vos activités.
              </p>
            </div>
          </div>
        </section>

        {/* Events Carousel */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
              Événements à venir
            </h2>
            <EventsCarousel />
          </div>
        </section>

        {/* Calendar Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
              Calendrier des activités
            </h2>
            <CulturalCalendar />
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
              Nos services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {navigationLinks.map((link, index) => (
                <Card 
                  key={index} 
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 rounded-2xl"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-accent/20 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <link.icon className="h-8 w-8 text-accent-foreground" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 text-foreground">{link.title}</CardTitle>
                        <CardDescription className="text-sm">{link.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link to={link.href}>
                      <Button 
                        className="w-full rounded-2xl transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground"
                        variant="outline"
                      >
                        {link.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-6 text-foreground">
                Documents et règlements
              </h2>
              
              <Alert className="mb-6 border-accent/30 bg-accent/10">
                <AlertDescription className="text-center text-accent-foreground">
                  ⚖️ La lecture et l'acceptation du règlement sont obligatoires avant toute réservation.
                </AlertDescription>
              </Alert>

              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <FileText className="h-6 w-6 text-accent-foreground" />
                    Documents à télécharger
                  </CardTitle>
                  <CardDescription>
                    Consultez nos documents officiels pour plus d'informations
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-2xl transition-all duration-300 hover:bg-accent hover:text-accent-foreground" 
                    asChild
                  >
                    <a href="/uploads/fiche_technique.pdf" download>
                      <FileText className="mr-2 h-4 w-4" />
                      Fiche technique des espaces
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-2xl transition-all duration-300 hover:bg-accent hover:text-accent-foreground" 
                    asChild
                  >
                    <a href="/uploads/reglement_utilisation.pdf" download>
                      <FileText className="mr-2 h-4 w-4" />
                      Règlement d'utilisation
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <section className="py-8 bg-background border-t">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Plateforme des Activités culturelles – Bibliothèque Nationale du Royaume du Maroc
            </p>
            <Link to="/" className="text-sm text-accent-foreground hover:text-accent transition-colors duration-300">
              ← Retour au portail principal BNRM
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
