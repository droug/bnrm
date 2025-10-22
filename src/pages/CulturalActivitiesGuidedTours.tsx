import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import GuidedTourWizard from "@/components/guided-tours/GuidedTourWizard";

const CulturalActivitiesGuidedTours = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <Link to="/cultural-activities">
          <Button variant="ghost" className="mb-6 rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux activités culturelles
          </Button>
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Réservation de visites guidées
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les trésors de la Bibliothèque Nationale du Royaume du Maroc 
            lors d'une visite guidée personnalisée
          </p>
        </div>

        <GuidedTourWizard />
      </div>

      <Footer />
    </div>
  );
};

export default CulturalActivitiesGuidedTours;
