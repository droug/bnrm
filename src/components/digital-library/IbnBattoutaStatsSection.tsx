import { useState } from "react";
import type { ElementType } from "react";
import { BookOpen, Newspaper, Image, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";

interface StatItem {
  icon: ElementType;
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
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const visibleStats = stats.slice(currentIndex, currentIndex + 3);
  const canGoNext = currentIndex + 3 < stats.length;
  const canGoPrev = currentIndex > 0;

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-br from-gold-bn-surface via-gold-bn-light to-gold-bn-light-alt">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Gold Grid Icon - outlined box */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-lg border border-gold-bn-primary flex items-center justify-center">
              <Grid3X3 className="h-6 w-6 text-gold-bn-primary" strokeWidth={1.5} />
            </div>
          </div>
          
          {/* Title - Dark blue Playfair */}
          <h2 className="heading-3 text-bn-blue-primary font-heading">
            Ibn Battouta en chiffres
          </h2>
          
          {/* Subtitle */}
          <p className="font-body text-regular text-muted-foreground max-w-2xl mx-auto mt-4">
            Découvrez les documents récemment ajoutés à nos collections,
            soigneusement sélectionnés pour enrichir votre expérience.
          </p>
        </div>

        {/* Stats Cards with Navigation */}
        <div className="relative max-w-5xl mx-auto flex items-center justify-center gap-2">
          {/* Left Arrow - Simple triangle */}
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={!canGoPrev}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-slate-text-dark hover:text-bn-blue-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Précédent"
          >
            <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
              <path d="M10 2L2 10L10 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Stats Cards */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">
            {visibleStats.map((stat, index) => (
              <Link 
                key={index} 
                to={stat.href || "#"}
                className="group"
              >
                {/* Card - Blue gradient background matching reference */}
                <div 
                  className="relative rounded-xl p-6 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, hsl(210 28% 35%) 0%, hsl(210 28% 28%) 50%, hsl(210 34% 22%) 100%)'
                  }}
                >
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon Container - Gold outlined box */}
                    <div className="flex justify-center mb-4">
                      <div className="w-14 h-14 rounded-lg border-2 border-gold-bn-primary flex items-center justify-center">
                        <stat.icon className="h-7 w-7 text-gold-bn-primary" strokeWidth={1.5} />
                      </div>
                    </div>
                    
                    {/* Value - Large white text */}
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-heading">
                      {stat.value}
                    </div>
                    
                    {/* Label - Smaller white text */}
                    <div className="text-white/90 text-sm font-medium">
                      {language === 'ar' && stat.labelAr ? stat.labelAr : stat.label}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow - Simple triangle */}
          <button
            onClick={() => setCurrentIndex(Math.min(stats.length - 3, currentIndex + 1))}
            disabled={!canGoNext}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-slate-text-dark hover:text-bn-blue-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Suivant"
          >
            <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
              <path d="M2 2L10 10L2 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* CTA Button - Gold */}
        <div className="flex justify-center mt-10">
          <Link to="/digital-library/collections">
            <Button 
              className="bg-gold-bn-primary hover:bg-gold-bn-primary-dark text-white px-8 py-2.5 rounded-md shadow-md hover:shadow-lg transition-all font-medium"
            >
              Voir tout
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
