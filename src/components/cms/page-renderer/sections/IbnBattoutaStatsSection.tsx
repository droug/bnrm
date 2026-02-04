import { useState } from "react";
import { BookOpen, Newspaper, Image, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface SectionProps {
  section: any;
  language: 'fr' | 'ar';
}

interface StatItem {
  icon: string;
  value: string;
  label: string;
  labelAr?: string;
  href?: string;
}

const iconMap: Record<string, any> = {
  BookOpen,
  Newspaper,
  Image,
};

const defaultStats: StatItem[] = [
  {
    icon: "BookOpen",
    value: "+12K",
    label: "Manuscrits",
    labelAr: "مخطوطات",
    href: "/digital-library/collections/manuscripts"
  },
  {
    icon: "Newspaper",
    value: "+60",
    label: "Revues",
    labelAr: "مجلات",
    href: "/digital-library/collections/periodicals"
  },
  {
    icon: "BookOpen",
    value: "+30",
    label: "Lithographies",
    labelAr: "مطبوعات حجرية",
    href: "/digital-library/collections/lithographies"
  },
  {
    icon: "BookOpen",
    value: "+400",
    label: "Livres",
    labelAr: "كتب",
    href: "/digital-library/collections/books"
  },
  {
    icon: "Newspaper",
    value: "+10",
    label: "Journaux",
    labelAr: "جرائد",
    href: "/digital-library/collections/newspapers"
  },
  {
    icon: "BookOpen",
    value: "+2K",
    label: "Collections spécialisées",
    labelAr: "مجموعات متخصصة",
    href: "/digital-library/collections/specialized"
  },
  {
    icon: "Image",
    value: "+100",
    label: "Audiovisuel",
    labelAr: "مواد سمعية بصرية",
    href: "/digital-library/collections/audiovisual"
  }
];

export function IbnBattoutaStatsSection({ section, language }: SectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const stats: StatItem[] = section.props?.stats || defaultStats;
  const title = language === 'ar' ? (section.title_ar || 'ابن بطوطة بالأرقام') : (section.title_fr || 'Ibn Battúta en chiffres');
  const subtitle = language === 'ar' 
    ? (section.content_ar || 'اكتشف الوثائق المضافة حديثًا إلى مجموعاتنا')
    : (section.content_fr || 'Découvrez les documents récemment ajoutés à nos collections, soigneusement sélectionnés pour enrichir votre expérience.');
  
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
              <Grid3X3 className="h-7 w-7 text-gold-bn-primary" strokeWidth={1.5} />
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-slate-dark mb-6">
            {title}
          </h2>
          
          <p className="font-body text-lg text-slate-text max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Stats Cards with Navigation */}
        <div className="relative max-w-5xl mx-auto flex items-center justify-center gap-4">
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

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
            {visibleStats.map((stat, index) => {
              const IconComponent = iconMap[stat.icon] || BookOpen;
              return (
                <Link 
                  key={index} 
                  to={stat.href || "#"}
                  className="group"
                >
                  <div className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-border">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gold-bn-primary" />
                    
                    <div className="p-8 text-center">
                      <div className="flex justify-center mb-5">
                        <div className="w-16 h-16 rounded-lg border-2 border-gold-bn-primary flex items-center justify-center">
                          <IconComponent className="h-8 w-8 text-gold-bn-primary" strokeWidth={1.5} />
                        </div>
                      </div>
                      
                      <div className="text-4xl md:text-5xl font-bold text-gold-bn-primary mb-3 font-heading">
                        {stat.value}
                      </div>
                      
                      <div className="text-slate-dark text-lg font-medium">
                        {language === 'ar' && stat.labelAr ? stat.labelAr : stat.label}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

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

        <div className="flex justify-center mt-12">
          <Link to="/digital-library/collections">
            <Button 
              className="bg-gold-bn-primary hover:bg-gold-bn-primary-dark text-white px-10 py-3 rounded-md shadow-md hover:shadow-lg transition-all font-semibold uppercase tracking-wide"
            >
              {language === 'ar' ? 'عرض الكل' : 'Voir tous'}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}