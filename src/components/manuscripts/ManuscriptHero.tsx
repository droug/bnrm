import { Crown, Star, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import manuscriptBanner from "@/assets/manuscript-banner.jpg";

interface ManuscriptHeroProps {
  userAccessLevel: string;
  isAuthenticated: boolean;
  searchBar: React.ReactNode;
}

export function ManuscriptHero({ 
  userAccessLevel, 
  isAuthenticated,
  searchBar 
}: ManuscriptHeroProps) {
  return (
    <section className="relative mb-12 py-20 px-8 rounded-3xl border-4 border-gold/40 overflow-hidden shadow-2xl">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${manuscriptBanner})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-royal/50" />
      <div className="absolute inset-0 bg-pattern-zellige-complex opacity-20" />
      <div className="absolute inset-0 bg-pattern-moroccan-stars opacity-15" />
      
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Crown className="h-10 w-10 text-gold animate-pulse drop-shadow-lg" />
          <h1 className="text-5xl font-moroccan font-bold text-white drop-shadow-2xl">
            Plateforme des Manuscrits Numérisés
          </h1>
          <Crown className="h-10 w-10 text-gold animate-pulse drop-shadow-lg" />
        </div>
        <p className="text-xl text-white/95 mb-6 max-w-3xl mx-auto drop-shadow-md font-elegant">
          Découvrez les trésors manuscrits de la BNRM et des institutions partenaires marocaines
        </p>
        
        <div className="flex justify-center space-x-2 mb-6">
          {[...Array(7)].map((_, i) => (
            <Star 
              key={i} 
              className="h-5 w-5 text-gold fill-gold animate-pulse drop-shadow-lg" 
              style={{ animationDelay: `${i * 0.15}s` }} 
            />
          ))}
        </div>
        
        <div className="max-w-2xl mx-auto mb-8">
          <Alert className="border-white/30 bg-white/10 backdrop-blur-md">
            <AlertCircle className="h-4 w-4 text-white" />
            <AlertTitle className="text-white font-semibold">Votre niveau d'accès</AlertTitle>
            <AlertDescription className="text-white/95">
              {userAccessLevel}
              {!isAuthenticated && (
                <span className="ml-2">
                  - <Link to="/auth" className="underline text-gold hover:text-gold/80">Connectez-vous</Link> pour accéder à plus de contenu
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>

        {searchBar}
        
        <div className="w-48 h-2 bg-gradient-berber mx-auto rounded-full shadow-gold mt-6" />
      </div>
    </section>
  );
}
