import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Book3D } from "@/components/Book3D";
import bibliothequeNumerique from "@/assets/bibliotheque-numerique.jpg";
import kitabBackground from "@/assets/kitab-book.jpg";
import manuscritsBackground from "@/assets/manuscrits-background.jpg";
import culturalActivitiesBackground from "@/assets/cultural-activities-background.jpg";
import cbmBackground from "@/assets/cbm-background.jpg";
import islamicPattern from "@/assets/islamic-calligraphy-pattern.jpg";

interface PlatformsSectionProps {
  language: string;
}

export const PlatformsSection = ({ language }: PlatformsSectionProps) => {
  const navigate = useNavigate();

  const mainPlatform = {
    title: language === 'ar' ? 'المكتبة الرقمية' : 'Bibliothèque Numérique',
    description: language === 'ar' 
      ? 'استكشف مجموعاتنا الرقمية الغنية من الكتب والمخطوطات والوثائق التاريخية المتاحة للاستشارة عبر الإنترنت'
      : 'Explorez nos riches collections numériques de livres, manuscrits et documents historiques disponibles en consultation en ligne',
    path: '/digital-library',
    image: bibliothequeNumerique,
    number: '01'
  };

  const secondaryPlatforms = [
    {
      title: language === 'ar' ? 'مخطوطات' : 'Manuscrits',
      path: '/plateforme-manuscrits',
      image: manuscritsBackground,
      number: '02'
    },
    {
      title: 'Kitab',
      path: '/kitab',
      image: kitabBackground,
      number: '03'
    },
    {
      title: language === 'ar' ? 'الأنشطة الثقافية' : 'Activités Culturelles',
      path: '/cultural-activities',
      image: culturalActivitiesBackground,
      number: '04'
    },
    {
      title: 'CBM',
      path: '/cbm',
      image: cbmBackground,
      number: '05'
    }
  ];

  return (
    <div className="relative py-20 my-12 overflow-hidden rounded-lg">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${islamicPattern})`,
        }}
      />
      
      {/* Dark overlay for content readability */}
      <div className="absolute inset-0 bg-[rgb(32,45,94)]/85" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">
            BNRM
          </p>
          <h2 className="text-4xl font-bold text-white mb-4">
            {language === 'ar' ? 'منصاتنا الرئيسية' : 'Nos Principales Plateformes'}
          </h2>
          <div className="w-24 h-1 bg-orange-500 mb-4"></div>
          <p className="text-white/80">
            {language === 'ar' 
              ? 'اكتشف منصاتنا الرقمية'
              : 'Découvrez nos plateformes numériques'
            }
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-start">
          {/* Main Platform - 3D Book */}
          <div className="relative">
            <Book3D
              coverImage={mainPlatform.image}
              title={mainPlatform.title}
              description={mainPlatform.description}
              number={mainPlatform.number}
              onClick={() => navigate(mainPlatform.path)}
            />
          </div>

          {/* Bookshelf - Secondary Platforms as Books */}
          <div className="relative h-[600px] flex flex-col justify-end">
            {/* Bookshelf */}
            <div className="flex gap-2 items-end pb-4 relative">
              {secondaryPlatforms.map((platform, index) => {
                const bookColors = [
                  'from-[#8B4513] to-[#654321]', // Marron cuir
                  'from-[#1e3a5f] to-[#0d1b2a]', // Bleu nuit
                  'from-[#2d5016] to-[#1a3009]', // Vert forêt
                  'from-[#7c2d12] to-[#5a1f0a]', // Bordeaux
                ];
                
                const heights = ['h-[550px]', 'h-[550px]', 'h-[550px]', 'h-[550px]'];
                
                return (
                  <div
                    key={platform.number}
                    className={`relative ${heights[index]} w-28 cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
                    onClick={() => navigate(platform.path)}
                    style={{ 
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                  >
                    {/* Book spine */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${bookColors[index]} rounded-sm shadow-lg`}>
                      {/* Book texture overlay */}
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)`
                      }} />
                      
                      {/* Pattern overlay */}
                      <img 
                        src={platform.image}
                        alt={platform.title}
                        className={`absolute inset-0 w-full h-full object-cover ${index === 1 ? 'opacity-100' : 'opacity-10 mix-blend-overlay'}`}
                      />
                      
                      {/* Book binding lines */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-black/20" />
                      <div className="absolute top-0 right-0 w-1 h-full bg-white/10" />
                      
                      {/* Number badge on spine - Octagon shape */}
                      <div className="absolute top-6 left-1/2 -translate-x-1/2">
                        <div className="relative w-14 h-14">
                          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-md">
                            <polygon points="50,5 82,18 95,50 82,82 50,95 18,82 5,50 18,18" className="fill-white/95" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-gray-900 font-bold text-xl">
                            {platform.number}
                          </div>
                        </div>
                      </div>
                      
                      {/* Book title - vertical at bottom */}
                      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center justify-center w-full px-2">
                        <div className="transform -rotate-90 origin-center whitespace-nowrap">
                          <span className="text-white font-bold text-base tracking-[0.25em] uppercase drop-shadow-md">
                            {platform.title}
                          </span>
                        </div>
                      </div>
                      
                      {/* Book edge highlight */}
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    
                    {/* Book top edge (visible when hovering) */}
                    <div className={`absolute -top-1 inset-x-0 h-2 bg-gradient-to-r ${bookColors[index]} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm`} />
                  </div>
                );
              })}
            </div>
            
            {/* Shelf */}
            <div className="w-full h-3 bg-gradient-to-b from-[#8B7355] to-[#6B5845] rounded-sm shadow-md relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
            <div className="w-full h-8 bg-gradient-to-b from-[#6B5845] to-[#4A3933] shadow-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
