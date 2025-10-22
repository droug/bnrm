import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CulturalActivitiesProgramming = () => {
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

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[#002B45] mb-6">
            Participation à la programmation
          </h1>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-lg text-[#333333] mb-6">
              Formulaire de proposition d'activité à venir...
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CulturalActivitiesProgramming;
