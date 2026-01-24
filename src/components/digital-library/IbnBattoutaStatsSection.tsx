import { useState } from "react";
import type { ElementType } from "react";
import { BookOpen, Newspaper, Image } from "lucide-react";
import { Icon } from "@iconify/react";
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
    <section className="py-20 relative overflow-hidden bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14">
          {/* Gold Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-lg border-2 border-gold-bn-primary flex items-center justify-center">
              <Icon icon="mdi:format-list-numbered" className="h-7 w-7 text-gold-bn-primary" />
            </div>
          </div>
          
          {/* Title - Dark Playfair Display */}
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-slate-dark mb-6">
            Ibn Battouta en chiffres
          </h2>
          
          {/* Subtitle */}
          <p className="font-body text-lg text-slate-text max-w-2xl mx-auto">
            Découvrez les documents récemment ajoutés à nos collections,
            soigneusement sélectionnés pour enrichir votre expérience.
          </p>
        </div>

        {/* Stats Cards with Navigation */}
        <div className="relative max-w-5xl mx-auto flex items-center justify-center gap-4">
          {/* Left Arrow - Simple filled triangle */}
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={!canGoPrev}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-slate-text hover:text-gold-bn-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Précédent"
          >
            <svg width="16" height="28" viewBox="0 0 16 28" fill="currentColor">
              <path d="M14 2L2 14L14 26" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Stats Cards */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
            {visibleStats.map((stat, index) => (
              <Link 
                key={index} 
                to={stat.href || "#"}
                className="group"
              >
                {/* Card - White with gold top border */}
                <div className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-border">
                  {/* Gold top border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gold-bn-primary" />
                  
                  {/* Content */}
                  <div className="p-8 text-center">
                    {/* Icon Container - Gold outlined box */}
                    <div className="flex justify-center mb-5">
                      <div className="w-16 h-16 rounded-lg border-2 border-gold-bn-primary flex items-center justify-center">
                        <stat.icon className="h-8 w-8 text-gold-bn-primary" strokeWidth={1.5} />
                      </div>
                    </div>
                    
                    {/* Value - Gold text */}
                    <div className="text-4xl md:text-5xl font-bold text-gold-bn-primary mb-3 font-heading">
                      {stat.value}
                    </div>
                    
                    {/* Label - Dark text */}
                    <div className="text-slate-dark text-lg font-medium">
                      {language === 'ar' && stat.labelAr ? stat.labelAr : stat.label}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow - Simple filled triangle */}
          <button
            onClick={() => setCurrentIndex(Math.min(stats.length - 3, currentIndex + 1))}
            disabled={!canGoNext}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-slate-text hover:text-gold-bn-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Suivant"
          >
            <svg width="16" height="28" viewBox="0 0 16 28" fill="currentColor">
              <path d="M2 2L14 14L2 26" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* CTA Button - Gold */}
        <div className="flex justify-center mt-12">
          <Link to="/digital-library/collections">
            <Button 
              className="bg-gold-bn-primary hover:bg-gold-bn-primary-dark text-white px-10 py-3 rounded-md shadow-md hover:shadow-lg transition-all font-semibold uppercase tracking-wide"
            >
              Voir tous
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
