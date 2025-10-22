import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, FileText, Download } from "lucide-react";
import CulturalCalendar from "@/components/cultural-activities/CulturalCalendar";
import EventsCarousel from "@/components/cultural-activities/EventsCarousel";
import logoBnrm from "@/assets/logo-bnrm-officiel.png";

const CulturalActivities = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#002B45] to-[#004d7a] text-white py-16 overflow-hidden">
        {/* Watermark BNRM Logo */}
        <div 
          className="absolute inset-0 flex items-center justify-center opacity-5"
          style={{
            backgroundImage: `url(${logoBnrm})`,
            backgroundSize: '40%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Activités culturelles de la Bibliothèque Nationale du Royaume du Maroc
            </h1>
            <p className="text-lg md:text-xl text-blue-100">
              Découvrez la programmation culturelle de la BNRM, réservez vos espaces, participez aux événements ou proposez vos activités.
            </p>
          </div>
        </div>
      </section>

      {/* Events Carousel Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#002B45] mb-8 text-center">
            Événements à venir
          </h2>
          <EventsCarousel />
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#002B45] mb-8 text-center">
            Calendrier des activités
          </h2>
          <CulturalCalendar />
        </div>
      </section>

      {/* Navigation Cards Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#002B45] mb-8 text-center">
            Nos services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Réservation des espaces */}
            <Link to="/cultural-activities/booking">
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border-2 hover:border-[#D4AF37] rounded-2xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Calendar className="h-8 w-8 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#002B45]">
                    Demande de réservation des espaces
                  </h3>
                  <p className="text-sm text-[#333333]">
                    Louer une salle, un espace d'exposition ou un auditorium pour un événement culturel.
                  </p>
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#b8941f] text-white rounded-2xl">
                    Réserver un espace →
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Card 2: Visites guidées */}
            <Link to="/cultural-activities/guided-tours">
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border-2 hover:border-[#D4AF37] rounded-2xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <MapPin className="h-8 w-8 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#002B45]">
                    Réservation de visites guidées
                  </h3>
                  <p className="text-sm text-[#333333]">
                    Planifier une visite individuelle ou de groupe des espaces de la BNRM.
                  </p>
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#b8941f] text-white rounded-2xl">
                    Réserver une visite →
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Card 3: Partenariat */}
            <Link to="/cultural-activities/partnership">
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border-2 hover:border-[#D4AF37] rounded-2xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#002B45]">
                    Demande de partenariat
                  </h3>
                  <p className="text-sm text-[#333333]">
                    Proposer une collaboration culturelle, artistique ou éducative avec la BNRM.
                  </p>
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#b8941f] text-white rounded-2xl">
                    Soumettre un partenariat →
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Card 4: Participation à la programmation */}
            <Link to="/cultural-activities/programming">
              <Card className="h-full hover:shadow-xl transition-all duration-300 group border-2 hover:border-[#D4AF37] rounded-2xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <FileText className="h-8 w-8 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#002B45]">
                    Participation à la programmation
                  </h3>
                  <p className="text-sm text-[#333333]">
                    Soumettre une proposition d'activité pour enrichir la programmation culturelle.
                  </p>
                  <Button className="w-full bg-[#D4AF37] hover:bg-[#b8941f] text-white rounded-2xl">
                    Proposer une activité →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#002B45] mb-6 text-center">
              Documents et règlements
            </h2>
            
            <div className="space-y-4 mb-6">
              <a 
                href="/uploads/fiche_technique.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border-2 border-[#D4AF37]/30 rounded-xl hover:bg-[#D4AF37]/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Download className="h-6 w-6 text-[#D4AF37]" />
                  <span className="font-semibold text-[#002B45]">
                    Télécharger la fiche technique des espaces
                  </span>
                </div>
                <span className="text-[#D4AF37]">→</span>
              </a>

              <a 
                href="/uploads/reglement_utilisation.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border-2 border-[#D4AF37]/30 rounded-xl hover:bg-[#D4AF37]/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Download className="h-6 w-6 text-[#D4AF37]" />
                  <span className="font-semibold text-[#002B45]">
                    Télécharger le règlement d'utilisation
                  </span>
                </div>
                <span className="text-[#D4AF37]">→</span>
              </a>
            </div>

            <div className="bg-[#D4AF37]/10 border-l-4 border-[#D4AF37] p-4 rounded">
              <p className="text-sm text-[#333333]">
                ⚠️ <strong>Important :</strong> La lecture et l'acceptation du règlement sont obligatoires avant toute réservation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-8 bg-[#002B45] text-white">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="text-sm">
            Plateforme des Activités culturelles – Bibliothèque Nationale du Royaume du Maroc
          </p>
          <Link to="/" className="text-[#D4AF37] hover:underline text-sm">
            ← Retour au portail principal BNRM
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CulturalActivities;
