import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CulturalActivitiesPartnership() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-accent/20 to-accent/5 py-12">
          <div className="container mx-auto px-4">
            <Link to="/cultural-activities">
              <Button variant="ghost" className="mb-4 rounded-2xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux activités culturelles
              </Button>
            </Link>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4 text-foreground">
                Demande de partenariat
              </h1>
              <p className="text-lg text-muted-foreground">
                Proposer une collaboration culturelle, artistique ou éducative avec la BNRM
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-muted-foreground">
                Formulaire de demande de partenariat à venir...
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
