import { useState } from "react";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// MDI: table-box-multiple-outline (renamed for clarity)
const TableBoxMultipleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M15 19V21H9V19H15M21 3H3V11H5V5H19V11H21V3M21 13H3V21H5V15H7V21H9V15H15V21H17V15H19V21H21V13Z" />
  </svg>
);

interface SectionProps {
  section: any;
  language: 'fr' | 'ar';
}

interface ResourceItem {
  id: string;
  name: string;
  nameAr?: string;
  logo?: string;
  url: string;
  description?: string;
  descriptionAr?: string;
}

const defaultResources: ResourceItem[] = [
  {
    id: "1",
    name: "BRILL",
    nameAr: "بريل",
    logo: "https://brill.com/fileasset/brill-logo.svg",
    url: "https://brill.com",
    description: "Maison d'édition académique néerlandaise fondée en 1683, spécialisée en sciences humaines"
  },
  {
    id: "2",
    name: "CAIRN.INFO",
    nameAr: "كارن",
    logo: "https://www.cairn.info/static/images/logo-cairn-info.svg",
    url: "https://cairn.info",
    description: "Plateforme de référence pour les publications scientifiques francophones"
  },
  {
    id: "3",
    name: "EBSCO",
    nameAr: "إبسكو",
    url: "https://www.ebsco.com",
    description: "Fournisseur américain de bases de données, revues et livres numériques"
  },
  {
    id: "4",
    name: "Europeana",
    nameAr: "يوروبيانا",
    url: "https://www.europeana.eu",
    description: "Bibliothèque numérique européenne donnant accès à des millions d'œuvres culturelles"
  },
  {
    id: "5",
    name: "IFLA",
    nameAr: "الإفلا",
    url: "https://www.ifla.org",
    description: "Fédération internationale des associations de bibliothécaires"
  },
  {
    id: "6",
    name: "RFN",
    nameAr: "الشبكة الفرنكوفونية الرقمية",
    url: "https://www.rfnum.org",
    description: "Réseau Francophone Numérique pour le patrimoine documentaire francophone"
  }
];

export function ElectronicResourcesSection({ section, language }: SectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const resources: ResourceItem[] = section.props?.resources || defaultResources;
  const title = language === 'ar' 
    ? (section.title_ar || 'الموارد الإلكترونية') 
    : (section.title_fr || 'Ressources électroniques');
  
  const visibleResources = resources.slice(currentIndex, currentIndex + 3);
  const canGoNext = currentIndex + 3 < resources.length;
  const canGoPrev = currentIndex > 0;

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg border-2 border-gold-bn-primary flex items-center justify-center">
              <TableBoxMultipleIcon className="h-6 w-6 text-gold-bn-primary" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-semibold text-slate-dark">
            {title}
          </h2>
        </div>

        {/* Resources Carousel */}
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={!canGoPrev}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-slate-500 hover:text-gold-bn-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {visibleResources.map((resource) => (
                <Card key={resource.id} className="bg-white hover:shadow-lg transition-shadow group flex flex-col">
                  <CardContent className="p-6 text-center flex flex-col flex-1">
                    {/* Logo/Name - Fixed height container */}
                    <div className="h-16 flex items-center justify-center mb-4">
                      {resource.logo ? (
                        <img 
                          src={resource.logo} 
                          alt={resource.name}
                          className="max-h-12 max-w-full object-contain"
                          onError={(e) => {
                            // Fallback to text if logo fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`text-xl font-bold text-bn-blue-primary ${resource.logo ? 'hidden' : ''}`}>
                        {resource.name}
                      </span>
                    </div>
                    
                    {/* Description - Fixed height with line clamp */}
                    <p className="text-sm text-slate-text mb-4 flex-1 line-clamp-3 min-h-[3.75rem]">
                      {language === 'ar' && resource.descriptionAr 
                        ? resource.descriptionAr 
                        : resource.description}
                    </p>
                    
                    {/* Button - Always at bottom, aligned */}
                    <div className="mt-auto pt-2">
                      <a 
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-bn-blue-primary hover:text-bn-blue-deep transition-colors text-sm font-medium"
                      >
                        {language === 'ar' ? 'استكشف' : 'Explorer'}
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex(Math.min(resources.length - 3, currentIndex + 1))}
              disabled={!canGoNext}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-slate-500 hover:text-gold-bn-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(resources.length / 3) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * 3)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / 3) === i 
                    ? 'bg-gold-bn-primary' 
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}