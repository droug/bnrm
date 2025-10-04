import { Link } from "react-router-dom";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Info } from "lucide-react";
import mosaicBanner from "@/assets/kitab-banner-mosaic-purple.jpg";

export default function KitabUpcoming() {
  return (
    <div className="min-h-screen bg-background">
      <KitabHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden h-[400px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={mosaicBanner} 
            alt="Mosaïque Marocaine" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--kitab-secondary))]/70 to-[hsl(var(--kitab-accent))]/70"></div>
        
        <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center">
          <Link to="/kitab">
            <Button variant="ghost" className="text-white hover:text-white/80 mb-6">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au Portail Kitab
            </Button>
          </Link>
          
          <div className="max-w-4xl mx-auto text-center">
            <Clock className="w-16 h-16 text-white mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              À Paraître
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Découvrez les prochaines sorties et nouvelles publications
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Coming Soon Notice */}
        <Card className="border-0 shadow-[var(--shadow-kitab-strong)] max-w-3xl mx-auto">
          <CardContent className="p-12 text-center">
            <div className="bg-gradient-to-br from-[hsl(var(--kitab-primary))]/10 to-[hsl(var(--kitab-accent))]/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Info className="w-12 h-12 text-[hsl(var(--kitab-primary))]" />
            </div>
            
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Section en Cours de Développement
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Cette section sera bientôt disponible et présentera les prochaines parutions 
              et publications à venir de l'édition marocaine.
            </p>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/kitab/new-publications">
                <Button size="lg" className="bg-[hsl(var(--kitab-primary))] hover:bg-[hsl(var(--kitab-primary-dark))] text-white">
                  Voir les Nouvelles Parutions
                </Button>
              </Link>
              <Link to="/kitab">
                <Button size="lg" variant="outline">
                  Retour à l'Accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
