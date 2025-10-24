import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import BookingWizard from "@/components/cultural-activities/BookingWizard";
import { BookingCartProvider } from "@/contexts/BookingCartContext";

export default function CulturalActivitiesBooking() {
  return (
    <BookingCartProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#FAF9F5' }}>
        <Header />
      
      <div className="container mx-auto px-4 py-12">
        <Link to="/cultural-activities">
          <Button 
            variant="ghost" 
            className="mb-6 border border-[#D4AF37]/20 hover:bg-white/50 hover:border-[#D4AF37]/40 transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux activités culturelles
          </Button>
        </Link>

        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-light text-[#002B45] mb-4 tracking-tight">
            Réservation des espaces culturels
          </h1>
          <p className="text-lg text-[#002B45]/70 max-w-2xl mx-auto font-light">
            Réservez nos espaces pour vos événements culturels et artistiques
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <BookingWizard />
        </div>
      </div>

        <Footer />
      </div>
    </BookingCartProvider>
  );
}
