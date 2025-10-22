import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PartnershipsBackoffice from "@/components/cultural-activities/PartnershipsBackoffice";

const PartnershipsBackofficePage = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5] font-['Segoe_UI','Noto_Sans',sans-serif]">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <Link to="/admin/activites-culturelles">
          <Button variant="ghost" className="mb-6 text-[#333333] hover:text-[#333333]/80 transition-all duration-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'administration des activités culturelles
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#333333] mb-2">Gestion des partenariats</h1>
          <p className="text-[#333333]/70">
            Gérez les demandes de partenariat soumises par les organismes
          </p>
        </div>

        <PartnershipsBackoffice />
      </div>

      <Footer />
    </div>
  );
};

export default PartnershipsBackofficePage;
