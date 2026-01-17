import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Scroll, Users, Book, Star } from "lucide-react";
import heroImage from "@/assets/bnrm-hero.jpg";
import { useLanguage } from "@/hooks/useLanguage";

const Hero = () => {
  const { t, isRTL } = useLanguage();
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background avec image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          filter: 'brightness(0.95) saturate(1.1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent"></div>
      </div>

      {/* Moroccan geometric pattern overlay on right side */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 hidden lg:block">
        <div className="w-full h-full" 
             style={{ 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C4A052' stroke-width='1'%3E%3Cpath d='M40 0L80 40L40 80L0 40Z'/%3E%3Cpath d='M40 10L70 40L40 70L10 40Z'/%3E%3Cpath d='M40 20L60 40L40 60L20 40Z'/%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '80px 80px'
             }}>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto">
          {/* Logo and decorative elements */}
          <div className="mb-8 animate-fade-in">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold border border-white/20 hover:shadow-moroccan transition-all duration-500">
              <Book className="h-12 w-12 text-white" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-gold fill-gold animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>

          {/* Main title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight bg-gradient-to-r from-white to-white/90 bg-clip-text animate-fade-in">
            {t('hero.title')}
          </h1>
          
          {/* Decorative line */}
          <div className="w-32 h-1 bg-gradient-accent mx-auto mb-8 rounded-full animate-fade-in"></div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            {t('hero.subtitle')}
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                type="search"
                placeholder={t('header.search')}
                className={`w-full h-14 text-lg bg-white/95 backdrop-blur border-0 shadow-moroccan focus:shadow-gold transition-all ${isRTL ? 'pr-6 pl-16' : 'pl-6 pr-16'}`}
              />
              <Button 
                size="lg" 
                className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-2 h-10 bg-gradient-primary hover:bg-gradient-accent shadow-none`}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-fade-in">
            <Button 
              size="lg" 
              className="bg-white/95 backdrop-blur-sm text-primary hover:bg-white hover:shadow-gold px-10 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 rounded-xl border border-white/20 group"
            >
              <Search className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform`} />
              {t('hero.exploreBtn')}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/60 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white hover:shadow-elegant px-10 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 rounded-xl group"
            >
              <BookOpen className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform`} />
              {t('hero.digitaBtn')}
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