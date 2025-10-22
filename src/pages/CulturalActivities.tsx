import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, MapPin, Users, Palette, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CulturalCalendar from "@/components/cultural-activities/CulturalCalendar";
import EventsCarousel from "@/components/cultural-activities/EventsCarousel";

export default function CulturalActivities() {
  const navigationLinks = [
    {
      icon: MapPin,
      title: "Demande de réservation des espaces",
      description: "Réservez nos espaces pour vos événements culturels",
      href: "/cultural-activities/booking",
    },
    {
      icon: Users,
      title: "Réservation de visites guidées",
      description: "Organisez une visite guidée de la BNRM",
      href: "/cultural-activities/guided-tours",
    },
    {
      icon: Users,
      title: "Demande de partenariat",
      description: "Proposez un partenariat culturel avec la BNRM",
      href: "/cultural-activities/partnership",
    },
    {
      icon: Palette,
      title: "Demande de participation à la programmation",
      description: "Soumettez une proposition pour notre programmation culturelle",
      href: "/cultural-activities/programming",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary-dark to-secondary text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Activités culturelles
              </h1>
              <p className="text-lg md:text-xl opacity-90">
                Découvrez nos espaces culturels et participez à nos événements
              </p>
            </div>
          </div>
        </section>

        {/* Events Carousel */}
        <section className="py-12 bg-accent/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
              Événements à venir
            </h2>
            <EventsCarousel />
          </div>
        </section>

        {/* Calendar Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
              Calendrier des activités
            </h2>
            <CulturalCalendar />
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="py-12 bg-accent/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
              Nos services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {navigationLinks.map((link, index) => (
                <Link key={index} to={link.href}>
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <link.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{link.title}</CardTitle>
                          <CardDescription>{link.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Documents à télécharger
                </CardTitle>
                <CardDescription>
                  Consultez nos documents officiels pour plus d'informations
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1" asChild>
                  <a href="/documents/fiche-technique-espaces.pdf" download>
                    <FileText className="mr-2 h-4 w-4" />
                    Fiche technique des espaces
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href="/documents/reglement-utilisation.pdf" download>
                    <FileText className="mr-2 h-4 w-4" />
                    Règlement d'utilisation
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
