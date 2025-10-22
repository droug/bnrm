import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Handshake } from "lucide-react";
import PartnershipWizard from "@/components/cultural-activities/PartnershipWizard";

const CulturalActivitiesPartnership = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5] font-['Segoe_UI',_'Noto_Sans',_sans-serif]">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <Link to="/cultural-activities">
          <Button variant="ghost" className="mb-6 text-[#333333] hover:text-[#333333]/80 transition-all duration-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux activités culturelles
          </Button>
        </Link>

        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/10 mb-4 transition-all duration-300">
            <Handshake className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-bold text-[#333333] mb-2">Demande de partenariat</h1>
          <p className="text-[#333333]/70">Collaborons pour promouvoir la culture marocaine</p>
        </div>

        <PartnershipWizard />
      </div>

      <Footer />
    </div>
  );
};

export default CulturalActivitiesPartnership;
