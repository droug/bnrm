import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Scroll, Users } from "lucide-react";
import heroImage from "@/assets/hero-library.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-accent/70"></div>
      </div>

      {/* Moroccan pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-repeat opacity-30" 
             style={{ 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M30 30l15-15v30L30 30zm0 0l-15 15V15l15 15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
             }}>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto">
          {/* Main title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Bibliothèque Nationale
            <span className="block text-gold">du Royaume du Maroc</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Gardienne du patrimoine écrit marocain et porte d'accès au savoir universel
          </p>

          {/* Arabic subtitle */}
          <p className="text-lg text-white/80 mb-12 font-arabic" dir="rtl">
            المكتبة الوطنية للمملكة المغربية - حارسة التراث المكتوب المغربي
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                type="search"
                placeholder="Rechercher dans nos collections..."
                className="w-full h-14 pl-6 pr-16 text-lg bg-white/95 backdrop-blur border-0 shadow-moroccan focus:shadow-gold transition-all"
              />
              <Button 
                size="lg" 
                className="absolute right-2 top-2 h-10 bg-gradient-primary hover:bg-gradient-accent shadow-none"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-elegant px-8 py-6 text-lg font-medium"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Explorer le Catalogue
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur px-8 py-6 text-lg font-medium"
            >
              <Scroll className="h-5 w-5 mr-2" />
              Collections Numériques
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center animate-slide-in">
              <div className="text-3xl md:text-4xl font-bold text-gold mb-2">2M+</div>
              <div className="text-white/80">Documents</div>
            </div>
            <div className="text-center animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl md:text-4xl font-bold text-gold mb-2">50K+</div>
              <div className="text-white/80">Manuscrits</div>
            </div>
            <div className="text-center animate-slide-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-3xl md:text-4xl font-bold text-gold mb-2">1000+</div>
              <div className="text-white/80">Visiteurs/jour</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;