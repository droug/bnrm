import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PartnershipWizard from "@/components/cultural-activities/PartnershipWizard";

const CulturalActivitiesPartnership = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <Link to="/cultural-activities">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux activités culturelles
          </Button>
        </Link>

        <PartnershipWizard />
      </div>

      <Footer />
    </div>
  );
};

export default CulturalActivitiesPartnership;
