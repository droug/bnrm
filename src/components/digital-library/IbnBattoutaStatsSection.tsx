import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";

interface StatItem {
  iconName: string;
  value: string;
  label: string;
  labelAr?: string;
  href?: string;
}

const defaultStats: StatItem[] = [
  {
    iconName: "mdi:book-open-page-variant-outline",
    value: "+45K",
    label: "Livres numériques",
    labelAr: "كتب رقمية",
    href: "/digital-library/collections/books"
  },
  {
    iconName: "mdi:newspaper-variant-outline",
    value: "+8K",
    label: "Revues et journaux",
    labelAr: "المجلات والجرائد",
    href: "/digital-library/collections/periodicals"
  },
  {
    iconName: "mdi:image-outline",
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
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-lg border-2 border-gold-bn-primary flex items-center justify-center">
              <Icon name="mdi:format-list-numbered" className="h-7 w-7 text-gold-bn-primary" />
            </div>
          </div>
          
          <h2 className="text-[48px] font-normal font-gilda text-slate-dark mb-6">
            Ibn Battouta en chiffres
          </h2>
          
          <p className="font-body text-lg text-slate-text max-w-2xl mx-auto">
            Découvrez les documents récemment ajoutés à nos collections,
            soigneusement sélectionnés pour enrichir votre expérience.
          </p>
        </div>

        {/* Stats Cards with Navigation */}
        <div className="relative max-w-5xl mx-auto flex items-center justify-center gap-8">
          {/* Left Arrow - Triangle */}
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={!canGoPrev}
            className="flex-shrink-0 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110"
            aria-label="Précédent"
          >
            <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
              <polygon 
                points="20,0 0,18 20,36" 
                className="fill-gold-bn-primary"
              />
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
                <div 
                  className="relative bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-[352px] h-[228px] border-t-[7px] border-t-gold-bn-primary"
                  style={{
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    borderBottomLeftRadius: '10px',
                    borderBottomRightRadius: '10px',
                  }}
                >
                  
                  <div className="p-8 text-center">
                    {/* Icon container */}
                    <div className="flex justify-center mb-5">
                      <div className="w-14 h-14 rounded-xl bg-gold-bn-primary/10 flex items-center justify-center">
                        <Icon name={stat.iconName} className="h-7 w-7 text-gold-bn-primary" />
                      </div>
                    </div>
                    
                    {/* Value */}
                    <div className="text-3xl md:text-4xl font-semibold text-slate-dark mb-2 font-heading">
                      {stat.value}
                    </div>
                    
                    {/* Label */}
                    <div className="text-slate-text text-base font-medium">
                      {language === 'ar' && stat.labelAr ? stat.labelAr : stat.label}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow - Triangle */}
          <button
            onClick={() => setCurrentIndex(Math.min(stats.length - 3, currentIndex + 1))}
            disabled={!canGoNext}
            className="flex-shrink-0 transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110"
            aria-label="Suivant"
          >
            <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
              <polygon 
                points="0,0 20,18 0,36" 
                className="fill-gold-bn-primary"
              />
            </svg>
          </button>
        </div>

        {/* CTA Button */}
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
