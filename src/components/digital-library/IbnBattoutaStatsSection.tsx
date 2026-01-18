import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Newspaper, Image, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";

interface StatItem {
  icon: React.ElementType;
  value: string;
  label: string;
  labelAr?: string;
  href?: string;
}

const defaultStats: StatItem[] = [
  {
    icon: BookOpen,
    value: "+45K",
    label: "Livres numériques",
    labelAr: "كتب رقمية",
    href: "/digital-library/collections/books"
  },
  {
    icon: Newspaper,
    value: "+8K",
    label: "Revues et journaux",
    labelAr: "المجلات والجرائد",
    href: "/digital-library/collections/periodicals"
  },
  {
    icon: Image,
    value: "+15K",
    label: "Photographies",
    labelAr: "صور فوتوغرافية",
    href: "/digital-library/collections/photos"
  }
];

interface IbnBattoutaStatsSectionProps {
  stats?: StatItem[];
}

export function IbnBattoutaStatsSection({ stats = defaultStats }: IbnBattoutaStatsSectionProps) {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const visibleStats = stats.slice(currentIndex, currentIndex + 3);
  const canGoNext = currentIndex + 3 < stats.length;
  const canGoPrev = currentIndex > 0;

  return (
    <section 
      className="py-16 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(49 100% 96%) 0%, hsl(50 100% 92%) 50%, hsl(48 80% 88%) 100%)'
      }}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Gold Grid Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-lg border-2 border-gold-bn-primary flex items-center justify-center bg-white/50">
              <Grid3X3 className="h-7 w-7 text-gold-bn-primary" strokeWidth={1.5} />
            </div>
          </div>
          
          {/* Title */}
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-bn-blue-primary mb-3">
            Ibn Battouta en chiffres
          </h2>
          
          {/* Subtitle */}
          <p className="text-slate-text max-w-2xl mx-auto text-base">
            Découvrez les documents récemment ajoutés à nos collections, 
            soigneusement sélectionnés pour enrichir votre expérience.
          </p>
        </div>

        {/* Stats Cards with Navigation */}
        <div className="relative max-w-4xl mx-auto">
          {/* Left Arrow */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-slate-border shadow-sm hover:bg-slate-light z-10"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={!canGoPrev}
          >
            <ChevronLeft className="h-5 w-5 text-slate-text-dark" />
          </Button>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
            {visibleStats.map((stat, index) => (
              <Link 
                key={index} 
                to={stat.href || "#"}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gold-bn-primary/20">
                  {/* Icon Container */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gold-bn-surface border border-gold-bn-primary/30 flex items-center justify-center group-hover:bg-gold-bn-light transition-colors">
                      <stat.icon className="h-8 w-8 text-gold-bn-primary" strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  {/* Value */}
                  <div className="text-4xl font-bold text-bn-blue-primary mb-2 font-playfair">
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-slate-text text-sm">
                    {language === 'ar' && stat.labelAr ? stat.labelAr : stat.label}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-slate-border shadow-sm hover:bg-slate-light z-10"
            onClick={() => setCurrentIndex(Math.min(stats.length - 3, currentIndex + 1))}
            disabled={!canGoNext}
          >
            <ChevronRight className="h-5 w-5 text-slate-text-dark" />
          </Button>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-10">
          <Link to="/digital-library/collections">
            <Button 
              className="bg-gold-bn-primary hover:bg-gold-bn-primary-dark text-white px-8 py-2 rounded-md shadow-md hover:shadow-lg transition-all"
            >
              Voir tout
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
